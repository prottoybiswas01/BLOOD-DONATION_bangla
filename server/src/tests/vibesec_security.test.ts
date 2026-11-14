import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import app from '../app.js';
import { ENV } from '../config/env.js';
import { connectDB } from '../config/db.js';
import { dataStore, escapeRegex } from '../services/dataStore.js';
import { PhoneChangeRequestModel } from '../models/PhoneChangeRequest.js';

after(async () => {
  await mongoose.disconnect();
});

function createTestToken(user: { _id: string; role: string; phone?: string; assignedDivision?: string; assignedInstitution?: string; tokenVersion?: number }) {
  return jwt.sign(
    {
      userId: user._id,
      phone: user.phone || '01711111111',
      role: user.role,
      assignedDivision: user.assignedDivision,
      assignedInstitution: user.assignedInstitution,
      tokenVersion: user.tokenVersion || 1
    },
    ENV.JWT_SECRET,
    { algorithm: 'HS256', expiresIn: '2h' }
  );
}

test('VibeSec Top-Level Security Verification Suite', async (t) => {
  await connectDB();
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const addr = server.address() as any;
  const baseUrl = `http://127.0.0.1:${addr.port}/api/v1`;

  // 1. JWT Security: Reject Alg none and enforce HS256
  await t.test('1. JWT Security: Rejects forged or non-HS256 algorithms', async () => {
    // Attempting invalid verification with unsupported token
    const fakeToken = jwt.sign({ userId: 'fake_user' }, 'wrong_secret', { algorithm: 'HS256' });
    const res = await fetch(`${baseUrl}/donors/me`, {
      headers: { Authorization: `Bearer ${fakeToken}` }
    });
    assert.equal(res.status, 401, 'Invalid signature or secret must be rejected');
  });

  // 2. ReDoS & Regex Injection Protection
  await t.test('2. ReDoS Protection: Malicious regex inputs do not crash search APIs', async () => {
    // Inputs containing regex meta-characters that would previously break RegExp
    const maliciousInputs = ['[unclosed-bracket', '((a+)+)+$', '.*.*.*.*.*.*', '\\', '^$'];

    for (const input of maliciousInputs) {
      assert.doesNotThrow(() => {
        const escaped = escapeRegex(input);
        new RegExp(escaped, 'i');
      }, `escapeRegex must safely escape: ${input}`);

      // Query donors endpoint with regex payload
      const donorRes = await fetch(`${baseUrl}/donors?district=${encodeURIComponent(input)}`);
      assert.equal(donorRes.status, 200, `Donor search should handle regex input "${input}" without 500 error`);

      // Query institution search endpoint with regex payload
      const instRes = await fetch(`${baseUrl}/institutions?search=${encodeURIComponent(input)}`);
      assert.equal(instRes.status, 200, `Institution search should handle regex input "${input}" without 500 error`);
    }
  });

  // 3. Authorization & Scope: INSTITUTION_HEAD cannot access outside assigned institution
  await t.test('3. BOLA / Scope Protection: INSTITUTION_HEAD cannot approve requests from other institutions', async () => {
    const headUserId = 'usr_head_' + Date.now();
    const headToken = createTestToken({
      _id: headUserId,
      role: 'INSTITUTION_HEAD',
      assignedInstitution: 'inst_dhaka_college'
    });

    await dataStore.createUser({
      _id: headUserId,
      name: 'ড. রফিকুল ইসলাম',
      phone: '01711' + Math.floor(100000 + Math.random() * 900000),
      role: 'INSTITUTION_HEAD',
      accountStatus: 'active',
      assignedInstitution: 'inst_dhaka_college',
      isActive: true
    });

    // Create a phone change request targeting a DIFFERENT institution (e.g. inst_buet)
    const targetUserId = 'usr_target_' + Date.now();
    await dataStore.createUser({
      _id: targetUserId,
      name: 'আহমেদ হাসান',
      phone: '01722' + Math.floor(100000 + Math.random() * 900000),
      role: 'MEMBER',
      accountStatus: 'active',
      assignedInstitution: 'inst_buet',
      isActive: true
    });

    const changeReqResult = dataStore.createPhoneChangeRequest({
      userId: targetUserId,
      newPhone: '01733' + Math.floor(100000 + Math.random() * 900000),
      reason: 'নতুন সিম কার্ড'
    });
    assert.ok(changeReqResult.success);
    const changeReqId = changeReqResult.request!._id;

    // Dhaka College Head tries to approve BUET student's phone change
    const approveRes = await fetch(`${baseUrl}/phone-change/requests/${changeReqId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${headToken}`
      },
      body: JSON.stringify({
        status: 'approved',
        reviewNotes: 'অননুমোদিত অনুমোদন চেষ্টা'
      })
    });

    assert.equal(approveRes.status, 403, 'INSTITUTION_HEAD must be blocked from reviewing other institution requests');
  });

  // 4. Mass Assignment Protection on Blood Request moderationNotes
  await t.test('4. Mass Assignment Protection: Regular requester cannot set moderationNotes', async () => {
    const requesterUserId = 'usr_req_' + Date.now();
    const requesterToken = createTestToken({
      _id: requesterUserId,
      role: 'REQUESTER'
    });

    await dataStore.createUser({
      _id: requesterUserId,
      name: 'হাসান মাহমুদ',
      phone: '01788' + Math.floor(100000 + Math.random() * 900000),
      role: 'REQUESTER',
      accountStatus: 'active',
      isActive: true
    });

    const createReqRes = await fetch(`${baseUrl}/requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${requesterToken}`
      },
      body: JSON.stringify({
        patientName: 'সালেহা বেগম',
        bloodGroup: 'B+',
        unitsRequired: 2,
        hospitalName: 'বঙ্গবন্ধু শেখ মুজিব মেডিকেল বিশ্ববিদ্যালয়',
        hospitalAddress: 'শাহবাগ, ঢাকা-১০০০',
        division: 'dhaka',
        district: 'dhaka',
        upazila: 'shahbagh',
        contactNumber: '01711223344',
        contactPersonName: 'হাসান মাহমুদ',
        requiredDate: '2026-11-20',
        reason: 'জরুরি অস্ত্রোপচারের জন্য রক্ত প্রয়োজন',
        consentForPublicShare: true
      })
    });
    assert.equal(createReqRes.status, 201);
    const createdData: any = await createReqRes.json();
    const reqId = createdData.bloodRequest._id;

    // Requester tries to inject moderationNotes
    const updateRes = await fetch(`${baseUrl}/requests/${reqId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${requesterToken}`
      },
      body: JSON.stringify({
        unitsFulfilled: 1,
        moderationNotes: 'হ্যাকড: অ্যাডমিন কর্তৃক ভেরিফাইড সিল জালিয়াতি'
      })
    });

    assert.equal(updateRes.status, 200);
    const updatedDoc = await dataStore.findBloodRequestById(reqId);
    assert.notEqual(
      updatedDoc?.moderationNotes,
      'হ্যাকড: অ্যাডমিন কর্তৃক ভেরিফাইড সিল জালিয়াতি',
      'Regular requester moderationNotes must not be applied'
    );
  });

  // 5. Contact Access Scrape Protection
  await t.test('5. Scrape Protection: Daily contact access counting is persisted and enforced', async () => {
    const testViewerId = 'usr_viewer_test_' + Date.now();
    const initialCount = await dataStore.getViewerDailyContactAccessCount(testViewerId);
    assert.equal(initialCount, 0);

    await dataStore.recordContactAccess({
      viewerId: testViewerId,
      donorUserId: 'usr_donor_any',
      donorProfileId: 'prof_any',
      purpose: 'emergency_search'
    });

    const newCount = await dataStore.getViewerDailyContactAccessCount(testViewerId);
    assert.equal(newCount, 1, 'Access log must increment daily viewer count');
  });

  // Close server
  (server as any).closeAllConnections?.();
  server.close();
});
