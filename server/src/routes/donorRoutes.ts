import { Router } from 'express';
import { 
  searchDonors, 
  getDonorById, 
  revealDonorContact, 
  getMyDonorProfile, 
  updateMyDonorProfile,
  activateMyDonorProfile,
  recordDonation,
  UpdateDonorProfileSchema,
  ActivateDonorProfileSchema,
  RevealContactSchema
} from '../controllers/donorController.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { contactRevealRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Authenticated donor dashboard endpoints (Must precede parameterized /:id route)
router.get(['/me', '/dashboard'], requireAuth, getMyDonorProfile);
router.patch(['/me', '/profile'], requireAuth, validateBody(UpdateDonorProfileSchema), updateMyDonorProfile);
router.put(['/me', '/profile'], requireAuth, validateBody(UpdateDonorProfileSchema), updateMyDonorProfile);
router.post(['/me/activate', '/activate'], requireAuth, validateBody(ActivateDonorProfileSchema), activateMyDonorProfile);
router.post('/record-donation', requireAuth, recordDonation);

// Public search (no phone numbers exposed!)
router.get(['/', '/search'], searchDonors);
router.get(['/profile/:id', '/:id'], getDonorById);

// Controlled contact reveal (Authenticated, rate-limited, logged, consent-checked)
router.post(
  ['/reveal-contact/:id', '/:id/reveal-contact'], 
  requireAuth, 
  contactRevealRateLimiter, 
  validateBody(RevealContactSchema), 
  revealDonorContact
);

export default router;

