import { Router, Request, Response } from 'express';
import { db } from '../db.ts';

const router = Router();

// GET /api/shops (Public list of participating shops)
router.get('/', (req: Request, res: Response): void => {
  const { district, search } = req.query;
  let list = db.data.shops.filter(s => s.isOpen);

  if (district && typeof district === 'string' && district !== 'All') {
    list = list.filter(s => s.district.toLowerCase() === district.toLowerCase());
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    list = list.filter(s => s.name.toLowerCase().includes(q) || s.address.toLowerCase().includes(q) || s.description.toLowerCase().includes(q));
  }

  res.json({ success: true, count: list.length, shops: list });
});

// GET /api/shops/:id (Single shop details + its approved products)
router.get('/:id', (req: Request, res: Response): void => {
  const shop = db.data.shops.find(s => s.id === req.params.id);
  if (!shop) {
    res.status(404).json({ success: false, error: 'Shop not found' });
    return;
  }

  const products = db.data.products.filter(p => p.shopId === shop.id && p.status === 'approved');

  res.json({
    success: true,
    shop,
    products
  });
});

export default router;
