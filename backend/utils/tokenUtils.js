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
    httpOnly: true, // Defense against XSS
    // ✅ PRODUCTION SETTINGS: Required for Vercel/Cross-site deployment
    secure: true, 
    sameSite: 'none', 
  };

  // Switch back to lax for local development if needed
  if (process.env.NODE_ENV === 'development') {
    cookieOptions.secure = false;
    cookieOptions.sameSite = 'lax';
  }

  user.password = undefined;

  res.cookie('jwt', token, cookieOptions);

  res.status(statusCode).json({
    status: 'success',
    token, // We send token in body too as a backup
    data: { user },
  });
};