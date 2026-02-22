const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Atlas Connection
const MONGODB_URI = 'mongodb+srv://sjha5791_db_user:jsz2U1xopubxz8tY@cluster0.oaxjmmf.mongodb.net/grocery_db?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB Atlas connected successfully'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

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

// Product Schema
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  stock: { type: Number, default: 100 },
  createdAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);

// JWT Secret
const JWT_SECRET = 'your-secret-key-change-in-production';

// Auth Middleware
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });
    
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Admin Middleware
const adminMiddleware = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Routes

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      address
    });
    
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get current user
app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ADMIN: Create product
app.post('/api/admin/products', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, price, category, stock } = req.body;
    const product = await Product.create({ name, price, category, stock });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ADMIN: Update product
app.put('/api/admin/products/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, price, category, stock } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { name, price, category, stock },
      { new: true }
    );
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ADMIN: Delete product
app.delete('/api/admin/products/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Seed initial products if none exist
async function seedProducts() {
  const count = await Product.countDocuments();
  if (count === 0) {
    const products = [
      { name: 'Whole Milk', price: 1.20, category: 'Dairy' },
      { name: 'Cheddar Cheese', price: 3.50, category: 'Dairy' },
      { name: 'Greek Yogurt', price: 2.00, category: 'Dairy' },
      { name: 'Butter', price: 2.50, category: 'Dairy' },
      { name: 'White Bread', price: 1.00, category: 'Bakery' },
      { name: 'Croissants', price: 2.50, category: 'Bakery' },
      { name: 'Bagels', price: 2.00, category: 'Bakery' },
      { name: 'Chicken Breast', price: 5.00, category: 'Meat' },
      { name: 'Ground Beef', price: 4.50, category: 'Meat' },
      { name: 'Pork Chops', price: 6.00, category: 'Meat' },
      { name: 'Basmati Rice', price: 3.00, category: 'Grains' },
      { name: 'Quinoa', price: 4.00, category: 'Grains' },
      { name: 'Oats', price: 2.50, category: 'Grains' },
      { name: 'Carrots', price: 1.50, category: 'Vegetables' },
      { name: 'Broccoli', price: 2.00, category: 'Vegetables' },
      { name: 'Tomatoes', price: 2.50, category: 'Vegetables' },
      { name: 'Bell Peppers', price: 3.00, category: 'Vegetables' },
      { name: 'Olive Oil', price: 7.00, category: 'Oils' },
      { name: 'Vegetable Oil', price: 4.00, category: 'Oils' },
      { name: 'Coconut Oil', price: 6.00, category: 'Oils' },
      { name: 'Baked Beans', price: 1.50, category: 'Tinned' },
      { name: 'Tomato Soup', price: 2.00, category: 'Tinned' },
      { name: 'Tuna', price: 3.00, category: 'Tinned' },
      { name: 'Orange Juice', price: 3.50, category: 'Drinks' },
      { name: 'Cola', price: 2.00, category: 'Drinks' },
      { name: 'Sparkling Water', price: 1.50, category: 'Drinks' },
      { name: 'Black Pepper', price: 2.50, category: 'Spices' },
      { name: 'Turmeric', price: 3.00, category: 'Spices' },
      { name: 'Cumin', price: 2.50, category: 'Spices' }
    ];
    await Product.insertMany(products);
    console.log('✅ Products seeded successfully');
  }
}

seedProducts();

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});