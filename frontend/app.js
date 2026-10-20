// ExpenseFlow - Vanilla JS Frontend Connected to Backend API

// API base URL - relative paths work when frontend and backend share the same origin
const API_BASE = '/api/transactions';

// ===== DOM Elements =====
const transactionForm = document.getElementById('transaction-form');
const transactionsList = document.getElementById('transactions-list');
const emptyState = document.getElementById('empty-state');
const formTitle = document.getElementById('title');
const formAmount = document.getElementById('amount');
const formType = document.getElementById('type');
const formCategory = document.getElementById('category');
const formDate = document.getElementById('date');
const formDescription = document.getElementById('description');

// Loading state elements
const loadingIndicator = document.createElement('div');
loadingIndicator.className = 'loading-state';
loadingIndicator.innerHTML = 'Loading transactions...';

const incomeTotal = document.getElementById('income-total');
const expenseTotal = document.getElementById('expense-total');
const balanceEl = document.getElementById('balance');
const transactionCount = document.getElementById('transaction-count');

// Current edited/deleted transaction ID tracking
let editingId = null;

// ===== Render Functions =====

// Render a single transaction item
function renderTransaction(transaction) {
  const li = document.createElement('li');
  li.className = `transaction-item ${transaction.type}`;
  li.dataset.id = transaction._id || transaction.id;
  li.innerHTML = `
    <span>
      <span class="transaction-title">${escapeHtml(transaction.title)}</span>
      <span class="transaction-details">
        ${transaction.category} • ${formatDate(transaction.date)}
      </span>
    </span>
    <span class="transaction-amount">${transaction.type === 'income' ? '+' : '-' }${formatCurrency(Math.abs(transaction.amount))}</span>
  `;

  // Click handler to show details
  li.addEventListener('click', () => {
    alert(`Transaction Details:\n${transaction.title}\nAmount: ${formatCurrency(transaction.amount)}\nCategory: ${transaction.category}\nDate: ${formatDate(transaction.date)}\n${transaction.description || ''}`);
  });

  // Edit button
  const editBtn = document.createElement('button');
  editBtn.className = 'btn-edit tiny';
  editBtn.textContent = 'Edit';
  editBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    editTransaction(transaction);
  });
  li.querySelector('span:first-child').appendChild(editBtn);

  // Delete button
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'btn-delete tiny';
  deleteBtn.textContent = 'Delete';
  deleteBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (confirm(`Delete "${transaction.title}"?`)) {
      deleteTransactionAPI(transaction._id || transaction.id);
    }
  });
  li.querySelector('span:first-child').appendChild(deleteBtn);

  return li;
}

// Escape HTML special characters
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Format date from YYYY-MM-DD to MMM D, YYYY
function formatDate(dateStr) {
  const options = { month: 'short', day: 'numeric' };
  return new Date(dateStr).toLocaleDateString(undefined, options);
}

// Format currency as $XX.XX
function formatCurrency(amount) {
  return '$' + amount.toFixed(2);
}

// Update summary cards
function updateSummaries(transactions) {
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpense;

  incomeTotal.textContent = formatCurrency(totalIncome);
  expenseTotal.textContent = formatCurrency(totalExpense);
  balanceEl.textContent = formatCurrency(netBalance);
  balanceEl.parentElement.style.color = netBalance >= 0 ? 'var(--success)' : 'var(--error)';

  transactionCount.textContent = transactions.length;

  // Show/hide empty state
  if (transactions.length === 0) {
    emptyState.style.display = 'block';
    transactionsList.innerHTML = '';
  } else {
    emptyState.style.display = 'none';
    // Render transactions if they're not already rendered
    renderAllTransactions(transactions);
  }
}

// Render all transactions (for re-rendering after API calls)
function renderAllTransactions(transactions) {
  transactionsList.innerHTML = '';
  transactions.forEach(tx => {
    const li = renderTransaction(tx);
    transactionsList.appendChild(li);
  });
}

// Show loading state
function showLoading(show) {
  if (show) {
    transactionsList.parentElement.insertBefore(loadingIndicator, transactionsList);
    loadingIndicator.style.display = 'block';
  } else {
    if (loadingIndicator.parentElement) {
      loadingIndicator.parentElement.removeChild(loadingIndicator);
    }
  }
}

// ===== Filter State =====

// Current filter values
let currentSearch = '';
let currentType = '';
let currentCategory = '';
let currentMonth = '';
let currentYear = '';

// ===== Expense Chart =====

