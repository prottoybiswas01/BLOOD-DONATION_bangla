import bcrypt from 'bcryptjs';
import { BANGLADESH_DIVISIONS, BloodGroup } from '../data/bangladeshLocations.js';
import { UserRole } from '../models/User.js';
import { AvailabilityStatus } from '../models/DonorProfile.js';
import { RequestStatus, UrgencyLevel } from '../models/BloodRequest.js';

export interface StoredUser {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  passwordHash: string;
  role: UserRole;
  assignedDivision?: string;
  assignedInstitution?: string;
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
  totalRegisteredDonors: number;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
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
  type: 'request_match' | 'contact_revealed' | 'status_update' | 'institution_update' | 'system';
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
        assignedInstitution: 'inst_du',
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
        role: 'DONOR',
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
        role: 'DONOR',
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
        role: 'DONOR',
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
        role: 'DONOR',
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
        role: 'REQUESTER',
        isActive: true,
        isPhoneVerified: true,
        createdAt: now,
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
        consentToShareContact: true,
        preferredContactMethod: 'phone',
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
        requiredDate: new Date(Date.now() + 86400000 * 2), // in 2 days
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
        requiredDate: new Date(Date.now() + 86400000), // tomorrow
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
      },
      {
        _id: 'req_4',
        requesterId: 'usr_donor_2',
        patientName: 'সালমা খাতুন (৩৪)',
        bloodGroup: 'O+',
        unitsRequired: 1,
        unitsFulfilled: 1,
        hospitalName: 'রাজশাহী মেডিকেল কলেজ হাসপাতাল',
        hospitalAddress: 'গাইনি বিভাগ, ওয়ার্ড ৪, রাজশাহী',
        division: 'rajshahi',
        district: 'rajshahi',
        upazila: 'rajpara',
        requiredDate: new Date(Date.now() - 86400000 * 2),
        urgencyLevel: 'standard',
        reason: 'সিজারিয়ান ডেলিভারির সময় রক্তের প্রয়োজন হয়েছিল।',
        contactNumber: '01722222222',
        status: 'fulfilled',
        expiresAt: new Date(Date.now() + 86400000),
        createdAt: new Date(Date.now() - 86400000 * 3),
        updatedAt: now
      }
    ];

    // 5. Initial Reports
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

    // 6. Initial Notifications
    this.notifications = [
      {
        _id: 'notif_1',
        userId: 'usr_donor_1',
        title: 'নতুন রক্তের অনুরোধ',
        message: 'আপনার এলাকায় O+ রক্তের ১টি নতুন জরুরি অনুরোধ এসেছে (ঢাকা মেডিকেল কলেজ হাসপাতাল)।',
        type: 'request_match',
        link: '/requests/req_1',
        isRead: false,
        createdAt: new Date(Date.now() - 3600000 * 3)
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
      role: userData.role || 'DONOR',
      assignedDivision: userData.assignedDivision,
      assignedInstitution: userData.assignedInstitution,
      isActive: true,
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
    availabilityStatus?: string;
    limit?: number;
    page?: number;
  }) {
    let result = this.donorProfiles.filter(d => d.isPubliclyListed);

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
    if (filters.availabilityStatus) {
      result = result.filter(d => d.availabilityStatus === filters.availabilityStatus);
    }

    const total = result.length;
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const startIndex = (page - 1) * limit;
    const paginated = result.slice(startIndex, startIndex + limit);

    // CRITICAL: Public and guest donor search APIs must NEVER return private phone numbers.
    // Transform profiles to public safe records
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

    // Automatically check expiration: requests whose expiresAt has passed should not be open
    const now = new Date();
    result.forEach(r => {
      if ((r.status === 'open' || r.status === 'partially_fulfilled') && new Date(r.expiresAt) < now) {
        r.status = 'expired';
      }
    });

    if (filters.status) {
      result = result.filter(r => r.status === filters.status);
    } else {
      // By default for public feed, show only open and partially fulfilled requests
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

    // Sort: emergency first, then nearest requiredDate
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

    // Notify donor that their contact was accessed for an emergency
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
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      attempts: 0,
      isUsed: false,
      purpose,
      createdAt: new Date()
    };
    // remove previous otps for this phone
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
