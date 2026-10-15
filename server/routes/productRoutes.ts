import { Router, Request, Response } from 'express';
import { db } from '../db.ts';
import { authenticateToken, requireRole } from '../auth.ts';
import { calculateProductDistribution } from '../commissionEngine.ts';
import { Product, ProductCommissionSettings } from '../../src/types/index.ts';

const router = Router();

// GET /api/products (Public: only approved and active products)
router.get('/', (req: Request, res: Response): void => {
  const { category, search, shopId, minPrice, maxPrice } = req.query;

  let list = db.data.products.filter(p => p.status === 'approved');

  if (category && typeof category === 'string' && category !== 'All') {
    list = list.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }

  if (shopId && typeof shopId === 'string') {
    list = list.filter(p => p.shopId === shopId);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    list = list.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
  }

  if (minPrice) {
    const min = parseFloat(minPrice as string);
    if (!isNaN(min)) list = list.filter(p => p.finalSellingPriceNpr >= min);
  }

  if (maxPrice) {
    const max = parseFloat(maxPrice as string);
    if (!isNaN(max)) list = list.filter(p => p.finalSellingPriceNpr <= max);
  }

  res.json({ success: true, count: list.length, products: list });
});

// GET /api/products/categories
router.get('/categories', (req: Request, res: Response): void => {
  const categories = Array.from(new Set(db.data.products.map(p => p.category)));
  res.json({ success: true, categories });
});

// GET /api/products/admin-list (Admin: all products including pending)
router.get('/admin-list', authenticateToken, requireRole('admin'), (req: Request, res: Response): void => {
  res.json({ success: true, products: db.data.products });
});

// Shopkeeper: View My Submissions (Must be registered before /:id parameter)
router.get('/my-submissions', authenticateToken, requireRole('shopkeeper'), (req: Request, res: Response): void => {
  const products = db.data.products.filter(p => p.shopkeeperUserId === req.user!.userId);
  res.json({ success: true, products });
});

// GET /api/products/:id
router.get('/:id', (req: Request, res: Response): void => {
  const product = db.data.products.find(p => p.id === req.params.id);
  if (!product) {
    res.status(404).json({ success: false, error: 'Product not found' });
    return;
  }

  // If not approved, only owner or admin can view
  if (product.status !== 'approved') {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      res.status(404).json({ success: false, error: 'Product is not currently available' });
      return;
    }
  }

  res.json({ success: true, product });
});

// Shopkeeper: Submit Product
router.post('/submit', authenticateToken, requireRole('shopkeeper'), (req: Request, res: Response): void => {
  const {
    name,
    description,
    category,
    costPriceNpr,
    proposedSellingPriceNpr,
    stockQuantity,
    sku,
    imageUrl,
    specifications
  } = req.body;

  if (!name || !costPriceNpr || !proposedSellingPriceNpr || stockQuantity === undefined) {
    res.status(400).json({ success: false, error: 'Name, cost price, proposed selling price, and stock are required' });
    return;
  }

  if (Number(costPriceNpr) <= 0 || Number(proposedSellingPriceNpr) <= 0) {
    res.status(400).json({ success: false, error: 'Prices must be greater than zero' });
    return;
  }

  if (Number(proposedSellingPriceNpr) < Number(costPriceNpr)) {
    res.status(400).json({ success: false, error: 'Proposed selling price cannot be less than cost price' });
    return;
  }

  const shop = db.data.shops.find(s => s.shopkeeperUserId === req.user!.userId);
  if (!shop) {
    res.status(400).json({ success: false, error: 'Shop profile not found for this shopkeeper' });
    return;
  }

  const productId = `prod_${Date.now()}`;
  const now = new Date().toISOString();

  const newProduct: Product = {
    id: productId,
    shopId: shop.id,
    shopName: shop.name,
    shopkeeperUserId: req.user!.userId,
    name,
    description: description || '',
    category: category || 'General Retail',
    costPriceNpr: Number(costPriceNpr),
    proposedSellingPriceNpr: Number(proposedSellingPriceNpr),
    finalSellingPriceNpr: Number(proposedSellingPriceNpr),
    stockQuantity: Math.max(0, parseInt(stockQuantity, 10)),
    lowStockThreshold: 5,
    sku: sku || `SKU-${Date.now().toString().slice(-6)}`,
    imageUrl: imageUrl || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80',
    specifications: specifications || {},
    status: 'pending_approval',
    createdAt: now,
    updatedAt: now
  };

  db.transaction((data) => {
    data.products.push(newProduct);
    const admins = data.users.filter(u => u.role === 'admin');
    if (admins.length === 0) {
      data.notifications.push({
        id: `notif_${Date.now()}`,
        recipientUserId: 'user_admin_1',
        title: '📦 New Product Pending Approval',
        message: `${shop.name} submitted a new product: "${name}" at proposed price NPR ${proposedSellingPriceNpr}. Configure commissions to approve.`,
        type: 'product',
        read: false,
        createdAt: now
      });
    } else {
      for (const admin of admins) {
        data.notifications.push({
          id: `notif_${Date.now()}_${admin.id}`,
          recipientUserId: admin.id,
          title: '📦 New Product Pending Approval',
          message: `${shop.name} submitted a new product: "${name}" at proposed price NPR ${proposedSellingPriceNpr}. Configure commissions to approve.`,
          type: 'product',
          read: false,
          createdAt: now
        });
      }
    }
    data.auditLogs.push({
      id: `audit_prod_${productId}`,
      action: 'PRODUCT_SUBMITTED',
      actorUserId: req.user!.userId,
      actorRole: 'shopkeeper',
      details: `Product "${name}" submitted by ${shop.name}`,
      entityType: 'product',
      entityId: productId,
      timestamp: now
    });
  });

  res.json({
    success: true,
    message: 'Product submitted successfully. It will become available after Admin review and commission configuration.',
    product: newProduct
  });
});

