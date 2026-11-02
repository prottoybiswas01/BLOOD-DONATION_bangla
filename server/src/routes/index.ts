import { Router } from 'express';
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
router.use('/institution-change', institutionChangeRoutes);
router.use('/members', memberRoutes);
router.use('/moderators', moderatorRoutes);
router.use('/contact-requests', contactRequestRoutes);
router.use('/phone-change', phoneChangeRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    platform: 'Bangladesh Blood Donation Platform API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Native Android App update & distribution info
router.get(['/app/version', '/app/latest'], (req, res) => {
  res.json({
    success: true,
    platform: 'android',
    packageName: 'org.bloodbd.app',
    latestVersion: '1.0.0',
    versionCode: 1,
    minSupportedVersion: '1.0.0',
    forceUpdate: false,
    fileSizeMb: 60.0,
    fileSizeBytes: 62911392,
    releaseDate: '2026-11-02',
    sha256Checksum: '3f4066c1ed0e29fa244c04bf597eb91bf3b653e785e73ff2b590d2aa23910ca2',
    certificateSha256: '2A:52:02:9C:E4:F3:11:D2:11:F7:EB:E8:2A:0D:C5:D2:5B:38:CC:B3:EB:7B:B7:01:DD:72:55:74:26:86:99:FA',
    downloadUrl: 'https://github.com/prottoybiswas01/BLOOD-DONATION_bangla/releases/download/v1.0.0/blood-donation-bangla.apk',
    directDownloadPath: '/downloads/blood-donation-bangla.apk',
    releaseNotes: 'অফিসিয়াল স্ট্যান্ডঅ্যালোন রিলিজ ১.০.০ (Build 1): সম্পূর্ণ অফলাইন ও প্রোডাকশন রেডি Hermes বাইটকোড, গুগল ম্যাপ নেভিগেশন ও সরাসরি রক্তদাতা যোগাযোগ।'
  });
});

export default router;

