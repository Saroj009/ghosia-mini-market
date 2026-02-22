require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Product = require('./models/Product');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ghosia-market');
    console.log('✅ MongoDB connected successfully');
    
    // Seed initial products if database is empty
    const count = await Product.countDocuments();
    if (count === 0) {
      console.log('📦 Seeding initial products...');
      await seedProducts();
    }
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.log('⚠️  Running without database - using fallback data');
  }
};

// Seed function
const seedProducts = async () => {
  const initialProducts = [
    { name: "Milk 2L", price: 1.49, category: "Dairy" },
    { name: "Bread Loaf", price: 1.19, category: "Bakery" },
    { name: "Eggs 12-pack", price: 2.29, category: "Dairy" },
    { name: "Basmati Rice 5kg", price: 8.99, category: "Grains" },
    { name: "Sunflower Oil 1L", price: 3.49, category: "Oils" },
    { name: "Butter 250g", price: 1.89, category: "Dairy" },
    { name: "Cheddar Cheese 400g", price: 3.29, category: "Dairy" },
    { name: "Chicken Breast 1kg", price: 5.99, category: "Meat" },
    { name: "Lamb Mince 500g", price: 4.49, category: "Meat" },
    { name: "Onions 1kg", price: 0.89, category: "Vegetables" },
    { name: "Tomatoes 6-pack", price: 1.29, category: "Vegetables" },
    { name: "Potatoes 2.5kg", price: 2.49, category: "Vegetables" },
    { name: "Garlic Bulb", price: 0.49, category: "Vegetables" },
    { name: "Ginger Root 200g", price: 0.79, category: "Vegetables" },
    { name: "Chapati Flour 10kg", price: 9.99, category: "Grains" },
    { name: "Lentils Red 2kg", price: 3.99, category: "Grains" },
    { name: "Chickpeas 400g tin", price: 0.89, category: "Tinned" },
    { name: "Chopped Tomatoes tin", price: 0.69, category: "Tinned" },
    { name: "Coconut Milk 400ml", price: 1.29, category: "Tinned" },
    { name: "Orange Juice 1L", price: 1.59, category: "Drinks" },
    { name: "Mango Juice 1L", price: 1.79, category: "Drinks" },
    { name: "Yogurt Natural 1kg", price: 1.99, category: "Dairy" },
    { name: "Cumin Seeds 100g", price: 0.99, category: "Spices" },
    { name: "Turmeric Powder 100g", price: 0.89, category: "Spices" },
    { name: "Chilli Powder 100g", price: 0.89, category: "Spices" },
  ];

  try {
    await Product.insertMany(initialProducts);
    console.log('✅ Products seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding products:', error.message);
  }
};

// Fallback data for when DB is not connected
const fallbackProducts = [
  { id: 1, name: "Milk 2L", price: 1.49, category: "Dairy" },
  { id: 2, name: "Bread Loaf", price: 1.19, category: "Bakery" },
  { id: 3, name: "Eggs 12-pack", price: 2.29, category: "Dairy" },
  { id: 4, name: "Basmati Rice 5kg", price: 8.99, category: "Grains" },
  { id: 5, name: "Sunflower Oil 1L", price: 3.49, category: "Oils" },
  { id: 6, name: "Butter 250g", price: 1.89, category: "Dairy" },
  { id: 7, name: "Cheddar Cheese 400g", price: 3.29, category: "Dairy" },
  { id: 8, name: "Chicken Breast 1kg", price: 5.99, category: "Meat" },
  { id: 9, name: "Lamb Mince 500g", price: 4.49, category: "Meat" },
  { id: 10, name: "Onions 1kg", price: 0.89, category: "Vegetables" },
  { id: 11, name: "Tomatoes 6-pack", price: 1.29, category: "Vegetables" },
  { id: 12, name: "Potatoes 2.5kg", price: 2.49, category: "Vegetables" },
  { id: 13, name: "Garlic Bulb", price: 0.49, category: "Vegetables" },
  { id: 14, name: "Ginger Root 200g", price: 0.79, category: "Vegetables" },
  { id: 15, name: "Chapati Flour 10kg", price: 9.99, category: "Grains" },
  { id: 16, name: "Lentils Red 2kg", price: 3.99, category: "Grains" },
  { id: 17, name: "Chickpeas 400g tin", price: 0.89, category: "Tinned" },
  { id: 18, name: "Chopped Tomatoes tin", price: 0.69, category: "Tinned" },
  { id: 19, name: "Coconut Milk 400ml", price: 1.29, category: "Tinned" },
  { id: 20, name: "Orange Juice 1L", price: 1.59, category: "Drinks" },
  { id: 21, name: "Mango Juice 1L", price: 1.79, category: "Drinks" },
  { id: 22, name: "Yogurt Natural 1kg", price: 1.99, category: "Dairy" },
  { id: 23, name: "Cumin Seeds 100g", price: 0.99, category: "Spices" },
  { id: 24, name: "Turmeric Powder 100g", price: 0.89, category: "Spices" },
  { id: 25, name: "Chilli Powder 100g", price: 0.89, category: "Spices" },
];

// Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    ok: true, 
    store: 'Ghosia Mini Market',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

app.get('/api/products', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      // Database is connected
      const products = await Product.find({ inStock: true });
      // Convert MongoDB documents to match frontend format
      const formattedProducts = products.map(p => ({
        id: p._id.toString(),
        name: p.name,
        price: p.price,
        category: p.category
      }));
      res.json(formattedProducts);
    } else {
      // Fallback to static data
      res.json(fallbackProducts);
    }
  } catch (error) {
    console.error('Error fetching products:', error);
    res.json(fallbackProducts);
  }
});

// Routes for orders (when DB is connected)
const orderRoutes = require('./routes/orders');
app.use('/api/orders', orderRoutes);

// Admin routes for products (when DB is connected)
const productRoutes = require('./routes/products');
app.use('/api/admin/products', productRoutes);

// Start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Backend running on http://localhost:${PORT}`);
    console.log(`📍 Location: Birmingham, UK`);
    console.log(`🛒 Store: Ghosia Mini Market`);
  });
});
