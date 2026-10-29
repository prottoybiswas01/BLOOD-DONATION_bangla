import { Router } from 'express';
import authRoutes from './authRoutes.js';
import donorRoutes from './donorRoutes.js';
import requestRoutes from './requestRoutes.js';
import institutionRoutes from './institutionRoutes.js';
import coordinatorRoutes from './coordinatorRoutes.js';
import adminRoutes from './adminRoutes.js';
import reportRoutes from './reportRoutes.js';
import locationRoutes from './locationRoutes.js';
import notificationRoutes from './notificationRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/donors', donorRoutes);
router.use('/requests', requestRoutes);
router.use('/institutions', institutionRoutes);
router.use('/coordinators', coordinatorRoutes);
router.use('/admin', adminRoutes);
router.use('/reports', reportRoutes);
router.use('/locations', locationRoutes);
router.use('/notifications', notificationRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    platform: 'Bangladesh Blood Donation Platform API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

export default router;
