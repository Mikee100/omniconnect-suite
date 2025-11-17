import { MetricCard } from '@/components/MetricCard';
import { MessageSquare, Calendar, TrendingUp, Bot } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const metrics = [
  {
    title: 'Total Conversations',
    value: '1,284',
    icon: MessageSquare,
    trend: { value: 12.5, isPositive: true },
  },
  {
    title: 'Bookings This Month',
    value: '342',
    icon: Calendar,
    trend: { value: 8.2, isPositive: true },
  },
  {
    title: 'Conversion Rate',
    value: '26.6%',
    icon: TrendingUp,
    trend: { value: 3.1, isPositive: true },
  },
  {
    title: 'AI Usage',
    value: '89%',
    icon: Bot,
    trend: { value: -2.4, isPositive: false },
  },
];

const chartData = [
  { name: 'Mon', conversations: 45, bookings: 12 },
  { name: 'Tue', conversations: 52, bookings: 15 },
  { name: 'Wed', conversations: 61, bookings: 18 },
  { name: 'Thu', conversations: 58, bookings: 16 },
  { name: 'Fri', conversations: 72, bookings: 22 },
  { name: 'Sat', conversations: 68, bookings: 20 },
  { name: 'Sun', conversations: 55, bookings: 14 },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your business automation metrics
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.title} {...metric} />
        ))}
      </div>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Weekly Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="name"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Line
                type="monotone"
                dataKey="conversations"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))' }}
              />
              <Line
                type="monotone"
                dataKey="bookings"
                stroke="hsl(var(--success))"
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--success))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