// Shopkeeper: Update Stock
router.put('/:id/stock', authenticateToken, requireRole('shopkeeper'), (req: Request, res: Response): void => {
  const { stockQuantity } = req.body;
  if (stockQuantity === undefined || Number(stockQuantity) < 0) {
    res.status(400).json({ success: false, error: 'Valid stock quantity is required' });
    return;
  }

  const result = db.transaction((data) => {
    const prod = data.products.find(p => p.id === req.params.id && p.shopkeeperUserId === req.user!.userId);
    if (!prod) {
      return { success: false, error: 'Product not found or not owned by you' };
    }

    const oldStock = prod.stockQuantity;
    prod.stockQuantity = Number(stockQuantity);
    prod.updatedAt = new Date().toISOString();

    data.auditLogs.push({
      id: `audit_stock_${prod.id}_${Date.now()}`,
      action: 'STOCK_UPDATED',
      actorUserId: req.user!.userId,
      actorRole: 'shopkeeper',
      details: `Stock for "${prod.name}" changed from ${oldStock} to ${prod.stockQuantity}`,
      entityType: 'product',
      entityId: prod.id,
      timestamp: new Date().toISOString()
    });

    return { success: true, product: prod };
  });

  if (!result.success) {
    res.status(400).json(result);
  } else {
    res.json(result);
  }
});

// Admin: Preview Commissions
router.post('/preview-commissions', authenticateToken, requireRole('admin'), (req: Request, res: Response): void => {
  const { sellingPriceNpr, costPriceNpr, commissionSettings } = req.body;

  if (!sellingPriceNpr || !costPriceNpr || !commissionSettings) {
    res.status(400).json({ success: false, error: 'Selling price, cost price, and commission settings are required' });
    return;
  }

  const preview = calculateProductDistribution(
    Number(sellingPriceNpr),
    Number(costPriceNpr),
    commissionSettings as ProductCommissionSettings
  );

  res.json({ success: true, preview });
});

