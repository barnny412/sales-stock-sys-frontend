import api from "./axiosConfig";

// Fetch all cash flow records
export const fetchCashFlow = async () => {
  try {
    const response = await api.get("/cashflow");
    return response.data;
  } catch (error) {
    console.error("Error fetching cash flow data:", error);
    throw error;
  }
};

// Fetch cash flow report for a specific period
export const fetchCashFlowReport = async (startDate, endDate) => {
  try {
    const response = await api.get(`/cashflow/report/${startDate}/${endDate}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching cash flow report:", error);
    throw error;
  }
};
