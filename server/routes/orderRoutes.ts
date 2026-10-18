import { Router, Request, Response } from 'express';
import { db } from '../db.ts';
import { authenticateToken, requireRole } from '../auth.ts';
import { executeOrderCommissions, executeOrderRefund } from '../commissionEngine.ts';
import { Order, OrderItem, CashbackCoupon } from '../../src/types/index.ts';

const router = Router();

// Create Order (Customer)
router.post('/', authenticateToken, requireRole('customer'), (req: Request, res: Response): void => {
  const { items, paymentMethod, paymentReference, shippingAddress, couponCode } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    res.status(400).json({ success: false, error: 'At least one item is required in the cart' });
    return;
  }

  if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.mobile || !shippingAddress.street || !shippingAddress.city) {
    res.status(400).json({ success: false, error: 'Complete shipping address is required' });
    return;
  }

  const result = db.transaction((data) => {
    let totalNpr = 0;
    const validatedItems: OrderItem[] = [];

    for (const reqItem of items) {
      const product = data.products.find(p => p.id === reqItem.productId);
      if (!product) {
        return { success: false, error: `Product not found: ${reqItem.productId}` };
      }
      if (product.status !== 'approved') {
        return { success: false, error: `Product "${product.name}" is currently unavailable for purchase` };
      }
      const qty = parseInt(reqItem.quantity, 10);
      if (isNaN(qty) || qty <= 0) {
        return { success: false, error: `Invalid quantity for ${product.name}` };
      }
      if (product.stockQuantity < qty) {
        return {
          success: false,
          error: `Insufficient stock for "${product.name}". Available: ${product.stockQuantity}, Requested: ${qty}`
        };
      }

      // Reserve stock
      product.stockQuantity -= qty;

      const itemTotal = product.finalSellingPriceNpr * qty;
      totalNpr += itemTotal;

      validatedItems.push({
        productId: product.id,
        productName: product.name,
        shopId: product.shopId,
        shopName: product.shopName,
        shopkeeperUserId: product.shopkeeperUserId,
        quantity: qty,
        unitPriceNpr: product.finalSellingPriceNpr,
        unitCostNpr: product.costPriceNpr,
        totalNpr: itemTotal
      });
    }

    const orderId = `ord_${Date.now()}`;
    const orderNumber = `JKM-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const now = new Date().toISOString();

    // Handle Coupon Redemption if couponCode was provided
    let appliedCouponDiscountNpr = 0;
    let appliedCouponCode: string | undefined = undefined;

    if (couponCode && typeof couponCode === 'string') {
      const cleanCode = couponCode.trim().toUpperCase();
      const cpn = (data.coupons || []).find(
        c => c.code.toUpperCase() === cleanCode && (c.userId === req.user!.userId || c.userId === 'all')
      );
      if (cpn && cpn.status === 'available' && cpn.expiresAt > now && totalNpr >= cpn.minOrderAmountNpr) {
        let disc = Math.round((totalNpr * cpn.discountPercentage) / 100);
        if (cpn.maxDiscountNpr && disc > cpn.maxDiscountNpr) {
          disc = cpn.maxDiscountNpr;
        }
        disc = Math.min(disc, totalNpr);
        appliedCouponDiscountNpr = disc;
        appliedCouponCode = cpn.code;

        cpn.status = 'used';
        cpn.usedInOrderId = orderId;
        cpn.usedInOrderNumber = orderNumber;
        cpn.usedAt = now;
        cpn.discountAppliedNpr = disc;
      }
    }

    const finalPayableNpr = Math.max(0, totalNpr - appliedCouponDiscountNpr);

    // Automatic 3-Level Next Purchase Cashback Coupon Generator
    let awardedCouponInfo: { code: string; discountPercentage: number; level: 1 | 2 | 3 } | undefined = undefined;
    const rule = data.cashbackCouponRule;
    if (rule && rule.enabled !== false) {
      let level: 1 | 2 | 3 = 1;
      let discountPercentage = rule.level1Percentage || 10;

      if (totalNpr >= (rule.level3MinSpendNpr || 2500)) {
        level = 3;
        discountPercentage = rule.level3Percentage || 20;
      } else if (totalNpr >= (rule.level2MinSpendNpr || 1000)) {
        level = 2;
        discountPercentage = rule.level2Percentage || 15;
      } else {
        level = 1;
        discountPercentage = rule.level1Percentage || 10;
      }

      const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
      const newCode = `JKMCB-L${level}-${randomSuffix}`;
      const validityDays = rule.validityDays || 30;
      const expiresAt = new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000).toISOString();

      const newCoupon: CashbackCoupon = {
        id: `cpn_${Date.now()}_${randomSuffix}`,
        code: newCode,
        userId: req.user!.userId,
        userName: req.user!.name,
        userMobile: req.user!.mobile,
        sourceOrderId: orderId,
        sourceOrderNumber: orderNumber,
        level,
        discountPercentage,
        minOrderAmountNpr: rule.minOrderToApplyNpr || 200,
        maxDiscountNpr: rule.maxDiscountNpr || 1000,
        status: 'available',
        expiresAt,
        createdAt: now
      };

      data.coupons = data.coupons || [];
      data.coupons.push(newCoupon);

      awardedCouponInfo = {
        code: newCode,
        discountPercentage,
        level
      };

      data.notifications.push({
        id: `notif_cpn_${Date.now()}`,
        recipientUserId: req.user!.userId,
        title: '🎟️ Next Purchase Cashback Coupon Awarded!',
        message: `Your order #${orderNumber} unlocked a Level ${level} Cashback Coupon (${discountPercentage}% OFF)! Use coupon code "${newCode}" on your next purchase (valid ${validityDays} days).`,
        type: 'cashback',
        read: false,
        createdAt: now
      });
    }

    const newOrder: Order = {
      id: orderId,
      orderNumber,
      customerId: req.user!.userId,
      customerName: req.user!.name,
      customerMobile: req.user!.mobile,
      items: validatedItems,
      totalAmountNpr: finalPayableNpr,
      couponCode: appliedCouponCode,
      couponDiscountNpr: appliedCouponDiscountNpr,
      awardedCoupon: awardedCouponInfo,
      paymentMethod: paymentMethod || 'esewa',
      paymentReference: paymentReference || undefined,
      paymentStatus: 'pending',
      orderStatus: 'placed',
      deliveryStatus: 'order_placed',
      courierName: undefined,
      trackingNumber: undefined,
      deliveryNotes: undefined,
      estimatedDeliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      deliveryStatusUpdatedAt: now,
      deliveryTimeline: [
        {
          status: 'order_placed',
          label: 'Order Placed',
          updatedAt: now,
          note: 'Order successfully created and received by JK Mission system',
          updatedByRole: 'system'
        }
      ],
      shippingAddress,
      commissionProcessed: false,
      createdAt: now
    };

    data.orders.push(newOrder);

    // Notifications
    data.notifications.push({
      id: `notif_ord_${Date.now()}`,
      recipientUserId: req.user!.userId,
      title: 'Order Placed Successfully',
      message: `Your order #${orderNumber} for NPR ${totalNpr} has been received.`,
      type: 'order',
      read: false,
      createdAt: now
    });

    data.notifications.push({
      id: `notif_ord_adm_${Date.now()}`,
      recipientUserId: 'user_admin_1',
      title: 'New Customer Order Placed',
      message: `Order #${orderNumber} (NPR ${totalNpr}) placed by ${req.user!.name}. Awaiting verification.`,
      type: 'order',
      read: false,
      createdAt: now
    });

    data.auditLogs.push({
      id: `audit_ord_${orderId}`,
      action: 'ORDER_PLACED',
      actorUserId: req.user!.userId,
      actorRole: 'customer',
      details: `Order #${orderNumber} placed for NPR ${totalNpr} via ${paymentMethod}`,
      entityType: 'order',
      entityId: orderId,
      timestamp: now
    });

    return { success: true, order: newOrder };
  });

  if (!result.success) {
    res.status(400).json(result);
  } else {
    res.json(result);
  }
});

