import api from "./axiosConfig";  // Make sure axiosConfig is set up correctly

export const fetchDashboardData = async () => {
  try {
    const response = await api.get("/dashboard"); // This should hit the '/dashboard' route
    return response.data;
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    throw error;
  }
};
