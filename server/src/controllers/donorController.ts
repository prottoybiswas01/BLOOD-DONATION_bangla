import { Request, Response } from 'express';
import { z } from 'zod';
import { dataStore } from '../services/dataStore.js';
import { AuthRequest } from '../middleware/auth.js';
import { ENV } from '../config/env.js';
import { logAuditEvent } from '../services/auditService.js';

export const UpdateDonorProfileSchema = z.object({
  displayName: z.string().min(2).max(80).optional(),
  division: z.string().optional(),
  district: z.string().optional(),
  upazila: z.string().optional(),
  addressDetails: z.string().max(200).optional(),
  availabilityStatus: z.enum(['available', 'recently_donated', 'temporarily_unavailable']).optional(),
  lastDonationDate: z.string().optional(),
  consentToShareContact: z.boolean().optional(),
  preferredContactMethod: z.enum(['phone', 'sms', 'platform']).optional(),
  bio: z.string().max(500).optional(),
  emergencyAvailable: z.boolean().optional(),
  isPubliclyListed: z.boolean().optional()
});

export const RevealContactSchema = z.object({
  purpose: z.enum(['blood_request', 'emergency_search', 'direct_request']).default('emergency_search'),
  relatedBloodRequestId: z.string().optional()
});

export async function searchDonors(req: Request, res: Response): Promise<void> {
  const { bloodGroup, division, district, upazila, availabilityStatus, page, limit } = req.query;

  const result = await dataStore.searchDonors({
    bloodGroup: bloodGroup as string,
    division: division as string,
    district: district as string,
    upazila: upazila as string,
    availabilityStatus: availabilityStatus as string,
    page: page ? parseInt(page as string, 10) : 1,
    limit: limit ? parseInt(limit as string, 10) : 10
  });

  res.json({
    success: true,
    ...result
  });
}

export async function getDonorById(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const profile = await dataStore.findDonorProfileById(id);

  if (!profile || !profile.isPubliclyListed) {
    res.status(404).json({
      success: false,
      message: 'রক্তদাতার প্রোফাইলটি খুঁজে পাওয়া যায়নি অথবা এটি গোপন রাখা হয়েছে।'
    });
    return;
  }

  const institution = profile.institutionId ? await dataStore.findInstitutionById(profile.institutionId) : undefined;
  const donorUser = await dataStore.findUserById(profile.userId);
  const isPublicContactAllowed = Boolean(profile.consentToShareContact);

  // Return phone strictly when donor gave explicit consent
  const safeProfile = {
    _id: profile._id,
    displayName: profile.displayName,
    bloodGroup: profile.bloodGroup,
    division: profile.division,
    district: profile.district,
    upazila: profile.upazila,
    availabilityStatus: profile.availabilityStatus,
    lastDonationDate: profile.lastDonationDate,
    totalDonations: profile.totalDonations,
    institutionName: institution?.nameBn || institution?.name,
    institutionMembershipVerified: profile.institutionMembershipVerified,
    emergencyAvailable: profile.emergencyAvailable,
    consentToShareContact: isPublicContactAllowed,
    phone: isPublicContactAllowed ? donorUser?.phone : undefined,
    bio: profile.bio,
    createdAt: profile.createdAt
  };

  res.json({
    success: true,
    donor: safeProfile
  });
}

/**
 * Controlled Contact Reveal Endpoint
 * Strictly requires authentication and donor consent!
 */
