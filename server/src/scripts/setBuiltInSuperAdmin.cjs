const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function updateDbSuperAdmin() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI is missing');
    process.exit(1);
  }
  await mongoose.connect(uri);
  const db = mongoose.connection.db;

  const passwordHash = bcrypt.hashSync('Admin@123456', 10);
  const now = new Date();

  // Delete any user with 01978167016 to ensure user can register fresh
  const del = await db.collection('users').deleteMany({ phone: '01978167016' });
  console.log('Removed 01978167016 users to allow fresh registration:', del.deletedCount);

  // Upsert the built-in super admin
  await db.collection('users').updateOne(
    { _id: 'usr_superadmin' },
    {
      $set: {
        _id: 'usr_superadmin',
        name: 'সুপার অ্যাডমিন (Super Admin)',
        phone: '01700000000',
        email: 'admin@bloodbd.org',
        passwordHash: passwordHash,
        role: 'SUPER_ADMIN',
        accountStatus: 'active',
        gender: 'male',
        isActive: true,
        isPhoneVerified: true,
        updatedAt: now
      },
      $setOnInsert: {
        createdAt: now
      }
    },
    { upsert: true }
  );

  const adminInDb = await db.collection('users').findOne({ _id: 'usr_superadmin' });
  console.log('Built-in Super Admin in MongoDB Atlas:');
  console.log({
    _id: adminInDb._id,
    phone: adminInDb.phone,
    role: adminInDb.role,
    name: adminInDb.name,
    email: adminInDb.email
  });

  const totalUsers = await db.collection('users').find({}).toArray();
  console.log('Total users in DB:', totalUsers.length);

  await mongoose.disconnect();
}

updateDbSuperAdmin()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
