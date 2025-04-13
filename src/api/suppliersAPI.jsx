import api from "./axiosConfig";

export const fetchSuppliers = async () => {
  try {
    const response = await api.get("/suppliers");
    return response.data;
  } catch (error) {
    console.error("Error fetching suppliers data:", error);
    throw error;
  }
};
