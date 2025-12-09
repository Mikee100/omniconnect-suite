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
        <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-border/50 group">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Revenue</p>
                <p className="text-3xl font-bold text-foreground group-hover:scale-105 transition-transform duration-200">
                  {formatCurrency(kpis?.revenue?.total || 0)}
                </p>
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-600">
                    {kpis?.revenue?.count || 0} payments
                  </span>
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-800/20 group-hover:scale-110 transition-transform duration-200 shadow-sm">
                <DollarSign className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Average Booking Value */}
        <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-border/50 group">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Avg Booking Value</p>
                <p className="text-3xl font-bold text-foreground group-hover:scale-105 transition-transform duration-200">
                  {formatCurrency(kpis?.avgBookingValue || 0)}
                </p>
                <div className="flex items-center gap-1.5">
                  <Package className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-600">
                    Per booking
                  </span>
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/20 group-hover:scale-110 transition-transform duration-200 shadow-sm">
                <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conversion Rate */}
        <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-border/50 group">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Conversion Rate</p>
                <p className="text-3xl font-bold text-foreground group-hover:scale-105 transition-transform duration-200">
                  {kpis?.conversionRate?.rate?.toFixed(1) || 0}%
                </p>
                <div className="flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-600">
                    {kpis?.conversionRate?.convertedCustomers || 0}/{kpis?.conversionRate?.totalCustomers || 0} customers
                  </span>
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-800/20 group-hover:scale-110 transition-transform duration-200 shadow-sm">
                <Percent className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Lifetime Value */}
        <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-border/50 group">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Customer CLV</p>
                <p className="text-3xl font-bold text-foreground group-hover:scale-105 transition-transform duration-200">
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
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {/* Total Customers */}
        <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Customers</p>
                <p className="text-3xl font-bold mt-2">{kpis?.customerMetrics?.totalCustomers || 0}</p>
              </div>
              <div className="p-3 rounded-xl bg-primary/10">
                <Users className="h-8 w-8 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Repeat Rate */}
        <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Repeat Rate</p>
                <p className="text-3xl font-bold mt-2">{kpis?.customerMetrics?.repeatRate?.toFixed(1) || 0}%</p>
              </div>
              <div className="p-3 rounded-xl bg-success/10">
                <TrendingUp className="h-8 w-8 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* New Customers (This Month) */}
        <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">New This Month</p>
                <p className="text-3xl font-bold mt-2">{kpis?.customerMetrics?.newCustomersThisMonth || 0}</p>
              </div>
              <div className="p-3 rounded-xl bg-warning/10">
                <Calendar className="h-8 w-8 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Monthly Revenue Trend */}
        <Card className="hover:shadow-lg transition-all duration-300 border-border/50">
          <CardHeader className="border-b border-border/50">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              Monthly Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
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
        <Card className="hover:shadow-lg transition-all duration-300 border-border/50">
          <CardHeader className="border-b border-border/50">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Package className="h-5 w-5 text-primary" />
              </div>
              Revenue by Package
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
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
        <Card className="hover:shadow-lg transition-all duration-300 border-border/50">
          <CardHeader className="border-b border-border/50">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              Seasonal Trends (YoY)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
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
        <Card className="hover:shadow-lg transition-all duration-300 border-border/50">
          <CardHeader className="border-b border-border/50">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Package className="h-5 w-5 text-primary" />
              </div>
              Popular Packages
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
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
        <CardHeader className="border-b border-border/50">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Package className="h-5 w-5 text-primary" />
            </div>
            Package Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
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
    </div>
  );
};

export default OverviewTab;
