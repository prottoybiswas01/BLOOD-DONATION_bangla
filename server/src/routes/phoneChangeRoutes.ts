import { Router } from 'express';
import { 
  submitPhoneChangeRequest, 
  getMyPhoneChangeRequest, 
  getPhoneChangeRequests, 
  reviewPhoneChangeRequest,
  SubmitPhoneChangeSchema,
  ReviewPhoneChangeSchema
} from '../controllers/phoneChangeController.js';
import { requireAuth, requireRoles } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';

const router = Router();

// Member self-submit and check status
router.post('/request', requireAuth, validateBody(SubmitPhoneChangeSchema), submitPhoneChangeRequest);
router.get('/my-request', requireAuth, getMyPhoneChangeRequest);

// Management routes for Moderator, Coordinator, Admin, Super Admin
router.get(
  '/requests', 
  requireAuth, 
  requireRoles('INSTITUTION_MODERATOR', 'DIVISION_COORDINATOR', 'ADMIN', 'SUPER_ADMIN'), 
  getPhoneChangeRequests
);

router.patch(
  '/requests/:id', 
  requireAuth, 
  requireRoles('INSTITUTION_MODERATOR', 'DIVISION_COORDINATOR', 'ADMIN', 'SUPER_ADMIN'), 
  validateBody(ReviewPhoneChangeSchema), 
  reviewPhoneChangeRequest
);

export default router;

