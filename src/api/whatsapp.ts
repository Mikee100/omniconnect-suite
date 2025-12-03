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

const api = createApiClient();

export interface WhatsAppSettings {
  apiKey?: string;
  phoneNumberId?: string;
  businessAccountId?: string;
  enabled?: boolean;
}

export interface WhatsAppMessage {
  id: string;
  customerId: string;
  content: string;
  direction: 'inbound' | 'outbound';
  createdAt: string;
}

export interface WhatsAppConversation {
  id: string;
  customerId: string;
  customerName: string;
  lastMessage: string;
  aiEnabled: boolean;
}

export const getWhatsAppSettings = () => api.get('/whatsapp/settings');
export const updateWhatsAppSettings = (settings: Partial<WhatsAppSettings>) =>
  api.post('/whatsapp/settings', settings);
export const testWhatsAppConnection = () => api.post('/whatsapp/test-connection');
export const sendWhatsAppMessage = (data: { to: string; message: string }) =>
  api.post('/whatsapp/send', data);
export const getWhatsAppMessages = (customerId?: string) =>
  api.get(`/whatsapp/messages?customerId=${customerId || ''}`);
export const getWhatsAppConversations = () => api.get('/whatsapp/conversations');
export const toggleCustomerAi = async (id: string, enabled: boolean) => {
  const response = await api.patch(`/customers/${id}/toggle-ai`, { enabled });
  return response.data;
};
export const getWhatsAppStats = () => api.get('/whatsapp/stats');
