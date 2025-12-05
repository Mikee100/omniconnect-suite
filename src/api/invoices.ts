import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface Invoice {
    id: string;
    invoiceNumber: string;
    bookingId: string;
    customerId: string;
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
    depositPaid: number;
    balanceDue: number;
    status: 'pending' | 'sent' | 'paid';
    sentAt?: string;
    paidAt?: string;
    pdfUrl?: string;
    createdAt: string;
    customer: {
        name: string;
        phone: string;
    };
    booking?: {
        id: string;
        service: string;
        dateTime: string;
    };
}

export const invoicesApi = {
    generateInvoice: async (bookingId: string): Promise<Invoice> => {
        const { data } = await axios.post(`${API_BASE}/api/invoices/generate/${bookingId}`);
        return data;
    },

    sendInvoice: async (invoiceId: string): Promise<void> => {
        await axios.post(`${API_BASE}/api/invoices/send/${invoiceId}`);
    },

    getInvoicesByBooking: async (bookingId: string): Promise<Invoice[]> => {
        const { data } = await axios.get(`${API_BASE}/api/invoices/booking/${bookingId}`);
        return data;
    },

    getInvoicesByCustomer: async (customerId: string): Promise<Invoice[]> => {
        const { data } = await axios.get(`${API_BASE}/api/invoices/customer/${customerId}`);
        return data;
    },

    getAllInvoices: async (): Promise<Invoice[]> => {
        const { data } = await axios.get(`${API_BASE}/api/invoices`);
        return data;
    },

    downloadInvoice: (invoiceId: string): string => {
        return `${API_BASE}/api/invoices/download/${invoiceId}`;
    },
};
