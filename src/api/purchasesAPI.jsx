import api from "./axiosConfig";

// Fetch all purchases
export const fetchPurchases = async () => {
  try {
    const response = await api.get("/purchases");
   // Debugging
   console.log("Full response object:", response);
   console.log("response.data:", response.data);
    return Array.isArray(response.data) ? response.data : []; // Extract purchases
  } catch (error) {
    console.error("Error fetching purchases data:", error);
    return []; // Return empty array if error
  }
};

// Create one or more new purchase records
export const createPurchase = async (purchaseData) => {
  try {
    console.log("Sending purchase data to backend:", purchaseData); // Optional: for debugging

    const response = await api.post("/purchases/", purchaseData, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error creating purchase(s):", error.response?.data || error.message);
    throw error;
  }
};



// Fetch a single purchase by ID
export const fetchPurchaseById = async (purchaseId) => {
  try {
    const response = await api.get(`/purchases/${purchaseId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching purchase with ID ${purchaseId}:`, error);
    throw new Error(error.response?.data?.message || "Failed to fetch purchase details");
  }
};

// Delete a purchase by ID
export const deletePurchase = async (purchaseId) => {
  try {
    const response = await api.delete(`/purchases/${purchaseId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting purchase with ID ${purchaseId}:`, error);
    throw new Error(error.response?.data?.message || "Failed to delete purchase");
  }
};
