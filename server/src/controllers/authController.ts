import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { ENV } from '../config/env.js';
import { dataStore } from '../services/dataStore.js';
import { SmsService } from '../services/smsService.js';
import { AuthRequest } from '../middleware/auth.js';
import { logAuditEvent } from '../services/auditService.js';

// Phone regex for Bangladesh: 01[3-9]\d{8}
const BD_PHONE_REGEX = /^(\+?88)?01[3-9]\d{8}$/;

export const RequestOtpSchema = z.object({
  phone: z.string().regex(BD_PHONE_REGEX, 'সঠিক বাংলাদেশী মোবাইল নম্বর প্রদান করুন (যেমন: 017XXXXXXXX)'),
  purpose: z.enum(['registration', 'login', 'reset_password']).default('registration')
});

export const VerifyOtpSchema = z.object({
  phone: z.string().regex(BD_PHONE_REGEX, 'সঠিক বাংলাদেশী মোবাইল নম্বর প্রদান করুন'),
  otp: z.string().length(6, 'ওটিপি কোড অবশ্যই ৬ ডিজিট হতে হবে'),
  purpose: z.enum(['registration', 'login', 'reset_password']).default('registration')
});

export const RegisterSchema = z.object({
  name: z.string().min(2, 'নাম কমপক্ষে ২ অক্ষরের হতে হবে').max(80),
  phone: z.string().regex(BD_PHONE_REGEX, 'সঠিক বাংলাদেশী মোবাইল নম্বর প্রদান করুন'),
  password: z.string().min(6, 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে'),
  role: z.enum(['MEMBER', 'DONOR', 'REQUESTER']).default('MEMBER'),
  email: z.string().email('সঠিক ইমেইল ঠিকানা দিন').optional().or(z.literal('')),
  gender: z.enum(['male', 'female', 'unspecified', 'other']).default('unspecified'),
  femaleSafetyAcknowledged: z.boolean().optional(),
  femalePublicPhoneConsent: z.boolean().optional(),
  
  // Member / Donor Specific Fields
  isDonor: z.boolean().default(true),
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
  division: z.string().optional(),
  district: z.string().optional(),
  upazila: z.string().optional(),
  dateOfBirth: z.string().optional(),
  institutionId: z.string().optional(),
  consentToShareContact: z.boolean().optional(),
  termsAccepted: z.boolean().refine(val => val === true, 'প্ল্যাটফর্মের শর্তাবলী ও নীতিমালা মেনে নেওয়া আবশ্যক')
});

export const LoginSchema = z.object({
  phone: z.string().regex(BD_PHONE_REGEX, 'সঠিক মোবাইল নম্বর দিন'),
  password: z.string().min(1, 'পাসওয়ার্ড আবশ্যক')
});

export const ChangeFirstLoginPasswordSchema = z.object({
  newPassword: z.string().min(6, 'নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে')
});

/**
 * Clean phone to standardized local format 01XXXXXXXXX
 */
function normalizePhone(raw: string): string {
  const cleaned = raw.replace(/\D/g, '');
  if (cleaned.startsWith('8801')) {
    return cleaned.substring(2);
  }
  return cleaned;
}

export async function requestOtp(req: Request, res: Response): Promise<void> {
  const { phone: rawPhone, purpose } = req.body;
  const phone = normalizePhone(rawPhone);

  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  dataStore.saveOtp(phone, otpCode, purpose);

  const smsResult = await SmsService.sendOtp(phone, otpCode, purpose);

  res.json({
    success: true,
    message: smsResult.message,
    devOtp: smsResult.devOtp,
    isMock: ENV.NODE_ENV !== 'production' && ENV.SMS_PROVIDER === 'mock'
  });
}

export async function verifyOtp(req: Request, res: Response): Promise<void> {
  const { phone: rawPhone, otp, purpose } = req.body;
  const phone = normalizePhone(rawPhone);

  const verification = dataStore.verifyOtp(phone, otp, purpose);
  if (!verification.success) {
    res.status(400).json({ success: false, message: verification.message });
    return;
  }

  res.json({
    success: true,
    message: 'মোবাইল নম্বর সফলভাবে যাচাই করা হয়েছে।'
  });
}

export async function register(req: Request, res: Response): Promise<void> {
  const data = req.body;
  const phone = normalizePhone(data.phone);

  const existingUser = dataStore.findUserByPhone(phone);
  if (existingUser) {
    res.status(409).json({
      success: false,
      message: 'এই মোবাইল নম্বরটি ইতিমধ্যে নিবন্ধিত রয়েছে। অনুগ্রহ করে লগইন করুন।'
    });
    return;
  }

  // Age verification for donors (Minimum 18 years old)
  const isDonorRegistration = data.isDonor !== false && (data.role === 'MEMBER' || data.role === 'DONOR');
  if (isDonorRegistration && data.dateOfBirth) {
    const dob = new Date(data.dateOfBirth);
    const ageDiffMs = Date.now() - dob.getTime();
    const ageDate = new Date(ageDiffMs);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);
    if (age < 18) {
      res.status(400).json({
        success: false,
        message: 'রক্তদাতা হিসেবে নিবন্ধনের জন্য ন্যূনতম বয়স ১৮ বছর হওয়া বাধ্যতামূলক।'
      });
      return;
    }
  }

  // Female donor privacy handling:
  // If female, consentToShareContact is true only if femalePublicPhoneConsent was explicitly checked
  let finalConsent = data.consentToShareContact ?? true;
  if (data.gender === 'female') {
    finalConsent = data.femalePublicPhoneConsent === true;
  }

  const passwordHash = bcrypt.hashSync(data.password, 10);
  const newUser = dataStore.createUser({
    name: data.name,
    phone,
    email: data.email || undefined,
    passwordHash,
    role: data.role === 'DONOR' || data.role === 'REQUESTER' ? data.role : 'MEMBER',
    accountStatus: 'active',
    gender: data.gender,
    femaleSafetyAcknowledged: data.femaleSafetyAcknowledged || false,
    femalePublicPhoneConsent: data.femalePublicPhoneConsent || false,
    division: data.division,
    district: data.district,
    upazila: data.upazila,
    assignedInstitution: data.institutionId || undefined,
    isActive: true,
    isPhoneVerified: true
  });

  let donorProfile = null;
  if (isDonorRegistration && data.bloodGroup) {
    donorProfile = dataStore.createDonorProfile({
      userId: newUser._id,
      displayName: data.name,
      bloodGroup: data.bloodGroup,
      division: data.division || 'dhaka',
      district: data.district || 'dhaka',
      upazila: data.upazila || '',
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : new Date('2000-01-01'),
      gender: data.gender || 'unspecified',
      availabilityStatus: 'available',
      institutionId: data.institutionId || undefined,
      consentToShareContact: finalConsent,
      isPubliclyListed: true,
      emergencyAvailable: true
    });
  }

  const token = jwt.sign(
    {
      userId: newUser._id,
      phone: newUser.phone,
      role: newUser.role,
      name: newUser.name,
      assignedDivision: newUser.assignedDivision,
      assignedInstitution: newUser.assignedInstitution,
      requirePasswordChangeAtFirstLogin: newUser.requirePasswordChangeAtFirstLogin
    },
    ENV.JWT_SECRET,
    { expiresIn: '7d' }
  );

  await logAuditEvent({
    actorId: newUser._id,
    actorRole: newUser.role,
    action: 'USER_REGISTERED',
    targetType: 'User',
    targetId: newUser._id,
    details: { phone: newUser.phone, role: newUser.role, gender: newUser.gender }
  });

  res.status(201).json({
    success: true,
    message: 'অভিনন্দন! আপনার নিবন্ধন সফলভাবে সম্পন্ন হয়েছে।',
    token,
    user: {
      _id: newUser._id,
      name: newUser.name,
      phone: newUser.phone,
      email: newUser.email,
      role: newUser.role,
      accountStatus: newUser.accountStatus,
      gender: newUser.gender,
      requirePasswordChangeAtFirstLogin: newUser.requirePasswordChangeAtFirstLogin
    },
    donorProfile
  });
}

