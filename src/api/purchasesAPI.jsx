import api from "./axiosConfig";

// Fetch all purchases
export const fetchPurchases = async (type = null) => {
  try {
    const params = type ? { type } : {};
    const response = await api.get("/purchases", { params });
    console.log("Full response object:", response);
    console.log("response.data:", response.data);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("Error fetching purchases data:", error.response?.data || error.message);
    return [];
  }
};

// Create one or more new purchase records
export const createPurchase = async (purchaseData) => {
  try {
    console.log("Sending purchase data to backend:", purchaseData);
    const response = await api.post("/purchases/", purchaseData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("Create purchase response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating purchase(s):", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to create purchase(s)");
  }
};

// Fetch a single purchase by ID
export const fetchPurchaseById = async (purchaseId) => {
  try {
    const response = await api.get(`/purchases/${purchaseId}`);
    console.log(`Fetched purchase with ID ${purchaseId}:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error fetching purchase with ID ${purchaseId}:`, error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to fetch purchase details");
  }
};

// Update a purchase by ID
export const updatePurchase = async (purchaseId, purchaseData) => {
  try {
    console.log(`Updating purchase with ID ${purchaseId}:`, purchaseData);
    const response = await api.put(`/purchases/${purchaseId}`, purchaseData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log(`Update purchase response for ID ${purchaseId}:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error updating purchase with ID ${purchaseId}:`, error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to update purchase");
  }
};

// Delete a purchase by ID
export const deletePurchase = async (purchaseId) => {
  try {
    const response = await api.delete(`/purchases/${purchaseId}`);
    console.log(`Deleted purchase with ID ${purchaseId}:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error deleting purchase with ID ${purchaseId}:`, error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to delete purchase");
  }
};