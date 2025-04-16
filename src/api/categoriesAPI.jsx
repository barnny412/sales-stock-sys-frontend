import api from "./axiosConfig";

// Fetch all categories
export const fetchCategories = async () => {
  try {
    const response = await api.get("/categories");
    return response.data;
  } catch (error) {
    console.error("Error fetching categories:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to fetch categories");
  }
};

// Fetch a single category by ID
export const fetchCategoryById = async (id) => {
  try {
    if (!id) {
      throw new Error("Category ID is required");
    }
    const response = await api.get(`/categories/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching category ${id}:`, error.response?.data || error.message);
    throw new Error(error.response?.data?.message || `Failed to fetch category with ID ${id}`);
  }
};

// Fetch a category by name
export const fetchCategoryByName = async (name) => {
  try {
    if (!name) {
      throw new Error("Category name is required");
    }
    const response = await api.get("/categories/name", { params: { name } });
    return response.data;
  } catch (error) {
    console.error(`Error fetching category by name ${name}:`, error.response?.data || error.message);
    throw new Error(error.response?.data?.message || `Failed to fetch category with name ${name}`);
  }
};

// Add a new category
export const addCategory = async (categoryData) => {
  try {
    if (!categoryData.name) {
      throw new Error("Category name is required");
    }
    const response = await api.post("/categories", categoryData);
    return response.data;
  } catch (error) {
    console.error("Error adding category:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to add category");
  }
};

// Update an existing category
export const updateCategory = async (id, categoryData) => {
  try {
    if (!id) {
      throw new Error("Category ID is required");
    }
    if (!categoryData.name) {
      throw new Error("Category name is required");
    }
    const response = await api.put(`/categories/${id}`, categoryData);
    return response.data;
  } catch (error) {
    console.error(`Error updating category ${id}:`, error.response?.data || error.message);
    throw new Error(error.response?.data?.message || `Failed to update category with ID ${id}`);
  }
};

// Delete a category
export const deleteCategory = async (id) => {
  try {
    if (!id) {
      throw new Error("Category ID is required");
    }
    await api.delete(`/categories/${id}`);
    return { message: `Category with ID ${id} deleted successfully` };
  } catch (error) {
    console.error(`Error deleting category ${id}:`, error.response?.data || error.message);
    throw new Error(error.response?.data?.message || `Failed to delete category with ID ${id}`);
  }
};