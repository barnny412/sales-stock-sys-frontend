import api from "./axiosConfig";

// Fetch all stocks
export const fetchStocks = async () => {
  try {
    const response = await api.get("/stocks");
    return response.data;
  } catch (error) {
    console.error("Error fetching stocks data:", error);
    throw error;
  }
};

// Increase stock for a specific product
export const increaseStock = async (productId, quantity) => {
  try {
    const response = await api.put(`/stock/increase/${productId}`, { quantity });
    return response.data;
  } catch (error) {
    console.error("Error increasing stock:", error);
    throw error;
  }
};

// Decrease stock for a specific product
export const decreaseStock = async (productId, quantity) => {
  try {
    const response = await api.put(`/stock/decrease/${productId}`, { quantity });
    return response.data;
  } catch (error) {
    console.error("Error decreasing stock:", error);
    throw error;
  }
};
