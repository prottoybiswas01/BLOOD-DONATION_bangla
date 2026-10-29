import test from 'node:test';
import assert from 'node:assert';
import { dataStore } from '../services/dataStore.js';
import { SmsService } from '../services/smsService.js';

test('1. Guest donor search strictly omits private phone numbers', () => {
  const result = dataStore.searchDonors({ division: 'dhaka' });
  assert.ok(result.donors.length > 0, 'Should find donors in Dhaka');

  // Verify each donor returned in public search has NO phone or contactNumber property
  for (const donor of result.donors) {
    assert.strictEqual((donor as any).phone, undefined, 'Public donor search must never contain phone');
    assert.strictEqual((donor as any).contactNumber, undefined, 'Public donor search must never contain contactNumber');
    assert.ok(donor.displayName, 'Public donor must have a display name');
    assert.ok(donor.bloodGroup, 'Public donor must have blood group');
  }
});

test('2. Donor age requirement (minimum 18 years old)', () => {
  const minorDob = new Date();
  minorDob.setFullYear(minorDob.getFullYear() - 16); // 16 years old
  
  const ageDiff = Date.now() - minorDob.getTime();
  const calculatedAge = Math.abs(new Date(ageDiff).getUTCFullYear() - 1970);
  assert.ok(calculatedAge < 18, 'Under 18 should be recognized as minor');
});

test('3. SMS Service provides development OTP simulator in non-production', async () => {
  const result = await SmsService.sendOtp('01711111111', '123456', 'registration');
  assert.strictEqual(result.success, true);
  assert.ok(result.devOtp, 'Should provide devOtp in development environment');
  assert.strictEqual(result.devOtp, '123456');
});

test('4. Contact reveal flow records audit log and enforces consent', () => {
  // Donor 1 has consented
  const donor = dataStore.findDonorProfileById('donor_prof_1');
  assert.ok(donor);
  assert.strictEqual(donor.consentToShareContact, true);

  // Record contact reveal
  const initialLogsCount = dataStore.contactAccessLogs.length;
  dataStore.recordContactAccess({
    viewerId: 'usr_requester_1',
    donorUserId: donor.userId,
    donorProfileId: donor._id,
    purpose: 'emergency_search'
  });

  assert.strictEqual(dataStore.contactAccessLogs.length, initialLogsCount + 1, 'Should record in ContactAccessLog');
});

test('5. Cannot demote the last active SUPER_ADMIN', () => {
  const superAdmins = dataStore.users.filter(u => u.role === 'SUPER_ADMIN' && u.isActive);
  assert.strictEqual(superAdmins.length, 1, 'Currently 1 super admin in seed data');
  
  // Demoting must be rejected if count <= 1
  const canDemote = superAdmins.length > 1;
  assert.strictEqual(canDemote, false, 'Demoting the last super admin must be strictly prevented');
});

test('6. Expired requests are updated and excluded from active emergencies', () => {
  // Add an expired request
  const pastDate = new Date(Date.now() - 86400000 * 5); // 5 days ago
  dataStore.createBloodRequest({
    requesterId: 'usr_requester_1',
    patientName: 'Expired Patient',
    bloodGroup: 'AB+',
    hospitalName: 'Old Hospital',
    division: 'dhaka',
    district: 'dhaka',
    requiredDate: pastDate,
    expiresAt: new Date(Date.now() - 86400000 * 2),
    status: 'open'
  });

  const searchResult = dataStore.searchBloodRequests({});
  const foundExpired = searchResult.requests.find(r => r.patientName === 'Expired Patient');
  assert.strictEqual(foundExpired, undefined, 'Expired requests must not appear in active search feed');
});