// Get My Orders
router.get('/my-orders', authenticateToken, (req: Request, res: Response): void => {
  const orders = db.data.orders.filter(o => o.customerId === req.user!.userId);
  orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json({ success: true, orders });
});

// Get Shop Orders (Shopkeeper)
router.get('/shop-orders', authenticateToken, requireRole('shopkeeper'), (req: Request, res: Response): void => {
  const orders = db.data.orders.filter(o =>
    o.items.some(item => item.shopkeeperUserId === req.user!.userId)
  );
  orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json({ success: true, orders });
});

// Get All Orders (Admin)
router.get('/admin-list', authenticateToken, requireRole('admin'), (req: Request, res: Response): void => {
  const orders = [...db.data.orders];
  orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json({ success: true, orders });
});

// Get Specific Order / Invoice
router.get('/:id', authenticateToken, (req: Request, res: Response): void => {
  const order = db.data.orders.find(o => o.id === req.params.id);
  if (!order) {
    res.status(404).json({ success: false, error: 'Order not found' });
    return;
  }

  // Access check: Admin, Buyer, or one of the shopkeepers
  const isBuyer = order.customerId === req.user!.userId;
  const isAdmin = req.user!.role === 'admin';
  const isShopOwner = order.items.some(item => item.shopkeeperUserId === req.user!.userId);

  if (!isBuyer && !isAdmin && !isShopOwner) {
    res.status(403).json({ success: false, error: 'Access denied' });
    return;
  }

  res.json({ success: true, order });
});

