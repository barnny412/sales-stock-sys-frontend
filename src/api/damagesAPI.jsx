import api from "./axiosConfig";

// 🔹 Fetch all damages
export const fetchDamages = async () => {
  try {
    const response = await api.get("/damages");
    return response.data;
  } catch (error) {
    console.error("Error fetching damages:", error);
    throw error;
  }
};

// 🔹 Add a new damage record
export const addDamage = async (damageData) => {
  console.log("Sending Damage Data:", damageData); // Debugging
  try {
    const response = await api.post("/damages", damageData);
    return response.data;
  } catch (error) {
    console.error("Error adding damage:", error);
    throw error;
  }
};

// 🔹 Update a damage record
export const updateDamage = async (id, updatedData) => {
  try {
    const response = await api.put(`/damages/${id}`, updatedData);
    return response.data;
  } catch (error) {
    console.error("Error updating damage:", error);
    throw error;
  }
};

// 🔹 Delete a damage record
export const deleteDamage = async (id) => {
  try {
    await api.delete(`/damages/${id}`);
  } catch (error) {
    console.error("Error deleting damage:", error);
    throw error;
  }
};
