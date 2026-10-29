import { connectDB, isDatabaseConnected } from '../config/db.js';
import { UserModel } from '../models/User.js';
import { DonorProfileModel } from '../models/DonorProfile.js';
import { BloodRequestModel } from '../models/BloodRequest.js';
import { InstitutionModel } from '../models/Institution.js';
import { dataStore } from '../services/dataStore.js';

async function runSeed() {
  console.log('Seeding database with Bangladesh Blood Donation Platform demo data...');
  const connected = await connectDB();

  if (!connected) {
    console.log('MongoDB is not running. In-memory data store is pre-seeded and ready.');
    process.exit(0);
  }

  try {
    // Clear existing
    await UserModel.deleteMany({});
    await DonorProfileModel.deleteMany({});
    await BloodRequestModel.deleteMany({});
    await InstitutionModel.deleteMany({});

    console.log('Inserting seed records into MongoDB...');
    for (const u of dataStore.users) {
      await UserModel.create(u);
    }
    for (const i of dataStore.institutions) {
      await InstitutionModel.create(i);
    }
    for (const d of dataStore.donorProfiles) {
      await DonorProfileModel.create(d);
    }
    for (const r of dataStore.bloodRequests) {
      await BloodRequestModel.create(r);
    }

    console.log('Successfully seeded database!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

runSeed();
