import { Request, Response } from 'express';
import { z } from 'zod';
import { dataStore } from '../services/dataStore.js';
import { AuthRequest } from '../middleware/auth.js';
import { logAuditEvent } from '../services/auditService.js';
import { isDatabaseConnected } from '../config/db.js';
import { BloodRequestModel } from '../models/BloodRequest.js';

const BD_PHONE_REGEX = /^(\+?88)?01[3-9]\d{8}$/;

export const CreateBloodRequestSchema = z.object({
  patientName: z.string().min(2, 'রোগীর নাম আবশ্যক').max(80),
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
  unitsRequired: z.union([z.number(), z.string()]).transform(v => typeof v === 'string' ? parseInt(v, 10) || 1 : v),
  hospitalName: z.string().min(2, 'হাসপাতালের নাম আবশ্যক'),
  hospitalAddress: z.string().optional().or(z.literal('')),
  division: z.string().min(1, 'বিভাগ নির্বাচন করুন'),
  district: z.string().min(1, 'জেলা নির্বাচন করুন'),
  upazila: z.string().optional().or(z.literal('')),
  requiredDate: z.string().optional().or(z.literal('')),
  requiredWithin: z.string().optional(),
  urgencyLevel: z.enum(['emergency', 'critical', 'urgent', 'standard', 'normal']).default('urgent'),
  reason: z.string().optional().or(z.literal('')),
  contactPersonName: z.string().optional(),
  contactNumber: z.string().regex(BD_PHONE_REGEX, 'সঠিক যোগাযোগ নম্বর দিন'),
  alternativeContactNumber: z.string().optional().or(z.literal('')),
  additionalNotes: z.string().optional(),
  consentForPublicShare: z.boolean().default(true).optional(),
  institutionId: z.string().optional()
});

export const UpdateRequestStatusSchema = z.object({
  status: z.enum(['open', 'partially_fulfilled', 'fulfilled', 'cancelled']).optional(),
  unitsFulfilled: z.number().int().min(0).optional(),
  moderationNotes: z.string().optional(),
  notes: z.string().optional()
});

export async function searchRequests(req: Request, res: Response): Promise<void> {
  const { bloodGroup, division, district, upazila, status, urgencyLevel, page, limit } = req.query;

  const result = await dataStore.searchBloodRequests({
    bloodGroup: bloodGroup as string,
    division: division as string,
    district: district as string,
    upazila: upazila as string,
    status: status as string,
    urgencyLevel: urgencyLevel as string,
    page: page ? parseInt(page as string, 10) : 1,
    limit: limit ? parseInt(limit as string, 10) : 10
  });

  const enhancedRequests = result.requests.map(r => {
    const remaining = Math.max(0, r.unitsRequired - (r.unitsFulfilled || 0));
    const publicId = r.publicId || r._id;
    return {
      ...r,
      publicId,
      unitsRemaining: remaining,
      canonicalUrl: `https://blood-donationbangla.vercel.app/blood-request/${publicId}`
    };
  });

  res.json({
    success: true,
    ...result,
    requests: enhancedRequests
  });
}

export async function getRequestById(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const request = await dataStore.findBloodRequestById(id);

  if (!request) {
    res.status(404).json({
      success: false,
      message: 'রক্তের অনুরোধটি খুঁজে পাওয়া যায়নি।'
    });
    return;
  }

  // Check if expired
  if ((request.status === 'open' || request.status === 'partially_fulfilled') && new Date(request.expiresAt) < new Date()) {
    request.status = 'expired';
  }

  const requester = await dataStore.findUserById(request.requesterId);
  const institution = request.institutionId ? await dataStore.findInstitutionById(request.institutionId) : undefined;

  const unitsRemaining = Math.max(0, request.unitsRequired - (request.unitsFulfilled || 0));
  const publicId = request.publicId || request._id;
  const canonicalUrl = `https://blood-donationbangla.vercel.app/blood-request/${publicId}`;

  let statusMessage = '';
  if (request.status === 'fulfilled') {
    statusMessage = 'এই রোগীর প্রয়োজনীয় রক্ত সংগ্রহ সম্পন্ন হয়েছে। সকল রক্তদাতা ও সহযোগীদের আন্তরিক ধন্যবাদ।';
  } else if (request.status === 'cancelled') {
    statusMessage = 'এই রক্তের আবেদনটি প্রত্যাহার বা বাতিল করা হয়েছে।';
  } else if (request.status === 'expired') {
    statusMessage = 'এই রক্তের আবেদনের নির্ধারিত সময়সীমা অতিক্রান্ত হয়েছে।';
  } else if (request.status === 'partially_fulfilled') {
    statusMessage = `জরুরি আবেদন: ${request.unitsFulfilled} ব্যাগ রক্ত সংগৃহীত হয়েছে, এখনও ${unitsRemaining} ব্যাগ রক্ত অতি প্রয়োজন।`;
  } else {
    statusMessage = `জরুরি রক্তের প্রয়োজন: অবিলম্বে ${request.unitsRequired} ব্যাগ ${request.bloodGroup} রক্ত প্রয়োজন।`;
  }

  res.json({
    success: true,
    bloodRequest: {
      ...request,
      publicId,
      canonicalUrl,
      unitsRemaining,
      statusMessage,
      isFulfilled: request.status === 'fulfilled',
      requesterName: requester?.name || 'ব্যবহারকারী',
      institutionName: institution?.nameBn || institution?.name
    }
  });
}

