import { Router } from 'express';
import { 
  createReport, 
  getReports, 
  resolveReport,
  CreateReportSchema,
  ResolveReportSchema
} from '../controllers/reportController.js';
import { requireAuth, requireRoles } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';

const router = Router();

router.post('/', requireAuth, validateBody(CreateReportSchema), createReport);
router.get(
  '/', 
  requireAuth, 
  requireRoles('SUPER_ADMIN', 'DIVISION_COORDINATOR', 'INSTITUTION_MODERATOR'), 
  getReports
);
router.patch(
  '/:id/resolve', 
  requireAuth, 
  requireRoles('SUPER_ADMIN', 'DIVISION_COORDINATOR'), 
  validateBody(ResolveReportSchema), 
  resolveReport
);

export default router;

