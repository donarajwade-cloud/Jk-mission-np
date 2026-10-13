import { Router, Request, Response } from 'express';
import { db } from '../db.ts';
import { authenticateToken, requireRole } from '../auth.ts';

const router = Router();

// Middleware: all admin routes require admin role
router.use(authenticateToken, requireRole('admin'));

// GET /api/admin/overview (All stats computed from real database records)
router.get('/overview', (req: Request, res: Response): void => {
  const data = db.data;

  const totalCustomers = data.users.filter(u => u.role === 'customer').length;
  const totalShopkeepers = data.users.filter(u => u.role === 'shopkeeper').length;
  const approvedShopkeepers = data.shopkeepers.filter(s => s.status === 'approved').length;
  const totalShops = data.shops.length;
  const totalProducts = data.products.length;
  const approvedProducts = data.products.filter(p => p.status === 'approved').length;

  const completedOrders = data.orders.filter(o => o.orderStatus === 'completed');
  const totalSalesCount = completedOrders.length;
  const totalSalesValue = completedOrders.reduce((sum, o) => sum + o.totalAmountNpr, 0);

  // Real financial ledger sums
  const totalCashbackAwarded = data.cashbackLedger
    .filter(e => e.type === 'credit')
    .reduce((sum, e) => sum + e.amountNpr, 0);

  const totalReferralCommissionAwarded = data.referralLedger
    .filter(e => e.type === 'credit')
    .reduce((sum, e) => sum + e.amountNpr, 0);

  const totalShopkeeperCommissionAwarded = data.shopkeeperLedger
    .filter(e => e.type === 'credit')
    .reduce((sum, e) => sum + e.amountNpr, 0);

  // Company revenue / share from completed sales
  let totalCompanyShareNpr = 0;
  let totalProductCostNpr = 0;

  for (const o of completedOrders) {
    for (const item of o.items) {
      if (item.commissionSnapshot) {
        totalCompanyShareNpr += item.commissionSnapshot.companyShareNpr;
        totalProductCostNpr += item.unitCostNpr * item.quantity;
      }
    }
  }

  const pendingWithdrawals = data.withdrawals.filter(w => w.status === 'pending');
  const pendingWithdrawalAmount = pendingWithdrawals.reduce((sum, w) => sum + w.amountNpr, 0);
  const paidWithdrawals = data.withdrawals.filter(w => w.status === 'paid');
  const paidWithdrawalAmount = paidWithdrawals.reduce((sum, w) => sum + w.amountNpr, 0);

  res.json({
    success: true,
    stats: {
      totalCustomers,
      totalShopkeepers,
      approvedShopkeepers,
      totalShops,
      totalProducts,
      approvedProducts,
      totalSalesCount,
      totalSalesValue,
      totalCashbackAwarded,
      totalReferralCommissionAwarded,
      totalShopkeeperCommissionAwarded,
      totalCompanyShareNpr,
      totalProductCostNpr,
      netProfitEstimatedNpr: Math.max(0, totalSalesValue - totalProductCostNpr - totalCashbackAwarded - totalReferralCommissionAwarded - totalShopkeeperCommissionAwarded),
      pendingWithdrawalCount: pendingWithdrawals.length,
      pendingWithdrawalAmount,
      paidWithdrawalAmount,
      completedOrdersCount: completedOrders.length,
      cancelledOrdersCount: data.orders.filter(o => o.orderStatus === 'cancelled').length
    }
  });
});

// GET /api/admin/customers
router.get('/customers', (req: Request, res: Response): void => {
  const { search } = req.query;
  const customers = db.data.users.filter(u => u.role === 'customer');

  let list = customers.map(u => {
    const prof = db.data.customers.find(c => c.userId === u.id);
    const wallet = db.data.customerWallets[u.id] || {
      cashbackAvailableNpr: 0,
      cashbackTotalEarnedNpr: 0,
      incomeAvailableNpr: 0,
      incomeTotalEarnedNpr: 0,
      incomeTotalWithdrawnNpr: 0
    };
    const orderCount = db.data.orders.filter(o => o.customerId === u.id).length;
    const directReferralsCount = db.data.users.filter(other => other.sponsorReferralId === u.mobile).length;

    return {
      ...u,
      profile: prof,
      wallet,
      orderCount,
      directReferralsCount
    };
  });

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    list = list.filter(c => c.name.toLowerCase().includes(q) || c.mobile.includes(q));
  }

  res.json({ success: true, count: list.length, customers: list });
});

