import test, { before } from 'node:test';
import assert from 'node:assert';
import { dataStore } from '../services/dataStore.js';

test('User and Donor Profile Deletion Suite', async (t) => {
  let targetUser: any;
  let targetDonor: any;

  before(async () => {
    // Create test user and donor profile
    targetUser = await dataStore.createUser({
      name: 'Deletion Candidate',
      phone: '01799887766',
      role: 'DONOR',
      accountStatus: 'active'
    });

    targetDonor = await dataStore.createDonorProfile({
      userId: targetUser._id,
      name: targetUser.name,
      phone: targetUser.phone,
      bloodGroup: 'B+',
      division: 'dhaka',
      district: 'dhaka'
    });
  });

  await t.test('1. DataStore can delete donor profile independently', async () => {
    const donorBefore = await dataStore.findDonorProfileByUserId(targetUser._id);
    assert.ok(donorBefore, 'Donor profile should exist initially');

    const deleted = await dataStore.deleteDonorProfile(targetUser._id);
    assert.strictEqual(deleted, true);

    const donorAfter = await dataStore.findDonorProfileByUserId(targetUser._id);
    assert.strictEqual(donorAfter, undefined, 'Donor profile should be removed');

    const userStillExists = await dataStore.findUserById(targetUser._id);
    assert.ok(userStillExists, 'User account should remain intact after deleting only donor profile');
  });

  await t.test('2. DataStore can delete user and cascade clean all related data', async () => {
    // Re-create donor profile and a request
    await dataStore.createDonorProfile({
      userId: targetUser._id,
      name: targetUser.name,
      phone: targetUser.phone,
      bloodGroup: 'B+',
      division: 'dhaka',
      district: 'dhaka'
    });

    const deleted = await dataStore.deleteUser(targetUser._id);
    assert.strictEqual(deleted, true);

    const userAfter = await dataStore.findUserById(targetUser._id);
    assert.strictEqual(userAfter, undefined, 'User account should be deleted');

    const donorAfter = await dataStore.findDonorProfileByUserId(targetUser._id);
    assert.strictEqual(donorAfter, undefined, 'Related donor profile must be deleted');
  });

  await t.test('3. Safety Safeguard: Cannot delete non-existent user', async () => {
    const deleted = await dataStore.deleteUser('non_existent_user_id_12345');
    assert.strictEqual(deleted, false);
  });
});
