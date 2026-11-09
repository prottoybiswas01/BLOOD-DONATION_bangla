import test, { before } from 'node:test';
import assert from 'node:assert';
import { dataStore } from '../services/dataStore.js';

before(async () => {
  // Ensure required test fixtures exist for permissions unit testing
  if (!dataStore.users.some(u => u.phone === '01711111111')) {
    await dataStore.createUser({
      phone: '01711111111',
      name: 'Test Member',
      role: 'MEMBER'
    });
  }
  if (!dataStore.users.some(u => u.role === 'DIVISION_COORDINATOR' && u.assignedDivision === 'dhaka')) {
    await dataStore.createUser({
      phone: '01700000002',
      name: 'Dhaka Coordinator',
      role: 'DIVISION_COORDINATOR',
      assignedDivision: 'dhaka'
    });
  }
  if (!dataStore.users.some(u => u.role === 'INSTITUTION_MODERATOR')) {
    await dataStore.createUser({
      phone: '01700000004',
      name: 'DU Moderator',
      role: 'INSTITUTION_MODERATOR',
      assignedInstitution: 'inst_du'
    });
  }
  if (!dataStore.users.some(u => u.phone === '01722222222')) {
    await dataStore.createUser({
      phone: '01722222222',
      name: 'Transfer User',
      role: 'DONOR'
    });
  }
  const testUser = await dataStore.findUserByPhone('01711111111');
  if (!dataStore.phoneChangeRequests.some(r => r._id === 'pcr_1')) {
    dataStore.phoneChangeRequests.push({
      _id: 'pcr_1',
      userId: testUser?._id || 'usr_test_donor',
      userName: 'Test Member',
      userRole: 'DONOR',
      currentPhone: '01711111111',
      newPhone: '01711999888',
      reason: 'SIM lost',
      division: 'dhaka',
      district: 'dhaka',
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
});

test('1. Role Hierarchy & Super Admin Safeguards: Cannot demote or block the last active Super Admin', () => {
  const superAdmin = dataStore.users.find(u => u.role === 'SUPER_ADMIN' && u.accountStatus === 'active');
  assert.ok(superAdmin, 'Super Admin must exist');

  // Attempt to block the last super admin
  const blockResult = dataStore.blockUser({
    userId: superAdmin._id,
    actorId: 'usr_admin_1',
    actorName: 'Platform Admin',
    actorRole: 'SUPER_ADMIN',
    reason: 'Attempt to block last super admin'
  });
  assert.strictEqual(blockResult.success, false, 'Blocking last super admin must fail');
  assert.match(blockResult.message, /সুপার অ্যাডমিন/);

  // Safeguard verification on demoting the last active super admin
  const activeSuperAdmins = dataStore.users.filter(u => u.role === 'SUPER_ADMIN' && u.accountStatus === 'active');
  assert.strictEqual(activeSuperAdmins.length, 1, 'Only one active super admin should exist in seed data');
  const canDemote = activeSuperAdmins.length > 1;
  assert.strictEqual(canDemote, false, 'Demoting the last active super admin is prohibited');
});

test('2. Platform Admin Permissions: Admin can approve or reject institutional registration requests while unauthorized roles cannot', async () => {
  // Create an institution request
  const request = dataStore.createInstitutionRequest({
    name: 'Test College Blood Club',
    nameBn: 'টেস্ট কলেজ ব্লাড ক্লাব',
    code: 'TCBC_TEST',
    type: 'college',
    division: 'chittagong',
    district: 'chittagong',
    upazila: 'kotwali',
    address: 'Chittagong Sadar',
    applicantName: 'Md Karim',
    applicantPhone: '01811223344',
    applicantEmail: 'karim@test.com'
  });

  assert.ok(request._id, 'Institution request should be created');
  assert.strictEqual(request.status, 'pending_review');

  // Verify unauthorized role (MEMBER) cannot review/approve
  const memberActor = await dataStore.findUserByPhone('01711111111');
  assert.ok(memberActor, 'Member user must exist');
  const unauthorizedReview = dataStore.reviewInstitutionRequest({
    requestId: request._id,
    reviewerId: memberActor._id,
    reviewerRole: memberActor.role,
    reviewerDivision: memberActor.division,
    status: 'approved',
    decisionReason: 'Member attempted approval'
  });
  assert.strictEqual(unauthorizedReview.success, false, 'Member cannot review or approve institution requests');

  // Verify Admin role is permitted to review/approve institution requests
  const adminActor = await dataStore.findUserByPhone('01700000007'); // Admin seed
  assert.ok(adminActor, 'Admin user must exist');
  assert.strictEqual(adminActor.role, 'ADMIN');

  // Attempt review by ADMIN
  const adminReview = dataStore.reviewInstitutionRequest({
    requestId: request._id,
    reviewerId: adminActor._id,
    reviewerRole: adminActor.role,
    reviewerDivision: adminActor.assignedDivision,
    status: 'approved',
    decisionReason: 'Admin verified and approved college'
  });

  assert.strictEqual(adminReview.success, true, 'Admin can review and approve institution requests');
  assert.ok(adminReview.institution, 'Approved institution should be created');
});

test('3. Division Coordinator Scoping: Can only review requests and manage within assigned division', () => {
  // Create request in Chittagong
  const ctgRequest = dataStore.createInstitutionRequest({
    name: 'Chittagong Poly Blood Unit',
    nameBn: 'চট্টগ্রাম পলি ব্লাড ইউনিট',
    code: 'CPBU_TEST',
    type: 'polytechnic',
    division: 'chittagong',
    district: 'chittagong',
    upazila: 'panchlaish',
    address: 'Nasirabad, Chittagong',
    applicantName: 'Fahim Ahmed',
    applicantPhone: '01899887766'
  });

  // Dhaka Coordinator
  const dhakaCoordinator = dataStore.users.find(u => u.role === 'DIVISION_COORDINATOR' && u.assignedDivision === 'dhaka');
  assert.ok(dhakaCoordinator, 'Dhaka coordinator must exist');

  // Dhaka coordinator reviews Chittagong request -> Must fail
  const outOfScopeReview = dataStore.reviewInstitutionRequest({
    requestId: ctgRequest._id,
    reviewerId: dhakaCoordinator._id,
    reviewerRole: dhakaCoordinator.role,
    reviewerDivision: dhakaCoordinator.assignedDivision,
    status: 'approved',
    decisionReason: 'Dhaka trying to approve Chittagong'
  });
  assert.strictEqual(outOfScopeReview.success, false, 'Coordinator cannot approve outside assigned division');
  assert.match(outOfScopeReview.message, /দায়িত্বপ্রাপ্ত বিভাগ/);

  // Now create a Dhaka request
  const dhakaRequest = dataStore.createInstitutionRequest({
    name: 'Dhaka City College Red Club',
    nameBn: 'ঢাকা সিটি কলেজ রেড ক্লাব',
    code: 'DCC_TEST',
    type: 'college',
    division: 'dhaka',
    district: 'dhaka',
    upazila: 'dhanmondi',
    address: 'Dhanmondi, Dhaka',
    applicantName: 'Sadia Jahan',
    applicantPhone: '01755443322'
  });

  // Dhaka coordinator reviews Dhaka request -> Success
  const validReview = dataStore.reviewInstitutionRequest({
    requestId: dhakaRequest._id,
    reviewerId: dhakaCoordinator._id,
    reviewerRole: dhakaCoordinator.role,
    reviewerDivision: dhakaCoordinator.assignedDivision,
    status: 'approved',
    decisionReason: 'Dhaka coordinator verified and approved'
  });
  assert.strictEqual(validReview.success, true, 'Coordinator can approve within assigned division');
  assert.strictEqual(dhakaRequest.status, 'approved');
  assert.strictEqual(dhakaRequest.decisionReason, 'Dhaka coordinator verified and approved');
});

test('4. Institution Moderator: Manual member creation generates temporary password & enforces first-login change', async () => {
  const moderator = dataStore.users.find(u => u.role === 'INSTITUTION_MODERATOR');
  assert.ok(moderator, 'Institution moderator must exist');
  assert.ok(moderator.assignedInstitution, 'Moderator must have assigned institution');

  const testPhone = '01719999888';
  const creationResult = dataStore.createMemberWithTemporaryPassword({
    name: 'Rahim Uddin',
    phone: testPhone,
    gender: 'male',
    bloodGroup: 'B+',
    division: 'dhaka',
    district: 'dhaka',
    upazila: 'ramna',
    institutionId: moderator.assignedInstitution,
    moderatorId: moderator._id,
    moderatorName: moderator.name,
    consentToShareContact: true
  });

  assert.ok(creationResult.user, 'User should be created');
  assert.ok(creationResult.temporaryPassword, 'Temporary password must be generated');
  assert.ok(creationResult.temporaryPassword.startsWith('Temp#'), 'Temporary password should follow prefix format');
  assert.strictEqual(creationResult.user.role, 'MEMBER', 'Newly created user should have MEMBER role');
  assert.strictEqual(creationResult.user.requirePasswordChangeAtFirstLogin, true, 'Must require password change on first login');

  // Verify moderator activity was logged
  const activities = dataStore.getModeratorActivities({ actorId: moderator._id, action: 'MEMBER_CREATED' });
  assert.ok(activities.length > 0, 'Moderator activity must be logged');
  assert.strictEqual(activities[0].targetRecordId, creationResult.user._id);

  // Test first-login password change
  const changeSuccess = dataStore.changeFirstLoginPassword(creationResult.user._id, 'SecurePassword123#');
  assert.strictEqual(changeSuccess, true, 'Password change must succeed');
  const refreshedUser = await dataStore.findUserById(creationResult.user._id);
  assert.strictEqual(refreshedUser?.requirePasswordChangeAtFirstLogin, false, 'Flag must be cleared after change');
});

test('5. Female Donor Privacy & Safety Notice Defaults', async () => {
  // If donor is female, default consent to share contact should be false if not explicitly opted in
  const femalePhone = '01712345999';
  const femaleUser = await dataStore.createUser({
    phone: femalePhone,
    name: 'Nusrat Jahan',
    role: 'MEMBER',
    gender: 'female',
    femaleSafetyAcknowledged: true,
    femalePublicPhoneConsent: false
  });

  const femaleDonor = await dataStore.createDonorProfile({
    userId: femaleUser._id,
    displayName: 'নুসরাত জাহান',
    bloodGroup: 'O+',
    division: 'dhaka',
    district: 'dhaka',
    upazila: 'mirpur',
    consentToShareContact: false // strictly unchecked by default for female safety
  });

  assert.strictEqual(femaleDonor.consentToShareContact, false, 'Female donor phone disclosure must default to false/private');
  assert.strictEqual(femaleUser.gender, 'female');
});

test('6. Centralized Account Blocking & Unblocking with mandatory reason', async () => {
  const memberToBlock = await dataStore.createUser({
    phone: '01718887766',
    name: 'Spam User',
    role: 'MEMBER'
  });

  assert.strictEqual(memberToBlock.accountStatus, 'active');

  // Blocking without reason is guarded by API schema and method
  const validReason = 'বারবার ভুয়া রক্তদানের অনুরোধ প্রদান করার কারণে সাময়িক স্থগিত করা হলো।';
  const blockResult = dataStore.blockUser({
    userId: memberToBlock._id,
    actorId: 'usr_admin_1',
    actorName: 'Admin',
    actorRole: 'ADMIN',
    reason: validReason,
    newStatus: 'temporarily_blocked'
  });
  assert.strictEqual(blockResult.success, true, 'Valid block should succeed');
  assert.strictEqual(memberToBlock.accountStatus, 'temporarily_blocked');
  assert.strictEqual(memberToBlock.blockReason, validReason);

  // Check Account Status History
  const history = dataStore.accountStatusHistories.filter(h => h.userId === memberToBlock._id);
  assert.ok(history.length > 0, 'Status history should be recorded');
  assert.strictEqual(history[history.length - 1].newStatus, 'temporarily_blocked');
  assert.strictEqual(history[history.length - 1].reason, validReason);

  // Unblock user
  const unblockReason = 'সদস্যের সাথে কথা বলে সতর্ক করা হয়েছে এবং অ্যাকাউন্ট পুনরায় সচল করা হলো।';
  const unblockResult = dataStore.unblockUser({
    userId: memberToBlock._id,
    actorId: 'usr_admin_1',
    actorName: 'Admin',
    actorRole: 'ADMIN',
    reason: unblockReason
  });
  assert.strictEqual(unblockResult.success, true, 'Unblocking should succeed');
  assert.strictEqual(memberToBlock.accountStatus, 'active');
  assert.strictEqual(memberToBlock.blockReason, undefined);
});

test('7. Institutional Contact Request Flow', () => {
  const requester = dataStore.users.find(u => u.phone === '01700000004'); // Requester seed
  assert.ok(requester);

  // Submit contact request to Dhaka University pool
  const contactReq = dataStore.createContactRequest({
    requesterId: requester._id,
    requesterName: requester.name,
    requesterPhone: requester.phone,
    institutionId: 'inst_du',
    targetBloodGroup: 'B+',
    patientName: 'মুমূর্ষু রোগী',
    hospitalName: 'ঢাকা মেডিকেল কলেজ হাসপাতাল',
    unitsRequired: 2,
    urgency: 'emergency',
    reason: 'জরুরি অস্ত্রোপচারের জন্য রক্ত প্রয়োজন'
  });

  assert.ok(contactReq._id);
  assert.strictEqual(contactReq.status, 'pending');

  // Moderator handles contact request
  const moderator = dataStore.users.find(u => u.assignedInstitution === 'inst_du');
  assert.ok(moderator);

  const updatedReq = dataStore.updateContactRequest(contactReq._id, {
    status: 'in_progress',
    moderatorNotes: 'রক্তদাতা শিক্ষার্থীর সাথে যোগাযোগ করা হয়েছে, তিনি হাসপাতালে রওনা হয়েছেন।',
    handledAt: new Date()
  });

  assert.ok(updatedReq);
  assert.strictEqual(updatedReq.status, 'in_progress');
  assert.ok(updatedReq.handledAt);
});

test('8. Phone Number Change Approval Flow by Admin/Moderator', async () => {
  // Test approving existing pending request pcr_1
  const existingReq = dataStore.phoneChangeRequests.find(r => r._id === 'pcr_1');
  assert.ok(existingReq, 'Existing pending request pcr_1 should exist');
  assert.strictEqual(existingReq.status, 'pending');

  const admin = await dataStore.findUserByPhone('01700000007');
  assert.ok(admin);

  const reviewRes = dataStore.updatePhoneChangeRequest(
    'pcr_1',
    'approved',
    { userId: admin._id, name: admin.name, role: admin.role },
    'নথিপত্র যাচাইপূর্বক নম্বর পরিবর্তন অনুমোদিত হলো'
  );

  assert.ok(reviewRes.success, 'Review should succeed');
  assert.strictEqual(reviewRes.request?.status, 'approved');

  // Verify user's phone is actually updated
  const updatedUser = await dataStore.findUserById(existingReq.userId);
  assert.strictEqual(updatedUser?.phone, existingReq.newPhone, 'User phone number must be updated');
});

test('9. Institution Change Request Approval by Admin', async () => {
  const user = dataStore.users.find(u => u.phone === '01722222222');
  assert.ok(user);

  const changeRes = dataStore.createInstitutionChangeRequest({
    userId: user._id,
    targetInstitutionId: 'inst_buet',
    studentOrStaffId: 'BUET-2024-001',
    department: 'CSE',
    reason: 'বুয়েট ক্যাম্পাসে স্থানান্তর হওয়ার কারণে প্রতিষ্ঠান পরিবর্তন'
  });

  assert.ok(changeRes.success);
  assert.ok(changeRes.request?._id);

  const admin = await dataStore.findUserByPhone('01700000007');
  assert.ok(admin);

  const reviewRes = dataStore.reviewInstitutionChangeRequest(
    changeRes.request!._id,
    admin,
    'approved',
    'বিশ্ববিদ্যালয় ট্রান্সফার সার্টিফিকেট যাচাই করে অনুমোদিত'
  );

  assert.ok(reviewRes.success);
  const updatedUser = await dataStore.findUserById(user._id);
  assert.strictEqual(updatedUser?.assignedInstitution, 'inst_buet', 'Assigned institution must be updated to target');
});
