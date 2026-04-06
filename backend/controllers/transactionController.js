// backend/controllers/transactionController.js
const Transaction = require('../models/transactionModel');

// 1. Get all transactions (Filtering, Search, Classification, Pagination)
exports.getTransactions = async (req, res) => {
  // Destructure 'type' from req.query to handle the classification filter
  const { startDate, endDate, page = 1, limit = 10, search, type } = req.query;
  let query = {};

  // A. Classification Filter (Income/Expense) ✅ ADDED
  if (type && type !== '') {
    query.type = type;
  }

  // B. Advanced Search Logic (Category or Notes)
  if (search) {
    query.$or = [
      { category: { $regex: search, $options: 'i' } },
      { notes: { $regex: search, $options: 'i' } }
    ];
  }

  // C. Date Range Filtering
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Include the entire end day
      query.date.$lte = end;
    }
  }

  // D. Pagination Setup
  const skip = (page - 1) * limit;

  // E. Execute Query
  const transactions = await Transaction.find(query)
    .sort({ date: -1 }) // Show newest records first
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Transaction.countDocuments(query);

  res.status(200).json({ 
    status: 'success', 
    total,
    pages: Math.ceil(total / limit), 
    data: { transactions } 
  });
};

// 2. Create new transaction
exports.createTransaction = async (req, res) => {
  // Automatically attach the user ID of the Admin who created this record
  const tx = await Transaction.create({ 
    ...req.body, 
    createdBy: req.user._id 
  });
  
  res.status(201).json({ 
    status: 'success', 
    data: { transaction: tx } 
  });
};

// 3. Update existing transaction
exports.updateTransaction = async (req, res) => {
  const tx = await Transaction.findByIdAndUpdate(
    req.params.id, 
    req.body, 
    { 
      returnDocument: 'after', // ✅ Modern syntax to avoid Mongoose warnings
      runValidators: true 
    } 
  );

  if (!tx) {
    return res.status(404).json({ status: 'fail', message: 'No transaction found' });
  }

  res.status(200).json({ 
    status: 'success', 
    data: { transaction: tx } 
  });
};

// 4. Delete transaction
exports.deleteTransaction = async (req, res) => {
  const tx = await Transaction.findByIdAndDelete(req.params.id);

  if (!tx) {
    return res.status(404).json({ status: 'fail', message: 'No transaction found' });
  }

  res.status(204).json({ 
    status: 'success', 
    data: null 
  });
};