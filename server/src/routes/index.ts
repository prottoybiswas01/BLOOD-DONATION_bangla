import { Router } from 'express';
import { 
  dataStore, 
  setOnStatsChangedListener,
  CONFIRMED_DEMO_DONOR_IDS, 
  CONFIRMED_DEMO_USER_IDS, 
  CONFIRMED_DEMO_REQUEST_IDS, 
  CONFIRMED_DEMO_PUBLIC_IDS 
} from '../services/dataStore.js';
import { isDatabaseConnected } from '../config/db.js';
import { DonorProfileModel } from '../models/DonorProfile.js';
import { BloodRequestModel } from '../models/BloodRequest.js';
import { InstitutionModel } from '../models/Institution.js';
import authRoutes from './authRoutes.js';
import donorRoutes from './donorRoutes.js';
import requestRoutes from './requestRoutes.js';
import institutionRoutes from './institutionRoutes.js';
import coordinatorRoutes from './coordinatorRoutes.js';
import adminRoutes from './adminRoutes.js';
import reportRoutes from './reportRoutes.js';
import locationRoutes from './locationRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import institutionRequestRoutes from './institutionRequestRoutes.js';
import memberRoutes from './memberRoutes.js';
import moderatorRoutes from './moderatorRoutes.js';
import contactRequestRoutes from './contactRequestRoutes.js';
import phoneChangeRoutes from './phoneChangeRoutes.js';
import institutionChangeRoutes from './institutionChangeRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/donors', donorRoutes);
router.use('/requests', requestRoutes);
router.use('/institutions', institutionRoutes);
router.use('/coordinators', coordinatorRoutes);
router.use('/coordinator', coordinatorRoutes);
router.use('/admin', adminRoutes);
router.use('/reports', reportRoutes);
router.use('/locations', locationRoutes);
router.use('/notifications', notificationRoutes);
router.use('/institution-requests', institutionRequestRoutes);
router.use(['/institution-change', '/institution-changes'], institutionChangeRoutes);
router.use('/members', memberRoutes);
router.use('/moderators', moderatorRoutes);
router.use('/contact-requests', contactRequestRoutes);
router.use('/phone-change', phoneChangeRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    database: isDatabaseConnected() ? 'connected' : 'disconnected',
    platform: 'Bangladesh Blood Donation Platform API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// In-memory 30-second cache for public homepage statistics
let statsCache: { stats: any; expiresAt: number } | null = null;

export function invalidatePublicStatsCache(): void {
  statsCache = null;
}
setOnStatsChangedListener(invalidatePublicStatsCache);

// Live Public Statistics Endpoint (Verified backend data for Web & Mobile)
router.get(['/stats', '/statistics', '/public/stats'], async (req, res) => {
  // Check 30-second shared public cache
  if (statsCache && Date.now() < statsCache.expiresAt) {
    res.set('Cache-Control', 'public, max-age=30, s-maxage=30, stale-while-revalidate=60');
    return res.json({
      success: true,
      stats: statsCache.stats,
      cached: true,
      timestamp: new Date().toISOString()
    });
  }

  try {
    let totalDonors = 0;
    let availableDonors = 0;
    let activeRequests = 0;
    let districtsCovered = 0;
    let totalInstitutions = 0;

    if (isDatabaseConnected()) {
      if (dataStore.suppressDemoData) {
        const [tDonors, aDonors, aRequests, districtList, tInsts] = await Promise.all([
          DonorProfileModel.countDocuments({
            isPubliclyListed: true,
            _id: { $nin: Array.from(CONFIRMED_DEMO_DONOR_IDS) },
            userId: { $nin: Array.from(CONFIRMED_DEMO_USER_IDS) }
          }),
          DonorProfileModel.countDocuments({
            isPubliclyListed: true,
            availabilityStatus: 'available',
            _id: { $nin: Array.from(CONFIRMED_DEMO_DONOR_IDS) },
            userId: { $nin: Array.from(CONFIRMED_DEMO_USER_IDS) }
          }),
          BloodRequestModel.countDocuments({
            status: { $in: ['open', 'partially_fulfilled'] },
            _id: { $nin: Array.from(CONFIRMED_DEMO_REQUEST_IDS) },
            publicId: { $nin: Array.from(CONFIRMED_DEMO_PUBLIC_IDS) }
          }),
          DonorProfileModel.distinct('district', {
            isPubliclyListed: true,
            _id: { $nin: Array.from(CONFIRMED_DEMO_DONOR_IDS) },
            userId: { $nin: Array.from(CONFIRMED_DEMO_USER_IDS) }
          }),
          InstitutionModel.countDocuments()
        ]);
        totalDonors = tDonors;
        availableDonors = aDonors;
        activeRequests = aRequests;
        districtsCovered = districtList.filter(Boolean).length;
        totalInstitutions = tInsts;
      } else {
        const [tDonors, aDonors, aRequests, districtList, tInsts] = await Promise.all([
          DonorProfileModel.countDocuments({ isPubliclyListed: true }),
          DonorProfileModel.countDocuments({
            isPubliclyListed: true,
            availabilityStatus: 'available'
          }),
          BloodRequestModel.countDocuments({
            status: { $in: ['open', 'partially_fulfilled'] }
          }),
          DonorProfileModel.distinct('district', { isPubliclyListed: true }),
          InstitutionModel.countDocuments()
        ]);
        totalDonors = tDonors;
        availableDonors = aDonors;
        activeRequests = aRequests;
        districtsCovered = districtList.filter(Boolean).length;
        totalInstitutions = tInsts;
      }
    } else if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
      res.set('Cache-Control', 'no-store, private');
      return res.status(503).json({
        success: false,
        code: 'DATABASE_UNAVAILABLE',
        message: 'ডাটাবেজ সার্ভারের সাথে সংযোগ স্থাপন করা যায়নি। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।'
      });
    } else {
      const activeDonors = dataStore.donorProfiles.filter(d => {
        const u = dataStore.findUserByIdSync(d.userId);
        return Boolean(d.isPubliclyListed && u && u.accountStatus === 'active' && u.isActive !== false);
      });

      totalDonors = activeDonors.length;
      availableDonors = activeDonors.filter(d => d.availabilityStatus === 'available').length;
      activeRequests = dataStore.bloodRequests.filter(r => r.status === 'open' || r.status === 'partially_fulfilled').length;
      const uniqueDistricts = new Set(activeDonors.map(d => d.district?.toLowerCase().trim()).filter(Boolean));
      districtsCovered = uniqueDistricts.size;
      totalInstitutions = dataStore.institutions.length;
    }

    const statsPayload = {
      totalDonors,
      availableDonors,
      activeRequests,
      districtsCovered: districtsCovered > 0 ? districtsCovered : (totalDonors > 0 ? 1 : 0),
      totalInstitutions
    };

    // Cache valid payload for 30 seconds
    statsCache = {
      stats: statsPayload,
      expiresAt: Date.now() + 30000
    };

    res.set('Cache-Control', 'public, max-age=30, s-maxage=30, stale-while-revalidate=60');
    res.json({
      success: true,
      stats: statsPayload,
      cached: false,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    res.set('Cache-Control', 'no-store, private');
    res.status(500).json({
      success: false,
      message: 'পরিসংখ্যান লোড করতে ব্যর্থ হয়েছে।'
    });
  }
});

// Dynamic App Release state - Defaults to verified published release (Build 1)
export const currentAppRelease = {
  platform: 'android',
  packageName: 'org.bloodbd.app',
  latestVersion: process.env.LATEST_APP_VERSION || '1.0.0',
  versionCode: parseInt(process.env.LATEST_APP_VERSION_CODE || '1', 10),
  minSupportedVersion: process.env.MIN_SUPPORTED_APP_VERSION || '1.0.0',
  forceUpdate: process.env.APP_FORCE_UPDATE === 'true',
  fileSizeMb: 60.0,
  fileSizeBytes: 62911392,
  releaseDate: '2026-11-02',
  sha256Checksum: '3f4066c1ed0e29fa244c04bf597eb91bf3b653e785e73ff2b590d2aa23910ca2',
  certificateSha256: '2A:52:02:9C:E4:F3:11:D2:11:F7:EB:E8:2A:0D:C5:D2:5B:38:CC:B3:EB:7B:B7:01:DD:72:55:74:26:86:99:FA',
  downloadUrl: process.env.APP_DOWNLOAD_URL || 'https://github.com/prottoybiswas01/BLOOD-DONATION_bangla/releases/download/v1.0.0/blood-donation-bangla.apk',
  directDownloadPath: '/downloads/blood-donation-bangla.apk',
  releaseNotes: process.env.APP_RELEASE_NOTES || 'অফিসিয়াল স্ট্যান্ডঅ্যালোন রিলিজ ১.০.০ (Build 1): সম্পূর্ণ অফলাইন ও প্রোডাকশন রেডি।'
};

// Native Android App update & distribution info
router.get(['/app/version', '/app/latest'], (req, res) => {
  res.json({
    success: true,
    ...currentAppRelease
  });
});

export default router;
