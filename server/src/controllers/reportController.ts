import { Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth.js';
import { dataStore } from '../services/dataStore.js';
import { logAuditEvent } from '../services/auditService.js';

export const CreateReportSchema = z.object({
  targetType: z.enum(['donor_profile', 'blood_request', 'institution', 'user']),
  targetId: z.string().min(1),
  reason: z.enum([
    'false_information',
    'fake_request',
    'harassment',
    'commercial_solicitation',
    'impersonation',
    'spam',
    'other'
  ]),
  description: z.string().min(10, 'অভিযোগের বিবরণ কমপক্ষে ১০ অক্ষরের হতে হবে')
});

export const ResolveReportSchema = z.object({
  status: z.enum(['resolved', 'dismissed']),
  resolutionNotes: z.string().min(3, 'মীমাংসার বিবরণ উল্লেখ করুন')
});

export async function createReport(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'অভিযোগ দায়ের করতে লগইন করা আবশ্যক।' });
    return;
  }

  const data = req.body;
  const report = dataStore.createReport({
    ...data,
    reportedBy: req.user.userId
  });

  await logAuditEvent({
    actorId: req.user.userId,
    actorRole: req.user.role,
    action: 'SUBMIT_REPORT',
    targetType: data.targetType,
    targetId: data.targetId,
    details: { reason: data.reason, reportId: report._id }
  });

  res.status(201).json({
    success: true,
    message: 'আপনার অভিযোগটি সফলভাবে জমা হয়েছে। আমাদের মডারেশন টিম এটি খতিয়ে দেখবে।',
    report
  });
}

export async function getReports(req: AuthRequest, res: Response): Promise<void> {
  const { status, targetType, division } = req.query;

  let scopedDivision: string | undefined = division as string;
  let scopedInstitutionId: string | undefined = undefined;

  if (req.user?.role === 'INSTITUTION_MODERATOR') {
    scopedInstitutionId = req.user.assignedInstitution;
  } else if (req.user?.role === 'DIVISION_COORDINATOR') {
    scopedDivision = req.user.assignedDivision;
  }

  const reports = dataStore.getReports({
    status: status as string,
    targetType: targetType as string,
    division: scopedDivision,
    institutionId: scopedInstitutionId
  });

  const enriched = reports.map(r => {
    const reporter = dataStore.findUserByIdSync(r.reportedBy);
    return {
      ...r,
      reporterName: reporter?.name || 'ব্যবহারকারী'
    };
  });

  res.json({
    success: true,
    reports: enriched
  });
}

export async function resolveReport(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'অননুমোদিত।' });
    return;
  }

  const { id } = req.params;
  const { status, resolutionNotes } = req.body;

  const report = dataStore.reports.find(r => r._id === id);
  if (!report) {
    res.status(404).json({ success: false, message: 'অভিযোগ রেকর্ডটি পাওয়া যায়নি।' });
    return;
  }

  report.status = status;
  report.reviewedBy = req.user.userId;
  report.resolutionNotes = resolutionNotes;
  report.updatedAt = new Date();

  await dataStore.persistReport(report);

  await logAuditEvent({
    actorId: req.user.userId,
    actorRole: req.user.role,
    action: 'RESOLVE_REPORT',
    targetType: 'Report',
    targetId: id,
    details: { status, resolutionNotes }
  });

  res.json({
    success: true,
    message: 'অভিযোগটি সফলভাবে সমাধান করা হয়েছে।',
    report
  });
}

