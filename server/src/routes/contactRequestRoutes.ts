import { Router } from 'express';
import { 
  submitContactRequest, 
  getContactRequests, 
  updateContactRequestStatus,
  CreateContactRequestSchema,
  UpdateContactRequestSchema
} from '../controllers/contactRequestController.js';
import { requireAuth, requireRoles } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';

const router = Router();

// Submit contact request for an institution's donor pool
router.post('/', requireAuth, validateBody(CreateContactRequestSchema), submitContactRequest);

// List contact requests (Moderators, Coordinators, Admins)
router.get('/', requireAuth, requireRoles('INSTITUTION_MODERATOR', 'DIVISION_COORDINATOR', 'ADMIN', 'SUPER_ADMIN'), getContactRequests);

// Moderator updates status / marks handled
router.patch(
  '/:id/status', 
  requireAuth, 
  requireRoles('INSTITUTION_MODERATOR', 'SUPER_ADMIN', 'DIVISION_COORDINATOR'), 
  validateBody(UpdateContactRequestSchema), 
  updateContactRequestStatus
);

export default router;

