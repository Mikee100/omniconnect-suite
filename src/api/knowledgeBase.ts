import axios from 'axios';

const API_URL = 'http://localhost:3000/api/knowledge-base'; // Adjust if base URL is different

export interface KBEntry {
    id: string;
    question: string;
    answer: string;
    category: string;
    createdAt?: string;
}

export const knowledgeBaseApi = {
    getAll: async (params?: { category?: string; search?: string }) => {
        const response = await axios.get(API_URL, { params });
        return response.data; // { items: [], total: number }
    },

    create: async (data: { question: string; answer: string; category: string }) => {
        const response = await axios.post(API_URL, data);
        return response.data;
    },

    update: async (id: string, data: Partial<{ question: string; answer: string; category: string }>) => {
        const response = await axios.patch(`${API_URL}/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await axios.delete(`${API_URL}/${id}`);
        return response.data;
    },
};
