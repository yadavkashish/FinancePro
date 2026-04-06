const express = require('express');
const { signup, login, logout, getMe } = require('../controllers/authController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');
const { getUsers, updateUser, deleteUser } = require('../controllers/userController');
const { validate } = require('../middlewares/errorMiddleware'); // Import validation

const router = express.Router();

// Public Auth Routes (Apply validation to signup)
router.post('/signup', validate('signup'), signup); // ✅ New Validation Step
router.post('/login', login);
router.get('/logout', logout);
router.get('/me', protect, getMe);

// Admin-Only User Management
router.get('/', protect, restrictTo('admin'), getUsers);
router.put('/:id', protect, restrictTo('admin'), updateUser);
router.delete('/:id', protect, restrictTo('admin'), deleteUser);

module.exports = router;