import { Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth.js';
import { 
  dataStore, 
  CONFIRMED_DEMO_USER_IDS, 
  CONFIRMED_DEMO_DONOR_IDS, 
  CONFIRMED_DEMO_REQUEST_IDS, 
  isConfirmedDemoDonor 
} from '../services/dataStore.js';
import { inMemoryAuditLogs, logAuditEvent } from '../services/auditService.js';
import { isDatabaseConnected } from '../config/db.js';
import { UserModel } from '../models/User.js';
import { DonorProfileModel } from '../models/DonorProfile.js';
import { BloodRequestModel } from '../models/BloodRequest.js';
import { InstitutionModel } from '../models/Institution.js';
import { InstitutionRequestModel } from '../models/InstitutionRequest.js';
import { PhoneChangeRequestModel } from '../models/PhoneChangeRequest.js';
import { PasswordRecoveryRequestModel } from '../models/PasswordRecoveryRequest.js';
import { InstitutionChangeRequestModel } from '../models/InstitutionChangeRequest.js';
import { ReportModel } from '../models/Report.js';
import { ContactAccessLogModel } from '../models/ContactAccessLog.js';

export function getBangladeshLast6Months(): { label: string; year: number; month: number; start: Date; end: Date }[] {
  const BENGALI_MONTHS = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
  const now = new Date();
  const bstTime = new Date(now.getTime() + 6 * 3600 * 1000);
  const curYear = bstTime.getUTCFullYear();
  const curMonth = bstTime.getUTCMonth(); // 0-11

  const months = [];
  for (let i = 5; i >= 0; i--) {
    let m = curMonth - i;
    let y = curYear;
    while (m < 0) {
      m += 12;
      y -= 1;
    }
    const start = new Date(Date.UTC(y, m, 1, -6, 0, 0, 0));
    const end = new Date(Date.UTC(y, m + 1, 1, -6, 0, 0, 0));
    months.push({
      label: BENGALI_MONTHS[m],
      year: y,
      month: m + 1,
      start,
      end
    });
  }
  return months;
}

export const UpdateRoleSchema = z.object({
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'DIVISION_COORDINATOR', 'INSTITUTION_MODERATOR', 'MEMBER', 'DONOR', 'REQUESTER']),
  assignedDivision: z.string().optional(),
  assignedInstitution: z.string().optional()
});

export const BlockUserSchema = z.object({
  reason: z.string().min(5, 'স্থগিতকরণের কারণ কমপক্ষে ৫ অক্ষরে উল্লেখ করতে হবে'),
  status: z.enum(['temporarily_blocked', 'suspended', 'deactivated']).default('temporarily_blocked')
});

export const UnblockUserSchema = z.object({
  reason: z.string().min(5, 'পুনরুদ্ধারের কারণ কমপক্ষে ৫ অক্ষরে উল্লেখ করতে হবে')
});

export const AdminEditProfileSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional().or(z.literal('')),
  gender: z.enum(['male', 'female', 'unspecified', 'other']).optional(),
  division: z.string().optional(),
  district: z.string().optional(),
  upazila: z.string().optional(),
  assignedDivision: z.string().optional(),
  assignedInstitution: z.string().optional()
});

