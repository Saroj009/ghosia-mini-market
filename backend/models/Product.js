const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['Dairy', 'Bakery', 'Meat', 'Grains', 'Vegetables', 'Oils', 'Tinned', 'Drinks', 'Spices']
  },
  description: {
    type: String,
    default: ''
  },
  inStock: {
    type: Boolean,
    default: true
  },
  image: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
