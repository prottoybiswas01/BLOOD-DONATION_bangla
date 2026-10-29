import { Router } from 'express';
import { 
  getLocations, 
  getDistrictsByDivision, 
  getUpazilasByDistrict 
} from '../controllers/locationController.js';

const router = Router();

router.get('/', getLocations);
router.get('/divisions/:divisionId/districts', getDistrictsByDivision);
router.get('/divisions/:divisionId/districts/:districtId/upazilas', getUpazilasByDistrict);

export default router;
