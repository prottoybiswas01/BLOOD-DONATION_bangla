import { Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth.js';
import { dataStore } from '../services/dataStore.js';
import { inMemoryAuditLogs, logAuditEvent } from '../services/auditService.js';

export const UpdateRoleSchema = z.object({
  role: z.enum(['SUPER_ADMIN', 'DIVISION_COORDINATOR', 'INSTITUTION_MODERATOR', 'DONOR', 'REQUESTER']),
  assignedDivision: z.string().optional(),
  assignedInstitution: z.string().optional()
});

export async function getAdminOverview(req: AuthRequest, res: Response): Promise<void> {
  const usersCount = dataStore.users.length;
  const donorsCount = dataStore.donorProfiles.length;
  const requestsCount = dataStore.bloodRequests.length;
  const institutionsCount = dataStore.institutions.length;
  const pendingInstitutions = dataStore.institutions.filter(i => i.status === 'pending').length;
  const pendingReports = dataStore.reports.filter(r => r.status === 'pending').length;
  const totalContactReveals = dataStore.contactAccessLogs.length;

  res.json({
    success: true,
    stats: {
      usersCount,
      donorsCount,
      requestsCount,
      institutionsCount,
      pendingInstitutions,
      pendingReports,
      totalContactReveals
    }
  });
}

export async function getUsers(req: AuthRequest, res: Response): Promise<void> {
  const { role, search } = req.query;
  let list = [...dataStore.users];

  if (role) {
    list = list.filter(u => u.role === role);
  }
  if (search) {
    const q = (search as string).toLowerCase();
    list = list.filter(u => u.name.toLowerCase().includes(q) || u.phone.includes(q));
  }

  const safeUsers = list.map(u => ({
    _id: u._id,
    name: u.name,
    phone: u.phone,
    email: u.email,
    role: u.role,
    assignedDivision: u.assignedDivision,
    assignedInstitution: u.assignedInstitution,
    isActive: u.isActive,
    createdAt: u.createdAt,
    lastLoginAt: u.lastLoginAt
  }));

  res.json({
    success: true,
    users: safeUsers
  });
}

export async function updateUserRole(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'অননুমোদিত।' });
    return;
  }

  const { id } = req.params;
  const { role, assignedDivision, assignedInstitution } = req.body;

  const user = dataStore.findUserById(id);
  if (!user) {
    res.status(404).json({ success: false, message: 'ব্যবহারকারী খুঁজে পাওয়া যায়নি।' });
    return;
  }

  // Safety rule: Never remove or demote the last active SUPER_ADMIN
  if (user.role === 'SUPER_ADMIN' && role !== 'SUPER_ADMIN') {
    const superAdminCount = dataStore.users.filter(u => u.role === 'SUPER_ADMIN' && u.isActive).length;
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
    assignedInstitution: role === 'INSTITUTION_MODERATOR' ? assignedInstitution : undefined
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

export async function toggleUserStatus(req: AuthRequest, res: Response): Promise<void> {
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

  // Prevent suspending the last super admin
  if (user.role === 'SUPER_ADMIN' && user.isActive) {
    const superAdminCount = dataStore.users.filter(u => u.role === 'SUPER_ADMIN' && u.isActive).length;
    if (superAdminCount <= 1) {
      res.status(400).json({
        success: false,
        message: 'সুরক্ষা সতর্কতা: শেষ সুপার অ্যাডমিন অ্যাকাউন্ট স্থগিত করা যাবে না।'
      });
      return;
    }
  }

  const newStatus = !user.isActive;
  dataStore.updateUser(id, { isActive: newStatus });

  await logAuditEvent({
    actorId: req.user.userId,
    actorRole: req.user.role,
    action: newStatus ? 'RESTORE_USER_ACCOUNT' : 'SUSPEND_USER_ACCOUNT',
    targetType: 'User',
    targetId: id,
    details: { isActive: newStatus }
  });

  res.json({
    success: true,
    message: newStatus ? 'অ্যাকাউন্ট পুনরায় চালু করা হয়েছে।' : 'অ্যাকাউন্ট স্থগিত করা হয়েছে।',
    isActive: newStatus
  });
}

export async function updateInstitutionStatus(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'অননুমোদিত।' });
    return;
  }

  const { id } = req.params;
  const { status } = req.body;

  const institution = dataStore.findInstitutionById(id);
  if (!institution) {
    res.status(404).json({ success: false, message: 'প্রতিষ্ঠান পাওয়া যায়নি।' });
    return;
  }

  const updated = dataStore.updateInstitution(id, { status });

  await logAuditEvent({
    actorId: req.user.userId,
    actorRole: req.user.role,
    action: 'UPDATE_INSTITUTION_STATUS',
    targetType: 'Institution',
    targetId: id,
    details: { oldStatus: institution.status, newStatus: status }
  });

  res.json({
    success: true,
    message: 'প্রতিষ্ঠানের স্ট্যাটাস সফলভাবে পরিবর্তিত হয়েছে।',
    institution: updated
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

