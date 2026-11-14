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

  const activeSuperAdmins = await db.collection('users').find({ role: 'SUPER_ADMIN', isActive: true, accountStatus: 'active' }).toArray();
  console.log('Total active SUPER_ADMIN accounts in database:', activeSuperAdmins.length);
  activeSuperAdmins.forEach(a => {
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
