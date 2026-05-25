import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "/api";

export const publicApi = axios.create({
  baseURL: `${API_BASE_URL}/public`,
});

export const adminApi = axios.create({
  baseURL: `${API_BASE_URL}/admin`,
});

adminApi.interceptors.request.use((config) => {
  const token = window.localStorage.getItem("mlsa_admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
