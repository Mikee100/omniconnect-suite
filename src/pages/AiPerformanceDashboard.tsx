import React, { useEffect, useState } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import { API_BASE_URL } from '@/config';

const fetchMetrics = async () => {
  const res = await fetch(`${API_BASE_URL}/api/analytics/ai-performance-metrics`);
  if (!res.ok) throw new Error('Failed to fetch metrics');
  return res.json();
};

const COLORS = {
  primary: '#6366f1',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  purple: '#a855f7',
  pink: '#ec4899',
};

const StatCard = ({ title, value, subtitle, icon, gradient }: any) => (
  <div style={{
    background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})`,
    borderRadius: 16,
    padding: 24,
    color: 'white',
    boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
    position: 'relative',
    overflow: 'hidden'
  }}>
    <div style={{ position: 'absolute', top: -20, right: -20, fontSize: 80, opacity: 0.2 }}>{icon}</div>
    <div style={{ fontSize: 14, opacity: 0.9, marginBottom: 8 }}>{title}</div>
    <div style={{ fontSize: 32, fontWeight: 700, marginBottom: 4 }}>{value}</div>
    {subtitle && <div style={{ fontSize: 12, opacity: 0.8 }}>{subtitle}</div>}
  </div>
);

export default function AiPerformanceDashboard() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    fetchMetrics()
      .then(setMetrics)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <div style={{ fontSize: 18, color: '#6b7280' }}>Loading AI Performance Metrics...</div>
    </div>
  );

  if (error) return (
    <div style={{ padding: 40, textAlign: 'center', color: '#ef4444' }}>
      <div style={{ fontSize: 18 }}>Error loading metrics</div>
      <div style={{ fontSize: 14, marginTop: 8 }}>{error.message}</div>
    </div>
  );

  if (!metrics) return (
    <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>
      No data available.
    </div>
  );

  const intentChartData = metrics.topIntents || [];
  const INTENT_COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ec4899', '#8b5cf6'];

  return (
    <div style={{ padding: 32, background: 'linear-gradient(to bottom right, #f0f9ff, #fef3c7)', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: '#111827', marginBottom: 8 }}>
          🤖 AI Performance Analytics
        </h1>
        <p style={{ color: '#6b7280', fontSize: 14 }}>
          Last 30 days • Updated {new Date(metrics.lastUpdated).toLocaleString()}
        </p>
      </div>

      {/* Hero Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20, marginBottom: 32 }}>
        <StatCard
          title="Total Conversations"
          value={metrics.totalConversations?.toLocaleString() || '0'}
          subtitle={`${metrics.totalInbound} inbound • ${metrics.totalOutbound} outbound`}
          icon="💬"
          gradient={['#6366f1', '#8b5cf6']}
        />
        <StatCard
          title="Avg Response Time"
          value={`${Math.round((metrics.avgResponseTimeMs || 0) / 1000)}s`}
          subtitle={`p95: ${Math.round((metrics.p95ResponseTimeMs || 0) / 1000)}s`}
          icon="⚡"
          gradient={['#22c55e', '#10b981']}
        />
        <StatCard
          title="Booking Conversion"
          value={`${metrics.bookingConversionRate || 0}%`}
          subtitle={`${metrics.customersWithBooking} / ${metrics.totalCustomers} customers`}
          icon="📅"
          gradient={['#f59e0b', '#f97316']}
        />
        <StatCard
          title="Customer Satisfaction"
          value={`${metrics.customerSatisfactionScore || 0}%`}
          subtitle={`${metrics.positiveSentiment} positive • ${metrics.negativeSentiment} negative`}
          icon="😊"
          gradient={['#ec4899', '#d946ef']}
        />
      </div>

      {/* Charts Row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: 20, marginBottom: 20 }}>
        {/* Intent Distribution */}
        <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, color: '#111827' }}>Intent Distribution</div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={intentChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="intent" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {intentChartData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={INTENT_COLORS[index % INTENT_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Response Time Breakdown */}
        <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, color: '#111827' }}>Response Time Breakdown</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#6b7280' }}>Average</span>
              <span style={{ fontSize: 24, fontWeight: 700, color: COLORS.primary }}>
                {Math.round((metrics.avgResponseTimeMs || 0) / 1000)}s
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#6b7280' }}>Median (p50)</span>
              <span style={{ fontSize: 20, fontWeight: 600, color: COLORS.success }}>
                {Math.round((metrics.p50ResponseTimeMs || 0) / 1000)}s
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#6b7280' }}>95th Percentile</span>
              <span style={{ fontSize: 20, fontWeight: 600, color: COLORS.warning }}>
                {Math.round((metrics.p95ResponseTimeMs || 0) / 1000)}s
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#6b7280' }}>99th Percentile</span>
              <span style={{ fontSize: 20, fontWeight: 600, color: COLORS.danger }}>
                {Math.round((metrics.p99ResponseTimeMs || 0) / 1000)}s
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
        {/* Smart Actions */}
        <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, color: '#111827' }}>Smart Actions</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ padding: 16, background: 'linear-gradient(135deg, #dbeafe, #e0e7ff)', borderRadius: 12 }}>
              <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Reminders Sent</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: COLORS.primary }}>
                {metrics.smartActionsTriggered || 0}
              </div>
            </div>
            <div style={{ padding: 16, background: 'linear-gradient(135deg, #dcfce7, #ddd6fe)', borderRadius: 12 }}>
              <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Package Queries</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: COLORS.success }}>
                {metrics.packageQueriesHandled || 0}
              </div>
            </div>
          </div>
        </div>

        {/* Engagement */}
        <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, color: '#111827' }}>Engagement Metrics</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Avg Messages/Conversation</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: COLORS.purple }}>
                {metrics.avgMessagesPerConversation || 0}
              </div>
            </div>
            <div style={{ height: 1, background: '#e5e7eb' }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Inbound</div>
                <div style={{ fontSize: 20, fontWeight: 600, color: '#3b82f6' }}>
                  {metrics.totalInbound || 0}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Outbound</div>
                <div style={{ fontSize: 20, fontWeight: 600, color: '#22c55e' }}>
                  {metrics.totalOutbound || 0}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Conversion Funnel */}
        <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, color: '#111827' }}>Conversion Funnel</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: '#6b7280' }}>Total Customers</span>
                <span style={{ fontSize: 12, fontWeight: 600 }}>{metrics.totalCustomers}</span>
              </div>
              <div style={{ height: 8, background: '#e5e7eb', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '100%', background: COLORS.primary }} />
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: '#6b7280' }}>With Bookings</span>
                <span style={{ fontSize: 12, fontWeight: 600 }}>{metrics.customersWithBooking}</span>
              </div>
              <div style={{ height: 8, background: '#e5e7eb', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${metrics.bookingConversionRate || 0}%`,
                  background: COLORS.success,
                  transition: 'width 0.5s'
                }} />
              </div>
            </div>
            <div style={{ textAlign: 'center', marginTop: 8 }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: COLORS.success }}>
                {metrics.bookingConversionRate || 0}%
              </div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>Conversion Rate</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
