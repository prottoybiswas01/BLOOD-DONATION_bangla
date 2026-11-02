import { Router } from 'express';
import { 
  searchRequests, 
  getRequestById, 
  createRequest, 
  updateRequestStatus, 
  getMyRequests,
  CreateBloodRequestSchema,
  UpdateRequestStatusSchema
} from '../controllers/requestController.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';

const router = Router();

router.get(['/', '/search'], searchRequests);
router.get(['/my-requests', '/dashboard'], requireAuth, getMyRequests);
router.get('/:id', getRequestById);
router.post('/', requireAuth, validateBody(CreateBloodRequestSchema), createRequest);
router.patch('/:id/status', requireAuth, validateBody(UpdateRequestStatusSchema), updateRequestStatus);

export default router;

