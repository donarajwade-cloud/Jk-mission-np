import { Router, Request, Response } from 'express';
import { db } from '../db.ts';
import { authenticateToken } from '../auth.ts';

const router = Router();

// GET /api/notifications
router.get('/', authenticateToken, (req: Request, res: Response): void => {
  const userId = req.user!.userId;
  const isAdmin = req.user!.role === 'admin';

  const userNotifications = db.data.notifications.filter(n =>
    n.recipientUserId === userId || (isAdmin && n.recipientUserId === 'user_admin_1')
  );

  userNotifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json({ success: true, notifications: userNotifications });
});

// PUT /api/notifications/:id/read
router.put('/:id/read', authenticateToken, (req: Request, res: Response): void => {
  db.transaction((data) => {
    const notif = data.notifications.find(n => n.id === req.params.id);
    if (notif) {
      notif.read = true;
    }
  });
  res.json({ success: true });
});

// PUT /api/notifications/mark-all-read
router.put('/mark-all-read', authenticateToken, (req: Request, res: Response): void => {
  const userId = req.user!.userId;
  const isAdmin = req.user!.role === 'admin';

  db.transaction((data) => {
    for (const notif of data.notifications) {
      if (notif.recipientUserId === userId || (isAdmin && notif.recipientUserId === 'user_admin_1')) {
        notif.read = true;
      }
    }
  });
  res.json({ success: true });
});

export default router;
