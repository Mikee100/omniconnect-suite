import React from 'react';

const InstagramTab = () => {
  // Mock data for Instagram analytics
  const stats = {
    followers: 3200,
    posts: 150,
    likes: 8700,
    comments: 1200,
    engagementRate: '7.2%'
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold mb-4">Instagram Analytics (Mock)</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded shadow p-4">
          <div className="text-2xl font-bold">{stats.followers}</div>
          <div className="text-gray-500">Followers</div>
        </div>
        <div className="bg-white rounded shadow p-4">
          <div className="text-2xl font-bold">{stats.posts}</div>
          <div className="text-gray-500">Posts</div>
        </div>
        <div className="bg-white rounded shadow p-4">
          <div className="text-2xl font-bold">{stats.likes}</div>
          <div className="text-gray-500">Likes</div>
        </div>
        <div className="bg-white rounded shadow p-4">
          <div className="text-2xl font-bold">{stats.comments}</div>
          <div className="text-gray-500">Comments</div>
        </div>
        <div className="bg-white rounded shadow p-4 col-span-2">
          <div className="text-2xl font-bold">{stats.engagementRate}</div>
          <div className="text-gray-500">Engagement Rate</div>
        </div>
      </div>
    </div>
  );
};

export default InstagramTab;
