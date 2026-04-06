const User = require('../models/userModel');

exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    res.json({ status: 'success', data: { users } });
  } catch (err) {
    next(err);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const targetId = req.params.id;
    const currentAdminId = req.user._id.toString();

    if (targetId === currentAdminId) {
      if (req.body.status === 'inactive' || (req.body.role && req.body.role !== 'admin')) {
        const error = new Error('Security Restriction: You cannot demote or deactivate yourself.');
        error.statusCode = 400;
        return next(error);
      }
    }

    const user = await User.findByIdAndUpdate(targetId, req.body, { 
      returnDocument: 'after', 
      runValidators: true 
    });

    if (!user) return res.status(404).json({ status: 'fail', message: 'User not found' });
    res.json({ status: 'success', data: { user } });
  } catch (err) {
    next(err);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      const error = new Error('Security Restriction: You cannot delete your own account.');
      error.statusCode = 400;
      return next(error);
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ status: 'fail', message: 'User not found' });
    res.status(204).json({ status: 'success', data: null });
  } catch (err) {
    next(err);
  }
};