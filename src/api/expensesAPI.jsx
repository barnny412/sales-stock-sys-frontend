import api from "./axiosConfig";

// Fetch all expenses with optional category filter
export const fetchExpenses = async (category = null) => {
  try {
    if (category && !["cigarette", "bread_tomato"].includes(category)) {
      throw new Error("Category must be either 'cigarette' or 'bread_tomato'");
    }
    const response = await api.get("/expenses", {
      params: category ? { category } : {},
    });
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to fetch expenses");
    }
    return response.data.data;
  } catch (error) {
    console.error("Error fetching expenses:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to fetch expenses");
  }
};

// Fetch a single expense by ID
export const fetchExpenseById = async (id) => {
  try {
    if (!id) {
      throw new Error("Expense ID is required");
    }
    const response = await api.get(`/expenses/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to fetch expense");
    }
    return response.data.data;
  } catch (error) {
    console.error("Error fetching expense:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to fetch expense");
  }
};

// Fetch expenses by date range with optional category filter
export const fetchExpensesByDateRange = async (startDate, endDate, category = null) => {
  try {
    if (!startDate || !endDate) {
      throw new Error("Start date and end date are required");
    }
    if (category && !["cigarette", "bread_tomato"].includes(category)) {
      throw new Error("Category must be either 'cigarette' or 'bread_tomato'");
    }
    const response = await api.get(`/expenses/report/${startDate}/${endDate}`, {
      params: category ? { category } : {},
    });
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to fetch expenses by date range");
    }
    return response.data.data;
  } catch (error) {
    console.error("Error fetching expenses by date range:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to fetch expenses by date range");
  }
};

// Fetch expenses summary with optional category filter
export const fetchExpenseSummary = async (category = null) => {
  try {
    if (category && !["cigarette", "bread_tomato"].includes(category)) {
      throw new Error("Category must be either 'cigarette' or 'bread_tomato'");
    }
    const response = await api.get("/expenses/summary", {
      params: category ? { category } : {},
    });
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to fetch expense summary");
    }
    return response.data.data;
  } catch (error) {
    console.error("Error fetching expense summary:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to fetch expense summary");
  }
};

// Add a new expense
export const addExpense = async (expenseData) => {
  console.log("Sending Expense Data:", expenseData); // Debugging
  try {
    const { description, amount, expense_date, category } = expenseData;
    if (!description || !amount || !expense_date || !category) {
      throw new Error("All fields (description, amount, expense_date, category) are required");
    }
    if (!["cigarette", "bread_tomato"].includes(category)) {
      throw new Error("Category must be either 'cigarette' or 'bread_tomato'");
    }
    const response = await api.post("/expenses", expenseData);
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to add expense");
    }
    return response.data.data;
  } catch (error) {
    console.error("Error adding expense:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to add expense");
  }
};

// Update an expense
export const updateExpense = async (id, updatedData) => {
  try {
    if (!id) {
      throw new Error("Expense ID is required");
    }
    const { description, amount, expense_date, category } = updatedData;
    if (!description || !amount || !expense_date || !category) {
      throw new Error("All fields (description, amount, expense_date, category) are required");
    }
    if (!["cigarette", "bread_tomato"].includes(category)) {
      throw new Error("Category must be either 'cigarette' or 'bread_tomato'");
    }
    const response = await api.put(`/expenses/${id}`, updatedData);
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to update expense");
    }
    return response.data;
  } catch (error) {
    console.error("Error updating expense:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to update expense");
  }
};

// Delete an expense
export const deleteExpense = async (id) => {
  try {
    if (!id) {
      throw new Error("Expense ID is required");
    }
    const response = await api.delete(`/expenses/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to delete expense");
    }
    return response.data;
  } catch (error) {
    console.error("Error deleting expense:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to delete expense");
  }
};