export async function createRequest(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'অনুরোধ প্রকাশের জন্য লগইন করা আবশ্যক।'
    });
    return;
  }

  const data = req.body;

  // Accidental duplicate submission protection (within 2 minutes)
  const recentDuplicate = dataStore.bloodRequests.find(r => 
    r.requesterId === req.user?.userId &&
    r.patientName.toLowerCase().trim() === data.patientName.toLowerCase().trim() &&
    r.hospitalName.toLowerCase().trim() === data.hospitalName.toLowerCase().trim() &&
    (r.status === 'open' || r.status === 'partially_fulfilled') &&
    (Date.now() - new Date(r.createdAt).getTime() < 120000)
  );

  if (recentDuplicate) {
    res.status(409).json({
      success: false,
      message: 'এই রোগীর জন্য মাত্র কিছুক্ষণ আগেই একটি সক্রিয় আবেদন পোস্ট করা হয়েছে। অতিরিক্ত ডুপ্লিকেট আবেদন তৈরি করা থেকে বিরত থাকুন।',
      existingRequestId: recentDuplicate.publicId || recentDuplicate._id
    });
    return;
  }

  const reqDate = data.requiredDate ? new Date(data.requiredDate) : new Date();
  const expiresAt = new Date(reqDate.getTime() + 86400000 * 3); // expires 3 days after required date

  const randPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  const timePart = Date.now().toString(36).toUpperCase().slice(-4);
  const publicId = `BR-${timePart}-${randPart}`;

  // Normalize urgency level
  let urgencyLevel: 'emergency' | 'urgent' | 'standard' = 'urgent';
  if (data.urgencyLevel === 'critical' || data.urgencyLevel === 'emergency') {
    urgencyLevel = 'emergency';
  } else if (data.urgencyLevel === 'normal' || data.urgencyLevel === 'standard') {
    urgencyLevel = 'standard';
  } else {
    urgencyLevel = 'urgent';
  }

  const hospitalAddress = (data.hospitalAddress && data.hospitalAddress.trim().length > 0)
    ? data.hospitalAddress.trim()
    : `${data.hospitalName.trim()}, ${data.district}`;
  const upazila = (data.upazila && data.upazila.trim().length > 0) ? data.upazila.trim() : data.district;
  const reason = (data.reason && data.reason.trim().length > 0)
    ? data.reason.trim()
    : `${data.patientName.trim()}-এর জন্য জরুরি ${data.bloodGroup} রক্তের প্রয়োজন।`;

  const newRequest = await dataStore.createBloodRequest({
    publicId,
    requesterId: req.user.userId,
    patientName: data.patientName.trim(),
    bloodGroup: data.bloodGroup,
    unitsRequired: data.unitsRequired,
    unitsFulfilled: 0,
    hospitalName: data.hospitalName.trim(),
    hospitalAddress,
    division: data.division,
    district: data.district,
    upazila,
    requiredDate: reqDate,
    requiredWithin: data.requiredWithin || undefined,
    urgencyLevel,
    reason,
    contactPersonName: data.contactPersonName ? data.contactPersonName.trim() : undefined,
    contactNumber: data.contactNumber.trim(),
    alternativeContactNumber: data.alternativeContactNumber ? data.alternativeContactNumber.trim() : undefined,
    additionalNotes: data.additionalNotes ? data.additionalNotes.trim() : undefined,
    consentForPublicShare: data.consentForPublicShare ?? true,
    institutionId: data.institutionId || undefined,
    status: 'open',
    expiresAt
  });

  await logAuditEvent({
    actorId: req.user.userId,
    actorRole: req.user.role,
    action: 'CREATE_BLOOD_REQUEST',
    targetType: 'BloodRequest',
    targetId: newRequest._id,
    divisionScope: newRequest.division,
    details: { 
      publicId: newRequest.publicId,
      bloodGroup: newRequest.bloodGroup, 
      hospital: newRequest.hospitalName,
      unitsRequired: newRequest.unitsRequired 
    }
  });

  const canonicalUrl = `https://blood-donationbangla.vercel.app/blood-request/${newRequest.publicId}`;

  res.status(201).json({
    success: true,
    message: 'রক্তের অনুরোধ এবং ডিজিটাল কার্ড সফলভাবে তৈরি হয়েছে।',
    bloodRequest: {
      ...newRequest,
      unitsRemaining: newRequest.unitsRequired,
      canonicalUrl
    },
    data: {
      ...newRequest,
      unitsRemaining: newRequest.unitsRequired,
      canonicalUrl
    }
  });
}

