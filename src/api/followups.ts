import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface Followup {
    id: string;
    bookingId: string;
    type: 'delivery' | 'review_request' | 'upsell';
    scheduledFor: string;
    sentAt?: string;
    status: 'pending' | 'sent' | 'failed' | 'cancelled';
    metadata?: any;
    messageContent?: string;
    createdAt: string;
    booking: {
        id: string;
        service: string;
        dateTime: string;
        customer: {
            id: string;
            name: string;
            phone?: string;
        };
    };
}

export interface FollowupFilters {
    bookingId?: string;
    type?: 'delivery' | 'review_request' | 'upsell';
    status?: 'pending' | 'sent' | 'failed' | 'cancelled';
    limit?: number;
    offset?: number;
}

export interface FollowupAnalytics {
    total: number;
    sent: number;
    pending: number;
    responseRate: number;
    averageRating: number;
    totalReviews: number;
    upsellConversionRate: number;
}

export const followupsApi = {
    async getFollowups(filters?: FollowupFilters) {
        const response = await axios.get(`${API_URL}/followups`, { params: filters });
        return response.data;
    },

    async getFollowupById(id: string) {
        const response = await axios.get(`${API_URL}/followups/${id}`);
        return response.data;
    },

    async getBookingFollowups(bookingId: string) {
        const response = await axios.get(`${API_URL}/followups/booking/${bookingId}`);
        return response.data;
    },

    async getUpcomingFollowups(limit?: number) {
        const response = await axios.get(`${API_URL}/followups/upcoming`, {
            params: { limit },
        });
        return response.data;
    },

    async getAnalytics(): Promise<FollowupAnalytics> {
        const response = await axios.get(`${API_URL}/followups/analytics`);
        return response.data;
    },

    async sendFollowup(id: string) {
        const response = await axios.post(`${API_URL}/followups/${id}/send`);
        return response.data;
    },

    async recordResponse(id: string, data: { rating?: string; feedback?: string; upsellInterest?: string }) {
        const response = await axios.patch(`${API_URL}/followups/${id}/response`, data);
        return response.data;
    },

    async updateFollowup(id: string, data: Partial<Followup>) {
        const response = await axios.patch(`${API_URL}/followups/${id}`, data);
        return response.data;
    },

    async cancelFollowup(id: string) {
        const response = await axios.delete(`${API_URL}/followups/${id}`);
        return response.data;
    },
};
