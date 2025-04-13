import axios from "axios";

const API_BASE_URL = "https://pos-backend-h4im.onrender.com/api"; // Change to match your backend URL

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
