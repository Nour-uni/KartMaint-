// Run this once to create your first admin account.
// Usage: node seed-admin.js

require('dotenv').config();
const sequelize = require('./config/database');
const User = require('./models/User');
const { hashPassword } = require('./utils/password');

async function seedAdmin() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database');

    await sequelize.sync({ alter: true });

    const email = 'admin@kartmaint.com';       // change this to your real email if you want
    const plainPassword = 'Admin123!';          // change this, then log in and it won't ask you to change it again

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      console.log('⚠️  An account with this email already exists. Nothing created.');
      process.exit(0);
    }

    const hashedPassword = await hashPassword(plainPassword);

    const admin = await User.create({
      fullName: 'Admin',
      email,
      password: hashedPassword,
      role: 'admin',
      mustChangePassword: false, // skip forced change for this first seeded account
    });

    console.log('✅ Admin account created:');
    console.log(`   Email: ${admin.email}`);
    console.log(`   Password: ${plainPassword}`);
    console.log('   You can now log in with these credentials.');

    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to seed admin:', err.message);
    process.exit(1);
  }
}

seedAdmin();