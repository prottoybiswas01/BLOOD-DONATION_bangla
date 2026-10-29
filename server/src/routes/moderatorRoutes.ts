import { Router } from 'express';
import { 
  getModeratorActivities, 
  getDivisionModeratorsSummary 
} from '../controllers/moderatorActivityController.js';
import { requireAuth, requireRoles } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth, requireRoles('INSTITUTION_MODERATOR', 'DIVISION_COORDINATOR', 'ADMIN', 'SUPER_ADMIN'));

router.get('/activities', getModeratorActivities);
router.get('/summary', getDivisionModeratorsSummary);

export default router;

