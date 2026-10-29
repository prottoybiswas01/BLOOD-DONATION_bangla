import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { dataStore } from '../services/dataStore.js';
import { BANGLADESH_DIVISIONS } from '../data/bangladeshLocations.js';

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

  // Reports associated with requests in this division
  const divisionRequestIds = new Set(divisionRequests.map(r => r._id));
  const divisionReports = dataStore.reports.filter(
    rep => rep.targetType === 'blood_request' && divisionRequestIds.has(rep.targetId)
  );

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
      pendingReports: divisionReports.filter(r => r.status === 'pending').length
    },
    requests: divisionRequests,
    institutions: divisionInstitutions,
    reports: divisionReports
  });
}

