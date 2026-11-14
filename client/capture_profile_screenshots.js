import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

async function capture() {
  const tempProfile = path.join(process.env.TEMP || 'C:\\temp', 'chrome_prof_' + Date.now());
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

  // Create new target / tab
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

  console.log('Registering / Logging in test user...');
  // Login via API to get token
  const loginRes = await fetch('http://localhost:5000/api/v1/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'মোস্তাফিজুর রহমান',
      phone: '01719' + Math.floor(100000 + Math.random() * 900000),
      password: 'testPassword123',
      bloodGroup: 'B+',
      gender: 'male',
      division: 'dhaka',
      district: 'dhaka',
      upazila: 'dhanmondi',
      consentToShareContact: true,
      termsAccepted: true
    })
  });
  const loginData = await loginRes.json();
  console.log('Registered user:', loginData?.user?.name, 'Phone:', loginData?.user?.phone);

  const token = loginData.token;
  const userJson = JSON.stringify(loginData.user);
  const donorProfileJson = JSON.stringify(loginData.donorProfile);

  // Navigate to client
  await send('Page.navigate', { url: 'http://localhost:3000/login' });
  await new Promise(r => setTimeout(r, 1000));

  // Set localStorage
  await send('Runtime.evaluate', {
    expression: `
      localStorage.setItem('blood_app_token', ${JSON.stringify(token)});
      localStorage.setItem('blood_app_user', ${JSON.stringify(userJson)});
      localStorage.setItem('blood_app_donor_profile', ${JSON.stringify(donorProfileJson)});
    `
  });

  // Navigate to Profile
  console.log('Navigating to http://localhost:3000/profile...');
  await send('Page.navigate', { url: 'http://localhost:3000/profile' });
  await new Promise(r => setTimeout(r, 2000));

  const outDir = 'C:\\BLOOD DONATION_bangla\\client\\public\\screenshots';
  fs.mkdirSync(outDir, { recursive: true });

  // 1. Desktop Screenshot (1280x950)
  console.log('Capturing Desktop Screenshot...');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 950,
    deviceScaleFactor: 1,
    mobile: false
  });
  await new Promise(r => setTimeout(r, 1000));
  const desktopShot = await send('Page.captureScreenshot', { format: 'png' });
  const desktopPath = path.join(outDir, 'profile_desktop.png');
  fs.writeFileSync(desktopPath, Buffer.from(desktopShot.data, 'base64'));
  console.log('Saved Desktop Screenshot to:', desktopPath);

  // 2. Mobile Screenshot (390x844)
  console.log('Capturing Mobile Screenshot...');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });
  await new Promise(r => setTimeout(r, 1000));
  const mobileShot = await send('Page.captureScreenshot', { format: 'png' });
  const mobilePath = path.join(outDir, 'profile_mobile.png');
  fs.writeFileSync(mobilePath, Buffer.from(mobileShot.data, 'base64'));
  console.log('Saved Mobile Screenshot to:', mobilePath);

  // 3. Mobile Section 2 (Donation & Privacy) tab switch
  console.log('Switching to Section 2 (Donation & Privacy) on Mobile...');
  await send('Runtime.evaluate', {
    expression: `
      const buttons = Array.from(document.querySelectorAll('button'));
      const sec2Btn = buttons.find(b => b.textContent.includes('২. রক্তদান ও'));
      if (sec2Btn) sec2Btn.click();
    `
  });
  await new Promise(r => setTimeout(r, 1000));
  const mobileSec2Shot = await send('Page.captureScreenshot', { format: 'png' });
  const mobileSec2Path = path.join(outDir, 'profile_mobile_donation_tab.png');
  fs.writeFileSync(mobileSec2Path, Buffer.from(mobileSec2Shot.data, 'base64'));
  console.log('Saved Mobile Donation Tab Screenshot to:', mobileSec2Path);

  // 4. Mobile Section 3 (My Applications) tab switch
  console.log('Switching to Section 3 (My Applications) on Mobile...');
  await send('Runtime.evaluate', {
    expression: `
      const buttons = Array.from(document.querySelectorAll('button'));
      const sec3Btn = buttons.find(b => b.textContent.includes('৩. আমার আবেদন'));
      if (sec3Btn) sec3Btn.click();
    `
  });
  await new Promise(r => setTimeout(r, 1000));
  const mobileSec3Shot = await send('Page.captureScreenshot', { format: 'png' });
  const mobileSec3Path = path.join(outDir, 'profile_mobile_requests_tab.png');
  fs.writeFileSync(mobileSec3Path, Buffer.from(mobileSec3Shot.data, 'base64'));
  console.log('Saved Mobile Requests Tab Screenshot to:', mobileSec3Path);

  ws.close();
  chromeProc.kill();
  console.log('All screenshots captured successfully!');
}

capture().catch(err => {
  console.error('Error capturing screenshots:', err);
  process.exit(1);
});
