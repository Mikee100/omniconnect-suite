import { useState, useEffect } from 'react';
import { DataTable, Badge } from '@/components/DataTable';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Search, Plus, Calendar as CalendarIcon, Clock, User, Filter, RefreshCw, CheckCircle, FileText, Send, Download, TrendingUp, DollarSign, BarChart3, Activity, MoreVertical, Edit, Trash2, MessageSquare, Share2, Copy, X, Check, AlertCircle, Zap, Target, Users, CalendarDays, Package as PackageIcon, ArrowUpDown, FileDown, Eye, EyeOff, Bell, History, CreditCard, Phone, Mail, ExternalLink, ArrowRight, Info, MapPin, Timer, Receipt, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { listBookings, createBooking, getServices, getAvailableSlots, getAvailableHours, updateBookingDraft, pollBookingStatus, getCalendarEvents, getBooking, updateBooking, Booking as BookingType, Service, Package } from '@/api/bookings';
import { invoicesApi, Invoice } from '@/api/invoices';
import { followupsApi, Followup } from '@/api/followups';
import { remindersApi, Reminder } from '@/api/reminders';
import { getCustomer } from '@/api/customers';
import { getCustomerBookings } from '@/api/bookings';
import axios from 'axios';
import { API_BASE_URL as API_BASE } from '@/config';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { getPackageColor } from '@/utils/packageColors';
import { DayContentProps } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/PageHeader';

interface Booking {
  id: string;
  customerName: string;
  customerPhone?: string;
  service: string;
  date: Date;
  time: string;
  status: 'provisional' | 'confirmed' | 'cancelled';
  googleEventId?: string;
}

