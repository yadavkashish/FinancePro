const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const { createSendToken } = require('../utils/tokenUtils');

exports.signup = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const user = await User.create({
      name,
      email,
      password, // Assuming Mongoose middleware hashes this
      role: role || 'viewer'
    });
    createSendToken(user, 201, res);
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await bcrypt.compare(password, user.password))) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      return next(error);
    }
    createSendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
};

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    secure: true,
    sameSite: 'none'
  });
  res.status(200).json({ status: 'success' });
};

exports.getMe = (req, res) => {
  res.status(200).json({ status: 'success', data: { user: req.user } });
};