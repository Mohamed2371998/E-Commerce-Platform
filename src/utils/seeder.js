require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/database');
const User = require('../models/User');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');

// Sample data
const users = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: '123456',
    role: 'admin',
  },
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: '123456',
    role: 'user',
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: '123456',
    role: 'user',
  },
  {
    name: 'Vendor One',
    email: 'vendor@example.com',
    password: '123456',
    role: 'vendor',
  },
];

const products = [
  {
    name: 'Wireless Bluetooth Headphones',
    description: 'Premium wireless headphones with noise cancellation and 30-hour battery life.',
    price: 99.99,
    comparePrice: 149.99,
    images: ['https://via.placeholder.com/500x500?text=Headphones'],
    category: 'Electronics',
    brand: 'AudioTech',
    inventory: {
      quantity: 50,
      lowStockThreshold: 10,
    },
    tags: ['wireless', 'bluetooth', 'audio', 'headphones'],
    isFeatured: true,
  },
  {
    name: 'Smart Watch Pro',
    description: 'Advanced fitness tracking, heart rate monitor, and smartphone notifications.',
    price: 249.99,
    comparePrice: 299.99,
    images: ['https://via.placeholder.com/500x500?text=Smart+Watch'],
    category: 'Electronics',
    brand: 'TechGear',
    inventory: {
      quantity: 30,
      lowStockThreshold: 5,
    },
    tags: ['smartwatch', 'fitness', 'wearable'],
    isFeatured: true,
  },
  {
    name: 'Running Shoes',
    description: 'Lightweight running shoes with cushioned sole for maximum comfort.',
    price: 79.99,
    images: ['https://via.placeholder.com/500x500?text=Running+Shoes'],
    category: 'Sports',
    brand: 'SportMax',
    inventory: {
      quantity: 100,
      lowStockThreshold: 20,
    },
    tags: ['shoes', 'running', 'sports', 'fitness'],
  },
  {
    name: 'Organic Cotton T-Shirt',
    description: '100% organic cotton t-shirt, soft and comfortable for everyday wear.',
    price: 29.99,
    images: ['https://via.placeholder.com/500x500?text=T-Shirt'],
    category: 'Fashion',
    brand: 'EcoWear',
    inventory: {
      quantity: 200,
      lowStockThreshold: 30,
    },
    tags: ['clothing', 'organic', 'cotton', 'tshirt'],
  },
  {
    name: 'Coffee Maker',
    description: 'Programmable coffee maker with thermal carafe and auto-brew feature.',
    price: 89.99,
    comparePrice: 119.99,
    images: ['https://via.placeholder.com/500x500?text=Coffee+Maker'],
    category: 'Home & Garden',
    brand: 'BrewMaster',
    inventory: {
      quantity: 25,
      lowStockThreshold: 5,
    },
    tags: ['coffee', 'kitchen', 'appliance'],
    isFeatured: true,
  },
  {
    name: 'Yoga Mat',
    description: 'Non-slip yoga mat with extra cushioning for comfortable practice.',
    price: 34.99,
    images: ['https://via.placeholder.com/500x500?text=Yoga+Mat'],
    category: 'Sports',
    brand: 'ZenFit',
    inventory: {
      quantity: 75,
      lowStockThreshold: 15,
    },
    tags: ['yoga', 'fitness', 'mat', 'exercise'],
  },
];

const coupons = [
  {
    code: 'WELCOME10',
    description: '10% off your first order',
    discountType: 'percentage',
    discountValue: 10,
    minimumPurchase: 0,
    startDate: new Date(),
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
  },
  {
    code: 'SAVE20',
    description: '$20 off orders over $100',
    discountType: 'fixed',
    discountValue: 20,
    minimumPurchase: 100,
    startDate: new Date(),
    endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
  },
];

// Import data
const importData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany();
    await Product.deleteMany();
    await Coupon.deleteMany();

    // Create users
    const createdUsers = await User.insertMany(users);
    const adminUser = createdUsers[0]._id;
    const vendorUser = createdUsers[3]._id;

    // Add vendor to products
    const sampleProducts = products.map((product) => ({
      ...product,
      vendor: vendorUser,
    }));

    // Create products
    await Product.insertMany(sampleProducts);

    // Create coupons
    await Coupon.insertMany(coupons);

    console.log('Data imported successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Destroy data
const destroyData = async () => {
  try {
    await connectDB();

    await User.deleteMany();
    await Product.deleteMany();
    await Cart.deleteMany();
    await Order.deleteMany();
    await Coupon.deleteMany();

    console.log('Data destroyed successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Run based on command
if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
