import api from "./axiosConfig";

// Fetch cash flow data for a 특정 category
export const fetchCashFlow = async (category) => {
  try {
    if (!category) {
      throw new Error("Category is required");
    }
    if (!["cigarette", "bread_tomato"].includes(category)) {
      throw new Error("Category must be either 'cigarette' or 'bread_tomato'");
    }
    const response = await api.get("/cashflow", {
      params: { category },
    });
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to fetch cash flow data");
    }
    return response.data.data;
  } catch (error) {
    console.error("Error fetching cash flow data:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to fetch cash flow data");
  }
};

// Fetch cash flow report for a specific period and category
export const fetchCashFlowReport = async (startDate, endDate, category) => {
  try {
    if (!startDate || !endDate) {
      throw new Error("Start date and end date are required");
    }
    if (category && !["cigarette", "bread_tomato"].includes(category)) {
      throw new Error("Category must be either 'cigarette' or 'bread_tomato'");
    }
    const response = await api.get(`/cashflow/report/${startDate}/${endDate}`, {
      params: { category },
    });
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to fetch cash flow report");
    }
    return response.data.data;
  } catch (error) {
    console.error("Error fetching cash flow report:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to fetch cash flow report");
  }
};

// Fetch opening balance for a specific date and category
export const fetchOpeningBalance = async (date, category) => {
  try {
    if (!date) {
      throw new Error("Date is required");
    }
    if (!category) {
      throw new Error("Category is required");
    }
    if (!["cigarette", "bread_tomato"].includes(category)) {
      throw new Error("Category must be either 'cigarette' or 'bread_tomato'");
    }
    const response = await api.get("/cashflow/opening-balance", {
      params: { date, category },
    });
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to fetch opening balance");
    }
    return Number(response.data.data.openingBalance) || 0;
  } catch (error) {
    console.error("Error fetching opening balance:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to fetch opening balance");
  }
};