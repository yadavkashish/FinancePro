const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

exports.protect = async (req, res, next) => {
  try {
    // 1. Check for token in cookies
    let token = req.cookies.jwt;

    // 2. Backup: Check Authorization Header (for Postman/Testing)
    if (!token && req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ error: 'Authentication required. Please login again.' });
    }

    // 3. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 4. Find user
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ error: 'User no longer exists' });
    if (user.status !== 'active') return res.status(403).json({ error: 'Account inactive' });

    req.user = user;
    next();
  } catch (err) {
    console.error("JWT Verification Error:", err.message); // ✅ Check this in Render Logs!
    res.status(401).json({ error: 'Session expired or invalid token' });
  }
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'No permission' });
    }
    next();
  };
};