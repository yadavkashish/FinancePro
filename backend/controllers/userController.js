// backend/controllers/userController.js
const User = require('../models/userModel');

// 1. Get all users
exports.getUsers = async (req, res) => {
  const users = await User.find();
  res.json({ status: 'success', data: { users } });
};

// 2. Update User (With Self-Protection Logic)
exports.updateUser = async (req, res) => {
  const targetId = req.params.id;
  const currentAdminId = req.user._id.toString();

  // CHECK: Is the Admin trying to change their own status or role?
  if (targetId === currentAdminId) {
    // Prevent making themselves inactive
    if (req.body.status === 'inactive') {
      return res.status(400).json({ 
        status: 'fail', 
        message: 'Security Restriction: You cannot deactivate your own admin account.' 
      });
    }

    // Optional: Prevent changing their own role (e.g., demoting self to viewer)
    if (req.body.role && req.body.role !== 'admin') {
      return res.status(400).json({ 
        status: 'fail', 
        message: 'Security Restriction: You cannot change your own administrative role.' 
      });
    }
  }

  const user = await User.findByIdAndUpdate(
    targetId, 
    req.body, 
    { returnDocument: 'after', runValidators: true }
  );

  if (!user) {
    return res.status(404).json({ status: 'fail', message: 'User not found' });
  }

  res.json({ status: 'success', data: { user } });
};

// 3. Delete User (With Self-Protection Logic)
exports.deleteUser = async (req, res) => {
  const targetId = req.params.id;
  const currentAdminId = req.user._id.toString();

  // CHECK: Is the Admin trying to delete themselves?
  if (targetId === currentAdminId) {
    return res.status(400).json({ 
      status: 'fail', 
      message: 'Security Restriction: You cannot delete your own account while logged in.' 
    });
  }

  const user = await User.findByIdAndDelete(targetId);

  if (!user) {
    return res.status(404).json({ status: 'fail', message: 'User not found' });
  }

  res.status(204).json({ status: 'success', data: null });
};