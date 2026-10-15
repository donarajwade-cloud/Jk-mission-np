import { Router, Request, Response } from 'express';
import { db } from '../db.ts';
import { authenticateToken, requireRole, cleanMobileDigits, matchesMobileOrReferral } from '../auth.ts';
import { WithdrawalRequest } from '../../src/types/index.ts';

const router = Router();

// Customer: Get Wallets & Ledgers
router.get('/customer', authenticateToken, (req: Request, res: Response): void => {
  const userId = req.user!.userId;
  const wallet = db.data.customerWallets[userId] || {
    userId,
    cashbackAvailableNpr: 0,
    cashbackPendingNpr: 0,
    cashbackTotalEarnedNpr: 0,
    incomeAvailableNpr: 0,
    incomePendingNpr: 0,
    incomeTotalEarnedNpr: 0,
    incomeTotalWithdrawnNpr: 0,
    updatedAt: new Date().toISOString()
  };

  const cashbackHistory = db.data.cashbackLedger.filter(c => c.customerId === userId);
  const referralIncomeHistory = db.data.referralLedger.filter(r => r.beneficiaryCustomerId === userId);
  const withdrawals = db.data.withdrawals.filter(w => w.userId === userId);

  res.json({
    success: true,
    wallet,
    cashbackHistory,
    referralIncomeHistory,
    withdrawals
  });
});

// Customer: Get 3-Level Referral Tree
router.get('/customer/referral-tree', authenticateToken, (req: Request, res: Response): void => {
  const targetUserId = (req.query.userId as string) || req.user!.userId;
  const user = db.data.users.find(u => u.id === targetUserId || matchesMobileOrReferral(u.mobile, u.referralId, targetUserId));
  if (!user) {
    res.status(404).json({ success: false, error: 'User not found' });
    return;
  }

  // Find Level 1 downline (direct referrals whose sponsorReferralId matches user's mobile/referralId)
  const l1Users = db.data.users.filter(u =>
    u.id !== user.id &&
    u.sponsorReferralId &&
    matchesMobileOrReferral(user.mobile, user.referralId, u.sponsorReferralId)
  );

  // Find Level 2 downline (whose sponsorReferralId matches any L1's mobile/referralId)
  const l2Users = db.data.users.filter(u =>
    u.id !== user.id &&
    !l1Users.some(l1 => l1.id === u.id) &&
    u.sponsorReferralId &&
    l1Users.some(l1 => matchesMobileOrReferral(l1.mobile, l1.referralId, u.sponsorReferralId))
  );

  // Find Level 3 downline (whose sponsorReferralId matches any L2's mobile/referralId)
  const l3Users = db.data.users.filter(u =>
    u.id !== user.id &&
    !l1Users.some(l1 => l1.id === u.id) &&
    !l2Users.some(l2 => l2.id === u.id) &&
    u.sponsorReferralId &&
    l2Users.some(l2 => matchesMobileOrReferral(l2.mobile, l2.referralId, u.sponsorReferralId))
  );

  const calcLevelStats = (users: typeof l1Users, level: 1 | 2 | 3) => {
    const userIds = users.map(u => u.id);
    const completedOrders = db.data.orders.filter(o => userIds.includes(o.customerId) && o.orderStatus === 'completed');
    const salesVolume = completedOrders.reduce((acc, o) => acc + o.totalAmountNpr, 0);
    const commissionsEarned = db.data.referralLedger
      .filter(r => r.beneficiaryCustomerId === user.id && r.referralLevel === level && r.type === 'credit')
      .reduce((acc, r) => acc + r.amountNpr, 0);

    return {
      membersCount: users.length,
      salesCount: completedOrders.length,
      salesVolumeNpr: salesVolume,
      commissionsEarnedNpr: commissionsEarned,
      members: users.map(u => ({
        id: u.id,
        name: u.name,
        mobile: u.mobile,
        createdAt: u.createdAt,
        status: u.status
      }))
    };
  };

  const level1 = calcLevelStats(l1Users, 1);
  const level2 = calcLevelStats(l2Users, 2);
  const level3 = calcLevelStats(l3Users, 3);

  res.json({
    success: true,
    customer: {
      id: user.id,
      name: user.name,
      mobile: user.mobile,
      referralId: user.referralId,
      sponsorReferralId: user.sponsorReferralId
    },
    tree: {
      level1,
      level2,
      level3,
      totalNetworkMembers: l1Users.length + l2Users.length + l3Users.length,
      totalNetworkCommissionNpr: level1.commissionsEarnedNpr + level2.commissionsEarnedNpr + level3.commissionsEarnedNpr
    }
  });
});

