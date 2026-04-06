// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const { errorHandler } = require('./middlewares/errorMiddleware');

dotenv.config();
const app = express();

// ================= MIDDLEWARE =================
app.use(express.json());
app.use(cookieParser());

// ✅ ENHANCED CORS: Allows both local testing and your live Vercel site
app.use(cors({
  origin: ['http://localhost:5173', 'https://finance-pro-sepia.vercel.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

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
    app.listen(PORT, () => console.log(`🚀 FinancePro API running on port ${PORT}`));
  })
  .catch(err => {
    console.error('❌ Database Connection Error:', err.message);
    process.exit(1);
  });