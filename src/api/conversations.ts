import axios from 'axios';

const API_URL = 'http://localhost:3000';

export interface Message {
    id: string;
    content: string;
    platform: 'whatsapp' | 'instagram' | 'messenger';
    direction: 'inbound' | 'outbound';
    createdAt: string;
}

export interface Conversation {
    id: string; // customerId
    name: string;
    phone?: string;
    whatsappId?: string;
    instagramId?: string;
    messengerId?: string;
    platform: 'whatsapp' | 'instagram' | 'messenger';
    lastMessage: string;
    lastMessageAt: string;
    lastMessageDirection: string;
    messageCount: number;
    isActive: boolean;
}

export const conversationsApi = {
    getAll: async (platform?: string) => {
        const params = platform ? { platform } : {};
        const response = await axios.get(`${API_URL}/conversations`, { params });
        return response.data;
    },

    getById: async (id: string) => {
        const response = await axios.get(`${API_URL}/conversations/${id}`);
        return response.data;
    },

    getMessages: async (id: string, platform?: string) => {
        const params = platform ? { platform } : {};
        const response = await axios.get(`${API_URL}/conversations/${id}/messages`, { params });
        return response.data;
    },

    sendReply: async (id: string, message: string, platform: string) => {
        const response = await axios.post(`${API_URL}/conversations/${id}/reply`, {
            message,
            platform,
        });
        return response.data;
    },
};
