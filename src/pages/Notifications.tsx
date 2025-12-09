import { useEffect, useState } from 'react';
import { Bell, Calendar, DollarSign, RefreshCw, Check, CheckCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { API_BASE_URL } from '@/config';

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
    const [search, setSearch] = useState('');
    const [filterRead, setFilterRead] = useState<'all' | 'read' | 'unread'>('all');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async (reset = false) => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (activeTab !== 'all') {
                params.append('type', activeTab);
            }
            params.append('page', String(reset ? 1 : page));
            params.append('limit', '20');
            if (search) {
                params.append('search', search);
            }
            if (filterRead !== 'all') {
                params.append('read', filterRead === 'read' ? 'true' : 'false');
            }

            const baseUrl = API_BASE_URL;
            const response = await fetch(`${baseUrl}/api/notifications?${params}`);
            const result = await response.json();
            if (reset) {
                setData(result);
            } else {
                setData(prev => ({
                    ...result,
                    notifications: [...prev.notifications, ...result.notifications],
                }));
            }
            setHasMore(result.notifications.length === 20);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setPage(1);
        fetchNotifications(true);
        // Auto-refresh every 30 seconds
        const interval = setInterval(() => fetchNotifications(true), 30000);
        return () => clearInterval(interval);
    }, [activeTab, search, filterRead]);

    // Fetch next page
    const loadMore = () => {
        setPage(prev => prev + 1);
    };

    useEffect(() => {
        if (page > 1) {
            fetchNotifications();
        }
    }, [page]);

    const markAsRead = async (id: string) => {
        try {
            const baseUrl = API_BASE_URL;
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
            const baseUrl = API_BASE_URL;
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

    // Expanded state for notification details
    const [expandedMap, setExpandedMap] = useState<{ [id: string]: boolean }>({});

    const toggleExpanded = (id: string) => {
        setExpandedMap(prev => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <div className="p-4 md:p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
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
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <CardTitle>All Notifications</CardTitle>
                        {data.unreadCount > 0 && (
                            <Badge variant="secondary">{data.unreadCount} Unread</Badge>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-2 xs:grid-cols-4 overflow-x-auto gap-2">
                            <TabsTrigger value="all">All</TabsTrigger>
                            <TabsTrigger value="booking">Bookings</TabsTrigger>
                            <TabsTrigger value="payment">Payments</TabsTrigger>
                            <TabsTrigger value="reschedule">Reschedules</TabsTrigger>
                        </TabsList>

                        <TabsContent value={activeTab} className="space-y-4 mt-4">
                            {/* Section header and search/filter */}
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
                                <div className="flex items-center gap-2">
                                    <Bell className="h-5 w-5 text-primary" />
                                    <span className="text-lg font-semibold text-primary">All Notifications</span>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        placeholder="Search notifications..."
                                        className="border rounded-md px-2 py-1 text-sm w-full sm:w-48 focus:outline-none focus:ring focus:ring-primary/30"
                                    />
                                    <select
                                        value={filterRead}
                                        onChange={e => setFilterRead(e.target.value as 'all' | 'read' | 'unread')}
                                        className="border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring focus:ring-primary/30"
                                    >
                                        <option value="all">All</option>
                                        <option value="unread">Unread</option>
                                        <option value="read">Read</option>
                                    </select>
                                </div>
                            </div>
                            {loading && page === 1 ? (
                                <div className="text-center py-8 text-muted-foreground">Loading...</div>
                            ) : data.notifications.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    No notifications yet
                                </div>
                            ) : (
                                // Group notifications by date
                                Object.entries(
                                    data.notifications.reduce((groups, n) => {
                                        const date = new Date(n.createdAt).toDateString();
                                        if (!groups[date]) groups[date] = [];
                                        groups[date].push(n);
                                        return groups;
                                    }, {} as { [date: string]: Notification[] })
                                ).map(([date, notifs]) => (
                                    <div key={date} className="mb-6">
                                        <div className="text-xs font-semibold text-muted-foreground mb-2 mt-4 pl-1">
                                            {date === new Date().toDateString() ? 'Today' : date}
                                        </div>
                                        {notifs.map((notification) => (
                                            <div
                                                key={notification.id}
                                                onClick={() => !notification.read && markAsRead(notification.id)}
                                                className={`flex flex-col sm:flex-row items-start gap-2 sm:gap-4 p-3 sm:p-4 rounded-lg border transition-all cursor-pointer relative overflow-hidden ${notification.read
                                                    ? 'bg-background hover:bg-accent/50'
                                                    : 'bg-accent/20 hover:bg-accent/30 border-primary/20 animate-pulse'} group`}
                                            >
                                                {/* Avatar/Icon */}
                                                <div className="mt-1 flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-tr from-primary/10 to-primary/30 shadow">
                                                    {getIcon(notification.type)}
                                                </div>

                                                <div className="flex-1 space-y-1 w-full">
                                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                                                        <h4 className="font-semibold text-base">{notification.title}</h4>
                                                        <div className="flex items-center gap-2">
                                                            <Badge className={getTypeColor(notification.type)} variant="secondary">
                                                                {notification.type}
                                                            </Badge>
                                                            {!notification.read && (
                                                                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Expand/collapse for long messages */}
                                                    <p className="text-sm text-muted-foreground break-words">
                                                        {notification.message.length > 120 ? (
                                                            <>
                                                                {expandedMap[notification.id] ? notification.message : notification.message.slice(0, 120) + '...'}
                                                                <Button variant="link" size="sm" className="ml-2 px-1 py-0 h-auto text-xs" onClick={e => {e.stopPropagation(); toggleExpanded(notification.id);}}>
                                                                    {expandedMap[notification.id] ? 'Show less' : 'Show more'}
                                                                </Button>
                                                            </>
                                                        ) : (
                                                            notification.message
                                                        )}
                                                    </p>

                                                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-xs text-muted-foreground pt-1">
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
                                                        className="self-end sm:self-auto"
                                                    >
                                                        <Check className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                {/* Divider */}
                                                <div className="absolute left-0 bottom-0 w-full h-px bg-border opacity-40" />
                                            </div>
                                        ))}
                                    </div>
                                ))
                            )}
                            {/* Pagination: Load more button */}
                            {hasMore && !loading && (
                                <div className="flex justify-center mt-4">
                                    <Button variant="outline" size="sm" onClick={loadMore}>
                                        Load More
                                    </Button>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
