import api from './axiosConfig'; // Import the axios instance you created

// Fetch last closing stock for a given product
export const fetchLastClosingStock = async (productId) => {
  try {
    const response = await api.get(`/sales/last-closing-stock/${productId}`);
    return response.data; // Expected to return { closing_stock: <value> }
  } catch (error) {
    console.error(`Error fetching last closing stock for product ${productId}:`, error);
    throw error;
  }
};

// Fetch all sales records (can be filtered on frontend by date)
export const fetchSales = async () => {
  try {
    const response = await api.get("/sales");
    console.log("Fetched sales:", response.data); // Should show the array now
    return response.data; // ✅ This is your sales array
  } catch (error) {
    console.error("Error fetching sales data:", error);
    throw error;
  }
};



// Fetch a single sale record by ID
export const fetchSaleById = async (id) => {
  try {
    const response = await api.get(`/sales/${id}`);
    return response.data.sales; // Access the sales data for the specific sale
  } catch (error) {
    console.error(`Error fetching sale with ID ${id}:`, error);
    throw error;
  }
};

// Create one or more new sales records
export const createSale = async (saleData) => {
  try {
    const response = await api.post("/sales/", saleData);
    return response.data;
  } catch (error) {
    console.error("Error creating sale:", error);
    throw error;
  }
};

// Update an existing sales record
export const updateSale = async (id, saleData) => {
  try {
    const response = await api.put(`/sales/${id}`, saleData);
    return response.data; // Return the updated sale data
  } catch (error) {
    console.error(`Error updating sale with ID ${id}:`, error);
    throw error;
  }
};

// Update closing stock only (if applicable)
export const updateClosingStock = async (id, stock) => {
  try {
    const response = await api.put(`/sales/${id}/closing_stock/${stock}`);
    return response.data;
  } catch (error) {
    console.error(`Error updating closing stock for sale ID ${id}:`, error);
    throw error;
  }
};

// Delete a sale record by ID
export const deleteSale = async (id) => {
  try {
    const response = await api.delete(`/sales/${id}`);
    return response.data; // Return the result of the delete operation
  } catch (error) {
    console.error(`Error deleting sale with ID ${id}:`, error);
    throw error;
  }
};
