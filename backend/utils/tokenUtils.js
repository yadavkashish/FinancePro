// backend/utils/tokenUtils.js
const jwt = require('jsonwebtoken');

exports.signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};



exports.createSendToken = (user, statusCode, res) => {
  const token = exports.signToken(user._id);

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: true,      // Must be true for SameSite: none
    sameSite: 'none',  // Required for cross-site
    path: '/',         // ✅ Explicitly set path to root
  };

  // ✅ Only disable security if we are TRULY on a local dev machine
  // If NODE_ENV is undefined on Render, it might be skipping the secure settings
  if (process.env.NODE_ENV === 'development') {
    cookieOptions.secure = false;
    cookieOptions.sameSite = 'lax';
  }

  user.password = undefined;
  res.cookie('jwt', token, cookieOptions);

  res.status(statusCode).json({
    status: 'success',
    token, 
    data: { user },
  });
};