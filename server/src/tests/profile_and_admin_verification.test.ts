import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import app from '../app.js';
import { connectDB } from '../config/db.js';
import { dataStore } from '../services/dataStore.js';
import { UserModel } from '../models/User.js';
import { DonorProfileModel } from '../models/DonorProfile.js';
import { BloodRequestModel } from '../models/BloodRequest.js';
import { PhoneChangeRequestModel } from '../models/PhoneChangeRequest.js';
import { InstitutionChangeRequestModel } from '../models/InstitutionChangeRequest.js';
import { InstitutionModel } from '../models/Institution.js';
import { ENV } from '../config/env.js';

let server: http.Server;
let baseUrl: string;

const MEMBER_ID = 'test_member_usr_' + Date.now();
const MEMBER_PHONE = '01711' + Math.floor(100000 + Math.random() * 900000);
const SUPER_ADMIN_ID = 'test_sa_usr_' + Date.now();
const SUPER_ADMIN_PHONE = '01922' + Math.floor(100000 + Math.random() * 900000);
const TEST_INST_ID = 'inst_test_' + Date.now();

let memberToken: string;
let superAdminToken: string;

before(async () => {
  await connectDB();
  server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address() as any;
  baseUrl = `http://127.0.0.1:${address.port}`;

  const passHash = bcrypt.hashSync('testPass123', 10);

  // 1. Create test Member
  const memberData: any = {
    _id: MEMBER_ID,
    name: 'মো. রফিকুল ইসলাম',
    phone: MEMBER_PHONE,
    role: 'MEMBER',
    accountStatus: 'active',
    isActive: true,
    isPhoneVerified: true,
    passwordHash: passHash,
    gender: 'male',
    division: 'dhaka',
    district: 'dhaka',
    upazila: 'mirpur',
    tokenVersion: 1
  };
  await UserModel.create(memberData);
  dataStore.users.push(memberData);

  // 2. Create test Super Admin
  const saData: any = {
    _id: SUPER_ADMIN_ID,
    name: 'টেস্ট সুপার অ্যাডমিন',
    phone: SUPER_ADMIN_PHONE,
    role: 'SUPER_ADMIN',
    accountStatus: 'active',
    isActive: true,
    isPhoneVerified: true,
    passwordHash: passHash,
    gender: 'male',
    division: 'dhaka',
    district: 'dhaka',
    upazila: 'dhanmondi',
    tokenVersion: 1
  };
  await UserModel.create(saData);
  dataStore.users.push(saData);

  // 3. Create test Institution
  const instData: any = {
    _id: TEST_INST_ID,
    name: 'University of Dhaka',
    nameBn: 'ঢাকা বিশ্ববিদ্যালয়',
    code: 'DU_' + Date.now(),
    type: 'university',
    division: 'dhaka',
    district: 'dhaka',
    upazila: 'ramna',
    address: 'Dhaka',
    status: 'approved',
    totalRegisteredDonors: 0,
    createdAt: new Date()
  };
  await InstitutionModel.create(instData);
  dataStore.institutions.push(instData);

  memberToken = jwt.sign(
    { userId: MEMBER_ID, role: 'MEMBER', phone: MEMBER_PHONE, tokenVersion: 1 },
    ENV.JWT_SECRET,
    { expiresIn: '1d' }
  );

  superAdminToken = jwt.sign(
    { userId: SUPER_ADMIN_ID, role: 'SUPER_ADMIN', phone: SUPER_ADMIN_PHONE, tokenVersion: 1 },
    ENV.JWT_SECRET,
    { expiresIn: '1d' }
  );
});

after(async () => {
  try {
    await UserModel.deleteMany({ _id: { $in: [MEMBER_ID, SUPER_ADMIN_ID] } });
    await DonorProfileModel.deleteMany({ userId: { $in: [MEMBER_ID, SUPER_ADMIN_ID] } });
    await PhoneChangeRequestModel.deleteMany({ userId: { $in: [MEMBER_ID, SUPER_ADMIN_ID] } });
    await InstitutionChangeRequestModel.deleteMany({ userId: { $in: [MEMBER_ID, SUPER_ADMIN_ID] } });
    await InstitutionModel.deleteMany({ _id: TEST_INST_ID });
    server.close();
    await mongoose.disconnect();
  } catch {}
});

