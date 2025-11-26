// Poll booking/payment status for a customerId
export const pollBookingStatus = async (customerId: string): Promise<{ status: 'pending' | 'confirmed' | 'none', booking?: any }> => {
  const response = await api.get(`/bookings/status/${customerId}`);
  return response.data;
};
// Update booking draft for a customer
export const updateBookingDraft = async (customerId: string, updates: any) => {
  const response = await api.post(`/bookings/draft/${customerId}`, updates);
  return response.data;
};

export interface Package {
  id: string;
  name: string;
  type: string;
  price: number;
  deposit: number;
  duration: string;
  images: number;
  makeup: boolean;
  outfits: number;
  styling: boolean;
  photobook: boolean;
  photobookSize?: string;
  mount: boolean;
  balloonBackdrop: boolean;
  wig: boolean;
  notes?: string;
}

export const getPackages = async (): Promise<Package[]> => {
  const response = await api.get('/bookings/packages');
  return Array.isArray(response.data) ? response.data : [];
};
import { useApi } from '@/hooks/useApi';

const api = useApi();

export interface Booking {
  id: string;
  customerId: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  service: string;
  dateTime: string;
  status: 'provisional' | 'confirmed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  name: string;
  duration: number;
}

export const listBookings = async (params?: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<{ bookings: Booking[]; total: number }> => {
  const response = await api.get('/bookings', { params });
  return response.data;
};

export const getBooking = async (id: string): Promise<Booking> => {
  const response = await api.get(`/bookings/${id}`);
  return response.data;
};

export const createBooking = async (bookingData: {
  customerId: string;
  customerName?: string;
  message?: string;
  service?: string;
  dateTime?: string;
}): Promise<Booking> => {
  const response = await api.post('/bookings', bookingData);
  return response.data;
};

export const getServices = async (): Promise<Service[]> => {
  const response = await api.get('/bookings/services');
  return response.data;
};

export const getAvailableSlots = async (date: string, service?: string): Promise<Date[]> => {
  const response = await api.get('/calendar/slots', { params: { date, service } });
  return response.data.map((slot: string) => new Date(slot));
};

export const updateBooking = async (id: string, bookingData: Partial<Booking>): Promise<Booking> => {
  const response = await api.put(`/bookings/${id}`, bookingData);
  return response.data;
};

export const confirmBooking = async (id: string): Promise<Booking> => {
  const response = await api.post(`/bookings/${id}/confirm`);
  return response.data;
};

export const cancelBooking = async (id: string): Promise<Booking> => {
  const response = await api.post(`/bookings/${id}/cancel`);
  return response.data;
};

// Get available and unavailable hours for a date (returns [{time, available}])
export const getAvailableHours = async (date: string, service?: string): Promise<{time: string, available: boolean}[]> => {
  const response = await api.get(`/bookings/available-hours/${date}`, { params: service ? { service } : {} });
  return response.data;
};