// Admin: Configure Commissions and Approve Product
router.put('/:id/configure-and-approve', authenticateToken, requireRole('admin'), (req: Request, res: Response): void => {
  const { finalSellingPriceNpr, commissionSettings } = req.body;

  if (!finalSellingPriceNpr || !commissionSettings) {
    res.status(400).json({ success: false, error: 'Final selling price and commission settings are required' });
    return;
  }

  const product = db.data.products.find(p => p.id === req.params.id);
  if (!product) {
    res.status(404).json({ success: false, error: 'Product not found' });
    return;
  }

  const preview = calculateProductDistribution(
    Number(finalSellingPriceNpr),
    product.costPriceNpr,
    commissionSettings as ProductCommissionSettings
  );

  if (!preview.isValid) {
    res.status(400).json({
      success: false,
      error: preview.errorMessage || 'Invalid financial distribution configuration'
    });
    return;
  }

  const now = new Date().toISOString();

  db.transaction((data) => {
    const prod = data.products.find(p => p.id === req.params.id)!;
    prod.finalSellingPriceNpr = Number(finalSellingPriceNpr);
    prod.commissionSettings = commissionSettings;
    prod.status = 'approved';
    prod.updatedAt = now;

    // Notify shopkeeper
    data.notifications.push({
      id: `notif_prodapp_${Date.now()}`,
      recipientUserId: prod.shopkeeperUserId,
      title: 'Product Approved & Live!',
      message: `Your product "${prod.name}" has been approved at selling price NPR ${finalSellingPriceNpr} and is now active for shoppers.`,
      type: 'product',
      read: false,
      createdAt: now
    });

    data.auditLogs.push({
      id: `audit_appr_${prod.id}`,
      action: 'PRODUCT_APPROVED_WITH_COMMISSIONS',
      actorUserId: req.user!.userId,
      actorRole: 'admin',
      details: `Product "${prod.name}" approved. Price: NPR ${finalSellingPriceNpr}, Cost: NPR ${prod.costPriceNpr}, Cashback: NPR ${preview.cashbackNpr}, L1: NPR ${preview.level1Npr}, L2: NPR ${preview.level2Npr}, L3: NPR ${preview.level3Npr}, Shopkeeper Comm: NPR ${preview.shopkeeperCommissionNpr}, Company: NPR ${preview.companyShareNpr}`,
      entityType: 'product',
      entityId: prod.id,
      timestamp: now
    });
  });

  res.json({
    success: true,
    message: 'Product approved and commission settings configured successfully',
    product: db.data.products.find(p => p.id === req.params.id)
  });
});

// Admin: Reject Product
router.put('/:id/reject', authenticateToken, requireRole('admin'), (req: Request, res: Response): void => {
  const { reason } = req.body;
  const product = db.data.products.find(p => p.id === req.params.id);
  if (!product) {
    res.status(404).json({ success: false, error: 'Product not found' });
    return;
  }

  const now = new Date().toISOString();

  db.transaction((data) => {
    const prod = data.products.find(p => p.id === req.params.id)!;
    prod.status = 'rejected';
    prod.rejectionReason = reason || 'Does not meet product quality or compliance criteria.';
    prod.updatedAt = now;

    data.notifications.push({
      id: `notif_rej_${Date.now()}`,
      recipientUserId: prod.shopkeeperUserId,
      title: 'Product Submission Rejected',
      message: `Product "${prod.name}" was rejected. Reason: ${prod.rejectionReason}`,
      type: 'product',
      read: false,
      createdAt: now
    });

    data.auditLogs.push({
      id: `audit_rej_${prod.id}`,
      action: 'PRODUCT_REJECTED',
      actorUserId: req.user!.userId,
      actorRole: 'admin',
      details: `Product "${prod.name}" rejected. Reason: ${reason}`,
      entityType: 'product',
      entityId: prod.id,
      timestamp: now
    });
  });

  res.json({ success: true, message: 'Product rejected' });
});

// Admin: Toggle disable/enable
router.put('/:id/toggle-status', authenticateToken, requireRole('admin'), (req: Request, res: Response): void => {
  const product = db.data.products.find(p => p.id === req.params.id);
  if (!product) {
    res.status(404).json({ success: false, error: 'Product not found' });
    return;
  }

  const now = new Date().toISOString();

  db.transaction((data) => {
    const prod = data.products.find(p => p.id === req.params.id)!;
    prod.status = prod.status === 'approved' ? 'disabled' : 'approved';
    prod.updatedAt = now;

    data.auditLogs.push({
      id: `audit_toggle_${prod.id}_${Date.now()}`,
      action: 'PRODUCT_STATUS_TOGGLED',
      actorUserId: req.user!.userId,
      actorRole: 'admin',
      details: `Product "${prod.name}" status changed to ${prod.status}`,
      entityType: 'product',
      entityId: prod.id,
      timestamp: now
    });
  });

  res.json({ success: true, product: db.data.products.find(p => p.id === req.params.id) });
});

export default router;
