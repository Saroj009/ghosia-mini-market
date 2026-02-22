const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ ok: true, store: "Ghosia Mini Market" });
});

app.get("/api/products", (req, res) => {
  res.json([
    { id: 1,  name: "Milk 2L",              price: 1.49, category: "Dairy" },
    { id: 2,  name: "Bread Loaf",           price: 1.19, category: "Bakery" },
    { id: 3,  name: "Eggs 12-pack",         price: 2.29, category: "Dairy" },
    { id: 4,  name: "Basmati Rice 5kg",     price: 8.99, category: "Grains" },
    { id: 5,  name: "Sunflower Oil 1L",     price: 3.49, category: "Oils" },
    { id: 6,  name: "Butter 250g",          price: 1.89, category: "Dairy" },
    { id: 7,  name: "Cheddar Cheese 400g",  price: 3.29, category: "Dairy" },
    { id: 8,  name: "Chicken Breast 1kg",   price: 5.99, category: "Meat" },
    { id: 9,  name: "Lamb Mince 500g",      price: 4.49, category: "Meat" },
    { id: 10, name: "Onions 1kg",           price: 0.89, category: "Vegetables" },
    { id: 11, name: "Tomatoes 6-pack",      price: 1.29, category: "Vegetables" },
    { id: 12, name: "Potatoes 2.5kg",       price: 2.49, category: "Vegetables" },
    { id: 13, name: "Garlic Bulb",          price: 0.49, category: "Vegetables" },
    { id: 14, name: "Ginger Root 200g",     price: 0.79, category: "Vegetables" },
    { id: 15, name: "Chapati Flour 10kg",   price: 9.99, category: "Grains" },
    { id: 16, name: "Lentils Red 2kg",      price: 3.99, category: "Grains" },
    { id: 17, name: "Chickpeas 400g tin",   price: 0.89, category: "Tinned" },
    { id: 18, name: "Chopped Tomatoes tin", price: 0.69, category: "Tinned" },
    { id: 19, name: "Coconut Milk 400ml",   price: 1.29, category: "Tinned" },
    { id: 20, name: "Orange Juice 1L",      price: 1.59, category: "Drinks" },
    { id: 21, name: "Mango Juice 1L",       price: 1.79, category: "Drinks" },
    { id: 22, name: "Yogurt Natural 1kg",   price: 1.99, category: "Dairy" },
    { id: 23, name: "Cumin Seeds 100g",     price: 0.99, category: "Spices" },
    { id: 24, name: "Turmeric Powder 100g", price: 0.89, category: "Spices" },
    { id: 25, name: "Chilli Powder 100g",   price: 0.89, category: "Spices" },
  ]);
});

app.listen(3000, () => {
  console.log("Backend running on http://localhost:3000");
});
