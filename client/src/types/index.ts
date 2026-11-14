import { BloodGroup } from '../data/bangladeshLocations';

export type UserRole = 
  | 'SUPER_ADMIN' 
  | 'ADMIN'
  | 'DIVISION_COORDINATOR' 
  | 'INSTITUTION_HEAD'
  | 'INSTITUTION_MODERATOR' 
  | 'MEMBER'
  | 'DONOR' 
  | 'REQUESTER';

export type AccountStatus = 'active' | 'temporarily_blocked' | 'permanently_blocked' | 'suspended';

export interface User {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  gender?: 'male' | 'female' | 'unspecified' | 'other';
  accountStatus?: AccountStatus;
  blockReason?: string;
  blockedBy?: string;
  blockedAt?: string;
  division?: string;
  district?: string;
  upazila?: string;
  assignedDivision?: string;
  assignedInstitution?: string;
  assignedInstitutions?: string[];
  isPhoneVerified?: boolean;
  requirePasswordChangeAtFirstLogin?: boolean;
  femaleSafetyAcknowledged?: boolean;
  femalePublicPhoneConsent?: boolean;
}

export interface DonorProfile {
  _id: string;
  userId?: string;
  displayName: string;
  bloodGroup: BloodGroup;
  division: string;
  district: string;
  upazila: string;
  addressDetails?: string;
  dateOfBirth?: string;
  gender?: string;
  availabilityStatus: 'available' | 'recently_donated' | 'temporarily_unavailable';
  lastDonationDate?: string;
  totalDonations: number;
  institutionId?: string;
  institutionName?: string;
  institutionMembershipVerified?: boolean;
  consentToShareContact?: boolean;
  preferredContactMethod?: string;
  bio?: string;
  isPubliclyListed?: boolean;
  emergencyAvailable?: boolean;
  phone?: string;
  createdAt: string;
}

export type UrgencyLevel = 'emergency' | 'urgent' | 'standard';
export type RequestStatus = 
  | 'pending_verification' 
  | 'open' 
  | 'partially_fulfilled' 
  | 'fulfilled' 
  | 'cancelled' 
  | 'expired' 
  | 'rejected';

export interface BloodRequest {
  _id: string;
  publicId?: string;
  requesterId: string;
  requesterName?: string;
  patientName: string;
  bloodGroup: BloodGroup;
  unitsRequired: number;
  unitsFulfilled: number;
  unitsRemaining?: number;
  hospitalName: string;
  hospitalAddress: string;
  division: string;
  district: string;
  upazila: string;
  requiredDate: string;
  requiredWithin?: string;
  urgencyLevel: UrgencyLevel;
  reason: string;
  contactPersonName?: string;
  contactNumber: string;
  alternativeContactNumber?: string;
  additionalNotes?: string;
  consentForPublicShare?: boolean;
  status: RequestStatus;
  moderationNotes?: string;
  institutionId?: string;
  institutionName?: string;
  expiresAt: string;
  createdAt: string;
  canonicalUrl?: string;
  completionMessage?: string;
  statusHistory?: Array<{
    status: RequestStatus;
    changedAt: string;
    changedBy?: string;
    reason?: string;
    unitsFulfilledSnapshot?: number;
  }>;
}

export interface Institution {
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
}

export type InstitutionRequestStatus = 'pending_review' | 'under_review' | 'approved' | 'rejected';

export interface InstitutionRequest {
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
  reviewedAt?: string;
  decisionReason?: string;
  createdAt: string;
}

export interface ModeratorActivity {
  _id: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  action: 'MEMBER_CREATED' | 'PROFILE_EDITED' | 'USER_BLOCKED' | 'USER_UNBLOCKED' | 'CONTACT_REQUEST_HANDLED' | string;
  targetRecordId?: string;
  targetRecordType?: string;
  divisionScope?: string;
  institutionScope?: string;
  reason?: string;
  result?: string;
  createdAt: string;
}

export interface ContactRequest {
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
  status: 'pending' | 'in_progress' | 'fulfilled' | 'cancelled';
  moderatorNotes?: string;
  handledAt?: string;
  createdAt: string;
}

export interface AccountStatusHistory {
  _id: string;
  userId: string;
  targetUserName?: string;
  targetUserPhone?: string;
  previousStatus: string;
  newStatus: string;
  changedBy: string;
  changerName?: string;
  changerRole?: string;
  reason: string;
  changedAt: string;
}

export interface AuditLog {
  _id: string;
  actorId: string;
  actorRole: string;
  action: string;
  targetType?: string;
  targetId?: string;
  institutionScope?: string;
  details?: any;
  createdAt: string;
}

export interface NotificationItem {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface PhoneChangeRequest {
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
  reviewedAt?: string;
  reviewNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PasswordRecoveryRequest {
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
  temporaryPassword?: string;
  expiresAt?: string;
  isUsed: boolean;
  approvedBy?: string;
  approvedByName?: string;
  approvedByRole?: string;
  approvedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PasswordRecoveryAudit {
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
  createdAt: string;
}

export interface InstitutionChangeRequest {
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
  createdAt: string;
  updatedAt: string;
}
