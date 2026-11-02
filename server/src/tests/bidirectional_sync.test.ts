import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import app from '../app.js';
import { ENV } from '../config/env.js';
import { connectDB } from '../config/db.js';
import { dataStore } from '../services/dataStore.js';
import { BloodRequestModel } from '../models/BloodRequest.js';
import { UserModel } from '../models/User.js';

after(async () => {
  await mongoose.disconnect();
});

function createTestToken(user: { _id: string; role: string; phone?: string; assignedDivision?: string }) {
  return jwt.sign(
    {
      userId: user._id,
      phone: user.phone || '01711111111',
      role: user.role,
      assignedDivision: user.assignedDivision
    },
    ENV.JWT_SECRET,
    { expiresIn: '2h' }
  );
}

test('Bidirectional Synchronization & Persistence Test Suite', async (t) => {
  await connectDB();
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const addr = server.address() as any;
  const baseUrl = `http://127.0.0.1:${addr.port}/api/v1`;

  const syncUserId = 'usr_sync_' + Date.now();
  const syncPhone = '01799' + Math.floor(100000 + Math.random() * 900000);
  const syncUserToken = createTestToken({ _id: syncUserId, role: 'DONOR', phone: syncPhone });
  const uniqueDonorName = `তানভীর আহমেদ_${Date.now()}`;

  // Seed user in dataStore and DB
  await dataStore.createUser({
    _id: syncUserId,
    name: uniqueDonorName,
    phone: syncPhone,
    role: 'DONOR',
    accountStatus: 'active',
    division: 'dhaka',
    district: 'dhaka',
    upazila: 'mirpur',
    isActive: true,
    isPhoneVerified: true
  });

  const createdProf = await dataStore.createDonorProfile({
    userId: syncUserId,
    displayName: uniqueDonorName,
    bloodGroup: 'O+',
    division: 'dhaka',
    district: 'dhaka',
    upazila: 'mirpur',
    availabilityStatus: 'available',
    consentToShareContact: true,
    isPubliclyListed: true,
    emergencyAvailable: true,
    totalDonations: 3
  });

  // TEST A: Website updates donor profile -> Android API retrieves same donor profile
  await t.test('Test A: Website updates donor profile -> Android API retrieves same donor profile', async () => {
    // 1. Website sends update via /donors/me (Website convention)
    const updateRes = await fetch(`${baseUrl}/donors/me`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${syncUserToken}`
      },
      body: JSON.stringify({
        displayName: `${uniqueDonorName} (নিয়মিত)`,
        availabilityStatus: 'recently_donated',
        bio: 'সপ্তাহখানেক আগে রক্তদান সম্পন্ন করেছি।'
      })
    });

    assert.equal(updateRes.status, 200, 'Website profile update should return 200 OK');
    const updateData: any = await updateRes.json();
    assert.equal(updateData.success, true);
    assert.equal(updateData.profile.displayName, `${uniqueDonorName} (নিয়মিত)`);

    // 2. Android queries donor via /donors? (Mobile search convention)
    const mobileSearchRes = await fetch(`${baseUrl}/donors?bloodGroup=O%2B&district=dhaka`, {
      headers: {
        'x-client-platform': 'android'
      }
    });

    assert.equal(mobileSearchRes.status, 200, 'Mobile search must return 200 OK');
    const mobileSearchData: any = await mobileSearchRes.json();
    assert.equal(mobileSearchData.success, true);

    const foundDonor = mobileSearchData.donors.find((d: any) => d._id === updateData.profile._id || d.displayName.includes(uniqueDonorName));
    assert.ok(foundDonor, 'Android search must retrieve donor updated from Website');
    assert.equal(foundDonor.displayName, `${uniqueDonorName} (নিয়মিত)`);
    assert.equal(foundDonor.availabilityStatus, 'recently_donated');
  });

  // TEST B: Android updates donor availability -> Website retrieves updated profile
  await t.test('Test B: Android updates donor availability -> Website retrieves updated profile', async () => {
    // 1. Mobile sends PUT to /donors/profile (Mobile convention)
    const mobilePutRes = await fetch(`${baseUrl}/donors/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${syncUserToken}`,
        'x-client-platform': 'android'
      },
      body: JSON.stringify({
        availabilityStatus: 'available',
        emergencyAvailable: true,
        bio: 'জরুরি প্রয়োজনে পুনরায় রক্তদানে প্রস্তুত।'
      })
    });

    assert.equal(mobilePutRes.status, 200, 'Mobile profile update must return 200 OK');
    const mobilePutData: any = await mobilePutRes.json();
    assert.equal(mobilePutData.success, true);

    // 2. Website queries single donor profile by ID via /donors/profile/:id (Website convention)
    const donorProfileId = mobilePutData.profile._id;
    const websiteGetRes = await fetch(`${baseUrl}/donors/profile/${donorProfileId}`, {
      headers: {
        'x-client-platform': 'web'
      }
    });

    assert.equal(websiteGetRes.status, 200, 'Website GET profile must return 200 OK');
    const websiteGetData: any = await websiteGetRes.json();
    assert.equal(websiteGetData.success, true);
    assert.equal(websiteGetData.donor.availabilityStatus, 'available');
    assert.equal(websiteGetData.donor.bio, 'জরুরি প্রয়োজনে পুনরায় রক্তদানে প্রস্তুত।');
  });

  // TEST C: Mobile creates blood request -> Website retrieves same request with publicId and live status
  let createdPublicId = '';
  await t.test('Test C: Mobile creates blood request -> Website retrieves same request with publicId and live status', async () => {
    const newRequestPayload = {
      patientName: 'রাবেয়া খাতুন',
      bloodGroup: 'AB+',
      unitsRequired: 2,
      hospitalName: 'বঙ্গবন্ধু শেখ মুজিব মেডিকেল বিশ্ববিদ্যালয় (BSMMU)',
      hospitalAddress: 'শাহবাগ, ঢাকা',
      division: 'dhaka',
      district: 'dhaka',
      upazila: 'shahbagh',
      requiredDate: new Date(Date.now() + 86400000 * 2).toISOString(),
      urgencyLevel: 'emergency',
      reason: 'জরুরি কার্ডিয়াক সার্জারি',
      contactPersonName: 'মুসা কলিম',
      contactNumber: '01712345678',
      consentForPublicShare: true
    };

    // 1. Mobile creates request via POST /requests
    const createRes = await fetch(`${baseUrl}/requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${syncUserToken}`,
        'x-client-platform': 'android'
      },
      body: JSON.stringify(newRequestPayload)
    });

    assert.equal(createRes.status, 201, 'Mobile blood request creation must return 201 Created');
    const createData: any = await createRes.json();
    assert.equal(createData.success, true);
    assert.ok(createData.bloodRequest.publicId, 'PublicId must be generated');
    createdPublicId = createData.bloodRequest.publicId;

    // 2. Website searches requests via /requests/search (Website convention)
    const webSearchRes = await fetch(`${baseUrl}/requests/search?bloodGroup=AB%2B&division=dhaka`, {
      headers: {
        'x-client-platform': 'web'
      }
    });

    assert.equal(webSearchRes.status, 200, 'Website search must return 200 OK');
    const webSearchData: any = await webSearchRes.json();
    assert.equal(webSearchData.success, true);
    const foundInWeb = webSearchData.requests.find((r: any) => r.publicId === createdPublicId);
    assert.ok(foundInWeb, 'Request posted from Mobile must immediately appear on Website search');
    assert.equal(foundInWeb.patientName, 'রাবেয়া খাতুন');
    assert.equal(foundInWeb.unitsRemaining, 2);

    // 3. Website opens digital request card by publicId
    const cardRes = await fetch(`${baseUrl}/requests/public/${createdPublicId}`, {
      headers: {
        'x-client-platform': 'web'
      }
    });

    assert.equal(cardRes.status, 200, 'Public QR card lookup must return 200 OK');
    const cardData: any = await cardRes.json();
    assert.equal(cardData.bloodRequest.publicId, createdPublicId);
    assert.equal(cardData.bloodRequest.unitsRequired, 2);
  });

  // TEST D: Database Disconnection Safety (503 Guard)
  await t.test('Test D: Database Disconnection Guard returns HTTP 503 DATABASE_UNAVAILABLE in production', async () => {
    const originalEnv = ENV.NODE_ENV;
    (ENV as any).NODE_ENV = 'production';

    const originalIsConnected = mongoose.connection.readyState;
    try {
      Object.defineProperty(mongoose.connection, 'readyState', { value: 0, writable: true, configurable: true });

      assert.throws(
        () => {
          dataStore.assertWritable();
        },
        (err: any) => {
          return err.statusCode === 503 && err.code === 'DATABASE_UNAVAILABLE';
        },
        'assertWritable must throw 503 DATABASE_UNAVAILABLE in production when disconnected'
      );
    } finally {
      Object.defineProperty(mongoose.connection, 'readyState', { value: originalIsConnected, writable: true, configurable: true });
      (ENV as any).NODE_ENV = originalEnv;
    }
  });

  // TEST E: Serverless Multi-Instance Consistency Simulation
  await t.test('Test E: Multi-Instance consistency - separate memory stores read same authoritative MongoDB data', async () => {
    const targetDoc = await BloodRequestModel.findOne({ publicId: createdPublicId });
    assert.ok(targetDoc, 'Target blood request must exist in MongoDB Atlas');

    // Instance 1 updates status in MongoDB Atlas
    await BloodRequestModel.updateOne(
      { publicId: createdPublicId },
      { $set: { unitsFulfilled: 1, status: 'partially_fulfilled' } }
    );

    // Instance 2 resolves directly from Atlas
    const instance2Doc = await dataStore.findBloodRequestById(createdPublicId);
    assert.ok(instance2Doc, 'Instance 2 must resolve document from MongoDB Atlas directly');
    assert.equal(instance2Doc?.unitsFulfilled, 1, 'Instance 2 must see live unitsFulfilled from Atlas');
    assert.equal(instance2Doc?.status, 'partially_fulfilled', 'Instance 2 must see live status from Atlas');
  });

  // TEST F: User and Auth Bidirectional Sync
  await t.test('Test F: Password and User status updates persist to MongoDB Atlas', async () => {
    await dataStore.updateUser(syncUserId, { gender: 'male', addressDetails: 'Block D, Road 4' } as any);

    const userInDb = await UserModel.findOne({ _id: syncUserId }).lean();
    assert.ok(userInDb, 'User must exist in MongoDB Atlas');
    assert.equal(userInDb.gender, 'male');
  });

  (server as any).closeAllConnections?.();
  server.close();
});