// GET /api/admin/customers/:id/referral-tree (3-level inspector)
router.get('/customers/:id/referral-tree', (req: Request, res: Response): void => {
  const user = db.data.users.find(u => u.id === req.params.id);
  if (!user) {
    res.status(404).json({ success: false, error: 'Customer not found' });
    return;
  }

  // Find Level 1 downline (direct referrals where sponsorReferralId === user.mobile)
  const l1Users = db.data.users.filter(u => u.sponsorReferralId === user.mobile);

  // Find Level 2 downline (where sponsorReferralId is in l1's mobiles)
  const l1Mobiles = l1Users.map(u => u.mobile);
  const l2Users = db.data.users.filter(u => u.sponsorReferralId && l1Mobiles.includes(u.sponsorReferralId));

  // Find Level 3 downline (where sponsorReferralId is in l2's mobiles)
  const l2Mobiles = l2Users.map(u => u.mobile);
  const l3Users = db.data.users.filter(u => u.sponsorReferralId && l2Mobiles.includes(u.sponsorReferralId));

  // Calculate sales and commissions generated by each level
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

// PUT /api/admin/customers/:id/status (Activate or suspend)
router.put('/customers/:id/status', (req: Request, res: Response): void => {
  const { status, suspendedReason } = req.body;
  if (!['active', 'suspended'].includes(status)) {
    res.status(400).json({ success: false, error: 'Status must be active or suspended' });
    return;
  }

  const result = db.transaction((data) => {
    const target = data.users.find(u => u.id === req.params.id);
    if (!target) return { success: false, error: 'User not found' };

    target.status = status;
    target.suspendedReason = status === 'suspended' ? (suspendedReason || 'Administrative suspension') : undefined;

    data.auditLogs.push({
      id: `audit_usrstat_${target.id}_${Date.now()}`,
      action: status === 'active' ? 'USER_ACTIVATED' : 'USER_SUSPENDED',
      actorUserId: req.user!.userId,
      actorRole: 'admin',
      details: `User ${target.name} (${target.mobile}) status changed to ${status}. Reason: ${target.suspendedReason || 'N/A'}`,
      entityType: 'user',
      entityId: target.id,
      timestamp: new Date().toISOString()
    });

    return { success: true, user: target };
  });

  if (!result.success) {
    res.status(400).json(result);
  } else {
    res.json(result);
  }
});

// GET /api/admin/shopkeepers
router.get('/shopkeepers', (req: Request, res: Response): void => {
  const shopkeepers = db.data.shopkeepers.map(s => {
    const user = db.data.users.find(u => u.id === s.userId);
    const shop = db.data.shops.find(sh => sh.shopkeeperUserId === s.userId);
    const wallet = db.data.shopkeeperWallets[s.userId] || {
      availableCommissionNpr: 0,
      totalEarnedNpr: 0,
      totalWithdrawnNpr: 0
    };
    const productsCount = db.data.products.filter(p => p.shopkeeperUserId === s.userId).length;

    return {
      ...s,
      user,
      shop,
      wallet,
      productsCount
    };
  });

  res.json({ success: true, shopkeepers });
});

// PUT /api/admin/shopkeepers/:id/review (Approve or reject shopkeeper)
router.put('/shopkeepers/:id/review', (req: Request, res: Response): void => {
  const { status, rejectionReason } = req.body;
  if (!['approved', 'rejected'].includes(status)) {
    res.status(400).json({ success: false, error: 'Status must be approved or rejected' });
    return;
  }

  const result = db.transaction((data) => {
    const sk = data.shopkeepers.find(s => s.id === req.params.id || s.userId === req.params.id);
    if (!sk) return { success: false, error: 'Shopkeeper application not found' };

    sk.status = status;
    if (status === 'rejected') {
      sk.rejectionReason = rejectionReason || 'Application details could not be verified';
    }

    const user = data.users.find(u => u.id === sk.userId);
    if (user) {
      user.status = status === 'approved' ? 'active' : 'suspended';
    }

    const shop = data.shops.find(sh => sh.shopkeeperUserId === sk.userId);
    if (shop) {
      shop.isOpen = status === 'approved';
    }

    const now = new Date().toISOString();
    data.notifications.push({
      id: `notif_skrev_${Date.now()}`,
      recipientUserId: sk.userId,
      title: status === 'approved' ? 'Shopkeeper Application Approved!' : 'Shopkeeper Application Update',
      message: status === 'approved'
        ? `Your shop "${sk.shopName}" is now officially approved. You can submit products for listing!`
        : `Your shop application was rejected. Reason: ${sk.rejectionReason}`,
      type: 'system',
      read: false,
      createdAt: now
    });

    data.auditLogs.push({
      id: `audit_sk_${sk.id}`,
      action: status === 'approved' ? 'SHOPKEEPER_APPROVED' : 'SHOPKEEPER_REJECTED',
      actorUserId: req.user!.userId,
      actorRole: 'admin',
      details: `Shopkeeper ${sk.fullName} (${sk.shopName}) marked ${status}`,
      entityType: 'shopkeeper',
      entityId: sk.id,
      timestamp: now
    });

    return { success: true, shopkeeper: sk };
  });

  if (!result.success) {
    res.status(400).json(result);
  } else {
    res.json(result);
  }
});

// GET /api/admin/financial-ledgers
router.get('/financial-ledgers', (req: Request, res: Response): void => {
  const data = db.data;
  res.json({
    success: true,
    cashbackLedger: [...data.cashbackLedger].reverse(),
    referralLedger: [...data.referralLedger].reverse(),
    shopkeeperLedger: [...data.shopkeeperLedger].reverse()
  });
});

// GET /api/admin/settings
router.get('/settings', (req: Request, res: Response): void => {
  res.json({ success: true, settings: db.data.systemSettings });
});

// PUT /api/admin/settings
router.put('/settings', (req: Request, res: Response): void => {
  const newSettings = req.body;
  db.transaction((data) => {
    data.systemSettings = { ...data.systemSettings, ...newSettings };
    data.auditLogs.push({
      id: `audit_set_${Date.now()}`,
      action: 'SETTINGS_UPDATED',
      actorUserId: req.user!.userId,
      actorRole: 'admin',
      details: 'System settings updated by administrator',
      entityType: 'settings',
      entityId: 'global',
      timestamp: new Date().toISOString()
    });
  });

  res.json({ success: true, settings: db.data.systemSettings });
});

// GET /api/admin/audit-logs
router.get('/audit-logs', (req: Request, res: Response): void => {
  const logs = [...db.data.auditLogs].reverse();
  res.json({ success: true, logs });
});

export default router;
