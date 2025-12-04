import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DollarSign, Users, TrendingUp, TrendingDown, Calendar,
  Percent, Heart, Package, Clock, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { businessAnalyticsApi } from '@/api/businessAnalytics';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const OverviewTab = () => {
  const [kpis, setKpis] = useState<any>(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState<any[]>([]);
  const [revenueByPackage, setRevenueByPackage] = useState<any[]>([]);
  const [seasonalTrends, setSeasonalTrends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const [kpisData, monthlyData, packageData, trendsData] = await Promise.all([
        businessAnalyticsApi.getBusinessKPIs(),
        businessAnalyticsApi.getMonthlyRevenue(),
        businessAnalyticsApi.getRevenueByPackage(),
        businessAnalyticsApi.getSeasonalTrends(),
      ]);

      setKpis(kpisData);
      setMonthlyRevenue(monthlyData);
      setRevenueByPackage(packageData);
      setSeasonalTrends(trendsData);
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
    <div className="space-y-6 animate-fadeIn">
      {/* Top KPI Cards */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Revenue */}
        <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-3xl font-bold text-foreground">
                  {formatCurrency(kpis?.revenue?.total || 0)}
                </p>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-600">
                    {kpis?.revenue?.count || 0} payments
                  </span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <DollarSign className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Average Booking Value */}
        <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Avg Booking Value</p>
                <p className="text-3xl font-bold text-foreground">
                  {formatCurrency(kpis?.avgBookingValue || 0)}
                </p>
                <div className="flex items-center gap-1">
                  <Package className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-600">
                    Per booking
                  </span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conversion Rate */}
        <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                <p className="text-3xl font-bold text-foreground">
                  {kpis?.conversionRate?.rate?.toFixed(1) || 0}%
                </p>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-600">
                    {kpis?.conversionRate?.convertedCustomers || 0}/{kpis?.conversionRate?.totalCustomers || 0} customers
                  </span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
                <Percent className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Lifetime Value */}
        <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Customer CLV</p>
                <p className="text-3xl font-bold text-foreground">
                  {formatCurrency(kpis?.customerMetrics?.clv || 0)}
                </p>
                <div className="flex items-center gap-1">
                  <Heart className="h-4 w-4 text-pink-600" />
                  <span className="text-sm font-medium text-pink-600">
                    Lifetime value
                  </span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-pink-100 dark:bg-pink-900/30">
                <Heart className="h-6 w-6 text-pink-600 dark:text-pink-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary KPIs */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {/* Total Customers */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Customers</p>
                <p className="text-2xl font-bold mt-2">{kpis?.customerMetrics?.totalCustomers || 0}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        {/* Repeat Rate */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Repeat Rate</p>
                <p className="text-2xl font-bold mt-2">{kpis?.customerMetrics?.repeatRate?.toFixed(1) || 0}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        {/* New Customers (This Month) */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">New This Month</p>
                <p className="text-2xl font-bold mt-2">{kpis?.customerMetrics?.newCustomersThisMonth || 0}</p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Monthly Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Monthly Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
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
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Revenue by Package
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
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
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Seasonal Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Seasonal Trends (YoY)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
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
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Popular Packages
            </CardTitle>
          </CardHeader>
          <CardContent>
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
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Package Performance</CardTitle>
        </CardHeader>
        <CardContent>
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
                  <tr key={index} className="border-b hover:bg-accent/50 transition-colors">
                    <td className="py-3 px-4 font-medium">{pkg.package}</td>
                    <td className="text-right py-3 px-4">{formatCurrency(pkg.revenue)}</td>
                    <td className="text-right py-3 px-4">{pkg.bookings}</td>
                    <td className="text-right py-3 px-4">{formatCurrency(pkg.avgValue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OverviewTab;
