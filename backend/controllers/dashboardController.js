const Transaction = require('../models/transactionModel');

exports.getSummary = async (req, res) => {
  try {
    // 1. Calculate Totals
    const totals = await Transaction.aggregate([
      {
        $group: {
          _id: null,
          income: { $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] } },
          expense: { $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] } }
        }
      }
    ]);

    const summary = totals[0] || { income: 0, expense: 0 };

    // 2. Monthly Trends (For the Chart)
    const trends = await Transaction.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$date" } },
          income: { $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] } },
          expense: { $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] } }
        }
      },
      { $sort: { "_id": 1 } },
      { $limit: 6 }
    ]);

    // 3. Expenses by Category (For the Progress Bars)
    const expensesByCategory = await Transaction.aggregate([
      { $match: { type: 'expense' } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
      { $sort: { total: -1 } }
    ]);

    // 4. Recent Activity
    const recentActivity = await Transaction.find()
      .sort({ date: -1 })
      .limit(5);

    // ✅ WRAP IN "data" KEY TO MATCH FRONTEND
    res.status(200).json({
      status: 'success',
      data: {
        summary: {
          ...summary,
          netBalance: summary.income - summary.expense
        },
        trends,
        expensesByCategory,
        recentActivity
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};