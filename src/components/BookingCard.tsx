import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User, MapPin, Phone, Check, X } from 'lucide-react';
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
  const getStatusVariant = (status: Booking['status']) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'confirmed':
        return 'default';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <Card className="w-full overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow duration-200 bg-white">
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-semibold text-lg text-gray-900">{booking.service}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
              <User className="w-3.5 h-3.5" />
              <span>{booking.customerName}</span>
            </div>
          </div>
          <Badge variant={getStatusVariant(booking.status)} className="capitalize">
            {booking.status}
          </Badge>
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <div className="flex items-center gap-2 min-w-[100px]">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>{formatDate(booking.date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>{booking.time}</span>
            </div>
          </div>

          {(booking.location || booking.phone) && (
            <div className="flex flex-col gap-2 pt-2 border-t border-gray-100 mt-3">
              {booking.location && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>{booking.location}</span>
                </div>
              )}
              {booking.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{booking.phone}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {onStatusChange && (
          <div className="flex gap-2 mt-5 pt-4 border-t border-gray-100">
            {booking.status === 'pending' && (
              <>
                <Button
                  size="sm"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => onStatusChange(booking.id, 'confirmed')}
                >
                  <Check className="w-4 h-4 mr-1.5" />
                  Confirm
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                  onClick={() => onStatusChange(booking.id, 'cancelled')}
                >
                  <X className="w-4 h-4 mr-1.5" />
                  Cancel
                </Button>
              </>
            )}
            {booking.status === 'confirmed' && (
              <Button
                size="sm"
                variant="outline"
                className="w-full hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                onClick={() => onStatusChange(booking.id, 'cancelled')}
              >
                <X className="w-4 h-4 mr-1.5" />
                Cancel Booking
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BookingCard;
