import { Router, Request, Response } from 'express';
import { db } from '../db.ts';
import { authenticateToken, requireRole } from '../auth.ts';
import { CashbackCoupon, CashbackCouponRule } from '../../src/types/index.ts';

const router = Router();

// Customer: Get my cashback coupons
router.get('/my-coupons', authenticateToken, requireRole('customer'), (req: Request, res: Response): void => {
  const userId = req.user!.userId;
  const now = new Date().toISOString();

  // Update expired coupons
  db.transaction((data) => {
    data.coupons = data.coupons || [];
    for (const c of data.coupons) {
      if (c.status === 'available' && c.expiresAt < now) {
        c.status = 'expired';
      }
    }
    return true;
  });

  const allCoupons = db.data.coupons || [];
  const userCoupons = allCoupons.filter(c => c.userId === userId);
  userCoupons.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({
    success: true,
    coupons: userCoupons,
    rule: db.data.cashbackCouponRule
  });
});

// Validate coupon for checkout
router.post('/validate', authenticateToken, requireRole('customer'), (req: Request, res: Response): void => {
  const { code, cartTotalNpr } = req.body;
  const userId = req.user!.userId;

  if (!code || typeof code !== 'string') {
    res.status(400).json({ success: false, error: 'Coupon code is required' });
    return;
  }

  const cleanCode = code.trim().toUpperCase();
  const subtotal = Number(cartTotalNpr) || 0;
  const now = new Date().toISOString();

  const coupon = (db.data.coupons || []).find(
    c => c.code.toUpperCase() === cleanCode && (c.userId === userId || c.userId === 'all')
  );

  if (!coupon) {
    res.status(404).json({ success: false, error: 'Invalid coupon code. Please check and try again.' });
    return;
  }

  if (coupon.status === 'used') {
    res.status(400).json({ success: false, error: 'This coupon has already been used on a previous order.' });
    return;
  }

  if (coupon.expiresAt < now || coupon.status === 'expired') {
    res.status(400).json({ success: false, error: 'This cashback coupon has expired.' });
    return;
  }

  if (subtotal < coupon.minOrderAmountNpr) {
    res.status(400).json({
      success: false,
      error: `Minimum order amount of NPR ${coupon.minOrderAmountNpr} required to apply this coupon.`
    });
    return;
  }

  let discountNpr = Math.round((subtotal * coupon.discountPercentage) / 100);
  if (coupon.maxDiscountNpr && discountNpr > coupon.maxDiscountNpr) {
    discountNpr = coupon.maxDiscountNpr;
  }
  discountNpr = Math.min(discountNpr, subtotal);

  res.json({
    success: true,
    valid: true,
    discountNpr,
    finalTotalNpr: subtotal - discountNpr,
    coupon: {
      code: coupon.code,
      discountPercentage: coupon.discountPercentage,
      level: coupon.level,
      expiresAt: coupon.expiresAt
    }
  });
});

// Admin: Get 3-Level Cashback Coupon Rule settings
router.get('/admin/rules', authenticateToken, requireRole('admin'), (req: Request, res: Response): void => {
  res.json({
    success: true,
    rule: db.data.cashbackCouponRule
  });
});

// Admin: Update 3-Level Cashback Coupon Rule settings
router.put('/admin/rules', authenticateToken, requireRole('admin'), (req: Request, res: Response): void => {
  const {
    enabled,
    title,
    level1Percentage,
    level2Percentage,
    level3Percentage,
    level1MinSpendNpr,
    level2MinSpendNpr,
    level3MinSpendNpr,
    validityDays,
    minOrderToApplyNpr,
    maxDiscountNpr
  } = req.body;

  const result = db.transaction((data) => {
    data.cashbackCouponRule = {
      id: data.cashbackCouponRule?.id || 'rule_cb_default',
      enabled: enabled !== undefined ? !!enabled : true,
      title: title || '3-Level Purchase Cashback Coupon Engine',
      level1Percentage: Number(level1Percentage) >= 0 ? Number(level1Percentage) : 10,
      level2Percentage: Number(level2Percentage) >= 0 ? Number(level2Percentage) : 15,
      level3Percentage: Number(level3Percentage) >= 0 ? Number(level3Percentage) : 20,
      level1MinSpendNpr: Number(level1MinSpendNpr) >= 0 ? Number(level1MinSpendNpr) : 0,
      level2MinSpendNpr: Number(level2MinSpendNpr) >= 0 ? Number(level2MinSpendNpr) : 1000,
      level3MinSpendNpr: Number(level3MinSpendNpr) >= 0 ? Number(level3MinSpendNpr) : 2500,
      validityDays: Number(validityDays) > 0 ? Number(validityDays) : 30,
      minOrderToApplyNpr: Number(minOrderToApplyNpr) >= 0 ? Number(minOrderToApplyNpr) : 200,
      maxDiscountNpr: maxDiscountNpr ? Number(maxDiscountNpr) : 1000,
      updatedAt: new Date().toISOString()
    };

    data.auditLogs.push({
      id: `audit_rule_${Date.now()}`,
      action: 'UPDATE_COUPON_RULE',
      actorUserId: req.user!.userId,
      actorRole: 'admin',
      details: `Updated 3-level coupon rule: L1=${level1Percentage}%, L2=${level2Percentage}%, L3=${level3Percentage}%`,
      entityType: 'settings',
      entityId: data.cashbackCouponRule.id,
      timestamp: new Date().toISOString()
    });

    return data.cashbackCouponRule;
  });

  res.json({
    success: true,
    message: '3-Level Cashback Coupon settings updated successfully',
    rule: result
  });
});

