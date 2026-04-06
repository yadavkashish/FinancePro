// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const { errorHandler } = require('./middlewares/errorMiddleware');

dotenv.config();
const app = express();


app.set('trust proxy', 1);

// ================= MIDDLEWARE =================
app.use(express.json());
app.use(cookieParser());

// ✅ ENHANCED CORS: Validated for Vercel + Localhost
app.use(cors({
  origin: ['http://localhost:5173', 'https://finance-pro-sepia.vercel.app','https://finance-m7gxtvdub-kashish-yadavs-projects.vercel.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ================= HEALTH CHECK =================
// A "Pro" move: helps you check if the API is alive without logging in
app.get('/health', (req, res) => res.status(200).json({ status: 'active' }));

// ================= ROUTES =================
app.use('/api/v1/users', require('./routes/userRoutes'));
app.use('/api/v1/transactions', require('./routes/transactionRoutes'));
app.use('/api/v1/dashboard', require('./routes/dashboardRoutes'));

// ================= GLOBAL ERROR HANDLING =================
app.use(errorHandler);

// ================= DB + SERVER =================
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB Connected Successfully');
    app.listen(PORT, () => {
      console.log(`🚀 FinancePro API running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ Database Connection Error:', err.message);
    process.exit(1);
  });