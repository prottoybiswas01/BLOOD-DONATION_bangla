import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'node:path';
import app from '../app.js';
import { UserModel } from '../models/User.js';
import { DonorProfileModel } from '../models/DonorProfile.js';
import { BloodRequestModel } from '../models/BloodRequest.js';
import { InstitutionModel } from '../models/Institution.js';
import { dataStore } from '../services/dataStore.js';

dotenv.config({ path: path.resolve(process.cwd(), 'server/.env') });

const BASE_MONGO_URI = process.env.MONGO_URI || '';
const TEST_DB_URI = BASE_MONGO_URI.replace(/\/([^/?]+)(\?|$)/, '/test_launch_suppression_preview$2');

test('Website Launch Preview: Confirmed Demo Suppression vs Real/New Data Access', async (t) => {
  // 1. Connect to isolated test database
  await mongoose.disconnect();
  await mongoose.connect(TEST_DB_URI);
  const db = mongoose.connection.db;
  if (!db) throw new Error('Database connection failed');

  // Clean initial state
  await db.collection('users').deleteMany({});
  await db.collection('donorprofiles').deleteMany({});
  await db.collection('bloodrequests').deleteMany({});
  await db.collection('institutions').deleteMany({});

  // Seed mixed dataset: Confirmed Demo + Organic Preserved
  const now = new Date();

  // A. Confirmed Demo User & Donor Profile
  await db.collection('users').insertOne({
    _id: 'usr_sync_v2_1794563476694',
    name: 'মোস্তাফিজুর রহমান (টেস্ট ডেমো)',
    phone: '01788432802',
    passwordHash: '$2a$10$validPasswordHashForSyncTest1234567890',
    role: 'DONOR',
    accountStatus: 'active',
    gender: 'unspecified',
    isActive: true,
    isPhoneVerified: true,
    createdAt: now,
    updatedAt: now
  });

  await db.collection('donorprofiles').insertOne({
    _id: 'donor_prof_1794563476796kd5ko',
    userId: 'usr_sync_v2_1794563476694',
    displayName: 'মোস্তাফিজুর রহমান',
    bloodGroup: 'B+',
    division: 'dhaka',
    district: 'dhaka',
    upazila: 'dhanmondi',
    availabilityStatus: 'available',
    totalDonations: 4,
    institutionMembershipVerified: false,
    consentToShareContact: true,
    isPubliclyListed: true,
    emergencyAvailable: true,
    createdAt: now,
    updatedAt: now
  });

  // B. Confirmed Demo Blood Request
  await db.collection('bloodrequests').insertOne({
    _id: 'req_179456347713833s9v',
    publicId: 'BR-RD02-7365',
    requesterId: 'usr_sync_v2_1794563476694',
    patientName: 'ফারহানা আক্তার_1794563476980',
    bloodGroup: 'B+',
    unitsRequired: 1,
    unitsFulfilled: 0,
    hospitalName: 'ইবনে সিনা মেডিকেল কলেজ হাসপাতাল',
    hospitalAddress: 'ইবনে সিনা মেডিকেল কলেজ হাসপাতাল, dhaka',
    division: 'dhaka',
    district: 'dhaka',
    upazila: 'dhaka',
    urgencyLevel: 'urgent',
    contactNumber: '01719876543',
    status: 'open',
    statusHistory: [{ status: 'open', unitsFulfilled: 0, changedAt: now }],
    expiresAt: new Date(Date.now() + 86400000 * 3),
    createdAt: now,
    updatedAt: now
  });

  // C. Organic Real User & Donor Profile (Preserved)
  await db.collection('users').insertOne({
    _id: 'usr_organic_donor_001',
    name: 'আরিফুল হক (প্রকৃত ব্যবহারকারী)',
    phone: '01811223344',
    passwordHash: '$2a$10$realOrganicUserPasswordHash1234567890',
    role: 'DONOR',
    accountStatus: 'active',
    gender: 'male',
    isActive: true,
    isPhoneVerified: true,
    createdAt: now,
    updatedAt: now
  });

  await db.collection('donorprofiles').insertOne({
    _id: 'donor_prof_organic_001',
    userId: 'usr_organic_donor_001',
    displayName: 'আরিফুল হক',
    bloodGroup: 'O+',
    division: 'dhaka',
    district: 'dhaka',
    upazila: 'mirpur',
    availabilityStatus: 'available',
    totalDonations: 3,
    institutionMembershipVerified: false,
    consentToShareContact: false,
    isPubliclyListed: true,
    emergencyAvailable: true,
    createdAt: now,
    updatedAt: now
  });

  // Enable launch suppression mode on dataStore
  dataStore.suppressDemoData = true;
  await dataStore.syncWithMongoDB();

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address() as any;
  const baseUrl = `http://127.0.0.1:${address.port}`;

  try {
    // -------------------------------------------------------------
    // Test 1: Public listings suppress confirmed demo data
    // -------------------------------------------------------------
    await t.test('1. Public Listings: Confirmed demo donor & request are suppressed; organic donor is listed', async () => {
      // Donors list
      const donorRes = await fetch(`${baseUrl}/api/v1/donors`);
      assert.equal(donorRes.status, 200);
      const donorData = await donorRes.json() as any;
      assert.equal(donorData.success, true);

      // Must NOT contain confirmed demo donor
      const hasDemoDonor = donorData.donors.some((d: any) => d._id === 'donor_prof_1794563476796kd5ko');
      assert.equal(hasDemoDonor, false, 'Confirmed demo donor must be suppressed from public feed');

      // MUST contain organic preserved donor
      const hasOrganicDonor = donorData.donors.some((d: any) => d._id === 'donor_prof_organic_001');
      assert.equal(hasOrganicDonor, true, 'Organic preserved donor must appear normally in public search');
      assert.equal(donorData.donors[0].displayName, 'আরিফুল হক');

      // Blood requests emergency feed
      const reqRes = await fetch(`${baseUrl}/api/v1/requests`);
      assert.equal(reqRes.status, 200);
      const reqData = await reqRes.json() as any;
      assert.equal(reqData.success, true);

      // Must NOT contain confirmed demo request
      const hasDemoReq = reqData.requests.some((r: any) => r.publicId === 'BR-RD02-7365');
      assert.equal(hasDemoReq, false, 'Confirmed demo request must be suppressed from public emergency feed');
    });

    // -------------------------------------------------------------
    // Test 2: Direct URL links to confirmed demo records return 404
    // -------------------------------------------------------------
    await t.test('2. Direct URLs: Direct links to confirmed demo records return 404 Not Found', async () => {
      // Direct request lookup by publicId
      const demoReqRes = await fetch(`${baseUrl}/api/v1/requests/BR-RD02-7365`);
      assert.equal(demoReqRes.status, 404, 'Direct URL to confirmed demo request must return 404');
      const demoReqJson = await demoReqRes.json() as any;
      assert.equal(demoReqJson.success, false);

      // Direct donor profile lookup by ID
      const demoDonorRes = await fetch(`${baseUrl}/api/v1/donors/donor_prof_1794563476796kd5ko`);
      assert.equal(demoDonorRes.status, 404, 'Direct URL to confirmed demo donor must return 404');

      // Direct lookup of organic donor profile MUST succeed (200)
      const organicDonorRes = await fetch(`${baseUrl}/api/v1/donors/donor_prof_organic_001`);
      assert.equal(organicDonorRes.status, 200, 'Direct URL to organic donor must return 200 OK');
      const organicJson = await organicDonorRes.json() as any;
      assert.equal(organicJson.success, true);
      assert.equal(organicJson.donor.displayName, 'আরিফুল হক');
    });

    // -------------------------------------------------------------
    // Test 3: New organic user registration & public discovery
    // -------------------------------------------------------------
    let newUserId = '';
    let newAuthToken = '';
    const newPhone = '01988776655';

    await t.test('3. New Organic User: Registration and login work seamlessly', async () => {
      const regRes = await fetch(`${baseUrl}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'কামরুল হাসান',
          phone: newPhone,
          password: 'Password@2026',
          gender: 'male',
          division: 'dhaka',
          district: 'dhaka',
          upazila: 'dhanmondi',
          bloodGroup: 'AB+',
          dateOfBirth: '1998-07-21',
          consentToShareContact: false,
          termsAccepted: true
        })
      });

      assert.equal(regRes.status, 201);
      const regData = await regRes.json() as any;
      assert.equal(regData.success, true);
      assert.ok(regData.user);
      newUserId = regData.user._id;

      // Login
      const loginRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: newPhone,
          password: 'Password@2026'
        })
      });

      assert.equal(loginRes.status, 200);
      const loginData = await loginRes.json() as any;
      assert.equal(loginData.success, true);
      assert.ok(loginData.token);
      newAuthToken = loginData.token;

      // Verify newly registered donor appears in public search
      const donorSearchRes = await fetch(`${baseUrl}/api/v1/donors?bloodGroup=AB%2B`);
      assert.equal(donorSearchRes.status, 200);
      const donorSearchData = await donorSearchRes.json() as any;
      assert.equal(donorSearchData.donors.length, 1);
      assert.equal(donorSearchData.donors[0].displayName, 'কামরুল হাসান');
    });

    // -------------------------------------------------------------
    // Test 4: New blood request creation, direct QR landing & feed visibility
    // -------------------------------------------------------------
    await t.test('4. New Blood Request: Creation, emergency feed and direct QR link operate normally', async () => {
      const createRes = await fetch(`${baseUrl}/api/v1/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${newAuthToken}`
        },
        body: JSON.stringify({
          patientName: 'নাসিমা খাতুন',
          bloodGroup: 'AB+',
          unitsRequired: 2,
          hospitalName: 'বঙ্গবন্ধু শেখ মুজিব মেডিকেল বিশ্ববিদ্যালয়',
          hospitalAddress: 'শাহবাগ, ঢাকা',
          division: 'dhaka',
          district: 'dhaka',
          upazila: 'shahbagh',
          requiredDate: new Date(Date.now() + 86400000).toISOString(),
          urgencyLevel: 'emergency',
          reason: 'জরুরি অস্ত্রোপচারের জন্য রক্ত আবশ্যক',
          contactNumber: newPhone
        })
      });

      assert.equal(createRes.status, 201);
      const createData = await createRes.json() as any;
      assert.equal(createData.success, true);
      const newPublicId = createData.bloodRequest.publicId;
      assert.ok(newPublicId);

      // Verify new request is accessible via direct QR link
      const directRes = await fetch(`${baseUrl}/api/v1/requests/${newPublicId}`);
      assert.equal(directRes.status, 200);
      const directData = await directRes.json() as any;
      assert.equal(directData.success, true);
      assert.equal(directData.bloodRequest.publicId, newPublicId);
      assert.equal(directData.bloodRequest.patientName, 'নাসিমা খাতুন');

      // Verify new request appears in active feed
      const feedRes = await fetch(`${baseUrl}/api/v1/requests?bloodGroup=AB%2B`);
      assert.equal(feedRes.status, 200);
      const feedData = await feedRes.json() as any;
      assert.equal(feedData.requests.length, 1);
      assert.equal(feedData.requests[0].publicId, newPublicId);
    });

  } finally {
    server.close();
    dataStore.suppressDemoData = false;
    if (db) {
      await db.dropDatabase();
    }
    await mongoose.disconnect();
  }
});

