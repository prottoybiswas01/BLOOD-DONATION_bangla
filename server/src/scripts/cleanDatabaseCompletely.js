const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function purgeAllTestData() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI is missing');
    process.exit(1);
  }
  await mongoose.connect(uri);
  const db = mongoose.connection.db;

  console.log('--- PURGING TEST/FAKE DATA FROM MONGODB ATLAS ---');

  // 1. Delete all bloodrequests
  const reqRes = await db.collection('bloodrequests').deleteMany({});
  console.log('Deleted bloodrequests:', reqRes.deletedCount);

  // 2. Delete all donorprofiles
  const donorRes = await db.collection('donorprofiles').deleteMany({});
  console.log('Deleted donorprofiles:', donorRes.deletedCount);

  // 3. Delete all phonechangerequests
  const pcrRes = await db.collection('phonechangerequests').deleteMany({});
  console.log('Deleted phonechangerequests:', pcrRes.deletedCount);

  // 4. Delete all institutionchangerequests
  const icrRes = await db.collection('institutionchangerequests').deleteMany({});
  console.log('Deleted institutionchangerequests:', icrRes.deletedCount);

  // 5. Delete all institutions & institutionrequests
  const instRes = await db.collection('institutions').deleteMany({});
  console.log('Deleted institutions:', instRes.deletedCount);
  const instReqRes = await db.collection('institutionrequests').deleteMany({});
  console.log('Deleted institutionrequests:', instReqRes.deletedCount);

  // 6. Delete all auditlogs and contactaccesslogs
  const auditRes = await db.collection('auditlogs').deleteMany({});
  console.log('Deleted auditlogs:', auditRes.deletedCount);
  const contactLogRes = await db.collection('contactaccesslogs').deleteMany({});
  console.log('Deleted contactaccesslogs:', contactLogRes.deletedCount);

  // 7. Delete all users EXCEPT active SUPER_ADMIN accounts
  const userRes = await db.collection('users').deleteMany({
    role: { $ne: 'SUPER_ADMIN' }
  });
  console.log('Deleted non-superadmin users:', userRes.deletedCount);

  // 8. Delete reports, notifications, otpverifications, moderatoractivities, passwordrecoveryrequests, accountstatushistories
  await db.collection('reports').deleteMany({});
  await db.collection('notifications').deleteMany({});
  await db.collection('otpverifications').deleteMany({});
  await db.collection('moderatoractivities').deleteMany({});
  await db.collection('passwordrecoveryrequests').deleteMany({});
  await db.collection('accountstatushistories').deleteMany({});

  console.log('--- REMAINING DOCUMENT COUNTS ---');
  const collections = await db.listCollections().toArray();
  for (const c of collections) {
    const count = await db.collection(c.name).countDocuments();
    console.log(c.name, ':', count);
  }

  const remainingUsers = await db.collection('users').find({}).toArray();
  console.log('Authoritative users in DB:', remainingUsers.map(u => ({ id: u._id, phone: u.phone, role: u.role, name: u.name })));

  await mongoose.disconnect();
}

purgeAllTestData()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Error during purge:', err);
    process.exit(1);
  });

