import { useEffect, useState } from 'react';
import { Bell, Calendar, DollarSign, RefreshCw, Check, CheckCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
    id: string;
    type: 'booking' | 'reschedule' | 'payment';
    title: string;
    message: string;
    metadata?: any;
    read: boolean;
    createdAt: string;
}

interface NotificationsData {
    notifications: Notification[];
    total: number;
    unreadCount: number;
}

export default function Notifications() {
    const [data, setData] = useState<NotificationsData>({ notifications: [], total: 0, unreadCount: 0 });
    const [activeTab, setActiveTab] = useState('all');
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            const params = new URLSearchParams();
            if (activeTab !== 'all') {
                params.append('type', activeTab);
            }

            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const response = await fetch(`${baseUrl}/api/notifications?${params}`);
            const result = await response.json();
            setData(result);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [activeTab]);

    const markAsRead = async (id: string) => {
        try {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            await fetch(`${baseUrl}/api/notifications/${id}/read`, {
                method: 'PATCH',
            });
            fetchNotifications();
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            await fetch(`${baseUrl}/api/notifications/mark-all-read`, {
                method: 'PATCH',
            });
            fetchNotifications();
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'booking':
                return <Calendar className="h-5 w-5 text-blue-500" />;
            case 'reschedule':
                return <RefreshCw className="h-5 w-5 text-amber-500" />;
            case 'payment':
                return <DollarSign className="h-5 w-5 text-green-500" />;
            default:
                return <Bell className="h-5 w-5" />;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'booking':
                return 'bg-blue-100 text-blue-800';
            case 'reschedule':
                return 'bg-amber-100 text-amber-800';
            case 'payment':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Calculate summary metrics
    const totalRevenue = data.notifications
        .filter(n => n.type === 'payment')
        .reduce((sum, n) => sum + (n.metadata?.amount || 0), 0);

    const todayBookings = data.notifications.filter(n => {
        if (n.type !== 'booking') return false;
        const createdDate = new Date(n.createdAt);
        const today = new Date();
        return createdDate.toDateString() === today.toDateString();
    }).length;

    const totalReschedules = data.notifications.filter(n => n.type === 'reschedule').length;

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Notifications</h1>
                    <p className="text-muted-foreground">Stay updated on bookings, payments, and reschedules</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={fetchNotifications} variant="outline" size="sm">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                    {data.unreadCount > 0 && (
                        <Button onClick={markAllAsRead} variant="outline" size="sm">
                            <CheckCheck className="h-4 w-4 mr-2" />
                            Mark All Read
                        </Button>
                    )}
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue (Deposits)</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">KSH {totalRevenue.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">From deposit payments</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Bookings Today</CardTitle>
                        <Calendar className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{todayBookings}</div>
                        <p className="text-xs text-muted-foreground">New bookings confirmed</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Reschedules</CardTitle>
                        <RefreshCw className="h-4 w-4 text-amber-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalReschedules}</div>
                        <p className="text-xs text-muted-foreground">Booking changes</p>
                    </CardContent>
                </Card>
            </div>

            {/* Notifications List */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>All Notifications</CardTitle>
                        {data.unreadCount > 0 && (
                            <Badge variant="secondary">{data.unreadCount} Unread</Badge>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="all">All</TabsTrigger>
                            <TabsTrigger value="booking">Bookings</TabsTrigger>
                            <TabsTrigger value="payment">Payments</TabsTrigger>
                            <TabsTrigger value="reschedule">Reschedules</TabsTrigger>
                        </TabsList>

                        <TabsContent value={activeTab} className="space-y-4 mt-4">
                            {loading ? (
                                <div className="text-center py-8 text-muted-foreground">Loading...</div>
                            ) : data.notifications.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    No notifications yet
                                </div>
                            ) : (
                                data.notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        onClick={() => !notification.read && markAsRead(notification.id)}
                                        className={`flex items-start gap-4 p-4 rounded-lg border transition-all cursor-pointer ${notification.read
                                                ? 'bg-background hover:bg-accent/50'
                                                : 'bg-accent/20 hover:bg-accent/30 border-primary/20'
                                            }`}
                                    >
                                        <div className="mt-1">{getIcon(notification.type)}</div>

                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-start justify-between gap-2">
                                                <h4 className="font-semibold">{notification.title}</h4>
                                                <div className="flex items-center gap-2">
                                                    <Badge className={getTypeColor(notification.type)} variant="secondary">
                                                        {notification.type}
                                                    </Badge>
                                                    {!notification.read && (
                                                        <div className="h-2 w-2 rounded-full bg-primary" />
                                                    )}
                                                </div>
                                            </div>

                                            <p className="text-sm text-muted-foreground">{notification.message}</p>

                                            <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                                                <span>{formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}</span>
                                                {notification.metadata?.receipt && (
                                                    <span>Receipt: {notification.metadata.receipt}</span>
                                                )}
                                            </div>
                                        </div>

                                        {!notification.read && (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    markAsRead(notification.id);
                                                }}
                                            >
                                                <Check className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                ))
                            )}
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
