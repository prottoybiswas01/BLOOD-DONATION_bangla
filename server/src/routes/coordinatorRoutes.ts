import { Router } from 'express';
import { getCoordinatorDashboard } from '../controllers/coordinatorController.js';
import { requireAuth, requireRoles } from '../middleware/auth.js';

const router = Router();

router.get(
  '/dashboard', 
  requireAuth, 
  requireRoles('DIVISION_COORDINATOR', 'SUPER_ADMIN'), 
  getCoordinatorDashboard
);

export default router;
