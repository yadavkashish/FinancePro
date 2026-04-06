// backend/seed.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Transaction = require('./models/transactionModel');
const User = require('./models/userModel');
const bcrypt = require('bcryptjs');

dotenv.config();

const seedData = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  
  // Clear existing
  await Transaction.deleteMany();
  await User.deleteMany();

  // Create Admin
  const hashedPassword = await bcrypt.hash('admin123', 12);
  const admin = await User.create({
    name: 'Test Admin',
    email: 'admin@finance.com',
    password: hashedPassword,
    role: 'admin'
  });

  const categories = ['Salary', 'Rent', 'Freelance', 'Food', 'Stocks', 'Shopping'];
  const data = [];

  // Generate 30 transactions across the last 60 days
  for (let i = 0; i < 30; i++) {
    const isIncome = Math.random() > 0.5;
    const date = new Date();
    date.setDate(date.getDate() - i * 2);

    data.push({
      amount: Math.floor(Math.random() * 5000) + 100,
      type: isIncome ? 'income' : 'expense',
      category: categories[Math.floor(Math.random() * categories.length)],
      date: date,
      notes: `Sample transaction ${i + 1}`,
      createdBy: admin._id
    });
  }

  await Transaction.insertMany(data);
  console.log('✅ Database Seeded Successfully!');
  process.exit();
};

seedData();