// Update the expense category chart
function updateExpenseChart(transactions) {
  // Filter expense transactions only
  const expenses = transactions.filter(t => t.type === 'expense');
  
  if (expenses.length === 0) {
    const chartEmpty = document.getElementById('chart-empty');
    const chartBars = document.getElementById('chart-bars');
    if (chartEmpty) chartEmpty.style.display = 'block';
    if (chartBars) chartBars.innerHTML = '';
    return;
  }
  
  const chartEmpty = document.getElementById('chart-empty');
  const chartBars = document.getElementById('chart-bars');
  
  if (chartEmpty) chartEmpty.style.display = 'none';
  if (!chartBars) return;
  
  // Group expenses by category and calculate totals
  const categoryTotals = {};
  expenses.forEach(tx => {
    const category = tx.category;
    if (categoryTotals[category]) {
      categoryTotals[category] += tx.amount;
    } else {
      categoryTotals[category] = tx.amount;
    }
  });
  
  // Get max amount for bar sizing
  const maxAmount = Math.max(...Object.values(categoryTotals));
  
  // Render bars
  chartBars.innerHTML = '';
  
  const sortedCategories = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6); // Show top 6 categories
  
  sortedCategories.forEach(([category, total]) => {
    const progressPercent = (total / maxAmount) * 100;
    const barHtml = `
      <div class="chart-bar">\n        <span class="chart-bar-label">${category}</span>\n        <span class="chart-bar-value">${formatCurrency(total)}</span>\n        <div class="chart-bar-progress">\n          <div class="chart-bar-progress-fill" style="width: ${progressPercent}%"></div>\n        </div>\n      </div>`;
    chartBars.innerHTML += barHtml;
  });
}

// ===== API Functions =====

// Fetch all transactions from API, respecting global state for summaries
async function fetchTransactions() {
  showLoading(true);
  try {
    const response = await fetch(API_BASE);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const transactions = await response.json();
    // Update summaries with ALL transactions (not filtered)
    updateSummaries(transactions);
    // Apply filters and render the filtered list
    renderFilteredTransactions(transactions);
    // Render the 5 newest transactions in the recent list
    renderRecentTransactions(transactions);
    // Update expense category chart
    updateExpenseChart(transactions);
  } catch (error) {
    showError(error.message);
  } finally {
    showLoading(false);
  }
}

// Render transactions with applied filters
function renderFilteredTransactions(transactions) {
  // Apply filters
  let filtered = transactions;
  
  // Search filter: matches title or category (case-insensitive)
  if (currentSearch) {
    const searchLower = currentSearch.toLowerCase();
    filtered = filtered.filter(t => {
      return t.title.toLowerCase().includes(searchLower) || t.category.toLowerCase().includes(searchLower);
    });
  }
  
  // Type filter
  if (currentType) {
    filtered = filtered.filter(t => t.type === currentType);
  }
  
  // Category filter
  if (currentCategory) {
    filtered = filtered.filter(t => t.category.toLowerCase().includes(currentCategory.toLowerCase()));
  }
  
  // Month filter
  if (currentMonth && currentYear) {
    // currentMonth is month name (January, February, etc.), currentYear is year (2024, 2025, etc.)
    filtered = filtered.filter(t => {
      const dateMonth = t.date.substring(5, 7);
      const dateYear = t.date.substring(0, 4);
      const monthNames = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      const monthIndex = dateMonth ? parseInt(dateMonth) : 0;
      return monthNames[monthIndex] === currentMonth && dateYear === currentYear;
    });
  } else if (currentMonth) {
    // backward compatibility if only month is set
    filtered = filtered.filter(t => t.date.substring(5, 7) === currentMonth);
  } else if (currentYear) {
    // backward compatibility if only year is set
    filtered = filtered.filter(t => t.date.substring(0, 4) === currentYear);
  }
  
  renderAllTransactions(filtered);
}

// ===== Render Functions =====

// Create a new transaction via POST
async function createTransaction(transactionData) {
  showLoading(true);
  try {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transactionData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    const newTransaction = await response.json();
    updateSummaries([newTransaction, ...placeholderTransactions]); // Add to local + keep placeholders
    renderAllTransactions([newTransaction, ...placeholderTransactions]);
    updateExpenseChart([newTransaction, ...placeholderTransactions]);
    renderRecentTransactions([newTransaction, ...placeholderTransactions]);
    return newTransaction;
  } catch (error) {
    showError(error.message);
    throw error;
  } finally {
    showLoading(false);
  }
}