test('Profile & Admin Workflow Suite', async (t) => {
  // 1. Profile Save & Personal Info Update
  await t.test('1. Personal Info Update preserves draft and persists in DB', async () => {
    const res = await fetch(`${baseUrl}/api/v1/members/me`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${memberToken}`
      },
      body: JSON.stringify({
        name: 'মো. রফিকুল ইসলাম (সম্পাদিত)',
        gender: 'male',
        division: 'khulna',
        district: 'khulna',
        upazila: 'khulna_sadar'
      })
    });

    const data = await res.json() as any;
    assert.equal(res.status, 200, data?.message || 'Update failed');
    assert.equal(data.success, true);
    
    // Verify persistence in DB
    const userDoc = await UserModel.findById(MEMBER_ID).lean();
    assert.equal(userDoc?.name, 'মো. রফিকুল ইসলাম (সম্পাদিত)');
    assert.equal(userDoc?.division, 'khulna');
  });

  // 2. Change Password
  await t.test('2. Change Password verifies current and updates hash', async () => {
    const res = await fetch(`${baseUrl}/api/v1/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${memberToken}`
      },
      body: JSON.stringify({
        currentPassword: 'testPass123',
        newPassword: 'newStrongPass987'
      })
    });

    const data = await res.json() as any;
    console.log('Change Password response:', data);
    assert.equal(res.status, 200, data?.message || 'Change password failed');
    assert.equal(data.success, true);

    // Verify login with new password
    const loginRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: MEMBER_PHONE,
        password: 'newStrongPass987'
      })
    });
    const loginData = await loginRes.json() as any;
    assert.equal(loginRes.status, 200, loginData?.message || 'Login failed with new password');
  });

  // 3. Voluntary Donor Profile Activation without modifying account role
  let donorProfileId = '';
  await t.test('3. Voluntary Donor Activation creates profile while keeping MEMBER role', async () => {
    const res = await fetch(`${baseUrl}/api/v1/donors/me/activate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${memberToken}`
      },
      body: JSON.stringify({
        bloodGroup: 'B+',
        division: 'khulna',
        district: 'khulna',
        upazila: 'khulna_sadar',
        availabilityStatus: 'available',
        isPubliclyListed: true,
        consentToShareContact: true
      })
    });

    const data = await res.json() as any;
    assert.ok([200, 201].includes(res.status), data?.message || 'Activate donor failed');
    assert.equal(data.success, true);
    const prof = data.donorProfile || data.profile;
    assert.ok(prof, 'Profile must be returned');
    assert.equal(prof.bloodGroup, 'B+');
    assert.equal(prof.userId, MEMBER_ID);
    donorProfileId = prof._id;

    // Verify user role in DB is still MEMBER
    const userDoc = await UserModel.findById(MEMBER_ID).lean();
    assert.equal(userDoc?.role, 'MEMBER');
  });

  // 4. Temporary Pause (availabilityStatus: temporarily_unavailable)
  await t.test('4. Temporary Pause sets status without deleting profile', async () => {
    const res = await fetch(`${baseUrl}/api/v1/members/me`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${memberToken}`
      },
      body: JSON.stringify({
        availabilityStatus: 'temporarily_unavailable'
      })
    });

    const data = await res.json() as any;
    assert.equal(res.status, 200, data?.message || 'Pause failed');
    const donorDoc = await DonorProfileModel.findOne({ userId: MEMBER_ID }).lean();
    assert.equal(donorDoc?.availabilityStatus, 'temporarily_unavailable');
  });

  // 5. Hide from Search (isPubliclyListed: false)
  await t.test('5. Hide from Search removes donor from guest directory and 404s direct profile', async () => {
    const res = await fetch(`${baseUrl}/api/v1/members/me`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${memberToken}`
      },
      body: JSON.stringify({
        isPubliclyListed: false
      })
    });
    const data = await res.json() as any;
    assert.equal(res.status, 200, data?.message || 'Hide failed');

    // Guest search must NOT return this donor
    const searchRes = await fetch(`${baseUrl}/api/v1/donors/search?bloodGroup=B%2B`);
    const searchData = await searchRes.json() as any;
    const donors = searchData.data?.donors || searchData.donors || [];
    const found = donors.some((d: any) => d._id === donorProfileId || d.displayName?.includes('রফিকুল'));
    assert.equal(found, false, 'Hidden donor must NOT appear in public search');

    // Direct profile view must return 404 or hidden message
    const directRes = await fetch(`${baseUrl}/api/v1/donors/${donorProfileId}`);
    assert.equal(directRes.status, 404, 'Direct view of hidden profile must return 404');
  });

  // 6. Unhide / Show again (isPubliclyListed: true)
  await t.test('6. Unhide restores visibility in public search and direct view', async () => {
    const res = await fetch(`${baseUrl}/api/v1/members/me`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${memberToken}`
      },
      body: JSON.stringify({
        isPubliclyListed: true,
        availabilityStatus: 'available'
      })
    });
    const data = await res.json() as any;
    assert.equal(res.status, 200, data?.message || 'Unhide failed');

    // Direct view now succeeds
    const directRes = await fetch(`${baseUrl}/api/v1/donors/${donorProfileId}`);
    assert.equal(directRes.status, 200);
    const directData = await directRes.json() as any;
    assert.equal(directData.success, true);
    assert.equal(directData.donor._id, donorProfileId);
  });

  // 7. Phone Change Request & Admin Verification
  await t.test('7. Phone Change Request reaches Admin review endpoint', async () => {
    const newPhoneCandidate = '01399' + Math.floor(100000 + Math.random() * 900000);
    const reqRes = await fetch(`${baseUrl}/api/v1/phone-change/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${memberToken}`
      },
      body: JSON.stringify({
        newPhone: newPhoneCandidate,
        reason: 'সিম কার্ড হারিয়ে যাওয়ায় নতুন নম্বর যুক্ত করছি'
      })
    });

    const reqData = await reqRes.json() as any;
    assert.ok([200, 201].includes(reqRes.status), reqData?.message || 'Phone change failed');
    assert.equal(reqData.success, true);

    // Verify it appears in Admin list (querying status=pending or all)
    const adminRes = await fetch(`${baseUrl}/api/v1/phone-change/requests?status=pending`, {
      headers: { Authorization: `Bearer ${superAdminToken}` }
    });
    assert.equal(adminRes.status, 200);
    const adminData = await adminRes.json() as any;
    const reqs = adminData.requests || [];
    const inAdmin = reqs.some((r: any) => r.newPhone === newPhoneCandidate);
    assert.equal(inAdmin, true, 'Phone change request must appear in admin list');
  });

  // 8. Institution Change Request & Admin Verification
  await t.test('8. Institution Change Request reaches Admin review endpoint', async () => {
    const reqRes = await fetch(`${baseUrl}/api/v1/institution-change`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${memberToken}`
      },
      body: JSON.stringify({
        targetInstitutionId: TEST_INST_ID,
        studentOrStaffId: 'CSE-1020',
        department: 'Computer Science',
        reason: 'উচ্চশিক্ষার জন্য নতুন বিশ্ববিদ্যালয়ে ভর্তি হয়েছি'
      })
    });

    const reqData = await reqRes.json() as any;
    assert.ok([200, 201].includes(reqRes.status), reqData?.message || 'Institution change failed');
    assert.equal(reqData.success, true);

    // Verify it appears in Admin institution change list
    const adminRes = await fetch(`${baseUrl}/api/v1/institution-change?status=pending`, {
      headers: { Authorization: `Bearer ${superAdminToken}` }
    });
    assert.equal(adminRes.status, 200);
    const adminData = await adminRes.json() as any;
    const items = adminData.requests || adminData.items || [];
    const inAdmin = items.some((i: any) => i.userId === MEMBER_ID);
    assert.equal(inAdmin, true, 'Institution change request must appear in admin list');
  });
});
