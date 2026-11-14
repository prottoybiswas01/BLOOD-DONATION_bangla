import { Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth.js';
import { dataStore } from '../services/dataStore.js';
import { logAuditEvent } from '../services/auditService.js';
import { BloodGroup } from '../data/bangladeshLocations.js';
import { GenderType } from '../models/User.js';

const BD_PHONE_REGEX = /^(\+?88)?01[3-9]\d{8}$/;

function normalizePhone(raw: string): string {
  const cleaned = raw.replace(/\D/g, '');
  if (cleaned.startsWith('8801')) {
    return cleaned.substring(2);
  }
  return cleaned;
}

export const CreateMemberByModeratorSchema = z.object({
  name: z.string().min(2, 'সদস্যের নাম কমপক্ষে ২ অক্ষরের হতে হবে'),
  phone: z.string().regex(BD_PHONE_REGEX, 'সঠিক বাংলাদেশী মোবাইল নম্বর দিন'),
  gender: z.enum(['male', 'female', 'unspecified', 'other']).default('unspecified'),
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
  division: z.string().min(1, 'বিভাগ নির্বাচন করুন'),
  district: z.string().min(1, 'জেলা নির্বাচন করুন'),
  upazila: z.string().optional().default(''),
  institutionId: z.string().min(1, 'প্রতিষ্ঠান নির্বাচন আবশ্যক'),
  dateOfBirth: z.string().optional(),
  consentToShareContact: z.boolean().default(true)
});

export const UpdateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  gender: z.enum(['male', 'female', 'unspecified', 'other']).optional(),
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
  division: z.string().optional(),
  district: z.string().optional(),
  upazila: z.string().optional(),
  bio: z.string().max(500).optional(),
  availabilityStatus: z.enum(['available', 'recently_donated', 'temporarily_unavailable']).optional(),
  isPubliclyListed: z.boolean().optional(),
  consentToShareContact: z.boolean().optional(),
  preferredContactMethod: z.enum(['phone', 'sms', 'platform']).optional()
});

/**
 * Manual member creation by Institution Moderator
 * Generates unique temporary password requiring change at first login
 */
export async function createMemberByModerator(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'অননুমোদিত।' });
    return;
  }

  const data = req.body;
  const phone = normalizePhone(data.phone);

  // Check institution scope
  if (req.user.role === 'INSTITUTION_MODERATOR' || req.user.role === 'INSTITUTION_HEAD') {
    const isAssigned = req.user.assignedInstitution === data.institutionId ||
      (req.user.assignedInstitutions && req.user.assignedInstitutions.includes(data.institutionId));

    if (!isAssigned) {
      res.status(403).json({
        success: false,
        message: 'অনধিকার চর্চা: আপনি কেবল আপনার নির্ধারিত প্রতিষ্ঠানের সদস্য তৈরি করতে পারবেন।'
      });
      return;
    }
  }

  // Check duplicate phone
  const existingUser = await dataStore.findUserByPhone(phone);
  if (existingUser) {
    res.status(409).json({
      success: false,
      message: 'এই মোবাইল নম্বরটি ইতিমধ্যে নিবন্ধিত রয়েছে।'
    });
    return;
  }

  const { user, donorProfile, temporaryPassword } = dataStore.createMemberWithTemporaryPassword({
    name: data.name,
    phone,
    gender: data.gender as GenderType,
    bloodGroup: data.bloodGroup as BloodGroup,
    division: data.division,
    district: data.district,
    upazila: data.upazila || '',
    institutionId: data.institutionId,
    moderatorId: req.user.userId,
    moderatorName: req.user.name,
    consentToShareContact: data.consentToShareContact,
    dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined
  });

  await logAuditEvent({
    actorId: req.user.userId,
    actorRole: req.user.role,
    action: 'MEMBER_MANUALLY_CREATED',
    targetType: 'User',
    targetId: user._id,
    institutionScope: data.institutionId,
    details: { phone: user.phone, bloodGroup: donorProfile.bloodGroup }
  });

  res.status(201).json({
    success: true,
    message: 'সদস্য সফলভাবে যুক্ত করা হয়েছে। সাময়িক পাসওয়ার্ডটি কপি করে সদস্যকে প্রদান করুন।',
    user: {
      _id: user._id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      gender: user.gender,
      accountStatus: user.accountStatus,
      assignedInstitution: user.assignedInstitution,
      requirePasswordChangeAtFirstLogin: user.requirePasswordChangeAtFirstLogin
    },
    donorProfile,
    // Return temporary password ONLY ONCE to the creator
    temporaryPassword,
    warning: 'এই সাময়িক পাসওয়ার্ডটি পুনরায় দেখানো হবে না। এটি নিরাপদে সদস্যকে পৌঁছে দিন।'
  });
}

/**
 * Self profile update by Member
 * Strictly protects against mass assignment of role, block status, etc.
 */
export async function updateMyProfile(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'অননুমোদিত।' });
    return;
  }

  const data = req.body;

  // Update User table fields
  const userUpdates: any = {};
  if (data.name) userUpdates.name = data.name;
  if (data.gender) userUpdates.gender = data.gender;
  if (data.division) userUpdates.division = data.division;
  if (data.district) userUpdates.district = data.district;
  if (data.upazila !== undefined) userUpdates.upazila = data.upazila;

  if (Object.keys(userUpdates).length > 0) {
    await dataStore.updateUser(req.user.userId, userUpdates);
  }

  // Update DonorProfile fields
  const donorUpdates: any = {};
  if (data.name) donorUpdates.displayName = data.name;
  if (data.bloodGroup) donorUpdates.bloodGroup = data.bloodGroup;
  if (data.division) donorUpdates.division = data.division;
  if (data.district) donorUpdates.district = data.district;
  if (data.upazila !== undefined) donorUpdates.upazila = data.upazila;
  if (data.bio !== undefined) donorUpdates.bio = data.bio;
  if (data.availabilityStatus) {
    donorUpdates.availabilityStatus = data.availabilityStatus;
    donorUpdates.isAvailable = data.availabilityStatus === 'available';
  }
  if (data.isPubliclyListed !== undefined) donorUpdates.isPubliclyListed = data.isPubliclyListed;
  if (data.consentToShareContact !== undefined) donorUpdates.consentToShareContact = data.consentToShareContact;
  if (data.preferredContactMethod) donorUpdates.preferredContactMethod = data.preferredContactMethod;

  let updatedProfile = await dataStore.updateDonorProfile(req.user.userId, donorUpdates);
  if (!updatedProfile && data.bloodGroup) {
    const userDoc = await dataStore.findUserById(req.user.userId);
    if (userDoc) {
      updatedProfile = await dataStore.createDonorProfile({
        userId: userDoc._id,
        displayName: data.name || userDoc.name,
        bloodGroup: data.bloodGroup,
        division: data.division || userDoc.division || 'dhaka',
        district: data.district || userDoc.district || 'dhaka',
        upazila: data.upazila || userDoc.upazila || '',
        bio: data.bio || '',
        availabilityStatus: data.availabilityStatus || 'available',
        isAvailable: (data.availabilityStatus || 'available') === 'available',
        isPubliclyListed: data.isPubliclyListed !== undefined ? data.isPubliclyListed : true,
        consentToShareContact: data.consentToShareContact !== undefined ? data.consentToShareContact : true
      });
    }
  }

  res.json({
    success: true,
    message: 'প্রোফাইল তথ্য সফলভাবে হালনাগাদ হয়েছে।',
    profile: updatedProfile
  });
}

