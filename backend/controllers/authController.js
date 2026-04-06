// backend/controllers/userController.js (Auth logic)
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const { createSendToken } = require('../utils/tokenUtils');

exports.signup = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Password hashing (if not handled by Mongoose pre-save middleware)
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'viewer'
    });

    createSendToken(user, 201, res);
  } catch (err) {
    next(err); // ✅ Passes to global error handler
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      const error = new Error('Please provide email and password');
      error.statusCode = 400;
      return next(error);
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await bcrypt.compare(password, user.password))) {
      const error = new Error('Incorrect email or password');
      error.statusCode = 401;
      return next(error);
    }

    if (user.status !== 'active') {
      const error = new Error('Your account is currently inactive');
      error.statusCode = 403;
      return next(error);
    }

    createSendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
};

exports.logout = (req, res) => {
  // Use sameSite: 'none' and secure: true even for logout to ensure the browser clears it
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    secure: true,
    sameSite: 'none'
  });

  res.status(200).json({ status: 'success' });
};