// Shopkeeper: Get Commission Wallet & Ledger
router.get('/shopkeeper', authenticateToken, requireRole('shopkeeper'), (req: Request, res: Response): void => {
  const userId = req.user!.userId;
  const wallet = db.data.shopkeeperWallets[userId] || {
    userId,
    availableCommissionNpr: 0,
    pendingCommissionNpr: 0,
    totalEarnedNpr: 0,
    totalWithdrawnNpr: 0,
    updatedAt: new Date().toISOString()
  };

  const commissions = db.data.shopkeeperLedger.filter(s => s.shopkeeperUserId === userId);
  const withdrawals = db.data.withdrawals.filter(w => w.userId === userId);

  res.json({
    success: true,
    wallet,
    commissions,
    withdrawals
  });
});

// Request Withdrawal (Customer or Shopkeeper)
router.post('/withdraw', authenticateToken, (req: Request, res: Response): void => {
  const { amountNpr, paymentMethod, accountDetails } = req.body;
  const userId = req.user!.userId;
  const role = req.user!.role;
  const settings = db.data.systemSettings;

  const amount = Number(amountNpr);
  if (isNaN(amount) || amount <= 0) {
    res.status(400).json({ success: false, error: 'Invalid withdrawal amount' });
    return;
  }

  if (amount < settings.minWithdrawalNpr) {
    res.status(400).json({ success: false, error: `Minimum withdrawal amount is NPR ${settings.minWithdrawalNpr}` });
    return;
  }

  if (amount > settings.maxWithdrawalNpr) {
    res.status(400).json({ success: false, error: `Maximum withdrawal limit is NPR ${settings.maxWithdrawalNpr}` });
    return;
  }

  if (!accountDetails || !accountDetails.accountNumberOrId || !accountDetails.accountHolderName) {
    res.status(400).json({ success: false, error: 'Complete recipient account details are required' });
    return;
  }

  const result = db.transaction((data) => {
    let available = 0;
    if (role === 'customer') {
      const wallet = data.customerWallets[userId];
      if (!wallet) return { success: false, error: 'Customer wallet not found' };
      // Withdrawals come from Referral Income Wallet (Cashback is used for shopping discount or per policy)
      available = wallet.incomeAvailableNpr;
      if (amount > available) {
        return { success: false, error: `Insufficient income balance. Available: NPR ${available}, Requested: NPR ${amount}` };
      }
      wallet.incomeAvailableNpr -= amount;
      wallet.incomePendingNpr += amount;
      wallet.updatedAt = new Date().toISOString();
    } else if (role === 'shopkeeper') {
      const wallet = data.shopkeeperWallets[userId];
      if (!wallet) return { success: false, error: 'Shopkeeper wallet not found' };
      available = wallet.availableCommissionNpr;
      if (amount > available) {
        return { success: false, error: `Insufficient commission balance. Available: NPR ${available}, Requested: NPR ${amount}` };
      }
      wallet.availableCommissionNpr -= amount;
      wallet.pendingCommissionNpr += amount;
      wallet.updatedAt = new Date().toISOString();
    } else {
      return { success: false, error: 'Admins cannot request user withdrawals' };
    }

    const withdrawalId = `wdr_${Date.now()}`;
    const now = new Date().toISOString();

    const request: WithdrawalRequest = {
      id: withdrawalId,
      userId,
      userRole: role as 'customer' | 'shopkeeper',
      userName: req.user!.name,
      userMobile: req.user!.mobile,
      amountNpr: amount,
      paymentMethod,
      accountDetails,
      status: 'pending',
      requestedAt: now
    };

    data.withdrawals.push(request);

    // Notify Admin
    data.notifications.push({
      id: `notif_wdr_${Date.now()}`,
      recipientUserId: 'user_admin_1',
      title: 'New Withdrawal Request',
      message: `${req.user!.name} requested a withdrawal of NPR ${amount} via ${paymentMethod.toUpperCase()}`,
      type: 'withdrawal',
      read: false,
      createdAt: now
    });

    data.auditLogs.push({
      id: `audit_wdr_${withdrawalId}`,
      action: 'WITHDRAWAL_REQUESTED',
      actorUserId: userId,
      actorRole: role,
      details: `Withdrawal of NPR ${amount} requested via ${paymentMethod}`,
      entityType: 'withdrawal',
      entityId: withdrawalId,
      timestamp: now
    });

    return { success: true, withdrawal: request };
  });

  if (!result.success) {
    res.status(400).json(result);
  } else {
    res.json(result);
  }
});

