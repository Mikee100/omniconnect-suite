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
import { Search, Plus, Calendar as CalendarIcon, Clock, User, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { listBookings, createBooking, getServices, getAvailableSlots, getAvailableHours, updateBookingDraft, pollBookingStatus, Booking as BookingType, Service, Package } from '@/api/bookings';
import axios from 'axios';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getPackageColor } from '@/utils/packageColors';
import { DayContentProps } from 'react-day-picker';

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

  // Helper to get package by id
  const getPackageById = (id: string) => packages.find(pkg => pkg.id === id);
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const { toast } = useToast();
  const { user } = useAuth();

  // Get bookings for a specific date
  const getBookingsForDate = (date: Date): Booking[] => {
    return bookings.filter(b => b.date.toDateString() === date.toDateString());
  };

  useEffect(() => {
    fetchBookings();
    fetchServices();
    fetchPackages();

    // Set up polling for real-time updates
    const pollInterval = setInterval(() => {
      fetchBookings();
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
      const hours = await getAvailableHours(selectedDate.toISOString().split('T')[0], selectedService);
      setAvailableHours(hours);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load available hours',
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

  const columns = [
    {
      header: 'Customer',
      accessor: 'customerName' as keyof Booking,
      cell: (row: Booking) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{row.customerName}</span>
          <span className="text-sm text-gray-500">{row.customerPhone}</span>
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
          <span className="text-gray-900">{row.date.toLocaleDateString()}</span>
          <span className="text-sm text-gray-500">{row.time}</span>
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
  ];

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Payment Pending Modal */}
        <Dialog open={isPaymentPending}>
          <DialogContent className="sm:max-w-md">
            <div className="flex flex-col items-center justify-center gap-4 py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-2" />
              <h3 className="text-lg font-semibold">Waiting for Payment</h3>
              <p className="text-center text-muted-foreground max-w-xs">
                Please complete the payment on your phone to confirm your booking.
              </p>
            </div>
          </DialogContent>
        </Dialog>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Bookings</h1>
            <p className="text-muted-foreground mt-1 text-lg">
              Manage appointments and schedules
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="shadow-sm">
                <Plus className="mr-2 h-5 w-5" />
                New Booking
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl">Create New Booking</DialogTitle>
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
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Left Column: Calendar & Upcoming */}
          <div className="lg:col-span-1 space-y-8">
            {/* Calendar Widget */}
            <Card className="border-none shadow-md overflow-hidden">
              <CardHeader className="bg-gradient-to-br from-blue-50 to-indigo-50/50 pb-4">
                <CardTitle className="text-lg flex items-center gap-2 text-blue-900">
                  <CalendarIcon className="h-5 w-5" />
                  Calendar
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 flex justify-center bg-white">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md"
                  dayContent={renderDayContent}
                />
              </CardContent>
            </Card>


            {/* Upcoming Bookings */}
            <Card className="border-none shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Upcoming</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[400px] overflow-y-auto px-6 pb-6 space-y-4">
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
                          <div key={booking.id} className="group flex items-start gap-3 p-3 rounded-xl bg-gray-50 hover:bg-blue-50/50 transition-colors border border-transparent hover:border-blue-100">
                            <div className="mt-1 h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: getPackageColor(booking.service) }} />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm text-gray-900 truncate">{booking.customerName}</p>
                              <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                                <Clock className="h-3 w-3" />
                                {booking.time}
                              </div>
                            </div>
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">
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

            {/* Bookings for Selected Date */}
            <Card className="border-none shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Bookings for Selected Date</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[300px] overflow-y-auto px-6 pb-6 space-y-4">
                  {(() => {
                    const selectedDayStr = selectedDate ? selectedDate.toDateString() : '';
                    const bookingsForDay = bookings.filter(b => b.date.toDateString() === selectedDayStr);
                    if (!selectedDate) {
                      return <div className="text-center py-8 text-muted-foreground">Select a date to view bookings.</div>;
                    }
                    if (bookingsForDay.length === 0) {
                      return <div className="text-center py-8 text-muted-foreground">No bookings for this date.</div>;
                    }
                    return bookingsForDay.map(booking => (
                      <div key={booking.id} className="group flex items-start gap-3 p-3 rounded-xl bg-gray-50 hover:bg-blue-50/50 transition-colors border border-transparent hover:border-blue-100">
                        <div className="mt-1 h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: getPackageColor(booking.service) }} />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-900 truncate">{booking.customerName}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                            <Clock className="h-3 w-3" />
                            {booking.time}
                          </div>
                        </div>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">
                          {booking.service}
                        </Badge>
                      </div>
                    ));
                  })()}
                </div>
              </CardContent>
            </Card>
            {/* Table Card */}
            <Card className="border-none shadow-md overflow-hidden bg-white">
              <div className="overflow-x-auto">
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