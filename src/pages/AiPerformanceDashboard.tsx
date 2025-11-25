import React, { useEffect, useState } from 'react';

const fetchMetrics = async () => {
  const res = await fetch('http://localhost:3000/api/analytics/ai-performance-metrics');
  if (!res.ok) throw new Error('Failed to fetch metrics');
  return res.json();
};

export default function AiPerformanceDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMetrics()
      .then(setMetrics)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading AI Performance Metrics...</div>;
  if (error) return <div>Error loading metrics: {error.message}</div>;
  if (!metrics) return <div>No data available.</div>;

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', padding: 24, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #eee' }}>
      <h2>AI Performance Metrics</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
        <tbody>
          <tr><td>Accuracy</td><td>{metrics.accuracy !== null ? (metrics.accuracy * 100).toFixed(2) + '%' : 'N/A'}</td></tr>
          <tr><td>Precision</td><td>{metrics.precision !== null ? (metrics.precision * 100).toFixed(2) + '%' : 'N/A'}</td></tr>
          <tr><td>Recall</td><td>{metrics.recall !== null ? (metrics.recall * 100).toFixed(2) + '%' : 'N/A'}</td></tr>
          <tr><td>F1 Score</td><td>{metrics.f1 !== null ? metrics.f1.toFixed(2) : 'N/A'}</td></tr>
          <tr><td>Avg. Response Time</td><td>{metrics.avgResponseTime !== null ? metrics.avgResponseTime + ' ms' : 'N/A'}</td></tr>
          <tr><td>Error Rate</td><td>{metrics.errorRate !== null ? (metrics.errorRate * 100).toFixed(2) + '%' : 'N/A'}</td></tr>
          <tr><td>Avg. User Feedback</td><td>{metrics.avgFeedback !== null ? metrics.avgFeedback + ' / 5' : 'N/A'}</td></tr>
          <tr><td>Total Predictions</td><td>{metrics.total}</td></tr>
          <tr><td>Labeled Predictions</td><td>{metrics.labeled}</td></tr>
        </tbody>
      </table>
    </div>
  );
}
