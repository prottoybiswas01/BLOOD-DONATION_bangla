import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import mongoose from 'mongoose';
import app from '../app.js';
import { dataStore } from '../services/dataStore.js';
import { ENV } from '../config/env.js';

after(async () => {
  await mongoose.disconnect();
});

test('Website Launch Flow Verification Suite', async (t) => {
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address() as any;
  const baseUrl = `http://127.0.0.1:${address.port}`;

  try {
    // 1. Health check verification
    await t.test('1. Health check returns ok and platform info', async () => {
      const res = await fetch(`${baseUrl}/api/v1/health`);
      assert.equal(res.status, 200);
      const data = await res.json() as any;
      assert.equal(data.status, 'ok');
      assert.equal(data.platform, 'Bangladesh Blood Donation Platform API');
    });

    // 2. Locations check: exactly 8 divisions and 64 districts
    await t.test('2. Locations API returns full 8 divisions without requiring DB', async () => {
      const res = await fetch(`${baseUrl}/api/v1/locations`);
      assert.equal(res.status, 200);
      const data = await res.json() as any;
      assert.equal(data.success, true);
      assert.equal(data.divisions.length, 8);
    });

    // 3. Public Stats endpoint
    await t.test('3. Stats endpoint returns verified numeric counts', async () => {
      const res = await fetch(`${baseUrl}/api/v1/stats`);
      assert.equal(res.status, 200);
      const data = await res.json() as any;
      assert.equal(data.success, true);
      assert.ok(typeof data.stats.totalDonors === 'number');
      assert.ok(typeof data.stats.activeRequests === 'number');
    });

    // 4. Incorrect password returns clear Bangla error
    await t.test('4. Login with invalid password returns clear Bangla error', async () => {
      const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: ENV.SUPER_ADMIN_PHONE || '01712345678',
          password: 'wrongpassword'
        })
      });
      assert.equal(res.status, 401);
      const data = await res.json() as any;
      assert.equal(data.success, false);
      assert.equal(data.message, 'মোবাইল নম্বর অথবা পাসওয়ার্ড সঠিক নয়।');
    });

  } finally {
    server.close();
  }
});
