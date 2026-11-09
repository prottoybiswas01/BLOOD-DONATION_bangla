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
import { dataStore } from '../services/dataStore.js';

dotenv.config({ path: path.resolve(process.cwd(), 'server/.env') });

const BASE_MONGO_URI = process.env.MONGO_URI || '';
// Isolated fresh preview database for website launch testing
const PREVIEW_DB_URI = BASE_MONGO_URI.replace(/\/([^/?]+)(\?|$)/, '/test_website_launch_preview_empty$2');

test('Website Launch Preview Verification: Empty State, Persistence & Privacy', async (t) => {
  // 1. Connect server to isolated clean preview database
  await mongoose.disconnect();
  await mongoose.connect(PREVIEW_DB_URI);
  const db = mongoose.connection.db;
  if (!db) throw new Error('Preview test database connection failed');

  // Ensure database starts 100% EMPTY of user data
  await db.collection('users').deleteMany({});
  await db.collection('donorprofiles').deleteMany({});
  await db.collection('bloodrequests').deleteMany({});

  // Sync dataStore from this empty database
  await dataStore.syncWithMongoDB();

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address() as any;
  const baseUrl = `http://127.0.0.1:${address.port}`;

  try {
    // -------------------------------------------------------------
    // Test 1: Empty state verification - ZERO demo data returned
    // -------------------------------------------------------------
    await t.test('1. Clean Empty Database: Zero demo data returned on public feeds', async () => {
      // Donors search
      const donorRes = await fetch(`${baseUrl}/api/v1/donors`);
      assert.equal(donorRes.status, 200);
      const donorData = await donorRes.json() as any;
      assert.equal(donorData.success, true);
      assert.equal(donorData.donors.length, 0, 'No demo donors must appear');
      assert.equal(donorData.total, 0);

      // Blood requests search
      const reqRes = await fetch(`${baseUrl}/api/v1/requests`);
      assert.equal(reqRes.status, 200);
      const reqData = await reqRes.json() as any;
      assert.equal(reqData.success, true);
      assert.equal(reqData.requests.length, 0, 'No demo blood requests must appear');
      assert.equal(reqData.total, 0);

      // Stats endpoint
      const statsRes = await fetch(`${baseUrl}/api/v1/stats`);
      assert.equal(statsRes.status, 200);
      const statsData = await statsRes.json() as any;
      assert.equal(statsData.stats.totalDonors, 0);
      assert.equal(statsData.stats.activeRequests, 0);
    });

    // -------------------------------------------------------------
    // Test 2: User registration & persistence in MongoDB
    // -------------------------------------------------------------
    let registeredUserId = '';
    const testPhone = '01899998877';
    await t.test('2. New Registration: Donor registers and persists to database', async () => {
      const regRes = await fetch(`${baseUrl}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'তাহমিদ হাসান',
          phone: testPhone,
          password: 'securePassword123',
          gender: 'male',
          division: 'dhaka',
          district: 'dhaka',
          upazila: 'mirpur',
          bloodGroup: 'B+',
          dateOfBirth: '1999-04-12',
          consentToShareContact: false, // Private phone by default
          termsAccepted: true
        })
      });

      assert.equal(regRes.status, 201);
      const regData = await regRes.json() as any;
      assert.equal(regData.success, true);
      assert.ok(regData.user);
      registeredUserId = regData.user._id;

      // Verify in MongoDB Atlas directly
      const savedUser = await UserModel.findById(registeredUserId).lean();
      assert.ok(savedUser, 'User must exist in MongoDB Atlas');
      assert.equal(savedUser?.name, 'তাহমিদ হাসান');
      assert.equal(savedUser?.phone, testPhone);

      const savedProfile = await DonorProfileModel.findOne({ userId: registeredUserId }).lean();
      assert.ok(savedProfile, 'Donor profile must exist in MongoDB Atlas');
      assert.equal(savedProfile?.bloodGroup, 'B+');
      assert.equal(savedProfile?.consentToShareContact, false);
    });

    // -------------------------------------------------------------
    // Test 3: Public phone privacy enforcement
    // -------------------------------------------------------------
    await t.test('3. Privacy Shield: Guest search strictly omits private phone number', async () => {
      const donorRes = await fetch(`${baseUrl}/api/v1/donors?bloodGroup=B%2B`);
      assert.equal(donorRes.status, 200);
      const donorData = await donorRes.json() as any;
      assert.equal(donorData.success, true);
      assert.equal(donorData.donors.length, 1);

      const publicDonor = donorData.donors[0];
      assert.equal(publicDonor.displayName, 'তাহমিদ হাসান');
      assert.equal(publicDonor.bloodGroup, 'B+');
      assert.equal(publicDonor.consentToShareContact, false);
      assert.equal(publicDonor.phone, undefined, 'Private phone number MUST NOT be leaked publicly');
    });

    // -------------------------------------------------------------
    // Test 4: Blood request creation & persistence across reload
    // -------------------------------------------------------------
    let createdPublicId = '';
    await t.test('4. Blood Request Creation: Posts with QR ID and persists across reload', async () => {
      // First login to get auth token
      const loginRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: testPhone,
          password: 'securePassword123'
        })
      });
      const loginData = await loginRes.json() as any;
      assert.equal(loginRes.status, 200);
      const token = loginData.token;

      // Create blood request
      const createReqRes = await fetch(`${baseUrl}/api/v1/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          patientName: 'আহমেদ কবির (৫৫)',
          bloodGroup: 'B+',
          unitsRequired: 2,
          hospitalName: 'ঢাকা মেডিকেল কলেজ হাসপাতাল',
          hospitalAddress: 'জরুরি বিভাগ, ঢাকা',
          division: 'dhaka',
          district: 'dhaka',
          upazila: 'shahbagh',
          requiredDate: new Date(Date.now() + 86400000 * 2).toISOString(),
          urgencyLevel: 'emergency',
          reason: 'সার্জারির জন্য জরুরি রক্ত প্রয়োজন',
          contactNumber: testPhone
        })
      });

      assert.equal(createReqRes.status, 201);
      const createData = await createReqRes.json() as any;
      assert.equal(createData.success, true);
      assert.ok(createData.data);
      assert.ok(createData.data.publicId, 'Must generate publicId for QR code and public landing');
      createdPublicId = createData.data.publicId;

      // Direct MongoDB check
      const savedDoc = await BloodRequestModel.findOne({ publicId: createdPublicId }).lean();
      assert.ok(savedDoc, 'Blood request must persist in MongoDB');
      assert.equal(savedDoc?.patientName, 'আহমেদ কবির (৫৫)');

      // Simulate full database reload (re-sync from MongoDB Atlas)
      await dataStore.syncWithMongoDB();

      // Query from public feed after reload
      const feedRes = await fetch(`${baseUrl}/api/v1/requests`);
      const feedData = await feedRes.json() as any;
      assert.equal(feedData.success, true);
      assert.equal(feedData.requests.length, 1);
      assert.equal(feedData.requests[0].publicId, createdPublicId);
      assert.equal(feedData.requests[0].hospitalName, 'ঢাকা মেডিকেল কলেজ হাসপাতাল');

      // Verify public QR landing route
      const landingRes = await fetch(`${baseUrl}/api/v1/requests/${createdPublicId}`);
      assert.equal(landingRes.status, 200);
      const landingData = await landingRes.json() as any;
      assert.equal(landingData.success, true);
      assert.equal(landingData.bloodRequest.publicId, createdPublicId);
      assert.equal(landingData.bloodRequest.patientName, 'আহমেদ কবির (৫৫)');
    });

  } finally {
    server.close();
    // Clean up preview database
    if (db) {
      await db.dropDatabase();
    }
    await mongoose.disconnect();
  }
});
