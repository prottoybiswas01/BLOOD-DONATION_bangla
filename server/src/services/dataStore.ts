import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { BANGLADESH_DIVISIONS, BloodGroup } from '../data/bangladeshLocations.js';
import { UserModel, UserRole, AccountStatus, GenderType } from '../models/User.js';
import { DonorProfileModel, AvailabilityStatus } from '../models/DonorProfile.js';
import { BloodRequestModel, RequestStatus, UrgencyLevel } from '../models/BloodRequest.js';
import { ModeratorActivityModel, ActivityActionType } from '../models/ModeratorActivity.js';
import { InstitutionRequestModel, InstitutionRequestStatus } from '../models/InstitutionRequest.js';
import { ContactRequestModel, ContactRequestStatus } from '../models/ContactRequest.js';
import { InstitutionModel } from '../models/Institution.js';
import { AccountStatusHistoryModel } from '../models/AccountStatusHistory.js';
import { ReportModel } from '../models/Report.js';
import { NotificationModel } from '../models/Notification.js';
import { ContactAccessLogModel } from '../models/ContactAccessLog.js';
import { PhoneChangeRequestModel } from '../models/PhoneChangeRequest.js';
import { PasswordRecoveryRequestModel } from '../models/PasswordRecoveryRequest.js';
import { InstitutionChangeRequestModel } from '../models/InstitutionChangeRequest.js';
import { OtpVerificationModel } from '../models/OtpVerification.js';
import { isDatabaseConnected } from '../config/db.js';
import { ENV } from '../config/env.js';

/**
 * Sanitizes input string to prevent ReDoS (Regular Expression Denial of Service)
 * and unintended regex pattern injection.
 */
