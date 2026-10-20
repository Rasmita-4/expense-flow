const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the Transaction schema with validation
const TransactionSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount must be greater than 0'],
    validate: {
      validator: function(value) {
        return value > 0;
      },
      message: 'Amount must be greater than 0'
    }
  },
  type: {
    type: String,
    required: [true, 'Type is required'],
    enum: ['income', 'expense'],
    message: 'Type must be either "income" or "expense"'
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    validate: {
      validator: function(value) {
        return value instanceof Date;
      },
      message: 'Date must be a valid date'
    }
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  }
}, {
  timestamps: true // automatically adds createdAt and updatedAt fields
});

// Export the model
module.exports = mongoose.model('Transaction', TransactionSchema);