export async function getAdminOverview(req: AuthRequest, res: Response): Promise<void> {
  try {
    const ALL_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const months = getBangladeshLast6Months();
    const demoUserIds = Array.from(CONFIRMED_DEMO_USER_IDS).concat(['usr_superadmin']);

    if (isDatabaseConnected()) {
      const [
        usersCount,
        activeAccounts,
        blockedUsersCount,
        donorsCount,
        availableDonors,
        requestsCount,
        activeRequests,
        institutionsCount,
        pendingInstitutions,
        pendingPhoneRequests,
        pendingRecoveryRequests,
        pendingInstitutionChanges,
        pendingReports,
        totalContactReveals,
        groupCountsRaw,
        monthlyCountsRaw
      ] = await Promise.all([
        UserModel.countDocuments({ _id: { $nin: demoUserIds } }),
        UserModel.countDocuments({ accountStatus: 'active', isActive: true, _id: { $nin: demoUserIds } }),
        UserModel.countDocuments({
          $or: [{ accountStatus: { $ne: 'active' } }, { isActive: false }],
          _id: { $nin: demoUserIds }
        }),
        DonorProfileModel.countDocuments({
          _id: { $nin: Array.from(CONFIRMED_DEMO_DONOR_IDS) },
          userId: { $nin: demoUserIds }
        }),
        DonorProfileModel.countDocuments({
          availabilityStatus: 'available',
          isPubliclyListed: true,
          _id: { $nin: Array.from(CONFIRMED_DEMO_DONOR_IDS) },
          userId: { $nin: demoUserIds }
        }),
        BloodRequestModel.countDocuments({
          _id: { $nin: Array.from(CONFIRMED_DEMO_REQUEST_IDS) }
        }),
        BloodRequestModel.countDocuments({
          status: { $in: ['open', 'partially_fulfilled'] },
          _id: { $nin: Array.from(CONFIRMED_DEMO_REQUEST_IDS) }
        }),
        InstitutionModel.countDocuments(),
        InstitutionRequestModel.countDocuments({ status: 'pending_review' }),
        PhoneChangeRequestModel.countDocuments({ status: 'pending' }),
        PasswordRecoveryRequestModel.countDocuments({ status: 'pending' }),
        InstitutionChangeRequestModel.countDocuments({ status: 'pending' }),
        ReportModel.countDocuments({ status: 'pending' }),
        ContactAccessLogModel.countDocuments(),
        DonorProfileModel.aggregate([
          {
            $match: {
              _id: { $nin: Array.from(CONFIRMED_DEMO_DONOR_IDS) },
              userId: { $nin: demoUserIds }
            }
          },
          {
            $group: {
              _id: '$bloodGroup',
              count: { $sum: 1 }
            }
          }
        ]),
        Promise.all(months.map(m => UserModel.countDocuments({
          createdAt: { $gte: m.start, $lt: m.end },
          _id: { $nin: demoUserIds }
        })))
      ]);

      const groupMap = new Map((groupCountsRaw || []).map((g: any) => [g._id, g.count]));
      const bloodGroupDistribution = ALL_GROUPS.map(grp => ({
        group: grp,
        count: groupMap.get(grp) || 0
      }));

      const monthlyTrends = months.map((m, idx) => ({
        label: m.label,
        value: monthlyCountsRaw[idx] || 0
      }));

      return res.json({
        success: true,
        stats: {
          usersCount,
          activeAccounts,
          blockedUsersCount,
          donorsCount,
          availableDonors,
          requestsCount,
          activeRequests,
          institutionsCount,
          pendingInstitutions,
          pendingPhoneRequests,
          pendingRecoveryRequests,
          pendingInstitutionChanges,
          pendingReports,
          totalContactReveals,
          bloodGroupDistribution,
          monthlyTrends
        }
      });
    }

    // In-memory fallback
    const activeUsers = dataStore.users.filter(u => !demoUserIds.includes(u._id));
    const activeDonors = dataStore.donorProfiles.filter(d => !isConfirmedDemoDonor(d));
    const activeRequestsList = dataStore.bloodRequests.filter(r => r.status === 'open' || r.status === 'partially_fulfilled');

    const groupCountMap = new Map<string, number>();
    for (const d of activeDonors) {
      groupCountMap.set(d.bloodGroup, (groupCountMap.get(d.bloodGroup) || 0) + 1);
    }
    const bloodGroupDistribution = ALL_GROUPS.map(grp => ({
      group: grp,
      count: groupCountMap.get(grp) || 0
    }));

    const monthlyTrends = months.map(m => ({
      label: m.label,
      value: activeUsers.filter(u => new Date(u.createdAt) >= m.start && new Date(u.createdAt) < m.end).length
    }));

    res.json({
      success: true,
      stats: {
        usersCount: activeUsers.length,
        activeAccounts: activeUsers.filter(u => u.accountStatus === 'active' && u.isActive).length,
        blockedUsersCount: activeUsers.filter(u => u.accountStatus !== 'active' || !u.isActive).length,
        donorsCount: activeDonors.length,
        availableDonors: activeDonors.filter(d => d.availabilityStatus === 'available' && d.isPubliclyListed).length,
        requestsCount: dataStore.bloodRequests.length,
        activeRequests: activeRequestsList.length,
        institutionsCount: dataStore.institutions.length,
        pendingInstitutions: dataStore.institutionRequests.filter(i => i.status === 'pending_review').length,
        pendingPhoneRequests: dataStore.phoneChangeRequests.filter(p => p.status === 'pending').length,
        pendingRecoveryRequests: dataStore.passwordRecoveryRequests.filter(r => r.status === 'pending').length,
        pendingInstitutionChanges: dataStore.institutionChangeRequests.filter(i => i.status === 'pending').length,
        pendingReports: dataStore.reports.filter(r => r.status === 'pending').length,
        totalContactReveals: dataStore.contactAccessLogs.length,
        bloodGroupDistribution,
        monthlyTrends
      }
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'অ্যাডমিন পরিসংখ্যান লোড করতে ব্যর্থ হয়েছে।'
    });
  }
}