// Admin: Get all coupons list
router.get('/admin/list', authenticateToken, requireRole('admin'), (req: Request, res: Response): void => {
  const coupons = [...(db.data.coupons || [])];
  coupons.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const availableCount = coupons.filter(c => c.status === 'available').length;
  const usedCount = coupons.filter(c => c.status === 'used').length;
  const totalSavedNpr = coupons.reduce((sum, c) => sum + (c.discountAppliedNpr || 0), 0);

  res.json({
    success: true,
    coupons,
    rule: db.data.cashbackCouponRule,
    stats: {
      totalIssued: coupons.length,
      availableCount,
      usedCount,
      totalSavedNpr
    }
  });
});

// Admin: Create custom coupon manually
router.post('/admin/create-custom', authenticateToken, requireRole('admin'), (req: Request, res: Response): void => {
  const {
    targetUserId,
    discountPercentage,
    level,
    minOrderAmountNpr,
    maxDiscountNpr,
    validityDays,
    customCode
  } = req.body;

  if (!discountPercentage || Number(discountPercentage) <= 0) {
    res.status(400).json({ success: false, error: 'Valid discount percentage is required' });
    return;
  }

  const result = db.transaction((data) => {
    let targetUser = data.users.find(u => u.id === targetUserId);
    if (!targetUser && targetUserId !== 'all') {
      targetUser = data.users.find(u => u.role === 'customer');
    }

    const lvl = (Number(level) === 1 || Number(level) === 2 || Number(level) === 3) ? (Number(level) as 1 | 2 | 3) : 1;
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const code = customCode?.trim().toUpperCase() || `JKM-ADMIN-L${lvl}-${randomSuffix}`;
    const now = new Date();
    const days = Number(validityDays) || 30;
    const expiresAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString();

    const newCoupon: CashbackCoupon = {
      id: `cpn_custom_${Date.now()}`,
      code,
      userId: targetUser ? targetUser.id : (targetUserId || 'all'),
      userName: targetUser ? targetUser.name : 'All Customers',
      userMobile: targetUser ? targetUser.mobile : 'All',
      sourceOrderId: 'admin_manual',
      sourceOrderNumber: 'ADMIN-PROMO',
      level: lvl,
      discountPercentage: Number(discountPercentage),
      minOrderAmountNpr: Number(minOrderAmountNpr) || 200,
      maxDiscountNpr: maxDiscountNpr ? Number(maxDiscountNpr) : 1000,
      status: 'available',
      expiresAt,
      createdAt: now.toISOString()
    };

    data.coupons = data.coupons || [];
    data.coupons.unshift(newCoupon);

    if (targetUser) {
      data.notifications.push({
        id: `notif_cpn_${Date.now()}`,
        recipientUserId: targetUser.id,
        title: 'Special Cashback Coupon Granted!',
        message: `Admin granted you a special Level ${lvl} Cashback Coupon (${discountPercentage}% OFF)! Use code "${code}".`,
        type: 'cashback',
        read: false,
        createdAt: now.toISOString()
      });
    }

    return newCoupon;
  });

  res.json({
    success: true,
    message: `Cashback Coupon ${result.code} created successfully`,
    coupon: result
  });
});

export default router;
