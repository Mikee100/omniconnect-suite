import React from 'react';

const FacebookTab = () => {
  // Mock data for Facebook analytics
  const stats = {
    pageLikes: 5400,
    posts: 210,
    shares: 1300,
    comments: 1800,
    reach: '15,000',
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold mb-4">Facebook Analytics (Mock)</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded shadow p-4">
          <div className="text-2xl font-bold">{stats.pageLikes}</div>
          <div className="text-gray-500">Page Likes</div>
        </div>
        <div className="bg-white rounded shadow p-4">
          <div className="text-2xl font-bold">{stats.posts}</div>
          <div className="text-gray-500">Posts</div>
        </div>
        <div className="bg-white rounded shadow p-4">
          <div className="text-2xl font-bold">{stats.shares}</div>
          <div className="text-gray-500">Shares</div>
        </div>
        <div className="bg-white rounded shadow p-4">
          <div className="text-2xl font-bold">{stats.comments}</div>
          <div className="text-gray-500">Comments</div>
        </div>
        <div className="bg-white rounded shadow p-4 col-span-2">
          <div className="text-2xl font-bold">{stats.reach}</div>
          <div className="text-gray-500">Reach</div>
        </div>
      </div>
    </div>
  );
};

export default FacebookTab;