export async function getAdminDonors(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { bloodGroup, availabilityStatus, search, page, limit } = req.query;
    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit as string, 10) || 50));
    const skip = (pageNum - 1) * limitNum;

    if (isDatabaseConnected()) {
      const query: any = {};
      if (bloodGroup) query.bloodGroup = bloodGroup;
      if (availabilityStatus) query.availabilityStatus = availabilityStatus;
      if (dataStore.suppressDemoData) {
        query._id = { $nin: Array.from(CONFIRMED_DEMO_DONOR_IDS) };
        query.userId = { $nin: Array.from(CONFIRMED_DEMO_USER_IDS) };
      }

      const total = await DonorProfileModel.countDocuments(query);
      const profiles = await DonorProfileModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean();

      const userIds = profiles.map(p => String(p.userId));
      const users = await UserModel.find({ _id: { $in: userIds } }).select('_id name phone email role accountStatus isActive gender').lean();
      const userMap = new Map(users.map(u => [String(u._id), u]));

      const instIds = profiles.map(p => p.institutionId).filter(Boolean);
      const insts = await InstitutionModel.find({ _id: { $in: instIds } }).select('_id name nameBn').lean();
      const instMap = new Map(insts.map(i => [String(i._id), i.nameBn || i.name]));

      let list = profiles.map(p => {
        const u = userMap.get(String(p.userId));
        return {
          _id: p._id,
          userId: p.userId,
          displayName: p.displayName || u?.name,
          bloodGroup: p.bloodGroup,
          division: p.division,
          district: p.district,
          upazila: p.upazila,
          availabilityStatus: p.availabilityStatus,
          lastDonationDate: p.lastDonationDate,
          totalDonations: p.totalDonations,
          institutionId: p.institutionId,
          institutionName: p.institutionId ? instMap.get(String(p.institutionId)) : undefined,
          institutionMembershipVerified: p.institutionMembershipVerified,
          emergencyAvailable: p.emergencyAvailable,
          consentToShareContact: p.consentToShareContact,
          isPubliclyListed: p.isPubliclyListed,
          phone: u?.phone,
          userRole: u?.role || 'MEMBER',
          userAccountStatus: u?.accountStatus || (u?.isActive ? 'active' : 'suspended'),
          isActive: u?.isActive !== false,
          gender: p.gender || u?.gender,
          createdAt: p.createdAt
        };
      });

      if (search) {
        const q = String(search).toLowerCase();
        list = list.filter(d => (d.displayName && d.displayName.toLowerCase().includes(q)) || (d.phone && d.phone.includes(q)));
      }

      return res.json({
        success: true,
        donors: list,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum) || 1
      });
    }

    // In-memory fallback
    let list = dataStore.donorProfiles.map(p => {
      const u = dataStore.findUserByIdSync(p.userId);
      const inst = p.institutionId ? dataStore.findInstitutionByIdSync(p.institutionId) : undefined;
      return {
        _id: p._id,
        userId: p.userId,
        displayName: p.displayName || u?.name,
        bloodGroup: p.bloodGroup,
        division: p.division,
        district: p.district,
        upazila: p.upazila,
        availabilityStatus: p.availabilityStatus,
        lastDonationDate: p.lastDonationDate,
        totalDonations: p.totalDonations,
        institutionId: p.institutionId,
        institutionName: inst?.nameBn || inst?.name,
        institutionMembershipVerified: p.institutionMembershipVerified,
        emergencyAvailable: p.emergencyAvailable,
        consentToShareContact: p.consentToShareContact,
        isPubliclyListed: p.isPubliclyListed,
        phone: u?.phone,
        userRole: u?.role || 'MEMBER',
        userAccountStatus: u?.accountStatus || (u?.isActive ? 'active' : 'suspended'),
        isActive: u?.isActive !== false,
        gender: p.gender || u?.gender,
        createdAt: p.createdAt
      };
    });

    if (dataStore.suppressDemoData) {
      list = list.filter(d => !isConfirmedDemoDonor(d));
    }
    if (bloodGroup) list = list.filter(d => d.bloodGroup === bloodGroup);
    if (availabilityStatus) list = list.filter(d => d.availabilityStatus === availabilityStatus);
    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(d => (d.displayName && d.displayName.toLowerCase().includes(q)) || (d.phone && d.phone.includes(q)));
    }

    const total = list.length;
    const paginated = list.slice(skip, skip + limitNum);

    res.json({
      success: true,
      donors: paginated,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'রক্তদাতা তালিকা লোড করতে ব্যর্থ হয়েছে।'
    });
  }
}

