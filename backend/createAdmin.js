const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('./models/User');

async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/grocery_db');
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'ghosia5791@gmail.com' });
    
    if (existingAdmin) {
      // Update existing user to admin
      existingAdmin.role = 'admin';
      await existingAdmin.save();
      console.log('✅ Updated existing user to admin role');
    } else {
      // Create new admin user
      const hashedPassword = await bcrypt.hash('Psns@21#', 10);
      
      await User.create({
        name: 'Ghosia Admin',
        email: 'ghosia5791@gmail.com',
        password: hashedPassword,
        role: 'admin',
        phone: '',
        address: ''
      });
      
      console.log('✅ Admin user created successfully!');
    }
    
    console.log('\n🛡️  Admin Login Credentials:');
    console.log('Email: ghosia5791@gmail.com');
    console.log('Password: Psns@21#');
    console.log('\n✨ You can now login as admin!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createAdmin();
