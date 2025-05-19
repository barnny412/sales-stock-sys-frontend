import api from "./axiosConfig";

// Helper function to sanitize purchase data
const sanitizePurchaseData = (data) => {
  // Handle both single purchase and array of purchases
  const purchases = Array.isArray(data) ? data : [data];
  
  return purchases.map(purchase => {
    // Convert all numeric fields to proper types
    const sanitized = {
      ...purchase,
      product_id: parseInt(purchase.product_id, 10),
      supplier_id: purchase.supplier_id ? parseInt(purchase.supplier_id, 10) : null,
      quantity: parseFloat(purchase.quantity),
      price: parseFloat(purchase.price),
      total_cost: parseFloat(purchase.total_cost || purchase.price * purchase.quantity)
    };

    // Validate the conversions
    if (isNaN(sanitized.product_id)) {
      throw new Error(`Invalid product ID: ${purchase.product_id}`);
    }
    if (sanitized.supplier_id !== null && isNaN(sanitized.supplier_id)) {
      throw new Error(`Invalid supplier ID: ${purchase.supplier_id}`);
    }
    if (isNaN(sanitized.quantity)) {
      throw new Error(`Invalid quantity: ${purchase.quantity}`);
    }
    if (isNaN(sanitized.price)) {
      throw new Error(`Invalid price: ${purchase.price}`);
    }

    return sanitized;
  });
};

// Fetch all purchases
export const fetchPurchases = async (type = null) => {
  try {
    const params = type ? { type } : {};
    const response = await api.get("/purchases", { params });
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("Error fetching purchases:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to fetch purchases");
  }
};

// Create one or more new purchase records
export const createPurchase = async (purchaseData) => {
  try {
    // Sanitize and validate the input data first
    const sanitizedData = sanitizePurchaseData(purchaseData);
    console.log("Sanitized purchase data:", sanitizedData);

    const response = await api.post("/purchases/", 
      Array.isArray(purchaseData) ? sanitizedData : sanitizedData[0], 
      {
        headers: { "Content-Type": "application/json" }
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating purchase:", {
      error: error.response?.data || error.message,
      originalData: purchaseData
    });
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      "Failed to create purchase(s)"
    );
  }
};

// Fetch a single purchase by ID
export const fetchPurchaseById = async (purchaseId) => {
  try {
    const response = await api.get(`/purchases/${purchaseId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching purchase ${purchaseId}:`, error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to fetch purchase");
  }
};

// Update a purchase by ID
export const updatePurchase = async (purchaseId, purchaseData) => {
  try {
    // Sanitize and validate the input data
    const sanitizedData = sanitizePurchaseData(purchaseData)[0];
    console.log(`Updating purchase ${purchaseId}:`, sanitizedData);

    const response = await api.put(`/purchases/${purchaseId}`, sanitizedData, {
      headers: { "Content-Type": "application/json" }
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating purchase ${purchaseId}:`, error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to update purchase");
  }
};

// Delete a purchase by ID
export const deletePurchase = async (purchaseId) => {
  try {
    const response = await api.delete(`/purchases/${purchaseId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting purchase ${purchaseId}:`, error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to delete purchase");
  }
};