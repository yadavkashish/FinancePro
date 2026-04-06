// backend/routes/transactionRoutes.js
const express = require('express');
const controller = require('../controllers/transactionController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/errorMiddleware');

const router = express.Router();

router.use(protect);

// CREATE
router.post(
  '/', 
  restrictTo('admin'), 
  validate('transaction'), 
  controller.createTransaction
);

// READ
router.get('/', restrictTo('admin', 'analyst'), controller.getTransactions);

// UPDATE (✅ Added Validation here)
router.put(
  '/:id', 
  restrictTo('admin'), 
  validate('transaction'), 
  controller.updateTransaction
);

// DELETE
router.delete('/:id', restrictTo('admin'), controller.deleteTransaction);

module.exports = router;