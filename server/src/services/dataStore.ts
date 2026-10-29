import bcrypt from 'bcryptjs';
import { BANGLADESH_DIVISIONS, BloodGroup } from '../data/bangladeshLocations.js';
import { UserRole, AccountStatus, GenderType } from '../models/User.js';
import { AvailabilityStatus } from '../models/DonorProfile.js';
import { RequestStatus, UrgencyLevel } from '../models/BloodRequest.js';
import { ActivityActionType } from '../models/ModeratorActivity.js';
import { InstitutionRequestStatus } from '../models/InstitutionRequest.js';
import { ContactRequestStatus } from '../models/ContactRequest.js';

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

export interface StoredBloodRequest {
  _id: string;
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
  urgencyLevel: UrgencyLevel;
  reason: string;
  contactNumber: string;
  alternativeContactNumber?: string;
  status: RequestStatus;
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
  type: 'request_match' | 'contact_revealed' | 'status_update' | 'institution_update' | 'system' | 'contact_request' | 'account_status';
  link?: string;
  isRead: boolean;
  createdAt: Date;
}

// In-Memory Repository
class DataStore {
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

  constructor() {
    this.seedInitialData();
  }

  seedInitialData() {
    const defaultPasswordHash = bcrypt.hashSync('password123', 10);
    const now = new Date();

    // 1. Initial Users
    this.users = [
      {
        _id: 'usr_superadmin',
        name: 'সুপার অ্যাডমিন (Super Admin)',
        phone: '01700000001',
        email: 'superadmin@bloodbd.org',
        passwordHash: defaultPasswordHash,
        role: 'SUPER_ADMIN',
        accountStatus: 'active',
        gender: 'male',
        isActive: true,
        isPhoneVerified: true,
        createdAt: now,
        updatedAt: now
      },
      {
        _id: 'usr_admin',
        name: 'প্ল্যাটফর্ম অ্যাডমিন (Admin)',
        phone: '01700000007',
        email: 'admin@bloodbd.org',
        passwordHash: defaultPasswordHash,
        role: 'ADMIN',
        accountStatus: 'active',
        gender: 'male',
        isActive: true,
        isPhoneVerified: true,
        createdAt: now,
        updatedAt: now
      },
      {
        _id: 'usr_coordinator_dhaka',
        name: 'মো: কামরুল হাসান (ঢাকা সমন্বয়ক)',
        phone: '01700000002',
        email: 'dhaka.coordinator@bloodbd.org',
        passwordHash: defaultPasswordHash,
        role: 'DIVISION_COORDINATOR',
        accountStatus: 'active',
        gender: 'male',
        assignedDivision: 'dhaka',
        isActive: true,
        isPhoneVerified: true,
        createdAt: now,
        updatedAt: now
      },
      {
        _id: 'usr_coordinator_ctg',
        name: 'ফারহানা আহমেদ (চট্টগ্রাম সমন্বয়ক)',
        phone: '01700000003',
        email: 'ctg.coordinator@bloodbd.org',
        passwordHash: defaultPasswordHash,
        role: 'DIVISION_COORDINATOR',
        accountStatus: 'active',
        gender: 'female',
        assignedDivision: 'chattogram',
        isActive: true,
        isPhoneVerified: true,
        createdAt: now,
        updatedAt: now
      },
      {
        _id: 'usr_moderator_du',
        name: 'আব্দুল্লাহ আল মামুন (ঢাবি মডারেটর)',
        phone: '01700000004',
        email: 'mamun.du@bloodbd.org',
        passwordHash: defaultPasswordHash,
        role: 'INSTITUTION_MODERATOR',
        accountStatus: 'active',
        gender: 'male',
        assignedInstitution: 'inst_du',
        assignedInstitutions: ['inst_du'],
        isActive: true,
        isPhoneVerified: true,
        createdAt: now,
        updatedAt: now
      },
      {
        _id: 'usr_donor_1',
        name: 'রফিকুল ইসলাম',
        phone: '01711111111',
        email: 'rafiqul@example.com',
        passwordHash: defaultPasswordHash,
        role: 'MEMBER',
        accountStatus: 'active',
        gender: 'male',
        division: 'dhaka',
        district: 'dhaka',
        upazila: 'mirpur',
        isActive: true,
        isPhoneVerified: true,
        createdAt: now,
        updatedAt: now
      },
      {
        _id: 'usr_donor_2',
        name: 'তানভীর আহমেদ',
        phone: '01722222222',
        email: 'tanveer@example.com',
        passwordHash: defaultPasswordHash,
        role: 'MEMBER',
        accountStatus: 'active',
        gender: 'male',
        division: 'dhaka',
        district: 'dhaka',
        upazila: 'dhanmondi',
        isActive: true,
        isPhoneVerified: true,
        createdAt: now,
        updatedAt: now
      },
      {
        _id: 'usr_donor_3',
        name: 'নুসরাত জাহান',
        phone: '01733333333',
        email: 'nusrat@example.com',
        passwordHash: defaultPasswordHash,
        role: 'MEMBER',
        accountStatus: 'active',
        gender: 'female',
        femaleSafetyAcknowledged: true,
        femalePublicPhoneConsent: false,
        division: 'chattogram',
        district: 'chattogram',
        upazila: 'panchlaish',
        isActive: true,
        isPhoneVerified: true,
        createdAt: now,
        updatedAt: now
      },
      {
        _id: 'usr_donor_4',
        name: 'সাকিব মাহমুদ',
        phone: '01744444444',
        email: 'sakib@example.com',
        passwordHash: defaultPasswordHash,
        role: 'MEMBER',
        accountStatus: 'active',
        gender: 'male',
        division: 'rajshahi',
        district: 'rajshahi',
        upazila: 'boalia',
        isActive: true,
        isPhoneVerified: true,
        createdAt: now,
        updatedAt: now
      },
      {
        _id: 'usr_requester_1',
        name: 'মাহবুব আলম',
        phone: '01755555555',
        email: 'mahbub@example.com',
        passwordHash: defaultPasswordHash,
        role: 'MEMBER',
        accountStatus: 'active',
        gender: 'male',
        division: 'dhaka',
        district: 'dhaka',
        upazila: 'shahbagh',
        isActive: true,
        isPhoneVerified: true,
        createdAt: now,
        updatedAt: now
      },
      {
        _id: 'usr_blocked_demo',
        name: 'ফারুক হোসেন (স্থগিত সদস্য)',
        phone: '01799999999',
        email: 'faruk@example.com',
        passwordHash: defaultPasswordHash,
        role: 'MEMBER',
        accountStatus: 'temporarily_blocked',
        blockReason: 'ভুয়া রক্তের অনুরোধ পোস্ট এবং বাণিজ্যিক সুবিধার অভিযোগে স্থগিত রাখা হয়েছে।',
        blockedBy: 'usr_coordinator_dhaka',
        blockedAt: new Date(Date.now() - 86400000 * 2),
        gender: 'male',
        division: 'dhaka',
        district: 'dhaka',
        upazila: 'savar',
        isActive: false,
        isPhoneVerified: true,
        createdAt: new Date(Date.now() - 86400000 * 10),
        updatedAt: now
      }
    ];

    // 2. Initial Institutions
    this.institutions = [
      {
        _id: 'inst_du',
        name: 'University of Dhaka',
        nameBn: 'ঢাকা বিশ্ববিদ্যালয়',
        code: 'DU-BD',
        type: 'university',
        division: 'dhaka',
        district: 'dhaka',
        upazila: 'shahbagh',
        address: 'Nilkhet Rd, Dhaka 1000',
        website: 'https://www.du.ac.bd',
        email: 'bloodclub@du.ac.bd',
        phone: '01811112233',
        status: 'approved',
        assignedModeratorId: 'usr_moderator_du',
        assignedModeratorIds: ['usr_moderator_du'],
        totalRegisteredDonors: 142,
        description: 'ঢাকা বিশ্ববিদ্যালয় বাঁধন এবং রোভার স্কাউট স্বেচ্ছায় রক্তদান ফোরাম।',
        createdAt: now,
        updatedAt: now
      },
      {
        _id: 'inst_buet',
        name: 'Bangladesh University of Engineering and Technology',
        nameBn: 'বাংলাদেশ প্রকৌশল বিশ্ববিদ্যালয় (বুয়েট)',
        code: 'BUET-BD',
        type: 'university',
        division: 'dhaka',
        district: 'dhaka',
        upazila: 'shahbagh',
        address: 'Palashi, Dhaka 1000',
        website: 'https://www.buet.ac.bd',
        email: 'blooddonor@buet.ac.bd',
        phone: '01822223344',
        status: 'approved',
        totalRegisteredDonors: 85,
        description: 'বুয়েট ব্লাড ডোনার্স নেটওয়ার্ক। জরুরি প্রয়োজনে রক্তদানে সদা জাগ্রত।',
        createdAt: now,
        updatedAt: now
      },
      {
        _id: 'inst_cmc',
        name: 'Chittagong Medical College',
        nameBn: 'চট্টগ্রাম মেডিকেল কলেজ',
        code: 'CMC-BD',
        type: 'medical_college',
        division: 'chattogram',
        district: 'chattogram',
        upazila: 'panchlaish',
        address: '57 K.B. Fazlul Kader Rd, Chattogram 4203',
        website: 'https://www.cmc.edu.bd',
        email: 'bloodbank@cmc.edu.bd',
        phone: '01833334455',
        status: 'approved',
        totalRegisteredDonors: 96,
        description: 'চট্টগ্রাম মেডিকেল কলেজ সন্ধানী স্বেচ্ছাসেবী রক্তদান সংস্থা ইউনিট।',
        createdAt: now,
        updatedAt: now
      },
      {
        _id: 'inst_ru',
        name: 'Rajshahi University',
        nameBn: 'রাজশাহী বিশ্ববিদ্যালয়',
        code: 'RU-BD',
        type: 'university',
        division: 'rajshahi',
        district: 'rajshahi',
        upazila: 'motihar',
        address: 'Motihar, Rajshahi 6205',
        website: 'https://www.ru.ac.bd',
        email: 'bloodclub@ru.ac.bd',
        phone: '01844445566',
        status: 'approved',
        totalRegisteredDonors: 64,
        description: 'রাজশাহী বিশ্ববিদ্যালয় বাঁধন শাখা ও লাল গোলাপ স্বেচ্ছায় রক্তদান ফোরাম।',
        createdAt: now,
        updatedAt: now
      },
      {
        _id: 'inst_sust',
        name: 'Shahjalal University of Science and Technology',
        nameBn: 'শাহজালাল বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয়',
        code: 'SUST-BD',
        type: 'university',
        division: 'sylhet',
        district: 'sylhet',
        upazila: 'sylhet_sadar',
        address: 'Kumargaon, Sylhet 3114',
        website: 'https://www.sust.edu',
        email: 'blood@sust.edu',
        phone: '01855556677',
        status: 'pending',
        totalRegisteredDonors: 12,
        description: 'ক্যাম্পাস ও সিলেট অঞ্চলের রক্তদান নেটওয়ার্ক সম্প্রসারণ ফোরাম।',
        createdAt: now,
        updatedAt: now
      }
    ];

    // 3. Initial Donor Profiles
    this.donorProfiles = [
      {
        _id: 'donor_prof_1',
        userId: 'usr_donor_1',
        displayName: 'রফিকুল ইসলাম',
        bloodGroup: 'O+',
        division: 'dhaka',
        district: 'dhaka',
        upazila: 'mirpur',
        addressDetails: 'মিরপুর ১০, ঢাকা',
        dateOfBirth: new Date('1998-05-14'),
        gender: 'male',
        availabilityStatus: 'available',
        lastDonationDate: new Date('2026-05-10'),
        totalDonations: 6,
        institutionId: 'inst_du',
        institutionMembershipVerified: true,
        consentToShareContact: true,
        preferredContactMethod: 'phone',
        bio: 'নিয়মিত রক্তদান করি। জরুরি প্রয়োজনে যোগাযোগ করতে পারেন।',
        isPubliclyListed: true,
        emergencyAvailable: true,
        createdAt: now,
        updatedAt: now
      },
      {
        _id: 'donor_prof_2',
        userId: 'usr_donor_2',
        displayName: 'তানভীর আহমেদ',
        bloodGroup: 'A+',
        division: 'dhaka',
        district: 'dhaka',
        upazila: 'dhanmondi',
        addressDetails: 'ধানমন্ডি ২৭, ঢাকা',
        dateOfBirth: new Date('2000-08-20'),
        gender: 'male',
        availabilityStatus: 'available',
        lastDonationDate: new Date('2026-06-01'),
        totalDonations: 4,
        institutionId: 'inst_buet',
        institutionMembershipVerified: true,
        consentToShareContact: true,
        preferredContactMethod: 'phone',
        bio: 'সচেতন থাকুন, নিয়মিত রক্ত দিন। রোগীর সেবায় সর্বদা নিয়োজিত।',
        isPubliclyListed: true,
        emergencyAvailable: true,
        createdAt: now,
        updatedAt: now
      },
      {
        _id: 'donor_prof_3',
        userId: 'usr_donor_3',
        displayName: 'নুসরাত জাহান',
        bloodGroup: 'B+',
        division: 'chattogram',
        district: 'chattogram',
        upazila: 'panchlaish',
        addressDetails: 'প্রবর্তক মোড়, চট্টগ্রাম',
        dateOfBirth: new Date('1999-11-12'),
        gender: 'female',
        availabilityStatus: 'recently_donated',
        lastDonationDate: new Date('2026-09-25'),
        totalDonations: 3,
        institutionId: 'inst_cmc',
        institutionMembershipVerified: true,
        consentToShareContact: false, // Default private for female safety
        preferredContactMethod: 'platform',
        bio: 'মেডিকেল শিক্ষার্থী। রক্তদান একটি পবিত্র দায়িত্ব।',
        isPubliclyListed: true,
        emergencyAvailable: false,
        createdAt: now,
        updatedAt: now
      },
      {
        _id: 'donor_prof_4',
        userId: 'usr_donor_4',
        displayName: 'সাকিব মাহমুদ',
        bloodGroup: 'AB+',
        division: 'rajshahi',
        district: 'rajshahi',
        upazila: 'boalia',
        addressDetails: 'সাহেব বাজার, রাজশাহী',
        dateOfBirth: new Date('1997-03-05'),
        gender: 'male',
        availabilityStatus: 'available',
        lastDonationDate: new Date('2026-04-12'),
        totalDonations: 5,
        institutionId: 'inst_ru',
        institutionMembershipVerified: true,
        consentToShareContact: true,
        preferredContactMethod: 'phone',
        bio: 'রাজশাহী শহরের যেকোনো জরুরি প্রয়োজনে যোগাযোগ করতে পারেন।',
        isPubliclyListed: true,
        emergencyAvailable: true,
        createdAt: now,
        updatedAt: now
      }
    ];

    // 4. Initial Blood Requests
    this.bloodRequests = [
      {
        _id: 'req_1',
        requesterId: 'usr_requester_1',
        patientName: 'ফরিদা বেগম (৬৫)',
        bloodGroup: 'O+',
        unitsRequired: 2,
        unitsFulfilled: 1,
        hospitalName: 'ঢাকা মেডিকেল কলেজ হাসপাতাল',
        hospitalAddress: 'জরুরি বিভাগ, ওটি ভবন, ৩য় তলা, ঢাকা',
        division: 'dhaka',
        district: 'dhaka',
        upazila: 'shahbagh',
        requiredDate: new Date(Date.now() + 86400000 * 2),
        urgencyLevel: 'emergency',
        reason: 'হিপ ফ্র্যাকচার অপারেশন ও হিমোগ্লোবিন স্বল্পতার কারণে রক্তের জরুরি প্রয়োজন।',
        contactNumber: '01755555555',
        alternativeContactNumber: '01855555555',
        status: 'partially_fulfilled',
        expiresAt: new Date(Date.now() + 86400000 * 4),
        createdAt: new Date(Date.now() - 3600000 * 5),
        updatedAt: now
      },
      {
        _id: 'req_2',
        requesterId: 'usr_requester_1',
        patientName: 'আরিফুল হক (২৮)',
        bloodGroup: 'A+',
        unitsRequired: 1,
        unitsFulfilled: 0,
        hospitalName: 'বঙ্গবন্ধু শেখ মুজিব মেডিক্যাল বিশ্ববিদ্যালয় (বিএসএমএমইউ)',
        hospitalAddress: 'কেবিন ব্লক, শাহবাগ, ঢাকা',
        division: 'dhaka',
        district: 'dhaka',
        upazila: 'shahbagh',
        requiredDate: new Date(Date.now() + 86400000),
        urgencyLevel: 'emergency',
        reason: 'থ্যালাসেমিয়া নিয়মিত ব্লাড ট্রান্সফিউশন। দ্রুত ১ ব্যাগ এ পজিটিভ রক্ত প্রয়োজন।',
        contactNumber: '01755555555',
        status: 'open',
        expiresAt: new Date(Date.now() + 86400000 * 3),
        createdAt: new Date(Date.now() - 3600000 * 12),
        updatedAt: now
      },
      {
        _id: 'req_3',
        requesterId: 'usr_donor_1',
        patientName: 'শামসুল আলম (৫০)',
        bloodGroup: 'B+',
        unitsRequired: 2,
        unitsFulfilled: 0,
        hospitalName: 'চট্টগ্রাম মেডিকেল কলেজ হাসপাতাল',
        hospitalAddress: 'সার্জারি ওয়ার্ড নং ১২, পাঁচলাইশ, চট্টগ্রাম',
        division: 'chattogram',
        district: 'chattogram',
        upazila: 'panchlaish',
        requiredDate: new Date(Date.now() + 86400000 * 3),
        urgencyLevel: 'urgent',
        reason: 'পাকস্থলী অপারেশনের জন্য রক্তের প্রয়োজন।',
        contactNumber: '01711111111',
        status: 'open',
        expiresAt: new Date(Date.now() + 86400000 * 5),
        createdAt: new Date(Date.now() - 3600000 * 24),
        updatedAt: now
      }
    ];

    // 5. Initial Institution Requests (Applications to review)
    this.institutionRequests = [
      {
        _id: 'inst_req_1',
        name: 'Jahangirnagar University',
        nameBn: 'জাহাঙ্গীরনগর বিশ্ববিদ্যালয়',
        code: 'JU-BD',
        type: 'university',
        division: 'dhaka',
        district: 'dhaka',
        upazila: 'savar',
        address: 'Savar, Dhaka 1342',
        applicantName: 'মো: হাসিবুর রহমান',
        applicantPhone: '01788881111',
        applicantEmail: 'hasib.ju@example.com',
        applicantRole: 'সাধারণ সম্পাদক, বাঁধন জাবি ইউনিট',
        supportingDetails: 'জাহাঙ্গীরনগর বিশ্ববিদ্যালয় বাঁধন রক্তদান শাখার মাধ্যমে ক্যাম্পাসে রক্তদান কার্যক্রম পরিচালনার জন্য নিবন্ধন।',
        status: 'pending_review',
        createdAt: new Date(Date.now() - 86400000 * 2),
        updatedAt: new Date(Date.now() - 86400000 * 2)
      },
      {
        _id: 'inst_req_2',
        name: 'University of Chittagong',
        nameBn: 'চট্টগ্রাম বিশ্ববিদ্যালয়',
        code: 'CU-BD',
        type: 'university',
        division: 'chattogram',
        district: 'chattogram',
        upazila: 'hathazari',
        address: 'Fatehpur, Hathazari, Chattogram 4331',
        applicantName: 'নাসরিন সুলতানা',
        applicantPhone: '01788882222',
        applicantEmail: 'nasrin.cu@example.com',
        applicantRole: 'সভাপতি, রোভার স্কাউট চবি',
        supportingDetails: 'চট্টগ্রাম বিশ্ববিদ্যালয় শিক্ষার্থী ও ক্যাম্পাসে রক্তের প্রয়োজনীয়তায় তাৎক্ষণিক সাড়ার জন্য প্রাতিষ্ঠানিক সংযুক্তি।',
        status: 'pending_review',
        createdAt: new Date(Date.now() - 86400000 * 3),
        updatedAt: new Date(Date.now() - 86400000 * 3)
      }
    ];

    // 6. Initial Moderator Activities
    this.moderatorActivities = [
      {
        _id: 'act_1',
        actorId: 'usr_moderator_du',
        actorName: 'আব্দুল্লাহ আল মামুন',
        actorRole: 'INSTITUTION_MODERATOR',
        action: 'MEMBER_CREATED',
        targetRecordId: 'usr_donor_1',
        targetRecordType: 'User',
        institutionScope: 'inst_du',
        divisionScope: 'dhaka',
        reason: 'ঢাবি ক্যাম্পাসে রক্তদান ক্যাম্পেইন থেকে নতুন স্বেচ্ছাসেবী সদস্য সংযুক্তি।',
        result: 'সফল',
        createdAt: new Date(Date.now() - 86400000 * 5)
      },
      {
        _id: 'act_2',
        actorId: 'usr_moderator_du',
        actorName: 'আব্দুল্লাহ আল মামুন',
        actorRole: 'INSTITUTION_MODERATOR',
        action: 'MEMBER_EDITED',
        targetRecordId: 'donor_prof_1',
        targetRecordType: 'DonorProfile',
        institutionScope: 'inst_du',
        divisionScope: 'dhaka',
        reason: 'সদস্যের সর্বশেষ রক্তদানের তারিখ ও প্রাপ্ত নম্বর হালনাগাদ।',
        result: 'সফল',
        createdAt: new Date(Date.now() - 86400000 * 3)
      },
      {
        _id: 'act_3',
        actorId: 'usr_coordinator_dhaka',
        actorName: 'মো: কামরুল হাসান',
        actorRole: 'DIVISION_COORDINATOR',
        action: 'MEMBER_BLOCKED',
        targetRecordId: 'usr_blocked_demo',
        targetRecordType: 'User',
        divisionScope: 'dhaka',
        reason: 'ভুয়া রক্তের অনুরোধ পোস্ট এবং বাণিজ্যিক সুবিধার অভিযোগে স্থগিত রাখা হয়েছে।',
        result: 'স্থগিত',
        createdAt: new Date(Date.now() - 86400000 * 2)
      }
    ];

    // 7. Initial Contact Requests
    this.contactRequests = [
      {
        _id: 'cr_1',
        requesterId: 'usr_requester_1',
        requesterName: 'মাহবুব আলম',
        requesterPhone: '01755555555',
        institutionId: 'inst_du',
        targetBloodGroup: 'O+',
        patientName: 'ফরিদা বেগম',
        hospitalName: 'ঢাকা মেডিকেল কলেজ হাসপাতাল',
        unitsRequired: 2,
        urgency: 'emergency',
        reason: 'হিপ ফ্র্যাকচার সার্জারির জন্য জরুরি ভিত্তিতে ঢাকা বিশ্ববিদ্যালয় ক্যাম্পাসের ও পজিটিভ রক্তদাতার প্রয়োজন।',
        status: 'pending',
        assignedModeratorId: 'usr_moderator_du',
        createdAt: new Date(Date.now() - 3600000 * 3),
        updatedAt: new Date(Date.now() - 3600000 * 3)
      }
    ];

    // 8. Initial Account Status Histories
    this.accountStatusHistories = [
      {
        _id: 'ash_1',
        userId: 'usr_blocked_demo',
        targetUserName: 'ফারুক হোসেন (স্থগিত সদস্য)',
        targetUserPhone: '01799999999',
        oldStatus: 'active',
        newStatus: 'temporarily_blocked',
        actorId: 'usr_coordinator_dhaka',
        actorName: 'মো: কামরুল হাসান',
        actorRole: 'DIVISION_COORDINATOR',
        reason: 'ভুয়া রক্তের অনুরোধ পোস্ট এবং বাণিজ্যিক সুবিধার অভিযোগে স্থগিত রাখা হয়েছে।',
        createdAt: new Date(Date.now() - 86400000 * 2)
      }
    ];

    // 9. Initial Reports
    this.reports = [
      {
        _id: 'rep_1',
        reportedBy: 'usr_donor_1',
        targetType: 'blood_request',
        targetId: 'req_3',
        reason: 'false_information',
        description: 'যোগাযোগ নম্বরে ফোন দিলে তারা বলে রক্ত প্রয়োজন মিটে গেছে কিন্তু পোস্ট এখনো ওপেন দেখাচ্ছে।',
        status: 'pending',
        createdAt: new Date(Date.now() - 3600000 * 4),
        updatedAt: now
      }
    ];

    // 10. Initial Notifications
    this.notifications = [
      {
        _id: 'notif_1',
        userId: 'usr_moderator_du',
        title: 'নতুন প্রাতিষ্ঠানিক যোগাযোগের অনুরোধ',
        message: 'ঢাকা বিশ্ববিদ্যালয় ক্যাম্পাসের জন্য O+ রক্তের ১টি জরুরি আবেদন এসেছে।',
        type: 'contact_request',
        link: '/moderator/dashboard',
        isRead: false,
        createdAt: new Date(Date.now() - 3600000 * 3)
      },
      {
        _id: 'notif_2',
        userId: 'usr_coordinator_dhaka',
        title: 'নতুন প্রতিষ্ঠান নিবন্ধন আবেদন',
        message: 'ঢাকা বিভাগের অধীনে জাহাঙ্গীরনগর বিশ্ববিদ্যালয় (JU-BD) নিবন্ধনের আবেদন জমা দিয়েছে।',
        type: 'institution_update',
        link: '/coordinator/dashboard',
        isRead: false,
        createdAt: new Date(Date.now() - 86400000 * 2)
      }
    ];
  }

