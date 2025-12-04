import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getCustomer, getCustomerMessages, toggleCustomerAi, getCustomerPhotoLinks, PhotoLink } from '../api/customers';
import { getCustomerBookings, Booking } from '../api/bookings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  Calendar,
  MessageSquare,
  Activity,
  BarChart3,
  Clock,
  Power,
  CalendarCheck,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import SendPhotoLinkCard from '../components/ui/SendPhotoLinkCard';

const CustomerDetailsPage = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();


  const { data: customer, isLoading: customerLoading, refetch: refetchCustomer } = useQuery({
    queryKey: ['customer', customerId],
    queryFn: () => getCustomer(customerId!),
    enabled: !!customerId,
  });

  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ['customer-messages', customerId],
    queryFn: () => getCustomerMessages(customerId!),
    enabled: !!customerId,
  });

  const { data: bookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ['customer-bookings', customerId],
    queryFn: () => getCustomerBookings(customerId!),
    enabled: !!customerId,
  });

  const { data: photoLinks, isLoading: photoLinksLoading } = useQuery({
    queryKey: ['customer-photo-links', customerId],
    queryFn: () => getCustomerPhotoLinks(customerId!),
    enabled: !!customerId,
  });

  const handleToggleAi = async () => {
    if (!customer) return;
    try {
      await toggleCustomerAi(customer.id, !customer.aiEnabled);
      toast.success(`AI ${!customer.aiEnabled ? 'enabled' : 'disabled'} for this customer`);
      refetchCustomer();
    } catch (error) {
      toast.error('Failed to toggle AI status');
    }
  };

  if (customerLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="p-4 text-red-500 bg-red-50 rounded-md">
        Customer not found.
      </div>
    );
  }

  const inboundMessages = messages?.filter((m) => m.direction === 'inbound') || [];
  const outboundMessages = messages?.filter((m) => m.direction === 'outbound') || [];
  const lastMessage = messages?.[messages.length - 1];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/customers')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              {customer.name || 'Unknown Customer'}
              <Badge
                variant={customer.aiEnabled ? 'default' : 'secondary'}
                className={customer.aiEnabled ? 'bg-green-500 hover:bg-green-600' : ''}
              >
                {customer.aiEnabled ? 'AI Active' : 'AI Paused'}
              </Badge>
            </h1>
            <p className="text-muted-foreground mt-1">
              Customer since {format(new Date(customer.createdAt), 'MMMM d, yyyy')}
            </p>
          </div>
        </div>
        <Button onClick={handleToggleAi} variant="outline" className="gap-2">
          <Power className="h-4 w-4" />
          {customer.aiEnabled ? 'Disable AI' : 'Enable AI'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Customer Profile & Stats */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="font-medium">{customer.phone || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-medium">{customer.email || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Platform</p>
                  <p className="font-medium capitalize">{customer.platform}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Last Updated</p>
                  <p className="font-medium">
                    {formatDistanceToNow(new Date(customer.updatedAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                <div>
                  <p className="text-xs text-muted-foreground">Total Messages</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {messages?.length || 0}
                  </p>
                </div>
                <MessageSquare className="h-8 w-8 text-blue-600 dark:text-blue-400 opacity-50" />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
                <div>
                  <p className="text-xs text-muted-foreground">Received</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {inboundMessages.length}
                  </p>
                </div>
                <MessageSquare className="h-8 w-8 text-green-600 dark:text-green-400 opacity-50" />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20">
                <div>
                  <p className="text-xs text-muted-foreground">Sent</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {outboundMessages.length}
                  </p>
                </div>
                <MessageSquare className="h-8 w-8 text-purple-600 dark:text-purple-400 opacity-50" />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20">
                <div>
                  <p className="text-xs text-muted-foreground">Bookings</p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {bookings?.length || 0}
                  </p>
                </div>
                <CalendarCheck className="h-8 w-8 text-orange-600 dark:text-orange-400 opacity-50" />
              </div>
              {lastMessage && (
                <div className="p-3 rounded-lg bg-muted/50 border border-border">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Last Contact</p>
                  </div>
                  <p className="text-sm font-medium">
                    {formatDistanceToNow(new Date(lastMessage.createdAt), { addSuffix: true })}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <SendPhotoLinkCard customerId={customer.id} />

          {/* Photo Links Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Photo Links
              </CardTitle>
            </CardHeader>
            <CardContent>
              {photoLinksLoading ? (
                <div className="flex items-center justify-center h-24">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : photoLinks?.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-24 text-muted-foreground">
                  <MessageSquare className="h-8 w-8 mb-2 opacity-20" />
                  <p className="text-sm">No photo links sent yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {photoLinks?.map((photoLink) => (
                    <div
                      key={photoLink.id}
                      className="p-3 rounded-lg bg-muted/50 border border-border hover:bg-muted transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <a
                            href={photoLink.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-sm text-primary hover:underline break-all"
                          >
                            {photoLink.link}
                          </a>
                          <div className="flex items-center gap-2 mt-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(photoLink.sentAt), 'MMM d, yyyy • h:mm a')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

        </div>

        {/* Right Column - Conversation History */}
        <div className="lg:col-span-2">
          <Card className="h-[calc(100vh-12rem)]">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Conversation History
              </CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="p-0">
              <div className="h-[calc(100vh-18rem)] overflow-y-auto p-6 space-y-4">
                {messagesLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : messages?.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mb-2 opacity-20" />
                    <p>No messages yet</p>
                  </div>
                ) : (
                  messages?.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-lg p-4 ${message.direction === 'outbound'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                          }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <p
                            className={`text-xs ${message.direction === 'outbound'
                              ? 'text-primary-foreground/70'
                              : 'text-muted-foreground'
                              }`}
                          >
                            {format(new Date(message.createdAt), 'MMM d, yyyy • h:mm a')}
                          </p>
                          <Badge
                            variant="outline"
                            className={`text-xs ${message.direction === 'outbound'
                              ? 'border-primary-foreground/30 text-primary-foreground/70'
                              : ''
                              }`}
                          >
                            {message.direction === 'outbound' ? 'AI' : 'Customer'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
            {/* Bookings History Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarCheck className="h-5 w-5 text-primary" />
                Bookings History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {bookingsLoading ? (
                <div className="flex items-center justify-center h-24">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : bookings?.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-24 text-muted-foreground">
                  <CalendarCheck className="h-8 w-8 mb-2 opacity-20" />
                  <p className="text-sm">No bookings yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {bookings?.slice(0, 5).map((booking) => (
                    <div
                      key={booking.id}
                      className="p-3 rounded-lg bg-muted/50 border border-border hover:bg-muted transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{booking.service}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(booking.dateTime), 'MMM d, yyyy • h:mm a')}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={
                            booking.status === 'confirmed'
                              ? 'default'
                              : booking.status === 'cancelled'
                                ? 'destructive'
                                : 'secondary'
                          }
                          className="text-xs"
                        >
                          {booking.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {bookings && bookings.length > 5 && (
                    <p className="text-xs text-center text-muted-foreground pt-2">
                      Showing 5 of {bookings.length} bookings
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailsPage;
