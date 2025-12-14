import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DollarSign, Users, TrendingUp, TrendingDown, Calendar,
  Percent, Heart, Package, Clock, ArrowUpRight, ArrowDownRight,
  Smile, Bot, Zap, Activity, MessageSquare, AlertTriangle, CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { businessAnalyticsApi } from '@/api/businessAnalytics';
import {
  fetchComprehensiveStats,
  fetchCustomerEmotionsStats,
  fetchAIPerformanceStats,
  fetchPersonalizedResponseStats,
  fetchSystemStats
} from '@/api/statistics';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';

const OverviewTab = () => {
  const [kpis, setKpis] = useState<any>(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState<any[]>([]);
  const [revenueByPackage, setRevenueByPackage] = useState<any[]>([]);
  const [seasonalTrends, setSeasonalTrends] = useState<any[]>([]);
  const [customerEmotions, setCustomerEmotions] = useState<any>(null);
  const [aiPerformance, setAiPerformance] = useState<any>(null);
  const [personalizedResponses, setPersonalizedResponses] = useState<any>(null);
  const [systemStats, setSystemStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const [
        kpisData,
        monthlyData,
        packageData,
        trendsData,
        emotionsData,
        aiPerfData,
        personalizedData,
        systemData
      ] = await Promise.all([
        businessAnalyticsApi.getBusinessKPIs(),
        businessAnalyticsApi.getMonthlyRevenue(),
        businessAnalyticsApi.getRevenueByPackage(),
        businessAnalyticsApi.getSeasonalTrends(),
        fetchCustomerEmotionsStats(),
        fetchAIPerformanceStats(),
        fetchPersonalizedResponseStats(),
        fetchSystemStats(),
      ]);

      setKpis(kpisData);
      setMonthlyRevenue(monthlyData);
      setRevenueByPackage(packageData);
      setSeasonalTrends(trendsData);
      setCustomerEmotions(emotionsData);
      setAiPerformance(aiPerfData);
      setPersonalizedResponses(personalizedData);
      setSystemStats(systemData);
    } catch (error) {
      console.error('Failed to load analytics:', error);
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

  const formatCurrency = (amount: number) => {
    return `KSH ${amount.toLocaleString()}`;
  };

  const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Top KPI Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Revenue */}
        <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-border/50 group">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1 flex-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Revenue</p>
                <p className="text-2xl font-bold text-foreground group-hover:scale-105 transition-transform duration-200">
                  {formatCurrency(kpis?.revenue?.total || 0)}
                </p>
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-600">
                    {kpis?.revenue?.count || 0} payments
                  </span>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-800/20 group-hover:scale-110 transition-transform duration-200 shadow-sm">
                <DollarSign className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Average Booking Value */}
        <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-border/50 group">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1 flex-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Avg Booking Value</p>
                <p className="text-2xl font-bold text-foreground group-hover:scale-105 transition-transform duration-200">
                  {formatCurrency(kpis?.avgBookingValue || 0)}
                </p>
                <div className="flex items-center gap-1.5">
                  <Package className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-600">
                    Per booking
                  </span>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/20 group-hover:scale-110 transition-transform duration-200 shadow-sm">
                <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conversion Rate */}
        <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-border/50 group">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1 flex-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Conversion Rate</p>
                <p className="text-2xl font-bold text-foreground group-hover:scale-105 transition-transform duration-200">
                  {kpis?.conversionRate?.rate?.toFixed(1) || 0}%
                </p>
                <div className="flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-600">
                    {kpis?.conversionRate?.convertedCustomers || 0}/{kpis?.conversionRate?.totalCustomers || 0} customers
                  </span>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-800/20 group-hover:scale-110 transition-transform duration-200 shadow-sm">
                <Percent className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Lifetime Value */}
        <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-border/50 group">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1 flex-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Customer CLV</p>
                <p className="text-2xl font-bold text-foreground group-hover:scale-105 transition-transform duration-200">
                  {formatCurrency(kpis?.customerMetrics?.clv || 0)}
                </p>
                <div className="flex items-center gap-1.5">
                  <Heart className="h-4 w-4 text-pink-600" />
                  <span className="text-sm font-medium text-pink-600">
                    Lifetime value
                  </span>
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-gradient-to-br from-pink-100 to-pink-50 dark:from-pink-900/30 dark:to-pink-800/20 group-hover:scale-110 transition-transform duration-200 shadow-sm">
                <Heart className="h-6 w-6 text-pink-600 dark:text-pink-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary KPIs */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {/* Total Customers */}
        <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Customers</p>
                <p className="text-2xl font-bold mt-1">{kpis?.customerMetrics?.totalCustomers || 0}</p>
              </div>
              <div className="p-2 rounded-xl bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Repeat Rate */}
        <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Repeat Rate</p>
                <p className="text-2xl font-bold mt-1">{kpis?.customerMetrics?.repeatRate?.toFixed(1) || 0}%</p>
              </div>
              <div className="p-2 rounded-xl bg-success/10">
                <TrendingUp className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* New Customers (This Month) */}
        <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">New This Month</p>
                <p className="text-2xl font-bold mt-1">{kpis?.customerMetrics?.newCustomersThisMonth || 0}</p>
              </div>
              <div className="p-2 rounded-xl bg-warning/10">
                <Calendar className="h-6 w-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        {/* Monthly Revenue Trend */}
        <Card className="hover:shadow-lg transition-all duration-300 border-border/50">
          <CardHeader className="border-b border-border/50 pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              Monthly Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                  formatter={(value: any) => formatCurrency(value)}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  name="Revenue"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue by Package */}
        <Card className="hover:shadow-lg transition-all duration-300 border-border/50">
          <CardHeader className="border-b border-border/50 pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Package className="h-4 w-4 text-primary" />
              </div>
              Revenue by Package
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={revenueByPackage}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ package: pkg, percent }: any) => `${pkg} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="revenue"
                  nameKey="package"
                >
                  {revenueByPackage.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Seasonal Trends & Popular Packages */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        {/* Seasonal Trends */}
        <Card className="hover:shadow-lg transition-all duration-300 border-border/50">
          <CardHeader className="border-b border-border/50 pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              Seasonal Trends (YoY)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={seasonalTrends}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                />
                <Legend />
                <Bar dataKey="currentYear" fill="#8b5cf6" name="2024" />
                <Bar dataKey="lastYear" fill="#94a3b8" name="2023" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Popular Packages */}
        <Card className="hover:shadow-lg transition-all duration-300 border-border/50">
          <CardHeader className="border-b border-border/50 pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Package className="h-4 w-4 text-primary" />
              </div>
              Popular Packages
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              {kpis?.popularPackages?.slice(0, 5).map((pkg: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="font-medium">{pkg.package}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{pkg.bookings} bookings</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Package Performance Table */}
      <Card className="hover:shadow-lg transition-all duration-300 border-border/50">
        <CardHeader className="border-b border-border/50 pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Package className="h-4 w-4 text-primary" />
            </div>
            Package Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Package</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Revenue</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Bookings</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Avg Value</th>
                </tr>
              </thead>
              <tbody>
                {revenueByPackage.map((pkg, index) => (
                  <tr key={index} className="border-b hover:bg-accent/50 transition-colors cursor-pointer group">
                    <td className="py-4 px-4 font-medium group-hover:text-primary transition-colors">{pkg.package}</td>
                    <td className="text-right py-4 px-4 font-semibold group-hover:text-primary transition-colors">{formatCurrency(pkg.revenue)}</td>
                    <td className="text-right py-4 px-4">{pkg.bookings}</td>
                    <td className="text-right py-4 px-4">{formatCurrency(pkg.avgValue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Customer Emotions Section */}
      {customerEmotions && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Smile className="h-5 w-5 text-pink-500" />
            <h2 className="text-xl font-bold">Customer Emotions & Sentiment</h2>
          </div>
          
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            {/* Sentiment Distribution */}
            <Card className="hover:shadow-lg transition-all duration-300 border-border/50">
              <CardHeader className="border-b border-border/50 pb-3">
                <CardTitle className="text-base font-semibold">Sentiment Distribution</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Very Positive', value: customerEmotions.distribution.very_positive, color: '#10b981' },
                        { name: 'Positive', value: customerEmotions.distribution.positive, color: '#22c55e' },
                        { name: 'Neutral', value: customerEmotions.distribution.neutral, color: '#94a3b8' },
                        { name: 'Negative', value: customerEmotions.distribution.negative, color: '#f59e0b' },
                        { name: 'Very Negative', value: customerEmotions.distribution.very_negative, color: '#ef4444' },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }: any) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {['#10b981', '#22c55e', '#94a3b8', '#f59e0b', '#ef4444'].map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Sentiment Trends */}
            <Card className="hover:shadow-lg transition-all duration-300 border-border/50">
              <CardHeader className="border-b border-border/50 pb-3">
                <CardTitle className="text-base font-semibold">Sentiment Trends (7 Days)</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={customerEmotions.recentTrends}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                    />
                    <Area type="monotone" dataKey="avgScore" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Sentiment Stats Cards */}
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase">Total Sentiments</p>
                    <p className="text-xl font-bold mt-1">{customerEmotions.total || 0}</p>
                  </div>
                  <Smile className="h-6 w-6 text-pink-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase">Avg Score</p>
                    <p className="text-xl font-bold mt-1">{(customerEmotions.averageScore || 0).toFixed(2)}</p>
                  </div>
                  <TrendingUp className="h-6 w-6 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase">Positive %</p>
                    <p className="text-xl font-bold mt-1">
                      {(customerEmotions.distribution?.percentages?.positive || 0).toFixed(1)}%
                    </p>
                  </div>
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase">Needs Attention</p>
                    <p className="text-xl font-bold mt-1">
                      {customerEmotions.customersNeedingAttention?.length || 0}
                    </p>
                  </div>
                  <AlertTriangle className="h-6 w-6 text-amber-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* AI Performance Section */}
      {aiPerformance && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-purple-500" />
            <h2 className="text-xl font-bold">AI Performance Metrics</h2>
          </div>

          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase">Avg Response Time</p>
                    <p className="text-xl font-bold mt-1">
                      {(aiPerformance.responseTime?.average / 1000 || 0).toFixed(1)}s
                    </p>
                  </div>
                  <Clock className="h-6 w-6 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase">Success Rate</p>
                    <p className="text-xl font-bold mt-1">
                      {(aiPerformance.accuracy?.successRate || 0).toFixed(1)}%
                    </p>
                  </div>
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase">User Rating</p>
                    <p className="text-xl font-bold mt-1">
                      {(aiPerformance.userSatisfaction?.averageRating || 0).toFixed(1)}/5
                    </p>
                  </div>
                  <Heart className="h-6 w-6 text-pink-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase">Cache Hit Rate</p>
                    <p className="text-xl font-bold mt-1">
                      {(aiPerformance.efficiency?.cacheHitRate || 0).toFixed(1)}%
                    </p>
                  </div>
                  <Zap className="h-6 w-6 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Performance by Intent */}
          <Card className="hover:shadow-lg transition-all duration-300 border-border/50">
            <CardHeader className="border-b border-border/50 pb-3">
              <CardTitle className="text-base font-semibold">Performance by Intent</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Intent</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">Total</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">Success Rate</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">Avg Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {aiPerformance.byIntent?.slice(0, 10).map((intent: any, index: number) => (
                      <tr key={index} className="border-b hover:bg-accent/50 transition-colors">
                        <td className="py-4 px-4 font-medium">{intent.intent}</td>
                        <td className="text-right py-4 px-4">{intent.total}</td>
                        <td className="text-right py-4 px-4">
                          <Badge variant={intent.successRate > 80 ? 'default' : 'secondary'}>
                            {intent.successRate.toFixed(1)}%
                          </Badge>
                        </td>
                        <td className="text-right py-4 px-4">{intent.averageTimeToResolution}s</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Personalized Responses Section */}
      {personalizedResponses && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-500" />
            <h2 className="text-xl font-bold">Personalized Response Performance</h2>
          </div>

          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase">Personalized Conversations</p>
                    <p className="text-xl font-bold mt-1">{personalizedResponses.totalPersonalizedConversations || 0}</p>
                  </div>
                  <MessageSquare className="h-6 w-6 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase">Success Rate</p>
                    <p className="text-xl font-bold mt-1">
                      {(personalizedResponses.overallSuccessRate || 0).toFixed(1)}%
                    </p>
                  </div>
                  <TrendingUp className="h-6 w-6 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase">Avg Resolution Time</p>
                    <p className="text-xl font-bold mt-1">
                      {Math.round(personalizedResponses.averageTimeToResolution / 60) || 0}m
                    </p>
                  </div>
                  <Clock className="h-6 w-6 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance by Communication Style */}
          <Card className="hover:shadow-lg transition-all duration-300 border-border/50">
            <CardHeader className="border-b border-border/50 pb-3">
              <CardTitle className="text-base font-semibold">Performance by Communication Style</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={personalizedResponses.byCommunicationStyle}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="style" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                  />
                  <Legend />
                  <Bar dataKey="total" fill="#8b5cf6" name="Total" />
                  <Bar dataKey="successful" fill="#10b981" name="Successful" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* System Stats Section */}
      {systemStats && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-500" />
            <h2 className="text-xl font-bold">System Overview</h2>
          </div>

          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase">Total Customers</p>
                    <p className="text-xl font-bold mt-1">{systemStats.customers?.total || 0}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {systemStats.customers?.active || 0} active
                    </p>
                  </div>
                  <Users className="h-6 w-6 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase">Total Messages</p>
                    <p className="text-xl font-bold mt-1">{systemStats.messages?.total || 0}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {systemStats.messages?.responseRate?.toFixed(1) || 0}% response rate
                    </p>
                  </div>
                  <MessageSquare className="h-6 w-6 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase">Total Bookings</p>
                    <p className="text-xl font-bold mt-1">{systemStats.bookings?.total || 0}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {systemStats.bookings?.completionRate?.toFixed(1) || 0}% completed
                    </p>
                  </div>
                  <Calendar className="h-6 w-6 text-purple-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase">Open Escalations</p>
                    <p className="text-xl font-bold mt-1">{systemStats.escalations?.open || 0}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {systemStats.escalations?.resolutionRate?.toFixed(1) || 0}% resolved
                    </p>
                  </div>
                  <AlertTriangle className="h-6 w-6 text-amber-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default OverviewTab;