// Update a transaction via PUT
async function updateTransactionAPI(id, transactionData) {
  showLoading(true);
  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transactionData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    const updatedTransaction = await response.json();
    updateSummaries([updatedTransaction, ...placeholderTransactions]);
    renderAllTransactions([updatedTransaction, ...placeholderTransactions]);
    renderRecentTransactions([updatedTransaction, ...placeholderTransactions]);
    editingId = null;
    formTitle.value = '';
    formAmount.value = '';
    formCategory.value = '';
    formDescription.value = '';
    updateExpenseChart([updatedTransaction, ...placeholderTransactions]);
    return updatedTransaction;
  } catch (error) {
    showError(error.message);
    throw error;
  } finally {
    showLoading(false);
  }
}// Delete a transaction via DELETE
async function deleteTransactionAPI(id) {
  showLoading(true);
  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    // Reload complete transaction list from API (MongoDB)
    fetchTransactions();
  } catch (error) {
    showError(error.message);
    throw error;
  } finally {
    showLoading(false);
  }
}
// Show error state
function showError(message) {
  // Remove any previous error/success states
  const existingError = transactionsList.parentElement.querySelector('.error-state');
  const existingSuccess = transactionsList.parentElement.querySelector('.success-state');
  if (existingError) existingError.remove();
  if (existingSuccess) existingSuccess.remove();

  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-state';
  errorDiv.textContent = `Error: ${message}`;
  transactionsList.parentElement.insertBefore(errorDiv, transactionsList);
}

// ===== Form Handling =====

// Handle form submission
transactionForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const title = formTitle.value.trim();
  const amount = parseFloat(formAmount.value);
  const type = formType.value;
  const category = formCategory.value.trim();
  const date = formDate.value;
  const description = formDescription.value.trim();

  // Basic validation
  if (!title || !amount || !category || !date) {
    alert('Please fill in all required fields.');
    return;
  }

  // Create new transaction object
  const newTransaction = {
    title,
    amount,
    type,
    category,
    date,
    description,
  };

  try {
    if (editingId) {
      // Update existing transaction via PUT
      const updated = await updateTransactionAPI(editingId, newTransaction);
      // Reload full list from API
      fetchTransactions();
    } else {
      // Create new transaction via POST
      await createTransaction(newTransaction);
    }
    // Reset form and reload list in both cases
    transactionForm.reset();
    editingId = null;
    fetchTransactions(); // Refresh the list to ensure consistency
  } catch (error) {
    alert(`Failed to save transaction: ${error.message}`);
  }
});

// ===== Edit Functionality =====

// Pre-fill form with transaction data for editing
function editTransaction(transaction) {
  formTitle.value = transaction.title;
  formAmount.value = transaction.amount;
  formType.value = transaction.type;
  formCategory.value = transaction.category;
  formDate.value = transaction.date;
  formDescription.value = transaction.description || '';
  editingId = transaction._id || transaction.id;
}

// ===== Initialization =====

// Track placeholder transactions (fallback when API fails)
const placeholderTransactions = [];

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
  // Show loading indicator initially
  showLoading(true);

  // Fetch transactions from API
  fetchTransactions();
});

// ===== Filter Event Listeners =====

// Search input listener
document.getElementById('search-input').addEventListener('input', (e) => {
  currentSearch = e.target.value;
  fetchTransactions();
});

// Type filter listener
document.getElementById('type-filter').addEventListener('change', (e) => {
  currentType = e.target.value;
  fetchTransactions();
});

// Category filter listener
document.getElementById('category-filter').addEventListener('input', (e) => {
  currentCategory = e.target.value;
  fetchTransactions();
});

// Month filter listener
document.getElementById('month-filter').addEventListener('change', (e) => {
  currentMonth = e.target.value;
  currentYear = document.getElementById('year-filter').value;
  fetchTransactions();
});

// ===== Recent Transactions =====

// Render the 5 newest transactions in the recent list
function renderRecentTransactions(transactions) {
  const recentList = document.getElementById('recent-list');
  
  // Clear existing list items
  recentList.innerHTML = '';
  
  // Sort transactions by date (newest first) and take the 5 most recent
  const sorted = [...transactions].sort((a, b) => new Date(b.date) - new Date(a));
  const recent = sorted.slice(0, 5);
  
  if (recent.length === 0) {
    recentList.innerHTML = '<p class="empty-state">No transactions yet.</p>';
    return;
  }
  
  recent.forEach(transaction => {
    const li = document.createElement('div');
    li.className = `transaction-item ${transaction.type}`;
    const date = new Date(transaction.date);
    const formattedDate = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    li.innerHTML = `
      <span>
        <span class="transaction-title" style="max-width: 160px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(transaction.title)}</span>
        <span class="transaction-details" style="font-size: 0.75rem; color: var(--text-secondary);">${formattedDate}</span>
      </span>
      <span class="transaction-amount ${transaction.type}">${transaction.type === 'income' ? '+' : '-' }${formatCurrency(Math.abs(transaction.amount))}</span>
    `;
    recentList.appendChild(li);
  });
}

// Scroll to full transactions list when "View all" is clicked
document.getElementById('view-all-btn').addEventListener('click', () => {
  const transactionsSection = document.querySelector('.transactions-section');
  if (transactionsSection) {
    transactionsSection.scrollIntoView({ behavior: 'smooth' });
  }
});