export async function login(req: Request, res: Response): Promise<void> {
  const { phone: rawPhone, password } = req.body;
  const phone = normalizePhone(rawPhone);

  const user = dataStore.findUserByPhone(phone);
  if (!user) {
    res.status(401).json({
      success: false,
      message: 'মোবাইল নম্বর অথবা পাসওয়ার্ড সঠিক নয়।'
    });
    return;
  }

  // Check blocked or suspended status
  if (
    user.accountStatus === 'temporarily_blocked' || 
    user.accountStatus === 'suspended' || 
    user.accountStatus === 'deactivated' || 
    !user.isActive
  ) {
    res.status(403).json({
      success: false,
      accountBlocked: true,
      message: `আপনার অ্যাকাউন্টটি স্থগিত রাখা হয়েছে। কারণ: ${user.blockReason || 'নিয়ম লঙ্ঘন বা প্রশাসনিক পর্যালোচনা'}`,
      blockReason: user.blockReason
    });
    return;
  }

  const isPasswordValid = bcrypt.compareSync(password, user.passwordHash);
  if (!isPasswordValid) {
    res.status(401).json({
      success: false,
      message: 'মোবাইল নম্বর অথবা পাসওয়ার্ড সঠিক নয়।'
    });
    return;
  }

  dataStore.updateUser(user._id, { lastLoginAt: new Date() });

  const token = jwt.sign(
    {
      userId: user._id,
      phone: user.phone,
      role: user.role,
      name: user.name,
      assignedDivision: user.assignedDivision,
      assignedInstitution: user.assignedInstitution,
      requirePasswordChangeAtFirstLogin: user.requirePasswordChangeAtFirstLogin
    },
    ENV.JWT_SECRET,
    { expiresIn: '7d' }
  );

  const donorProfile = dataStore.findDonorProfileByUserId(user._id);

  res.json({
    success: true,
    message: user.requirePasswordChangeAtFirstLogin 
      ? 'স্বাগতম! প্রথমবার প্রবেশের জন্য নতুন স্থায়ী পাসওয়ার্ড নির্ধারণ করুন।'
      : 'লগইন সফল হয়েছে।',
    token,
    user: {
      _id: user._id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      role: user.role,
      accountStatus: user.accountStatus,
      gender: user.gender,
      assignedDivision: user.assignedDivision,
      assignedInstitution: user.assignedInstitution,
      assignedInstitutions: user.assignedInstitutions,
      requirePasswordChangeAtFirstLogin: user.requirePasswordChangeAtFirstLogin
    },
    donorProfile
  });
}

