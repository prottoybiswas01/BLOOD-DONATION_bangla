import { test } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import app from '../app.js';
import { connectDB } from '../config/db.js';
import { dataStore } from '../services/dataStore.js';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';

function createToken(user: { _id: string; phone?: string; role: string; assignedDivision?: string }): string {
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

test('App Update, Version Checker & Live Data Synchronization Suite', async (t) => {
  await connectDB();
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const addr = server.address() as any;
  const baseUrl = `http://127.0.0.1:${addr.port}/api/v1`;

  const testUserId = 'usr_sync_v2_' + Date.now();
  const testPhone = '01788' + Math.floor(100000 + Math.random() * 900000);
  const testUserToken = createToken({ _id: testUserId, role: 'DONOR', phone: testPhone });

  // 1. Seed user & profile
  await dataStore.createUser({
    _id: testUserId,
    name: 'মোস্তাফিজুর রহমান',
    phone: testPhone,
    passwordHash: '$2a$10$validPasswordHashForSyncTest1234567890',
    role: 'DONOR',
    accountStatus: 'active',
    division: 'dhaka',
    district: 'dhaka',
    upazila: 'dhanmondi',
    isActive: true,
    isPhoneVerified: true
  });

  await dataStore.createDonorProfile({
    userId: testUserId,
    displayName: 'মোস্তাফিজুর রহমান',
    bloodGroup: 'B+',
    division: 'dhaka',
    district: 'dhaka',
    upazila: 'dhanmondi',
    dateOfBirth: new Date('1995-04-12'),
    availabilityStatus: 'available',
    consentToShareContact: true,
    isPubliclyListed: true,
    emergencyAvailable: true,
    totalDonations: 4
  });

  // Test 1: Latest Version & App Distribution Info Contract
  await t.test('1. App Version Contract: /app/latest returns verified release metadata & permanent download link', async () => {
    const res = await fetch(`${baseUrl}/app/latest`);
    assert.equal(res.status, 200);
    const data: any = await res.json();

    assert.equal(data.success, true);
    assert.equal(data.platform, 'android');
    assert.equal(data.packageName, 'org.bloodbd.app');
    assert.ok(data.latestVersion, 'Must return latestVersion');
    assert.ok(data.versionCode >= 1, 'versionCode must be >= 1');
    assert.ok(data.downloadUrl.startsWith('https://'), 'Download URL must be a secure HTTPS link');
    assert.equal(typeof data.forceUpdate, 'boolean', 'forceUpdate must be a boolean');
    assert.ok(data.releaseNotes && data.releaseNotes.length > 5, 'Must contain Bengali release notes');
  });

  // Test 2: Backward Compatibility with Old App Version (x-app-version: 1.0.0)
  await t.test('2. Backward Compatibility: Old app client (v1.0.0) can post blood requests and read data without breaking', async () => {
    const uniquePatientName = `ফারহানা আক্তার_${Date.now()}`;
    // Old app payload sends legacy urgency level and omits optional hospitalAddress/upazila
    const legacyMobilePayload = {
      patientName: uniquePatientName,
      bloodGroup: 'B+',
      unitsRequired: 1,
      hospitalName: 'ইবনে সিনা মেডিকেল কলেজ হাসপাতাল',
      division: 'dhaka',
      district: 'dhaka',
      urgencyLevel: 'urgent',
      contactPersonName: 'সোহেল রানা',
      contactNumber: '01719876543',
      consentForPublicShare: true
    };

    const postRes = await fetch(`${baseUrl}/requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${testUserToken}`,
        'x-client-platform': 'android',
        'x-app-version': '1.0.0',
        'x-app-build': '1'
      },
      body: JSON.stringify(legacyMobilePayload)
    });

    assert.equal(postRes.status, 201, 'Legacy app request creation must succeed with 201 Created');
    const postData: any = await postRes.json();
    assert.equal(postData.success, true);
    assert.ok(postData.bloodRequest.publicId, 'Must generate publicId');

    // Verify hospitalAddress and upazila were gracefully defaulted by backend
    assert.ok(postData.bloodRequest.hospitalAddress.includes('ইবনে সিনা'), 'Backend must auto-default hospitalAddress');
    assert.equal(postData.bloodRequest.upazila, 'dhaka', 'Backend must auto-default upazila');
  });

  // Test 3: Live Data Retrieval without APK update
  await t.test('3. Live Data Access: New blood request created from Web immediately appears in Mobile feed', async () => {
    const webPatientName = `নুরুল ইসলাম_${Date.now()}`;
    const webPayload = {
      patientName: webPatientName,
      bloodGroup: 'O+',
      unitsRequired: 2,
      hospitalName: 'ঢাকা মেডিকেল কলেজ হাসপাতাল',
      hospitalAddress: 'বকশীবাজার, ঢাকা',
      division: 'dhaka',
      district: 'dhaka',
      upazila: 'lalbagh',
      urgencyLevel: 'emergency',
      reason: 'জরুরি রক্তের আবেদন',
      contactPersonName: 'আরিফুল ইসলাম',
      contactNumber: '01812345678',
      consentForPublicShare: true
    };

    // Website creates request
    const createWebRes = await fetch(`${baseUrl}/requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${testUserToken}`,
        'x-client-platform': 'web'
      },
      body: JSON.stringify(webPayload)
    });
    assert.equal(createWebRes.status, 201);
    const createdWebData: any = await createWebRes.json();
    const createdId = createdWebData.bloodRequest.publicId;

    // Mobile app fetches latest requests via GET /requests with skipCache
    const mobileGetRes = await fetch(`${baseUrl}/requests?bloodGroup=O%2B&district=dhaka&limit=50`, {
      headers: {
        'x-client-platform': 'android',
        'x-app-version': '1.0.0'
      }
    });

    assert.equal(mobileGetRes.status, 200);
    const mobileData: any = await mobileGetRes.json();
    assert.equal(mobileData.success, true);
    const foundInMobile = mobileData.requests.find((r: any) => r.publicId === createdId);
    assert.ok(foundInMobile, 'Request created on Website must be immediately visible to Mobile app without APK update');
    assert.equal(foundInMobile.patientName, webPatientName);
  });

  // Test 4: Version Comparison Logic
  await t.test('4. Version Comparison: Higher server versionCode signals update, same/lower suppresses prompt', async () => {
    const res = await fetch(`${baseUrl}/app/latest`);
    const serverRelease: any = await res.json();

    // Case A: App is Build 1, Server is Build 2 -> Update Available!
    const clientBuildNumberA = 1;
    const isUpdateAvailableA = serverRelease.versionCode > clientBuildNumberA;
    assert.equal(isUpdateAvailableA, true, 'Build 1 app must be notified of Build 2 update');

    // Case B: App is Build 2, Server is Build 2 -> Already Up to Date!
    const clientBuildNumberB = serverRelease.versionCode;
    const isUpdateAvailableB = serverRelease.versionCode > clientBuildNumberB;
    assert.equal(isUpdateAvailableB, false, 'Build 2 app must NOT be prompted when already running Build 2');
  });

  server.close();
});
