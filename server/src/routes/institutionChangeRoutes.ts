import { Router } from 'express';
import { 
  submitInstitutionChangeRequest, 
  getInstitutionChangeRequests, 
  reviewInstitutionChangeRequest, 
  getMyInstitutionChangeRequest,
  SubmitInstitutionChangeSchema,
  ReviewInstitutionChangeSchema
} from '../controllers/institutionChangeController.js';
import { requireAuth, requireRoles } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';

const router = Router();

// Member submits change request
router.post(
  '/', 
  requireAuth, 
  validateBody(SubmitInstitutionChangeSchema), 
  submitInstitutionChangeRequest
);

// Member checks their own change request
router.get(
  '/my', 
  requireAuth, 
  getMyInstitutionChangeRequest
);

// Authorized personnel view change requests (scoped)
router.get(
  '/', 
  requireAuth, 
  requireRoles('SUPER_ADMIN', 'ADMIN', 'DIVISION_COORDINATOR', 'INSTITUTION_HEAD', 'INSTITUTION_MODERATOR'), 
  getInstitutionChangeRequests
);

// Super Admin & Division Coordinator review and approve/reject
router.patch(
  '/:id/review', 
  requireAuth, 
  requireRoles('SUPER_ADMIN', 'DIVISION_COORDINATOR'), 
  validateBody(ReviewInstitutionChangeSchema), 
  reviewInstitutionChangeRequest
);

export default router;