export async function changeFirstLoginPassword(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'অননুমোদিত।' });
    return;
  }

  const { newPassword } = req.body;
  const success = dataStore.changeFirstLoginPassword(req.user.userId, newPassword);

  if (!success) {
    res.status(400).json({ success: false, message: 'পাসওয়ার্ড পরিবর্তন সম্পন্ন করা যায়নি।' });
    return;
  }

  await logAuditEvent({
    actorId: req.user.userId,
    actorRole: req.user.role,
    action: 'FIRST_LOGIN_PASSWORD_CHANGED',
    targetType: 'User',
    targetId: req.user.userId
  });

  res.json({
    success: true,
    message: 'আপনার নতুন স্থায়ী পাসওয়ার্ড সফলভাবে সংরক্ষিত হয়েছে। এখন আপনি প্ল্যাটফর্মের সকল সেবা ব্যবহার করতে পারবেন।'
  });
}

export async function getMe(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'অননুমোদিত।' });
    return;
  }

  const user = dataStore.findUserById(req.user.userId);
  if (!user) {
    res.status(404).json({ success: false, message: 'ব্যবহারকারী খুঁজে পাওয়া যায়নি।' });
    return;
  }

  const donorProfile = dataStore.findDonorProfileByUserId(user._id);
  const unreadNotifications = dataStore.getUserNotifications(user._id).filter(n => !n.isRead).length;

  res.json({
    success: true,
    user: {
      _id: user._id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      role: user.role,
      accountStatus: user.accountStatus,
      gender: user.gender,
      blockReason: user.blockReason,
      assignedDivision: user.assignedDivision,
      assignedInstitution: user.assignedInstitution,
      assignedInstitutions: user.assignedInstitutions,
      requirePasswordChangeAtFirstLogin: user.requirePasswordChangeAtFirstLogin,
      isPhoneVerified: user.isPhoneVerified
    },
    donorProfile,
    unreadNotifications
  });
}