export function escapeRegex(text: string): string {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

export interface StoredUser {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  passwordHash: string;
  role: UserRole;
  accountStatus: AccountStatus;
  blockReason?: string;
  blockedBy?: string;
  blockedAt?: Date;
  gender: GenderType;
  femaleSafetyAcknowledged?: boolean;
  femalePublicPhoneConsent?: boolean;
  assignedDivision?: string;
  assignedInstitution?: string;
  assignedInstitutions?: string[];
  requirePasswordChangeAtFirstLogin?: boolean;
  createdByModeratorId?: string;
  division?: string;
  district?: string;
  upazila?: string;
  isActive: boolean;
  isPhoneVerified: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface StoredDonorProfile {
  _id: string;
  userId: string;
  displayName: string;
  bloodGroup: BloodGroup;
  division: string;
  district: string;
  upazila: string;
  addressDetails?: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other' | 'unspecified';
  availabilityStatus: AvailabilityStatus;
  lastDonationDate?: Date;
  totalDonations: number;
  institutionId?: string;
  institutionMembershipVerified: boolean;
  consentToShareContact: boolean;
  preferredContactMethod: 'phone' | 'sms' | 'platform';
  bio?: string;
  isPubliclyListed: boolean;
  emergencyAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface StoredBloodRequestStatusHistory {
  status: RequestStatus;
  unitsFulfilled?: number;
  changedBy: string;
  changedAt: Date;
  notes?: string;
}

export interface StoredBloodRequest {
  _id: string;
  publicId?: string;
  requesterId: string;
  patientName: string;
  bloodGroup: BloodGroup;
  unitsRequired: number;
  unitsFulfilled: number;
  hospitalName: string;
  hospitalAddress: string;
  division: string;
  district: string;
  upazila: string;
  requiredDate: Date;
  requiredWithin?: string;
  urgencyLevel: UrgencyLevel;
  reason: string;
  contactPersonName?: string;
  contactNumber: string;
  alternativeContactNumber?: string;
  additionalNotes?: string;
  consentForPublicShare?: boolean;
  status: RequestStatus;
  statusHistory?: StoredBloodRequestStatusHistory[];
  moderationNotes?: string;
  institutionId?: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface StoredInstitution {
  _id: string;
  name: string;
  nameBn: string;
  code: string;
  type: string;
  division: string;
  district: string;
  upazila: string;
  address: string;
  website?: string;
  email?: string;
  phone?: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  assignedModeratorId?: string;
  assignedModeratorIds?: string[];
  totalRegisteredDonors: number;
  description?: string;
  verificationNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StoredInstitutionRequest {
  _id: string;
  name: string;
  nameBn: string;
  code: string;
  type: string;
  division: string;
  district: string;
  upazila: string;
  address: string;
  applicantName: string;
  applicantPhone: string;
  applicantEmail?: string;
  applicantRole?: string;
  supportingDetails?: string;
  status: InstitutionRequestStatus;
  reviewedBy?: string;
  decisionReason?: string;
  reviewedAt?: Date;
  createdInstitutionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StoredModeratorActivity {
  _id: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  action: ActivityActionType;
  targetRecordId: string;
  targetRecordType: string;
  divisionScope?: string;
  institutionScope?: string;
  reason?: string;
  result?: string;
  details?: Record<string, any>;
  createdAt: Date;
}

export interface StoredContactRequest {
  _id: string;
  requesterId: string;
  requesterName: string;
  requesterPhone: string;
  institutionId: string;
  targetBloodGroup: BloodGroup;
  patientName: string;
  hospitalName: string;
  unitsRequired: number;
  urgency: 'emergency' | 'urgent' | 'standard';
  reason: string;
  status: ContactRequestStatus;
  assignedModeratorId?: string;
  moderatorNotes?: string;
  handledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface StoredAccountStatusHistory {
  _id: string;
  userId: string;
  targetUserName: string;
  targetUserPhone: string;
  oldStatus: string;
  newStatus: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  reason: string;
  expiryDate?: Date;
  createdAt: Date;
}

export interface StoredReport {
  _id: string;
  reportedBy: string;
  targetType: 'donor_profile' | 'blood_request' | 'institution' | 'user';
  targetId: string;
  targetTitle?: string;
  division?: string;
  institutionId?: string;
  reason: string;
  description: string;
  status: 'pending' | 'under_review' | 'resolved' | 'dismissed';
  reviewedBy?: string;
  resolutionNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StoredContactAccessLog {
  _id: string;
  viewerId: string;
  donorUserId: string;
  donorProfileId: string;
  purpose: 'blood_request' | 'emergency_search' | 'direct_request';
  relatedBloodRequestId?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

export interface StoredOtp {
  phone: string;
  otpHash: string;
  expiresAt: Date;
  attempts: number;
  isUsed: boolean;
  purpose: string;
  createdAt: Date;
}

export interface StoredNotification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: 'request_match' | 'contact_revealed' | 'status_update' | 'institution_update' | 'system' | 'contact_request' | 'account_status' | 'phone_change';
  link?: string;
  isRead: boolean;
  createdAt: Date;
}

export interface StoredPhoneChangeRequest {
  _id: string;
  userId: string;
  userName: string;
  userRole: string;
  currentPhone: string;
  newPhone: string;
  reason: string;
  division?: string;
  district?: string;
  institutionId?: string;
  institutionName?: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedByName?: string;
  reviewedAt?: Date;
  reviewNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StoredPasswordRecoveryRequest {
  _id: string;
  userId: string;
  userName: string;
  phone: string;
  userRole: UserRole;
  division: string;
  district: string;
  institutionId?: string;
  institutionName?: string;
  status: 'pending' | 'approved' | 'rejected' | 'used' | 'expired';
  reason?: string;
  temporaryPasswordHash?: string;
  expiresAt?: Date;
  isUsed: boolean;
  approvedBy?: string;
  approvedByName?: string;
  approvedByRole?: string;
  approvedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StoredPasswordRecoveryAudit {
  _id: string;
  requestId: string;
  userId: string;
  userName: string;
  phone: string;
  issuedBy: string;
  issuedByName: string;
  issuerRole: string;
  action: 'REQUEST_SUBMITTED' | 'OTP_GENERATED' | 'LOGIN_USED' | 'REQUEST_REJECTED';
  reason?: string;
  notes?: string;
  createdAt: Date;
}

export interface StoredInstitutionChangeRequest {
  _id: string;
  userId: string;
  userName: string;
  phone: string;
  userRole: UserRole;
  currentInstitutionId?: string;
  currentInstitutionName?: string;
  targetInstitutionId: string;
  targetInstitutionName: string;
  division: string;
  district: string;
  studentOrStaffId?: string;
  department?: string;
  reason?: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedByName?: string;
  decisionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Confirmed Demo Identifiers & Launch Suppression Helpers
export const CONFIRMED_DEMO_USER_IDS = new Set([
  'usr_coordinator_dhaka',
  'usr_coordinator_ctg',
  'usr_moderator_du',
  'usr_head',
  'usr_donor_1',
  'usr_donor_2',
  'usr_donor_3',
  'usr_donor_4',
  'usr_requester_1',
  'usr_blocked_demo',
  'usr_sync_v2_1794563476694'
]);

export const CONFIRMED_DEMO_DONOR_IDS = new Set([
  'donor_prof_1',
  'donor_prof_2',
  'donor_prof_3',
  'donor_prof_4',
  'donor_prof_1794563476796kd5ko'
]);

export const CONFIRMED_DEMO_REQUEST_IDS = new Set([
  'req_1',
  'req_2',
  'req_3',
  'req_179456347713833s9v',
  'req_1794563477775sywcg'
]);

export const CONFIRMED_DEMO_PUBLIC_IDS = new Set([
  'BR-RD02-7365',
  'BR-RDHR-Q1FE'
]);

export function isConfirmedDemoDonor(d: any): boolean {
  if (!d) return false;
  const id = String(d._id || '');
  const userId = String(d.userId || '');
  return CONFIRMED_DEMO_DONOR_IDS.has(id) || CONFIRMED_DEMO_USER_IDS.has(userId);
}

export function isConfirmedDemoRequest(r: any): boolean {
  if (!r) return false;
  const id = String(r._id || '');
  const publicId = String(r.publicId || '');
  const requesterId = String(r.requesterId || '');

  // If request has donor fulfillment or modification notes, retain for review; DO NOT suppress as confirmed demo
  if (r.unitsFulfilled > 0 || (r.statusHistory && r.statusHistory.length > 1) || r.status === 'partially_fulfilled') {
    return false;
  }

  return CONFIRMED_DEMO_REQUEST_IDS.has(id) ||
         CONFIRMED_DEMO_PUBLIC_IDS.has(publicId) ||
         CONFIRMED_DEMO_USER_IDS.has(requesterId);
}

// In-Memory Repository
class DataStore {
  // Website launch suppression: stops returning confirmed demo data in public lists and direct URLs
  public suppressDemoData: boolean = (ENV.NODE_ENV === 'production' || Boolean(process.env.VERCEL) || process.env.SUPPRESS_DEMO_DATA === 'true');

  users: StoredUser[] = [];
  donorProfiles: StoredDonorProfile[] = [];
  bloodRequests: StoredBloodRequest[] = [];
  institutions: StoredInstitution[] = [];
  institutionRequests: StoredInstitutionRequest[] = [];
  moderatorActivities: StoredModeratorActivity[] = [];
  contactRequests: StoredContactRequest[] = [];
  accountStatusHistories: StoredAccountStatusHistory[] = [];
  reports: StoredReport[] = [];
  contactAccessLogs: StoredContactAccessLog[] = [];
  otps: StoredOtp[] = [];
  notifications: StoredNotification[] = [];
  phoneChangeRequests: StoredPhoneChangeRequest[] = [];
  passwordRecoveryRequests: StoredPasswordRecoveryRequest[] = [];
  passwordRecoveryAudits: StoredPasswordRecoveryAudit[] = [];
  institutionChangeRequests: StoredInstitutionChangeRequest[] = [];

  constructor() {
    // Demo auto-seeding is strictly disabled in production or on Vercel deployment.
    // In-memory seed is preserved for local development and unit tests.
    if (ENV.NODE_ENV !== 'production' && !process.env.VERCEL) {
      this.seedInitialData();
    }
  }

  seedInitialData() {
    this.users = [];

    // 1. Initial Users: Only initialize single Super Admin if explicitly configured via private .env
    if (ENV.SUPER_ADMIN_PHONE && ENV.SUPER_ADMIN_PASSWORD) {
      const defaultPasswordHash = bcrypt.hashSync(ENV.SUPER_ADMIN_PASSWORD, 10);
      const now = new Date();
      this.users.push({
        _id: 'usr_superadmin',
        name: ENV.SUPER_ADMIN_NAME || 'সুপার অ্যাডমিন (Super Admin)',
        phone: ENV.SUPER_ADMIN_PHONE,
        email: ENV.SUPER_ADMIN_EMAIL,
        passwordHash: defaultPasswordHash,
        role: 'SUPER_ADMIN',
        accountStatus: 'active',
        gender: 'male',
        isActive: true,
        isPhoneVerified: true,
        createdAt: now,
        updatedAt: now
      });
    }

    // 2. All institutions start clean (0 pre-seeded institutions; only real registered institutions)
    this.institutions = [];

    // 3. All other queues and feeds start completely clean (real operational data only)
    this.donorProfiles = [];
    this.bloodRequests = [];
    this.institutionRequests = [];
    this.moderatorActivities = [];
    this.contactRequests = [];
    this.accountStatusHistories = [];
    this.reports = [];
    this.notifications = [];
    this.phoneChangeRequests = [];
    this.passwordRecoveryRequests = [];
    this.passwordRecoveryAudits = [];
    this.institutionChangeRequests = [];
    this.contactAccessLogs = [];
    this.otps = [];
  }

  // --- MongoDB Atlas Synchronization & Persistence ---
  async syncWithMongoDB(): Promise<void> {
    try {
      if (!isDatabaseConnected()) return;
      console.log('[Database] Loading authoritative live data from MongoDB Atlas...');
      const dbUsers = await UserModel.find().lean();
      this.users = (dbUsers || []) as any;
      const dbDonors = await DonorProfileModel.find().lean();
      this.donorProfiles = (dbDonors || []) as any;
      const dbInsts = await InstitutionModel.find().lean();
      this.institutions = (dbInsts || []) as any;
      const dbRequests = await BloodRequestModel.find().lean();
      this.bloodRequests = (dbRequests || []) as any;
      const dbInstReqs = await InstitutionRequestModel.find().lean();
      this.institutionRequests = (dbInstReqs || []) as any;
      const dbContactReqs = await ContactRequestModel.find().lean();
      this.contactRequests = (dbContactReqs || []) as any;
      const dbActivities = await ModeratorActivityModel.find().lean();
      this.moderatorActivities = (dbActivities || []) as any;
      const dbHistories = await AccountStatusHistoryModel.find().lean();
      this.accountStatusHistories = (dbHistories || []) as any;
      const dbPhoneReqs = await PhoneChangeRequestModel.find().lean();
      this.phoneChangeRequests = (dbPhoneReqs || []) as any;
      const dbRecoveryReqs = await PasswordRecoveryRequestModel.find().lean();
      this.passwordRecoveryRequests = (dbRecoveryReqs || []) as any;
      const dbChangeReqs = await InstitutionChangeRequestModel.find().lean();
      this.institutionChangeRequests = (dbChangeReqs || []) as any;
      const dbReports = await ReportModel.find().lean();
      this.reports = (dbReports || []) as any;
      const dbNotifs = await NotificationModel.find().lean();
      this.notifications = (dbNotifs || []) as any;
      const dbLogs = await ContactAccessLogModel.find().lean();
      this.contactAccessLogs = (dbLogs || []) as any;
      
      // Enforce single authoritative Super Admin from ENV configuration
      await this.ensureSingleSuperAdmin();

      console.log(`[Database] Hydrated ${this.users.length} users, ${this.donorProfiles.length} donors, ${this.bloodRequests.length} requests, and ${this.institutions.length} institutions from MongoDB Atlas.`);
    } catch (err: any) {
      console.warn('[Database Sync Warning]:', err.message);
    }
  }

  async ensureSingleSuperAdmin(): Promise<void> {
    const targetPhone = ENV.SUPER_ADMIN_PHONE;
    const targetPassword = ENV.SUPER_ADMIN_PASSWORD;

    // Strictly skip if not defined in private .env
    if (!targetPhone || !targetPassword) {
      return;
    }

    const targetName = ENV.SUPER_ADMIN_NAME || 'সুপার অ্যাডমিন (Super Admin)';
    const targetEmail = ENV.SUPER_ADMIN_EMAIL;
    const passwordHash = bcrypt.hashSync(targetPassword, 10);
    const now = new Date();

    // 1. In-memory clean up: Remove any other SUPER_ADMIN
    this.users = this.users.filter(u => u.role !== 'SUPER_ADMIN' || u.phone === targetPhone);

    // 2. Find or create the single authoritative super admin
    let superAdmin = this.users.find(u => u.phone === targetPhone || u._id === 'usr_superadmin');
    if (!superAdmin) {
      superAdmin = {
        _id: 'usr_superadmin',
        name: targetName,
        phone: targetPhone,
        email: targetEmail,
        passwordHash,
        role: 'SUPER_ADMIN',
        accountStatus: 'active',
        gender: 'male',
        isActive: true,
        isPhoneVerified: true,
        createdAt: now,
        updatedAt: now
      };
      this.users.unshift(superAdmin);
    } else {
      superAdmin._id = 'usr_superadmin';
      superAdmin.name = targetName;
      superAdmin.phone = targetPhone;
      superAdmin.email = targetEmail;
      superAdmin.passwordHash = passwordHash;
      superAdmin.role = 'SUPER_ADMIN';
      superAdmin.accountStatus = 'active';
      superAdmin.isActive = true;
      superAdmin.isPhoneVerified = true;
      superAdmin.updatedAt = now;
    }

    // 3. Database synchronization (if connected)
    if (isDatabaseConnected()) {
      try {
        // Delete any other SUPER_ADMIN records from MongoDB Atlas
        await UserModel.deleteMany({
          role: 'SUPER_ADMIN',
          phone: { $ne: targetPhone },
          _id: { $ne: superAdmin._id }
        });

        // Upsert the single super admin with latest passwordHash and credentials from ENV
        await UserModel.updateOne(
          { _id: superAdmin._id },
          { $set: superAdmin },
          { upsert: true }
        );
        console.log(`[DataStore] Single Super Admin synchronized from .env (Phone: ${targetPhone})`);
      } catch (err: any) {
        console.warn('[DataStore] ensureSingleSuperAdmin DB error:', err?.message);
      }
    }
  }

  assertWritable(): void {
    if (ENV.NODE_ENV === 'production' && !isDatabaseConnected()) {
      const err: any = new Error('ডাটাবেজ সার্ভারের সাথে সংযোগ স্থাপন করা যায়নি। ডাটার নির্ভরযোগ্যতা বজায় রাখতে এই মুহূর্তে পরিবর্তন গ্রহণ করা হচ্ছে না।');
      err.statusCode = 503;
      err.code = 'DATABASE_UNAVAILABLE';
      throw err;
    }
    if (!isDatabaseConnected()) {
      console.warn("[Database Notice] MongoDB Atlas is disconnected; proceeding with in-memory store.");
    }
  }

  async persistUser(user: StoredUser): Promise<void> {
    if (isDatabaseConnected()) {
      await UserModel.findOneAndUpdate({ _id: user._id }, user, { upsert: true, new: true });
    }
  }

  async persistDonorProfile(profile: StoredDonorProfile): Promise<void> {
    if (isDatabaseConnected()) {
      await DonorProfileModel.findOneAndUpdate({ _id: profile._id }, profile, { upsert: true, new: true });
    }
  }

  async persistInstitution(inst: StoredInstitution): Promise<void> {
    if (isDatabaseConnected()) {
      await InstitutionModel.findOneAndUpdate({ _id: inst._id }, inst, { upsert: true, new: true });
    }
  }

  async persistBloodRequest(req: StoredBloodRequest): Promise<void> {
    if (isDatabaseConnected()) {
      await BloodRequestModel.findOneAndUpdate({ _id: req._id }, req, { upsert: true, new: true });
    }
  }

  async persistInstitutionRequest(req: StoredInstitutionRequest): Promise<void> {
    if (isDatabaseConnected()) {
      await InstitutionRequestModel.findOneAndUpdate({ _id: req._id }, req, { upsert: true, new: true });
    }
  }

  async persistContactRequest(req: StoredContactRequest): Promise<void> {
    if (isDatabaseConnected()) {
      await ContactRequestModel.findOneAndUpdate({ _id: req._id }, req, { upsert: true, new: true });
    }
  }

  async persistModeratorActivity(act: StoredModeratorActivity): Promise<void> {
    if (isDatabaseConnected()) {
      await ModeratorActivityModel.create(act);
    }
  }

  async persistAccountStatusHistory(hist: StoredAccountStatusHistory): Promise<void> {
    if (isDatabaseConnected()) {
      await AccountStatusHistoryModel.create(hist);
    }
  }

  async persistReport(rep: StoredReport): Promise<void> {
    if (isDatabaseConnected()) {
      await ReportModel.findOneAndUpdate({ _id: rep._id }, rep, { upsert: true, new: true });
    }
  }

  async persistContactAccessLog(cal: StoredContactAccessLog): Promise<void> {
    if (isDatabaseConnected()) {
      await ContactAccessLogModel.create(cal);
    }
  }

  async persistNotification(n: StoredNotification): Promise<void> {
    if (isDatabaseConnected()) {
      await NotificationModel.create(n);
    }
  }

  async persistPhoneChangeRequest(pcr: StoredPhoneChangeRequest): Promise<void> {
    if (isDatabaseConnected()) {
      await PhoneChangeRequestModel.findOneAndUpdate({ _id: pcr._id }, pcr, { upsert: true, new: true });
    }
  }

  async persistPasswordRecoveryRequest(prr: StoredPasswordRecoveryRequest): Promise<void> {
    if (isDatabaseConnected()) {
      await PasswordRecoveryRequestModel.findOneAndUpdate({ _id: prr._id }, prr, { upsert: true, new: true });
    }
  }

  async persistInstitutionChangeRequest(icr: StoredInstitutionChangeRequest): Promise<void> {
    if (isDatabaseConnected()) {
      await InstitutionChangeRequestModel.findOneAndUpdate({ _id: icr._id }, icr, { upsert: true, new: true });
    }
  }

  // --- User Methods ---
  async findUserById(id: string): Promise<StoredUser | undefined> {
    if (!id) return undefined;
    if (isDatabaseConnected()) {
      try {
        const doc = await UserModel.findOne({ _id: id }).lean();
        if (doc) {
          const u = doc as any;
          const idx = this.users.findIndex(item => item._id === id);
          if (idx >= 0) this.users[idx] = u;
          else this.users.push(u);
          return u;
        }
      } catch (e: any) {
        console.warn('[DataStore] findUserById DB query error:', e?.message);
      }
    }
    return this.findUserByIdSync(id);
  }

  findUserByIdSync(id: string): StoredUser | undefined {
    return this.users.find(u => String(u._id) === String(id));
  }

  async findUserByPhone(phone: string): Promise<StoredUser | undefined> {
    if (!phone) return undefined;
    if (isDatabaseConnected()) {
      try {
        const doc = await UserModel.findOne({ phone }).lean();
        if (doc) {
          const u = doc as any;
          const idx = this.users.findIndex(item => item.phone === phone);
          if (idx >= 0) this.users[idx] = u;
          else this.users.push(u);
          return u;
        }
      } catch (e: any) {
        console.warn('[DataStore] findUserByPhone DB query error:', e?.message);
      }
    }
    return this.findUserByPhoneSync(phone);
  }

  findUserByPhoneSync(phone: string): StoredUser | undefined {
    return this.users.find(u => u.phone === phone);
  }

  createUserSync(userData: Partial<StoredUser>): StoredUser {
    this.assertWritable();
    const newUser: StoredUser = {
      _id: userData._id || ('usr_' + Date.now() + Math.random().toString(36).substring(2, 7)),
      name: userData.name || '',
      phone: userData.phone || '',
      email: userData.email,
      passwordHash: userData.passwordHash || '$2a$10$defaultHashPlaceholderNeverValidForLoginWithoutExplicitPassword',
      role: userData.role || 'MEMBER',
      accountStatus: userData.accountStatus || 'active',
      blockReason: userData.blockReason,
      blockedBy: userData.blockedBy,
      blockedAt: userData.blockedAt,
      gender: userData.gender || 'unspecified',
      femaleSafetyAcknowledged: userData.femaleSafetyAcknowledged || false,
      femalePublicPhoneConsent: userData.femalePublicPhoneConsent || false,
      assignedDivision: userData.assignedDivision,
      assignedInstitution: userData.assignedInstitution,
      assignedInstitutions: userData.assignedInstitutions || (userData.assignedInstitution ? [userData.assignedInstitution] : []),
      requirePasswordChangeAtFirstLogin: userData.requirePasswordChangeAtFirstLogin || false,
      createdByModeratorId: userData.createdByModeratorId,
      division: userData.division,
      district: userData.district,
      upazila: userData.upazila,
      isActive: userData.accountStatus ? (userData.accountStatus === 'active') : true,
      isPhoneVerified: userData.isPhoneVerified || false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.push(newUser);
    this.persistUser(newUser);
    return newUser;
  }

  async createUser(userData: Partial<StoredUser>): Promise<StoredUser> {
    const user = this.createUserSync(userData);
    await this.persistUser(user);
    return user;
  }

  async updateUser(id: string, update: Partial<StoredUser>): Promise<StoredUser | null> {
    this.assertWritable();
    let user: StoredUser | null = null;
    if (isDatabaseConnected()) {
      try {
        const doc = await UserModel.findOneAndUpdate(
          { _id: id },
          { ...update, updatedAt: new Date() },
          { new: true }
        ).lean();
        if (doc) {
          user = doc as any;
          const idx = this.users.findIndex(u => u._id === id);
          if (idx >= 0) this.users[idx] = user!;
          else this.users.push(user!);
          return user;
        }
      } catch (e: any) {
        console.warn('[DataStore] updateUser DB error:', e?.message);
      }
    }
    const memUser = this.findUserByIdSync(id);
    if (!memUser) return null;
    Object.assign(memUser, update, { updatedAt: new Date() });
    await this.persistUser(memUser);
    return memUser;
  }

  // --- Manual Member Creation with Temporary Password ---
  createMemberWithTemporaryPassword(params: {
    name: string;
    phone: string;
    gender: GenderType;
    bloodGroup: BloodGroup;
    division: string;
    district: string;
    upazila: string;
    institutionId: string;
    moderatorId: string;
    moderatorName: string;
    consentToShareContact?: boolean;
    dateOfBirth?: Date;
  }): { user: StoredUser; donorProfile: StoredDonorProfile; temporaryPassword: string } {
    // Generate secure temporary password
    const temporaryPassword = 'Temp#' + crypto.randomInt(100000, 1000000);
    const passwordHash = bcrypt.hashSync(temporaryPassword, 10);

    const newUser = this.createUserSync({
      name: params.name,
      phone: params.phone,
      passwordHash,
      role: 'MEMBER',
      accountStatus: 'active',
      gender: params.gender,
      division: params.division,
      district: params.district,
      upazila: params.upazila,
      assignedInstitution: params.institutionId,
      createdByModeratorId: params.moderatorId,
      requirePasswordChangeAtFirstLogin: true,
      isActive: true,
      isPhoneVerified: true
    });

    const newProfile = this.createDonorProfileSync({
      userId: newUser._id,
      displayName: params.name,
      bloodGroup: params.bloodGroup,
      division: params.division,
      district: params.district,
      upazila: params.upazila,
      dateOfBirth: params.dateOfBirth || new Date('2002-01-01'),
      gender: params.gender,
      availabilityStatus: 'available',
      institutionId: params.institutionId,
      institutionMembershipVerified: true,
      consentToShareContact: params.consentToShareContact !== false,
      isPubliclyListed: true,
      emergencyAvailable: true
    });

    // Increment institution total registered donors
    const inst = this.findInstitutionByIdSync(params.institutionId);
    if (inst) {
      inst.totalRegisteredDonors = (inst.totalRegisteredDonors || 0) + 1;
    }

    // Log in Moderator Activity
    this.logModeratorActivity({
      actorId: params.moderatorId,
      actorName: params.moderatorName,
      actorRole: 'INSTITUTION_MODERATOR',
      action: 'MEMBER_CREATED',
      targetRecordId: newUser._id,
      targetRecordType: 'User',
      institutionScope: params.institutionId,
      divisionScope: params.division,
      reason: 'প্রতিষ্ঠান মডারেটর কর্তৃক ম্যানুয়াল সদস্য তৈরি।'
    });

    return { user: newUser, donorProfile: newProfile, temporaryPassword };
  }

  changeFirstLoginPassword(userId: string, newPassword: string): boolean {
    const user = this.findUserByIdSync(userId);
    if (!user) return false;
    user.passwordHash = bcrypt.hashSync(newPassword, 10);
    user.requirePasswordChangeAtFirstLogin = false;
    user.updatedAt = new Date();
    this.persistUser(user);
    return true;
  }

  // --- Centralized Account Blocking & Unblocking ---
  blockUser(params: {
    userId: string;
    actorId: string;
    actorName: string;
    actorRole: string;
    reason: string;
    newStatus?: AccountStatus;
  }): { success: boolean; message: string } {
    const targetUser = this.findUserByIdSync(params.userId);
    if (!targetUser) {
      return { success: false, message: 'ব্যবহারকারী খুঁজে পাওয়া যায়নি।' };
    }

    // Safeguard: Never block the last active Super Admin
    if (targetUser.role === 'SUPER_ADMIN') {
      const activeSuperAdmins = this.users.filter(u => u.role === 'SUPER_ADMIN' && u.isActive && u.accountStatus === 'active');
      if (activeSuperAdmins.length <= 1) {
        return { success: false, message: 'সুরক্ষা সতর্কতা: প্ল্যাটফর্মের একমাত্র সক্রিয় সুপার অ্যাডমিনকে স্থগিত করা অসম্ভব।' };
      }
    }

    const oldStatus = targetUser.accountStatus || (targetUser.isActive ? 'active' : 'suspended');
    const newStatus = params.newStatus || 'temporarily_blocked';

    targetUser.accountStatus = newStatus;
    targetUser.isActive = false;
    targetUser.blockReason = params.reason;
    targetUser.blockedBy = params.actorId;
    targetUser.blockedAt = new Date();
    targetUser.updatedAt = new Date();
    this.persistUser(targetUser);

    // Record in AccountStatusHistory
    const histEntry: StoredAccountStatusHistory = {
      _id: 'ash_' + Date.now() + Math.random().toString(36).substring(2, 6),
      userId: targetUser._id,
      targetUserName: targetUser.name,
      targetUserPhone: targetUser.phone,
      oldStatus,
      newStatus,
      actorId: params.actorId,
      actorName: params.actorName,
      actorRole: params.actorRole,
      reason: params.reason,
      createdAt: new Date()
    };
    this.accountStatusHistories.unshift(histEntry);
    this.persistAccountStatusHistory(histEntry);

    // Record in ModeratorActivity if actor is moderator or coordinator
    this.logModeratorActivity({
      actorId: params.actorId,
      actorName: params.actorName,
      actorRole: params.actorRole,
      action: 'MEMBER_BLOCKED',
      targetRecordId: targetUser._id,
      targetRecordType: 'User',
      divisionScope: targetUser.division,
      institutionScope: targetUser.assignedInstitution,
      reason: params.reason,
      result: newStatus
    });

    return { success: true, message: `ব্যবহারকারী অ্যাকাউন্ট সফলভাবে স্থগিত (${newStatus}) করা হয়েছে।` };
  }

  unblockUser(params: {
    userId: string;
    actorId: string;
    actorName: string;
    actorRole: string;
    reason: string;
  }): { success: boolean; message: string } {
    const targetUser = this.findUserByIdSync(params.userId);
    if (!targetUser) {
      return { success: false, message: 'ব্যবহারকারী খুঁজে পাওয়া যায়নি।' };
    }

    const oldStatus = targetUser.accountStatus || 'temporarily_blocked';
    targetUser.accountStatus = 'active';
    targetUser.isActive = true;
    targetUser.blockReason = undefined;
    targetUser.blockedBy = undefined;
    targetUser.blockedAt = undefined;
    targetUser.updatedAt = new Date();
    this.persistUser(targetUser);

    // Record in AccountStatusHistory
    const histEntry: StoredAccountStatusHistory = {
      _id: 'ash_' + Date.now() + Math.random().toString(36).substring(2, 6),
      userId: targetUser._id,
      targetUserName: targetUser.name,
      targetUserPhone: targetUser.phone,
      oldStatus,
      newStatus: 'active',
      actorId: params.actorId,
      actorName: params.actorName,
      actorRole: params.actorRole,
      reason: params.reason,
      createdAt: new Date()
    };
    this.accountStatusHistories.unshift(histEntry);
    this.persistAccountStatusHistory(histEntry);

    // Record in ModeratorActivity
    this.logModeratorActivity({
      actorId: params.actorId,
      actorName: params.actorName,
      actorRole: params.actorRole,
      action: 'MEMBER_UNBLOCKED',
      targetRecordId: targetUser._id,
      targetRecordType: 'User',
      divisionScope: targetUser.division,
      institutionScope: targetUser.assignedInstitution,
      reason: params.reason,
      result: 'active'
    });

    return { success: true, message: 'ব্যবহারকারী অ্যাকাউন্ট সফলভাবে পুনরুদ্ধার ও সক্রিয় করা হয়েছে।' };
  }

  getBlockedUsers(division?: string) {
    let list = this.users.filter(u => 
      u.accountStatus === 'temporarily_blocked' || 
      u.accountStatus === 'suspended' || 
      u.accountStatus === 'deactivated' || 
      !u.isActive
    );
    if (division) {
      list = list.filter(u => u.division?.toLowerCase() === division.toLowerCase() || u.assignedDivision?.toLowerCase() === division.toLowerCase());
    }
    return list;
  }

  // --- Donor Profile Methods ---
  async findDonorProfileByUserId(userId: string): Promise<StoredDonorProfile | undefined> {
    if (!userId) return undefined;
    if (isDatabaseConnected()) {
      try {
        const doc = await DonorProfileModel.findOne({ userId }).lean();
        if (doc) {
          const profile = doc as any;
          const idx = this.donorProfiles.findIndex(d => d.userId === userId);
          if (idx >= 0) this.donorProfiles[idx] = profile;
          else this.donorProfiles.push(profile);
          return profile;
        }
      } catch (e: any) {
        console.warn('[DataStore] findDonorProfileByUserId DB error:', e?.message);
      }
    }
    return this.findDonorProfileByUserIdSync(userId);
  }

  findDonorProfileByUserIdSync(userId: string): StoredDonorProfile | undefined {
    return this.donorProfiles.find(d => String(d.userId) === String(userId));
  }

  async findDonorProfileById(id: string): Promise<StoredDonorProfile | undefined> {
    if (!id) return undefined;
    let prof: StoredDonorProfile | undefined;
    if (isDatabaseConnected()) {
      try {
        const doc = await DonorProfileModel.findOne({ _id: id }).lean();
        if (doc) {
          const profile = doc as any;
          const idx = this.donorProfiles.findIndex(d => d._id === id);
          if (idx >= 0) this.donorProfiles[idx] = profile;
          else this.donorProfiles.push(profile);
          prof = profile;
        }
      } catch (e: any) {
        console.warn('[DataStore] findDonorProfileById DB error:', e?.message);
      }
    }
    if (!prof) prof = this.findDonorProfileByIdSync(id);
    if (this.suppressDemoData && prof && isConfirmedDemoDonor(prof)) {
      return undefined;
    }
    return prof;
  }

  findDonorProfileByIdSync(id: string): StoredDonorProfile | undefined {
    const prof = this.donorProfiles.find(d => String(d._id) === String(id));
    if (this.suppressDemoData && prof && isConfirmedDemoDonor(prof)) {
      return undefined;
    }
    return prof;
  }

  createDonorProfileSync(data: Partial<StoredDonorProfile>): StoredDonorProfile {
    this.assertWritable();
    const newProfile: StoredDonorProfile = {
      _id: data._id || ('donor_prof_' + Date.now() + Math.random().toString(36).substring(2, 7)),
      userId: data.userId || '',
      displayName: data.displayName || '',
      bloodGroup: data.bloodGroup || 'A+',
      division: data.division || 'dhaka',
      district: data.district || 'dhaka',
      upazila: data.upazila || '',
      addressDetails: data.addressDetails,
      dateOfBirth: data.dateOfBirth || new Date('2000-01-01'),
      gender: data.gender || 'unspecified',
      availabilityStatus: data.availabilityStatus || 'available',
      lastDonationDate: data.lastDonationDate,
      totalDonations: data.totalDonations || 0,
      institutionId: data.institutionId,
      institutionMembershipVerified: data.institutionMembershipVerified || false,
      consentToShareContact: data.consentToShareContact !== false,
      preferredContactMethod: data.preferredContactMethod || 'phone',
      bio: data.bio,
      isPubliclyListed: data.isPubliclyListed !== false,
      emergencyAvailable: data.emergencyAvailable !== false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.donorProfiles.push(newProfile);
    this.persistDonorProfile(newProfile);
    return newProfile;
  }

  async createDonorProfile(data: Partial<StoredDonorProfile>): Promise<StoredDonorProfile> {
    const profile = this.createDonorProfileSync(data);
    await this.persistDonorProfile(profile);
    return profile;
  }

  async updateDonorProfile(userId: string, update: Partial<StoredDonorProfile>): Promise<StoredDonorProfile | null> {
    this.assertWritable();
    let profile: StoredDonorProfile | null = null;
    if (isDatabaseConnected()) {
      try {
        const doc = await DonorProfileModel.findOneAndUpdate(
          { userId },
          { ...update, updatedAt: new Date() },
          { new: true }
        ).lean();
        if (doc) {
          profile = doc as any;
          const idx = this.donorProfiles.findIndex(d => d.userId === userId);
          if (idx >= 0) this.donorProfiles[idx] = profile!;
          else this.donorProfiles.push(profile!);
          return profile;
        }
      } catch (e: any) {
        console.warn('[DataStore] updateDonorProfile DB error:', e?.message);
      }
    }
    const memProf = this.findDonorProfileByUserIdSync(userId);
    if (!memProf) return null;
    Object.assign(memProf, update, { updatedAt: new Date() });
    await this.persistDonorProfile(memProf);
    return memProf;
  }

  async searchDonors(filters: {
    bloodGroup?: string;
    division?: string;
    district?: string;
    upazila?: string;
    institutionId?: string;
    availabilityStatus?: string;
    limit?: number;
    page?: number;
  }) {
    if (isDatabaseConnected()) {
      try {
        const query: any = {
          isPubliclyListed: { $ne: false }
        };

        if (filters.bloodGroup) query.bloodGroup = filters.bloodGroup;
        if (filters.division) query.division = new RegExp(`^${escapeRegex(filters.division)}$`, 'i');
        if (filters.district) query.district = new RegExp(`^${escapeRegex(filters.district)}$`, 'i');
        if (filters.upazila) query.upazila = new RegExp(`^${escapeRegex(filters.upazila)}$`, 'i');
        if (filters.institutionId) query.institutionId = filters.institutionId;
        if (filters.availabilityStatus) query.availabilityStatus = filters.availabilityStatus;

        const total = await DonorProfileModel.countDocuments(query);
        const page = filters.page || 1;
        const limit = filters.limit || 10;
        const skip = (page - 1) * limit;

        const profiles = await DonorProfileModel.find(query)
          .skip(skip)
          .limit(limit)
          .lean();

        const userIds = profiles.map(p => String(p.userId));
        const users = await UserModel.find({ _id: { $in: userIds } }).select('_id phone accountStatus isActive').lean();
        const activeUserMap = new Map(
          users.filter(u => u.accountStatus === 'active' && u.isActive !== false)
               .map(u => [String(u._id), u.phone])
        );

        const instIds = profiles.map(p => p.institutionId).filter(Boolean);
        const insts = await InstitutionModel.find({ _id: { $in: instIds } }).lean();
        const instMap = new Map(insts.map(i => [String(i._id), i.nameBn || i.name]));

        let safeDonors = profiles
          .filter(p => activeUserMap.has(String(p.userId)))
          .map(p => {
            const isPublicContactAllowed = Boolean(p.consentToShareContact);
            return {
              _id: p._id,
              displayName: p.displayName,
              bloodGroup: p.bloodGroup,
              division: p.division,
              district: p.district,
              upazila: p.upazila,
              availabilityStatus: p.availabilityStatus,
              lastDonationDate: p.lastDonationDate,
              totalDonations: p.totalDonations,
              institutionName: p.institutionId ? instMap.get(String(p.institutionId)) : undefined,
              institutionId: p.institutionId,
              institutionMembershipVerified: p.institutionMembershipVerified,
              emergencyAvailable: p.emergencyAvailable,
              consentToShareContact: isPublicContactAllowed,
              phone: isPublicContactAllowed ? activeUserMap.get(String(p.userId)) : undefined,
              bio: p.bio,
              createdAt: p.createdAt
            };
          });

        if (this.suppressDemoData) {
          safeDonors = safeDonors.filter(p => !isConfirmedDemoDonor(p));
        }

        const effectiveTotal = this.suppressDemoData ? safeDonors.length : total;
        return {
          donors: safeDonors,
          total: effectiveTotal,
          page,
          totalPages: Math.ceil(effectiveTotal / limit)
        };
      } catch (e: any) {
        console.warn('[DataStore] searchDonors DB error:', e?.message);
        if (ENV.NODE_ENV === 'production' || process.env.VERCEL) {
          const err: any = new Error('ডাটাবেজ সার্ভারের সাথে সংযোগ স্থাপন করা যায়নি। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।');
          err.statusCode = 503;
          err.code = 'DATABASE_UNAVAILABLE';
          throw err;
        }
      }
    } else if (ENV.NODE_ENV === 'production' || process.env.VERCEL) {
      const err: any = new Error('ডাটাবেজ সার্ভারের সাথে সংযোগ স্থাপন করা যায়নি। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।');
      err.statusCode = 503;
      err.code = 'DATABASE_UNAVAILABLE';
      throw err;
    }
    return this.searchDonorsSync(filters);
  }

    searchDonorsSync(filters: {
    bloodGroup?: string;
    division?: string;
    district?: string;
    upazila?: string;
    institutionId?: string;
    availabilityStatus?: string;
    limit?: number;
    page?: number;
  }) {
    let result = this.donorProfiles.filter(d => {
      const user = this.findUserByIdSync(d.userId);
      return d.isPubliclyListed && user && user.accountStatus === 'active' && user.isActive;
    });

    if (this.suppressDemoData) {
      result = result.filter(d => !isConfirmedDemoDonor(d));
    }

    if (filters.bloodGroup) {
      result = result.filter(d => d.bloodGroup.toLowerCase() === filters.bloodGroup?.toLowerCase());
    }
    if (filters.division) {
      result = result.filter(d => d.division.toLowerCase() === filters.division?.toLowerCase());
    }
    if (filters.district) {
      result = result.filter(d => d.district.toLowerCase() === filters.district?.toLowerCase());
    }
    if (filters.upazila) {
      result = result.filter(d => d.upazila.toLowerCase() === filters.upazila?.toLowerCase());
    }
    if (filters.institutionId) {
      result = result.filter(d => d.institutionId === filters.institutionId);
    }
    if (filters.availabilityStatus) {
      result = result.filter(d => d.availabilityStatus === filters.availabilityStatus);
    }

    const total = result.length;
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const startIndex = (page - 1) * limit;
    const paginated = result.slice(startIndex, startIndex + limit);

    const safeDonors = paginated.map(p => {
      const institution = p.institutionId ? this.findInstitutionByIdSync(p.institutionId) : undefined;
      const donorUser = this.findUserByIdSync(p.userId);
      const isPublicContactAllowed = Boolean(p.consentToShareContact);

      return {
        _id: p._id,
        displayName: p.displayName,
        bloodGroup: p.bloodGroup,
        division: p.division,
        district: p.district,
        upazila: p.upazila,
        availabilityStatus: p.availabilityStatus,
        lastDonationDate: p.lastDonationDate,
        totalDonations: p.totalDonations,
        institutionName: institution?.nameBn || institution?.name,
        institutionId: p.institutionId,
        institutionMembershipVerified: p.institutionMembershipVerified,
        emergencyAvailable: p.emergencyAvailable,
        consentToShareContact: isPublicContactAllowed,
        phone: isPublicContactAllowed ? donorUser?.phone : undefined,
        bio: p.bio,
        createdAt: p.createdAt
      };
    });

    return {
      donors: safeDonors,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  // --- Blood Request Methods ---
  async findBloodRequestById(idOrPublicId: string): Promise<StoredBloodRequest | undefined> {
    if (!idOrPublicId) return undefined;
    const target = String(idOrPublicId).trim();
    let req: StoredBloodRequest | undefined;
    if (isDatabaseConnected()) {
      try {
        const doc = await BloodRequestModel.findOne({
          $or: [
            { _id: target },
            { publicId: target },
            { publicId: target.toUpperCase() }
          ]
        }).lean();
        if (doc) {
          const stored = doc as any;
          const idx = this.bloodRequests.findIndex(r => r._id === stored._id);
          if (idx >= 0) this.bloodRequests[idx] = stored;
          else this.bloodRequests.unshift(stored);
          req = stored;
        }
      } catch (e: any) {
        console.warn('[DataStore] findBloodRequestById DB error:', e?.message);
      }
    }
    if (!req) req = this.findBloodRequestByIdSync(target);
    if (this.suppressDemoData && req && isConfirmedDemoRequest(req)) {
      return undefined;
    }
    return req;
  }

  findBloodRequestByIdSync(idOrPublicId: string): StoredBloodRequest | undefined {
    if (!idOrPublicId) return undefined;
    const target = String(idOrPublicId).toLowerCase().trim();
    const req = this.bloodRequests.find(r => 
      String(r._id).toLowerCase() === target || 
      (r.publicId && String(r.publicId).toLowerCase() === target)
    );
    if (this.suppressDemoData && req && isConfirmedDemoRequest(req)) {
      return undefined;
    }
    return req;
  }

  createBloodRequestSync(data: Partial<StoredBloodRequest>): StoredBloodRequest {
    this.assertWritable();
    const randPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    const timePart = Date.now().toString(36).toUpperCase().slice(-4);
    const generatedPublicId = 'BR-' + timePart + '-' + randPart;

    const newReq: StoredBloodRequest = {
      _id: data._id || ('req_' + Date.now() + Math.random().toString(36).substring(2, 7)),
      publicId: data.publicId || generatedPublicId,
      requesterId: data.requesterId || '',
      patientName: data.patientName || '',
      bloodGroup: data.bloodGroup || 'A+',
      unitsRequired: data.unitsRequired || 1,
      unitsFulfilled: data.unitsFulfilled || 0,
      hospitalName: data.hospitalName || '',
      hospitalAddress: data.hospitalAddress || '',
      division: data.division || 'dhaka',
      district: data.district || 'dhaka',
      upazila: data.upazila || '',
      requiredDate: data.requiredDate || new Date(),
      requiredWithin: data.requiredWithin,
      urgencyLevel: data.urgencyLevel || 'emergency',
      reason: data.reason || '',
      contactPersonName: data.contactPersonName,
      contactNumber: data.contactNumber || '',
      alternativeContactNumber: data.alternativeContactNumber,
      additionalNotes: data.additionalNotes,
      consentForPublicShare: data.consentForPublicShare ?? true,
      status: data.status || 'open',
      statusHistory: data.statusHistory || [
        {
          status: data.status || 'open',
          unitsFulfilled: data.unitsFulfilled || 0,
          changedBy: data.requesterId || 'system',
          changedAt: new Date(),
          notes: 'রক্তের আবেদন তৈরি করা হয়েছে।'
        }
      ],
      moderationNotes: data.moderationNotes,
      institutionId: data.institutionId,
      expiresAt: data.expiresAt || new Date(Date.now() + 86400000 * 3),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.bloodRequests.unshift(newReq);
    this.persistBloodRequest(newReq);
    return newReq;
  }

  async createBloodRequest(data: Partial<StoredBloodRequest>): Promise<StoredBloodRequest> {
    const req = this.createBloodRequestSync(data);
    await this.persistBloodRequest(req);
    return req;
  }

  async updateBloodRequest(id: string, update: Partial<StoredBloodRequest>): Promise<StoredBloodRequest | null> {
    this.assertWritable();
    let req: StoredBloodRequest | null = null;
    if (isDatabaseConnected()) {
      try {
        const doc = await BloodRequestModel.findOneAndUpdate(
          { $or: [{ _id: id }, { publicId: id }] },
          { ...update, updatedAt: new Date() },
          { new: true }
        ).lean();
        if (doc) {
          req = doc as any;
          const idx = this.bloodRequests.findIndex(r => r._id === req!._id);
          if (idx >= 0) this.bloodRequests[idx] = req!;
          else this.bloodRequests.unshift(req!);
          return req;
        }
      } catch (e: any) {
        console.warn('[DataStore] updateBloodRequest DB error:', e?.message);
      }
    }
    const memReq = this.findBloodRequestByIdSync(id);
    if (!memReq) return null;
    Object.assign(memReq, update, { updatedAt: new Date() });
    await this.persistBloodRequest(memReq);
    return memReq;
  }

  async searchBloodRequests(filters: {
    bloodGroup?: string;
    division?: string;
    district?: string;
    upazila?: string;
    status?: string;
    urgencyLevel?: string;
    institutionId?: string;
    limit?: number;
    page?: number;
  }) {
    if (isDatabaseConnected()) {
      try {
        const query: any = {};
        if (filters.status) {
          query.status = filters.status;
        } else {
          query.status = { $in: ['open', 'partially_fulfilled'] };
        }
        if (filters.bloodGroup) query.bloodGroup = filters.bloodGroup;
        if (filters.division) query.division = new RegExp(`^${escapeRegex(filters.division)}$`, 'i');
        if (filters.district) query.district = new RegExp(`^${escapeRegex(filters.district)}$`, 'i');
        if (filters.upazila) query.upazila = new RegExp(`^${escapeRegex(filters.upazila)}$`, 'i');
        if (filters.urgencyLevel) query.urgencyLevel = filters.urgencyLevel;
        if (filters.institutionId) query.institutionId = filters.institutionId;

        const total = await BloodRequestModel.countDocuments(query);
        const page = filters.page || 1;
        const limit = filters.limit || 10;
        const skip = (page - 1) * limit;

        const docs = await BloodRequestModel.find(query)
          .sort({
            urgencyLevel: -1,
            requiredDate: 1
          })
          .skip(skip)
          .limit(limit)
          .lean();

        const now = new Date();
        let results = (docs as any[]).map(r => {
          if ((r.status === 'open' || r.status === 'partially_fulfilled') && new Date(r.expiresAt) < now) {
            r.status = 'expired';
          }
          return r;
        });

        if (this.suppressDemoData) {
          results = results.filter(r => !isConfirmedDemoRequest(r));
        }

        const effectiveTotal = this.suppressDemoData ? results.length : total;
        return {
          requests: results,
          total: effectiveTotal,
          page,
          totalPages: Math.ceil(effectiveTotal / limit)
        };
      } catch (e: any) {
        console.warn('[DataStore] searchBloodRequests DB error:', e?.message);
        if (ENV.NODE_ENV === 'production' || process.env.VERCEL) {
          const err: any = new Error('ডাটাবেজ সার্ভারের সাথে সংযোগ স্থাপন করা যায়নি। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।');
          err.statusCode = 503;
          err.code = 'DATABASE_UNAVAILABLE';
          throw err;
        }
      }
    } else if (ENV.NODE_ENV === 'production' || process.env.VERCEL) {
      const err: any = new Error('ডাটাবেজ সার্ভারের সাথে সংযোগ স্থাপন করা যায়নি। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।');
      err.statusCode = 503;
      err.code = 'DATABASE_UNAVAILABLE';
      throw err;
    }
    return this.searchBloodRequestsSync(filters);
  }

  searchBloodRequestsSync(filters: {
    bloodGroup?: string;
    division?: string;
    district?: string;
    upazila?: string;
    status?: string;
    urgencyLevel?: string;
    institutionId?: string;
    limit?: number;
    page?: number;
  }) {
    let result = [...this.bloodRequests];
    if (this.suppressDemoData) {
      result = result.filter(r => !isConfirmedDemoRequest(r));
    }

    const now = new Date();
    result.forEach(r => {
      if ((r.status === 'open' || r.status === 'partially_fulfilled') && new Date(r.expiresAt) < now) {
        r.status = 'expired';
      }
    });

    if (filters.status) {
      result = result.filter(r => r.status === filters.status);
    } else {
      result = result.filter(r => r.status === 'open' || r.status === 'partially_fulfilled');
    }

    if (filters.bloodGroup) {
      result = result.filter(r => r.bloodGroup.toLowerCase() === filters.bloodGroup?.toLowerCase());
    }
    if (filters.division) {
      result = result.filter(r => r.division.toLowerCase() === filters.division?.toLowerCase());
    }
    if (filters.district) {
      result = result.filter(r => r.district.toLowerCase() === filters.district?.toLowerCase());
    }
    if (filters.upazila) {
      result = result.filter(r => r.upazila.toLowerCase() === filters.upazila?.toLowerCase());
    }
    if (filters.urgencyLevel) {
      result = result.filter(r => r.urgencyLevel === filters.urgencyLevel);
    }
    if (filters.institutionId) {
      result = result.filter(r => r.institutionId === filters.institutionId);
    }

    result.sort((a, b) => {
      if (a.urgencyLevel === 'emergency' && b.urgencyLevel !== 'emergency') return -1;
      if (b.urgencyLevel === 'emergency' && a.urgencyLevel !== 'emergency') return 1;
      return new Date(a.requiredDate).getTime() - new Date(b.requiredDate).getTime();
    });

    const total = result.length;
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const startIndex = (page - 1) * limit;
    const paginated = result.slice(startIndex, startIndex + limit);

    return {
      requests: paginated,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  // --- Institution Methods ---
  async findInstitutionById(id: string): Promise<StoredInstitution | undefined> {
    if (!id) return undefined;
    if (isDatabaseConnected()) {
      try {
        const doc = await InstitutionModel.findOne({ _id: id }).lean();
        if (doc) return doc as any;
      } catch (e: any) {
        console.warn('[DataStore] findInstitutionById DB error:', e?.message);
      }
    }
    return this.findInstitutionByIdSync(id);
  }

  findInstitutionByIdSync(id: string): StoredInstitution | undefined {
    return this.institutions.find(i => String(i._id) === String(id));
  }

  async getInstitutions(filters: { division?: string; status?: string; search?: string }) {
    if (isDatabaseConnected()) {
      try {
        const query: any = {};
        if (filters.division) {
          query.division = new RegExp(`^${escapeRegex(filters.division)}$`, 'i');
        }
        if (filters.status) {
          query.status = filters.status;
        } else {
          query.status = 'approved';
        }
        if (filters.search) {
          const s = escapeRegex(filters.search.trim());
          query.$or = [
            { name: new RegExp(s, 'i') },
            { nameBn: new RegExp(s, 'i') },
            { code: new RegExp(s, 'i') }
          ];
        }
        const docs = await InstitutionModel.find(query).sort({ nameBn: 1, name: 1 }).lean();
        return docs as any[];
      } catch (e: any) {
        console.warn('[DataStore] getInstitutions DB error:', e?.message);
        if (ENV.NODE_ENV === 'production' || process.env.VERCEL) {
          const err: any = new Error('ডাটাবেজ সার্ভারের সাথে সংযোগ স্থাপন করা যায়নি। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।');
          err.statusCode = 503;
          err.code = 'DATABASE_UNAVAILABLE';
          throw err;
        }
      }
    } else if (ENV.NODE_ENV === 'production' || process.env.VERCEL) {
      const err: any = new Error('ডাটাবেজ সার্ভারের সাথে সংযোগ স্থাপন করা যায়নি। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।');
      err.statusCode = 503;
      err.code = 'DATABASE_UNAVAILABLE';
      throw err;
    }
    return this.getInstitutionsSync(filters);
  }

  getInstitutionsSync(filters: { division?: string; status?: string; search?: string }) {
    let result = [...this.institutions];
    if (filters.status) {
      result = result.filter(i => i.status === filters.status);
    }
    if (filters.division) {
      result = result.filter(i => i.division.toLowerCase() === filters.division?.toLowerCase());
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(i => 
        i.name.toLowerCase().includes(q) || 
        i.nameBn.includes(q) || 
        i.code.toLowerCase().includes(q)
      );
    }
    return result;
  }

  async createInstitution(data: Partial<StoredInstitution>): Promise<StoredInstitution> {
    this.assertWritable();
    const newInst: StoredInstitution = {
      _id: data._id || ('inst_' + Date.now() + Math.random().toString(36).substring(2, 7)),
      name: data.name || '',
      nameBn: data.nameBn || data.name || '',
      code: data.code?.toUpperCase() || 'INST-' + Date.now(),
      type: data.type || 'university',
      division: data.division || 'dhaka',
      district: data.district || 'dhaka',
      upazila: data.upazila || '',
      address: data.address || '',
      website: data.website,
      email: data.email,
      phone: data.phone,
      status: data.status || 'pending',
      assignedModeratorId: data.assignedModeratorId,
      assignedModeratorIds: data.assignedModeratorId ? [data.assignedModeratorId] : [],
      totalRegisteredDonors: 0,
      description: data.description,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.institutions.push(newInst);
    await this.persistInstitution(newInst);
    return newInst;
  }

  async updateInstitution(id: string, update: Partial<StoredInstitution>): Promise<StoredInstitution | null> {
    this.assertWritable();
    const inst = this.findInstitutionByIdSync(id);
    if (!inst) return null;
    Object.assign(inst, update, { updatedAt: new Date() });
    await this.persistInstitution(inst);
    return inst;
  }

  // --- Institution Applications / Requests ---
  createInstitutionRequest(data: Partial<StoredInstitutionRequest>): StoredInstitutionRequest {
    const newReq: StoredInstitutionRequest = {
      _id: 'inst_req_' + Date.now() + Math.random().toString(36).substring(2, 6),
      name: data.name || '',
      nameBn: data.nameBn || data.name || '',
      code: data.code?.toUpperCase() || 'REQ-' + Date.now(),
      type: data.type || 'university',
      division: data.division || 'dhaka',
      district: data.district || 'dhaka',
      upazila: data.upazila || '',
      address: data.address || '',
      applicantName: data.applicantName || '',
      applicantPhone: data.applicantPhone || '',
      applicantEmail: data.applicantEmail,
      applicantRole: data.applicantRole,
      supportingDetails: data.supportingDetails,
      status: 'pending_review',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.institutionRequests.unshift(newReq);
    this.persistInstitutionRequest(newReq);

    // Notify Division Coordinator and Super Admin
    const coordinators = this.users.filter(u => 
      u.role === 'DIVISION_COORDINATOR' && 
      u.assignedDivision?.toLowerCase() === newReq.division.toLowerCase()
    );
    coordinators.forEach(coord => {
      this.createNotification({
        userId: coord._id,
        title: 'নতুন প্রতিষ্ঠান নিবন্ধন আবেদন',
        message: `${newReq.division} বিভাগে '${newReq.nameBn}' প্রতিষ্ঠান হিসেবে নিবন্ধনের আবেদন জমা দিয়েছে।`,
        type: 'institution_update'
      });
    });

    return newReq;
  }

  getInstitutionRequests(filters: { division?: string; status?: string }) {
    let list = [...this.institutionRequests];
    if (filters.division) {
      list = list.filter(r => r.division.toLowerCase() === filters.division?.toLowerCase());
    }
    if (filters.status) {
      list = list.filter(r => r.status === filters.status);
    }
    return list;
  }

  reviewInstitutionRequest(params: {
    requestId: string;
    reviewerId: string;
    reviewerRole: string;
    reviewerDivision?: string;
    status: 'approved' | 'rejected' | 'under_review';
    decisionReason: string;
  }): { success: boolean; message: string; institution?: StoredInstitution } {
    const req = this.institutionRequests.find(r => String(r._id) === String(params.requestId));
    if (!req) {
      return { success: false, message: 'আবেদনটি খুঁজে পাওয়া যায়নি।' };
    }

    // Authorization: Super Admin, Admin, or Coordinator of same division can approve/reject
    const allowedRoles = ['SUPER_ADMIN', 'ADMIN', 'DIVISION_COORDINATOR'];
    if (!allowedRoles.includes(params.reviewerRole)) {
      return { success: false, message: 'অননুমোদিত: আপনি প্রতিষ্ঠান আবেদন পর্যালোচনা করার ক্ষমতাপ্রাপ্ত নন।' };
    }

    if (params.reviewerRole === 'DIVISION_COORDINATOR' && params.reviewerDivision?.toLowerCase() !== req.division.toLowerCase()) {
      return { success: false, message: 'অননুমোদিত: আপনি কেবলমাত্র আপনার দায়িত্বপ্রাপ্ত বিভাগের আবেদন পর্যালোচনা করতে পারেন।' };
    }

    req.status = params.status;
    req.reviewedBy = params.reviewerId;
    req.decisionReason = params.decisionReason;
    req.reviewedAt = new Date();
    req.updatedAt = new Date();

    let createdInst: StoredInstitution | undefined;

    // If approved, create official institution record
    if (params.status === 'approved') {
      createdInst = this.createInstitution({
        name: req.name,
        nameBn: req.nameBn,
        code: req.code,
        type: req.type,
        division: req.division,
        district: req.district,
        upazila: req.upazila,
        address: req.address,
        status: 'approved',
        description: req.supportingDetails
      });
      req.createdInstitutionId = createdInst._id;
    }

    this.persistInstitutionRequest(req);

    return { 
      success: true, 
      message: params.status === 'approved' ? 'প্রতিষ্ঠান সফলভাবে অনুমোদিত ও যুক্ত হয়েছে।' : 'আবেদনটি বাতিল করা হয়েছে।',
      institution: createdInst
    };
  }

  // --- Moderator Activity Tracking ---
  logModeratorActivity(params: {
    actorId: string;
    actorName: string;
    actorRole: string;
    action: ActivityActionType;
    targetRecordId: string;
    targetRecordType: string;
    divisionScope?: string;
    institutionScope?: string;
    reason?: string;
    result?: string;
    details?: Record<string, any>;
  }): StoredModeratorActivity {
    const entry: StoredModeratorActivity = {
      _id: 'mact_' + Date.now() + Math.random().toString(36).substring(2, 6),
      actorId: params.actorId,
      actorName: params.actorName,
      actorRole: params.actorRole,
      action: params.action,
      targetRecordId: params.targetRecordId,
      targetRecordType: params.targetRecordType,
      divisionScope: params.divisionScope,
      institutionScope: params.institutionScope,
      reason: params.reason,
      result: params.result || 'সফল',
      details: params.details,
      createdAt: new Date()
    };
    this.moderatorActivities.unshift(entry);
    this.persistModeratorActivity(entry);
    return entry;
  }

  getModeratorActivities(filters: {
    actorId?: string;
    divisionScope?: string;
    institutionScope?: string;
    action?: string;
  }) {
    let list = [...this.moderatorActivities];
    if (filters.actorId) {
      list = list.filter(a => a.actorId === filters.actorId);
    }
    if (filters.divisionScope) {
      list = list.filter(a => a.divisionScope?.toLowerCase() === filters.divisionScope?.toLowerCase());
    }
    if (filters.institutionScope) {
      list = list.filter(a => a.institutionScope === filters.institutionScope);
    }
    if (filters.action) {
      list = list.filter(a => a.action === filters.action);
    }
    return list;
  }

  getModeratorsUnderDivision(division: string) {
    const moderators = this.users.filter(u => u.role === 'INSTITUTION_MODERATOR');
    return moderators.filter(m => {
      if (!m.assignedInstitution) return false;
      const inst = this.findInstitutionByIdSync(m.assignedInstitution);
      return inst && inst.division.toLowerCase() === division.toLowerCase();
    }).map(m => {
      const inst = m.assignedInstitution ? this.findInstitutionByIdSync(m.assignedInstitution) : undefined;
      const membersAdded = this.moderatorActivities.filter(a => a.actorId === m._id && a.action === 'MEMBER_CREATED').length;
      const profilesEdited = this.moderatorActivities.filter(a => a.actorId === m._id && a.action === 'MEMBER_EDITED').length;
      const membersBlocked = this.moderatorActivities.filter(a => a.actorId === m._id && a.action === 'MEMBER_BLOCKED').length;

      return {
        _id: m._id,
        name: m.name,
        phone: m.phone,
        email: m.email,
        accountStatus: m.accountStatus,
        assignedInstitutionId: m.assignedInstitution,
        institutionName: inst?.nameBn || inst?.name || 'অনির্ধারিত',
        membersAdded,
        profilesEdited,
        membersBlocked,
        createdAt: m.createdAt
      };
    });
  }

  // --- Institutional Contact Requests ---
  createContactRequest(data: {
    requesterId: string;
    requesterName: string;
    requesterPhone: string;
    institutionId: string;
    targetBloodGroup: BloodGroup;
    patientName: string;
    hospitalName: string;
    unitsRequired: number;
    urgency: 'emergency' | 'urgent' | 'standard';
    reason: string;
  }): StoredContactRequest {
    const inst = this.findInstitutionByIdSync(data.institutionId);
    const newContactReq: StoredContactRequest = {
      _id: 'cr_' + Date.now() + Math.random().toString(36).substring(2, 6),
      ...data,
      status: 'pending',
      assignedModeratorId: inst?.assignedModeratorId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.contactRequests.unshift(newContactReq);
    this.persistContactRequest(newContactReq);

    // Notify assigned moderator
    if (inst?.assignedModeratorId) {
      this.createNotification({
        userId: inst.assignedModeratorId,
        title: 'নতুন রক্তের প্রাতিষ্ঠানিক অনুরোধ',
        message: `${inst.nameBn} ইউনিটে ${data.targetBloodGroup} রক্তের একটি জরুরি আবেদন এসেছে (${data.patientName})।`,
        type: 'contact_request'
      });
    }

    // Notify Division Coordinator
    if (inst) {
      const coordinators = this.users.filter(u => 
        u.role === 'DIVISION_COORDINATOR' && 
        u.assignedDivision?.toLowerCase() === inst.division.toLowerCase()
      );
      coordinators.forEach(coord => {
        this.createNotification({
          userId: coord._id,
          title: 'বিভাগীয় প্রতিষ্ঠান রক্তের অনুরোধ',
          message: `${inst.nameBn} ক্যাম্পাসে ${data.targetBloodGroup} রক্তের আবেদন করা হয়েছে।`,
          type: 'contact_request'
        });
      });
    }

    return newContactReq;
  }

  getContactRequests(filters: { institutionId?: string; status?: string }) {
    let list = [...this.contactRequests];
    if (filters.institutionId) {
      list = list.filter(r => r.institutionId === filters.institutionId);
    }
    if (filters.status) {
      list = list.filter(r => r.status === filters.status);
    }
    return list;
  }

  updateContactRequest(id: string, update: Partial<StoredContactRequest>): StoredContactRequest | null {
    const req = this.contactRequests.find(r => r._id === id);
    if (!req) return null;
    Object.assign(req, update, { updatedAt: new Date() });
    this.persistContactRequest(req);
    return req;
  }

  // --- Contact Access & Privacy Flow ---
  async getViewerDailyContactAccessCount(viewerId: string): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isDatabaseConnected()) {
      try {
        const count = await ContactAccessLogModel.countDocuments({
          viewerId,
          createdAt: { $gte: today }
        });
        return count;
      } catch (e: any) {
        console.warn('[DataStore] getViewerDailyContactAccessCount DB error:', e?.message);
      }
    }

    return this.contactAccessLogs.filter(
      log => log.viewerId === viewerId && new Date(log.createdAt) >= today
    ).length;
  }

  async recordContactAccess(logData: {
    viewerId: string;
    donorUserId: string;
    donorProfileId: string;
    purpose: 'blood_request' | 'emergency_search' | 'direct_request';
    relatedBloodRequestId?: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<StoredContactAccessLog> {
    this.assertWritable();
    const newLog: StoredContactAccessLog = {
      _id: 'cal_' + Date.now() + Math.random().toString(36).substring(2, 7),
      viewerId: logData.viewerId,
      donorUserId: logData.donorUserId,
      donorProfileId: logData.donorProfileId,
      purpose: logData.purpose,
      relatedBloodRequestId: logData.relatedBloodRequestId,
      ipAddress: logData.ipAddress,
      userAgent: logData.userAgent,
      createdAt: new Date()
    };
    this.contactAccessLogs.push(newLog);
    await this.persistContactAccessLog(newLog);

    const viewer = this.findUserByIdSync(logData.viewerId);
    this.createNotification({
      userId: logData.donorUserId,
      title: 'জরুরি যোগাযোগের অনুরোধ',
      message: `${viewer?.name || 'একজন ব্যবহারকারী'} জরুরি রক্তদানের জন্য আপনার যোগাযোগের নম্বর দেখেছেন।`,
      type: 'contact_revealed'
    });

    return newLog;
  }

  // --- OTP Methods ---
  async saveOtp(phone: string, otp: string, purpose: string): Promise<StoredOtp> {
    const otpHash = bcrypt.hashSync(otp, 6);
    const otpRecord: StoredOtp = {
      phone,
      otpHash,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      attempts: 0,
      isUsed: false,
      purpose,
      createdAt: new Date()
    };
    this.otps = this.otps.filter(o => o.phone !== phone);
    this.otps.push(otpRecord);

    if (isDatabaseConnected()) {
      try {
        await OtpVerificationModel.deleteMany({ phone, purpose });
        await OtpVerificationModel.create({
          phone,
          otpHash,
          expiresAt: otpRecord.expiresAt,
          attempts: 0,
          isUsed: false,
          purpose: purpose as any
        });
      } catch (e: any) {
        console.warn('[DataStore] saveOtp DB error:', e?.message);
      }
    }
    return otpRecord;
  }

  async verifyOtp(phone: string, rawOtp: string, purpose: string): Promise<{ success: boolean; message: string }> {
    if (isDatabaseConnected()) {
      try {
        const doc = await OtpVerificationModel.findOne({
          phone,
          purpose,
          isUsed: false,
          expiresAt: { $gt: new Date() }
        });
        if (doc) {
          if (doc.attempts >= 5) {
            return { success: false, message: 'সর্বোচ্চ চেষ্টা সংখ্যা অতিক্রম করেছে। কিছুক্ষণ পর আবার চেষ্টা করুন।' };
          }
          const isValid = bcrypt.compareSync(rawOtp, doc.otpHash);
          if (!isValid) {
            doc.attempts += 1;
            await doc.save();
            return { success: false, message: 'ভুল ওটিপি কোড। অনুগ্রহ করে সঠিক ৬ ডিজিটের কোডটি দিন।' };
          }
          doc.isUsed = true;
          await doc.save();
          return { success: true, message: 'সফলভাবে যাচাই সম্পন্ন হয়েছে।' };
        }
      } catch (e: any) {
        console.warn('[DataStore] verifyOtp DB error, falling back to memory:', e?.message);
      }
    }

    const record = this.otps.find(o => o.phone === phone && o.purpose === purpose && !o.isUsed);
    if (!record) {
      return { success: false, message: 'ওটিপি কোড পাওয়া যায়নি বা পূর্বে ব্যবহার করা হয়েছে। নতুন কোড অনুরোধ করুন।' };
    }
    if (new Date() > record.expiresAt) {
      return { success: false, message: 'ওটিপি কোডের মেয়াদ শেষ হয়ে গেছে। অনুগ্রহ করে আবার চেষ্টা করুন।' };
    }
    if (record.attempts >= 5) {
      return { success: false, message: 'সর্বোচ্চ চেষ্টা সংখ্যা অতিক্রম করেছে। কিছুক্ষণ পর আবার চেষ্টা করুন।' };
    }

    record.attempts += 1;
    const isValid = bcrypt.compareSync(rawOtp, record.otpHash);
    if (!isValid) {
      return { success: false, message: 'ভুল ওটিপি কোড। অনুগ্রহ করে সঠিক ৬ ডিজিটের কোডটি দিন।' };
    }

    record.isUsed = true;
    return { success: true, message: 'সফলভাবে যাচাই সম্পন্ন হয়েছে।' };
  }

  // --- Report Methods with Scoping ---
  createReport(data: Partial<StoredReport>): StoredReport {
    let division = data.division;
    let institutionId = data.institutionId;
    let targetTitle = data.targetTitle;

    // Auto-detect division, institution and title from target if missing
    if (data.targetType === 'blood_request') {
      const req = this.bloodRequests.find(r => r._id === data.targetId);
      if (req) {
        division = division || req.division;
        institutionId = institutionId || req.institutionId;
        targetTitle = targetTitle || `রক্তের অনুরোধ (${req.patientName} - ${req.hospitalName})`;
      }
    } else if (data.targetType === 'donor_profile') {
      const donor = this.donorProfiles.find(d => d._id === data.targetId);
      if (donor) {
        division = division || donor.division;
        institutionId = institutionId || donor.institutionId;
        targetTitle = targetTitle || `রক্তদাতা প্রোফাইল (${donor.displayName})`;
      }
    } else if (data.targetType === 'institution') {
      const inst = this.institutions.find(i => i._id === data.targetId);
      if (inst) {
        division = division || inst.division;
        institutionId = institutionId || inst._id;
        targetTitle = targetTitle || `প্রতিষ্ঠান (${inst.nameBn})`;
      }
    } else if (data.targetType === 'user') {
      const u = this.users.find(usr => usr._id === data.targetId);
      if (u) {
        division = division || u.division || u.assignedDivision;
        institutionId = institutionId || u.assignedInstitution;
        targetTitle = targetTitle || `ব্যবহারকারী (${u.name})`;
      }
    }

    const newReport: StoredReport = {
      _id: 'rep_' + Date.now() + Math.random().toString(36).substring(2, 7),
      reportedBy: data.reportedBy || '',
      targetType: data.targetType || 'blood_request',
      targetId: data.targetId || '',
      targetTitle,
      division,
      institutionId,
      reason: data.reason || 'other',
      description: data.description || '',
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.reports.unshift(newReport);
    return newReport;
  }

  getReports(filters: { status?: string; targetType?: string; division?: string; institutionId?: string }) {
    let list = [...this.reports];
    if (filters.status) {
      list = list.filter(r => r.status === filters.status);
    }
    if (filters.targetType) {
      list = list.filter(r => r.targetType === filters.targetType);
    }
    if (filters.division) {
      list = list.filter(r => r.division?.toLowerCase() === filters.division?.toLowerCase());
    }
    if (filters.institutionId) {
      list = list.filter(r => r.institutionId === filters.institutionId);
    }
    return list;
  }

  // --- Phone Change Request Methods ---
  createPhoneChangeRequest(params: {
    userId: string;
    newPhone: string;
    reason: string;
  }): { success: boolean; message: string; request?: StoredPhoneChangeRequest } {
    const user = this.findUserByIdSync(params.userId);
    if (!user) {
      return { success: false, message: 'ব্যবহারকারী অ্যাকাউন্ট পাওয়া যায়নি।' };
    }

    // Check if user already has a pending request
    const existingPending = this.phoneChangeRequests.find(
      r => r.userId === params.userId && r.status === 'pending'
    );
    if (existingPending) {
      return {
        success: false,
        message: 'আপনার একটি নম্বর পরিবর্তনের অনুরোধ ইতিমধ্যে পর্যালোচনার জন্য অপেক্ষমাণ রয়েছে।'
      };
    }

    // Check if new phone is already used by someone else
    const phoneOwner = this.findUserByPhoneSync(params.newPhone);
    if (phoneOwner && phoneOwner._id !== params.userId) {
      return {
        success: false,
        message: 'এই মোবাইল নম্বরটি ইতিমধ্যে অন্য একটি অ্যাকাউন্টে ব্যবহৃত হচ্ছে।'
      };
    }

    // Get institution name if affiliated
    let institutionName: string | undefined = undefined;
    if (user.assignedInstitution) {
      const inst = this.findInstitutionByIdSync(user.assignedInstitution);
      institutionName = inst?.nameBn;
    }

    const newReq: StoredPhoneChangeRequest = {
      _id: 'pcr_' + Date.now() + Math.random().toString(36).substring(2, 7),
      userId: user._id,
      userName: user.name,
      userRole: user.role,
      currentPhone: user.phone,
      newPhone: params.newPhone,
      reason: params.reason,
      division: user.division || user.assignedDivision,
      district: user.district,
      institutionId: user.assignedInstitution,
      institutionName,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.phoneChangeRequests.unshift(newReq);
    this.persistPhoneChangeRequest(newReq);

    // Notify coordinator of that division
    const coordinators = this.users.filter(
      u => u.role === 'DIVISION_COORDINATOR' && u.assignedDivision?.toLowerCase() === (user.division || '').toLowerCase()
    );
    coordinators.forEach(c => {
      this.createNotification({
        userId: c._id,
        title: 'মোবাইল নম্বর পরিবর্তনের নতুন আবেদন',
        message: `${user.name} তার মোবাইল নম্বর পরিবর্তনের জন্য আবেদন করেছেন।`,
        type: 'phone_change',
        link: '/coordinator/dashboard'
      });
    });

    return {
      success: true,
      message: 'মোবাইল নম্বর পরিবর্তনের আবেদন সফলভাবে জমা হয়েছে। মডারেটর বা সমন্বয়ক কর্তৃক পর্যালোচনার পর নম্বর হালনাগাদ হবে।',
      request: newReq
    };
  }

  getPhoneChangeRequests(filters: {
    division?: string;
    institutionId?: string;
    status?: string;
    userId?: string;
  }) {
    let list = [...this.phoneChangeRequests];
    if (filters.userId) {
      list = list.filter(r => r.userId === filters.userId);
    }
    if (filters.status) {
      list = list.filter(r => r.status === filters.status);
    }
    if (filters.division) {
      list = list.filter(r => r.division?.toLowerCase() === filters.division?.toLowerCase());
    }
    if (filters.institutionId) {
      list = list.filter(r => r.institutionId === filters.institutionId);
    }
    return list;
  }

  getPendingPhoneChangeRequestForUser(userId: string) {
    return this.phoneChangeRequests.find(r => r.userId === userId && r.status === 'pending') || null;
  }

  updatePhoneChangeRequest(
    requestId: string,
    status: 'approved' | 'rejected',
    reviewer: { userId: string; name: string; role: string },
    reviewNotes?: string
  ): { success: boolean; message: string; request?: StoredPhoneChangeRequest } {
    const req = this.phoneChangeRequests.find(r => String(r._id) === String(requestId));
    if (!req) {
      return { success: false, message: 'অনুরোধটি খুঁজে পাওয়া যায়নি।' };
    }

    if (req.status !== 'pending') {
      return { success: false, message: 'এই আবেদনটি ইতিমধ্যে মীমাংসিত হয়েছে।' };
    }

    req.status = status;
    req.reviewedBy = reviewer.userId;
    req.reviewedByName = reviewer.name;
    req.reviewedAt = new Date();
    req.reviewNotes = reviewNotes || (status === 'approved' ? 'অনুমোদিত' : 'বাতিলকৃত');
    req.updatedAt = new Date();

    const targetUser = this.findUserByIdSync(req.userId);
    if (status === 'approved' && targetUser) {
      targetUser.phone = req.newPhone;
      targetUser.updatedAt = new Date();
      this.persistUser(targetUser);

      // Also update any related donor profile
      const donor = this.donorProfiles.find(d => String(d.userId) === String(targetUser._id));
      if (donor) {
        donor.updatedAt = new Date();
        this.persistDonorProfile(donor);
      }

      this.createNotification({
        userId: targetUser._id,
        title: 'মোবাইল নম্বর পরিবর্তনের আবেদন অনুমোদিত হয়েছে',
        message: `আপনার অনুরোধকৃত নতুন মোবাইল নম্বর (${req.newPhone}) সফলভাবে প্রোফাইলে যুক্ত করা হয়েছে। এখন থেকে এই নম্বর দিয়ে লগইন করুন।`,
        type: 'phone_change',
        link: '/profile'
      });
    } else if (status === 'rejected' && targetUser) {
      this.createNotification({
        userId: targetUser._id,
        title: 'মোবাইল নম্বর পরিবর্তনের আবেদন বাতিল করা হয়েছে',
        message: `আপনার নম্বর পরিবর্তনের আবেদনটি বাতিল করা হয়েছে। কারণ: ${reviewNotes || 'যাচাইকরণ সন্তোষজনক নয়'}`,
        type: 'phone_change',
        link: '/profile'
      });
    }

    this.persistPhoneChangeRequest(req);

    return {
      success: true,
      message: status === 'approved' ? 'আবেদনটি অনুমোদিত হয়েছে এবং নম্বর হালনাগাদ করা হয়েছে।' : 'আবেদনটি বাতিল করা হয়েছে।',
      request: req
    };
  }

  // --- Coordinator Moderator Appointment ---
  appointModeratorByCoordinator(params: {
    coordinatorUser: any;
    institutionId: string;
    name: string;
    phone: string;
    email?: string;
    gender?: string;
  }): { success: boolean; message: string; moderator?: StoredUser; temporaryPassword?: string } {
    const institution = this.findInstitutionByIdSync(params.institutionId);
    if (!institution) {
      return { success: false, message: 'নির্বাচিত প্রতিষ্ঠানটি খুঁজে পাওয়া যায়নি।' };
    }

    // Verify division scope for DIVISION_COORDINATOR
    if (params.coordinatorUser.role === 'DIVISION_COORDINATOR') {
      if (institution.division.toLowerCase() !== params.coordinatorUser.assignedDivision?.toLowerCase()) {
        return {
          success: false,
          message: 'অনধিকার চর্চা: আপনি কেবল আপনার নির্ধারিত বিভাগের প্রতিষ্ঠানের জন্য মডারেটর নিয়োগ করতে পারবেন।'
        };
      }
    }

    // Check if user already exists with phone
    const existingUser = this.findUserByPhoneSync(params.phone);
    if (existingUser) {
      // Upgrade existing user to INSTITUTION_MODERATOR
      existingUser.role = 'INSTITUTION_MODERATOR';
      existingUser.assignedInstitution = params.institutionId;
      existingUser.assignedInstitutions = [params.institutionId];
      existingUser.updatedAt = new Date();

      this.createNotification({
        userId: existingUser._id,
        title: 'আপনাকে প্রতিষ্ঠান মডারেটর হিসেবে দায়িত্ব দেওয়া হয়েছে',
        message: `${institution.nameBn} প্রতিষ্ঠানের মডারেটর হিসেবে সমন্বয়ক কর্তৃক আপনাকে নিযুক্ত করা হয়েছে।`,
        type: 'account_status',
        link: '/moderator/dashboard'
      });

      return {
        success: true,
        message: `বিদ্যমান অ্যাকাউন্ট (${existingUser.name})-কে ${institution.nameBn}-এর মডারেটর হিসেবে নিযুক্ত করা হয়েছে।`,
        moderator: existingUser
      };
    }

    // Create new moderator user with temporary password
    const temporaryPassword = 'Mod@' + crypto.randomInt(100000, 1000000);
    const passwordHash = bcrypt.hashSync(temporaryPassword, 10);

    const newMod = this.createUser({
      name: params.name,
      phone: params.phone,
      email: params.email,
      passwordHash,
      role: 'INSTITUTION_MODERATOR',
      accountStatus: 'active',
      gender: params.gender || 'unspecified',
      division: institution.division,
      district: institution.district,
      upazila: institution.upazila,
      assignedInstitution: params.institutionId,
      assignedInstitutions: [params.institutionId],
      requirePasswordChangeAtFirstLogin: true,
      isActive: true,
      isPhoneVerified: true
    });

    return {
      success: true,
      message: `${institution.nameBn}-এর জন্য নতুন মডারেটর সফলভাবে নিয়োগ করা হয়েছে।`,
      moderator: newMod,
      temporaryPassword
    };
  }

  // --- Institution Drill-Down Members ---
  getInstitutionMembers(institutionId: string) {
    const institution = this.findInstitutionByIdSync(institutionId);
    if (!institution) return [];

    // Find donor profiles linked to this institution
    const donorList = this.donorProfiles.filter(d => d.institutionId === institutionId);
    
    // Also find users whose assignedInstitution === institutionId
    const userMap = new Map(this.users.map(u => [u._id, u]));

    return donorList.map(d => {
      const u = userMap.get(d.userId);
      return {
        _id: d._id,
        userId: d.userId,
        name: d.displayName,
        phone: u?.phone || '',
        bloodGroup: d.bloodGroup,
        gender: d.gender,
        division: d.division,
        district: d.district,
        upazila: d.upazila,
        availabilityStatus: d.availabilityStatus,
        lastDonationDate: d.lastDonationDate,
        totalDonations: d.totalDonations,
        isPubliclyListed: d.isPubliclyListed,
        accountStatus: u?.accountStatus || 'active',
        createdAt: d.createdAt
      };
    });
  }

  // --- Notifications ---
  createNotification(data: Partial<StoredNotification>): StoredNotification {
    const notif: StoredNotification = {
      _id: 'notif_' + Date.now() + Math.random().toString(36).substring(2, 7),
      userId: data.userId || '',
      title: data.title || '',
      message: data.message || '',
      type: data.type || 'system',
      link: data.link,
      isRead: false,
      createdAt: new Date()
    };
    this.notifications.unshift(notif);
    return notif;
  }

  getUserNotifications(userId: string) {
    return this.notifications.filter(n => n.userId === userId);
  }

  markNotificationAsRead(id: string, userId: string): boolean {
    const notif = this.notifications.find(n => n._id === id && n.userId === userId);
    if (notif) {
      notif.isRead = true;
      return true;
    }
    return false;
  }

  // --- PART 03: Password Recovery & One-Time Password System ---

  createPasswordRecoveryRequest(phoneOrUserId: string, reason?: string) {
    const cleanInput = phoneOrUserId.trim().replace(/^(\+880|880)/, '0');
    const user = this.users.find(u => u._id === cleanInput || u.phone === cleanInput);

    if (!user) {
      return {
        success: false,
        message: 'প্রদত্ত মোবাইল নম্বর বা আইডি দিয়ে কোনো অ্যাকাউন্ট খুঁজে পাওয়া যায়নি।'
      };
    }

    if (user.accountStatus && user.accountStatus !== 'active') {
      return {
        success: false,
        message: 'অ্যাকাউন্টটি বর্তমানে স্থগিত বা তদন্তাধীন রয়েছে। অনুগ্রহ করে সরাসরি সহায়তা ডেস্কে যোগাযোগ করুন।'
      };
    }

    // Check for existing pending request
    const existing = this.passwordRecoveryRequests.find(
      r => r.userId === user._id && r.status === 'pending'
    );
    if (existing) {
      return {
        success: false,
        message: 'আপনার একটি পাসওয়ার্ড পুনরুদ্ধারের আবেদন ইতোমধ্যেই প্রক্রিয়াধীন রয়েছে। অনুগ্রহ করে অপেক্ষা করুন।'
      };
    }

    const institution = user.assignedInstitution ? this.findInstitutionByIdSync(user.assignedInstitution) : undefined;
    const now = new Date();
    const requestId = 'prr_' + Date.now() + Math.random().toString(36).substring(2, 6);

    const newRequest: StoredPasswordRecoveryRequest = {
      _id: requestId,
      userId: user._id,
      userName: user.name,
      phone: user.phone,
      userRole: user.role,
      division: user.division || 'dhaka',
      district: user.district || 'dhaka',
      institutionId: user.assignedInstitution,
      institutionName: institution?.nameBn || institution?.name,
      status: 'pending',
      reason: reason || 'পাসওয়ার্ড মনে নেই, লগইন সমস্যা',
      isUsed: false,
      createdAt: now,
      updatedAt: now
    };

    this.passwordRecoveryRequests.unshift(newRequest);

    // Audit log
    this.passwordRecoveryAudits.unshift({
      _id: 'pra_' + Date.now() + Math.random().toString(36).substring(2, 6),
      requestId: newRequest._id,
      userId: user._id,
      userName: user.name,
      phone: user.phone,
      issuedBy: user._id,
      issuedByName: user.name,
      issuerRole: user.role,
      action: 'REQUEST_SUBMITTED',
      reason: reason || 'ব্যবহারকারী পাসওয়ার্ড রিকভারি আবেদন করেছেন',
      createdAt: now
    });

    // In-App Notifications to Super Admin, Coordinator, and Institution Officials
    const admins = this.users.filter(u => u.role === 'SUPER_ADMIN' || u.role === 'ADMIN');
    for (const admin of admins) {
      this.createNotification({
        userId: admin._id,
        title: '🔑 নতুন পাসওয়ার্ড রিকভারি আবেদন',
        message: `${user.name} (${user.phone}) একটি সাময়িক পাসওয়ার্ড রিকভারি আবেদন জমা দিয়েছেন।`,
        type: 'system',
        link: '/admin/dashboard'
      });
    }

    // Notify Division Coordinator
    const coordinators = this.users.filter(
      u => u.role === 'DIVISION_COORDINATOR' && u.assignedDivision === user.division
    );
    for (const c of coordinators) {
      this.createNotification({
        userId: c._id,
        title: '🔑 নতুন পাসওয়ার্ড রিকভারি আবেদন (বিভাগীয়)',
        message: `${user.name} (${user.district}, ${user.division}) পাসওয়ার্ড রিকভারি আবেদন জমা দিয়েছেন।`,
        type: 'system',
        link: '/coordinator/dashboard'
      });
    }

    // Notify Institution Moderator & Head if belongs to institution
    if (user.assignedInstitution) {
      const instOfficials = this.users.filter(
        u => (u.role === 'INSTITUTION_MODERATOR' || u.role === 'INSTITUTION_HEAD') &&
             u.assignedInstitution === user.assignedInstitution
      );
      for (const official of instOfficials) {
        this.createNotification({
          userId: official._id,
          title: '🔑 ক্যাম্পাস সদস্য পাসওয়ার্ড রিকভারি',
          message: `${user.name} আপনার প্রতিষ্ঠানের অধীনে পাসওয়ার্ড রিকভারি আবেদন জমা দিয়েছেন।`,
          type: 'system',
          link: '/moderator/dashboard'
        });
      }
    }

    return {
      success: true,
      message: 'আপনার পাসওয়ার্ড রিকভারির আবেদনটি সফলভাবে জমা হয়েছে। সংশ্লিষ্ট কর্তৃপক্ষ যাচাই করে সাময়িক পাসওয়ার্ড প্রদান করবেন।'
    };
  }

  getPasswordRecoveryRequests(filter: { role: string; division?: string; institutionId?: string; status?: string }) {
    let list = this.passwordRecoveryRequests;

    if (filter.status) {
      list = list.filter(r => r.status === filter.status);
    }

    // Scope check
    if (filter.role === 'SUPER_ADMIN' || filter.role === 'ADMIN') {
      // Sees nationwide
    } else if (filter.role === 'DIVISION_COORDINATOR') {
      list = list.filter(r => r.division === filter.division);
    } else if (filter.role === 'INSTITUTION_HEAD' || filter.role === 'INSTITUTION_MODERATOR') {
      list = list.filter(r => r.institutionId === filter.institutionId);
    } else {
      return [];
    }

    // Sanitize: NEVER return temporaryPasswordHash or password secrets
    return list.map(r => ({
      _id: r._id,
      userId: r.userId,
      userName: r.userName,
      phone: r.phone,
      userRole: r.userRole,
      division: r.division,
      district: r.district,
      institutionId: r.institutionId,
      institutionName: r.institutionName,
      status: r.status,
      reason: r.reason,
      isUsed: r.isUsed,
      expiresAt: r.expiresAt,
      approvedBy: r.approvedBy,
      approvedByName: r.approvedByName,
      approvedByRole: r.approvedByRole,
      approvedAt: r.approvedAt,
      rejectionReason: r.rejectionReason,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt
    }));
  }

  approvePasswordRecoveryRequest(requestId: string, approverUser: StoredUser) {
    const req = this.passwordRecoveryRequests.find(r => String(r._id) === String(requestId));
    if (!req) {
      return { success: false, message: 'আবেদনটি খুঁজে পাওয়া যায়নি।' };
    }

    if (req.status !== 'pending') {
      return { success: false, message: 'আবেদনটি ইতোমধ্যেই পর্যালোচনা করা হয়েছে।' };
    }

    // Check approver authorization scope
    if (approverUser.role === 'DIVISION_COORDINATOR' && approverUser.assignedDivision !== req.division) {
      return { success: false, message: 'অনধিকার চর্চা: আপনি কেবল আপনার নির্ধারিত বিভাগের রিকভারি অনুমোদন করতে পারেন।' };
    }

    if ((approverUser.role === 'INSTITUTION_MODERATOR' || approverUser.role === 'INSTITUTION_HEAD') && 
        approverUser.assignedInstitution !== req.institutionId) {
      return { success: false, message: 'অনধিকার চর্চা: আপনি কেবল আপনার নির্ধারিত প্রতিষ্ঠানের রিকভারি অনুমোদন করতে পারেন।' };
    }

    const targetUser = this.findUserByIdSync(req.userId);
    if (!targetUser) {
      return { success: false, message: 'ব্যবহারকারীর মূল অ্যাকাউন্ট পাওয়া যায়নি।' };
    }

    // Cryptographically secure temporary password (e.g. BD739281)
    const tempPass = 'BD' + crypto.randomInt(100000, 1000000);
    const hash = bcrypt.hashSync(tempPass, 10);
    const now = new Date();
    const expiresAt = new Date(Date.now() + 24 * 3600 * 1000); // 24 hours expiry

    req.status = 'approved';
    req.temporaryPasswordHash = hash;
    req.expiresAt = expiresAt;
    req.approvedBy = approverUser._id;
    req.approvedByName = approverUser.name;
    req.approvedByRole = approverUser.role;
    req.approvedAt = now;
    req.updatedAt = now;

    // Update user password to this temporary password & require first login password change
    targetUser.passwordHash = hash;
    targetUser.requirePasswordChangeAtFirstLogin = true;
    targetUser.updatedAt = now;
    this.persistUser(targetUser);
    this.persistPasswordRecoveryRequest(req);

    // Audit trail
    this.passwordRecoveryAudits.unshift({
      _id: 'pra_' + Date.now() + Math.random().toString(36).substring(2, 6),
      requestId: req._id,
      userId: targetUser._id,
      userName: targetUser.name,
      phone: targetUser.phone,
      issuedBy: approverUser._id,
      issuedByName: approverUser.name,
      issuerRole: approverUser.role,
      action: 'OTP_GENERATED',
      reason: 'অনুমোদিত সাময়িক পাসওয়ার্ড প্রদান করা হয়েছে',
      notes: `ইস্যু করেছেন: ${approverUser.name} (${approverUser.role})`,
      createdAt: now
    });

    // Notify user
    this.createNotification({
      userId: targetUser._id,
      title: '✅ পাসওয়ার্ড রিকভারি সম্পন্ন হয়েছে',
      message: 'আপনার পাসওয়ার্ড রিকভারি আবেদন অনুমোদিত হয়েছে। নির্ধারিত সাময়িক পাসওয়ার্ড দিয়ে লগইন করে অবিলম্বে নতুন পাসওয়ার্ড নির্ধারণ করুন।',
      type: 'account_status'
    });

    return {
      success: true,
      temporaryPassword: tempPass,
      warning: 'এই সাময়িক পাসওয়ার্ডটি ব্যবহারকারীকে নিরাপদ মাধ্যমে দিন। এটি ২৪ ঘণ্টার মধ্যে একবারই ব্যবহারযোগ্য।'
    };
  }

  rejectPasswordRecoveryRequest(requestId: string, rejecterUser: StoredUser, reason: string) {
    const req = this.passwordRecoveryRequests.find(r => String(r._id) === String(requestId));
    if (!req) return { success: false, message: 'আবেদনটি পাওয়া যায়নি।' };

    const now = new Date();
    req.status = 'rejected';
    req.rejectionReason = reason;
    req.updatedAt = now;
    this.persistPasswordRecoveryRequest(req);

    this.passwordRecoveryAudits.unshift({
      _id: 'pra_' + Date.now() + Math.random().toString(36).substring(2, 6),
      requestId: req._id,
      userId: req.userId,
      userName: req.userName,
      phone: req.phone,
      issuedBy: rejecterUser._id,
      issuedByName: rejecterUser.name,
      issuerRole: rejecterUser.role,
      action: 'REQUEST_REJECTED',
      reason,
      createdAt: now
    });

    return { success: true, message: 'পাসওয়ার্ড রিকভারি আবেদনটি বাতিল করা হয়েছে।' };
  }

  getPasswordRecoveryHistory(filter: { role: string; division?: string }) {
    if (filter.role === 'SUPER_ADMIN' || filter.role === 'ADMIN') {
      return this.passwordRecoveryAudits;
    }
    if (filter.role === 'DIVISION_COORDINATOR') {
      // Find requests in this division
      const validReqIds = new Set(
        this.passwordRecoveryRequests.filter(r => r.division === filter.division).map(r => r._id)
      );
      return this.passwordRecoveryAudits.filter(a => validReqIds.has(a.requestId));
    }
    return [];
  }

  // --- PART 04: Scoped Member Profile Search ---

  scopedUserSearch(query: string, searcherUser: StoredUser) {
    const clean = query.trim().toLowerCase();
    const cleanPhone = clean.replace(/^(\+880|880)/, '0');

    const targetUser = this.users.find(u => 
      u._id.toLowerCase() === clean || 
      u.phone === cleanPhone || 
      u.name.toLowerCase().includes(clean)
    );

    if (!targetUser) {
      return {
        success: false,
        notFound: true,
        message: 'কোনো ব্যবহারকারী খুঁজে পাওয়া যায়নি।'
      };
    }

    // Role-based scope isolation
    if (searcherUser.role === 'SUPER_ADMIN' || searcherUser.role === 'ADMIN') {
      // Full nationwide access
    } else if (searcherUser.role === 'DIVISION_COORDINATOR') {
      if (targetUser.division !== searcherUser.assignedDivision) {
        return {
          success: false,
          outOfScope: true,
          message: 'এই ব্যবহারকারী আপনার Assigned Division-এর অধীনে নেই। সংশ্লিষ্ট Division Coordinator অথবা Authorized Administrator-এর সঙ্গে যোগাযোগ করুন।'
        };
      }
    } else if (searcherUser.role === 'INSTITUTION_HEAD' || searcherUser.role === 'INSTITUTION_MODERATOR') {
      if (targetUser.assignedInstitution !== searcherUser.assignedInstitution) {
        return {
          success: false,
          outOfScope: true,
          message: 'এই ব্যবহারকারী অন্য একটি প্রতিষ্ঠানের অধীনে রয়েছেন। বিস্তারিত তথ্যের জন্য সংশ্লিষ্ট প্রতিষ্ঠানের Moderator-এর সঙ্গে যোগাযোগ করুন।'
        };
      }
    } else {
      return { success: false, outOfScope: true, message: 'অনুসন্ধানের প্রয়োজনীয় অনুমতি নেই।' };
    }

    // Safe profile return
    const inst = targetUser.assignedInstitution ? this.findInstitutionByIdSync(targetUser.assignedInstitution) : undefined;
    const donor = this.donorProfiles.find(d => d.userId === targetUser._id);

    return {
      success: true,
      user: {
        _id: targetUser._id,
        name: targetUser.name,
        phone: targetUser.phone,
        role: targetUser.role,
        accountStatus: targetUser.accountStatus,
        division: targetUser.division,
        district: targetUser.district,
        upazila: targetUser.upazila,
        gender: targetUser.gender,
        assignedInstitution: targetUser.assignedInstitution,
        institutionName: inst?.nameBn || inst?.name,
        bloodGroup: donor?.bloodGroup,
        totalDonations: donor?.totalDonations || 0,
        createdAt: targetUser.createdAt
      }
    };
  }

  // --- PART 05 & 06: Institution Change Request & Membership Management ---

  createInstitutionChangeRequest(data: {
    userId: string;
    targetInstitutionId: string;
    studentOrStaffId?: string;
    department?: string;
    reason?: string;
  }) {
    const user = this.findUserByIdSync(data.userId);
    if (!user) return { success: false, message: 'ব্যবহারকারী পাওয়া যায়নি।' };

    const targetInst = this.findInstitutionByIdSync(data.targetInstitutionId);
    if (!targetInst) return { success: false, message: 'লক্ষ্য প্রতিষ্ঠানটি খুঁজে পাওয়া যায়নি।' };

    const currentInst = user.assignedInstitution ? this.findInstitutionByIdSync(user.assignedInstitution) : undefined;
    const now = new Date();
    const requestId = 'icr_' + Date.now() + Math.random().toString(36).substring(2, 6);

    const newReq: StoredInstitutionChangeRequest = {
      _id: requestId,
      userId: user._id,
      userName: user.name,
      phone: user.phone,
      userRole: user.role,
      currentInstitutionId: user.assignedInstitution,
      currentInstitutionName: currentInst?.nameBn || currentInst?.name,
      targetInstitutionId: targetInst._id,
      targetInstitutionName: targetInst.nameBn || targetInst.name,
      division: targetInst.division,
      district: targetInst.district,
      studentOrStaffId: data.studentOrStaffId,
      department: data.department,
      reason: data.reason,
      status: 'pending',
      createdAt: now,
      updatedAt: now
    };

    this.institutionChangeRequests.unshift(newReq);
    this.persistInstitutionChangeRequest(newReq);

    // Notify Super Admin & Coordinator
    const admins = this.users.filter(u => u.role === 'SUPER_ADMIN');
    for (const a of admins) {
      this.createNotification({
        userId: a._id,
        title: '🏫 প্রতিষ্ঠান পরিবর্তনের আবেদন',
        message: `${user.name} প্রতিষ্ঠান হিসেবে "${targetInst.nameBn}" অন্তর্ভুক্তির আবেদন করেছেন।`,
        type: 'institution_update',
        link: '/admin/dashboard'
      });
    }

    const coordinators = this.users.filter(
      u => u.role === 'DIVISION_COORDINATOR' && u.assignedDivision === targetInst.division
    );
    for (const c of coordinators) {
      this.createNotification({
        userId: c._id,
        title: '🏫 প্রতিষ্ঠান পরিবর্তনের আবেদন (বিভাগীয়)',
        message: `${user.name} "${targetInst.nameBn}" প্রতিষ্ঠানে যুক্ত হতে আবেদন করেছেন।`,
        type: 'institution_update',
        link: '/coordinator/dashboard'
      });
    }

    // Notify Target Institution Moderator & Head
    const targetOfficials = this.users.filter(
      u => (u.role === 'INSTITUTION_MODERATOR' || u.role === 'INSTITUTION_HEAD') &&
           u.assignedInstitution === targetInst._id
    );
    for (const o of targetOfficials) {
      this.createNotification({
        userId: o._id,
        title: '🏫 নতুন সদস্য অন্তর্ভুক্তি আবেদন',
        message: `${user.name} আপনার ক্যাম্পাসের সদস্য হিসেবে যুক্ত হতে আবেদন করেছেন।`,
        type: 'institution_update',
        link: '/moderator/dashboard'
      });
    }

    return {
      success: true,
      message: 'প্রতিষ্ঠান পরিবর্তনের আবেদন সফলভাবে জমা হয়েছে। সংশ্লিষ্ট কর্তৃপক্ষ অনুমোদন করলে আপনার প্রোফাইলে সংযুক্ত হবে।',
      request: newReq
    };
  }

  getInstitutionChangeRequests(filter: { role: string; division?: string; institutionId?: string; status?: string }) {
    let list = this.institutionChangeRequests;

    if (filter.status) {
      list = list.filter(r => r.status === filter.status);
    }

    if (filter.role === 'SUPER_ADMIN' || filter.role === 'ADMIN') {
      return list;
    }
    if (filter.role === 'DIVISION_COORDINATOR') {
      return list.filter(r => r.division === filter.division);
    }
    if (filter.role === 'INSTITUTION_HEAD' || filter.role === 'INSTITUTION_MODERATOR') {
      return list.filter(r => r.targetInstitutionId === filter.institutionId || r.currentInstitutionId === filter.institutionId);
    }
    return [];
  }

  reviewInstitutionChangeRequest(requestId: string, reviewerUser: StoredUser, status: 'approved' | 'rejected', decisionReason?: string) {
    const req = this.institutionChangeRequests.find(r => String(r._id) === String(requestId));
    if (!req) return { success: false, message: 'আবেদনটি পাওয়া যায়নি।' };

    // Final approval requires SUPER_ADMIN, ADMIN, or DIVISION_COORDINATOR (for that division)
    if (reviewerUser.role !== 'SUPER_ADMIN' && reviewerUser.role !== 'ADMIN' && reviewerUser.role !== 'DIVISION_COORDINATOR') {
      return { success: false, message: 'অনধিকার চর্চা: প্রতিষ্ঠান পরিবর্তনের চূড়ান্ত অনুমোদন কেবল প্ল্যাটফর্ম অ্যাডমিন বা বিভাগীয় সমন্বয়ক দিতে পারেন।' };
    }

    if (reviewerUser.role === 'DIVISION_COORDINATOR' && reviewerUser.assignedDivision !== req.division) {
      return { success: false, message: 'অনধিকার চর্চা: আপনি কেবল আপনার নির্ধারিত বিভাগের আবেদন অনুমোদন করতে পারেন।' };
    }

    const now = new Date();
    req.status = status;
    req.reviewedBy = reviewerUser._id;
    req.reviewedByName = reviewerUser.name;
    req.decisionReason = decisionReason;
    req.updatedAt = now;

    if (status === 'approved') {
      // Update target user's assignedInstitution
      const targetUser = this.findUserByIdSync(req.userId);
      if (targetUser) {
        targetUser.assignedInstitution = req.targetInstitutionId;
        targetUser.updatedAt = now;
        this.persistUser(targetUser);
      }

      // Update donor profile
      const donor = this.donorProfiles.find(d => String(d.userId) === String(req.userId));
      if (donor) {
        donor.institutionId = req.targetInstitutionId;
        donor.institutionMembershipVerified = true;
        donor.updatedAt = now;
        this.persistDonorProfile(donor);
      }

      this.createNotification({
        userId: req.userId,
        title: '🎉 প্রতিষ্ঠান অন্তর্ভুক্তি অনুমোদিত!',
        message: `আপনার প্রতিষ্ঠান "${req.targetInstitutionName}" সফলভাবে প্রোফাইলে সংযুক্ত হয়েছে।`,
        type: 'institution_update'
      });
    } else {
      this.createNotification({
        userId: req.userId,
        title: '❌ প্রতিষ্ঠান পরিবর্তনের আবেদন নাকচ',
        message: `আপনার আবেদনটি বিবেচনা করা সম্ভব হয়নি। কারণ: ${decisionReason || 'যাচাইয়ে ত্রুটি'}`,
        type: 'institution_update'
      });
    }

    this.persistInstitutionChangeRequest(req);

    return {
      success: true,
      message: status === 'approved' ? 'প্রতিষ্ঠান পরিবর্তনের আবেদন সফলভাবে অনুমোদিত হয়েছে।' : 'আবেদনটি বাতিল করা হয়েছে।'
    };
  }

  // Manual Institution Creation by SUPER_ADMIN or DIVISION_COORDINATOR
  manualCreateInstitution(data: {
    name: string;
    nameBn: string;
    code: string;
    type: string;
    division: string;
    district: string;
    upazila: string;
    address: string;
    email?: string;
    phone?: string;
    description?: string;
  }, creatorUser: StoredUser) {
    if (creatorUser.role !== 'SUPER_ADMIN' && creatorUser.role !== 'ADMIN' && creatorUser.role !== 'DIVISION_COORDINATOR') {
      return { success: false, message: 'অনধিকার চর্চা: শুধুমাত্র প্ল্যাটফর্ম অ্যাডমিন এবং বিভাগীয় সমন্বয়ক সরাসরি প্রতিষ্ঠান তৈরি করতে পারেন।' };
    }

    if (creatorUser.role === 'DIVISION_COORDINATOR' && creatorUser.assignedDivision !== data.division) {
      return { success: false, message: 'অনধিকার চর্চা: আপনি কেবল আপনার নির্ধারিত বিভাগে প্রতিষ্ঠান তৈরি করতে পারেন।' };
    }

    // Check duplicate code
    const existing = this.institutions.find(i => i.code.toUpperCase() === data.code.toUpperCase() || i.name.toLowerCase() === data.name.toLowerCase());
    if (existing) {
      return { success: false, message: 'এই কোড বা নামের একটি শিক্ষা প্রতিষ্ঠান ইতোমধ্যেই বিদ্যমান রয়েছে।' };
    }

    const now = new Date();
    const instId = 'inst_' + Date.now() + Math.random().toString(36).substring(2, 6);

    const newInst: StoredInstitution = {
      _id: instId,
      name: data.name,
      nameBn: data.nameBn,
      code: data.code.toUpperCase(),
      type: data.type || 'university',
      division: data.division,
      district: data.district,
      upazila: data.upazila,
      address: data.address,
      email: data.email,
      phone: data.phone,
      description: data.description,
      status: 'approved',
      totalRegisteredDonors: 0,
      createdAt: now,
      updatedAt: now
    };

    this.institutions.unshift(newInst);
    this.persistInstitution(newInst);

    return {
      success: true,
      institution: newInst,
      message: `শিক্ষা প্রতিষ্ঠান "${newInst.nameBn}" সফলভাবে তৈরি করা হয়েছে।`
    };
  }
}

export const dataStore = new DataStore();
