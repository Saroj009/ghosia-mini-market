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

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (process.env.NODE_ENV === 'production' && process.env.FRONTEND_URL) {
      if (origin === process.env.FRONTEND_URL) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    } else {
      callback(null, true);
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
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

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://sjha5791_db_user:jsz2U1xopubxz8tY@cluster0.oaxjmmf.mongodb.net/grocery_db?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

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

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  stock: { type: Number, default: 100 },
  image: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  customerPhone: { type: String, required: true },
  deliveryAddress: { type: String, required: true },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    price: Number,
    quantity: Number,
    image: String
  }],
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  promoCode: String,
  status: { type: String, default: 'pending', enum: ['pending', 'processing', 'completed', 'cancelled'] },
  paymentMethod: { type: String, default: 'cash' },
  createdAt: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', orderSchema);

const reviewSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  customerName: { type: String, required: true },
  customerEmail: String,
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Review = mongoose.model('Review', reviewSchema);

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-change-in-production';

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

const adminMiddleware = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword, phone, address });
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, isAdmin: user.role === 'admin' }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) return res.status(400).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, isAdmin: user.role === 'admin' }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    res.json({ ...user.toObject(), isAdmin: user.role === 'admin' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/upload', authMiddleware, adminMiddleware, upload.single('image'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const backendUrl = process.env.BACKEND_URL || `http://localhost:${PORT}`;
    const imageUrl = `${backendUrl}/uploads/${req.file.filename}`;
    res.json({ imageUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/products', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, price, category, stock, image } = req.body;
    const product = await Product.create({ 
      name, price: parseFloat(price), category, stock: parseInt(stock), image: image || ''
    });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/products/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, price, category, stock, image } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { name, price: parseFloat(price), category, stock: parseInt(stock), image: image || '' },
      { new: true, runValidators: true }
    );
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/products/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    if (product.image && product.image.includes('/uploads/')) {
      const filename = product.image.split('/uploads/')[1];
      const filepath = path.join(uploadsDir, filename);
      if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CREATE ORDER ENDPOINT
app.post('/api/orders', async (req, res) => {
  try {
    const { customerName, customerEmail, customerPhone, deliveryAddress, items, subtotal, discount, total, promoCode } = req.body;
    let userId = null;
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        userId = decoded.userId;
      } catch (err) {}
    }
    const order = await Order.create({
      userId, customerName, customerEmail, customerPhone, deliveryAddress, items, subtotal, discount, total, promoCode
    });
    console.log('✅ Order created:', order._id);
    res.json({ success: true, orderId: order._id, order });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET ALL ORDERS (ADMIN)
app.get('/api/admin/orders', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).populate('userId', 'name email');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET MY ORDERS (CUSTOMER)
app.get('/api/orders/my-orders', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE ORDER STATUS (ADMIN)
app.put('/api/admin/orders/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CREATE REVIEW ENDPOINT
app.post('/api/reviews', async (req, res) => {
  try {
    const { productId, customerName, customerEmail, rating, comment } = req.body;
    let userId = null;
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        userId = decoded.userId;
      } catch (err) {}
    }
    const review = await Review.create({
      productId, userId, customerName, customerEmail, rating: parseInt(rating), comment
    });
    console.log('✅ Review created:', review._id);
    res.json({ success: true, review });
  } catch (error) {
    console.error('Review creation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET ALL REVIEWS
app.get('/api/reviews', async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 }).populate('productId', 'name image');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET REVIEWS BY PRODUCT
app.get('/api/reviews/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE REVIEW (ADMIN)
app.delete('/api/admin/reviews/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ error: 'Review not found' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

async function createDefaultAdmin() {
  try {
    await User.deleteMany({ role: 'admin' });
    const hashedPassword = await bcrypt.hash('ghosia123456', 10);
    await User.create({
      name: 'Ghosia Admin',
      email: 'ghosia@gmail.com',
      password: hashedPassword,
      role: 'admin',
      phone: '0000000000',
      address: 'Ghosia Mini Market, Birmingham'
    });
    console.log('✅ Admin: ghosia@gmail.com / ghosia123456');
  } catch (error) {
    console.error('Admin error:', error);
  }
}

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
      console.log('✅ Products seeded');
    }
  } catch (error) {
    console.error('Seed error:', error);
  }
}

async function initializeData() {
  await createDefaultAdmin();
  await seedProducts();
}

initializeData();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n✅ Server running on port ${PORT}`);
  console.log(`📦 Orders & Reviews: ENABLED\n`);
});