export async function updateRequestStatus(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'অননুমোদিত।' });
    return;
  }

  const { id } = req.params;
  const { status, unitsFulfilled, moderationNotes, notes } = req.body;

  const request = await dataStore.findBloodRequestById(id);
  if (!request) {
    res.status(404).json({ success: false, message: 'রক্তের অনুরোধ পাওয়া যায়নি।' });
    return;
  }

  // Authorization check: Only the creator, SUPER_ADMIN, or Division Coordinator in same division can modify
  const isOwner = request.requesterId === req.user.userId;
  const isSuperAdmin = req.user.role === 'SUPER_ADMIN';
  const isDivisionCoordinator = req.user.role === 'DIVISION_COORDINATOR' && 
    req.user.assignedDivision?.toLowerCase() === request.division.toLowerCase();

  if (!isOwner && !isSuperAdmin && !isDivisionCoordinator) {
    res.status(403).json({
      success: false,
      message: 'আপনার এই অনুরোধটি পরিবর্তন করার অনুমতি নেই।'
    });
    return;
  }

  const updatePayload: any = {};

  // Handle Received / Fulfilled Units Progress
  if (unitsFulfilled !== undefined) {
    const safeUnits = Math.max(0, Math.min(unitsFulfilled, request.unitsRequired));
    updatePayload.unitsFulfilled = safeUnits;

    // Automatic status adjustment based on units
    if (safeUnits >= request.unitsRequired) {
      updatePayload.status = status || 'fulfilled';
    } else if (safeUnits > 0) {
      updatePayload.status = status === 'cancelled' ? 'cancelled' : 'partially_fulfilled';
    } else {
      updatePayload.status = status || request.status;
    }
  } else if (status) {
    updatePayload.status = status;
    if (status === 'fulfilled') {
      updatePayload.unitsFulfilled = request.unitsRequired;
    }
  }

  // Only administrative personnel can set moderation notes
  if (moderationNotes && (isSuperAdmin || isDivisionCoordinator)) {
    updatePayload.moderationNotes = moderationNotes;
  }

  // Append to status history
  const historyEntry = {
    status: updatePayload.status || request.status,
    unitsFulfilled: updatePayload.unitsFulfilled !== undefined ? updatePayload.unitsFulfilled : request.unitsFulfilled,
    changedBy: req.user.userId,
    changedAt: new Date(),
    notes: notes || moderationNotes || `স্ট্যাটাস আপডেট: ${updatePayload.status || request.status}`
  };

  const currentHistory = request.statusHistory || [];
  updatePayload.statusHistory = [...currentHistory, historyEntry];

  const updated = await dataStore.updateBloodRequest(request._id, updatePayload);

  await logAuditEvent({
    actorId: req.user.userId,
    actorRole: req.user.role,
    action: 'UPDATE_BLOOD_REQUEST_STATUS',
    targetType: 'BloodRequest',
    targetId: request._id,
    divisionScope: request.division,
    details: { 
      oldStatus: request.status, 
      newStatus: updatePayload.status, 
      unitsFulfilled: updatePayload.unitsFulfilled 
    }
  });

  const unitsRemaining = Math.max(0, (updated?.unitsRequired || request.unitsRequired) - (updated?.unitsFulfilled || 0));
  const publicId = updated?.publicId || request.publicId || request._id;
  const canonicalUrl = `https://blood-donationbangla.vercel.app/blood-request/${publicId}`;

  res.json({
    success: true,
    message: updated?.status === 'fulfilled' 
      ? 'রক্তের অনুরোধ সফলভাবে সম্পন্ন (Fulfilled) হিসেবে চিহ্নিত করা হয়েছে।' 
      : 'অনুরোধের অগ্রগতি সফলভাবে সংরক্ষিত হয়েছে।',
    bloodRequest: {
      ...updated,
      publicId,
      canonicalUrl,
      unitsRemaining
    }
  });
}

export async function getMyRequests(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'অননুমোদিত।' });
    return;
  }

  const requests = dataStore.bloodRequests
    .filter(r => r.requesterId === req.user?.userId)
    .map(r => {
      const publicId = r.publicId || r._id;
      return {
        ...r,
        publicId,
        unitsRemaining: Math.max(0, r.unitsRequired - (r.unitsFulfilled || 0)),
        canonicalUrl: `https://blood-donationbangla.vercel.app/blood-request/${publicId}`
      };
    });

  res.json({
    success: true,
    requests
  });
}