export default function Bookings() {
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [services, setServices] = useState<Service[]>([]);
  const [availableHours, setAvailableHours] = useState<{ time: string, available: boolean }[]>([]);
  const [creating, setCreating] = useState(false);
  const [packages, setPackages] = useState<Package[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string>('');
  const [isPaymentPending, setIsPaymentPending] = useState(false);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [invoices, setInvoices] = useState<Record<string, Invoice>>({});
  const [generatingInvoice, setGeneratingInvoice] = useState<string | null>(null);
  
  // New state for enhanced features
  const [statistics, setStatistics] = useState({
    total: 0,
    confirmed: 0,
    provisional: 0,
    cancelled: 0,
    revenue: 0,
    todayBookings: 0,
    thisWeekBookings: 0,
    thisMonthBookings: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [selectedBookings, setSelectedBookings] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'calendar' | 'timeline'>('table');
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [packageFilter, setPackageFilter] = useState<string>('all');
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [bookingNotes, setBookingNotes] = useState<Record<string, string>>({});
  const [editingNote, setEditingNote] = useState<string | null>(null);
  
  // Booking details modal state
  const [selectedBookingDetails, setSelectedBookingDetails] = useState<Booking | null>(null);
  const [bookingDetailsOpen, setBookingDetailsOpen] = useState(false);
  const [loadingBookingDetails, setLoadingBookingDetails] = useState(false);
  const [fullBookingData, setFullBookingData] = useState<any>(null);
  const [bookingReminders, setBookingReminders] = useState<Reminder[]>([]);
  const [bookingFollowups, setBookingFollowups] = useState<Followup[]>([]);
  const [bookingPayments, setBookingPayments] = useState<any[]>([]);
  
  // Edit/Reschedule state
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState<Date | undefined>(undefined);
  const [rescheduleTime, setRescheduleTime] = useState<string>('');
  const [rescheduleService, setRescheduleService] = useState<string>('');
  const [savingBooking, setSavingBooking] = useState(false);
  const [rescheduleAvailableHours, setRescheduleAvailableHours] = useState<{ time: string, available: boolean }[]>([]);
  const [loadingRescheduleHours, setLoadingRescheduleHours] = useState(false);
  
  // Customer context state
  const [customerContextOpen, setCustomerContextOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [customerHistory, setCustomerHistory] = useState<any>(null);
  const [loadingCustomerHistory, setLoadingCustomerHistory] = useState(false);

  // Helper to get package by id
  const getPackageById = (id: string) => packages.find(pkg => pkg.id === id);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Get bookings for a specific date
  const getBookingsForDate = (date: Date): Booking[] => {
    return bookings.filter(b => b.date.toDateString() === date.toDateString());
  };

  // Get calendar events for a specific date
  const getCalendarEventsForDate = (date: Date): any[] => {
    return calendarEvents.filter(event => {
      const eventDate = new Date(event.start?.dateTime || event.start?.date);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const fetchCalendarEvents = async () => {
    try {
      const events = await getCalendarEvents();
      setCalendarEvents(events);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load calendar events',
        variant: 'destructive',
      });
    }
  };

  const fetchInvoices = async () => {
    try {
      const allInvoices = await invoicesApi.getAllInvoices();
      const invoiceMap: Record<string, Invoice> = {};
      allInvoices.forEach(inv => {
        invoiceMap[inv.bookingId] = inv;
      });
      setInvoices(invoiceMap);
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
    }
  };

  // Fetch statistics
  const fetchStatistics = async () => {
    try {
      setLoadingStats(true);
      const [statusCounts, revenue, kpis] = await Promise.all([
        axios.get(`${API_BASE}/api/analytics/booking-status-counts`).catch(() => ({ data: {} })),
        axios.get(`${API_BASE}/api/analytics/revenue`).catch(() => ({ data: { total: 0 } })),
        axios.get(`${API_BASE}/api/analytics/business-kpis`).catch(() => ({ data: {} })),
      ]);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const thisWeek = new Date(today);
      thisWeek.setDate(today.getDate() - 7);
      const thisMonth = new Date(today);
      thisMonth.setMonth(today.getMonth() - 1);

      const todayBookings = bookings.filter(b => b.date >= today).length;
      const weekBookings = bookings.filter(b => b.date >= thisWeek).length;
      const monthBookings = bookings.filter(b => b.date >= thisMonth).length;

      setStatistics({
        total: bookings.length,
        confirmed: statusCounts.data?.confirmed || 0,
        provisional: statusCounts.data?.provisional || 0,
        cancelled: statusCounts.data?.cancelled || 0,
        revenue: revenue.data?.total || 0,
        todayBookings,
        thisWeekBookings: weekBookings,
        thisMonthBookings: monthBookings,
      });
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  // Fetch recent activity
  const fetchRecentActivity = async () => {
    try {
      const recent = bookings
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .slice(0, 10)
        .map(b => ({
          id: b.id,
          type: 'booking',
          action: b.status === 'confirmed' ? 'confirmed' : b.status === 'cancelled' ? 'cancelled' : 'created',
          customer: b.customerName,
          service: b.service,
          time: b.date,
          status: b.status,
        }));
      setRecentActivity(recent);
    } catch (error) {
      console.error('Failed to fetch recent activity:', error);
    }
  };

  useEffect(() => {
    fetchBookings();
    fetchServices();
    fetchPackages();
    fetchCalendarEvents();
    fetchInvoices();

    // Set up polling for real-time updates
    const pollInterval = setInterval(() => {
      fetchBookings();
      fetchCalendarEvents();
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(pollInterval);
  }, []);

  useEffect(() => {
    if (bookings.length > 0) {
      fetchStatistics();
      fetchRecentActivity();
    }
  }, [bookings]);

  const fetchPackages = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/bookings/packages`);
      const pkgs = Array.isArray(res.data) ? res.data : [];
      setPackages(pkgs);
      if (pkgs.length > 0) {
        const defaultPkg = pkgs[0];
        setSelectedPackage(defaultPkg.id);
        setSelectedService(defaultPkg.name);
      }
    } catch (err) {
      setPackages([]);
    }
  };

  // Sync service when package changes (e.g. if set externally or via other means)
  useEffect(() => {
    if (selectedPackage && packages.length > 0) {
      const pkg = packages.find(p => p.id === selectedPackage);
      if (pkg && pkg.name !== selectedService) {
        setSelectedService(pkg.name);
      }
    }
  }, [selectedPackage, packages]);

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableHours();
    } else {
      setAvailableHours([]);
    }
  }, [selectedDate, selectedService]);

  // Fetch available hours for reschedule
  useEffect(() => {
    if (rescheduleDate && editDialogOpen) {
      setLoadingRescheduleHours(true);
      const pad = (n: number) => n.toString().padStart(2, '0');
      const dateStr = `${rescheduleDate.getFullYear()}-${pad(rescheduleDate.getMonth() + 1)}-${pad(rescheduleDate.getDate())}`;
      getAvailableHours(dateStr, rescheduleService)
        .then(hours => {
          setRescheduleAvailableHours(Array.isArray(hours) ? hours : []);
        })
        .catch(() => {
          setRescheduleAvailableHours(generateFallbackHours(rescheduleDate));
        })
        .finally(() => {
          setLoadingRescheduleHours(false);
        });
    } else {
      setRescheduleAvailableHours([]);
    }
  }, [rescheduleDate, rescheduleService, editDialogOpen]);

  // Debug: Log timeline data when selectedDate changes
  useEffect(() => {
    if (selectedDate) {
      const dayBookings = getBookingsForDate(selectedDate);
      const dayEvents = getCalendarEventsForDate(selectedDate);
      console.log('Timeline Debug:', {
        selectedDate: selectedDate.toDateString(),
        dayBookings: dayBookings.map(b => ({ name: b.customerName, time: b.time, service: b.service })),
        dayEvents: dayEvents.map(e => ({ summary: e.summary, start: e.start?.dateTime || e.start?.date })),
        calendarEventsLength: calendarEvents.length
      });
    }
  }, [selectedDate, bookings, calendarEvents]);

  const fetchBookings = async () => {
    try {
      const response = await listBookings();
      const formattedBookings: Booking[] = response.bookings.map((b: any) => {
        // Helper function to check if a string looks like an ID (long alphanumeric)
        const isId = (str: string) => {
          if (!str) return false;
          // Check if it's a long alphanumeric string (likely an ID)
          return /^[a-z0-9]{20,}$/i.test(str.trim());
        };

        // Remove WhatsApp User prefix if present
        let name = b.customer.name;
        if (name && name.startsWith('WhatsApp User ')) {
          name = name.replace(/^WhatsApp User\s+/, '');
        }
        
        // If name is an ID, missing, or 'Admin User', prefer phone, else fallback to 'No Name / No Phone'
        if (!name || name.trim().toLowerCase() === 'admin user' || isId(name)) {
          if (b.customer.phone && b.customer.phone.trim() !== '' && !isId(b.customer.phone)) {
            name = b.customer.phone;
          } else {
            name = 'No Name / No Phone';
          }
        }
        return {
          id: b.id,
          customerName: name,
          customerPhone: b.customer.phone || '',
          service: b.service,
          date: new Date(b.dateTime),
          time: new Date(b.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: b.status,
          googleEventId: b.googleEventId,
        };
      });
      setBookings(formattedBookings);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load bookings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const servicesData = await getServices();
      setServices(servicesData);
      if (servicesData.length > 0) {
        setSelectedService(servicesData[0].name);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load services',
        variant: 'destructive',
      });
    }
  };

  // Generate fallback time slots (9am to 5pm, every 30 min)
  const generateFallbackHours = (date: Date): { time: string, available: boolean }[] => {
    const hours: { time: string, available: boolean }[] = [];
    const baseDate = new Date(date);
    baseDate.setHours(9, 0, 0, 0);
    
    for (let h = 9; h < 17; h++) {
      for (let m = 0; m < 60; m += 30) {
        const timeSlot = new Date(baseDate);
        timeSlot.setHours(h, m, 0, 0);
        hours.push({
          time: timeSlot.toISOString(),
          available: true // For admins, allow all times by default
        });
      }
    }
    return hours;
  };

  const fetchAvailableHours = async () => {
    if (!selectedDate) {
      setAvailableHours([]);
      return;
    }
    
    // Always try to fetch from API if we have a date (service is optional)
    try {
      // Format local date as YYYY-MM-DD
      const pad = (n: number) => n.toString().padStart(2, '0');
      const localDateStr = `${selectedDate.getFullYear()}-${pad(selectedDate.getMonth() + 1)}-${pad(selectedDate.getDate())}`;
      console.log('DEBUG: Fetching available hours for date:', localDateStr, 'service:', selectedService);
      const hours = await getAvailableHours(localDateStr, selectedService);
      console.log('DEBUG: Available hours response:', hours);
      
      // If we got hours, use them; otherwise generate fallback
      if (Array.isArray(hours) && hours.length > 0) {
        setAvailableHours(hours);
      } else {
        // Fallback: generate default time slots for admins
        console.log('DEBUG: No hours returned, using fallback');
        setAvailableHours(generateFallbackHours(selectedDate));
      }
    } catch (error) {
      console.error('DEBUG: Error fetching available hours:', error);
      // On error, generate fallback hours so admin can still select times
      console.log('DEBUG: Using fallback hours due to error');
      setAvailableHours(generateFallbackHours(selectedDate));
      // Only show toast for unexpected errors (network errors are common and handled gracefully)
      if (error instanceof Error && error.message && !error.message.toLowerCase().includes('network') && !error.message.toLowerCase().includes('fetch')) {
        toast({
          title: 'Warning',
          description: 'Using default time slots. Some times may be unavailable.',
          variant: 'default',
        });
      }
    }
  };

  const handleSyncCalendar = async () => {
    setSyncing(true);
    try {
      await axios.post(`${API_BASE}/api/calendar/sync`);
      toast({
        title: 'Calendar Synced',
        description: 'All confirmed bookings have been synced to Google Calendar',
      });
      fetchBookings(); // Refresh to get googleEventId
    } catch (error) {
      toast({
        title: 'Sync Failed',
        description: 'Failed to sync calendar. Check your Google Calendar setup.',
        variant: 'destructive',
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleGenerateInvoice = async (bookingId: string) => {
    setGeneratingInvoice(bookingId);
    try {
      const invoice = await invoicesApi.generateInvoice(bookingId);
      setInvoices(prev => ({ ...prev, [bookingId]: invoice }));
      toast({
        title: 'Invoice Generated',
        description: `Invoice ${invoice.invoiceNumber} created successfully`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate invoice',
        variant: 'destructive',
      });
    } finally {
      setGeneratingInvoice(null);
    }
  };

  const handleSendInvoice = async (invoiceId: string, customerName: string) => {
    try {
      await invoicesApi.sendInvoice(invoiceId);
      toast({
        title: 'Invoice Sent',
        description: `Invoice sent to ${customerName} via WhatsApp`,
      });
      // Update invoice status in state
      setInvoices(prev => ({
        ...prev,
        [Object.keys(prev).find(key => prev[key].id === invoiceId) || '']: {
          ...prev[Object.keys(prev).find(key => prev[key].id === invoiceId) || ''],
          status: 'sent' as const,
          sentAt: new Date().toISOString(),
        }
      }));
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send invoice',
        variant: 'destructive',
      });
    }
  };

  const handleCreateBooking = async () => {
    if (!selectedDate || !selectedTime || !selectedService || !user || !selectedPackage) return;
    // Validate recipient info
    const phoneToSend = recipientPhone;
    if (!recipientName || !phoneToSend || phoneToSend.trim().length < 8) {
      toast({
        title: 'Missing info',
        description: 'Please provide your name and a valid phone number.',
        variant: 'destructive',
      });
      return;
    }

    setCreating(true);
    try {
      const dateTime = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':').map(Number);
      dateTime.setHours(hours, minutes);

      // 1. Update booking draft
      await updateBookingDraft(user.id, {
        service: selectedService,
        packageId: selectedPackage,
        dateTimeIso: dateTime.toISOString(),
        name: recipientName,
        recipientName: recipientName,
        recipientPhone: phoneToSend,
      });

      // 2. Trigger STK push and payment
      const result = await fetch(`${API_BASE}/api/bookings/complete-draft/${user.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await result.json();

      toast({
        title: 'Payment Required',
        description: data.message || 'Please complete the payment on your phone to confirm the booking.',
      });

      setIsDialogOpen(false);
      setTimeout(() => setIsPaymentPending(true), 0); // Ensure state update before blocking

      // Poll for payment/booking confirmation using checkoutRequestId
      let pollCount = 0;
      const maxPolls = 20; // e.g. poll for up to 60 seconds (20 x 3s)
      const pollInterval = 3000;
      let status = 'pending';
      const checkoutRequestId = data.checkoutRequestId;
      if (!checkoutRequestId) {
        throw new Error('No checkoutRequestId returned from backend');
      }
      const { pollPaymentStatus } = await import('@/api/payments');
      while (status === 'pending' && pollCount < maxPolls) {
        // eslint-disable-next-line no-await-in-loop
        const res = await pollPaymentStatus(checkoutRequestId);
        console.log('[pollPaymentStatus]', res, 'pollCount:', pollCount, 'status:', status);
        if (!res || typeof res.status === 'undefined') {
          console.warn('No status returned from pollPaymentStatus:', res);
          break;
        }
        status = res.status;
        if (status === 'success' || status === 'confirmed') {
          toast({
            title: 'Booking Confirmed!',
            description: 'Your payment was received and your booking is now confirmed.',
            variant: 'default',
          });
          fetchBookings();
          setIsPaymentPending(false);
          break;
        }
        await new Promise(resolve => setTimeout(resolve, pollInterval));
        pollCount++;
      }
      if (status !== 'success' && status !== 'confirmed') {
        toast({
          title: 'Payment Pending',
          description: `We did not receive payment confirmation in time. Last status: ${status}. If you paid, please check your messages or contact support.`,
          variant: 'default',
        });
      }
      setSelectedDate(new Date());
      setSelectedTime('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to initiate payment or booking',
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  // Enhanced filtering
  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customerPhone?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || booking.status === statusFilter;
    const matchesPackage =
      packageFilter === 'all' || booking.service === packageFilter;
    const matchesDateRange =
      !dateRange.from || !dateRange.to ||
      (booking.date >= dateRange.from && booking.date <= dateRange.to);
    return matchesSearch && matchesStatus && matchesPackage && matchesDateRange;
  });

  // Bulk actions
  const handleBulkAction = async (action: 'confirm' | 'cancel' | 'delete') => {
    if (selectedBookings.length === 0) {
      toast({
        title: 'No selections',
        description: 'Please select bookings to perform this action',
        variant: 'destructive',
      });
      return;
    }

    try {
      for (const bookingId of selectedBookings) {
        if (action === 'confirm') {
          await axios.post(`${API_BASE}/api/bookings/${bookingId}/confirm`);
        } else if (action === 'cancel') {
          await axios.post(`${API_BASE}/api/bookings/${bookingId}/cancel`);
        }
      }
      toast({
        title: 'Success',
        description: `${action === 'confirm' ? 'Confirmed' : 'Cancelled'} ${selectedBookings.length} booking(s)`,
      });
      setSelectedBookings([]);
      fetchBookings();
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${action} bookings`,
        variant: 'destructive',
      });
    }
  };

  // Export functionality
  const handleExport = async (format: 'csv' | 'json') => {
    try {
      const data = filteredBookings.map(b => ({
        id: b.id,
        customer: b.customerName,
        phone: b.customerPhone || '',
        service: b.service,
        date: b.date.toLocaleDateString(),
        time: b.time,
        status: b.status,
      }));

      if (format === 'csv') {
        const headers = ['ID', 'Customer', 'Phone', 'Service', 'Date', 'Time', 'Status'];
        const rows = data.map(d => [
          d.id,
          d.customer,
          d.phone,
          d.service,
          d.date,
          d.time,
          d.status,
        ]);
        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bookings-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bookings-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }

      toast({
        title: 'Export successful',
        description: `Bookings exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: 'Export failed',
        description: 'Failed to export bookings',
        variant: 'destructive',
      });
    }
  };

  // Toggle booking selection
  const toggleBookingSelection = (bookingId: string) => {
    setSelectedBookings(prev =>
      prev.includes(bookingId)
        ? prev.filter(id => id !== bookingId)
        : [...prev, bookingId]
    );
  };

  // Save booking note
  const saveBookingNote = async (bookingId: string, note: string) => {
    try {
      // In a real implementation, this would save to the backend
      setBookingNotes(prev => ({ ...prev, [bookingId]: note }));
      setEditingNote(null);
      toast({
        title: 'Note saved',
        description: 'Booking note has been saved',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save note',
        variant: 'destructive',
      });
    }
  };

  // Fetch full booking details
  const fetchBookingDetails = async (booking: Booking) => {
    setLoadingBookingDetails(true);
    setSelectedBookingDetails(booking);
    setBookingDetailsOpen(true);
    
    try {
      // Fetch full booking data (includes payments, reminders, followups)
      const bookingData = await getBooking(booking.id);
      setFullBookingData(bookingData);
      
      // Extract payments, reminders, and followups from booking data
      if (bookingData.payments) {
        setBookingPayments(Array.isArray(bookingData.payments) ? bookingData.payments : []);
      } else {
        // Fallback: fetch payments separately
        try {
          const payments = await axios.get(`${API_BASE}/api/payments`, {
            params: { bookingId: booking.id }
          });
          setBookingPayments(Array.isArray(payments.data) ? payments.data : []);
        } catch (err) {
          setBookingPayments([]);
        }
      }
      
      if (bookingData.reminders) {
        setBookingReminders(Array.isArray(bookingData.reminders) ? bookingData.reminders : []);
      } else {
        // Fallback: fetch reminders separately
        try {
          const reminders = await remindersApi.getBookingReminders(booking.id);
          setBookingReminders(Array.isArray(reminders) ? reminders : []);
        } catch (err) {
          setBookingReminders([]);
        }
      }
      
      if (bookingData.followups) {
        setBookingFollowups(Array.isArray(bookingData.followups) ? bookingData.followups : []);
      } else {
        // Fallback: fetch followups separately
        try {
          const followups = await followupsApi.getBookingFollowups(booking.id);
          setBookingFollowups(Array.isArray(followups) ? followups : []);
        } catch (err) {
          setBookingFollowups([]);
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load booking details',
        variant: 'destructive',
      });
    } finally {
      setLoadingBookingDetails(false);
    }
  };

  // Fetch customer history
  const fetchCustomerHistory = async (booking: Booking) => {
    setLoadingCustomerHistory(true);
    setCustomerContextOpen(true);
    
    try {
      // Get full booking data to access customerId
      const fullBookingData = await getBooking(booking.id);
      const customerId = fullBookingData.customerId || (fullBookingData.customer as any)?.id;
      
      if (!customerId) {
        throw new Error('Customer ID not found');
      }

      setSelectedCustomerId(customerId);
      
      const [customer, customerBookingsData] = await Promise.all([
        getCustomer(customerId).catch(() => null),
        getCustomerBookings(customerId).catch(() => []),
      ]);
      
      const customerBookings = Array.isArray(customerBookingsData) ? customerBookingsData : (customerBookingsData?.bookings || []);
      
      // Calculate total spent from payments
      let totalSpent = 0;
      try {
        const paymentsResponse = await axios.get(`${API_BASE}/api/payments`, {
          params: { customerId }
        });
        const payments = Array.isArray(paymentsResponse.data) ? paymentsResponse.data : [];
        totalSpent = payments
          .filter((p: any) => p.status === 'success')
          .reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
      } catch (err) {
        console.error('Failed to fetch payments:', err);
      }
      
      setCustomerHistory({
        customer: customer || { 
          id: customerId, 
          name: booking.customerName, 
          phone: booking.customerPhone,
          email: null,
          platform: 'unknown',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          aiEnabled: true,
        },
        bookings: customerBookings,
        totalSpent,
        totalBookings: customerBookings.length,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load customer history',
        variant: 'destructive',
      });
    } finally {
      setLoadingCustomerHistory(false);
    }
  };

  // Handle reschedule booking
  const handleRescheduleBooking = async () => {
    if (!editingBooking || !rescheduleDate || !rescheduleTime) {
      toast({
        title: 'Missing information',
        description: 'Please select a new date and time',
        variant: 'destructive',
      });
      return;
    }

    setSavingBooking(true);
    try {
      const dateTime = new Date(rescheduleDate);
      const [hours, minutes] = rescheduleTime.split(':').map(Number);
      dateTime.setHours(hours, minutes);

      await updateBooking(editingBooking.id, {
        dateTime: dateTime.toISOString(),
        service: rescheduleService || editingBooking.service,
      });

      toast({
        title: 'Booking updated',
        description: 'Booking has been rescheduled successfully',
      });

      setEditDialogOpen(false);
      setEditingBooking(null);
      fetchBookings();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to reschedule booking',
        variant: 'destructive',
      });
    } finally {
      setSavingBooking(false);
    }
  };

  // Send reminder manually
  const handleSendReminder = async (reminderId: string) => {
    try {
      await remindersApi.sendReminder(reminderId);
      toast({
        title: 'Reminder sent',
        description: 'Reminder has been sent to the customer',
      });
      // Refresh reminders
      if (selectedBookingDetails) {
        const reminders = await remindersApi.getBookingReminders(selectedBookingDetails.id);
        setBookingReminders(Array.isArray(reminders) ? reminders : []);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send reminder',
        variant: 'destructive',
      });
    }
  };

  // Send followup manually
  const handleSendFollowup = async (followupId: string) => {
    try {
      await followupsApi.sendFollowup(followupId);
      toast({
        title: 'Followup sent',
        description: 'Followup has been sent to the customer',
      });
      // Refresh followups
      if (selectedBookingDetails) {
        const followups = await followupsApi.getBookingFollowups(selectedBookingDetails.id);
        setBookingFollowups(Array.isArray(followups) ? followups : []);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send followup',
        variant: 'destructive',
      });
    }
  };

  const upcomingBookings = bookings.filter(booking => booking.date >= new Date());
  const groupedBookings = upcomingBookings.reduce((acc, booking) => {
    const dateStr = booking.date.toDateString();
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(booking);
    return acc;
  }, {} as Record<string, Booking[]>);
  const sortedDates = Object.keys(groupedBookings).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  const getStatusVariant = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed':
        return 'default';
      case 'provisional':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      default:
        return 'default';
    }
  };

  // Custom day content renderer for calendar - shows colored dots for bookings
  const renderDayContent = (props: DayContentProps) => {
    const dayBookings = getBookingsForDate(props.date);

    return (
      <div className="relative w-full h-full flex flex-col items-center justify-center">
        <span>{props.date.getDate()}</span>
        {dayBookings.length > 0 && (
          <div className="flex gap-0.5 mt-1 absolute bottom-1">
            {dayBookings.slice(0, 3).map((booking, idx) => (
              <div
                key={`${booking.id}-${idx}`}
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: getPackageColor(booking.service) }}
                title={booking.service}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  // Render daily timeline in vertical card style
  const renderDailyTimeline = () => {
    if (!selectedDate) {
      return <div className="text-center py-8 text-muted-foreground">Select a date to view timeline.</div>;
    }
    const dayBookings = getBookingsForDate(selectedDate)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (dayBookings.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <Clock className="h-8 w-8 text-muted-foreground/30" />
          </div>
          <p className="text-muted-foreground font-medium">No bookings for this date</p>
          <p className="text-muted-foreground/70 text-sm mt-1">Book an appointment to see it here!</p>
        </div>
      );
    }

    return (
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-[27px] top-0 bottom-0 w-0.5 bg-border"></div>
        <div className="space-y-4">
          {dayBookings.map((booking, idx) => {
            const isFirst = idx === 0;
            return (
              <div key={booking.id} className="relative pl-16 pr-2 group">
                {/* Timeline dot */}
                <div className={cn(
                  "absolute left-5 top-3 w-4 h-4 rounded-full border-2 border-background shadow-sm transition-all duration-300 group-hover:scale-125",
                  isFirst ? "bg-primary ring-4 ring-primary/20" : "bg-muted-foreground/30"
                )}></div>
                {/* Content card */}
                <div className={cn(
                  "relative overflow-hidden rounded-xl border transition-all duration-300",
                  isFirst
                    ? "bg-card border-primary/50 shadow-md ring-1 ring-primary/20"
                    : "bg-card border-border hover:border-primary/30 hover:shadow-md"
                )}>
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Booking icon */}
                      <div className={cn(
                        "flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-transform duration-300 group-hover:scale-110",
                        isFirst ? "bg-primary/10" : "bg-muted"
                      )}>
                        <CalendarIcon className={cn("h-6 w-6", isFirst ? "text-primary" : "text-muted-foreground")} />
                      </div>
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h4 className="font-semibold text-foreground">{booking.customerName}</h4>
                          {isFirst && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-primary text-primary-foreground rounded-full">
                              Latest
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <Clock className="h-3.5 w-3.5" />
                          <span className="font-medium text-foreground">
                            {booking.time}
                          </span>
                          <span className="text-muted-foreground/50">•</span>
                          <span>
                            {booking.service}
                          </span>
                        </div>
                        {booking.customerPhone && (
                          <div className="mt-2 p-3 bg-muted/50 rounded-lg border border-border/50">
                            <p className="text-sm text-muted-foreground italic">{booking.customerPhone}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Decorative bar */}
                  <div className={cn(
                    "h-1 w-full",
                    isFirst ? "bg-primary" : "bg-muted"
                  )}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const columns = [
    {
      header: () => (
        <Checkbox
          checked={selectedBookings.length === filteredBookings.length && filteredBookings.length > 0}
          onCheckedChange={(checked) => {
            if (checked) {
              setSelectedBookings(filteredBookings.map(b => b.id));
            } else {
              setSelectedBookings([]);
            }
          }}
        />
      ),
      accessor: 'id' as keyof Booking,
      cell: (row: Booking) => (
        <Checkbox
          checked={selectedBookings.includes(row.id)}
          onCheckedChange={() => toggleBookingSelection(row.id)}
          onClick={(e) => e.stopPropagation()}
        />
      )
    },
    {
      header: 'Customer',
      accessor: 'customerName' as keyof Booking,
      cell: (row: Booking) => (
        <div className="flex flex-col">
          <span className="font-medium text-foreground">{row.customerName}</span>
          <span className="text-sm text-muted-foreground">{row.customerPhone}</span>
        </div>
      )
    },
    {
      header: 'Service',
      accessor: 'service' as keyof Booking,
      cell: (row: Booking) => {
        const color = getPackageColor(row.service);
        return (
          <span
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
            style={{
              backgroundColor: `${color}20`, // 20% opacity
              color: color,
              border: `1px solid ${color}40`
            }}
          >
            {row.service}
          </span>
        );
      }
    },
    {
      header: 'Date & Time',
      accessor: (row: Booking) => row.date.toLocaleDateString(),
      cell: (row: Booking) => (
        <div className="flex flex-col">
          <span className="text-foreground">{row.date.toLocaleDateString()}</span>
          <span className="text-sm text-muted-foreground">{row.time}</span>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: (row: Booking) => (
        <Badge variant={getStatusVariant(row.status)} className="capitalize">
          {row.status}
        </Badge>
      ),
    },
    {
      header: 'Invoice',
      accessor: (row: Booking) => {
        const invoice = invoices[row.id];

        if (!invoice) {
          return (
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                handleGenerateInvoice(row.id);
              }}
              disabled={generatingInvoice === row.id || row.status !== 'confirmed'}
              className="h-8"
            >
              <FileText className="h-3.5 w-3.5 mr-1.5" />
              {generatingInvoice === row.id ? 'Generating...' : 'Generate'}
            </Button>
          );
        }

        return (
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <Button
              size="sm"
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => window.open(invoicesApi.downloadInvoice(invoice.id), '_blank')}
              title="Download PDF"
            >
              <Download className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="sm"
              variant={invoice.status === 'sent' ? 'secondary' : 'default'}
              className="h-8"
              onClick={() => handleSendInvoice(invoice.id, row.customerName)}
              disabled={invoice.status === 'sent'}
            >
              <Send className="h-3.5 w-3.5 mr-1.5" />
              {invoice.status === 'sent' ? 'Sent' : 'Send'}
            </Button>
          </div>
        );
      },
    },
    {
      header: 'Actions',
      accessor: (row: Booking) => {
        return (
          <Popover>
            <PopoverTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56" onClick={(e) => e.stopPropagation()}>
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    fetchBookingDetails(row);
                  }}
                >
                  <Info className="h-4 w-4 mr-2" />
                  View Details
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    setEditingNote(row.id);
                  }}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  {bookingNotes[row.id] ? 'Edit Note' : 'Add Note'}
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    setEditingBooking(row);
                    setRescheduleDate(row.date);
                    setRescheduleTime(row.time);
                    setRescheduleService(row.service);
                    setEditDialogOpen(true);
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit/Reschedule
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    fetchCustomerHistory(row);
                  }}
                >
                  <History className="h-4 w-4 mr-2" />
                  Customer History
                </Button>
                {row.status === 'provisional' && (
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={async () => {
                      try {
                        await axios.post(`${API_BASE}/api/bookings/${row.id}/confirm`);
                        toast({ title: 'Booking confirmed' });
                        fetchBookings();
                      } catch (error) {
                        toast({ title: 'Error', description: 'Failed to confirm booking', variant: 'destructive' });
                      }
                    }}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Confirm
                  </Button>
                )}
                {row.status !== 'cancelled' && (
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={async () => {
                      try {
                        await axios.post(`${API_BASE}/api/bookings/${row.id}/cancel`);
                        toast({ title: 'Booking cancelled' });
                        fetchBookings();
                      } catch (error) {
                        toast({ title: 'Error', description: 'Failed to cancel booking', variant: 'destructive' });
                      }
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                )}
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    navigator.clipboard.writeText(row.id);
                    toast({ title: 'Copied', description: 'Booking ID copied to clipboard' });
                  }}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy ID
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        );
      },
    },
  ];

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle-bg p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">

        {/* Payment Pending Modal */}
        <Dialog open={isPaymentPending}>
          <DialogContent className="sm:max-w-md">
            <div className="flex flex-col items-center justify-center gap-4 py-8">
              <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-primary mb-3 shadow-lg shadow-primary/20" />
              <h3 className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Waiting for Payment</h3>
              <p className="text-center text-muted-foreground max-w-xs">
                Please complete the payment on your phone to confirm your booking.
              </p>
            </div>
          </DialogContent>
        </Dialog>

        {/* ============================================
            HEADER SECTION
            ============================================ */}
        <div className="space-y-4">
        <PageHeader
          title="Bookings"
          description="Manage appointments and schedules"
          actions={
              <div className="flex items-center gap-2 flex-wrap">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="shadow-md hover:shadow-lg transition-all">
                  <Plus className="mr-2 h-5 w-5" />
                  New Booking
                </Button>
              </DialogTrigger>
                </Dialog>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  {showAdvancedFilters ? 'Hide' : 'Advanced'} Filters
                </Button>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48">
                    <div className="space-y-2">
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => handleExport('csv')}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Export as CSV
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => handleExport('json')}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Export as JSON
                      </Button>
                  </div>
                  </PopoverContent>
                </Popover>
              </div>
            }
          />

          {/* Statistics Cards - Overview at Top */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-border/50 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-foreground">{statistics.total}</div>
                  <p className="text-xs text-muted-foreground mt-1">All time</p>
                  </div>
                <div className="p-3 rounded-full bg-primary/10">
                  <CalendarIcon className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Confirmed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-green-600">{statistics.confirmed}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {statistics.total > 0 ? Math.round((statistics.confirmed / statistics.total) * 100) : 0}% of total
                  </p>
                              </div>
                <div className="p-3 rounded-full bg-green-100">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                            </div>
                  </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-blue-600">{statistics.thisMonthBookings}</div>
                  <p className="text-xs text-muted-foreground mt-1">Bookings this month</p>
                      </div>
                <div className="p-3 rounded-full bg-blue-100">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                    </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-purple-600">
                    KSh {statistics.revenue.toLocaleString()}
                          </div>
                  <p className="text-xs text-muted-foreground mt-1">Total revenue</p>
                </div>
                <div className="p-3 rounded-full bg-purple-100">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          </div>
        </div>

        {/* ============================================
            FILTERS & ACTIONS SECTION
            ============================================ */}
        <div className="space-y-4">
          {/* Quick Actions & Bulk Operations */}
          {selectedBookings.length > 0 && (
            <Card className="border-primary/50 bg-primary/5 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-foreground">
                      {selectedBookings.length} booking{selectedBookings.length > 1 ? 's' : ''} selected
                    </span>
                                <Button
                      variant="ghost"
                                  size="sm"
                      onClick={() => setSelectedBookings([])}
                                >
                      <X className="h-4 w-4" />
                                </Button>
                          </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkAction('confirm')}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Confirm Selected
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkAction('cancel')}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel Selected
                    </Button>
                      </div>
                    </div>
              </CardContent>
            </Card>
          )}

          {/* Advanced Filters */}
          {showAdvancedFilters && (
          <Card className="border-border/50 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Advanced Filters</CardTitle>
              <CardDescription>Filter bookings by multiple criteria</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Date Range</Label>
                  <div className="flex gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateRange.from ? dateRange.from.toLocaleDateString() : 'From'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={dateRange.from}
                          onSelect={(date) => setDateRange(prev => ({ ...prev, from: date }))}
                        />
                      </PopoverContent>
                    </Popover>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateRange.to ? dateRange.to.toLocaleDateString() : 'To'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={dateRange.to}
                          onSelect={(date) => setDateRange(prev => ({ ...prev, to: date }))}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Package/Service</Label>
                  <Select value={packageFilter} onValueChange={setPackageFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All packages" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Packages</SelectItem>
                      {packages.map((pkg) => (
                        <SelectItem key={pkg.id} value={pkg.name}>
                          {pkg.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Quick Date Filters</Label>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const today = new Date();
                        setDateRange({ from: today, to: today });
                      }}
                    >
                      Today
                  </Button>
                  <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const today = new Date();
                        const weekAgo = new Date(today);
                        weekAgo.setDate(today.getDate() - 7);
                        setDateRange({ from: weekAgo, to: today });
                      }}
                    >
                      Last 7 Days
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDateRange({})}
                    >
                      Clear
                  </Button>
                </div>
                </div>
              </div>
            </CardContent>
          </Card>
          )}

          {/* Quick Search & Status Filter - Always Visible */}
          <Card className="border-border/50 shadow-lg">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, service, or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-background"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-muted-foreground" />
                      <SelectValue placeholder="Status" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="provisional">Provisional</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ============================================
            MAIN CONTENT AREA - TABS
            ============================================ */}
        <Tabs defaultValue="overview" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Activity
              </TabsTrigger>
            </TabsList>
            <div className="text-sm text-muted-foreground">
              {filteredBookings.length} booking{filteredBookings.length !== 1 ? 's' : ''} found
            </div>
          </div>

          <TabsContent value="overview" className="space-y-6">
            {/* Calendar & Selected Date Bookings */}
        <Card className="border-border/50 shadow-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 pb-6 shadow-lg">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
                  <CalendarIcon className="h-6 w-6" />
                </div>
                Booking Calendar
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                className="bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-sm shadow-md hover:shadow-lg transition-all"
                onClick={handleSyncCalendar}
                disabled={syncing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'Syncing...' : 'Sync Google Calendar'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6 sm:p-8 bg-card">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Left: Large Calendar */}
              <div className="flex justify-center items-start">
                <div className="w-full">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-lg border-2 border-gray-200 p-4 w-full [&>div]:w-full [&_table]:w-full [&_td]:p-3 [&_th]:p-3 [&_button]:h-12 [&_button]:w-12 [&_button]:text-base"
                    dayContent={renderDayContent}
                  />
                </div>
              </div>

              {/* Right: Bookings for Selected Date */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedDate ? selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : 'Select a date'}
                </h3>
                <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2">
                  {(() => {
                    const selectedDayStr = selectedDate ? selectedDate.toDateString() : '';
                    const bookingsForDay = bookings.filter(b => b.date.toDateString() === selectedDayStr);

                    if (!selectedDate) {
                      return (
                        <div className="text-center py-16 text-muted-foreground">
                          <CalendarIcon className="h-12 w-12 mx-auto mb-3 opacity-20" />
                          <p className="text-sm">Select a date to view bookings</p>
                        </div>
                      );
                    }
                    if (bookingsForDay.length === 0) {
                      return (
                        <div className="text-center py-16 text-muted-foreground">
                          <Clock className="h-12 w-12 mx-auto mb-3 opacity-20" />
                          <p className="text-sm">No bookings for this date</p>
                        </div>
                      );
                    }

                    return bookingsForDay.map(booking => (
                      <div key={booking.id} className="group flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-muted/50 to-background hover:from-primary/5 hover:to-muted/50 transition-all duration-200 border border-border/50 hover:border-primary/30 hover:shadow-md">
                        <div className="mt-1 h-3 w-3 rounded-full flex-shrink-0 shadow-sm ring-2 ring-white" style={{ backgroundColor: getPackageColor(booking.service) }} />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-base text-foreground truncate group-hover:text-primary transition-colors">{booking.customerName}</p>
                          <p className="text-sm text-muted-foreground mt-1">{booking.service}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                            <Clock className="h-4 w-4" />
                            {booking.time}
                          </div>
                          {booking.googleEventId && (
                            <div className="flex items-center gap-1.5 text-xs text-success font-medium mt-2">
                              <CheckCircle className="h-3.5 w-3.5" />
                              Synced to Google Calendar
                            </div>
                          )}
                        </div>
                        <Badge variant={getStatusVariant(booking.status)} className="capitalize shadow-sm">
                          {booking.status}
                        </Badge>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

            {/* Main Content Grid: Upcoming Bookings + Timeline */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Left Column: Upcoming Bookings Sidebar */}
              <div className="lg:col-span-1">
                {/* Upcoming Bookings */}
                <Card className="border-border/50 shadow-lg">
                  <CardHeader className="pb-4 border-b border-border/50">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      Upcoming
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="max-h-[400px] overflow-y-auto px-6 pb-6 space-y-4 scrollbar-custom">
                      {sortedDates.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <p>No upcoming bookings</p>
                        </div>
                      ) : (
                        sortedDates.slice(0, 3).map(dateStr => (
                          <div key={dateStr} className="space-y-3">
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider sticky top-0 bg-white py-2">
                              {new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                            </h4>
                            {groupedBookings[dateStr].map(booking => (
                              <div key={booking.id} className="group flex items-start gap-3 p-3 rounded-lg bg-gradient-to-br from-muted/30 to-background hover:from-primary/5 hover:to-muted/30 transition-all duration-200 border border-border/30 hover:border-primary/20 hover:shadow-sm">
                                <div className="mt-1 h-2 w-2 rounded-full flex-shrink-0 ring-1 ring-white" style={{ backgroundColor: getPackageColor(booking.service) }} />
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm text-foreground truncate group-hover:text-primary transition-colors">{booking.customerName}</p>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                    <Clock className="h-3 w-3" />
                                    {booking.time}
                                  </div>
                                </div>
                                <Badge variant="outline" className="text-[10px] px-2 py-0.5 h-5 border-border/50 shadow-sm">
                                  {booking.service}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column: Timeline */}
              <div className="lg:col-span-2">
                {/* Daily Timeline for Selected Date */}
                <Card className="border-border/50 shadow-lg">
                  <CardHeader className="pb-4 border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-primary/10">
                        <Clock className="h-5 w-5 text-primary" />
                      </div>
                      Daily Timeline
                      {selectedDate && (
                        <span className="text-sm font-normal text-muted-foreground ml-2">
                          • {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {renderDailyTimeline()}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* All Bookings Table - Separate Section */}
            <Card className="border-border/50 shadow-lg overflow-hidden">
              <CardHeader className="pb-4 border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent">
                <CardTitle className="text-lg font-semibold flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    All Bookings
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {filteredBookings.length} total
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto scrollbar-custom">
                  <DataTable
                    data={filteredBookings}
                    columns={columns}
                    onRowClick={(booking) => {
                      fetchBookingDetails(booking);
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Status Distribution */}
              <Card className="border-border/50 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b">
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <BarChart3 className="h-5 w-5 text-primary" />
      </div>
                    Booking Status Distribution
                  </CardTitle>
                  <CardDescription>Current booking status breakdown</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full bg-green-500"></div>
                        <span className="font-medium">Confirmed</span>
    </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-green-700 dark:text-green-400">{statistics.confirmed}</span>
                        {statistics.total > 0 && (
                          <span className="text-xs text-muted-foreground">
                            ({Math.round((statistics.confirmed / statistics.total) * 100)}%)
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                        <span className="font-medium">Provisional</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-yellow-700 dark:text-yellow-400">{statistics.provisional}</span>
                        {statistics.total > 0 && (
                          <span className="text-xs text-muted-foreground">
                            ({Math.round((statistics.provisional / statistics.total) * 100)}%)
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full bg-red-500"></div>
                        <span className="font-medium">Cancelled</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-red-700 dark:text-red-400">{statistics.cancelled}</span>
                        {statistics.total > 0 && (
                          <span className="text-xs text-muted-foreground">
                            ({Math.round((statistics.cancelled / statistics.total) * 100)}%)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Booking Trends */}
              <Card className="border-border/50 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b">
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
                    Booking Trends
                  </CardTitle>
                  <CardDescription>Recent booking activity</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-muted/50 border border-border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-muted-foreground">Today</span>
                        <span className="text-2xl font-bold text-foreground">{statistics.todayBookings}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Bookings scheduled for today</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50 border border-border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-muted-foreground">This Week</span>
                        <span className="text-2xl font-bold text-foreground">{statistics.thisWeekBookings}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Bookings in the last 7 days</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50 border border-border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-muted-foreground">This Month</span>
                        <span className="text-2xl font-bold text-foreground">{statistics.thisMonthBookings}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Bookings in the current month</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card className="border-border/50 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Activity className="h-5 w-5 text-primary" />
                      </div>
                      Recent Activity
                    </CardTitle>
                    <CardDescription className="mt-1">Latest booking updates and changes</CardDescription>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {recentActivity.length} items
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  {recentActivity.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                        <Activity className="h-8 w-8 opacity-20" />
                      </div>
                      <p className="text-sm font-medium">No recent activity</p>
                      <p className="text-xs mt-1">Activity will appear here as bookings are created or updated</p>
                    </div>
                  ) : (
                    recentActivity.map((activity, idx) => (
                      <div
                        key={activity.id}
                        className="flex items-start gap-4 p-4 rounded-lg border border-border/50 hover:bg-muted/50 hover:border-primary/30 transition-all group"
                      >
                        <div className={cn(
                          "p-2.5 rounded-full flex-shrink-0 transition-transform group-hover:scale-110",
                          idx === 0 ? "bg-primary/10 ring-2 ring-primary/20" : "bg-muted"
                        )}>
                          <Clock className={cn(
                            "h-4 w-4",
                            idx === 0 ? "text-primary" : "text-muted-foreground"
                          )} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-semibold text-foreground">
                              {activity.customer}
                            </p>
                            <Badge variant={getStatusVariant(activity.status)} className="text-xs">
                              {activity.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <PackageIcon className="h-3 w-3" />
                            <span>{activity.service}</span>
                            <span>•</span>
                            <CalendarIcon className="h-3 w-3" />
                            <span>{activity.time.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* ============================================
            DIALOGS & MODALS
            ============================================ */}
        
        {/* Create Booking Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto border-border/50 shadow-2xl">
                <DialogHeader className="border-b border-border/50 pb-4">
                  <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    Create New Booking
                  </DialogTitle>
                </DialogHeader>

                <div className="grid gap-6 py-6">
                  <div className="grid gap-2">
                    <Label htmlFor="recipientName">Customer Name</Label>
                    <Input
                      id="recipientName"
                      value={recipientName}
                      onChange={e => setRecipientName(e.target.value)}
                      placeholder="Enter customer name"
                      className="h-11"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="recipientPhone">Phone Number</Label>
                    <Input
                      id="recipientPhone"
                      value={recipientPhone}
                      onChange={e => setRecipientPhone(e.target.value)}
                      placeholder="Enter phone number"
                      className="h-11"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label>Package</Label>
                    <Select value={selectedPackage} onValueChange={val => {
                      setSelectedPackage(val);
                      const pkg = getPackageById(val);
                      if (pkg) setSelectedService(pkg.name);
                    }}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select a package" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.isArray(packages) && packages.map((pkg) => (
                          <SelectItem key={pkg.id} value={pkg.id}>
                            <div className="flex items-center justify-between w-full gap-2">
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-2 h-2 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: getPackageColor(pkg.name) }}
                                />
                                <span>{pkg.name}</span>
                              </div>
                              <span className="text-muted-foreground text-sm">{pkg.price}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="grid gap-2">
                      <Label>Date</Label>
                      <div className="border rounded-md p-2 flex justify-center">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          className="rounded-md"
                        />
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label>Time</Label>
                      <div className="border rounded-md p-1 h-[300px] overflow-y-auto">
                        {availableHours.length === 0 ? (
                          <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4 text-center">
                            <Clock className="h-8 w-8 mb-2 opacity-20" />
                            <p className="text-sm">No available times.</p>
                            <p className="text-xs mt-1">Select a date and package first.</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-2 p-2">
                            {availableHours.map(({ time, available }) => {
                              const d = new Date(time);
                              const timeStr = d.toTimeString().split(' ')[0];
                              const label = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                              const isSelected = selectedTime === timeStr;

                              // For admins, allow selecting even if marked as unavailable (show warning style)
                              return (
                                <Button
                                  key={time}
                                  variant={isSelected ? "default" : available ? "outline" : "outline"}
                                  disabled={false} // Always enabled for admins
                                  onClick={() => setSelectedTime(timeStr)}
                                  className={`w-full justify-start ${!available ? 'opacity-70 border-orange-300 hover:border-orange-400' : ''}`}
                                  size="sm"
                                  title={!available ? 'This time slot may be occupied' : ''}
                                >
                                  {label}
                                  {!available && <span className="ml-1 text-xs">⚠</span>}
                                </Button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)} size="lg">
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateBooking}
                    disabled={creating || !selectedDate || !selectedTime || !selectedService || !selectedPackage || !recipientName || !recipientPhone}
                    size="lg"
                  >
                    {creating ? 'Creating...' : 'Confirm Booking'}
                  </Button>
                </div>
          </DialogContent>
        </Dialog>

        {/* Booking Note Dialog */}
        <Dialog open={editingNote !== null} onOpenChange={(open) => !open && setEditingNote(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Booking Note</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                placeholder="Add a note about this booking..."
                value={editingNote ? bookingNotes[editingNote] || '' : ''}
                onChange={(e) => {
                  if (editingNote) {
                    setBookingNotes(prev => ({ ...prev, [editingNote]: e.target.value }));
                  }
                }}
                rows={5}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingNote(null)}>
                  Cancel
                </Button>
                <Button onClick={() => editingNote && saveBookingNote(editingNote, bookingNotes[editingNote] || '')}>
                  Save Note
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Booking Details Modal */}
        <Dialog open={bookingDetailsOpen} onOpenChange={setBookingDetailsOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Booking Details</DialogTitle>
            </DialogHeader>
            
            {loadingBookingDetails ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
              </div>
            ) : selectedBookingDetails ? (
              <div className="space-y-6">
                {/* Booking Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CalendarIcon className="h-5 w-5" />
                      Booking Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-muted-foreground">Customer Name</Label>
                        <p className="font-semibold">{selectedBookingDetails.customerName}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Phone</Label>
                        <p className="font-semibold">{selectedBookingDetails.customerPhone || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Service</Label>
                        <p className="font-semibold">{selectedBookingDetails.service}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Status</Label>
                        <Badge variant={getStatusVariant(selectedBookingDetails.status)} className="capitalize">
                          {selectedBookingDetails.status}
                        </Badge>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Date</Label>
                        <p className="font-semibold">{selectedBookingDetails.date.toLocaleDateString()}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Time</Label>
                        <p className="font-semibold">{selectedBookingDetails.time}</p>
                      </div>
                    </div>
                    {fullBookingData?.durationMinutes && (
                      <div>
                        <Label className="text-muted-foreground">Duration</Label>
                        <p className="font-semibold">{fullBookingData.durationMinutes} minutes</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Payment Information */}
                {bookingPayments.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Payment Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {bookingPayments.map((payment: any) => (
                          <div key={payment.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                            <div>
                              <p className="font-semibold">KSh {payment.amount?.toLocaleString() || '0'}</p>
                              <p className="text-sm text-muted-foreground">
                                Status: <Badge variant={payment.status === 'success' ? 'default' : 'secondary'}>{payment.status}</Badge>
                              </p>
                              {payment.mpesaReceipt && (
                                <p className="text-xs text-muted-foreground mt-1">Receipt: {payment.mpesaReceipt}</p>
                              )}
                            </div>
                            <div className="text-right text-sm text-muted-foreground">
                              {new Date(payment.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Reminders */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bell className="h-5 w-5" />
                        Reminders
                      </div>
                      <Badge variant="outline">{bookingReminders.length}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {bookingReminders.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">No reminders scheduled</p>
                    ) : (
                      <div className="space-y-2">
                        {bookingReminders.map((reminder) => (
                          <div key={reminder.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{reminder.type} Reminder</p>
                                <Badge variant={reminder.status === 'sent' ? 'default' : reminder.status === 'pending' ? 'secondary' : 'destructive'}>
                                  {reminder.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Scheduled: {new Date(reminder.scheduledFor).toLocaleString()}
                              </p>
                              {reminder.sentAt && (
                                <p className="text-xs text-muted-foreground">
                                  Sent: {new Date(reminder.sentAt).toLocaleString()}
                                </p>
                              )}
                            </div>
                            {reminder.status === 'pending' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSendReminder(reminder.id)}
                              >
                                <Send className="h-4 w-4 mr-2" />
                                Send Now
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Followups */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="h-5 w-5" />
                        Followups
                      </div>
                      <Badge variant="outline">{bookingFollowups.length}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {bookingFollowups.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">No followups scheduled</p>
                    ) : (
                      <div className="space-y-2">
                        {bookingFollowups.map((followup) => (
                          <div key={followup.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-medium capitalize">{followup.type} Followup</p>
                                <Badge variant={followup.status === 'sent' ? 'default' : followup.status === 'pending' ? 'secondary' : 'destructive'}>
                                  {followup.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Scheduled: {new Date(followup.scheduledFor).toLocaleString()}
                              </p>
                              {followup.sentAt && (
                                <p className="text-xs text-muted-foreground">
                                  Sent: {new Date(followup.sentAt).toLocaleString()}
                                </p>
                              )}
                            </div>
                            {followup.status === 'pending' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSendFollowup(followup.id)}
                              >
                                <Send className="h-4 w-4 mr-2" />
                                Send Now
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Invoice */}
                {invoices[selectedBookingDetails.id] && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Invoice
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">Invoice #{invoices[selectedBookingDetails.id].invoiceNumber}</p>
                          <p className="text-sm text-muted-foreground">
                            Total: KSh {invoices[selectedBookingDetails.id].total?.toLocaleString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(invoicesApi.downloadInvoice(invoices[selectedBookingDetails.id].id), '_blank')}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                          <Button
                            size="sm"
                            variant={invoices[selectedBookingDetails.id].status === 'sent' ? 'secondary' : 'default'}
                            onClick={() => handleSendInvoice(invoices[selectedBookingDetails.id].id, selectedBookingDetails.customerName)}
                            disabled={invoices[selectedBookingDetails.id].status === 'sent'}
                          >
                            <Send className="h-4 w-4 mr-2" />
                            {invoices[selectedBookingDetails.id].status === 'sent' ? 'Sent' : 'Send'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingBooking(selectedBookingDetails);
                      setRescheduleDate(selectedBookingDetails.date);
                      setRescheduleTime(selectedBookingDetails.time);
                      setRescheduleService(selectedBookingDetails.service);
                      setBookingDetailsOpen(false);
                      setEditDialogOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit/Reschedule
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      fetchCustomerHistory(selectedBookingDetails);
                      setBookingDetailsOpen(false);
                    }}
                  >
                    <History className="h-4 w-4 mr-2" />
                    View Customer History
                  </Button>
                </div>
              </div>
            ) : null}
          </DialogContent>
        </Dialog>

        {/* Edit/Reschedule Booking Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Edit/Reschedule Booking</DialogTitle>
              <CardDescription>Update booking date, time, or service</CardDescription>
            </DialogHeader>
            
            {editingBooking && (
              <div className="space-y-6 py-4">
                <div className="grid gap-2">
                  <Label>Service/Package</Label>
                  <Select value={rescheduleService} onValueChange={setRescheduleService}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select service" />
                    </SelectTrigger>
                    <SelectContent>
                      {packages.map((pkg) => (
                        <SelectItem key={pkg.id} value={pkg.name}>
                          {pkg.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="grid gap-2">
                    <Label>New Date</Label>
                    <div className="border rounded-md p-2 flex justify-center">
                      <Calendar
                        mode="single"
                        selected={rescheduleDate}
                        onSelect={setRescheduleDate}
                        className="rounded-md"
                        disabled={(date) => date < new Date()}
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label>New Time</Label>
                    <div className="border rounded-md p-1 h-[300px] overflow-y-auto">
                      {!rescheduleDate ? (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4 text-center">
                          <Clock className="h-8 w-8 mb-2 opacity-20" />
                          <p className="text-sm">Select a date first</p>
                        </div>
                      ) : loadingRescheduleHours ? (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4 text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mb-2" />
                          <p className="text-sm">Loading available times...</p>
                        </div>
                      ) : rescheduleAvailableHours.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4 text-center">
                          <Clock className="h-8 w-8 mb-2 opacity-20" />
                          <p className="text-sm">No available times</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-2 p-2">
                          {rescheduleAvailableHours.map(({ time, available }) => {
                            const d = new Date(time);
                            const timeStr = d.toTimeString().split(' ')[0];
                            const label = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                            const isSelected = rescheduleTime === timeStr;
                            return (
                              <Button
                                key={time}
                                variant={isSelected ? "default" : available ? "outline" : "outline"}
                                disabled={!available}
                                onClick={() => setRescheduleTime(timeStr)}
                                className={`w-full justify-start ${!available ? 'opacity-50' : ''}`}
                                size="sm"
                              >
                                {label}
                                {!available && <span className="ml-1 text-xs">⚠</span>}
                              </Button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleRescheduleBooking}
                    disabled={savingBooking || !rescheduleDate || !rescheduleTime}
                  >
                    {savingBooking ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Customer Context Sidebar */}
        <Dialog open={customerContextOpen} onOpenChange={setCustomerContextOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <User className="h-6 w-6" />
                Customer History
              </DialogTitle>
            </DialogHeader>
            
            {loadingCustomerHistory ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
              </div>
            ) : customerHistory ? (
              <div className="space-y-6">
                {/* Customer Info */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Customer Information</CardTitle>
                      {selectedCustomerId && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            navigate(`/customers/${selectedCustomerId}`);
                            setCustomerContextOpen(false);
                          }}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Full Profile
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-muted-foreground">Name</Label>
                        <p className="font-semibold">{customerHistory.customer?.name || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Phone</Label>
                        <p className="font-semibold">{customerHistory.customer?.phone || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Total Bookings</Label>
                        <p className="font-semibold text-2xl">{customerHistory.totalBookings}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Total Spent</Label>
                        <p className="font-semibold text-2xl text-green-600">
                          KSh {customerHistory.totalSpent.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Previous Bookings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Previous Bookings</span>
                      <Badge variant="outline">{customerHistory.bookings.length}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {customerHistory.bookings.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">No previous bookings</p>
                    ) : (
                      <div className="space-y-3">
                        {customerHistory.bookings.slice(0, 10).map((booking: any) => (
                          <div
                            key={booking.id}
                            className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer"
                            onClick={() => {
                              const bookingObj: Booking = {
                                id: booking.id,
                                customerName: booking.customer?.name || 'Unknown',
                                customerPhone: booking.customer?.phone || '',
                                service: booking.service,
                                date: new Date(booking.dateTime),
                                time: new Date(booking.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                status: booking.status,
                                googleEventId: booking.googleEventId,
                              };
                              fetchBookingDetails(bookingObj);
                              setCustomerContextOpen(false);
                            }}
                          >
                            <div className="flex-1">
                              <p className="font-medium">{booking.service}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(booking.dateTime).toLocaleDateString()} • {new Date(booking.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                            <Badge variant={getStatusVariant(booking.status)} className="capitalize">
                              {booking.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : null}
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
}