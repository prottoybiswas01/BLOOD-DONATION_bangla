import { Request, Response } from 'express';
import crypto from 'node:crypto';
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

  // Cryptographically secure 6-digit OTP generation
  const otpCode = crypto.randomInt(100000, 1000000).toString();
  await dataStore.saveOtp(phone, otpCode, purpose);

  const smsResult = await SmsService.sendOtp(phone, otpCode, purpose);

  res.json({
    success: true,
    message: smsResult.message,
    devOtp: ENV.NODE_ENV !== 'production' ? smsResult.devOtp : undefined,
    isMock: ENV.NODE_ENV !== 'production' && ENV.SMS_PROVIDER === 'mock'
  });
}

export async function verifyOtp(req: Request, res: Response): Promise<void> {
  const { phone: rawPhone, otp, purpose } = req.body;
  const phone = normalizePhone(rawPhone);

  const verification = await dataStore.verifyOtp(phone, otp, purpose);
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

  const existingUser = await dataStore.findUserByPhone(phone);
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
  const newUser = await dataStore.createUser({
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
    donorProfile = await dataStore.createDonorProfile({
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

  const user = await dataStore.findUserByPhone(phone);
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

  // Check if user is logging in using an approved recovery request
  const activeRecovery = dataStore.passwordRecoveryRequests.find(
    r => r.userId === user._id && r.status === 'approved' && !r.isUsed
  );

  if (activeRecovery) {
    if (activeRecovery.expiresAt && new Date() > new Date(activeRecovery.expiresAt)) {
      activeRecovery.status = 'expired';
      res.status(401).json({
        success: false,
        message: 'আপনার সাময়িক পাসওয়ার্ডটির মেয়াদ উত্তীর্ণ হয়েছে। অনুগ্রহ করে পুনরায় রিকভারি আবেদন করুন।'
      });
      return;
    }

    // Mark as used immediately upon successful verification
    activeRecovery.isUsed = true;
    activeRecovery.status = 'used';
    activeRecovery.updatedAt = new Date();

    dataStore.passwordRecoveryAudits.unshift({
      _id: 'pra_' + Date.now() + Math.random().toString(36).substring(2, 6),
      requestId: activeRecovery._id,
      userId: user._id,
      userName: user.name,
      phone: user.phone,
      issuedBy: user._id,
      issuedByName: user.name,
      issuerRole: user.role,
      action: 'LOGIN_USED',
      reason: 'সাময়িক পাসওয়ার্ড সফলভাবে ব্যবহার করে প্রথম লগইন সম্পন্ন',
      createdAt: new Date()
    });
  }

  await dataStore.updateUser(user._id, { lastLoginAt: new Date() });

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

  const donorProfile = await dataStore.findDonorProfileByUserId(user._id);

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

// --- PART 03: Password Recovery Endpoints ---

export async function submitForgotPassword(req: Request, res: Response): Promise<void> {
  const { phoneOrUserId, reason } = req.body;
  if (!phoneOrUserId || typeof phoneOrUserId !== 'string') {
    res.status(400).json({ success: false, message: 'নিবন্ধিত মোবাইল নম্বর বা ইউজার আইডি প্রদান করুন।' });
    return;
  }

  const result = dataStore.createPasswordRecoveryRequest(phoneOrUserId, reason);
  if (!result.success) {
    res.status(400).json(result);
    return;
  }

  res.json(result);
}

export async function getPasswordRecoveryRequests(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'অননুমোদিত।' });
    return;
  }

  const user = await dataStore.findUserById(req.user.userId);
  if (!user) {
    res.status(401).json({ success: false, message: 'ব্যবহারকারী অ্যাকাউন্ট পাওয়া যায়নি।' });
    return;
  }

  const { status } = req.query;
  const requests = dataStore.getPasswordRecoveryRequests({
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

export async function approvePasswordRecoveryRequest(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'অননুমোদিত।' });
    return;
  }

  const approver = await dataStore.findUserById(req.user.userId);
  if (!approver) {
    res.status(401).json({ success: false, message: 'ব্যবহারকারী অ্যাকাউন্ট পাওয়া যায়নি।' });
    return;
  }

  const { id } = req.params;
  const result = dataStore.approvePasswordRecoveryRequest(id, approver);

  if (!result.success) {
    res.status(400).json(result);
    return;
  }

  await logAuditEvent({
    actorId: approver._id,
    actorRole: approver.role,
    action: 'PASSWORD_RECOVERY_APPROVED',
    targetType: 'PasswordRecoveryRequest',
    targetId: id
  });

  res.json(result);
}

export async function rejectPasswordRecoveryRequest(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'অননুমোদিত।' });
    return;
  }

  const rejecter = await dataStore.findUserById(req.user.userId);
  if (!rejecter) {
    res.status(401).json({ success: false, message: 'ব্যবহারকারী অ্যাকাউন্ট পাওয়া যায়নি।' });
    return;
  }

  const { id } = req.params;
  const { reason } = req.body;

  if (!reason || reason.trim().length < 5) {
    res.status(400).json({ success: false, message: 'আবেদন বাতিলের সুস্পষ্ট কারণ (কমপক্ষে ৫ অক্ষর) উল্লেখ করুন।' });
    return;
  }

  const result = dataStore.rejectPasswordRecoveryRequest(id, rejecter, reason);
  if (!result.success) {
    res.status(400).json(result);
    return;
  }

  await logAuditEvent({
    actorId: rejecter._id,
    actorRole: rejecter.role,
    action: 'PASSWORD_RECOVERY_REJECTED',
    targetType: 'PasswordRecoveryRequest',
    targetId: id,
    details: { reason }
  });

  res.json(result);
}

export async function getPasswordRecoveryHistory(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'অননুমোদিত।' });
    return;
  }

  const user = await dataStore.findUserById(req.user.userId);
  if (!user) {
    res.status(401).json({ success: false, message: 'ব্যবহারকারী অ্যাকাউন্ট পাওয়া যায়নি।' });
    return;
  }

  // Only Super Admin and Division Coordinator can view recovery history
  if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN' && user.role !== 'DIVISION_COORDINATOR') {
    res.status(403).json({ success: false, message: 'পাসওয়ার্ড রিকভারি হিস্ট্রি দেখার অনুমতি নেই।' });
    return;
  }

  const history = dataStore.getPasswordRecoveryHistory({
    role: user.role,
    division: user.assignedDivision
  });

  res.json({
    success: true,
    history
  });
}

export async function getMe(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'অননুমোদিত।' });
    return;
  }

  const user = await dataStore.findUserById(req.user.userId);
  if (!user) {
    res.status(404).json({ success: false, message: 'ব্যবহারকারী খুঁজে পাওয়া যায়নি।' });
    return;
  }

  const donorProfile = await dataStore.findDonorProfileByUserId(user._id);
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
