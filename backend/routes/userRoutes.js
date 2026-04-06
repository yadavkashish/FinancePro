const express = require('express');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/errorMiddleware');

const router = express.Router();

// --- AUTH ---
router.post('/signup', validate('signup'), authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

// --- PROTECTED ---
router.use(protect);
router.get('/me', authController.getMe);

// --- ADMIN ONLY ---
router.use(restrictTo('admin'));
router.get('/', userController.getUsers);
router.route('/:id')
  .put(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;