  // --- User Methods ---
  findUserById(id: string): StoredUser | undefined {
    return this.users.find(u => u._id === id);
  }

  findUserByPhone(phone: string): StoredUser | undefined {
    return this.users.find(u => u.phone === phone);
  }

  createUser(userData: Partial<StoredUser>): StoredUser {
    const newUser: StoredUser = {
      _id: 'usr_' + Date.now() + Math.random().toString(36).substring(2, 7),
      name: userData.name || '',
      phone: userData.phone || '',
      email: userData.email,
      passwordHash: userData.passwordHash || '',
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
    return newUser;
  }

  updateUser(id: string, update: Partial<StoredUser>): StoredUser | null {
    const user = this.findUserById(id);
    if (!user) return null;
    Object.assign(user, update, { updatedAt: new Date() });
    return user;
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
    const temporaryPassword = 'Temp#' + Math.floor(100000 + Math.random() * 900000);
    const passwordHash = bcrypt.hashSync(temporaryPassword, 10);

    const newUser = this.createUser({
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

    const newProfile = this.createDonorProfile({
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
    const inst = this.findInstitutionById(params.institutionId);
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
    const user = this.findUserById(userId);
    if (!user) return false;
    user.passwordHash = bcrypt.hashSync(newPassword, 10);
    user.requirePasswordChangeAtFirstLogin = false;
    user.updatedAt = new Date();
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
    const targetUser = this.findUserById(params.userId);
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

    // Record in AccountStatusHistory
    this.accountStatusHistories.unshift({
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
    });

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
    const targetUser = this.findUserById(params.userId);
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

    // Record in AccountStatusHistory
    this.accountStatusHistories.unshift({
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
    });

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
  findDonorProfileByUserId(userId: string): StoredDonorProfile | undefined {
    return this.donorProfiles.find(d => d.userId === userId);
  }

  findDonorProfileById(id: string): StoredDonorProfile | undefined {
    return this.donorProfiles.find(d => d._id === id);
  }

  createDonorProfile(data: Partial<StoredDonorProfile>): StoredDonorProfile {
    const newProfile: StoredDonorProfile = {
      _id: 'donor_prof_' + Date.now() + Math.random().toString(36).substring(2, 7),
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
    return newProfile;
  }

  updateDonorProfile(userId: string, update: Partial<StoredDonorProfile>): StoredDonorProfile | null {
    const profile = this.findDonorProfileByUserId(userId);
    if (!profile) return null;
    Object.assign(profile, update, { updatedAt: new Date() });
    return profile;
  }

  searchDonors(filters: {
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
      // Must be publicly listed AND user must be active
      const user = this.findUserById(d.userId);
      return d.isPubliclyListed && user && user.accountStatus === 'active' && user.isActive;
    });

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
      const institution = p.institutionId ? this.findInstitutionById(p.institutionId) : undefined;
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
  findBloodRequestById(id: string): StoredBloodRequest | undefined {
    return this.bloodRequests.find(r => r._id === id);
  }

  createBloodRequest(data: Partial<StoredBloodRequest>): StoredBloodRequest {
    const newReq: StoredBloodRequest = {
      _id: 'req_' + Date.now() + Math.random().toString(36).substring(2, 7),
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
      urgencyLevel: data.urgencyLevel || 'emergency',
      reason: data.reason || '',
      contactNumber: data.contactNumber || '',
      alternativeContactNumber: data.alternativeContactNumber,
      status: data.status || 'open',
      moderationNotes: data.moderationNotes,
      institutionId: data.institutionId,
      expiresAt: data.expiresAt || new Date(Date.now() + 86400000 * 3),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.bloodRequests.unshift(newReq);
    return newReq;
  }

  updateBloodRequest(id: string, update: Partial<StoredBloodRequest>): StoredBloodRequest | null {
    const req = this.findBloodRequestById(id);
    if (!req) return null;
    Object.assign(req, update, { updatedAt: new Date() });
    return req;
  }

  searchBloodRequests(filters: {
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
  findInstitutionById(id: string): StoredInstitution | undefined {
    return this.institutions.find(i => i._id === id);
  }

  getInstitutions(filters: { division?: string; status?: string; search?: string }) {
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

  createInstitution(data: Partial<StoredInstitution>): StoredInstitution {
    const newInst: StoredInstitution = {
      _id: 'inst_' + Date.now() + Math.random().toString(36).substring(2, 7),
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
    return newInst;
  }

  updateInstitution(id: string, update: Partial<StoredInstitution>): StoredInstitution | null {
    const inst = this.findInstitutionById(id);
    if (!inst) return null;
    Object.assign(inst, update, { updatedAt: new Date() });
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
    const req = this.institutionRequests.find(r => r._id === params.requestId);
    if (!req) {
      return { success: false, message: 'আবেদনটি খুঁজে পাওয়া যায়নি।' };
    }

    // Authorization: Only Super Admin or Coordinator of same division can approve/reject
    if (params.reviewerRole === 'ADMIN') {
      return { success: false, message: 'অননুমোদিত: প্ল্যাটফর্ম অ্যাডমিন প্রতিষ্ঠান অনুমোদন বা বাতিল করার ক্ষমতাপ্রাপ্ত নন।' };
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
      const inst = this.findInstitutionById(m.assignedInstitution);
      return inst && inst.division.toLowerCase() === division.toLowerCase();
    }).map(m => {
      const inst = m.assignedInstitution ? this.findInstitutionById(m.assignedInstitution) : undefined;
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
    const inst = this.findInstitutionById(data.institutionId);
    const newContactReq: StoredContactRequest = {
      _id: 'cr_' + Date.now() + Math.random().toString(36).substring(2, 6),
      ...data,
      status: 'pending',
      assignedModeratorId: inst?.assignedModeratorId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.contactRequests.unshift(newContactReq);

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
    return req;
  }

  // --- Contact Access & Privacy Flow ---
  getViewerDailyContactAccessCount(viewerId: string): number {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return this.contactAccessLogs.filter(
      log => log.viewerId === viewerId && log.createdAt >= twentyFourHoursAgo
    ).length;
  }

  recordContactAccess(logData: {
    viewerId: string;
    donorUserId: string;
    donorProfileId: string;
    purpose: 'blood_request' | 'emergency_search' | 'direct_request';
    relatedBloodRequestId?: string;
    ipAddress?: string;
    userAgent?: string;
  }): StoredContactAccessLog {
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

    const viewer = this.findUserById(logData.viewerId);
    this.createNotification({
      userId: logData.donorUserId,
      title: 'জরুরি যোগাযোগের অনুরোধ',
      message: `${viewer?.name || 'একজন ব্যবহারকারী'} জরুরি রক্তদানের জন্য আপনার যোগাযোগের নম্বর দেখেছেন।`,
      type: 'contact_revealed'
    });

    return newLog;
  }

  // --- OTP Methods ---
  saveOtp(phone: string, otp: string, purpose: string): StoredOtp {
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
    return otpRecord;
  }

  verifyOtp(phone: string, rawOtp: string, purpose: string): { success: boolean; message: string } {
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

  // --- Report Methods ---
  createReport(data: Partial<StoredReport>): StoredReport {
    const newReport: StoredReport = {
      _id: 'rep_' + Date.now() + Math.random().toString(36).substring(2, 7),
      reportedBy: data.reportedBy || '',
      targetType: data.targetType || 'blood_request',
      targetId: data.targetId || '',
      reason: data.reason || 'other',
      description: data.description || '',
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.reports.unshift(newReport);
    return newReport;
  }

  getReports(filters: { status?: string; targetType?: string }) {
    let list = [...this.reports];
    if (filters.status) {
      list = list.filter(r => r.status === filters.status);
    }
    if (filters.targetType) {
      list = list.filter(r => r.targetType === filters.targetType);
    }
    return list;
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
}

export const dataStore = new DataStore();
