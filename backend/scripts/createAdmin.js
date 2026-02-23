const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ghosia-mini-market';

async function createAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Admin credentials - CHANGE THESE!
    const adminData = {
      name: 'Admin',
      email: 'admin@ghosia.com',
      password: 'admin123456', // Change this password!
      phone: '+44 7700 900000',
      address: 'Birmingham, UK',
      role: 'admin'
    };

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminData.email });
    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log(`Email: ${existingAdmin.email}`);
      console.log(`Name: ${existingAdmin.name}`);
      
      // Update to admin if not already
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log('\u2705 User upgraded to admin!');
      }
    } else {
      // Create new admin
      const admin = new User(adminData);
      await admin.save();
      console.log('\u2705 Admin user created successfully!');
      console.log(`Email: ${adminData.email}`);
      console.log(`Password: ${adminData.password}`);
      console.log('\u26a0\ufe0f  PLEASE CHANGE THE PASSWORD AFTER FIRST LOGIN!');
    }

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createAdmin();
