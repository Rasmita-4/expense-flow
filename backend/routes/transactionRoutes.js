const express = require('express');
const router = express.Router();

const {
  getTransactions,
  createTransaction,
  getTransaction,
  updateTransaction,
  deleteTransaction
} = require('../controllers/transactionController');

// @route   GET /api/transactions
// @desc    Get all transactions
// @access  Public
router.get('/', getTransactions);

// @route   GET /api/transactions/:id
// @desc    Get a single transaction
// @access  Public
router.get('/:id', getTransaction);

// @route   PUT /api/transactions/:id
// @desc    Update a transaction
// @access  Public
router.put('/:id', updateTransaction);

// @route   DELETE /api/transactions/:id
// @desc    Delete a transaction
// @access  Public
router.delete('/:id', deleteTransaction);

// @route   POST /api/transactions
// @desc    Create a new transaction
// @access  Public
router.post('/', createTransaction);

module.exports = router;