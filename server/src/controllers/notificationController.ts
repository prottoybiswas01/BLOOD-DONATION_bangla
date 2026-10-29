import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { dataStore } from '../services/dataStore.js';

export async function getNotifications(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'অননুমোদিত।' });
    return;
  }

  const notifications = dataStore.getUserNotifications(req.user.userId);
  res.json({
    success: true,
    notifications
  });
}

export async function markAsRead(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'অননুমোদিত।' });
    return;
  }

  const { id } = req.params;
  const success = dataStore.markNotificationAsRead(id, req.user.userId);

  res.json({
    success,
    message: success ? 'বিজ্ঞপ্তিটি পঠিত হিসেবে চিহ্নিত করা হয়েছে।' : 'বিজ্ঞপ্তি পাওয়া যায়নি।'
  });
}

