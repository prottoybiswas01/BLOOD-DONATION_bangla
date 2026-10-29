import { Request, Response } from 'express';
import { z } from 'zod';
import { dataStore } from '../services/dataStore.js';
import { AuthRequest } from '../middleware/auth.js';
import { logAuditEvent } from '../services/auditService.js';

const BD_PHONE_REGEX = /^(\+?88)?01[3-9]\d{8}$/;

export const CreateBloodRequestSchema = z.object({
  patientName: z.string().min(2, 'রোগীর নাম আবশ্যক').max(80),
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
  unitsRequired: z.number().int().min(1, 'কমপক্ষে ১ ব্যাগ রক্ত প্রয়োজন').max(20),
  hospitalName: z.string().min(3, 'হাসপাতালের নাম আবশ্যক'),
  hospitalAddress: z.string().min(5, 'হাসপাতালের সুনির্দিষ্ট ঠিকানা আবশ্যক'),
  division: z.string().min(1, 'বিভাগ নির্বাচন করুন'),
  district: z.string().min(1, 'জেলা নির্বাচন করুন'),
  upazila: z.string().min(1, 'উপজেলা/থানা নির্বাচন করুন'),
  requiredDate: z.string().min(1, 'রক্তদানের তারিখ আবশ্যক'),
  urgencyLevel: z.enum(['emergency', 'urgent', 'standard']).default('emergency'),
  reason: z.string().min(5, 'রক্তের কারণ সংক্ষেপে লিখুন'),
  contactNumber: z.string().regex(BD_PHONE_REGEX, 'সঠিক যোগাযোগ নম্বর দিন'),
  alternativeContactNumber: z.string().optional().or(z.literal('')),
  institutionId: z.string().optional()
});

export const UpdateRequestStatusSchema = z.object({
  status: z.enum(['open', 'partially_fulfilled', 'fulfilled', 'cancelled']),
  unitsFulfilled: z.number().int().min(0).optional(),
  moderationNotes: z.string().optional()
});

export async function searchRequests(req: Request, res: Response): Promise<void> {
  const { bloodGroup, division, district, upazila, status, urgencyLevel, page, limit } = req.query;

  const result = dataStore.searchBloodRequests({
    bloodGroup: bloodGroup as string,
    division: division as string,
    district: district as string,
    upazila: upazila as string,
    status: status as string,
    urgencyLevel: urgencyLevel as string,
    page: page ? parseInt(page as string, 10) : 1,
    limit: limit ? parseInt(limit as string, 10) : 10
  });

  res.json({
    success: true,
    ...result
  });
}

export async function getRequestById(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const request = dataStore.findBloodRequestById(id);

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

  const requester = dataStore.findUserById(request.requesterId);
  const institution = request.institutionId ? dataStore.findInstitutionById(request.institutionId) : undefined;

  res.json({
    success: true,
    bloodRequest: {
      ...request,
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
  const reqDate = new Date(data.requiredDate);
  const expiresAt = new Date(reqDate.getTime() + 86400000 * 2); // expires 2 days after required date

  const newRequest = dataStore.createBloodRequest({
    requesterId: req.user.userId,
    patientName: data.patientName,
    bloodGroup: data.bloodGroup,
    unitsRequired: data.unitsRequired,
    unitsFulfilled: 0,
    hospitalName: data.hospitalName,
    hospitalAddress: data.hospitalAddress,
    division: data.division,
    district: data.district,
    upazila: data.upazila,
    requiredDate: reqDate,
    urgencyLevel: data.urgencyLevel,
    reason: data.reason,
    contactNumber: data.contactNumber,
    alternativeContactNumber: data.alternativeContactNumber || undefined,
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
    details: { bloodGroup: newRequest.bloodGroup, hospital: newRequest.hospitalName }
  });

  res.status(201).json({
    success: true,
    message: 'রক্তের অনুরোধ সফলভাবে পোস্ট করা হয়েছে।',
    bloodRequest: newRequest
  });
}

export async function updateRequestStatus(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'অননুমোদিত।' });
    return;
  }

  const { id } = req.params;
  const { status, unitsFulfilled, moderationNotes } = req.body;

  const request = dataStore.findBloodRequestById(id);
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

  const updatePayload: any = { status };
  if (unitsFulfilled !== undefined) {
    updatePayload.unitsFulfilled = unitsFulfilled;
  }
  if (moderationNotes) {
    updatePayload.moderationNotes = moderationNotes;
  }

  const updated = dataStore.updateBloodRequest(id, updatePayload);

  await logAuditEvent({
    actorId: req.user.userId,
    actorRole: req.user.role,
    action: 'UPDATE_BLOOD_REQUEST_STATUS',
    targetType: 'BloodRequest',
    targetId: id,
    divisionScope: request.division,
    details: { oldStatus: request.status, newStatus: status }
  });

  res.json({
    success: true,
    message: 'অনুরোধের অবস্থা পরিবর্তন করা হয়েছে।',
    bloodRequest: updated
  });
}

export async function getMyRequests(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'অননুমোদিত।' });
    return;
  }

  const requests = dataStore.bloodRequests.filter(r => r.requesterId === req.user?.userId);
  res.json({
    success: true,
    requests
  });
}