export async function getUsers(req: AuthRequest, res: Response): Promise<void> {
  const { role, search, accountStatus } = req.query;
  let list = [...dataStore.users];

  if (role) {
    list = list.filter(u => u.role === role);
  }
  if (accountStatus) {
    list = list.filter(u => u.accountStatus === accountStatus);
  }
  if (search) {
    const q = (search as string).toLowerCase();
    list = list.filter(u => u.name.toLowerCase().includes(q) || u.phone.includes(q));
  }

  // Never expose passwords or hashes
  const safeUsers = list.map(u => ({
    _id: u._id,
    name: u.name,
    phone: u.phone,
    email: u.email,
    role: u.role,
    gender: u.gender,
    accountStatus: u.accountStatus || (u.isActive ? 'active' : 'suspended'),
    blockReason: u.blockReason,
    assignedDivision: u.assignedDivision,
    assignedInstitution: u.assignedInstitution,
    isActive: u.isActive,
    requirePasswordChangeAtFirstLogin: u.requirePasswordChangeAtFirstLogin,
    createdAt: u.createdAt,
    lastLoginAt: u.lastLoginAt
  }));

  res.json({
    success: true,
    users: safeUsers
  });
}

export async function getUserById(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const user = await dataStore.findUserById(id);
  if (!user) {
    res.status(404).json({ success: false, message: 'ব্যবহারকারী পাওয়া যায়নি।' });
    return;
  }

  const donorProfile = await dataStore.findDonorProfileByUserId(user._id);

  // Return complete authorized user profile WITHOUT secrets
  res.json({
    success: true,
    user: {
      _id: user._id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      role: user.role,
      gender: user.gender,
      accountStatus: user.accountStatus,
      blockReason: user.blockReason,
      blockedBy: user.blockedBy,
      blockedAt: user.blockedAt,
      assignedDivision: user.assignedDivision,
      assignedInstitution: user.assignedInstitution,
      division: user.division,
      district: user.district,
      upazila: user.upazila,
      isActive: user.isActive,
      requirePasswordChangeAtFirstLogin: user.requirePasswordChangeAtFirstLogin,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt
    },
    donorProfile
  });
}

export async function editUserProfileByAdmin(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'অননুমোদিত।' });
    return;
  }

  const { id } = req.params;
  const user = await dataStore.findUserById(id);
  if (!user) {
    res.status(404).json({ success: false, message: 'ব্যবহারকারী পাওয়া যায়নি।' });
    return;
  }

  // Admin cannot edit Super Admin
  if (user.role === 'SUPER_ADMIN' && req.user.role !== 'SUPER_ADMIN') {
    res.status(403).json({ success: false, message: 'অনধিকার চর্চা: সুপার অ্যাডমিন প্রোফাইল পরিবর্তনের অনুমতি নেই।' });
    return;
  }

  const data = req.body;
  const updated = await dataStore.updateUser(id, data);

  await logAuditEvent({
    actorId: req.user.userId,
    actorRole: req.user.role,
    action: 'ADMIN_EDITED_USER_PROFILE',
    targetType: 'User',
    targetId: id,
    details: { editedFields: Object.keys(data) }
  });

  res.json({
    success: true,
    message: 'ব্যবহারকারীর প্রোফাইল তথ্য সফলভাবে হালনাগাদ করা হয়েছে।',
    user: updated
  });
}

