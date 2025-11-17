import { useState } from 'react';
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
import { Search } from 'lucide-react';

interface Booking {
  id: string;
  customerName: string;
  service: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  amount: string;
}

const mockBookings: Booking[] = [
  {
    id: '1',
    customerName: 'John Doe',
    service: 'Hair Cut',
    date: '2025-01-20',
    time: '10:00 AM',
    status: 'confirmed',
    amount: '$45',
  },
  {
    id: '2',
    customerName: 'Jane Smith',
    service: 'Massage Therapy',
    date: '2025-01-21',
    time: '2:00 PM',
    status: 'pending',
    amount: '$120',
  },
  {
    id: '3',
    customerName: 'Bob Johnson',
    service: 'Spa Treatment',
    date: '2025-01-22',
    time: '11:30 AM',
    status: 'confirmed',
    amount: '$180',
  },
  {
    id: '4',
    customerName: 'Alice Williams',
    service: 'Nail Service',
    date: '2025-01-20',
    time: '3:00 PM',
    status: 'cancelled',
    amount: '$35',
  },
];

export default function Bookings() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredBookings = mockBookings.filter((booking) => {
    const matchesSearch =
      booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.service.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusVariant = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      default:
        return 'default';
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
    },
    {
      header: 'Date',
      accessor: 'date' as keyof Booking,
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
    {
      header: 'Amount',
      accessor: 'amount' as keyof Booking,
      className: 'text-right font-medium',
    },
  ];

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
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Button>New Booking</Button>
        </div>
      </div>

      <DataTable data={filteredBookings} columns={columns} />
    </div>
  );
}
