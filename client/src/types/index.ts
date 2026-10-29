import { BloodGroup } from '../data/bangladeshLocations';

export type UserRole = 
  | 'SUPER_ADMIN' 
  | 'DIVISION_COORDINATOR' 
  | 'INSTITUTION_MODERATOR' 
  | 'DONOR' 
  | 'REQUESTER';

export interface User {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  assignedDivision?: string;
  assignedInstitution?: string;
  isPhoneVerified?: boolean;
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
  requesterId: string;
  requesterName?: string;
  patientName: string;
  bloodGroup: BloodGroup;
  unitsRequired: number;
  unitsFulfilled: number;
  hospitalName: string;
  hospitalAddress: string;
  division: string;
  district: string;
  upazila: string;
  requiredDate: string;
  urgencyLevel: UrgencyLevel;
  reason: string;
  contactNumber: string;
  alternativeContactNumber?: string;
  status: RequestStatus;
  moderationNotes?: string;
  institutionId?: string;
  institutionName?: string;
  expiresAt: string;
  createdAt: string;
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
  totalRegisteredDonors: number;
  description?: string;
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