export async function updateUserRole(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'অননুমোদিত।' });
    return;
  }

  const { id } = req.params;
  const { role, assignedDivision, assignedInstitution } = req.body;

  // Only an existing active SUPER_ADMIN can promote another account to SUPER_ADMIN
  if (role === 'SUPER_ADMIN' && req.user.role !== 'SUPER_ADMIN') {
    res.status(403).json({
      success: false,
      message: 'অনধিকার চর্চা: শুধুমাত্র একজন সুপার অ্যাডমিন অন্য কোনো অ্যাকাউন্টকে সুপার অ্যাডমিন পদবি প্রদান করতে পারেন।'
    });
    return;
  }

  const user = await dataStore.findUserById(id);
  if (!user) {
    res.status(404).json({ success: false, message: 'ব্যবহারকারী খুঁজে পাওয়া যায়নি।' });
    return;
  }

  // Safety rule: Never remove or demote the last active SUPER_ADMIN
  if (user.role === 'SUPER_ADMIN' && role !== 'SUPER_ADMIN') {
    const superAdminCount = dataStore.users.filter(u => u.role === 'SUPER_ADMIN' && u.isActive && u.accountStatus === 'active').length;
    if (superAdminCount <= 1) {
      res.status(400).json({
        success: false,
        message: 'সুরক্ষা সতর্কতা: প্ল্যাটফর্মের একমাত্র সুপার অ্যাডমিনকে পদাবনতি করা সম্ভব নয়।'
      });
      return;
    }
  }

  const oldRole = user.role;
  await dataStore.updateUser(id, {
    role,
    assignedDivision: role === 'DIVISION_COORDINATOR' ? assignedDivision : undefined,
    assignedInstitution: role === 'INSTITUTION_MODERATOR' ? assignedInstitution : undefined,
    assignedInstitutions: role === 'INSTITUTION_MODERATOR' && assignedInstitution ? [assignedInstitution] : []
  });

  await logAuditEvent({
    actorId: req.user.userId,
    actorRole: req.user.role,
    action: 'UPDATE_USER_ROLE',
    targetType: 'User',
    targetId: id,
    details: { oldRole, newRole: role, assignedDivision, assignedInstitution }
  });

  res.json({
    success: true,
    message: 'ব্যবহারকারীর ভূমিকা ও অনুমতি সফলভাবে হালনাগাদ করা হয়েছে।'
  });
}

export async function blockUserAccount(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'অননুমোদিত।' });
    return;
  }

  const { id } = req.params;
  const { reason, status } = req.body;

  const targetUser = await dataStore.findUserById(id);
  if (!targetUser) {
    res.status(404).json({ success: false, message: 'ব্যবহারকারী পাওয়া যায়নি।' });
    return;
  }

  // Admin cannot block Super Admin
  if (targetUser.role === 'SUPER_ADMIN' && req.user.role !== 'SUPER_ADMIN') {
    res.status(403).json({ success: false, message: 'অনধিকার চর্চা: সুপার অ্যাডমিনকে ব্লক করার অনুমতি নেই।' });
    return;
  }

  const result = dataStore.blockUser({
    userId: id,
    actorId: req.user.userId,
    actorName: req.user.name,
    actorRole: req.user.role,
    reason,
    newStatus: status || 'temporarily_blocked'
  });

  if (!result.success) {
    res.status(400).json({ success: false, message: result.message });
    return;
  }

  await logAuditEvent({
    actorId: req.user.userId,
    actorRole: req.user.role,
    action: 'USER_ACCOUNT_BLOCKED',
    targetType: 'User',
    targetId: id,
    details: { reason, status: status || 'temporarily_blocked' }
  });

  res.json({
    success: true,
    message: result.message
  });
}

export async function unblockUserAccount(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'অননুমোদিত।' });
    return;
  }

  const { id } = req.params;
  const { reason } = req.body;

  const result = dataStore.unblockUser({
    userId: id,
    actorId: req.user.userId,
    actorName: req.user.name,
    actorRole: req.user.role,
    reason
  });

  if (!result.success) {
    res.status(400).json({ success: false, message: result.message });
    return;
  }

  await logAuditEvent({
    actorId: req.user.userId,
    actorRole: req.user.role,
    action: 'USER_ACCOUNT_UNBLOCKED',
    targetType: 'User',
    targetId: id,
    details: { reason }
  });

  res.json({
    success: true,
    message: result.message
  });
}

export async function getBlockedAccounts(req: AuthRequest, res: Response): Promise<void> {
  const division = req.user?.role === 'DIVISION_COORDINATOR' ? req.user.assignedDivision : undefined;
  const blockedUsers = dataStore.getBlockedUsers(division).map(u => ({
    _id: u._id,
    name: u.name,
    phone: u.phone,
    role: u.role,
    accountStatus: u.accountStatus,
    blockReason: u.blockReason,
    blockedAt: u.blockedAt,
    division: u.division || u.assignedDivision
  }));

  res.json({
    success: true,
    blockedUsers
  });
}