// Admin: Verify Payment
router.put('/:id/verify-payment', authenticateToken, requireRole('admin'), (req: Request, res: Response): void => {
  const result = db.transaction((data) => {
    const order = data.orders.find(o => o.id === req.params.id);
    if (!order) {
      return { success: false, error: 'Order not found' };
    }

    order.paymentStatus = 'verified';
    if (order.orderStatus === 'placed') {
      order.orderStatus = 'processing';
    }

    const now = new Date().toISOString();
    data.notifications.push({
      id: `notif_pay_${Date.now()}`,
      recipientUserId: order.customerId,
      title: 'Payment Verified',
      message: `Your payment for order #${order.orderNumber} has been verified by JK Mission.`,
      type: 'order',
      read: false,
      createdAt: now
    });

    data.auditLogs.push({
      id: `audit_payver_${order.id}`,
      action: 'PAYMENT_VERIFIED',
      actorUserId: req.user!.userId,
      actorRole: 'admin',
      details: `Payment verified for order #${order.orderNumber}`,
      entityType: 'order',
      entityId: order.id,
      timestamp: now
    });

    return { success: true, order };
  });

  if (!result.success) {
    res.status(400).json(result);
  } else {
    res.json(result);
  }
});

// Admin: Complete Sale and Release Commissions
router.put('/:id/complete-and-release-commission', authenticateToken, requireRole('admin'), (req: Request, res: Response): void => {
  const order = db.data.orders.find(o => o.id === req.params.id);
  if (!order) {
    res.status(404).json({ success: false, error: 'Order not found' });
    return;
  }

  // Automatically verify payment if admin completes
  if (order.paymentStatus !== 'verified') {
    db.transaction((data) => {
      const ord = data.orders.find(o => o.id === req.params.id);
      if (ord) ord.paymentStatus = 'verified';
    });
  }

  const commissionResult = executeOrderCommissions(order.id);
  if (!commissionResult.success) {
    res.status(400).json({ success: false, error: commissionResult.message });
    return;
  }

  const updatedOrder = db.data.orders.find(o => o.id === req.params.id);
  res.json({ success: true, message: commissionResult.message, order: updatedOrder });
});

// Admin: Refund Order
router.put('/:id/refund', authenticateToken, requireRole('admin'), (req: Request, res: Response): void => {
  const { reason } = req.body;
  if (!reason) {
    res.status(400).json({ success: false, error: 'Refund reason is required' });
    return;
  }

  const refundResult = executeOrderRefund(req.params.id, reason);
  if (!refundResult.success) {
    res.status(400).json({ success: false, error: refundResult.message });
    return;
  }

  const updatedOrder = db.data.orders.find(o => o.id === req.params.id);
  res.json({ success: true, message: refundResult.message, order: updatedOrder });
});

