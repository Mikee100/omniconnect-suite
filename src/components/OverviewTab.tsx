import React from 'react';

const OverviewTab = () => {
  // Mock data for demonstration
  const bookings = [
    { id: 1, customer: 'Jane Doe', date: '2025-11-24', status: 'Confirmed' },
    { id: 2, customer: 'John Smith', date: '2025-11-23', status: 'Pending' },
  ];
  const recentActivities = [
    { id: 1, activity: 'Booking created', time: '2 hours ago' },
    { id: 2, activity: 'Payment received', time: '4 hours ago' },
  ];
  const otherActivities = [
    { id: 1, activity: 'Customer messaged', time: '1 day ago' },
    { id: 2, activity: 'Booking updated', time: '2 days ago' },
  ];

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-lg font-semibold mb-2">Bookings Made</h2>
        <ul className="bg-white rounded shadow p-4">
          {bookings.map(b => (
            <li key={b.id} className="flex justify-between border-b last:border-b-0 py-2">
              <span>{b.customer}</span>
              <span>{b.date}</span>
              <span className="font-medium text-green-600">{b.status}</span>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="text-lg font-semibold mb-2">Recent Activities</h2>
        <ul className="bg-white rounded shadow p-4">
          {recentActivities.map(a => (
            <li key={a.id} className="flex justify-between border-b last:border-b-0 py-2">
              <span>{a.activity}</span>
              <span className="text-gray-500">{a.time}</span>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="text-lg font-semibold mb-2">Other Activities</h2>
        <ul className="bg-white rounded shadow p-4">
          {otherActivities.map(a => (
            <li key={a.id} className="flex justify-between border-b last:border-b-0 py-2">
              <span>{a.activity}</span>
              <span className="text-gray-500">{a.time}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default OverviewTab;
