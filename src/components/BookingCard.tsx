import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User, MapPin, Phone } from 'lucide-react';
import { formatDate } from '@/utils/formatDate';

interface Booking {
  id: string;
  customerName: string;
  service: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  location?: string;
  phone?: string;
}

interface BookingCardProps {
  booking: Booking;
  onStatusChange?: (id: string, status: Booking['status']) => void;
}

const BookingCard: React.FC<BookingCardProps> = ({ booking, onStatusChange }) => {
  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'confirmed':
        return 'bg-green-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold">{booking.service}</CardTitle>
          <Badge className={`${getStatusColor(booking.status)} text-white`}>
            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center space-x-2">
          <User className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium">{booking.customerName}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <span className="text-sm">{formatDate(booking.date)}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-gray-500" />
          <span className="text-sm">{booking.time}</span>
        </div>
        {booking.location && (
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-gray-500" />
            <span className="text-sm">{booking.location}</span>
          </div>
        )}
        {booking.phone && (
          <div className="flex items-center space-x-2">
            <Phone className="w-4 h-4 text-gray-500" />
            <span className="text-sm">{booking.phone}</span>
          </div>
        )}
        {onStatusChange && (
          <div className="flex space-x-2 pt-3">
            {booking.status === 'pending' && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onStatusChange(booking.id, 'confirmed')}
                >
                  Confirm
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onStatusChange(booking.id, 'cancelled')}
                >
                  Cancel
                </Button>
              </>
            )}
            {booking.status === 'confirmed' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onStatusChange(booking.id, 'cancelled')}
              >
                Cancel
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BookingCard;
