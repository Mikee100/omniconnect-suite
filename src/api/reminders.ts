import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface Reminder {
    id: string;
    bookingId: string;
    type: '48hr' | '24hr' | 'confirmation';
    scheduledFor: string;
    sentAt?: string;
    status: 'pending' | 'sent' | 'failed' | 'cancelled';
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

export interface ReminderFilters {
    bookingId?: string;
    type?: '48hr' | '24hr' | 'confirmation';
    status?: 'pending' | 'sent' | 'failed' | 'cancelled';
    limit?: number;
    offset?: number;
}

export const remindersApi = {
    async getReminders(filters?: ReminderFilters) {
        const response = await axios.get(`${API_URL}/reminders`, { params: filters });
        return response.data;
    },

    async getReminderById(id: string) {
        const response = await axios.get(`${API_URL}/reminders/${id}`);
        return response.data;
    },

    async getBookingReminders(bookingId: string) {
        const response = await axios.get(`${API_URL}/reminders/booking/${bookingId}`);
        return response.data;
    },

    async getUpcomingReminders(limit?: number) {
        const response = await axios.get(`${API_URL}/reminders/upcoming`, {
            params: { limit },
        });
        return response.data;
    },

    async sendReminder(id: string) {
        const response = await axios.post(`${API_URL}/reminders/${id}/send`);
        return response.data;
    },

    async updateReminder(id: string, data: Partial<Reminder>) {
        const response = await axios.patch(`${API_URL}/reminders/${id}`, data);
        return response.data;
    },

    async cancelReminder(id: string) {
        const response = await axios.delete(`${API_URL}/reminders/${id}`);
        return response.data;
    },
};
