import { Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth.js';
import { dataStore } from '../services/dataStore.js';
import { logAuditEvent } from '../services/auditService.js';
import { BloodGroup } from '../data/bangladeshLocations.js';

export const CreateContactRequestSchema = z.object({
  institutionId: z.string().min(1, 'প্রতিষ্ঠান আবশ্যক'),
  targetBloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
  patientName: z.string().min(2, 'রোগীর নাম আবশ্যক'),
  hospitalName: z.string().min(3, 'হাসপাতালের নাম আবশ্যক'),
  unitsRequired: z.number().int().min(1).default(1),
  urgency: z.enum(['emergency', 'urgent', 'standard']).default('emergency'),
  reason: z.string().min(5, 'রক্তের কারণ বিস্তারিত লিখুন')
});

export const UpdateContactRequestSchema = z.object({
  status: z.enum(['pending', 'in_progress', 'fulfilled', 'cancelled']),
  moderatorNotes: z.string().optional()
});

export async function submitContactRequest(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'অনুরোধ পাঠাতে লগইন আবশ্যক।' });
    return;
  }

  const data = req.body;
  const newContactReq = dataStore.createContactRequest({
    requesterId: req.user.userId,
    requesterName: req.user.name,
    requesterPhone: req.user.phone,
    institutionId: data.institutionId,
    targetBloodGroup: data.targetBloodGroup as BloodGroup,
    patientName: data.patientName,
    hospitalName: data.hospitalName,
    unitsRequired: data.unitsRequired,
    urgency: data.urgency,
    reason: data.reason
  });

  await logAuditEvent({
    actorId: req.user.userId,
    actorRole: req.user.role,
    action: 'CREATE_INSTITUTION_CONTACT_REQUEST',
    targetType: 'ContactRequest',
    targetId: newContactReq._id,
    institutionScope: data.institutionId,
    details: { targetBloodGroup: data.targetBloodGroup, hospital: data.hospitalName }
  });

  res.status(201).json({
    success: true,
    message: 'প্রতিষ্ঠানের রক্তদান শাখায় আপনার অনুরোধটি সফলভাবে পৌঁছেছে। দায়িত্বপ্রাপ্ত মডারেটর দ্রুত রক্তদাতাদের সমন্বয় করবেন।',
    contactRequest: newContactReq
  });
}

export async function getContactRequests(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'অননুমোদিত।' });
    return;
  }

  const { status, institutionId } = req.query;
  let targetInstitutionId = institutionId as string;

  if (req.user.role === 'INSTITUTION_MODERATOR') {
    targetInstitutionId = req.user.assignedInstitution || targetInstitutionId;
  }

  const requests = dataStore.getContactRequests({
    institutionId: targetInstitutionId,
    status: status as string
  });

  res.json({
    success: true,
    requests
  });
}

export async function updateContactRequestStatus(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'অননুমোদিত।' });
    return;
  }

  const { id } = req.params;
  const { status, moderatorNotes } = req.body;

  const updated = dataStore.updateContactRequest(id, {
    status,
    moderatorNotes,
    handledAt: new Date()
  });

  if (!updated) {
    res.status(404).json({ success: false, message: 'অনুরোধটি পাওয়া যায়নি।' });
    return;
  }

  // Log in moderator activity
  dataStore.logModeratorActivity({
    actorId: req.user.userId,
    actorName: req.user.name,
    actorRole: req.user.role,
    action: 'CONTACT_REQUEST_HANDLED',
    targetRecordId: id,
    targetRecordType: 'ContactRequest',
    institutionScope: updated.institutionId,
    reason: moderatorNotes,
    result: status
  });

  res.json({
    success: true,
    message: 'যোগাযোগের অনুরোধের অবস্থা সফলভাবে হালনাগাদ হয়েছে।',
    contactRequest: updated
  });
}
