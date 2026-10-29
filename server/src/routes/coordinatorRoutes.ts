import { Router } from 'express';
import { getCoordinatorDashboard } from '../controllers/coordinatorController.js';
import { 
  getModeratorActivities, 
  getDivisionModeratorsSummary 
} from '../controllers/moderatorActivityController.js';
import { 
  blockUserAccount, 
  unblockUserAccount,
  BlockUserSchema,
  UnblockUserSchema
} from '../controllers/adminController.js';
import { requireAuth, requireRoles } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';

const router = Router();

router.use(requireAuth, requireRoles('DIVISION_COORDINATOR', 'SUPER_ADMIN'));

router.get('/dashboard', getCoordinatorDashboard);
router.get('/moderators-summary', getDivisionModeratorsSummary);
router.get('/activities', getModeratorActivities);
router.post('/users/:id/block', validateBody(BlockUserSchema), blockUserAccount);
router.post('/users/:id/unblock', validateBody(UnblockUserSchema), unblockUserAccount);

export default router;
