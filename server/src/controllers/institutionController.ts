import { Request, Response } from 'express';
import { z } from 'zod';
import { dataStore } from '../services/dataStore.js';
import { AuthRequest } from '../middleware/auth.js';
import { logAuditEvent } from '../services/auditService.js';

export const CreateInstitutionSchema = z.object({
  name: z.string().min(3, 'প্রতিষ্ঠানের নাম আবশ্যক'),
  nameBn: z.string().min(3, 'বাংলায় নাম আবশ্যক'),
  code: z.string().min(2).max(15),
  type: z.enum(['university', 'college', 'school', 'medical_college', 'polytechnic', 'other']),
  division: z.string().min(1),
  district: z.string().min(1),
  upazila: z.string().min(1),
  address: z.string().min(5),
  website: z.string().url().optional().or(z.literal('')),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  description: z.string().optional()
});

export async function getInstitutions(req: Request, res: Response): Promise<void> {
  const { division, search, status } = req.query;

  // By default, public directory only shows approved institutions
  const targetStatus = (status as string) || 'approved';

  const institutions = dataStore.getInstitutions({
    division: division as string,
    search: search as string,
    status: targetStatus
  });

  // Never expose raw member rosters in directory
  const safeInstitutions = institutions.map(i => ({
    _id: i._id,
    name: i.name,
    nameBn: i.nameBn,
    code: i.code,
    type: i.type,
    division: i.division,
    district: i.district,
    upazila: i.upazila,
    address: i.address,
    website: i.website,
    email: i.email,
    phone: i.phone,
    totalRegisteredDonors: i.totalRegisteredDonors,
    description: i.description,
    status: i.status
  }));

  res.json({
    success: true,
    institutions: safeInstitutions
  });
}

export async function getInstitutionById(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const institution = dataStore.findInstitutionById(id);

  if (!institution) {
    res.status(404).json({ success: false, message: 'প্রতিষ্ঠানটি খুঁজে পাওয়া যায়নি।' });
    return;
  }

  res.json({
    success: true,
    institution
  });
}

export async function createInstitution(req: AuthRequest, res: Response): Promise<void> {
  const data = req.body;
  const existing = dataStore.institutions.find(i => i.code.toUpperCase() === data.code.toUpperCase());
  if (existing) {
    res.status(409).json({
      success: false,
      message: 'এই কোডের একটি প্রতিষ্ঠান ইতিমধ্যে বিদ্যমান।'
    });
    return;
  }

  // If created by SUPER_ADMIN, approve immediately, otherwise mark pending
  const initialStatus = req.user?.role === 'SUPER_ADMIN' ? 'approved' : 'pending';

  const newInst = dataStore.createInstitution({
    ...data,
    code: data.code.toUpperCase(),
    status: initialStatus
  });

  if (req.user) {
    await logAuditEvent({
      actorId: req.user.userId,
      actorRole: req.user.role,
      action: 'CREATE_INSTITUTION',
      targetType: 'Institution',
      targetId: newInst._id,
      divisionScope: newInst.division,
      details: { name: newInst.name, status: newInst.status }
    });
  }

  res.status(201).json({
    success: true,
    message: initialStatus === 'approved' 
      ? 'প্রতিষ্ঠান সফলভাবে যুক্ত করা হয়েছে।' 
      : 'প্রতিষ্ঠান যুক্ত করার আবেদন গ্রহণ করা হয়েছে। পর্যালোচনার পর অনুমোদিত হবে।',
    institution: newInst
  });
}

/**
 * Institution Moderator Dashboard:
 * Restricted to assigned institution only
 */
export async function getModeratorDashboard(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'অননুমোদিত।' });
    return;
  }

  const instId = req.user.role === 'SUPER_ADMIN' 
    ? (req.query.institutionId as string) || dataStore.institutions[0]?._id
    : req.user.assignedInstitution;

  if (!instId) {
    res.status(403).json({
      success: false,
      message: 'আপনার কোনো প্রতিষ্ঠান নির্ধারণ করা নেই।'
    });
    return;
  }

  const institution = dataStore.findInstitutionById(instId);
  if (!institution) {
    res.status(404).json({ success: false, message: 'নির্ধারিত প্রতিষ্ঠান পাওয়া যায়নি।' });
    return;
  }

  // Get affiliated donors (privacy-safe public fields)
  const affiliatedDonors = dataStore.donorProfiles
    .filter(d => d.institutionId === instId)
    .map(d => ({
      _id: d._id,
      displayName: d.displayName,
      bloodGroup: d.bloodGroup,
      availabilityStatus: d.availabilityStatus,
      lastDonationDate: d.lastDonationDate,
      totalDonations: d.totalDonations,
      membershipVerified: d.institutionMembershipVerified
    }));

  // Get institution blood requests
  const affiliatedRequests = dataStore.bloodRequests.filter(r => r.institutionId === instId);

  res.json({
    success: true,
    institution,
    stats: {
      totalDonors: affiliatedDonors.length,
      availableDonors: affiliatedDonors.filter(d => d.availabilityStatus === 'available').length,
      totalRequests: affiliatedRequests.length,
      activeRequests: affiliatedRequests.filter(r => r.status === 'open' || r.status === 'partially_fulfilled').length
    },
    donors: affiliatedDonors,
    requests: affiliatedRequests
  });
}

