import { Router } from 'express';
import { 
  getAdminOverview, 
  getUsers, 
  updateUserRole, 
  toggleUserStatus, 
  updateInstitutionStatus, 
  getAuditLogs, 
  getContactAccessLogs,
  UpdateRoleSchema
} from '../controllers/adminController.js';
import { requireAuth, requireRoles } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';

const router = Router();

// All admin routes strictly require SUPER_ADMIN role
router.use(requireAuth, requireRoles('SUPER_ADMIN'));

router.get('/overview', getAdminOverview);
router.get('/users', getUsers);
router.patch('/users/:id/role', validateBody(UpdateRoleSchema), updateUserRole);
router.patch('/users/:id/status', toggleUserStatus);
router.patch('/institutions/:id/status', updateInstitutionStatus);
router.get('/audit-logs', getAuditLogs);
router.get('/contact-access-logs', getContactAccessLogs);

export default router;
