import { Router, Request, Response } from 'express';
import { db } from '../db.ts';
import { authenticateToken, requireRole } from '../auth.ts';
import { executeOrderCommissions, executeOrderRefund } from '../commissionEngine.ts';
import { Order, OrderItem } from '../../src/types/index.ts';

const router = Router();

// Create Order (Customer)
router.post('/', authenticateToken, requireRole('customer'), (req: Request, res: Response): void => {
  const { items, paymentMethod, paymentReference, shippingAddress } = req.body;

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

    const newOrder: Order = {
      id: orderId,
      orderNumber,
      customerId: req.user!.userId,
      customerName: req.user!.name,
      customerMobile: req.user!.mobile,
      items: validatedItems,
      totalAmountNpr: totalNpr,
      paymentMethod: paymentMethod || 'esewa',
      paymentReference: paymentReference || undefined,
      paymentStatus: 'pending',
      orderStatus: 'placed',
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

export default router;
