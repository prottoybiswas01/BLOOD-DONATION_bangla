import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import mongoose from 'mongoose';
import app from '../app.js';

after(async () => {
  await mongoose.disconnect();
});

test('1. App Version Metadata: Endpoint returns verified standalone release details', async () => {
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address() as any;
  const port = address.port;

  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/v1/app/version`);
    assert.equal(res.status, 200);
    const data: any = await res.json();

    assert.equal(data.success, true);
    assert.equal(data.packageName, 'org.bloodbd.app');
    assert.equal(data.versionCode, 1);
    assert.equal(data.latestVersion, '1.0.0');
    assert.equal(data.fileSizeMb, 60.0);
    assert.equal(data.fileSizeBytes, 62911392);
    assert.equal(data.sha256Checksum, '3f4066c1ed0e29fa244c04bf597eb91bf3b653e785e73ff2b590d2aa23910ca2');
    assert.equal(data.downloadUrl, 'https://github.com/prottoybiswas01/BLOOD-DONATION_bangla/releases/download/v1.0.0/blood-donation-bangla.apk');
    assert.equal(data.directDownloadPath, '/downloads/blood-donation-bangla.apk');
  } finally {
    server.close();
  }
});

test('2. Dual Platform API Aliases: /app/latest responds identically to /app/version', async () => {
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address() as any;
  const port = address.port;

  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/v1/app/latest`);
    assert.equal(res.status, 200);
    const data: any = await res.json();

    assert.equal(data.success, true);
    assert.equal(data.packageName, 'org.bloodbd.app');
    assert.equal(data.versionCode, 1);
  } finally {
    server.close();
  }
});

test('3. Public Live Statistics Endpoint: /stats returns verified counts', async () => {
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address() as any;
  const port = address.port;

  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/v1/stats`);
    assert.equal(res.status, 200);
    const data: any = await res.json();

    assert.equal(data.success, true);
    assert.ok(data.stats, 'stats object must exist');
    assert.equal(typeof data.stats.totalDonors, 'number');
    assert.equal(typeof data.stats.availableDonors, 'number');
    assert.equal(typeof data.stats.activeRequests, 'number');
    assert.equal(typeof data.stats.districtsCovered, 'number');
    assert.equal(typeof data.stats.totalInstitutions, 'number');
    assert.ok(data.stats.totalDonors >= 0);
  } finally {
    server.close();
  }
});
