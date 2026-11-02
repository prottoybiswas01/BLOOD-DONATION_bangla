import { Request, Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth.js';
import { dataStore } from '../services/dataStore.js';
import { logAuditEvent } from '../services/auditService.js';

export const SubmitInstitutionRequestSchema = z.object({
  name: z.string().min(3, 'প্রতিষ্ঠানের ইংরেজি নাম আবশ্যক'),
  nameBn: z.string().min(3, 'প্রতিষ্ঠানের বাংলা নাম আবশ্যক'),
  code: z.string().min(2).max(15),
  type: z.enum(['university', 'college', 'school', 'medical_college', 'polytechnic', 'other']),
  division: z.string().min(1, 'বিভাগ নির্বাচন করুন'),
  district: z.string().min(1, 'জেলা নির্বাচন করুন'),
  upazila: z.string().optional().default(''),
  address: z.string().min(5, 'ঠিকানা উল্লেখ করুন'),
  applicantName: z.string().min(2, 'আবেদনকারীর নাম আবশ্যক'),
  applicantPhone: z.string().min(11, 'আবেদনকারীর ফোন নম্বর আবশ্যক'),
  applicantEmail: z.string().email().optional().or(z.literal('')),
  applicantRole: z.string().optional(),
  supportingDetails: z.string().optional()
});

export const ReviewInstitutionRequestSchema = z.object({
  status: z.enum(['approved', 'rejected', 'under_review']),
  decisionReason: z.string().min(5, 'অনুমোদন বা বাতিলের কারণ কমপক্ষে ৫ অক্ষরে উল্লেখ করতে হবে')
});

export async function submitInstitutionRequest(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'নতুন শিক্ষা প্রতিষ্ঠান অন্তর্ভুক্তি আবেদন জমা দিতে অনুগ্রহ করে প্রথমে লগইন করুন।'
    });
    return;
  }

  // Only regular members, donors, and requesters can apply (coordinators and moderators cannot self-apply)
  const allowedRoles = ['MEMBER', 'DONOR', 'REQUESTER'];
  if (!allowedRoles.includes(req.user.role)) {
    res.status(403).json({
      success: false,
      message: 'প্রশাসনিক কর্মকর্তা (সমন্বয়ক, মডারেটর বা প্রতিষ্ঠান প্রধান) নিজে থেকে নতুন প্রতিষ্ঠান আবেদন করতে পারেন না।'
    });
    return;
  }

  const data = req.body;
  const newReq = dataStore.createInstitutionRequest(data);

  res.status(201).json({
    success: true,
    message: 'প্রতিষ্ঠানের নিবন্ধনের আবেদন সফলভাবে গৃহীত হয়েছে। সংশ্লিষ্ট বিভাগীয় সমন্বয়ক ও সুপার অ্যাডমিন পর্যালোচনা করে সিদ্ধান্ত জানাবেন।',
    request: newReq
  });
}

export async function getInstitutionRequests(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'অননুমোদিত।' });
    return;
  }

  const { status } = req.query;
  const division = req.user.role === 'DIVISION_COORDINATOR' ? req.user.assignedDivision : (req.query.division as string);

  const requests = dataStore.getInstitutionRequests({
    division,
    status: status as string
  });

  res.json({
    success: true,
    requests
  });
}

export async function reviewInstitutionRequest(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'অননুমোদিত।' });
    return;
  }

  const { id } = req.params;
  const { status, decisionReason } = req.body;

  const result = dataStore.reviewInstitutionRequest({
    requestId: id,
    reviewerId: req.user.userId,
    reviewerRole: req.user.role,
    reviewerDivision: req.user.assignedDivision,
    status,
    decisionReason
  });

  if (!result.success) {
    res.status(403).json({ success: false, message: result.message });
    return;
  }

  await logAuditEvent({
    actorId: req.user.userId,
    actorRole: req.user.role,
    action: `INSTITUTION_REQUEST_${status.toUpperCase()}`,
    targetType: 'InstitutionRequest',
    targetId: id,
    divisionScope: req.user.assignedDivision,
    details: { decisionReason }
  });

  res.json({
    success: true,
    message: result.message,
    institution: result.institution
  });
}

