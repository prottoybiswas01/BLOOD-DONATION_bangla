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

// Logged-in submission of institution registration application
router.post('/', requireAuth, validateBody(SubmitInstitutionRequestSchema), submitInstitutionRequest);

// List applications: Super Admin, Admin (read only), Coordinator (division)
router.get('/', requireAuth, requireRoles('SUPER_ADMIN', 'ADMIN', 'DIVISION_COORDINATOR'), getInstitutionRequests);

// Review decision (Approve/Reject with reason): Super Admin, Admin, or Division Coordinator
router.patch(
  '/:id/review', 
  requireAuth, 
  requireRoles('SUPER_ADMIN', 'ADMIN', 'DIVISION_COORDINATOR'), 
  validateBody(ReviewInstitutionRequestSchema), 
  reviewInstitutionRequest
);

export default router;

