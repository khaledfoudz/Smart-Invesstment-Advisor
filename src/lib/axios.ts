import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    // Check if token is expired before attaching it
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const isExpired = payload.exp * 1000 < Date.now();

      if (isExpired) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/auth"; // redirect to login
        return Promise.reject(new Error("Token expired"));
      }
    } catch {
      // Malformed token
      localStorage.removeItem("token");
      window.location.href = "/auth";
      return Promise.reject(new Error("Invalid token"));
    }

    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Handle 401 responses globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/auth";
    }
    return Promise.reject(error);
  }
);

export default api;