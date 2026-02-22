const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

// MongoDB Atlas Connection
const MONGODB_URI = 'mongodb+srv://sjha5791_db_user:jsz2U1xopubxz8tY@cluster0.oaxjmmf.mongodb.net/grocery_db?retryWrites=true&w=majority';

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'customer', enum: ['customer', 'admin'] },
  phone: String,
  address: String,
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function createAdmin() {
  try {
    // Connect to MongoDB Atlas
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');

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
