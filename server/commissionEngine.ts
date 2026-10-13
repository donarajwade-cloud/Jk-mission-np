import { db } from './db.ts';
import {
  Product,
  ProductCommissionSettings,
  Order,
  CashbackLedgerEntry,
  ReferralCommissionLedgerEntry,
  ShopkeeperCommissionLedgerEntry
} from '../src/types/index.ts';
import { getUplineChain } from './auth.ts';

export interface CommissionCalculationPreview {
  sellingPriceNpr: number;
  costPriceNpr: number;
  grossMarginNpr: number;
  cashbackNpr: number;
  referralPoolNpr: number;
  level1Npr: number;
  level2Npr: number;
  level3Npr: number;
  unallocatedReferralNpr: number;
  shopkeeperCommissionNpr: number;
  permittedExpensesNpr: number;
  companyShareNpr: number;
  totalDistributedNpr: number;
  netCompanyProfitNpr: number;
  isValid: boolean;
  errorMessage?: string;
}

/**
 * Calculates and validates product financial distribution for a given product and commission settings.
 */
export function calculateProductDistribution(
  sellingPrice: number,
  costPrice: number,
  settings: ProductCommissionSettings
): CommissionCalculationPreview {
  const grossMargin = sellingPrice - costPrice;

  // 1. Customer Cashback
  let cashbackNpr = 0;
  if (settings.customerCashbackType === 'percentage') {
    cashbackNpr = Math.round((sellingPrice * settings.customerCashbackValue) / 100);
  } else {
    cashbackNpr = Math.round(settings.customerCashbackValue);
  }

  // 2. Referral Pool
  let referralPoolNpr = 0;
  if (settings.referralPoolType === 'percentage') {
    // Percentage applies to gross margin (not full price)
    referralPoolNpr = Math.round((grossMargin * settings.referralPoolValue) / 100);
  } else {
    referralPoolNpr = Math.round(settings.referralPoolValue);
  }

  // Referral level shares from referral pool:
  const level1Npr = Math.round((referralPoolNpr * settings.level1Percentage) / 100);
  const level2Npr = Math.round((referralPoolNpr * settings.level2Percentage) / 100);
  const level3Npr = Math.round((referralPoolNpr * settings.level3Percentage) / 100);
  const totalReferralLevels = level1Npr + level2Npr + level3Npr;
  const unallocatedReferralNpr = Math.max(0, referralPoolNpr - totalReferralLevels);

  // 3. Shopkeeper Commission
  let shopkeeperCommissionNpr = 0;
  if (settings.shopkeeperCommissionType === 'percentage') {
    shopkeeperCommissionNpr = Math.round((sellingPrice * settings.shopkeeperCommissionValue) / 100);
  } else {
    shopkeeperCommissionNpr = Math.round(settings.shopkeeperCommissionValue);
  }

  // 4. Expenses and Company Share
  const permittedExpensesNpr = Math.round(settings.permittedExpensesNpr || 0);
  const companyShareNpr = Math.round(settings.companyShareNpr || 0);

  // Total obligations from selling price beyond cost:
  const totalDistributedNpr =
    cashbackNpr +
    referralPoolNpr +
    shopkeeperCommissionNpr +
    permittedExpensesNpr +
    companyShareNpr;

  const netCompanyProfitNpr = grossMargin - (totalDistributedNpr - companyShareNpr);

  let isValid = true;
  let errorMessage: string | undefined;

  if (grossMargin < 0) {
    isValid = false;
    errorMessage = `Negative margin: Selling price (NPR ${sellingPrice}) is less than cost price (NPR ${costPrice}).`;
  } else if (totalDistributedNpr > grossMargin) {
    isValid = false;
    errorMessage = `Over-allocated distribution: Promised total allocation (NPR ${totalDistributedNpr}) exceeds available gross margin (NPR ${grossMargin}). Deficit: NPR ${totalDistributedNpr - grossMargin}.`;
  } else if (settings.level1Percentage + settings.level2Percentage + settings.level3Percentage > 100) {
    isValid = false;
    errorMessage = `Referral level percentages total ${settings.level1Percentage + settings.level2Percentage + settings.level3Percentage}%, which exceeds 100% of referral pool.`;
  }

  return {
    sellingPriceNpr: sellingPrice,
    costPriceNpr: costPrice,
    grossMarginNpr: grossMargin,
    cashbackNpr,
    referralPoolNpr,
    level1Npr,
    level2Npr,
    level3Npr,
    unallocatedReferralNpr,
    shopkeeperCommissionNpr,
    permittedExpensesNpr,
    companyShareNpr,
    totalDistributedNpr,
    netCompanyProfitNpr,
    isValid,
    errorMessage
  };
}

