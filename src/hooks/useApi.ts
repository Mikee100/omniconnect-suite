import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { useAuthStore } from '@/state/authStore';

let apiClient: AxiosInstance;

const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
    timeout: 10000,
  });

  // Request interceptor to add auth token
  client.interceptors.request.use(
    (config: AxiosRequestConfig) => {
      const token = useAuthStore.getState().token;
      if (token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        };
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor to handle token refresh or logout on 401
  client.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Token expired or invalid, logout user
        useAuthStore.getState().logout();
      }
      return Promise.reject(error);
    }
  );

  return client;
};

export const useApi = () => {
  if (!apiClient) {
    apiClient = createApiClient();
  }

  return apiClient;
};
