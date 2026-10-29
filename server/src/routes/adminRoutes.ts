import { Router } from 'express';
import { 
  getAdminOverview, 
  getUsers, 
  getUserById,
  editUserProfileByAdmin,
  updateUserRole, 
  blockUserAccount,
  unblockUserAccount,
  getBlockedAccounts,
  getAccountStatusHistories,
  updateInstitutionStatus, 
  getAuditLogs, 
  getContactAccessLogs,
  UpdateRoleSchema,
  BlockUserSchema,
  UnblockUserSchema,
  AdminEditProfileSchema
} from '../controllers/adminController.js';
import { requireAuth, requireRoles } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';

const router = Router();

// Routes accessible by SUPER_ADMIN and ADMIN
router.use(requireAuth, requireRoles('SUPER_ADMIN', 'ADMIN'));

router.get('/overview', getAdminOverview);
router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.patch('/users/:id/profile', validateBody(AdminEditProfileSchema), editUserProfileByAdmin);
router.patch('/users/:id/role', validateBody(UpdateRoleSchema), updateUserRole);
router.post('/users/:id/block', validateBody(BlockUserSchema), blockUserAccount);
router.post('/users/:id/unblock', validateBody(UnblockUserSchema), unblockUserAccount);
router.get('/blocked-users', getBlockedAccounts);
router.get('/status-history', getAccountStatusHistories);
router.patch('/institutions/:id/status', updateInstitutionStatus);
router.get('/audit-logs', getAuditLogs);
router.get('/contact-access-logs', getContactAccessLogs);

export default router;