// Update Delivery Status & Shipping Details (Shopkeeper or Admin)
router.put('/:id/delivery-status', authenticateToken, (req: Request, res: Response): void => {
  const { deliveryStatus, courierName, trackingNumber, deliveryNotes, estimatedDeliveryDate } = req.body;

  if (!deliveryStatus) {
    res.status(400).json({ success: false, error: 'deliveryStatus is required' });
    return;
  }

  const result = db.transaction((data) => {
    const order = data.orders.find(o => o.id === req.params.id);
    if (!order) {
      return { success: false, error: 'Order not found' };
    }

    const isAdmin = req.user!.role === 'admin';
    const isShopOwner = order.items.some(it => it.shopkeeperUserId === req.user!.userId);

    if (!isAdmin && !isShopOwner) {
      return { success: false, error: 'Access denied: Only the shopkeeper or master admin can update delivery tracking' };
    }

    const now = new Date().toISOString();
    order.deliveryStatus = deliveryStatus;
    order.deliveryStatusUpdatedAt = now;

    if (courierName !== undefined) order.courierName = courierName.trim() || undefined;
    if (trackingNumber !== undefined) order.trackingNumber = trackingNumber.trim() || undefined;
    if (deliveryNotes !== undefined) order.deliveryNotes = deliveryNotes.trim() || undefined;
    if (estimatedDeliveryDate !== undefined) order.estimatedDeliveryDate = estimatedDeliveryDate || undefined;

    // Sync orderStatus if delivered, processing, or cancelled
    if (deliveryStatus === 'delivered') {
      order.orderStatus = 'delivered';
      if (!order.completedAt) order.completedAt = now;
    } else if (deliveryStatus === 'processing' || deliveryStatus === 'shipped' || deliveryStatus === 'out_for_delivery') {
      if (order.orderStatus === 'placed') {
        order.orderStatus = 'processing';
      }
    } else if (deliveryStatus === 'cancelled') {
      order.orderStatus = 'cancelled';
    }

    const statusLabels: Record<string, string> = {
      order_placed: 'Order Placed',
      confirmed: 'Confirmed by Store',
      processing: 'Packed & Processing',
      shipped: 'Shipped (In Transit)',
      out_for_delivery: 'Out for Delivery',
      delivered: 'Delivered Successfully',
      cancelled: 'Delivery Cancelled'
    };

    const label = statusLabels[deliveryStatus] || deliveryStatus;

    if (!order.deliveryTimeline) {
      order.deliveryTimeline = [];
    }

    order.deliveryTimeline.push({
      status: deliveryStatus,
      label,
      updatedAt: now,
      note: deliveryNotes ? deliveryNotes.trim() : undefined,
      courierName: courierName ? courierName.trim() : undefined,
      trackingNumber: trackingNumber ? trackingNumber.trim() : undefined,
      updatedByRole: req.user!.role as 'shopkeeper' | 'admin'
    });

    // Notify Customer about status change
    data.notifications.push({
      id: `notif_del_${Date.now()}`,
      recipientUserId: order.customerId,
      title: `🚚 Order #${order.orderNumber}: ${label}`,
      message: `Your order delivery status is now "${label}".${order.courierName ? ` Courier: ${order.courierName}.` : ''}${order.trackingNumber ? ` Tracking: ${order.trackingNumber}.` : ''}`,
      type: 'order',
      read: false,
      createdAt: now
    });

    data.auditLogs.push({
      id: `audit_del_${order.id}_${Date.now()}`,
      action: 'DELIVERY_STATUS_UPDATED',
      actorUserId: req.user!.userId,
      actorRole: req.user!.role,
      details: `Delivery status for order #${order.orderNumber} changed to "${label}". Courier: ${order.courierName || 'N/A'}, Tracking: ${order.trackingNumber || 'N/A'}`,
      entityType: 'order',
      entityId: order.id,
      timestamp: now
    });

    return { success: true, order, message: `Delivery status updated to ${label}` };
  });

  if (!result.success) {
    res.status(400).json(result);
  } else {
    res.json(result);
  }
});

export default router;
