require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Mock products data
const mockProducts = [
  { _id: '1', name: 'Whole Milk', price: 1.20, category: 'Dairy', stock: 100, image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400' },
  { _id: '2', name: 'Cheddar Cheese', price: 3.50, category: 'Dairy', stock: 100, image: 'https://images.unsplash.com/photo-1618164436241-4473940d1f5c?w=400' },
  { _id: '3', name: 'Greek Yogurt', price: 2.00, category: 'Dairy', stock: 100, image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400' },
  { _id: '4', name: 'Butter', price: 2.50, category: 'Dairy', stock: 100, image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400' },
  { _id: '5', name: 'White Bread', price: 1.00, category: 'Bakery', stock: 100, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400' },
  { _id: '6', name: 'Croissants', price: 2.50, category: 'Bakery', stock: 100, image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400' },
  { _id: '7', name: 'Bagels', price: 2.00, category: 'Bakery', stock: 100, image: 'https://images.unsplash.com/photo-1584131097598-cf7eca77ff42?w=400' },
  { _id: '8', name: 'Chicken Breast', price: 5.00, category: 'Meat', stock: 100, image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400' },
  { _id: '9', name: 'Ground Beef', price: 4.50, category: 'Meat', stock: 100, image: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=400' },
  { _id: '10', name: 'Pork Chops', price: 6.00, category: 'Meat', stock: 100, image: 'https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=400' },
  { _id: '11', name: 'Basmati Rice', price: 3.00, category: 'Grains', stock: 100, image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400' },
  { _id: '12', name: 'Quinoa', price: 4.00, category: 'Grains', stock: 100, image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400' },
  { _id: '13', name: 'Oats', price: 2.50, category: 'Grains', stock: 100, image: 'https://images.unsplash.com/photo-1574085733277-851d9d856a3a?w=400' },
  { _id: '14', name: 'Carrots', price: 1.50, category: 'Vegetables', stock: 100, image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400' },
  { _id: '15', name: 'Broccoli', price: 2.00, category: 'Vegetables', stock: 100, image: 'https://images.unsplash.com/photo-1583663848850-46af132dc08e?w=400' },
  { _id: '16', name: 'Tomatoes', price: 2.50, category: 'Vegetables', stock: 100, image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400' },
  { _id: '17', name: 'Bell Peppers', price: 3.00, category: 'Vegetables', stock: 100, image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400' },
  { _id: '18', name: 'Olive Oil', price: 7.00, category: 'Oils', stock: 100, image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400' },
  { _id: '19', name: 'Vegetable Oil', price: 4.00, category: 'Oils', stock: 100, image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400' },
  { _id: '20', name: 'Coconut Oil', price: 6.00, category: 'Oils', stock: 100, image: 'https://images.unsplash.com/photo-1520693727906-ff5d0f066a7e?w=400' }
];

// Get all products
app.get('/api/products', (req, res) => {
  res.json(mockProducts);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT} (NO DATABASE MODE)`);
  console.log(`📦 Serving ${mockProducts.length} mock products`);
});
