import axios from 'axios';

import { API_BASE_URL as API_URL } from '@/config';

export const instagramApi = {
    getStats: async () => {
        const response = await axios.get(`${API_URL}/api/instagram/stats`);
        return response.data;
    },

    getConversations: async () => {
        const response = await axios.get(`${API_URL}/api/instagram/analytics/conversations`);
        return response.data;
    },
};

export const messengerApi = {
    getStats: async () => {
        const response = await axios.get(`${API_URL}/webhooks/messenger/stats`);
        return response.data;
    },

    getConversations: async () => {
        const response = await axios.get(`${API_URL}/webhooks/messenger/analytics/conversations`);
        return response.data;
    },
};
