import { Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth.js';
import { dataStore } from '../services/dataStore.js';
import { logAuditEvent } from '../services/auditService.js';

const BD_PHONE_REGEX = /^(\+?88)?01[3-9]\d{8}$/;

function normalizePhone(raw: string): string {
  const cleaned = raw.replace(/\D/g, '');
  if (cleaned.startsWith('8801')) {
    return cleaned.substring(2);
  }
  return cleaned;
}

export const SubmitPhoneChangeSchema = z.object({
  newPhone: z.string().regex(BD_PHONE_REGEX, 'সঠিক বাংলাদেশী মোবাইল নম্বর প্রদান করুন (যেমন: 017XXXXXXXX)'),
  reason: z.string().min(5, 'নম্বর পরিবর্তনের সুস্পষ্ট কারণ উল্লেখ করুন (কমপক্ষে ৫ অক্ষর)')
});

export const ReviewPhoneChangeSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  reviewNotes: z.string().optional()
});

/**
 * Submit Phone Number Change Request by any logged in member/donor/requester
 */
export async function submitPhoneChangeRequest(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'অননুমোদিত।' });
    return;
  }

  const { newPhone: rawNewPhone, reason } = req.body;
  const newPhone = normalizePhone(rawNewPhone);

  if (newPhone === req.user.phone) {
    res.status(400).json({
      success: false,
      message: 'আপনার বর্তমান নম্বর এবং অনুরোধকৃত নতুন নম্বর একই হতে পারে না।'
    });
    return;
  }

  const result = dataStore.createPhoneChangeRequest({
    userId: req.user.userId,
    newPhone,
    reason
  });

  if (!result.success) {
    res.status(400).json({ success: false, message: result.message });
    return;
  }

  await logAuditEvent({
    actorId: req.user.userId,
    actorRole: req.user.role,
    action: 'REQUEST_PHONE_CHANGE',
    targetType: 'User',
    targetId: req.user.userId,
    details: { newPhone, reason }
  });

  res.status(201).json({
    success: true,
    message: result.message,
    request: result.request
  });
}

/**
 * Get current user's active/pending phone change request
 */
export async function getMyPhoneChangeRequest(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'অননুমোদিত।' });
    return;
  }

  const pending = dataStore.getPendingPhoneChangeRequestForUser(req.user.userId);
  const allUserRequests = dataStore.getPhoneChangeRequests({ userId: req.user.userId });

  res.json({
    success: true,
    pendingRequest: pending,
    requests: allUserRequests
  });
}

/**
 * Get list of phone change requests scoped by role (Super Admin, Coordinator, Moderator)
 */
export async function getPhoneChangeRequests(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'অননুমোদিত।' });
    return;
  }

  const { status, division, institutionId } = req.query;

  let scopedDivision: string | undefined = division as string;
  let scopedInstitutionId: string | undefined = institutionId as string;

  if (req.user.role === 'INSTITUTION_MODERATOR') {
    scopedInstitutionId = req.user.assignedInstitution;
  } else if (req.user.role === 'DIVISION_COORDINATOR') {
    scopedDivision = req.user.assignedDivision;
  }

  const requests = dataStore.getPhoneChangeRequests({
    status: status as string,
    division: scopedDivision,
    institutionId: scopedInstitutionId
  });

  res.json({
    success: true,
    requests
  });
}

/**
 * Approve or Reject Phone Change Request
 */
export async function reviewPhoneChangeRequest(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'অননুমোদিত।' });
    return;
  }

  const { id } = req.params;
  const { status, reviewNotes } = req.body;

  // Find target request to verify role scope
  const targetReq = dataStore.phoneChangeRequests.find(r => r._id === id);
  if (!targetReq) {
    res.status(404).json({ success: false, message: 'আবেদনটি খুঁজে পাওয়া যায়নি।' });
    return;
  }

  // Scoping check
  if (req.user.role === 'INSTITUTION_MODERATOR') {
    if (targetReq.institutionId !== req.user.assignedInstitution) {
      res.status(403).json({
        success: false,
        message: 'অনধিকার চর্চা: আপনি কেবল আপনার নির্ধারিত প্রতিষ্ঠানের সদস্যের আবেদন পর্যালোচনা করতে পারেন।'
      });
      return;
    }
  } else if (req.user.role === 'DIVISION_COORDINATOR') {
    if (targetReq.division?.toLowerCase() !== req.user.assignedDivision?.toLowerCase()) {
      res.status(403).json({
        success: false,
        message: 'অনধিকার চর্চা: আপনি কেবল আপনার নির্ধারিত বিভাগের আবেদন পর্যালোচনা করতে পারেন।'
      });
      return;
    }
  }

  const result = dataStore.updatePhoneChangeRequest(
    id,
    status,
    {
      userId: req.user.userId,
      name: req.user.name,
      role: req.user.role
    },
    reviewNotes
  );

  if (!result.success) {
    res.status(400).json({ success: false, message: result.message });
    return;
  }

  await logAuditEvent({
    actorId: req.user.userId,
    actorRole: req.user.role,
    action: status === 'approved' ? 'APPROVE_PHONE_CHANGE' : 'REJECT_PHONE_CHANGE',
    targetType: 'PhoneChangeRequest',
    targetId: id,
    details: { targetUserId: targetReq.userId, newPhone: targetReq.newPhone, status, reviewNotes }
  });

  res.json({
    success: true,
    message: result.message,
    request: result.request
  });
}

