import { Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth.js';
import { dataStore } from '../services/dataStore.js';
import { inMemoryAuditLogs, logAuditEvent } from '../services/auditService.js';

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
  const usersCount = dataStore.users.length;
  const donorsCount = dataStore.donorProfiles.length;
  const requestsCount = dataStore.bloodRequests.length;
  const institutionsCount = dataStore.institutions.length;
  const pendingInstitutions = dataStore.institutionRequests.filter(i => i.status === 'pending_review').length;
  const pendingReports = dataStore.reports.filter(r => r.status === 'pending').length;
  const totalContactReveals = dataStore.contactAccessLogs.length;
  const blockedUsersCount = dataStore.users.filter(u => u.accountStatus !== 'active' || !u.isActive).length;

  res.json({
    success: true,
    stats: {
      usersCount,
      donorsCount,
      requestsCount,
      institutionsCount,
      pendingInstitutions,
      pendingReports,
      totalContactReveals,
      blockedUsersCount
    }
  });
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
  const user = dataStore.findUserById(id);
  if (!user) {
    res.status(404).json({ success: false, message: 'ব্যবহারকারী পাওয়া যায়নি।' });
    return;
  }

  const donorProfile = dataStore.findDonorProfileByUserId(user._id);

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
  const user = dataStore.findUserById(id);
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
  const updated = dataStore.updateUser(id, data);

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

  // Strict restriction: Admin cannot promote anyone to SUPER_ADMIN or change to SUPER_ADMIN!
  if (role === 'SUPER_ADMIN' && req.user.role !== 'SUPER_ADMIN') {
    res.status(403).json({
      success: false,
      message: 'অনধিকার চর্চা: শুধুমাত্র সুপার অ্যাডমিন নতুন সুপার অ্যাডমিন পদবি প্রদান করতে পারেন।'
    });
    return;
  }

  const user = dataStore.findUserById(id);
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
  dataStore.updateUser(id, {
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

  const targetUser = dataStore.findUserById(id);
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
    const viewer = dataStore.findUserById(log.viewerId);
    const donor = dataStore.findUserById(log.donorUserId);
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
