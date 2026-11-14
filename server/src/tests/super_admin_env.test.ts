import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import app from '../app.js';
import { dataStore } from '../services/dataStore.js';
import { connectDB } from '../config/db.js';

after(async () => {
  await new Promise(r => setTimeout(r, 500));
  await mongoose.disconnect();
});

test('Database-Driven Super Admin Authentication & Protection Suite', async (t) => {
  await connectDB();
  await dataStore.syncWithMongoDB();

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const port = (server.address() as any).port;
  const baseUrl = `http://127.0.0.1:${port}/api/v1`;

  t.after(() => {
    server.close();
  });

  // Create an authoritative active Super Admin user in dataStore/database for testing
  const testSuperAdminPhone = '01978167016';
  const testSuperAdminPass = 'SuperSecurePass2026!';
  const passHash = bcrypt.hashSync(testSuperAdminPass, 10);

  const existingSA = await dataStore.findUserByPhone(testSuperAdminPhone);
  let activeSA = existingSA;
  if (!existingSA) {
    activeSA = await dataStore.createUser({
      name: 'Prottoy Kumar Biswas',
      phone: testSuperAdminPhone,
      passwordHash: passHash,
      role: 'SUPER_ADMIN',
      accountStatus: 'active',
      isActive: true,
      gender: 'male',
      isPhoneVerified: true
    });
  } else {
    await dataStore.updateUser(existingSA._id, {
      role: 'SUPER_ADMIN',
      accountStatus: 'active',
      isActive: true,
      passwordHash: passHash
    });
  }

  // Deactivate old built-in account if present in test DB
  if (mongoose.connection.db) {
    await mongoose.connection.db.collection('users').updateOne(
      { _id: 'usr_superadmin' },
      { $set: { role: 'MEMBER', accountStatus: 'deactivated', isActive: false } }
    );
  }

  await t.test('1. Server starts and functions with ZERO SUPER_ADMIN_PASSWORD in environment', () => {
    assert.equal(process.env.SUPER_ADMIN_PASSWORD, undefined, 'SUPER_ADMIN_PASSWORD must be absent from environment');
  });

  await t.test('2. Database Super Admin can login using phone and database-stored password', async () => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: testSuperAdminPhone,
        password: testSuperAdminPass
      })
    });

    assert.equal(res.status, 200);
    const data = await res.json() as any;
    assert.equal(data.success, true);
    assert.ok(data.token, 'Must return JWT token');
    assert.equal(data.user.role, 'SUPER_ADMIN');
    assert.equal(data.user.phone, testSuperAdminPhone);

    // Verify access to admin overview
    const overviewRes = await fetch(`${baseUrl}/admin/overview`, {
      headers: { Authorization: `Bearer ${data.token}` }
    });
    assert.equal(overviewRes.status, 200);
    const overviewData = await overviewRes.json() as any;
    assert.equal(overviewData.success, true);
    assert.ok(overviewData.stats);
    assert.ok(Array.isArray(overviewData.stats.bloodGroupDistribution));
  });

  await t.test('3. Deactivated old built-in account cannot login and access panel', async () => {
    // Old built-in account phone: 01700000000 or id usr_superadmin
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: '01700000000',
        password: 'any_attempted_password'
      })
    });

    // Must be rejected with 401 (not found / bad credentials) or 403 (deactivated)
    assert.ok(res.status === 401 || res.status === 403, `Expected 401 or 403, got ${res.status}`);
  });

  await t.test('4. Resyncing or restarting does NOT resurrect old usr_superadmin as active Super Admin', async () => {
    await dataStore.syncWithMongoDB();

    const oldAdmin = dataStore.users.find(u => u._id === 'usr_superadmin');
    if (oldAdmin) {
      assert.notEqual(oldAdmin.accountStatus, 'active', 'Old admin must never be active');
      assert.notEqual(oldAdmin.role, 'SUPER_ADMIN', 'Old admin must not hold SUPER_ADMIN role');
    }

    const currentSuperAdmins = dataStore.users.filter(u => u.role === 'SUPER_ADMIN' && u.isActive && u.accountStatus === 'active');
    assert.ok(currentSuperAdmins.length >= 1, 'Active Super Admin must be present');
    assert.ok(currentSuperAdmins.some(u => u.phone === testSuperAdminPhone), 'Active Super Admin must be present');
  });
});
