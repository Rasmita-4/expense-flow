# ExpenseFlow

A simple expense tracking dashboard built with vanilla JavaScript, HTML, and CSS, connected to a Node.js/Express backend with MongoDB.

---
## 📖 Project Overview

ExpenseFlow is a full-stack web application for tracking personal expenses and income. It features a clean responsive dashboard with transaction management, category-based expense visualizations, and real-time filtering. All data is persisted in MongoDB Atlas, and the frontend uses pure vanilla JavaScript — no frameworks required.

---
## ✨ Features

- **Transaction Management**: Create, read, update, and delete transactions (CRUD)
- **Filter & Search**: Filter by type (income/expense), category, search term, and month/year
- **Expense Chart**: Category-wise expense visualization with CSS horizontal bars
- **Summary Cards**: Total income, expenses, and balance based on ALL transactions (not filtered)
- **Recent Transactions**: Show the 5 newest transactions with "View all" button
- **Responsive Layout**: Works on mobile and desktop without a sidebar
- **Pure Vanilla JS**: No React, Vue, or other frameworks

---
## 🛠 Technology Stack

### Frontend
- **HTML5**: Semantic markup with accessible forms and sections
- **CSS3**: Custom properties, flex/grid layout, responsive design
- **Vanilla JavaScript**: ES6+ features, async/await for API calls

### Backend
- **Node.js**: Runtime environment
- **Express**: Web framework (API server)
- **MongoDB**: Document database (MongoDB Atlas for cloud hosting)
- **Mongoose**: MongoDB ODM for schema and validation

---
## 📁 Folder Structure

```
expenseflow/
├── frontend/
│   ├── index.html      # Main HTML page with forms, filters, dashboard
│   ├── app.js          # Vanilla JS: API calls, render functions, event listeners
│   └── styles.css      # All custom styling
├── backend/
│   ├── server.js       # Express server, MongoDB connection, static file serving
│   ├── package.json    # Project dependencies (express, mongoose, dotenv)
│   ├── .env.example   # Environment variables template
│   ├── config/
│   │   └── db.js       # MongoDB connection configuration
│   ├── models/
│   │   └── Transaction.js  # Mongoose schema with validation
│   ├── routes/
│   │   └── transactionRoutes.js  # API routes for CRUD operations
│   └── controllers/
│       └── transactionController.js  # Business logic for API handlers
└── README.md          # This file
```

---
## 🚀 Setup Instructions

### 1. Prerequisites

- [Node.js](https://nodejs.org/) (v18 or newer recommended)
- [MongoDB Atlas account](https://www.mongodb.com/atlas) (free tier sufficient)
- A code editor (VS Code, etc.)

### 2. Backend Setup

```bash
cd backend
# Install dependencies
npm install

# Environment configuration
# The .env.example file shows required variables:
#   MONGODB_URI=your_mongodb_atlas_connection_string_here

# Start the backend server
npm start
# Server runs on http://localhost:5001
```

### 3. Frontend Setup

No build step required — just open the HTML file:

```bash
# From the project root
open frontend/index.html
# Or with a local server (optional, for CORS compatibility):
npx http-server frontend
```

### 4. Using the App

1. Visit `http://localhost:5001` in your browser
2. The dashboard loads with sample data from the API
3. Use the filter section to search, filter by type/category/month-year
4. Add new transactions via the form at the top
5. Edit or delete existing transactions
6. View the expense category chart and summary cards

---
## 🔌 API Routes (5 Routes)

| Method | Route | Description |
|---|---|---|
| `GET /api/transactions` | Get all transactions |
| `GET /api/transactions/:id` | Get a single transaction by ID |
| `POST /api/transactions` | Create a new transaction |
| `PUT /api/transactions/:id` | Update an existing transaction |
| `DELETE /api/transactions/:id` | Delete a transaction |

### Request/Response Examples

**Create Transaction** (POST):
```json
{
  "title": "Salary",
  "amount": 3000,
  "type": "income",
  "category": "Salary",
  "date": "2025-01-15",
  "description": "Monthly salary deposit"
}
```

**Response**: Returns the created transaction object with `_id` and timestamps.

---
## 📝 CRUD Demo Flow

1. **Create**: Fill the form with title, amount, type (income/expense), category, date, description → Click "Add Transaction" → POST to `/api/transactions` → Transaction appears in the list, summary cards update, expense chart refreshes, recent list updates

2. **Read**: The dashboard automatically fetches all transactions on load → Summary cards display totals → Expense chart renders category bars → Recent list shows 5 newest transactions

3. **Update**: Edit the form fields for any transaction → Click "Save Changes" → PUT to `/api/transactions/:id` → Transaction data updates → All visual elements refresh

4. **Delete**: Click the "Delete" button on any transaction → Confirm deletion → DELETE to `/api/transactions/:id` → Transaction removed → List updates, summaries recalculate, chart refreshes, recent list updates

---
## 📸 Screenshots

![Dashboard Screenshot](screenshots/Pasted%2020-10-2026%20at%2013.07.32.png)
*Dashboard view*

![Dashboard Screenshot](screenshots/Pasted%2020-10-2026%20at%2013.08.02.png)
*Mobile view*

![Dashboard Screenshot](screenshots/Pasted%2020-10-2026%20at%2013.08.15.png)
*Expense chart view*

![Dashboard Screenshot](screenshots/Pasted%2020-10-2026%20at%2013.08.25.png)
*Filter section view*

*Add more screenshots as needed.*

---
## 🛠 Development

```bash
# Run backend in development mode (if additional scripts are added)
npm run dev  # (if defined in package.json)

# Watch for frontend changes during development
# No build step — just refresh the browser
```

---
## 📄 License

This project is for educational purposes as a college project.

---

*Generated with Codebuff 🤖*