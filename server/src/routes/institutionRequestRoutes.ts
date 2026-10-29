import { Router } from 'express';
import { 
  submitInstitutionRequest, 
  getInstitutionRequests, 
  reviewInstitutionRequest,
  SubmitInstitutionRequestSchema,
  ReviewInstitutionRequestSchema
} from '../controllers/institutionRequestController.js';
import { requireAuth, requireRoles } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';

const router = Router();

// Public submission of institution registration application
router.post('/', validateBody(SubmitInstitutionRequestSchema), submitInstitutionRequest);

// List applications: Super Admin, Admin (read only), Coordinator (division)
router.get('/', requireAuth, requireRoles('SUPER_ADMIN', 'ADMIN', 'DIVISION_COORDINATOR'), getInstitutionRequests);

// Review decision (Approve/Reject with reason): strictly Division Coordinator or Super Admin
router.patch(
  '/:id/review', 
  requireAuth, 
  requireRoles('SUPER_ADMIN', 'DIVISION_COORDINATOR', 'ADMIN'), // Admin will be rejected in controller with specific message
  validateBody(ReviewInstitutionRequestSchema), 
  reviewInstitutionRequest
);

export default router;
