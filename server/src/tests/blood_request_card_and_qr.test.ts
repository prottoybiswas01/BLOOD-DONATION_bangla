import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import app from '../app.js';
import { ENV } from '../config/env.js';
import { dataStore } from '../services/dataStore.js';

after(async () => {
  await mongoose.disconnect();
});

function createTestToken(user: { _id: string; role: string; assignedDivision?: string }) {
  return jwt.sign(
    {
      userId: user._id,
      phone: '01711111111',
      role: user.role,
      assignedDivision: user.assignedDivision
    },
    ENV.JWT_SECRET,
    { expiresIn: '1h' }
  );
}

test('Blood Request Card & QR Code Workflow', async (t) => {
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address() as any;
  const baseUrl = `http://127.0.0.1:${address.port}/api/v1`;

  const requesterToken = createTestToken({ _id: 'usr_requester_1', role: 'REQUESTER' });
  const otherUserToken = createTestToken({ _id: 'usr_other_99', role: 'DONOR' });

  let createdPublicId = '';
  let createdDbId = '';

  await t.test('1. Create Blood Request: 3 units of B+ blood with publicId and canonicalUrl', async () => {
    const payload = {
      patientName: 'নাজমুল হাসান',
      bloodGroup: 'B+',
      unitsRequired: 3,
      hospitalName: 'ঢাকা মেডিকেল কলেজ হাসপাতাল',
      hospitalAddress: 'জরুরি বিভাগ, ঢাকা',
      division: 'dhaka',
      district: 'dhaka',
      upazila: 'shahbagh',
      requiredDate: new Date(Date.now() + 86400000).toISOString(),
      urgencyLevel: 'emergency',
      reason: 'অস্ত্রোপচারের জন্য জরুরি রক্ত প্রয়োজন',
      contactPersonName: 'মাহমুদ করিম',
      contactNumber: '01799999999',
      consentForPublicShare: true
    };

    const res = await fetch(`${baseUrl}/requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${requesterToken}`
      },
      body: JSON.stringify(payload)
    });

    assert.equal(res.status, 201);
    const data: any = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.bloodRequest, 'bloodRequest object must be returned');
    assert.equal(data.bloodRequest.unitsRequired, 3);
    assert.equal(data.bloodRequest.unitsFulfilled, 0);
    assert.equal(data.bloodRequest.unitsRemaining, 3);
    assert.ok(data.bloodRequest.publicId, 'Unique publicId must be generated');
    assert.ok(data.bloodRequest.publicId.startsWith('BR-'), 'publicId format should start with BR-');
    assert.ok(data.bloodRequest.canonicalUrl.includes(data.bloodRequest.publicId), 'canonicalUrl must contain publicId');

    createdPublicId = data.bloodRequest.publicId;
    createdDbId = data.bloodRequest._id;
  });

  await t.test('2. Duplicate submission protection prevents double posting within 2 minutes', async () => {
    const payload = {
      patientName: 'নাজমুল হাসান',
      bloodGroup: 'B+',
      unitsRequired: 3,
      hospitalName: 'ঢাকা মেডিকেল কলেজ হাসপাতাল',
      hospitalAddress: 'জরুরি বিভাগ, ঢাকা',
      division: 'dhaka',
      district: 'dhaka',
      upazila: 'shahbagh',
      requiredDate: new Date(Date.now() + 86400000).toISOString(),
      urgencyLevel: 'emergency',
      reason: 'অস্ত্রোপচারের জন্য জরুরি রক্ত প্রয়োজন',
      contactNumber: '01799999999'
    };

    const res = await fetch(`${baseUrl}/requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${requesterToken}`
      },
      body: JSON.stringify(payload)
    });

    assert.equal(res.status, 409, 'Duplicate request must return 409 Conflict');
    const data: any = await res.json();
    assert.equal(data.success, false);
  });

  await t.test('3. Public QR landing lookup: Accessible by publicId without authentication', async () => {
    const res = await fetch(`${baseUrl}/requests/${createdPublicId}`);
    assert.equal(res.status, 200);
    const data: any = await res.json();

    assert.equal(data.success, true);
    assert.equal(data.bloodRequest.publicId, createdPublicId);
    assert.equal(data.bloodRequest.unitsRequired, 3);
    assert.equal(data.bloodRequest.unitsRemaining, 3);
    assert.equal(data.bloodRequest.status, 'open');
  });

  await t.test('4. Update received units: 1 unit received -> 2 remaining, status becomes partially_fulfilled', async () => {
    const res = await fetch(`${baseUrl}/requests/${createdPublicId}/progress`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${requesterToken}`
      },
      body: JSON.stringify({
        unitsFulfilled: 1,
        notes: '১ ব্যাগ রক্ত ম্যানেজ হয়েছে'
      })
    });

    assert.equal(res.status, 200);
    const data: any = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.bloodRequest.unitsFulfilled, 1);
    assert.equal(data.bloodRequest.unitsRemaining, 2);
    assert.equal(data.bloodRequest.status, 'partially_fulfilled');
  });

  await t.test('5. Unauthorized user cannot alter or close another requester blood request', async () => {
    const res = await fetch(`${baseUrl}/requests/${createdPublicId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${otherUserToken}`
      },
      body: JSON.stringify({
        status: 'cancelled'
      })
    });

    assert.equal(res.status, 403, 'Unauthorized modification must be rejected');
  });

  await t.test('6. Complete requirement: 3 units received -> mark fulfilled and verify completion message', async () => {
    const res = await fetch(`${baseUrl}/requests/${createdPublicId}/progress`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${requesterToken}`
      },
      body: JSON.stringify({
        unitsFulfilled: 3,
        status: 'fulfilled',
        notes: 'সম্পূর্ণ রক্ত সংগ্রহ সফল'
      })
    });

    assert.equal(res.status, 200);
    const data: any = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.bloodRequest.status, 'fulfilled');
    assert.equal(data.bloodRequest.unitsRemaining, 0);

    // Verify public landing reflects fulfilled message
    const publicRes = await fetch(`${baseUrl}/requests/${createdPublicId}`);
    const publicData: any = await publicRes.json();
    assert.equal(publicData.bloodRequest.status, 'fulfilled');
    assert.equal(publicData.bloodRequest.isFulfilled, true);
    assert.ok(
      publicData.bloodRequest.statusMessage.includes('সম্পন্ন হয়েছে'),
      'Status message must convey completion'
    );
  });

  await t.test('7. Fulfilled request is automatically excluded from default active emergency feed', async () => {
    const feedRes = await fetch(`${baseUrl}/requests`);
    const feedData: any = await feedRes.json();
    assert.equal(feedRes.status, 200);
    const foundInActiveFeed = feedData.requests.some((r: any) => r.publicId === createdPublicId);
    assert.equal(foundInActiveFeed, false, 'Fulfilled request must not appear in active emergency feed');
  });

  server.close();
});

