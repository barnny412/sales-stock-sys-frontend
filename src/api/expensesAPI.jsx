import api from "./axiosConfig";

// Fetch all expenses
export const fetchExpenses = async () => {
  try {
    const response = await api.get("/expenses");
    return response.data;
  } catch (error) {
    console.error("Error fetching expenses:", error);
    throw error;
  }
};

// Add a new expense
export const addExpense = async (expenseData) => {
  console.log("Sending Expense Data:", expenseData); // Debugging
  try {
    const response = await api.post("/expenses", expenseData);
    return response.data;
  } catch (error) {
    console.error("Error adding expense:", error);
    throw error;
  }
};

// Update an expense
export const updateExpense = async (id, updatedData) => {
  try {
    const response = await api.put(`/expenses/${id}`, updatedData);
    return response.data;
  } catch (error) {
    console.error("Error updating expense:", error);
    throw error;
  }
};

// Delete an expense
export const deleteExpense = async (id) => {
  try {
    await api.delete(`/expenses/${id}`);
  } catch (error) {
    console.error("Error deleting expense:", error);
    throw error;
  }
};
