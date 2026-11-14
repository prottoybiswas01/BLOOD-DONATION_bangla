import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../server/.env') });

async function runBrowserWorkflows() {
  console.log('=== Starting End-to-End Browser UI & Workflow Testing ===\n');

  const tempProfile = path.join(process.env.TEMP || 'C:\\temp', 'chrome_prof_wf_' + Date.now());
  fs.mkdirSync(tempProfile, { recursive: true });

  const chromeProc = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    `--user-data-dir=${tempProfile}`
  ]);

  let cdpUrl = '';
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 500));
    try {
      const res = await fetch('http://localhost:9222/json/version');
      if (res.ok) {
        const data = await res.json();
        cdpUrl = data.webSocketDebuggerUrl;
        console.log('Connected to Chrome CDP:', cdpUrl);
        break;
      }
    } catch {}
  }

  if (!cdpUrl) {
    chromeProc.kill();
    throw new Error('Could not connect to Chrome CDP');
  }

  const newTabRes = await fetch('http://localhost:9222/json/new?http://localhost:3000', { method: 'PUT' });
  const tabData = await newTabRes.json();
  const tabWsUrl = tabData.webSocketDebuggerUrl;

  const ws = new WebSocket(tabWsUrl);
  await new Promise((resolve) => ws.addEventListener('open', resolve, { once: true }));

  let reqId = 1;
  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = reqId++;
      const handler = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id === id) {
          ws.removeEventListener('message', handler);
          if (msg.error) reject(msg.error);
          else resolve(msg.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Network.enable');

  const networkRequests = [];
  ws.addEventListener('message', (event) => {
    const msg = JSON.parse(event.data);
    if (msg.method === 'Network.requestWillBeSent') {
      const url = msg.params.request.url;
      if (url.includes('/api/')) {
        networkRequests.push({
          url,
          method: msg.params.request.method,
          time: Date.now()
        });
      }
    }
  });

  const outDir = 'C:\\BLOOD DONATION_bangla\\client\\public\\screenshots';
  fs.mkdirSync(outDir, { recursive: true });

  // =============================================================
  // PART 1: GENERAL MEMBER WORKFLOW
  // =============================================================
  console.log('\n--- Part 1: Registering & Testing General Member ---');
  const memberPhone = '01718' + Math.floor(100000 + Math.random() * 900000);
  const regRes = await fetch('http://localhost:5000/api/v1/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'মো. রফিকুল ইসলাম',
      phone: memberPhone,
      password: 'memberPassword123',
      bloodGroup: 'O+',
      gender: 'male',
      division: 'dhaka',
      district: 'dhaka',
      upazila: 'dhanmondi',
      consentToShareContact: true,
      termsAccepted: true
    })
  });
  const regData = await regRes.json();
  const memberToken = regData.token;
  console.log(`Registered Member: ${regData.user.name} | Phone: ${memberPhone} | Role: ${regData.user.role}`);

  // Navigate to login and inject member token
  await send('Page.navigate', { url: 'http://localhost:3000/login' });
  await new Promise(r => setTimeout(r, 800));

  await send('Runtime.evaluate', {
    expression: `
      localStorage.setItem('token', ${JSON.stringify(memberToken)});
    `
  });

  // Track Network on First Mount of Profile
  networkRequests.length = 0;
  console.log('Navigating to /profile as Member...');
  await send('Page.navigate', { url: 'http://localhost:3000/profile' });
  await new Promise(r => setTimeout(r, 2000));

  const initialMountCalls = [...networkRequests];
  console.log('\n[Network Log - First Screen Mount]:');
  initialMountCalls.forEach(r => console.log(`  -> ${r.method} ${r.url}`));

  // Check First Screen Identity & Dashboard Button for Member
  const memberDashboardEval = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const h1 = document.querySelector('h1')?.textContent || '';
        const badges = Array.from(document.querySelectorAll('.badge, span')).map(s => s.textContent);
        const dashLink = document.querySelector('a[href*="dashboard"]')?.getAttribute('href') || '';
        return { h1, badges, dashLink };
      })()
    `,
    returnByValue: true
  });
  console.log('Member First Screen Eval:', memberDashboardEval.result.value);

  // Desktop Screenshot (Member)
  await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
  await new Promise(r => setTimeout(r, 800));
  const memberDeskShot = await send('Page.captureScreenshot', { format: 'png' });
  const memberDeskPath = path.join(outDir, 'member_profile_desktop.png');
  fs.writeFileSync(memberDeskPath, Buffer.from(memberDeskShot.data, 'base64'));
  console.log('Saved Member Desktop Screenshot:', memberDeskPath);

  // Mobile Screenshot (Member)
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await new Promise(r => setTimeout(r, 800));
  const memberMobShot = await send('Page.captureScreenshot', { format: 'png' });
  const memberMobPath = path.join(outDir, 'member_profile_mobile.png');
  fs.writeFileSync(memberMobPath, Buffer.from(memberMobShot.data, 'base64'));
  console.log('Saved Member Mobile Screenshot:', memberMobPath);

  // Open Section 3 ("আমার আবেদন") and check Network Calls
  networkRequests.length = 0;
  console.log('\nClicking "৩. আমার আবেদন" on Mobile to test On-Demand Lazy Loading...');
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const reqBtn = buttons.find(b => b.textContent.includes('৩. আমার আবেদন'));
        if (reqBtn) reqBtn.click();
      })()
    `
  });
  await new Promise(r => setTimeout(r, 1500));
  const afterOpeningCalls = [...networkRequests];
  console.log('[Network Log - After Opening Section 3]:');
  afterOpeningCalls.forEach(r => console.log(`  -> ${r.method} ${r.url}`));

  // Capture Section 3 Screenshot
  const memberReqShot = await send('Page.captureScreenshot', { format: 'png' });
  const memberReqPath = path.join(outDir, 'member_profile_requests_tab.png');
  fs.writeFileSync(memberReqPath, Buffer.from(memberReqShot.data, 'base64'));
  console.log('Saved Member Requests Tab Screenshot:', memberReqPath);

  // =============================================================
  // PART 2: SUPER ADMIN WORKFLOW
  // =============================================================
  console.log('\n--- Part 2: Creating Authentic Database Super Admin & Testing ---');
  const saPhone = '01999' + Math.floor(100000 + Math.random() * 900000);
  const createSaRes = await fetch('http://localhost:5000/api/v1/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'প্রত্যয় কুমার বিশ্বাস (সুপার অ্যাডমিন)',
      phone: saPhone,
      password: 'superPassword123',
      bloodGroup: 'O+',
      gender: 'male',
      division: 'khulna',
      district: 'khulna',
      upazila: 'khulna_sadar',
      consentToShareContact: true,
      termsAccepted: true
    })
  });
  const createData = await createSaRes.json();
  const saUserId = createData.user._id;

  // Elevate to SUPER_ADMIN directly in server database
  const mongoUri = process.env.MONGO_URI;
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }
    await mongoose.connection.db.collection('users').updateOne(
      { _id: saUserId },
      { $set: { role: 'SUPER_ADMIN' } }
    );
    console.log(`Updated user ${saUserId} in MongoDB Atlas to role: SUPER_ADMIN`);
  } catch (err) {
    console.warn('Direct MongoDB connection warning:', err?.message);
  }

  // Login as Super Admin to get fresh authoritative token with role SUPER_ADMIN
  const saLoginRes = await fetch('http://localhost:5000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone: saPhone,
      password: 'superPassword123'
    })
  });
  const saLoginData = await saLoginRes.json();
  const saToken = saLoginData.token || createData.token;
  console.log(`Authenticated Super Admin: ${saLoginData.user?.name} | Role: ${saLoginData.user?.role}`);

  // Inject Super Admin into Browser
  await send('Runtime.evaluate', {
    expression: `
      localStorage.setItem('token', ${JSON.stringify(saToken)});
    `
  });

  // Navigate to Profile as Super Admin
  console.log('Navigating to /profile as Super Admin...');
  await send('Page.navigate', { url: 'http://localhost:3000/profile' });
  await new Promise(r => setTimeout(r, 2000));

  // Check Super Admin Dashboard Link
  const saDashboardEval = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const h1 = document.querySelector('h1')?.textContent || '';
        const dashLink = document.querySelector('a[href*="dashboard"]')?.getAttribute('href') || '';
        const badges = Array.from(document.querySelectorAll('.badge, span')).map(s => s.textContent);
        return { h1, badges, dashLink };
      })()
    `,
    returnByValue: true
  });
  console.log('Super Admin First Screen Eval:', saDashboardEval.result.value);

  // Desktop Screenshot (Super Admin)
  await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
  await new Promise(r => setTimeout(r, 800));
  const saDeskShot = await send('Page.captureScreenshot', { format: 'png' });
  const saDeskPath = path.join(outDir, 'superadmin_profile_desktop.png');
  fs.writeFileSync(saDeskPath, Buffer.from(saDeskShot.data, 'base64'));
  console.log('Saved Super Admin Desktop Screenshot:', saDeskPath);

  // Mobile Screenshot (Super Admin)
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await new Promise(r => setTimeout(r, 800));
  const saMobShot = await send('Page.captureScreenshot', { format: 'png' });
  const saMobPath = path.join(outDir, 'superadmin_profile_mobile.png');
  fs.writeFileSync(saMobPath, Buffer.from(saMobShot.data, 'base64'));
  console.log('Saved Super Admin Mobile Screenshot:', saMobPath);

  ws.close();
  chromeProc.kill();
  console.log('\nAll browser workflows and screenshots completed successfully!');
}

runBrowserWorkflows().catch(err => {
  console.error('Error running browser workflows:', err);
  process.exit(1);
});
