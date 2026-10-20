const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Enable Express to parse JSON request bodies
app.use(express.json());

// Serve static files from frontend folder
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Connect to MongoDB and start server
const connectDB = require('./config/db');
connectDB().then(() => {
  // API routes
  app.use('/api/transactions', require('./routes/transactionRoutes'));

  // Root route
  app.get('/', (req, res) => {
    res.send('ExpenseFlow API is running');
  });

  // Serve index.html for any other routes (SPA fallback)
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ExpenseFlow API is running on http://0.0.0.0:${PORT}`);
  });
});