// Admin: List All Withdrawals
router.get('/admin/withdrawals', authenticateToken, requireRole('admin'), (req: Request, res: Response): void => {
  const { status } = req.query;
  let list = [...db.data.withdrawals];
  if (status && typeof status === 'string' && status !== 'all') {
    list = list.filter(w => w.status === status);
  }
  list.sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
  res.json({ success: true, withdrawals: list });
});

// Admin: Approve Withdrawal Request
router.put('/admin/withdrawals/:id/approve', authenticateToken, requireRole('admin'), (req: Request, res: Response): void => {
  const { adminNotes } = req.body;
  const result = db.transaction((data) => {
    const w = data.withdrawals.find(item => item.id === req.params.id);
    if (!w) return { success: false, error: 'Withdrawal request not found' };
    if (w.status !== 'pending') return { success: false, error: `Cannot approve request with status: ${w.status}` };

    w.status = 'approved';
    w.adminNotes = adminNotes || 'Approved for manual disbursement';
    w.processedAt = new Date().toISOString();

    data.notifications.push({
      id: `notif_appwdr_${Date.now()}`,
      recipientUserId: w.userId,
      title: 'Withdrawal Approved',
      message: `Your withdrawal of NPR ${w.amountNpr} has been approved and is queued for manual bank/wallet transfer.`,
      type: 'withdrawal',
      read: false,
      createdAt: new Date().toISOString()
    });

    data.auditLogs.push({
      id: `audit_appwdr_${w.id}`,
      action: 'WITHDRAWAL_APPROVED',
      actorUserId: req.user!.userId,
      actorRole: 'admin',
      details: `Withdrawal #${w.id} of NPR ${w.amountNpr} approved for ${w.userName}`,
      entityType: 'withdrawal',
      entityId: w.id,
      timestamp: new Date().toISOString()
    });

    return { success: true, withdrawal: w };
  });

  if (!result.success) {
    res.status(400).json(result);
  } else {
    res.json(result);
  }
});

// Admin: Reject Withdrawal Request (Refunds balance back to user)
router.put('/admin/withdrawals/:id/reject', authenticateToken, requireRole('admin'), (req: Request, res: Response): void => {
  const { reason } = req.body;
  const result = db.transaction((data) => {
    const w = data.withdrawals.find(item => item.id === req.params.id);
    if (!w) return { success: false, error: 'Withdrawal request not found' };
    if (w.status === 'paid' || w.status === 'rejected') {
      return { success: false, error: `Cannot reject request in status: ${w.status}` };
    }

    w.status = 'rejected';
    w.adminNotes = reason || 'Rejected due to incomplete or incorrect account details';
    w.processedAt = new Date().toISOString();

    // Refund funds back to user's wallet
    if (w.userRole === 'customer') {
      const wallet = data.customerWallets[w.userId];
      if (wallet) {
        wallet.incomePendingNpr = Math.max(0, wallet.incomePendingNpr - w.amountNpr);
        wallet.incomeAvailableNpr += w.amountNpr;
        wallet.updatedAt = new Date().toISOString();
      }
    } else {
      const wallet = data.shopkeeperWallets[w.userId];
      if (wallet) {
        wallet.pendingCommissionNpr = Math.max(0, wallet.pendingCommissionNpr - w.amountNpr);
        wallet.availableCommissionNpr += w.amountNpr;
        wallet.updatedAt = new Date().toISOString();
      }
    }

    data.notifications.push({
      id: `notif_rejwdr_${Date.now()}`,
      recipientUserId: w.userId,
      title: 'Withdrawal Request Rejected',
      message: `Your withdrawal of NPR ${w.amountNpr} was rejected. Funds returned to your available balance. Reason: ${w.adminNotes}`,
      type: 'withdrawal',
      read: false,
      createdAt: new Date().toISOString()
    });

    data.auditLogs.push({
      id: `audit_rejwdr_${w.id}`,
      action: 'WITHDRAWAL_REJECTED',
      actorUserId: req.user!.userId,
      actorRole: 'admin',
      details: `Withdrawal #${w.id} rejected. Reason: ${reason}`,
      entityType: 'withdrawal',
      entityId: w.id,
      timestamp: new Date().toISOString()
    });

    return { success: true, withdrawal: w };
  });

  if (!result.success) {
    res.status(400).json(result);
  } else {
    res.json(result);
  }
});

