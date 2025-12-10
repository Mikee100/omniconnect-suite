import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { useAuthStore } from '@/state/authStore';

import { API_BASE_URL } from '@/config';

export interface MessengerSettings {
  pageId?: string;
  pageAccessToken?: string;
  verifyToken?: string;
  enabled?: boolean;
}

export interface MessengerMessage {
  id: string;
  customerId: string;
  content: string;
  direction: 'inbound' | 'outbound';
  createdAt: string;
  from?: string;
  to?: string;
  timestamp?: string;
  customerName?: string;
}

export interface MessengerConversation {
  id: string;
  customerId: string;
  customerName: string;
  messengerId: string;
  lastMessage: string;
  lastMessageAt: string;
  aiEnabled: boolean;
}

// Note: Messenger endpoints are under /webhooks/messenger (not /api/messenger)
// because the controller is at @Controller('webhooks/messenger')
const messengerApi = axios.create({
  baseURL: `${API_BASE_URL}`,
  timeout: 10000,
});

// Request interceptor to add auth token
messengerApi.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh or logout on 401
messengerApi.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export const getMessengerSettings = () => messengerApi.get('/webhooks/messenger/settings');
export const updateMessengerSettings = (settings: Partial<MessengerSettings>) =>
  messengerApi.post('/webhooks/messenger/settings', settings);
export const testMessengerConnection = () => messengerApi.post('/webhooks/messenger/test-connection');
export const sendMessengerMessage = (data: { to: string; message: string }) =>
  messengerApi.post('/webhooks/messenger/send', data);
export const getMessengerMessages = (customerId?: string) =>
  messengerApi.get(`/webhooks/messenger/messages?customerId=${customerId || ''}`);
export const getMessengerConversations = () => messengerApi.get('/webhooks/messenger/conversations');
export const getMessengerStats = () => messengerApi.get('/webhooks/messenger/stats');

