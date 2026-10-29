import { Router } from 'express';
import { 
  requestOtp, 
  verifyOtp, 
  register, 
  login, 
  getMe,
  changeFirstLoginPassword,
  RequestOtpSchema,
  VerifyOtpSchema,
  RegisterSchema,
  LoginSchema,
  ChangeFirstLoginPasswordSchema
} from '../controllers/authController.js';
import { validateBody } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/request-otp', authRateLimiter, validateBody(RequestOtpSchema), requestOtp);
router.post('/verify-otp', authRateLimiter, validateBody(VerifyOtpSchema), verifyOtp);
router.post('/register', authRateLimiter, validateBody(RegisterSchema), register);
router.post('/login', authRateLimiter, validateBody(LoginSchema), login);
router.get('/me', requireAuth, getMe);
router.post('/change-first-login-password', requireAuth, validateBody(ChangeFirstLoginPasswordSchema), changeFirstLoginPassword);

export default router;
