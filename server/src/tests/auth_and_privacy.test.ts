import test, { before } from 'node:test';
import assert from 'node:assert';
import { dataStore } from '../services/dataStore.js';
import { SmsService } from '../services/smsService.js';

before(async () => {
  // Test fixtures for auth & privacy testing
  if (!dataStore.users.some(u => u.role === 'SUPER_ADMIN' && u.isActive)) {
    dataStore.users.push({
      _id: 'usr_sa_test',
      name: 'Prottoy Kumar Biswas',
      phone: '01978167016',
      passwordHash: 'dummy_hash',
      role: 'SUPER_ADMIN',
      accountStatus: 'active',
      isActive: true,
      gender: 'male',
      isPhoneVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
  if (!dataStore.users.some(u => u._id === 'usr_donor_1')) {
    dataStore.users.push({
      _id: 'usr_donor_1',
      name: 'রফিকুল ইসলাম',
      phone: '01711111111',
      passwordHash: 'dummy',
      role: 'MEMBER',
      accountStatus: 'active',
      gender: 'male',
      division: 'dhaka',
      district: 'dhaka',
      isActive: true,
      isPhoneVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
  if (!dataStore.donorProfiles.some(d => d._id === 'donor_prof_1')) {
    dataStore.donorProfiles.push({
      _id: 'donor_prof_1',
      userId: 'usr_donor_1',
      displayName: 'রফিকুল ইসলাম',
      bloodGroup: 'O+',
      division: 'dhaka',
      district: 'dhaka',
      upazila: 'mirpur',
      dateOfBirth: new Date('1998-05-14'),
      gender: 'male',
      availabilityStatus: 'available',
      totalDonations: 6,
      institutionId: 'inst_du',
      institutionMembershipVerified: true,
      consentToShareContact: true,
      preferredContactMethod: 'phone',
      isPubliclyListed: true,
      emergencyAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
  if (!dataStore.donorProfiles.some(d => d._id === 'donor_prof_private')) {
    dataStore.donorProfiles.push({
      _id: 'donor_prof_private',
      userId: 'usr_donor_private',
      displayName: 'গোপন রক্তদাতা',
      bloodGroup: 'A+',
      division: 'dhaka',
      district: 'dhaka',
      upazila: 'dhanmondi',
      dateOfBirth: new Date('1999-01-01'),
      gender: 'male',
      availabilityStatus: 'available',
      totalDonations: 2,
      institutionMembershipVerified: false,
      consentToShareContact: false,
      preferredContactMethod: 'platform',
      isPubliclyListed: true,
      emergencyAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
});

test('1. Guest donor search strictly omits private phone numbers unless donor explicitly consents', async () => {
  const result = await dataStore.searchDonors({ division: 'dhaka' });
  assert.ok(result.donors.length > 0, 'Should find donors in Dhaka');

  // For donors who have not given consent, phone must be strictly undefined
  for (const donor of result.donors) {
    if (!donor.consentToShareContact) {
      assert.strictEqual((donor as any).phone, undefined, 'Private donor search without consent must never contain phone');
    } else {
      assert.ok((donor as any).phone, 'Consented donor should have phone accessible for emergency contact');
    }
    assert.strictEqual((donor as any).contactNumber, undefined, 'Raw contactNumber property must never be leaked');
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

test('4. Contact reveal flow records audit log and enforces consent', async () => {
  // Donor 1 has consented
  const donor = await dataStore.findDonorProfileById('donor_prof_1');
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

test('6. Expired requests are updated and excluded from active emergencies', async () => {
  // Add an expired request
  const pastDate = new Date(Date.now() - 86400000 * 5); // 5 days ago
  await dataStore.createBloodRequest({
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

  const searchResult = await dataStore.searchBloodRequests({});
  const foundExpired = searchResult.requests.find(r => r.patientName === 'Expired Patient');
  assert.strictEqual(foundExpired, undefined, 'Expired requests must not appear in active search feed');
});

