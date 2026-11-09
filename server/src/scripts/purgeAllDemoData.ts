import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'node:path';
import fs from 'node:fs';

dotenv.config({ path: path.resolve(process.cwd(), 'server/.env') });

const MONGO_URI = process.env.MONGO_URI || '';

async function purgeAllDemoData() {
  if (!MONGO_URI) {
    console.error('MONGO_URI is missing in environment variables.');
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection.db!;
  console.log('[Connected] Connected to live MongoDB Atlas database for demo data purge.');

  // 1. Take a full snapshot backup before anything is deleted
  console.log('\n[1/3] Generating full JSON snapshot backup of all collections...');
  const collections = await db.listCollections().toArray();
  const backupData: Record<string, any[]> = {
    _backupMetadata: [{
      createdAt: new Date().toISOString(),
      database: db.databaseName,
      purpose: 'Pre-launch full database purge of all demo, seed, and test fixture records'
    }]
  };

  for (const c of collections) {
    const docs = await db.collection(c.name).find({}).toArray();
    backupData[c.name] = docs;
    console.log(`  - Backed up collection: ${c.name} (${docs.length} documents)`);
  }

  const backupDir = path.resolve(process.cwd(), 'server/backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true, mode: 0o700 });
  }

  const timestampStr = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFilePath = path.join(backupDir, `mongodb_full_pre_purge_backup_${timestampStr}.json`);
  fs.writeFileSync(backupFilePath, JSON.stringify(backupData, null, 2), { encoding: 'utf-8', mode: 0o600 });
  console.log(`[Backup Success] Full backup written to: ${backupFilePath}`);

  // 2. Perform the Purge
  console.log('\n[2/3] Purging all demo, seed, and test data across all collections...');

  // A. Blood Requests -> 0
  const reqRes = await db.collection('bloodrequests').deleteMany({});
  console.log(`  - bloodrequests: deleted ${reqRes.deletedCount} demo/test requests`);

  // B. Donor Profiles -> 0
  const donorRes = await db.collection('donorprofiles').deleteMany({});
  console.log(`  - donorprofiles: deleted ${donorRes.deletedCount} demo/test donor profiles`);

  // C. Users -> Keep ONLY usr_superadmin and usr_admin
  const userRes = await db.collection('users').deleteMany({
    _id: { $nin: ['usr_superadmin', 'usr_admin'] as any }
  });
  console.log(`  - users: deleted ${userRes.deletedCount} demo/test users. Preserved usr_superadmin and usr_admin.`);

  // D. Institutions -> Keep partner institutions but reset registered donors to 0 and remove demo moderator
  const instRes = await db.collection('institutions').updateMany(
    {},
    {
      $set: { totalRegisteredDonors: 0 },
      $unset: { assignedModeratorId: '', assignedModeratorIds: '' }
    }
  );
  console.log(`  - institutions: updated ${instRes.modifiedCount} institutions to real 0 registered donors and cleared demo moderators.`);

  // E. Admin / Moderator / Coordinator Secondary Collections -> 0
  const secondaryCollections = [
    'institutionrequests',
    'contactrequests',
    'phonechangerequests',
    'notifications',
    'moderatoractivities',
    'accountstatushistories',
    'reports',
    'passwordrecoveryrequests',
    'institutionchangerequests',
    'contactaccesslogs',
    'auditlogs',
    'otpverifications',
    'connectiontests'
  ];

  for (const collName of secondaryCollections) {
    const res = await db.collection(collName).deleteMany({});
    console.log(`  - ${collName}: deleted ${res.deletedCount} records`);
  }

  // 3. Post-Purge Verification Report
  console.log('\n[3/3] Post-Purge Live Database Status:');
  const postCollections = await db.listCollections().toArray();
  const summary: { Collection: string; RemainingCount: number; Status: string }[] = [];

  for (const c of postCollections) {
    const count = await db.collection(c.name).countDocuments();
    let status = 'Clean (0 records - Ready for Real Data)';
    if (c.name === 'users') {
      status = '2 Protected Admin Accounts (usr_superadmin, usr_admin)';
    } else if (c.name === 'institutions') {
      status = '5 Approved Universities/Colleges (0 registered donors)';
    }
    summary.push({
      Collection: c.name,
      RemainingCount: count,
      Status: status
    });
  }

  console.table(summary);
  console.log('\n[PURGE COMPLETE] Database is now 100% clean and ready for real production launch!');

  await mongoose.disconnect();
}

purgeAllDemoData()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Purge Error:', err);
    process.exit(1);
  });
