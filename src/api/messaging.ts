import axios from 'axios';

const API_URL = 'http://localhost:3000';

export const instagramApi = {
    getStats: async () => {
        const response = await axios.get(`${API_URL}/instagram/stats`);
        return response.data;
    },

    getConversations: async () => {
        const response = await axios.get(`${API_URL}/instagram/analytics/conversations`);
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
