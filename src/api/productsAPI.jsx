import api from "./axiosConfig";

/**
 * Fetch all products (stocks) from the backend.
 * @returns {Promise<Array>} A promise that resolves to an array of products.
 * @throws {Error} If the request fails.
 */
export const fetchStocks = async () => {
  try {
    const response = await api.get("/products");
    return response.data;
  } catch (error) {
    console.error("Error fetching stocks:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to fetch stocks");
  }
};

/**
 * Fetch a single product by its ID.
 * @param {number|string} id - The ID of the product to fetch.
 * @returns {Promise<Object>} A promise that resolves to the product data.
 * @throws {Error} If the product ID is invalid or the request fails.
 */
export const getProductById = async (id) => {
  if (!id || isNaN(id)) {
    throw new Error("Invalid product ID");
  }
  try {
    const response = await api.get(`/products/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching product by ID:", error.response?.data || error.message);
    if (error.response?.status === 404) {
      throw new Error("Product not found");
    }
    throw new Error(error.response?.data?.message || "Failed to fetch product");
  }
};

/**
 * Fetch all products with their category names from the backend.
 * @returns {Promise<Array>} A promise that resolves to an array of products with category names.
 * @throws {Error} If the request fails.
 */
export const fetchProductsWithCategory = async () => {
  try {
    const response = await api.get("/products/with-category");
    return response.data;
  } catch (error) {
    console.error("Error fetching products with category:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to fetch products with category");
  }
};

/**
 * Add a new product to the backend.
 * @param {Object} productData - The data for the new product.
 * @returns {Promise<Object>} A promise that resolves to the created product data.
 * @throws {Error} If the product data is invalid or the request fails.
 */
export const addProduct = async (productData) => {
  if (!productData || typeof productData !== "object" || Object.keys(productData).length === 0) {
    throw new Error("Invalid product data");
  }
  try {
    // Ensure proper type conversions
    const formattedData = {
      ...productData,
      category_id: parseInt(productData.category_id),
      cost_price: parseFloat(productData.cost_price),
      selling_price: parseFloat(productData.selling_price),
      stock: parseInt(productData.stock || 0),
      items_per_unit: productData.items_per_unit ? parseInt(productData.items_per_unit) : undefined,
      cost_price_per_unit: productData.cost_price_per_unit
        ? parseFloat(productData.cost_price_per_unit)
        : undefined,
      low_stock_alert: productData.low_stock_alert ? parseInt(productData.low_stock_alert) : undefined,
    };
    const response = await api.post("/products", formattedData);
    return response.data;
  } catch (error) {
    console.error("Error adding product:", error.response?.data || error.message);
    if (error.response?.status === 400) {
      throw new Error(error.response?.data?.message || "Invalid product data");
    }
    throw new Error(error.response?.data?.message || "Failed to add product");
  }
};

/**
 * Update an existing product (full update).
 * @param {number|string} id - The ID of the product to update.
 * @param {Object} updatedData - The updated product data.
 * @returns {Promise<Object>} A promise that resolves to the updated product data.
 * @throws {Error} If the product ID or data is invalid, or the request fails.
 */
export const updateProduct = async (id, updatedData) => {
  if (!id || isNaN(id)) {
    throw new Error("Invalid product ID");
  }
  if (!updatedData || typeof updatedData !== "object" || Object.keys(updatedData).length === 0) {
    throw new Error("Invalid product data");
  }
  try {
    // Ensure proper type conversions
    const formattedData = {
      ...updatedData,
      category_id: parseInt(updatedData.category_id),
      cost_price: parseFloat(updatedData.cost_price),
      selling_price: parseFloat(updatedData.selling_price),
      stock: parseInt(updatedData.stock),
      items_per_unit: updatedData.items_per_unit ? parseInt(updatedData.items_per_unit) : undefined,
      cost_price_per_unit: updatedData.cost_price_per_unit
        ? parseFloat(updatedData.cost_price_per_unit)
        : undefined,
      low_stock_alert: updatedData.low_stock_alert ? parseInt(updatedData.low_stock_alert) : undefined,
    };
    const response = await api.put(`/products/${id}`, formattedData);
    return response.data;
  } catch (error) {
    console.error("Error updating product:", error.response?.data || error.message);
    if (error.response?.status === 404) {
      throw new Error("Product not found");
    }
    if (error.response?.status === 400) {
      throw new Error(error.response?.data?.message || "Invalid product data");
    }
    throw new Error(error.response?.data?.message || "Failed to update product");
  }
};

/**
 * Set the stock level for a product.
 * @param {number|string} id - The ID of the product to update.
 * @param {number} stock - The new stock level.
 * @returns {Promise<Object>} A promise that resolves to the updated product data.
 * @throws {Error} If the product ID or stock value is invalid, or the request fails.
 */
export const setStock = async (id, stock) => {
  if (!id || isNaN(id)) {
    throw new Error("Invalid product ID");
  }
  if (stock === undefined || isNaN(stock) || stock < 0) {
    throw new Error("Stock must be a valid non-negative number");
  }
  try {
    const response = await api.put(`/products/${id}/stock`, { stock: parseInt(stock) });
    return response.data;
  } catch (error) {
    console.error("Error setting stock:", error.response?.data || error.message);
    if (error.response?.status === 404) {
      throw new Error("Product not found");
    }
    if (error.response?.status === 400) {
      throw new Error(error.response?.data?.message || "Invalid stock value");
    }
    throw new Error(error.response?.data?.message || "Failed to set stock");
  }
};

/**
 * Delete a product by its ID.
 * @param {number|string} id - The ID of the product to delete.
 * @returns {Promise<void>} A promise that resolves when the product is deleted.
 * @throws {Error} If the product ID is invalid or the request fails.
 */
export const deleteProduct = async (id) => {
  if (!id || isNaN(id)) {
    throw new Error("Invalid product ID");
  }
  try {
    await api.delete(`/products/${id}`);
  } catch (error) {
    console.error("Error deleting product:", error.response?.data || error.message);
    if (error.response?.status === 404) {
      throw new Error("Product not found");
    }
    throw new Error(error.response?.data?.message || "Failed to delete product");
  }
};