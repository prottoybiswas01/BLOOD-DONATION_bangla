import { Request, Response } from 'express';
import { BANGLADESH_DIVISIONS, BLOOD_GROUPS } from '../data/bangladeshLocations.js';

export function getLocations(req: Request, res: Response): void {
  res.json({
    success: true,
    divisions: BANGLADESH_DIVISIONS,
    bloodGroups: BLOOD_GROUPS
  });
}

export function getDistrictsByDivision(req: Request, res: Response): void {
  const { divisionId } = req.params;
  const division = BANGLADESH_DIVISIONS.find(d => d.id.toLowerCase() === divisionId.toLowerCase());

  if (!division) {
    res.status(404).json({ success: false, message: 'বিভাগ খুঁজে পাওয়া যায়নি।' });
    return;
  }

  res.json({
    success: true,
    districts: division.districts
  });
}

export function getUpazilasByDistrict(req: Request, res: Response): void {
  const { divisionId, districtId } = req.params;
  const division = BANGLADESH_DIVISIONS.find(d => d.id.toLowerCase() === divisionId.toLowerCase());
  if (!division) {
    res.status(404).json({ success: false, message: 'বিভাগ খুঁজে পাওয়া যায়নি।' });
    return;
  }

  const district = division.districts.find(d => d.id.toLowerCase() === districtId.toLowerCase());
  if (!district) {
    res.status(404).json({ success: false, message: 'জেলা খুঁজে পাওয়া যায়নি।' });
    return;
  }

  res.json({
    success: true,
    upazilas: district.upazilas
  });
}

