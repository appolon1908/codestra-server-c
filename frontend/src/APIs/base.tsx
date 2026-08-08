import axios from "axios";
import { clearAccessToken, getAccessToken } from "@/lib/auth";

export const base_url = axios.create({
    baseURL: import.meta.env.VITE_API_ENDPOINT,
    timeout: 35000,
});


base_url.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

base_url.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) clearAccessToken();
    return Promise.reject(error);
  },
);
  
