import axios from 'axios';

import { API_BASE_URL as API_URL } from '../config';

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
        const response = await axios.get(`${API_URL}/api/reminders`, { params: filters });
        return response.data;
    },

    async getReminderById(id: string) {
        const response = await axios.get(`${API_URL}/api/reminders/${id}`);
        return response.data;
    },

    async getBookingReminders(bookingId: string) {
        const response = await axios.get(`${API_URL}/api/reminders/booking/${bookingId}`);
        return response.data;
    },

    async getUpcomingReminders(limit?: number) {
        const response = await axios.get(`${API_URL}/api/reminders/upcoming`, {
            params: { limit },
        });
        return response.data;
    },

    async sendReminder(id: string) {
        const response = await axios.post(`${API_URL}/api/reminders/${id}/send`);
        return response.data;
    },

    async updateReminder(id: string, data: Partial<Reminder>) {
        const response = await axios.patch(`${API_URL}/api/reminders/${id}`, data);
        return response.data;
    },

    async cancelReminder(id: string) {
        const response = await axios.delete(`${API_URL}/api/reminders/${id}`);
        return response.data;
    },
};
