import api from './apiInstance';

export interface Customer {
    id: string;
    name: string | null;
    phone: string | null;
    email: string | null;
    platform: string;
    createdAt: string;
    updatedAt: string;
    aiEnabled: boolean;
    notes?: string;
    // Add other fields as needed based on backend response
}

export interface Message {
    id: string;
    content: string;
    direction: 'inbound' | 'outbound';
    platform: string;
    timestamp: string;
    createdAt: string;
    customerId: string;
}

export const getCustomers = async (): Promise<Customer[]> => {
    const response = await api.get('/customers');
    return response.data;
};

export const getCustomer = async (id: string): Promise<Customer> => {
    const response = await api.get(`/customers/${id}`);
    return response.data;
};

export const getCustomerMessages = async (customerId: string): Promise<Message[]> => {
    const response = await api.get(`/messages/${customerId}`);
    return response.data;
};

export const updateCustomer = async (id: string, data: Partial<Customer>): Promise<Customer> => {
    const response = await api.patch(`/customers/${id}`, data);
    return response.data;
};

export const toggleCustomerAi = async (id: string, enabled: boolean): Promise<Customer> => {
    const response = await api.patch(`/customers/${id}/toggle-ai`, { enabled });
    return response.data;
};

export const sendPhotoLink = async (customerId: string, link: string): Promise<void> => {
  await api.post(`/customers/${customerId}/send-photo-link`, { link });
};

export interface PhotoLink {
  id: string;
  link: string;
  sentAt: string;
  customerId: string;
}

export const getCustomerPhotoLinks = async (customerId: string): Promise<PhotoLink[]> => {
  const response = await api.get(`/customers/${customerId}/photo-links`);
  return response.data;
};
