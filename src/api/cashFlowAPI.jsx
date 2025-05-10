import api from "./axiosConfig";

// Configure axios with a timeout
api.defaults.timeout = 10000; // 10 seconds timeout

// Retry utility function
const retry = async (fn, retries = 3, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error; // Last retry failed
      console.warn(`Retry ${i + 1}/${retries} after error: ${error.message}`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

// Fetch cash flow data for a specific category
export const fetchCashFlow = async (category) => {
  try {
    if (!category) return { success: false, error: "Category is required" };
    if (!["cigarette", "bread_tomato"].includes(category)) {
      return { success: false, error: "Category must be either 'cigarette' or 'bread_tomato'" };
    }
    const response = await api.get("/cashflow", { params: { category } });
    if (!response.data.success) {
      return { success: false, error: response.data.message || "Failed to fetch cash flow data" };
    }
    return { success: true, data: response.data.data };
  } catch (error) {
    console.error("Error fetching cash flow data:", error.response?.data || error.message);
    return { success: false, error: error.response?.data?.message || "Failed to fetch cash flow data" };
  }
};

// Fetch cash flow report for a specific period and category
export const fetchCashFlowReport = async (startDate, endDate, category) => {
  try {
    if (!startDate || !endDate) {
      return { success: false, error: "Start date and end date are required" };
    }
    if (category && !["cigarette", "bread_tomato"].includes(category)) {
      return { success: false, error: "Category must be either 'cigarette' or 'bread_tomato'" };
    }
    const response = await api.get(`/cashflow/report/${startDate}/${endDate}`, { params: { category } });
    if (!response.data.success) {
      return { success: false, error: response.data.message || "Failed to fetch cash flow report" };
    }
    return { success: true, data: response.data.data };
  } catch (error) {
    console.error("Error fetching cash flow report:", error.response?.data || error.message);
    return { success: false, error: error.response?.data?.message || "Failed to fetch cash flow report" };
  }
};

// Fetch opening balance for a specific date and category
export const fetchOpeningBalance = async (date, category) => {
  return retry(async () => {
    try {
      if (!date) return { success: false, error: "Date is required" };
      if (!category) return { success: false, error: "Category is required" };
      if (!["cigarette", "bread_tomato"].includes(category)) {
        return { success: false, error: "Category must be either 'cigarette' or 'bread_tomato'" };
      }
      const response = await api.get("/cashflow/opening-balance", { params: { date, category } });
      if (!response.data.success) {
        return { success: false, error: response.data.message || "Failed to fetch opening balance" };
      }
      return { success: true, data: response.data.data.openingBalance || 0 }; // Already a number
    } catch (error) {
      console.error("Error fetching opening balance:", error.response?.data || error.message);
      return { success: false, error: error.response?.data?.message || "Failed to fetch opening balance" };
    }
  });
};

// Fetch opening balances for all categories
export const fetchCashflowOpeningBalances = async () => {
  return retry(async () => {
    try {
      const response = await api.get("/cashflow/opening-balances");
      if (!response.data.success) {
        return { success: false, error: response.data.message || "Failed to fetch opening balances" };
      }
      const data = response.data.data;
      return {
        success: true,
        data: {
          cigarette: data.cigarette || 0, // Already a number
          bread_tomato: data.bread_tomato || 0, // Already a number
        },
      };
    } catch (error) {
      console.error("Error fetching opening balances:", error.response?.data || error.message);
      return { success: false, error: error.response?.data?.message || "Failed to fetch opening balances" };
    }
  });
};

// Save opening balance for a specific category
export const saveCashflowOpeningBalance = async (category, openingBalance) => {
  try {
    if (!category) return { success: false, error: "Category is required" };
    if (!["cigarette", "bread_tomato"].includes(category)) {
      return { success: false, error: "Category must be either 'cigarette' or 'bread_tomato'" };
    }
    if (openingBalance === undefined || isNaN(Number(openingBalance)) || Number(openingBalance) < 0) {
      return { success: false, error: "Opening balance must be a non-negative number" };
    }
    const response = await api.post("/cashflow/opening-balance", { category, openingBalance });
    if (!response.data.success) {
      return { success: false, error: response.data.message || "Failed to save opening balance" };
    }
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error saving opening balance:", error.response?.data || error.message);
    return { success: false, error: error.response?.data?.message || "Failed to save opening balance" };
  }
};

// Reset entire database
export const resetDatabase = async () => {
  try {
    const response = await api.delete("/reset/database");
    if (!response.data.success) {
      return { success: false, error: response.data.message || "Failed to reset database" };
    }
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error resetting database:", error.response?.data || error.message);
    return { success: false, error: error.response?.data?.message || "Failed to reset database" };
  }
};

// Reset products table
export const resetProductsTable = async () => {
  try {
    const response = await api.delete("/reset/products");
    if (!response.data.success) {
      return { success: false, error: response.data.message || "Failed to reset products table" };
    }
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error resetting products table:", error.response?.data || error.message);
    return { success: false, error: error.response?.data?.message || "Failed to reset products table" };
  }
};

// Reset cashflow table
export const resetCashflowTable = async () => {
  try {
    const response = await api.delete("/reset/cashflow");
    if (!response.data.success) {
      return { success: false, error: response.data.message || "Failed to reset cashflow table" };
    }
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error resetting cashflow table:", error.response?.data || error.message);
    return { success: false, error: error.response?.data?.message || "Failed to reset cashflow table" };
  }
};