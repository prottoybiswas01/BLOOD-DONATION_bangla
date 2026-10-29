import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { dataStore } from '../services/dataStore.js';

export async function getModeratorActivities(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'অননুমোদিত।' });
    return;
  }

  const { actorId, action, institutionScope } = req.query;
  const divisionScope = req.user.role === 'DIVISION_COORDINATOR'
    ? req.user.assignedDivision
    : (req.query.divisionScope as string);

  const activities = dataStore.getModeratorActivities({
    actorId: actorId as string,
    action: action as string,
    divisionScope,
    institutionScope: req.user.role === 'INSTITUTION_MODERATOR' ? req.user.assignedInstitution : (institutionScope as string)
  });

  res.json({
    success: true,
    activities
  });
}

export async function getDivisionModeratorsSummary(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'অননুমোদিত।' });
    return;
  }

  const division = req.user.role === 'DIVISION_COORDINATOR'
    ? req.user.assignedDivision
    : ((req.query.division as string) || 'dhaka');

  if (!division) {
    res.status(400).json({ success: false, message: 'বিভাগ নির্বাচন আবশ্যক।' });
    return;
  }

  const summary = dataStore.getModeratorsUnderDivision(division);

  res.json({
    success: true,
    division,
    moderators: summary
  });
}

