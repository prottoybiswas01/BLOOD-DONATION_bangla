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
    fileSizeMb: 24.8,
    releaseDate: '2026-11-02',
    sha256Checksum: 'a7c936df35b4ce70a6c221191a92eef851a7e2b694697bfb557c6b907153641b',
    downloadUrl: 'https://github.com/prottoybiswas01/BLOOD-DONATION_bangla/releases/download/v1.0.0/blood-donation-bangla-v1.0.0.apk',
    directDownloadPath: '/downloads/blood-donation-bangla.apk',
    releaseNotes: 'অফিসিয়াল রিলিজ ১.০.০: সরাসরি রক্তদাতা সন্ধান, জরুরি নোটিফিকেশন, ক্যাম্পাস ড্যাশবোর্ড ও অফলাইন জেলা সেন্ট্রয়েড জিওকোডিং।'
  });
});

export default router;