// Admin: Mark as Paid (Enter manual payment reference & proof)
router.put('/admin/withdrawals/:id/record-payment', authenticateToken, requireRole('admin'), (req: Request, res: Response): void => {
  const { paymentReferenceNumber, adminNotes } = req.body;

  if (!paymentReferenceNumber || !paymentReferenceNumber.trim()) {
    res.status(400).json({ success: false, error: 'Payment reference number or transaction ID is required' });
    return;
  }

  const result = db.transaction((data) => {
    const w = data.withdrawals.find(item => item.id === req.params.id);
    if (!w) return { success: false, error: 'Withdrawal request not found' };
    if (w.status === 'paid') return { success: false, error: 'This withdrawal has already been marked as paid' };
    if (w.status === 'rejected') return { success: false, error: 'Cannot pay a rejected withdrawal' };

    const now = new Date().toISOString();
    w.status = 'paid';
    w.paymentReferenceNumber = paymentReferenceNumber.trim();
    if (adminNotes) w.adminNotes = adminNotes;
    w.completedAt = now;

    // Deduct pending balance and increment total withdrawn
    if (w.userRole === 'customer') {
      const wallet = data.customerWallets[w.userId];
      if (wallet) {
        wallet.incomePendingNpr = Math.max(0, wallet.incomePendingNpr - w.amountNpr);
        wallet.incomeTotalWithdrawnNpr += w.amountNpr;
        wallet.updatedAt = now;
      }
    } else {
      const wallet = data.shopkeeperWallets[w.userId];
      if (wallet) {
        wallet.pendingCommissionNpr = Math.max(0, wallet.pendingCommissionNpr - w.amountNpr);
        wallet.totalWithdrawnNpr += w.amountNpr;
        wallet.updatedAt = now;
      }
    }

    data.notifications.push({
      id: `notif_paidwdr_${Date.now()}`,
      recipientUserId: w.userId,
      title: 'Payment Completed!',
      message: `Your withdrawal of NPR ${w.amountNpr} has been paid via ${w.paymentMethod.toUpperCase()}. Reference: ${w.paymentReferenceNumber}.`,
      type: 'withdrawal',
      read: false,
      createdAt: now
    });

    data.auditLogs.push({
      id: `audit_paidwdr_${w.id}`,
      action: 'WITHDRAWAL_PAID_MANUAL_PROOF',
      actorUserId: req.user!.userId,
      actorRole: 'admin',
      details: `Withdrawal #${w.id} marked paid. Reference: ${paymentReferenceNumber}, Method: ${w.paymentMethod}`,
      entityType: 'withdrawal',
      entityId: w.id,
      timestamp: now
    });

    return { success: true, withdrawal: w };
  });

  if (!result.success) {
    res.status(400).json(result);
  } else {
    res.json(result);
  }
});

// Admin: Settlement Report (15-Day Cycle)
router.get('/admin/settlement-report', authenticateToken, requireRole('admin'), (req: Request, res: Response): void => {
  const withdrawals = db.data.withdrawals;
  const periodDays = db.data.systemSettings.settlementPeriodDays || 15;

  const totalRequested = withdrawals.reduce((acc, w) => acc + w.amountNpr, 0);
  const pendingRequests = withdrawals.filter(w => w.status === 'pending');
  const approvedRequests = withdrawals.filter(w => w.status === 'approved');
  const paidRequests = withdrawals.filter(w => w.status === 'paid');
  const rejectedRequests = withdrawals.filter(w => w.status === 'rejected');

  const totalPendingAmount = pendingRequests.reduce((acc, w) => acc + w.amountNpr, 0);
  const totalApprovedAmount = approvedRequests.reduce((acc, w) => acc + w.amountNpr, 0);
  const totalPaidAmount = paidRequests.reduce((acc, w) => acc + w.amountNpr, 0);

  res.json({
    success: true,
    settlementCycleDays: periodDays,
    summary: {
      totalRequested,
      totalPendingAmount,
      totalApprovedAmount,
      totalPaidAmount,
      counts: {
        total: withdrawals.length,
        pending: pendingRequests.length,
        approved: approvedRequests.length,
        paid: paidRequests.length,
        rejected: rejectedRequests.length
      }
    },
    recentWithdrawals: withdrawals.slice(-20)
  });
});

export default router;
