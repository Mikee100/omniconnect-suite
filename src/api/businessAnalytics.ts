import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface BusinessKPIs {
    revenue: {
        total: number;
        count: number;
    };
    avgBookingValue: number;
    conversionRate: {
        rate: number;
        totalCustomers: number;
        convertedCustomers: number;
    };
    popularPackages: Array<{
        package: string;
        bookings: number;
    }>;
    customerMetrics: {
        totalCustomers: number;
        customersWithBookings: number;
        repeatCustomers: number;
        repeatRate: number;
        newCustomersThisMonth: number;
    };
    period: {
        start: Date;
        end: Date;
    };
}

export interface RevenueByPackage {
    package: string;
    revenue: number;
    bookings: number;
    avgValue: number;
}

export interface MonthlyRevenue {
    month: string;
    revenue: number;
    bookings: number;
}

export interface TimeSlot {
    hour: number;
    dayOfWeek: number;
    count: number;
}

export interface SeasonalTrend {
    month: string;
    currentYear: number;
    lastYear: number;
}

export interface CustomerLifetimeValue {
    clv: number;
    avgBookingsPerCustomer: number;
    avgBookingValue: number;
    repeatRate: number;
    totalCustomers: number;
    customersWithBookings: number;
    repeatCustomers: number;
}

export interface YearOverYearGrowth {
    currentYear: number;
    lastYear: number;
    growth: number;
    trend: 'up' | 'down' | 'stable';
}

export const businessAnalyticsApi = {
    async getBusinessKPIs(): Promise<BusinessKPIs> {
        const response = await axios.get(`${API_URL}/analytics/business-kpis`);
        return response.data;
    },

    async getRevenue() {
        const response = await axios.get(`${API_URL}/analytics/revenue`);
        return response.data;
    },

    async getRevenueByPackage(): Promise<RevenueByPackage[]> {
        const response = await axios.get(`${API_URL}/analytics/revenue-by-package`);
        return response.data;
    },

    async getMonthlyRevenue(): Promise<MonthlyRevenue[]> {
        const response = await axios.get(`${API_URL}/analytics/monthly-revenue`);
        return response.data;
    },

    async getConversionRate() {
        const response = await axios.get(`${API_URL}/analytics/conversion-rate`);
        return response.data;
    },

    async getPopularPackages() {
        const response = await axios.get(`${API_URL}/analytics/popular-packages`);
        return response.data;
    },

    async getPopularTimeSlots(): Promise<TimeSlot[]> {
        const response = await axios.get(`${API_URL}/analytics/popular-timeslots`);
        return response.data;
    },

    async getSeasonalTrends(): Promise<SeasonalTrend[]> {
        const response = await axios.get(`${API_URL}/analytics/seasonal-trends`);
        return response.data;
    },

    async getCustomerLifetimeValue(): Promise<CustomerLifetimeValue> {
        const response = await axios.get(`${API_URL}/analytics/customer-lifetime-value`);
        return response.data;
    },

    async getCustomerMetrics() {
        const response = await axios.get(`${API_URL}/analytics/customer-metrics`);
        return response.data;
    },

    async getYearOverYearGrowth(): Promise<YearOverYearGrowth> {
        const response = await axios.get(`${API_URL}/analytics/year-over-year-growth`);
        return response.data;
    },
};
