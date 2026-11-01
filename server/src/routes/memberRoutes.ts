import { Router } from 'express';
import { 
  createMemberByModerator, 
  updateMyProfile,
  CreateMemberByModeratorSchema,
  UpdateProfileSchema
} from '../controllers/memberController.js';
import { requireAuth, requireRoles } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';

const router = Router();

// Member self profile update
router.patch('/me', requireAuth, validateBody(UpdateProfileSchema), updateMyProfile);

// Manual member registration with temporary password by authorized roles
router.post(
  '/', 
  requireAuth, 
  requireRoles('INSTITUTION_MODERATOR', 'INSTITUTION_HEAD', 'DIVISION_COORDINATOR', 'ADMIN', 'SUPER_ADMIN'), 
  validateBody(CreateMemberByModeratorSchema), 
  createMemberByModerator
);

export default router;

