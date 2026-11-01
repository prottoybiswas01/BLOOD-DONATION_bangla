import { Router } from 'express';
import { 
  getCoordinatorDashboard,
  appointModerator,
  getInstitutionMembers,
  AppointModeratorSchema
} from '../controllers/coordinatorController.js';
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

// Coordinator appoints a moderator for an institution in their division
router.post('/moderators', validateBody(AppointModeratorSchema), appointModerator);

// Coordinator drill-down to view all members of an institution
router.get('/institutions/:id/members', getInstitutionMembers);

// Coordinator blocks or unblocks a moderator or user in their division
router.post('/users/:id/block', validateBody(BlockUserSchema), blockUserAccount);
router.post('/users/:id/unblock', validateBody(UnblockUserSchema), unblockUserAccount);

export default router;
