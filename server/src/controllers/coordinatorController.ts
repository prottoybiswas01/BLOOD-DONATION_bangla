import { Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth.js';
import { dataStore } from '../services/dataStore.js';
import { BANGLADESH_DIVISIONS } from '../data/bangladeshLocations.js';
import { logAuditEvent } from '../services/auditService.js';

const BD_PHONE_REGEX = /^(\+?88)?01[3-9]\d{8}$/;

function normalizePhone(raw: string): string {
  const cleaned = raw.replace(/\D/g, '');
  if (cleaned.startsWith('8801')) {
    return cleaned.substring(2);
  }
  return cleaned;
}

export const AppointModeratorSchema = z.object({
  institutionId: z.string().min(1, 'প্রতিষ্ঠান নির্বাচন করুন'),
  name: z.string().min(2, 'মডারেটরের নাম আবশ্যক'),
  phone: z.string().regex(BD_PHONE_REGEX, 'সঠিক বাংলাদেশী মোবাইল নম্বর দিন'),
  email: z.string().email('সঠিক ইমেইল ঠিকানা দিন').optional().or(z.literal('')),
  gender: z.enum(['male', 'female', 'unspecified', 'other']).default('unspecified')
});

export async function getCoordinatorDashboard(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'অননুমোদিত।' });
    return;
  }

  // Super Admin can view any division passed via query, or default to dhaka
  const division = req.user.role === 'SUPER_ADMIN'
    ? ((req.query.division as string) || 'dhaka')
    : req.user.assignedDivision;

  if (!division) {
    res.status(403).json({
      success: false,
      message: 'আপনার কোনো দায়িত্বপ্রাপ্ত বিভাগ নির্ধারিত নেই।'
    });
    return;
  }

  const divisionInfo = BANGLADESH_DIVISIONS.find(d => d.id.toLowerCase() === division.toLowerCase());

  // Scope queries strictly to assigned division
  const divisionDonors = dataStore.donorProfiles.filter(
    d => d.division.toLowerCase() === division.toLowerCase()
  );

  const divisionRequests = dataStore.bloodRequests.filter(
    r => r.division.toLowerCase() === division.toLowerCase()
  );

  const divisionInstitutions = dataStore.institutions.filter(
    i => i.division.toLowerCase() === division.toLowerCase()
  );

  const divisionInstitutionIds = new Set(divisionInstitutions.map(i => i._id));

  // Moderators assigned to institutions in this division
  const divisionModerators = dataStore.users.filter(u => {
    if (u.role !== 'INSTITUTION_MODERATOR') return false;
    if (u.assignedInstitution && divisionInstitutionIds.has(u.assignedInstitution)) return true;
    if (u.division && u.division.toLowerCase() === division.toLowerCase()) return true;
    return false;
  }).map(m => {
    const inst = dataStore.findInstitutionById(m.assignedInstitution || '');
    return {
      _id: m._id,
      name: m.name,
      phone: m.phone,
      email: m.email,
      role: m.role,
      accountStatus: m.accountStatus,
      blockReason: m.blockReason,
      assignedInstitution: m.assignedInstitution,
      institutionName: inst?.nameBn || inst?.name || 'অনির্ধারিত',
      institutionCode: inst?.code || '',
      createdAt: m.createdAt
    };
  });

  // Reports associated with requests or institutions in this division
  const divisionReports = dataStore.getReports({ division });

  // Phone number change requests for users in this division
  const divisionPhoneRequests = dataStore.getPhoneChangeRequests({ division });

  res.json({
    success: true,
    division: {
      id: division,
      nameEn: divisionInfo?.nameEn || division,
      nameBn: divisionInfo?.nameBn || division
    },
    stats: {
      totalDonors: divisionDonors.length,
      availableDonors: divisionDonors.filter(d => d.availabilityStatus === 'available').length,
      totalRequests: divisionRequests.length,
      activeRequests: divisionRequests.filter(r => r.status === 'open' || r.status === 'partially_fulfilled').length,
      totalInstitutions: divisionInstitutions.length,
      totalModerators: divisionModerators.length,
      pendingReports: divisionReports.filter(r => r.status === 'pending').length,
      pendingPhoneRequests: divisionPhoneRequests.filter(r => r.status === 'pending').length
    },
    requests: divisionRequests,
    institutions: divisionInstitutions,
    moderators: divisionModerators,
    reports: divisionReports,
    phoneChangeRequests: divisionPhoneRequests
  });
}

/**
 * Coordinator appoints a moderator for an institution in their assigned division
 */
export async function appointModerator(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'অননুমোদিত।' });
    return;
  }

  const { institutionId, name, phone: rawPhone, email, gender } = req.body;
  const phone = normalizePhone(rawPhone);

  const result = dataStore.appointModeratorByCoordinator({
    coordinatorUser: req.user,
    institutionId,
    name,
    phone,
    email: email || undefined,
    gender
  });

  if (!result.success) {
    res.status(400).json({ success: false, message: result.message });
    return;
  }

  await logAuditEvent({
    actorId: req.user.userId,
    actorRole: req.user.role,
    action: 'COORDINATOR_APPOINT_MODERATOR',
    targetType: 'User',
    targetId: result.moderator?._id || institutionId,
    details: { institutionId, phone, name }
  });

  res.status(201).json({
    success: true,
    message: result.message,
    moderator: result.moderator,
    temporaryPassword: result.temporaryPassword
  });
}

/**
 * Drill-down: View all registered members and donors of an institution
 */
export async function getInstitutionMembers(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'অননুমোদিত।' });
    return;
  }

  const { id } = req.params;
  const institution = dataStore.findInstitutionById(id);
  if (!institution) {
    res.status(404).json({ success: false, message: 'প্রতিষ্ঠানটি পাওয়া যায়নি।' });
    return;
  }

  // Scoping: Coordinator can only drill down into institutions in their division
  if (req.user.role === 'DIVISION_COORDINATOR') {
    if (institution.division.toLowerCase() !== req.user.assignedDivision?.toLowerCase()) {
      res.status(403).json({
        success: false,
        message: 'অনধিকার চর্চা: আপনি কেবল আপনার নির্ধারিত বিভাগের প্রতিষ্ঠানের সদস্য দেখতে পারবেন।'
      });
      return;
    }
  }

  const members = dataStore.getInstitutionMembers(id);
  const moderators = dataStore.users.filter(
    u => u.role === 'INSTITUTION_MODERATOR' && u.assignedInstitution === id
  ).map(m => ({
    _id: m._id,
    name: m.name,
    phone: m.phone,
    email: m.email,
    accountStatus: m.accountStatus,
    createdAt: m.createdAt
  }));

  res.json({
    success: true,
    institution: {
      _id: institution._id,
      name: institution.name,
      nameBn: institution.nameBn,
      code: institution.code,
      division: institution.division,
      district: institution.district,
      totalRegisteredDonors: institution.totalRegisteredDonors
    },
    moderators,
    members,
    totalMembers: members.length
  });
}
