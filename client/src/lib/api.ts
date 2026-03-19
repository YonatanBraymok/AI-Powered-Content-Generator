import axios from "axios";
import { toast } from "sonner";
import { getToken, removeToken } from "./auth";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeToken();
      if (typeof window !== "undefined") {
        toast.error("Session expired. Please sign in again.");
        window.location.href = "/login";
      }
    }

    const serverMessage =
      error.response?.data?.message ?? error.response?.data?.error;
    if (serverMessage) {
      error.message = serverMessage;
    }

    return Promise.reject(error);
  },
);

export default api;
