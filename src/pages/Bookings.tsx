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
import { Search, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { listBookings, createBooking, getServices, getAvailableSlots, Booking as BookingType, Service } from '@/api/bookings';
import axios from 'axios';
import { useAuth } from '@/hooks/useAuth';

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

interface Package {
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

export default function Bookings() {
    const [bookingForSomeoneElse, setBookingForSomeoneElse] = useState(false);
    const [recipientName, setRecipientName] = useState('');
    const [recipientPhone, setRecipientPhone] = useState('');
    const [confirmPhone, setConfirmPhone] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [services, setServices] = useState<Service[]>([]);
  const [availableSlots, setAvailableSlots] = useState<Date[]>([]);
  const [creating, setCreating] = useState(false);
  const [packages, setPackages] = useState<Package[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string>('');
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const { toast } = useToast();
  const { user } = useAuth();

  // Service color map
  const serviceColors: Record<string, string> = {
    'Haircut': 'green',
    'Massage': 'red',
    'Facial': 'yellow',
    'Manicure': 'blue',
    'Pedicure': 'purple',
    // Add more as needed
  };

  // Get color for service, default to gray
  const getServiceColor = (service: string) => serviceColors[service] || 'gray';

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
      setPackages(Array.isArray(res.data) ? res.data : []);
      if (Array.isArray(res.data) && res.data.length > 0) {
        setSelectedPackage(res.data[0].id);
      }
    } catch (err) {
      setPackages([]);
    }
  };


  useEffect(() => {
    if (selectedDate && selectedService) {
      fetchAvailableSlots();
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

  const fetchAvailableSlots = async () => {
    if (!selectedDate || !selectedService) return;
    try {
      const slots = await getAvailableSlots(selectedDate.toISOString().split('T')[0], selectedService);
      setAvailableSlots(slots);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load available slots',
        variant: 'destructive',
      });
    }
  };

  const handleCreateBooking = async () => {
    if (!selectedDate || !selectedTime || !selectedService || !user || !selectedPackage) return;
    // Validate recipient info
    if (bookingForSomeoneElse && (!recipientName || !recipientPhone)) {
      toast({
        title: 'Missing info',
        description: 'Please provide the recipient\'s name and phone number.',
        variant: 'destructive',
      });
      return;
    }

    setCreating(true);
    try {
      const dateTime = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':').map(Number);
      dateTime.setHours(hours, minutes);

      await createBooking({
        customerId: user.id, // Assuming user.id is customerId
        customerName: user.name, // Send the real customer name
        service: selectedService,
        packageId: selectedPackage,
        dateTime: dateTime.toISOString(),
        recipientName: bookingForSomeoneElse ? recipientName : user.name,
        recipientPhone: bookingForSomeoneElse ? recipientPhone : (user?.phone || ''),
      });

      toast({
        title: 'Success',
        description: 'Booking created successfully',
      });
      setIsDialogOpen(false);
      fetchBookings();
      setSelectedDate(new Date());
      setSelectedTime('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create booking',
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

  // Generate modifiers for calendar based on services
  const calendarModifiers = Array.isArray(services)
    ? services.reduce((acc, service) => {
        acc[service.name] = bookings.filter(b => b.service === service.name).map(b => b.date);
        return acc;
      }, {} as Record<string, Date[]>)
    : {};

  // Add modifier for any date that has booking(s)
  calendarModifiers.hasBooking = bookings.map(b => b.date);

  const calendarModifiersStyles = Array.isArray(services)
    ? services.reduce((acc, service) => {
        const color = getServiceColor(service.name);
        acc[service.name] = {
          backgroundColor: color,
          color: 'white',
          fontWeight: 'bold'
        };
        return acc;
      }, {} as Record<string, React.CSSProperties>)
    : {};

  // Add style for hasBooking modifier to show green dot
  calendarModifiersStyles.hasBooking = {
    position: 'relative',
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: '4px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '8px',
      height: '8px',
      borderRadius: '9999px',
      backgroundColor: 'green',
      display: 'block',
    }
  };

  const columns = [
    {
      header: 'Customer',
      accessor: 'customerName' as keyof Booking,
    },
    {
      header: 'Service',
      accessor: 'service' as keyof Booking,
      cell: (row: Booking) => {
        const color = getServiceColor(row.service);
        return (
          <span
            style={{ 
              backgroundColor: color, 
              color: 'white', 
              borderRadius: '9999px', 
              padding: '0.35rem 1rem', 
              display: 'inline-block',
              boxShadow: `0 0 8px ${color}`,
              letterSpacing: '0.04em',
              textShadow: `0 0 2px rgba(0,0,0,0.3)`,
              fontWeight: '600'
            }}
          >
            {row.service}
          </span>
        );
      }
    },
    {
      header: 'Date',
      accessor: (row: Booking) => row.date.toLocaleDateString(),
    },
    {
      header: 'Time',
      accessor: 'time' as keyof Booking,
    },
    {
      header: 'Status',
      accessor: (row: Booking) => (
        <Badge variant={getStatusVariant(row.status)}>
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </Badge>
      ),
    },
  ];

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Bookings</h1>
        <p className="text-muted-foreground">
          Manage and track all customer bookings
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search bookings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="provisional">Provisional</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Booking
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                            <div className="mb-2">
                              <label className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={bookingForSomeoneElse}
                                  onChange={e => setBookingForSomeoneElse(e.target.checked)}
                                />
                                Booking for someone else?
                              </label>
                            </div>
                            {bookingForSomeoneElse ? (
                              <>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="recipientName" className="text-right">Recipient Name</Label>
                                  <Input
                                    id="recipientName"
                                    className="col-span-3"
                                    value={recipientName}
                                    onChange={e => setRecipientName(e.target.value)}
                                    placeholder="Enter recipient's name"
                                  />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="recipientPhone" className="text-right">Recipient Phone</Label>
                                  <Input
                                    id="recipientPhone"
                                    className="col-span-3"
                                    value={recipientPhone}
                                    onChange={e => setRecipientPhone(e.target.value)}
                                    placeholder="Enter recipient's phone number"
                                  />
                                </div>
                              </>
                            ) : (
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="confirmPhone" className="text-right">Is this your WhatsApp number?</Label>
                                <div className="col-span-3 flex items-center gap-2">
                                  <span>{user?.phone || 'No phone on profile'}</span>
                                  <input
                                    type="checkbox"
                                    checked={confirmPhone}
                                    onChange={e => setConfirmPhone(e.target.checked)}
                                  />
                                  <span>Yes</span>
                                </div>
                                {!confirmPhone && (
                                  <Input
                                    className="col-span-3 mt-2"
                                    value={recipientPhone}
                                    onChange={e => setRecipientPhone(e.target.value)}
                                    placeholder="Enter your preferred phone number"
                                  />
                                )}
                              </div>
                            )}
              <DialogHeader>
                <DialogTitle>Create New Booking</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {/* Service selection removed as it is no longer used in createBooking */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="package" className="text-right">
                    Package
                  </Label>
                  <Select value={selectedPackage} onValueChange={setSelectedPackage}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select package" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(packages) && packages.map((pkg) => (
                        <SelectItem key={pkg.id} value={pkg.id}>
                          {pkg.name} ({pkg.price})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Date</Label>
                  <div className="col-span-3">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-md border"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="time" className="text-right">
                    Time
                  </Label>
                  <Select value={selectedTime} onValueChange={setSelectedTime}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSlots.map((slot) => (
                        <SelectItem key={slot.toISOString()} value={slot.toTimeString().split(' ')[0]}>
                          {slot.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateBooking} disabled={creating}>
                  {creating ? 'Creating...' : 'Create Booking'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Enhanced Google Calendar - Full Screen Experience */}
      <div className="w-full bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden mb-10">
        <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <img 
            src="https://www.gstatic.com/images/branding/product/1x/calendar_2020q4_48dp.png" 
            alt="Google Calendar" 
            className="w-10 h-10"
          />
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Google Calendar Bookings</h2>
            <p className="text-lg text-gray-600 mt-1">Interactive calendar view of all your appointments</p>
          </div>
        </div>
        
        <div className="flex flex-col lg:flex-row p-6 gap-8 min-h-[800px]">
          {/* Calendar Container - Takes 70% width on large screens */}
          <div className="lg:w-3/4">
            <div className="bg-white rounded-2xl border-2 border-blue-100 p-8 shadow-lg">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="w-full"
                modifiers={calendarModifiers}
                modifiersStyles={calendarModifiersStyles}
                classNames={{
                  root: "text-3xl",
                  month: "space-y-8 w-full",
                  caption: "flex justify-center pt-1 relative items-center text-4xl",
                  caption_label: "text-4xl font-bold text-gray-900",
                  nav: "space-x-1 flex items-center",
                  nav_button: "h-12 w-12 bg-transparent p-0 opacity-50 hover:opacity-100",
                  nav_button_previous: "absolute left-1",
                  nav_button_next: "absolute right-1",
                  table: "w-full border-collapse space-y-6",
                  head_row: "flex justify-between mt-8",
                  head_cell: "text-gray-600 rounded-md w-16 font-bold text-2xl",
                  row: "flex w-full justify-between mt-4",
                  cell: "h-16 w-16 text-center text-2xl p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-gray-100 [&:has([aria-selected])]:bg-gray-100 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                  day: "h-16 w-16 p-0 font-normal text-2xl aria-selected:opacity-100 hover:bg-gray-100 rounded-lg",
                  day_selected: "bg-blue-600 text-white hover:bg-blue-700 focus:bg-blue-700",
                  day_today: "bg-blue-100 text-blue-900",
                  day_outside: "text-gray-400 opacity-50",
                  day_disabled: "text-gray-400 opacity-50",
                  day_range_middle: "aria-selected:bg-gray-100 aria-selected:text-gray-900",
                  day_hidden: "invisible",
                }}
              />
            </div>
          </div>

          {/* Bookings Sidebar - Takes 30% width on large screens */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-2xl border-2 border-gray-100 p-6 shadow-lg h-full">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Bookings for {selectedDate?.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h3>
              
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {(() => {
                  const filtered = bookings.filter(
                    booking => booking.date.toDateString() === selectedDate?.toDateString()
                  );
                  
                  if (filtered.length === 0) {
                    return (
                      <div className="text-center py-12">
                        <div className="text-6xl mb-4">📅</div>
                        <p className="text-xl text-gray-500 font-medium">No bookings for this date</p>
                        <p className="text-gray-400 mt-2">Select another date or create a new booking</p>
                      </div>
                    );
                  }
                  
                  return filtered.map(booking => (
                    <div 
                      key={booking.id} 
                      className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <p className="font-bold text-lg text-gray-900">{booking.customerName}</p>
                          <p className="text-base text-gray-600 mt-1">{booking.customerPhone}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge 
                              variant={getStatusVariant(booking.status)} 
                              className="text-sm px-3 py-1"
                            >
                              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </Badge>
                            <span className="text-sm font-medium text-gray-700">
                              {booking.time}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                        <span 
                          className="inline-block text-sm font-semibold px-4 py-1 rounded-full border"
                          style={{ 
                            backgroundColor: getServiceColor(booking.service), 
                            color: 'white',
                            borderColor: getServiceColor(booking.service),
                            boxShadow: `0 0 8px ${getServiceColor(booking.service)}`,
                            letterSpacing: '0.03em',
                            textShadow: `0 0 2px rgba(0,0,0,0.3)`
                          }}
                        >
                          {booking.service}
                        </span>
                        {booking.googleEventId ? (
                          <a
                            href={`https://calendar.google.com/calendar/u/0/r/eventedit/${booking.googleEventId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors duration-200"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                            </svg>
                            View in Calendar
                          </a>
                        ) : (
                          <span className="inline-flex items-center gap-2 text-gray-400 text-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            Not synced
                          </span>
                        )}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Upcoming Bookings List */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Upcoming Bookings</h2>
          <div className="space-y-4">
            {sortedDates.length === 0 ? (
              <p className="text-muted-foreground">No upcoming bookings</p>
            ) : (
              sortedDates.map(dateStr => (
                <div key={dateStr} className="rounded-lg border border-border bg-card p-4">
                  <h3 className="font-medium mb-3">{new Date(dateStr).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</h3>
                  <div className="space-y-2">
                    {groupedBookings[dateStr].map(booking => (
                      <div key={booking.id} className="flex items-center justify-between p-3 bg-accent/50 rounded">
                        <div>
                          <p className="font-medium">{booking.customerName}</p>
                          <p className="text-sm text-muted-foreground">{booking.customerPhone}</p>
                        </div>
                        <Badge variant={getStatusVariant(booking.status)}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Bookings Table */}
        <div>
          <h2 className="text-xl font-semibold mb-4">All Bookings</h2>
          <DataTable
            data={filteredBookings}
            columns={columns}
            onRowClick={(booking) => {
              // Handle row click if needed
              console.log('Clicked booking:', booking);
            }}
          />
        </div>
      </div>
    </div>
  );
}