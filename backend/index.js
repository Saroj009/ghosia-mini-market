require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware - CORS configuration - ALLOW ALL ORIGINS IN DEVELOPMENT
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, curl)
    if (!origin) return callback(null, true);
    
    // In production, check against FRONTEND_URL
    if (process.env.NODE_ENV === 'production' && process.env.FRONTEND_URL) {
      if (origin === process.env.FRONTEND_URL) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    } else {
      // In development, allow all origins (localhost, 192.168.x.x, etc.)
      callback(null, true);
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

// Multer configuration for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// MongoDB Atlas Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://sjha5791_db_user:jsz2U1xopubxz8tY@cluster0.oaxjmmf.mongodb.net/grocery_db?retryWrites=true&w=majority';

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
  image: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-change-in-production';

if (!process.env.JWT_SECRET) {
  console.warn('⚠️  WARNING: JWT_SECRET not set in environment variables! Using fallback.');
}

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
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
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
        role: user.role,
        isAdmin: user.role === 'admin'
      }
    });
  } catch (error) {
    console.error('Register error:', error);
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
        role: user.role,
        isAdmin: user.role === 'admin'
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get current user
app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    res.json({
      ...user.toObject(),
      isAdmin: user.role === 'admin'
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: error.message });
  }
});

// IMAGE UPLOAD endpoint
app.post('/api/admin/upload', authMiddleware, adminMiddleware, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const backendUrl = process.env.BACKEND_URL || `http://localhost:${PORT}`;
    const imageUrl = `${backendUrl}/uploads/${req.file.filename}`;
    console.log('Image uploaded:', imageUrl);
    
    res.json({ imageUrl });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ADMIN: Create product
app.post('/api/admin/products', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, price, category, stock, image } = req.body;
    console.log('Creating product:', { name, price, category, stock, image });
    
    const product = await Product.create({ 
      name, 
      price: parseFloat(price), 
      category, 
      stock: parseInt(stock),
      image: image || ''
    });
    
    console.log('Product created:', product);
    res.json(product);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ADMIN: Update product
app.put('/api/admin/products/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, price, category, stock, image } = req.body;
    console.log('Updating product:', req.params.id, { name, price, category, stock, image });
    
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { 
        name, 
        price: parseFloat(price), 
        category, 
        stock: parseInt(stock),
        image: image || ''
      },
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    console.log('Product updated:', product);
    res.json(product);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ADMIN: Delete product
app.delete('/api/admin/products/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    console.log('Deleting product:', req.params.id);
    
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Delete associated image file if it exists and is a local file
    if (product.image && product.image.includes('/uploads/')) {
      const filename = product.image.split('/uploads/')[1];
      const filepath = path.join(uploadsDir, filename);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
        console.log('Deleted image file:', filename);
      }
    }
    
    console.log('Product deleted:', product);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create default admin user if none exists
async function createDefaultAdmin() {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        name: 'Admin',
        email: 'admin@ghosia.com',
        password: hashedPassword,
        role: 'admin',
        phone: '0000000000',
        address: 'Ghosia Mini Market, Birmingham'
      });
      console.log('✅ Default admin user created');
      console.log('📧 Admin Email: admin@ghosia.com');
      console.log('🔑 Admin Password: admin123');
    }
  } catch (error) {
    console.error('Create admin error:', error);
  }
}

// Seed initial products if none exist
async function seedProducts() {
  try {
    const count = await Product.countDocuments();
    if (count === 0) {
      const products = [
        { name: 'Whole Milk', price: 1.90, category: 'Dairy', image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400' },
        { name: 'Cheddar Cheese', price: 3.50, category: 'Dairy', image: 'https://images.unsplash.com/photo-1618164436241-4473940d1f5c?w=400' },
        { name: 'Greek Yogurt', price: 2.00, category: 'Dairy', image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400' },
        { name: 'Butter', price: 2.50, category: 'Dairy', image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400' },
        { name: 'White Bread', price: 1.00, category: 'Bakery', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400' },
        { name: 'Croissants', price: 2.50, category: 'Bakery', image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400' },
        { name: 'Bagels', price: 2.00, category: 'Bakery', image: 'https://images.unsplash.com/photo-1584131097598-cf7eca77ff42?w=400' },
        { name: 'Chicken Breast', price: 5.00, category: 'Meat', image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400' },
        { name: 'Ground Beef', price: 4.50, category: 'Meat', image: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=400' },
        { name: 'Pork Chops', price: 6.00, category: 'Meat', image: 'https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=400' },
        { name: 'Basmati Rice', price: 3.00, category: 'Grains', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400' },
        { name: 'Quinoa', price: 4.00, category: 'Grains', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400' },
        { name: 'Oats', price: 2.50, category: 'Grains', image: 'https://images.unsplash.com/photo-1574085733277-851d9d856a3a?w=400' },
        { name: 'Carrots', price: 1.50, category: 'Vegetables', image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400' },
        { name: 'Broccoli', price: 2.00, category: 'Vegetables', image: 'https://images.unsplash.com/photo-1583663848850-46af132dc08e?w=400' },
        { name: 'Tomatoes', price: 2.50, category: 'Vegetables', image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400' },
        { name: 'Bell Peppers', price: 3.00, category: 'Vegetables', image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400' },
        { name: 'Olive Oil', price: 7.00, category: 'Oils', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400' },
        { name: 'Vegetable Oil', price: 4.00, category: 'Oils', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400' },
        { name: 'Coconut Oil', price: 6.00, category: 'Oils', image: 'https://images.unsplash.com/photo-1520693727906-ff5d0f066a7e?w=400' },
        { name: 'Baked Beans', price: 1.50, category: 'Tinned', image: 'https://images.unsplash.com/photo-1571942676516-bcab84649e44?w=400' },
        { name: 'Tomato Soup', price: 2.00, category: 'Tinned', image: 'https://images.unsplash.com/photo-1603105037880-880cd4edfb0d?w=400' },
        { name: 'Tuna', price: 3.00, category: 'Tinned', image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400' },
        { name: 'Orange Juice', price: 3.50, category: 'Drinks', image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400' },
        { name: 'Cola', price: 2.00, category: 'Drinks', image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400' },
        { name: 'Sparkling Water', price: 1.50, category: 'Drinks', image: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=400' },
        { name: 'Black Pepper', price: 2.50, category: 'Spices', image: 'https://images.unsplash.com/photo-1599909533730-f80e2c3b3f05?w=400' },
        { name: 'Turmeric', price: 3.00, category: 'Spices', image: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=400' },
        { name: 'Cumin', price: 2.50, category: 'Spices', image: 'https://images.unsplash.com/photo-1596040033229-a0b548b2f047?w=400' }
      ];
      await Product.insertMany(products);
      console.log('✅ Products seeded successfully');
    }
  } catch (error) {
    console.error('Seed products error:', error);
  }
}

// Initialize data
async function initializeData() {
  await createDefaultAdmin();
  await seedProducts();
}

initializeData();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 CORS: Allowing all origins in development mode`);
  console.log(``);
  console.log(`📝 DEFAULT ADMIN CREDENTIALS:`);
  console.log(`   Email: admin@ghosia.com`);
  console.log(`   Password: admin123`);
  console.log(``);
});
