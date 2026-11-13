const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function verify() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI missing');
    process.exit(1);
  }
  await mongoose.connect(uri);
  const db = mongoose.connection.db;

  const superAdminPhone = process.env.SUPER_ADMIN_PHONE;
  const superAdminPass = process.env.SUPER_ADMIN_PASSWORD;

  if (!superAdminPhone || !superAdminPass) {
    console.error('[Security] SUPER_ADMIN_PHONE and SUPER_ADMIN_PASSWORD must be configured in your private .env file.');
    process.exit(1);
  }
  const passwordHash = bcrypt.hashSync(superAdminPass, 10);

  // Remove any conflicting superadmins with different phone
  const delRes = await db.collection('users').deleteMany({
    role: 'SUPER_ADMIN',
    phone: { $ne: superAdminPhone }
  });
  console.log('Old superadmins removed:', delRes.deletedCount);

  // Upsert the single authoritative superadmin
  await db.collection('users').updateOne(
    { _id: 'usr_superadmin' },
    {
      $set: {
        name: process.env.SUPER_ADMIN_NAME || 'সুপার অ্যাডমিন (Super Admin)',
        phone: superAdminPhone,
        email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@bloodbd.org',
        passwordHash: passwordHash,
        role: 'SUPER_ADMIN',
        accountStatus: 'active',
        gender: 'male',
        isActive: true,
        isPhoneVerified: true,
        updatedAt: new Date()
      },
      $setOnInsert: {
        createdAt: new Date()
      }
    },
    { upsert: true }
  );

  const allAdmins = await db.collection('users').find({ role: 'SUPER_ADMIN' }).toArray();
  console.log('Total SUPER_ADMIN accounts in database:', allAdmins.length);
  allAdmins.forEach(a => {
    console.log({ id: a._id, phone: a.phone, email: a.email, role: a.role, name: a.name });
  });

  await mongoose.disconnect();
}

verify()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
