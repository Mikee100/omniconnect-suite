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
import { Search, Plus, Calendar as CalendarIcon, Clock, User, Filter, RefreshCw, CheckCircle, FileText, Send, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { listBookings, createBooking, getServices, getAvailableSlots, getAvailableHours, updateBookingDraft, pollBookingStatus, getCalendarEvents, Booking as BookingType, Service, Package } from '@/api/bookings';
import { invoicesApi, Invoice } from '@/api/invoices';
import axios from 'axios';
import { API_BASE_URL as API_BASE } from '@/config';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

  // Helper to get package by id
  const getPackageById = (id: string) => packages.find(pkg => pkg.id === id);
  const { toast } = useToast();
  const { user } = useAuth();

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
    if (selectedDate && selectedService) {
      fetchAvailableHours();
    }
  }, [selectedDate, selectedService]);

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
        // Remove WhatsApp User prefix if present
        let name = b.customer.name;
        if (name && name.startsWith('WhatsApp User ')) {
          name = name.replace(/^WhatsApp User\s+/, '');
        }
        // If name is missing or 'Admin User', prefer phone, else fallback to 'No Name / No Phone'
        if (!name || name.trim().toLowerCase() === 'admin user') {
          if (b.customer.phone && b.customer.phone.trim() !== '') {
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

  const fetchAvailableHours = async () => {
    if (!selectedDate || !selectedService) return;
    try {
      // Format local date as YYYY-MM-DD
      const pad = (n: number) => n.toString().padStart(2, '0');
      const localDateStr = `${selectedDate.getFullYear()}-${pad(selectedDate.getMonth() + 1)}-${pad(selectedDate.getDate())}`;
      console.log('DEBUG: Fetching available hours for date:', localDateStr, 'service:', selectedService);
      const hours = await getAvailableHours(localDateStr, selectedService);
      console.log('DEBUG: Available hours response:', hours);
      setAvailableHours(hours);
      console.log('DEBUG: Available hours set in state:', hours);
    } catch (error) {
      console.log('DEBUG: Error fetching available hours:', error);
      toast({
        title: 'Error',
        description: 'Failed to load available hours',
        variant: 'destructive',
      });
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

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.service.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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

        {/* Header Section */}
        <PageHeader
          title="Bookings"
          description="Manage appointments and schedules"
          actions={
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="shadow-md hover:shadow-lg transition-all">
                  <Plus className="mr-2 h-5 w-5" />
                  New Booking
                </Button>
              </DialogTrigger>
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

                              return (
                                <Button
                                  key={time}
                                  variant={isSelected ? "default" : "outline"}
                                  disabled={!available}
                                  onClick={() => setSelectedTime(timeStr)}
                                  className={`w-full justify-start ${!available ? 'opacity-50' : ''}`}
                                  size="sm"
                                >
                                  {label}
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
          }
        />

        {/* Full-Width Calendar Section */}
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

        {/* Rest of the content */}
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Left Column: Upcoming */}
          <div className="lg:col-span-1 space-y-8"
          >

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

          {/* Right Column: All Bookings Table */}
          <div className="lg:col-span-2 space-y-6">

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name or service..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white border-gray-200 shadow-sm"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px] bg-white border-gray-200 shadow-sm">
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

            {/* Daily Timeline */}
            <Card className="border-border/50 shadow-lg">
              <CardHeader className="pb-4 border-b border-border/50">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-primary/10">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  Daily Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {renderDailyTimeline()}
              </CardContent>
            </Card>


            {/* Table Card */}
            <Card className="border-border/50 shadow-lg overflow-hidden">
              <div className="overflow-x-auto scrollbar-custom">
                <DataTable
                  data={filteredBookings}
                  columns={columns}
                  onRowClick={(booking) => {
                    console.log('Clicked booking:', booking);
                  }}
                />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}