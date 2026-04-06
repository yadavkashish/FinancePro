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
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true, // Prevents XSS attacks
    secure: process.env.NODE_ENV === 'production', // Only sends over HTTPS in production
    sameSite: 'lax',
  };

  user.password = undefined; // Remove password from response

  res.cookie('jwt', token, cookieOptions);

  res.status(statusCode).json({
    status: 'success',
    token,
    data: { user },
  });
};