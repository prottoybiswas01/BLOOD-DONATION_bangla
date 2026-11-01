import { Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth.js';
import { dataStore } from '../services/dataStore.js';
import { logAuditEvent } from '../services/auditService.js';

export const SubmitInstitutionChangeSchema = z.object({
  targetInstitutionId: z.string().min(1, 'শিক্ষা প্রতিষ্ঠান নির্বাচন করুন'),
  studentOrStaffId: z.string().optional(),
  department: z.string().optional(),
  reason: z.string().min(5, 'প্রতিষ্ঠান পরিবর্তনের কারণ কমপক্ষে ৫ অক্ষরে উল্লেখ করুন')
});

export const ReviewInstitutionChangeSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  decisionReason: z.string().min(5, 'অনুমোদন বা বাতিলের কারণ কমপক্ষে ৫ অক্ষরে উল্লেখ করুন')
});

export async function submitInstitutionChangeRequest(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'অননুমোদিত।' });
    return;
  }

  const { targetInstitutionId, studentOrStaffId, department, reason } = req.body;
  const result = dataStore.createInstitutionChangeRequest({
    userId: req.user.userId,
    targetInstitutionId,
    studentOrStaffId,
    department,
    reason
  });

  if (!result.success) {
    res.status(400).json(result);
    return;
  }

  await logAuditEvent({
    actorId: req.user.userId,
    actorRole: req.user.role,
    action: 'INSTITUTION_CHANGE_REQUESTED',
    targetType: 'InstitutionChangeRequest',
    targetId: targetInstitutionId,
    details: { studentOrStaffId, department, reason }
  });

  res.status(201).json(result);
}

export async function getInstitutionChangeRequests(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'অননুমোদিত।' });
    return;
  }

  const user = dataStore.findUserById(req.user.userId);
  if (!user) {
    res.status(401).json({ success: false, message: 'ব্যবহারকারী অ্যাকাউন্ট পাওয়া যায়নি।' });
    return;
  }

  const { status } = req.query;
  const requests = dataStore.getInstitutionChangeRequests({
    role: user.role,
    division: user.assignedDivision,
    institutionId: user.assignedInstitution,
    status: status as string
  });

  res.json({
    success: true,
    requests,
    total: requests.length
  });
}

export async function reviewInstitutionChangeRequest(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'অননুমোদিত।' });
    return;
  }

  const reviewer = dataStore.findUserById(req.user.userId);
  if (!reviewer) {
    res.status(401).json({ success: false, message: 'ব্যবহারকারী অ্যাকাউন্ট পাওয়া যায়নি।' });
    return;
  }

  const { id } = req.params;
  const { status, decisionReason } = req.body;

  const result = dataStore.reviewInstitutionChangeRequest(id, reviewer, status, decisionReason);
  if (!result.success) {
    res.status(403).json(result);
    return;
  }

  await logAuditEvent({
    actorId: reviewer._id,
    actorRole: reviewer.role,
    action: `INSTITUTION_CHANGE_${status.toUpperCase()}`,
    targetType: 'InstitutionChangeRequest',
    targetId: id,
    details: { decisionReason }
  });

  res.json(result);
}

export async function getMyInstitutionChangeRequest(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'অননুমোদিত।' });
    return;
  }

  const requests = dataStore.institutionChangeRequests.filter(r => r.userId === req.user?.userId);
  const pendingRequest = requests.find(r => r.status === 'pending');

  res.json({
    success: true,
    pendingRequest,
    history: requests
  });
}
