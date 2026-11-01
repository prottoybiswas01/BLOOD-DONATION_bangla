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
  searchScopedUser,
  manualCreateInstitution,
  UpdateRoleSchema,
  BlockUserSchema,
  UnblockUserSchema,
  AdminEditProfileSchema
} from '../controllers/adminController.js';
import { requireAuth, requireRoles } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';

const router = Router();

// Scoped Profile Search (Available to all authorized roles according to their scope)
router.get(
  '/users/scoped-search', 
  requireAuth, 
  requireRoles('SUPER_ADMIN', 'ADMIN', 'DIVISION_COORDINATOR', 'INSTITUTION_HEAD', 'INSTITUTION_MODERATOR'), 
  searchScopedUser
);

// Manual Institution Creation (Only Super Admin and Division Coordinator)
router.post(
  '/institutions/manual',
  requireAuth,
  requireRoles('SUPER_ADMIN', 'DIVISION_COORDINATOR'),
  manualCreateInstitution
);

// Routes accessible strictly by SUPER_ADMIN and ADMIN
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
