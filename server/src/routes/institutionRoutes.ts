import { Router } from 'express';
import { 
  getInstitutions, 
  getInstitutionById, 
  createInstitution, 
  getModeratorDashboard,
  getInstitutionMembers,
  CreateInstitutionSchema
} from '../controllers/institutionController.js';
import { optionalAuth, requireAuth, requireRoles } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';

const router = Router();

router.get('/', getInstitutions);
router.get('/moderator/dashboard', requireAuth, requireRoles('INSTITUTION_MODERATOR', 'SUPER_ADMIN'), getModeratorDashboard);
router.get('/:id', getInstitutionById);
router.get('/:id/members', getInstitutionMembers);
router.post('/', optionalAuth, validateBody(CreateInstitutionSchema), createInstitution);

export default router;

