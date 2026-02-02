import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { API_BASE_URL } from '@/config';

type ObservabilityData = {
  period: string;
  since: string;
  totalJobs: number;
  failedJobs: number;
  successRate: number;
  p50LatencyMs: number | null;
  p95LatencyMs: number | null;
  strategyCounts: { faq: number; package_inquiry: number; booking: number; fallback: number };
  fallbackCount: number;
  circuitBreakerCount: number;
  queueWaitingCount: number | null;
};

const fetchObservability = async (period: '24h' | '7d'): Promise<ObservabilityData> => {
  const res = await fetch(`${API_BASE_URL}/api/analytics/ai-observability?period=${period}`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch AI observability');
  return res.json();
};

const StatCard = ({
  title,
  value,
  subtitle,
  gradient,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  gradient: [string, string];
}) => (
  <div
    style={{
      background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})`,
      borderRadius: 16,
      padding: 24,
      color: 'white',
      boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
    }}
  >
    <div style={{ fontSize: 14, opacity: 0.9, marginBottom: 8 }}>{title}</div>
    <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>{value}</div>
    {subtitle && <div style={{ fontSize: 12, opacity: 0.8 }}>{subtitle}</div>}
  </div>
);

export default function AIObservability() {
  const [data, setData] = useState<ObservabilityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<'24h' | '7d'>('24h');

  useEffect(() => {
    setLoading(true);
    fetchObservability(period)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [period]);

  if (loading)
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <div style={{ fontSize: 18, color: '#6b7280' }}>Loading AI Observability...</div>
      </div>
    );

  if (error)
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#ef4444' }}>
        <div style={{ fontSize: 18 }}>Error loading observability</div>
        <div style={{ fontSize: 14, marginTop: 8 }}>{error}</div>
      </div>
    );

  if (!data)
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>
        No data available.
      </div>
    );

  const strategyPieData = [
    { name: 'FAQ', value: data.strategyCounts.faq, color: '#6366f1' },
    { name: 'Package', value: data.strategyCounts.package_inquiry, color: '#22c55e' },
    { name: 'Booking', value: data.strategyCounts.booking, color: '#f59e0b' },
    { name: 'Fallback', value: data.strategyCounts.fallback, color: '#ef4444' },
  ].filter((d) => d.value > 0);

  return (
    <div style={{ padding: 32, background: 'linear-gradient(to bottom right, #f0f9ff, #fef3c7)', minHeight: '100vh' }}>
      <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111827', marginBottom: 4 }}>
            AI Observability
          </h1>
          <p style={{ color: '#6b7280', fontSize: 14 }}>
            Tier 1 + strategy + fallback + circuit breaker • Since {new Date(data.since).toLocaleString()}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            onClick={() => setPeriod('24h')}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: period === '24h' ? '2px solid #6366f1' : '1px solid #d1d5db',
              background: period === '24h' ? '#eef2ff' : 'white',
              cursor: 'pointer',
              fontWeight: period === '24h' ? 600 : 400,
            }}
          >
            24h
          </button>
          <button
            type="button"
            onClick={() => setPeriod('7d')}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: period === '7d' ? '2px solid #6366f1' : '1px solid #d1d5db',
              background: period === '7d' ? '#eef2ff' : 'white',
              cursor: 'pointer',
              fontWeight: period === '7d' ? 600 : 400,
            }}
          >
            7d
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 32 }}>
        <StatCard
          title="Total jobs"
          value={data.totalJobs.toLocaleString()}
          subtitle={`${data.failedJobs} failed`}
          gradient={['#6366f1', '#8b5cf6']}
        />
        <StatCard
          title="Success rate"
          value={`${data.successRate.toFixed(1)}%`}
          subtitle={`${data.totalJobs - data.failedJobs} / ${data.totalJobs}`}
          gradient={['#22c55e', '#10b981']}
        />
        <StatCard
          title="p50 latency"
          value={data.p50LatencyMs != null ? `${data.p50LatencyMs}ms` : '—'}
          subtitle={data.p95LatencyMs != null ? `p95: ${data.p95LatencyMs}ms` : undefined}
          gradient={['#f59e0b', '#f97316']}
        />
        <StatCard
          title="Queue waiting"
          value={data.queueWaitingCount ?? '—'}
          subtitle="jobs in queue now"
          gradient={['#ec4899', '#d946ef']}
        />
        <StatCard
          title="Fallback count"
          value={data.fallbackCount}
          subtitle="recovery / unhandled"
          gradient={['#94a3b8', '#64748b']}
        />
        <StatCard
          title="Circuit breaker"
          value={data.circuitBreakerCount}
          subtitle="trips in period"
          gradient={['#ef4444', '#dc2626']}
        />
      </div>

      {strategyPieData.length > 0 && (
        <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.08)', maxWidth: 420 }}>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, color: '#111827' }}>
            Strategy hit rates
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={strategyPieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {strategyPieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [value, '']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
