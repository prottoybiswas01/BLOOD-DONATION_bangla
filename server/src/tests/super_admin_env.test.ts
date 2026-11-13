import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import mongoose from 'mongoose';
import app from '../app.js';
import { dataStore } from '../services/dataStore.js';
import { ENV } from '../config/env.js';
import { connectDB } from '../config/db.js';

after(async () => {
  await new Promise(r => setTimeout(r, 500));
  await mongoose.disconnect();
});

test('Single Authoritative Super Admin from ENV Configuration', async (t) => {
  await connectDB();
  await dataStore.syncWithMongoDB();

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const port = (server.address() as any).port;
  const baseUrl = `http://127.0.0.1:${port}/api/v1`;

  t.after(() => {
    server.close();
  });

  await t.test('1. Exactly ONE Super Admin exists in dataStore', () => {
    const superAdmins = dataStore.users.filter(u => u.role === 'SUPER_ADMIN');
    assert.equal(superAdmins.length, 1, 'There must be exactly one Super Admin in the system');
    assert.equal(superAdmins[0].phone, ENV.SUPER_ADMIN_PHONE);
    assert.equal(superAdmins[0].role, 'SUPER_ADMIN');
    assert.equal(superAdmins[0].accountStatus, 'active');
  });

  await t.test('2. Super Admin can login using phone and ENV password', async () => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: ENV.SUPER_ADMIN_PHONE,
        password: ENV.SUPER_ADMIN_PASSWORD
      })
    });

    assert.equal(res.status, 200);
    const data = await res.json() as any;
    assert.equal(data.success, true);
    assert.ok(data.token, 'Must return JWT token');
    assert.equal(data.user.role, 'SUPER_ADMIN');
    assert.equal(data.user.phone, ENV.SUPER_ADMIN_PHONE);
  });

  await t.test('3. Super Admin can login using user ID alias ("superadmin") and ENV password', async () => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: 'superadmin',
        password: ENV.SUPER_ADMIN_PASSWORD
      })
    });

    assert.equal(res.status, 200);
    const data = await res.json() as any;
    assert.equal(data.success, true);
    assert.equal(data.user.role, 'SUPER_ADMIN');
  });

  await t.test('4. Super Admin can login using Email and ENV password', async () => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: ENV.SUPER_ADMIN_EMAIL,
        password: ENV.SUPER_ADMIN_PASSWORD
      })
    });

    assert.equal(res.status, 200);
    const data = await res.json() as any;
    assert.equal(data.success, true);
    assert.equal(data.user.role, 'SUPER_ADMIN');
  });

  await t.test('5. Login with incorrect password is rejected with 401', async () => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: ENV.SUPER_ADMIN_PHONE,
        password: 'wrong_password_123'
      })
    });

    assert.equal(res.status, 401);
    const data = await res.json() as any;
    assert.equal(data.success, false);
    assert.equal(data.message, 'মোবাইল নম্বর অথবা পাসওয়ার্ড সঠিক নয়।');
  });

  await t.test('6. Attempting to promote another user to SUPER_ADMIN is rejected', async () => {
    // Login as Super Admin
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: ENV.SUPER_ADMIN_PHONE,
        password: ENV.SUPER_ADMIN_PASSWORD
      })
    });
    const { token } = await loginRes.json() as any;

    // Create a dummy user with unique random phone
    const randomPhone = '018' + Math.floor(10000000 + Math.random() * 90000000);
    const dummyUser = dataStore.createUserSync({
      name: 'সাধারণ ইউজার',
      phone: randomPhone,
      role: 'MEMBER'
    });

    // Try to update role to SUPER_ADMIN
    const updateRes = await fetch(`${baseUrl}/admin/users/${dummyUser._id}/role`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ role: 'SUPER_ADMIN' })
    });

    assert.equal(updateRes.status, 400);
    const data = await updateRes.json() as any;
    assert.equal(data.success, false);
    assert.ok(data.message.includes('একটিমাত্র সুপার অ্যাডমিন'));
  });
});
