const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const { createSendToken } = require('../utils/tokenUtils');

exports.signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const hashed = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email,
      password: hashed,
      role: role || 'viewer'
    });

    createSendToken(user, 201, res);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ error: 'Inactive account' });
    }

    createSendToken(user, 200, res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10000),
    httpOnly: true
  });

  res.status(200).json({ status: 'success' });
};

exports.getMe = (req, res) => {
  res.status(200).json({ data: { user: req.user } });
};