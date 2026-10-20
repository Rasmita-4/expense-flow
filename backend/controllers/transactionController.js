const Transaction = require('../models/Transaction');

// @desc    Get all transactions
// @route   GET /api/transactions
// @access  Public
exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ date: -1 }); // newest first
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Create a new transaction
// @route   POST /api/transactions
// @access  Public
exports.createTransaction = async (req, res) => {
  try {
    const { title, amount, type, category, date, description } = req.body;

    // Basic validation
    if (!title || !amount || !type || !category || !date) {
      return res.status(400).json({ message: 'Please fill in all required fields' });
    }

    const newTransaction = new Transaction({
      title,
      amount,
      type,
      category,
      date: date instanceof Date ? date : new Date(date),
      description: description || ''
    });

    const saved = await newTransaction.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Get a single transaction
// @route   GET /api/transactions/:id
// @access  Public
exports.getTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    res.json(transaction);
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid transaction ID' });
    }
    res.status(400).json({ message: err.message });
  }
};

// @desc    Update a transaction
// @route   PUT /api/transactions/:id
// @access  Public
exports.updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    res.json(transaction);
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid transaction ID' });
    }
    res.status(400).json({ message: err.message });
  }
};

// @desc    Delete a transaction
// @route   DELETE /api/transactions/:id
// @access  Public
exports.deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndDelete(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    res.json({ message: 'Transaction deleted' });
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid transaction ID' });
    }
    res.status(400).json({ message: err.message });
  }
};