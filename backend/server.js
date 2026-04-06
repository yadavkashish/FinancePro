// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const { errorHandler } = require('./middlewares/errorMiddleware'); // Import your new handler

dotenv.config();

const app = express();

// ================= MIDDLEWARE =================
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:5173', // Vite Frontend
  credentials: true
}));

// ================= ROUTES =================
const userRoutes = require('./routes/userRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

app.use('/api/v1/users', userRoutes);
app.use('/api/v1/transactions', transactionRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);

// ================= GLOBAL ERROR HANDLING =================
/**
 * ✅ CRITICAL: This must be placed AFTER all routes.
 * It catches every error thrown in your controllers
 * and formats it into a professional JSON response.
 */
app.use(errorHandler);

// ================= DB + SERVER =================
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGODB_URI;

// Better connection handling for professional look
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected Successfully');
    app.listen(PORT, () => {
      console.log(`🚀 FinancePro API running on port ${PORT}`);
      console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  })
  .catch(err => {
    console.error('❌ Database Connection Error:', err.message);
    process.exit(1);
  });