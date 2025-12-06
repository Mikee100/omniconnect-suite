import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Users, Clock, TrendingUp } from 'lucide-react';
import { messengerApi } from '@/api/messaging';
import {
    LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const MessengerTab = () => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const data = await messengerApi.getStats();
            setStats(data);
        } catch (error) {
            console.error('Failed to load Messenger stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!stats) {
        return null;
    }

    const formatTime = (seconds: number) => {
        if (seconds < 60) return `${seconds}s`;
        const minutes = Math.floor(seconds / 60);
        return `${minutes}m ${seconds % 60}s`;
    };

    const messageDirectionData = [
        { name: 'Inbound', value: stats.inboundMessages, color: '#0084ff' },
        { name: 'Outbound', value: stats.outboundMessages, color: '#3b82f6' },
    ];

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Top KPI Cards */}
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                {/* Total Messages */}
                <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">Total Messages</p>
                                <p className="text-3xl font-bold text-foreground">{stats.totalMessages}</p>
                                <div className="flex items-center gap-1">
                                    <MessageCircle className="h-4 w-4 text-blue-600" />
                                    <span className="text-sm font-medium text-blue-600">
                                        All time
                                    </span>
                                </div>
                            </div>
                            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                <MessageCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Active Conversations */}
                <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">Active Chats</p>
                                <p className="text-3xl font-bold text-foreground">{stats.activeConversations}</p>
                                <div className="flex items-center gap-1">
                                    <Users className="h-4 w-4 text-green-600" />
                                    <span className="text-sm font-medium text-green-600">
                                        Last 24h
                                    </span>
                                </div>
                            </div>
                            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
                                <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Avg Response Time */}
                <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">Avg Response</p>
                                <p className="text-3xl font-bold text-foreground">{formatTime(stats.avgResponseTime)}</p>
                                <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4 text-purple-600" />
                                    <span className="text-sm font-medium text-purple-600">
                                        Response time
                                    </span>
                                </div>
                            </div>
                            <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                                <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* This Month */}
                <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">This Month</p>
                                <p className="text-3xl font-bold text-foreground">{stats.messagesThisMonth}</p>
                                <div className="flex items-center gap-1">
                                    <TrendingUp className="h-4 w-4 text-orange-600" />
                                    <span className="text-sm font-medium text-orange-600">
                                        {stats.messagesThisWeek} this week
                                    </span>
                                </div>
                            </div>
                            <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                                <TrendingUp className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row */}
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                {/* Message Volume */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-primary" />
                            Message Volume (Last 7 Days)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={stats.messagesByDay}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                <XAxis dataKey="date" className="text-xs" />
                                <YAxis className="text-xs" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                                />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="count"
                                    stroke="#0084ff"
                                    strokeWidth={2}
                                    name="Messages"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Message Direction */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            <MessageCircle className="h-5 w-5 text-primary" />
                            Message Direction
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={messageDirectionData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {messageDirectionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Top Customers */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        Most Active Customers
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {stats.topCustomers?.map((customer: any, index: number) => (
                            <div key={index} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                        <span className="text-sm font-semibold text-blue-600">{index + 1}</span>
                                    </div>
                                    <span className="font-medium">{customer.name}</span>
                                </div>
                                <Badge variant="secondary">{customer.messageCount} messages</Badge>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default MessengerTab;
