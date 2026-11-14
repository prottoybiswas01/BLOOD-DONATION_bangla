import http from 'node:http';
import mongoose from 'mongoose';
import app from '../app.js';
import { connectDB } from '../config/db.js';

async function runBenchmark() {
  console.log('=== Starting Performance & Cache Benchmark ===');
  await connectDB();

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address() as any;
  const baseUrl = `http://127.0.0.1:${address.port}`;

  try {
    // 1. Benchmark /api/v1/stats
    console.log('\n--- 1. Testing /api/v1/stats ---');
    const statsTimes: number[] = [];
    let statsHeaders: any = {};
    for (let i = 1; i <= 5; i++) {
      const start = performance.now();
      const res = await fetch(`${baseUrl}/api/v1/stats`);
      const elapsed = performance.now() - start;
      statsTimes.push(elapsed);
      if (i === 1) {
        statsHeaders = Object.fromEntries(res.headers.entries());
      }
      console.log(`Run ${i}: ${elapsed.toFixed(2)}ms | Status: ${res.status}`);
    }
    console.log(`Cache-Control header: ${statsHeaders['cache-control']}`);

    // 2. Benchmark /api/v1/requests (or /api/v1/requests/search)
    console.log('\n--- 2. Testing /api/v1/requests/search ---');
    const reqTimes: number[] = [];
    for (let i = 1; i <= 5; i++) {
      const start = performance.now();
      const res = await fetch(`${baseUrl}/api/v1/requests/search?status=OPEN&page=1&limit=10`);
      const elapsed = performance.now() - start;
      reqTimes.push(elapsed);
      const data: any = await res.json();
      console.log(`Run ${i}: ${elapsed.toFixed(2)}ms | Status: ${res.status} | Total: ${data?.data?.total || data?.total || 0}`);
    }

    // 3. Benchmark /api/v1/donors/search
    console.log('\n--- 3. Testing /api/v1/donors/search ---');
    const donorTimes: number[] = [];
    for (let i = 1; i <= 5; i++) {
      const start = performance.now();
      const res = await fetch(`${baseUrl}/api/v1/donors/search?bloodGroup=O_POSITIVE&page=1&limit=9`);
      const elapsed = performance.now() - start;
      donorTimes.push(elapsed);
      const data: any = await res.json();
      console.log(`Run ${i}: ${elapsed.toFixed(2)}ms | Status: ${res.status} | Total: ${data?.data?.total || data?.total || 0}`);
    }

    // 4. Privacy Check on Donors
    console.log('\n--- 4. Checking Privacy Protection on Donors Search ---');
    const guestDonorRes = await fetch(`${baseUrl}/api/v1/donors/search?page=1&limit=9`);
    const guestData: any = await guestDonorRes.json();
    const donorsList = guestData?.data?.donors || guestData?.donors || [];
    let privatePhoneLeaked = false;
    for (const d of donorsList) {
      if (!d.consentToShareContact && d.phone) {
        privatePhoneLeaked = true;
        console.error('PRIVACY VIOLATION: Private phone returned without consent:', d);
      }
    }
    console.log(`Donors privacy verified (guest): ${!privatePhoneLeaked ? 'PASSED (Zero private phone numbers without consent)' : 'FAILED (Private phone leaked!)'}`);

    // 5. Cache-Control for private/auth endpoints
    console.log('\n--- 5. Checking Cache-Control on Private Endpoints ---');
    const authRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: '01978167016', password: 'wrongpassword' }),
    });
    console.log(`Login response Cache-Control: ${authRes.headers.get('cache-control') || 'no cache-control (default private)'}`);

    console.log('\n=== Benchmark Summary ===');
    console.log(`/api/v1/stats: First=${statsTimes[0].toFixed(1)}ms, Avg(2-5)=${(statsTimes.slice(1).reduce((a,b)=>a+b,0)/4).toFixed(1)}ms`);
    console.log(`/api/v1/requests/search: First=${reqTimes[0].toFixed(1)}ms, Avg(2-5)=${(reqTimes.slice(1).reduce((a,b)=>a+b,0)/4).toFixed(1)}ms`);
    console.log(`/api/v1/donors/search: First=${donorTimes[0].toFixed(1)}ms, Avg(2-5)=${(donorTimes.slice(1).reduce((a,b)=>a+b,0)/4).toFixed(1)}ms`);

  } finally {
    server.close();
    await mongoose.disconnect();
  }

  process.exit(0);
}

runBenchmark().catch(err => {
  console.error(err);
  process.exit(1);
});
