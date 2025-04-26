import api from "./axiosConfig";

// Fetch all stocks
export const fetchStocks = async () => {
  try {
    const response = await api.get("/products");
    return response.data;
  } catch (error) {
    console.error("Error fetching stocks:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to fetch stocks");
  }
};

// Adjust stock level for a product
export const adjustStock = async (id, stock) => {
  try {
    const response = await api.patch(`/products/${id}`, { stock }); // Updated route
    return response.data;
  } catch (error) {
    console.error("Error adjusting stock:", error.response?.data || error.message);
    if (error.response?.status === 404) {
      throw new Error("Product not found");
    }
    throw new Error(error.response?.data?.message || "Failed to adjust stock");
  }
};