export async function revealDonorContact(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'রক্তদাতার যোগাযোগের নম্বর দেখার জন্য অনুগ্রহ করে লগইন করুন।'
    });
    return;
  }

  const { id } = req.params;
  const { purpose, relatedBloodRequestId } = req.body;

  const profile = await dataStore.findDonorProfileById(id);
  if (!profile) {
    res.status(404).json({ success: false, message: 'রক্তদাতা প্রোফাইল পাওয়া যায়নি।' });
    return;
  }

  const donorUser = await dataStore.findUserById(profile.userId);
  if (!donorUser) {
    res.status(404).json({ success: false, message: 'রক্তদাতার মূল অ্যাকাউন্ট পাওয়া যায়নি।' });
    return;
  }

  // Prevent users from counting against limit when viewing their own profile
  if (req.user.userId === profile.userId) {
    res.json({
      success: true,
      contactNumber: donorUser.phone,
      isSelf: true
    });
    return;
  }

  // Check donor consent
  if (!profile.consentToShareContact) {
    res.status(403).json({
      success: false,
      message: 'এই রক্তদাতা সরাসরি যোগাযোগের নম্বর প্রকাশ না করার পছন্দ নির্বাচন করেছেন।'
    });
    return;
  }

  // Check daily limit for viewer
  const accessCountToday = dataStore.getViewerDailyContactAccessCount(req.user.userId);
  if (accessCountToday >= ENV.DAILY_CONTACT_LIMIT) {
    res.status(429).json({
      success: false,
      message: `রক্তদাতাদের গোপনীয়তা ও সুরক্ষার স্বার্থে দিনে সর্বোচ্চ ${ENV.DAILY_CONTACT_LIMIT} জনের নম্বর দেখার অনুমতি রয়েছে। আপনি আজকের সীমা অতিক্রম করেছেন।`
    });
    return;
  }

  // Record in ContactAccessLog
  const accessLog = dataStore.recordContactAccess({
    viewerId: req.user.userId,
    donorUserId: donorUser._id,
    donorProfileId: profile._id,
    purpose: purpose || 'emergency_search',
    relatedBloodRequestId,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent']
  });

  await logAuditEvent({
    actorId: req.user.userId,
    actorRole: req.user.role,
    action: 'REVEAL_DONOR_CONTACT',
    targetType: 'DonorProfile',
    targetId: profile._id,
    details: { donorUserId: donorUser._id, accessLogId: accessLog._id }
  });

  res.json({
    success: true,
    contactNumber: donorUser.phone,
    preferredContactMethod: profile.preferredContactMethod,
    remainingDailyLimit: ENV.DAILY_CONTACT_LIMIT - (accessCountToday + 1)
  });
}

export async function getMyDonorProfile(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'অননুমোদিত।' });
    return;
  }

  const profile = await dataStore.findDonorProfileByUserId(req.user.userId);
  if (!profile) {
    res.status(404).json({
      success: false,
      message: 'আপনার রক্তদাতা প্রোফাইলটি এখনো তৈরি করা হয়নি।'
    });
    return;
  }

  res.json({
    success: true,
    profile
  });
}

export async function updateMyDonorProfile(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'অননুমোদিত।' });
    return;
  }

  const data = req.body;
  const updatePayload: any = { ...data };
  if (data.lastDonationDate) {
    updatePayload.lastDonationDate = new Date(data.lastDonationDate);
  }

  const updated = await dataStore.updateDonorProfile(req.user.userId, updatePayload);
  if (!updated) {
    res.status(404).json({ success: false, message: 'রক্তদাতা প্রোফাইল পাওয়া যায়নি।' });
    return;
  }

  res.json({
    success: true,
    message: 'প্রোফাইল সফলভাবে হালনাগাদ করা হয়েছে।',
    profile: updated
  });
}

export async function recordDonation(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'অননুমোদিত।' });
    return;
  }

  const { donationDate } = req.body;
  const profile = await dataStore.findDonorProfileByUserId(req.user.userId);
  if (!profile) {
    res.status(404).json({ success: false, message: 'রক্তদাতা প্রোফাইল পাওয়া যায়নি।' });
    return;
  }

  const date = donationDate ? new Date(donationDate) : new Date();
  const updated = await dataStore.updateDonorProfile(req.user.userId, {
    lastDonationDate: date,
    totalDonations: profile.totalDonations + 1,
    availabilityStatus: 'recently_donated'
  });

  res.json({
    success: true,
    message: 'রক্তদানের তথ্য সফলভাবে সংরক্ষণ করা হয়েছে। ধন্যবাদ আপনার মহৎ অবদানের জন্য!',
    profile: updated
  });
}

