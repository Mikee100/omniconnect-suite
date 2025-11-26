import React from 'react';

const BULL_BOARD_URL = 'http://localhost:3000/admin/queues';

const QueueDashboard: React.FC = () => {
  return (
    <div style={{ height: '100vh', width: '100vw', background: '#f9f9f9' }}>
      <iframe
        src={BULL_BOARD_URL}
        title="Bull Board Queue Dashboard"
        style={{ width: '100%', height: '100%', border: 'none' }}
      />
    </div>
  );
};

export default QueueDashboard;