export async function getAccountStatusHistories(req: AuthRequest, res: Response): Promise<void> {
  res.json({
    success: true,
    histories: dataStore.accountStatusHistories
  });
}

export async function getAuditLogs(req: AuthRequest, res: Response): Promise<void> {
  res.json({
    success: true,
    logs: inMemoryAuditLogs
  });
}

export async function getContactAccessLogs(req: AuthRequest, res: Response): Promise<void> {
  const logsWithDetails = dataStore.contactAccessLogs.map(log => {
    const viewer = dataStore.findUserByIdSync(log.viewerId);
    const donor = dataStore.findUserByIdSync(log.donorUserId);
    return {
      _id: log._id,
      viewerName: viewer?.name || 'অজানা',
      viewerPhone: viewer?.phone || '',
      donorName: donor?.name || 'অজানা',
      donorPhone: donor?.phone || '',
      purpose: log.purpose,
      createdAt: log.createdAt
    };
  });

  res.json({
    success: true,
    logs: logsWithDetails
  });
}

export async function updateInstitutionStatus(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'অননুমোদিত।' });
    return;
  }

  // Admin cannot approve or change institution status
  if (req.user.role === 'ADMIN') {
    res.status(403).json({
      success: false,
      message: 'অনধিকার চর্চা: প্ল্যাটফর্ম অ্যাডমিন প্রতিষ্ঠানের স্ট্যাটাস পরিবর্তন করতে পারবেন না। এটি কেবল সুপার অ্যাডমিন কর্তৃক অনুমোদিত।'
    });
    return;
  }

  const { id } = req.params;
  const { status, verificationNote } = req.body;

  const institution = dataStore.institutions.find(i => i._id === id);
  if (!institution) {
    res.status(404).json({ success: false, message: 'প্রতিষ্ঠান পাওয়া যায়নি।' });
    return;
  }

  institution.status = status;
  if (verificationNote) {
    institution.verificationNotes = verificationNote;
  }

  await logAuditEvent({
    actorId: req.user.userId,
    actorRole: req.user.role,
    action: 'INSTITUTION_STATUS_UPDATED',
    targetType: 'Institution',
    targetId: institution._id,
    details: { newStatus: status, note: verificationNote }
  });

  dataStore.persistInstitution(institution);

  res.json({
    success: true,
    message: 'প্রতিষ্ঠানের অবস্থা সফলভাবে পরিবর্তন করা হয়েছে।',
    institution
  });
}

export async function searchScopedUser(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'অননুমোদিত।' });
    return;
  }

  const searcher = await dataStore.findUserById(req.user.userId);
  if (!searcher) {
    res.status(401).json({ success: false, message: 'ব্যবহারকারী অ্যাকাউন্ট পাওয়া যায়নি।' });
    return;
  }

  const { query } = req.query;
  if (!query || typeof query !== 'string' || !query.trim()) {
    res.status(400).json({ success: false, message: 'অনুসন্ধানের জন্য ইউজার আইডি, মোবাইল নম্বর বা নাম প্রদান করুন।' });
    return;
  }

  const result = dataStore.scopedUserSearch(query, searcher);
  res.json(result);
}

export async function manualCreateInstitution(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'অননুমোদিত।' });
    return;
  }

  const creator = await dataStore.findUserById(req.user.userId);
  if (!creator) {
    res.status(401).json({ success: false, message: 'ব্যবহারকারী অ্যাকাউন্ট পাওয়া যায়নি।' });
    return;
  }

  const { name, nameBn, code, type, division, district, upazila, address, email, phone, description } = req.body;

  if (!name || !nameBn || !code || !division || !district || !address) {
    res.status(400).json({ success: false, message: 'প্রতিষ্ঠানের নাম, কোড, বিভাগ, জেলা এবং ঠিকানা আবশ্যক।' });
    return;
  }

  const result = dataStore.manualCreateInstitution({
    name,
    nameBn,
    code,
    type,
    division,
    district,
    upazila: upazila || '',
    address,
    email,
    phone,
    description
  }, creator);

  if (!result.success) {
    res.status(400).json(result);
    return;
  }

  await logAuditEvent({
    actorId: creator._id,
    actorRole: creator.role,
    action: 'INSTITUTION_MANUALLY_CREATED',
    targetType: 'Institution',
    targetId: result.institution?._id,
    details: { code, division, district }
  });

  res.json(result);
}