/**
 * Idempotently executes sale completion, distributes cashback and 3-level commissions to wallets,
 * and records immutable ledger entries.
 */
export function executeOrderCommissions(orderId: string): { success: boolean; message: string } {
  return db.transaction((data) => {
    const order = data.orders.find((o) => o.id === orderId);
    if (!order) {
      return { success: false, message: 'Order not found' };
    }

    if (order.commissionProcessed) {
      return { success: false, message: 'Commissions have already been processed for this order' };
    }

    if (order.paymentStatus !== 'verified') {
      return { success: false, message: 'Order payment must be verified before releasing commissions' };
    }

    const customerUser = data.users.find((u) => u.id === order.customerId);
    if (!customerUser) {
      return { success: false, message: 'Customer user not found' };
    }

    const upline = getUplineChain(customerUser.mobile);
    const now = new Date().toISOString();

    // Ensure customer wallet exists
    if (!data.customerWallets[customerUser.id]) {
      data.customerWallets[customerUser.id] = {
        userId: customerUser.id,
        cashbackAvailableNpr: 0,
        cashbackPendingNpr: 0,
        cashbackTotalEarnedNpr: 0,
        incomeAvailableNpr: 0,
        incomePendingNpr: 0,
        incomeTotalEarnedNpr: 0,
        incomeTotalWithdrawnNpr: 0,
        updatedAt: now
      };
    }

    // Process each item in the order
    for (const item of order.items) {
      const product = data.products.find((p) => p.id === item.productId);
      if (!product || !product.commissionSettings) {
        continue;
      }

      const settings = product.commissionSettings;
      const preview = calculateProductDistribution(
        item.unitPriceNpr,
        item.unitCostNpr,
        settings
      );

      const qty = item.quantity;
      const totalItemCashback = preview.cashbackNpr * qty;
      const totalItemL1 = preview.level1Npr * qty;
      const totalItemL2 = preview.level2Npr * qty;
      const totalItemL3 = preview.level3Npr * qty;
      const totalItemShopkeeperComm = preview.shopkeeperCommissionNpr * qty;
      const totalItemCompanyShare = preview.companyShareNpr * qty;
      const totalItemExpenses = preview.permittedExpensesNpr * qty;

      // Save immutable snapshot on the item
      item.commissionSnapshot = {
        cashbackNpr: totalItemCashback,
        referralPoolNpr: preview.referralPoolNpr * qty,
        level1Npr: totalItemL1,
        level2Npr: totalItemL2,
        level3Npr: totalItemL3,
        shopkeeperCommissionNpr: totalItemShopkeeperComm,
        companyShareNpr: totalItemCompanyShare,
        expensesNpr: totalItemExpenses
      };

      // 1. CREDIT CASHBACK TO BUYER (Cashback Wallet)
      if (totalItemCashback > 0) {
        const cashbackEntry: CashbackLedgerEntry = {
          id: `cb_${order.id}_${item.productId}_${Date.now()}`,
          orderId: order.id,
          orderNumber: order.orderNumber,
          customerId: customerUser.id,
          customerMobile: customerUser.mobile,
          productId: item.productId,
          productName: item.productName,
          amountNpr: totalItemCashback,
          type: 'credit',
          status: 'credited',
          description: `Cashback for purchasing ${qty}x ${item.productName}`,
          createdAt: now
        };
        data.cashbackLedger.push(cashbackEntry);

        // Update buyer's Cashback Wallet
        const buyerWallet = data.customerWallets[customerUser.id];
        buyerWallet.cashbackAvailableNpr += totalItemCashback;
        buyerWallet.cashbackTotalEarnedNpr += totalItemCashback;
        buyerWallet.updatedAt = now;

        // Notification to buyer
        data.notifications.push({
          id: `notif_cb_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          recipientUserId: customerUser.id,
          title: 'Cashback Credited!',
          message: `NPR ${totalItemCashback} cashback credited to your Cashback Wallet for order #${order.orderNumber}.`,
          type: 'cashback',
          read: false,
          createdAt: now
        });
      }

      // 2. CREDIT LEVEL 1 REFERRAL COMMISSION
      if (totalItemL1 > 0 && upline.level1) {
        const l1User = upline.level1;
        // Ensure L1 wallet
        if (!data.customerWallets[l1User.userId]) {
          data.customerWallets[l1User.userId] = {
            userId: l1User.userId,
            cashbackAvailableNpr: 0,
            cashbackPendingNpr: 0,
            cashbackTotalEarnedNpr: 0,
            incomeAvailableNpr: 0,
            incomePendingNpr: 0,
            incomeTotalEarnedNpr: 0,
            incomeTotalWithdrawnNpr: 0,
            updatedAt: now
          };
        }

        const l1Entry: ReferralCommissionLedgerEntry = {
          id: `ref_l1_${order.id}_${item.productId}_${Date.now()}`,
          orderId: order.id,
          orderNumber: order.orderNumber,
          buyerCustomerId: customerUser.id,
          beneficiaryCustomerId: l1User.userId,
          beneficiaryMobile: l1User.mobile,
          referralLevel: 1,
          amountNpr: totalItemL1,
          type: 'credit',
          status: 'credited',
          description: `Level 1 referral commission from direct referral purchase of ${qty}x ${item.productName}`,
          createdAt: now
        };
        data.referralLedger.push(l1Entry);

        const l1Wallet = data.customerWallets[l1User.userId];
        l1Wallet.incomeAvailableNpr += totalItemL1;
        l1Wallet.incomeTotalEarnedNpr += totalItemL1;
        l1Wallet.updatedAt = now;

        data.notifications.push({
          id: `notif_l1_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          recipientUserId: l1User.userId,
          title: 'Referral Income Credited!',
          message: `NPR ${totalItemL1} Level 1 commission received from direct referral purchase (Order #${order.orderNumber}).`,
          type: 'commission',
          read: false,
          createdAt: now
        });
      }

      // 3. CREDIT LEVEL 2 REFERRAL COMMISSION
      if (totalItemL2 > 0 && upline.level2) {
        const l2User = upline.level2;
        if (!data.customerWallets[l2User.userId]) {
          data.customerWallets[l2User.userId] = {
            userId: l2User.userId,
            cashbackAvailableNpr: 0,
            cashbackPendingNpr: 0,
            cashbackTotalEarnedNpr: 0,
            incomeAvailableNpr: 0,
            incomePendingNpr: 0,
            incomeTotalEarnedNpr: 0,
            incomeTotalWithdrawnNpr: 0,
            updatedAt: now
          };
        }

        const l2Entry: ReferralCommissionLedgerEntry = {
          id: `ref_l2_${order.id}_${item.productId}_${Date.now()}`,
          orderId: order.id,
          orderNumber: order.orderNumber,
          buyerCustomerId: customerUser.id,
          beneficiaryCustomerId: l2User.userId,
          beneficiaryMobile: l2User.mobile,
          referralLevel: 2,
          amountNpr: totalItemL2,
          type: 'credit',
          status: 'credited',
          description: `Level 2 referral commission from indirect referral purchase of ${qty}x ${item.productName}`,
          createdAt: now
        };
        data.referralLedger.push(l2Entry);

        const l2Wallet = data.customerWallets[l2User.userId];
        l2Wallet.incomeAvailableNpr += totalItemL2;
        l2Wallet.incomeTotalEarnedNpr += totalItemL2;
        l2Wallet.updatedAt = now;

        data.notifications.push({
          id: `notif_l2_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          recipientUserId: l2User.userId,
          title: 'Level 2 Referral Income Credited!',
          message: `NPR ${totalItemL2} Level 2 commission received (Order #${order.orderNumber}).`,
          type: 'commission',
          read: false,
          createdAt: now
        });
      }

      // 4. CREDIT LEVEL 3 REFERRAL COMMISSION
      if (totalItemL3 > 0 && upline.level3) {
        const l3User = upline.level3;
        if (!data.customerWallets[l3User.userId]) {
          data.customerWallets[l3User.userId] = {
            userId: l3User.userId,
            cashbackAvailableNpr: 0,
            cashbackPendingNpr: 0,
            cashbackTotalEarnedNpr: 0,
            incomeAvailableNpr: 0,
            incomePendingNpr: 0,
            incomeTotalEarnedNpr: 0,
            incomeTotalWithdrawnNpr: 0,
            updatedAt: now
          };
        }

        const l3Entry: ReferralCommissionLedgerEntry = {
          id: `ref_l3_${order.id}_${item.productId}_${Date.now()}`,
          orderId: order.id,
          orderNumber: order.orderNumber,
          buyerCustomerId: customerUser.id,
          beneficiaryCustomerId: l3User.userId,
          beneficiaryMobile: l3User.mobile,
          referralLevel: 3,
          amountNpr: totalItemL3,
          type: 'credit',
          status: 'credited',
          description: `Level 3 referral commission from team purchase of ${qty}x ${item.productName}`,
          createdAt: now
        };
        data.referralLedger.push(l3Entry);

        const l3Wallet = data.customerWallets[l3User.userId];
        l3Wallet.incomeAvailableNpr += totalItemL3;
        l3Wallet.incomeTotalEarnedNpr += totalItemL3;
        l3Wallet.updatedAt = now;

        data.notifications.push({
          id: `notif_l3_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          recipientUserId: l3User.userId,
          title: 'Level 3 Referral Income Credited!',
          message: `NPR ${totalItemL3} Level 3 commission received (Order #${order.orderNumber}).`,
          type: 'commission',
          read: false,
          createdAt: now
        });
      }

      // 5. CREDIT SHOPKEEPER COMMISSION
      if (totalItemShopkeeperComm > 0 && item.shopkeeperUserId) {
        const skUserId = item.shopkeeperUserId;
        if (!data.shopkeeperWallets[skUserId]) {
          data.shopkeeperWallets[skUserId] = {
            userId: skUserId,
            availableCommissionNpr: 0,
            pendingCommissionNpr: 0,
            totalEarnedNpr: 0,
            totalWithdrawnNpr: 0,
            updatedAt: now
          };
        }

        const skEntry: ShopkeeperCommissionLedgerEntry = {
          id: `sk_comm_${order.id}_${item.productId}_${Date.now()}`,
          orderId: order.id,
          orderNumber: order.orderNumber,
          shopkeeperUserId: skUserId,
          shopName: item.shopName,
          productId: item.productId,
          productName: item.productName,
          amountNpr: totalItemShopkeeperComm,
          type: 'credit',
          status: 'credited',
          description: `Shopkeeper sales commission for ${qty}x ${item.productName}`,
          createdAt: now
        };
        data.shopkeeperLedger.push(skEntry);

        const skWallet = data.shopkeeperWallets[skUserId];
        skWallet.availableCommissionNpr += totalItemShopkeeperComm;
        skWallet.totalEarnedNpr += totalItemShopkeeperComm;
        skWallet.updatedAt = now;

        data.notifications.push({
          id: `notif_sk_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          recipientUserId: skUserId,
          title: 'Shopkeeper Commission Credited',
          message: `NPR ${totalItemShopkeeperComm} commission credited for product sale (${item.productName}, Order #${order.orderNumber}).`,
          type: 'commission',
          read: false,
          createdAt: now
        });
      }
    }

    // Mark order commissions processed
    order.commissionProcessed = true;
    order.orderStatus = 'completed';
    order.completedAt = now;

    // Audit log
    data.auditLogs.push({
      id: `audit_comm_${order.id}`,
      action: 'ORDER_COMMISSIONS_PROCESSED',
      actorUserId: 'system',
      actorRole: 'system',
      details: `Commissions and cashbacks processed for completed order #${order.orderNumber}`,
      entityType: 'order',
      entityId: order.id,
      timestamp: now
    });

    return { success: true, message: 'Commissions and cashbacks distributed successfully' };
  });
}

/**
 * Reverses commissions and cashback upon approved refund, keeping full immutable ledger trail.
 */
export function executeOrderRefund(orderId: string, reason: string): { success: boolean; message: string } {
  return db.transaction((data) => {
    const order = data.orders.find((o) => o.id === orderId);
    if (!order) {
      return { success: false, message: 'Order not found' };
    }

    if (order.paymentStatus === 'refunded') {
      return { success: false, message: 'Order has already been refunded' };
    }

    const now = new Date().toISOString();

    // Reverse cashback ledger entries if commissions were previously processed
    if (order.commissionProcessed) {
      const relatedCashbacks = data.cashbackLedger.filter((e) => e.orderId === order.id && e.type === 'credit');
      for (const cb of relatedCashbacks) {
        data.cashbackLedger.push({
          id: `rev_${cb.id}_${Date.now()}`,
          orderId: order.id,
          orderNumber: order.orderNumber,
          customerId: cb.customerId,
          customerMobile: cb.customerMobile,
          productId: cb.productId,
          productName: cb.productName,
          amountNpr: cb.amountNpr,
          type: 'debit_reversal',
          status: 'reversed',
          description: `Cashback reversed due to refund: ${reason}`,
          createdAt: now
        });

        const wallet = data.customerWallets[cb.customerId];
        if (wallet) {
          wallet.cashbackAvailableNpr = Math.max(0, wallet.cashbackAvailableNpr - cb.amountNpr);
          wallet.updatedAt = now;
        }
      }

      // Reverse referral ledger entries
      const relatedReferrals = data.referralLedger.filter((e) => e.orderId === order.id && e.type === 'credit');
      for (const ref of relatedReferrals) {
        data.referralLedger.push({
          id: `rev_${ref.id}_${Date.now()}`,
          orderId: order.id,
          orderNumber: order.orderNumber,
          buyerCustomerId: ref.buyerCustomerId,
          beneficiaryCustomerId: ref.beneficiaryCustomerId,
          beneficiaryMobile: ref.beneficiaryMobile,
          referralLevel: ref.referralLevel,
          amountNpr: ref.amountNpr,
          type: 'debit_reversal',
          status: 'reversed',
          description: `Level ${ref.referralLevel} commission reversed due to refund: ${reason}`,
          createdAt: now
        });

        const wallet = data.customerWallets[ref.beneficiaryCustomerId];
        if (wallet) {
          wallet.incomeAvailableNpr = Math.max(0, wallet.incomeAvailableNpr - ref.amountNpr);
          wallet.updatedAt = now;
        }
      }

      // Reverse shopkeeper ledger entries
      const relatedShopkeepers = data.shopkeeperLedger.filter((e) => e.orderId === order.id && e.type === 'credit');
      for (const sk of relatedShopkeepers) {
        data.shopkeeperLedger.push({
          id: `rev_${sk.id}_${Date.now()}`,
          orderId: order.id,
          orderNumber: order.orderNumber,
          shopkeeperUserId: sk.shopkeeperUserId,
          shopName: sk.shopName,
          productId: sk.productId,
          productName: sk.productName,
          amountNpr: sk.amountNpr,
          type: 'debit_reversal',
          status: 'reversed',
          description: `Shopkeeper commission reversed due to refund: ${reason}`,
          createdAt: now
        });

        const wallet = data.shopkeeperWallets[sk.shopkeeperUserId];
        if (wallet) {
          wallet.availableCommissionNpr = Math.max(0, wallet.availableCommissionNpr - sk.amountNpr);
          wallet.updatedAt = now;
        }
      }

      // Return stock
      for (const item of order.items) {
        const prod = data.products.find((p) => p.id === item.productId);
        if (prod) {
          prod.stockQuantity += item.quantity;
        }
      }
    }

    order.paymentStatus = 'refunded';
    order.orderStatus = 'cancelled';
    order.refundReason = reason;

    data.auditLogs.push({
      id: `audit_refund_${order.id}`,
      action: 'ORDER_REFUNDED',
      actorUserId: 'admin',
      actorRole: 'admin',
      details: `Order #${order.orderNumber} refunded. Reason: ${reason}`,
      entityType: 'order',
      entityId: order.id,
      timestamp: now
    });

    return { success: true, message: 'Order refunded and commissions reversed' };
  });
}
