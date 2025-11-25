
import React, { useState } from 'react';
import OverviewTab from '@/components/OverviewTab';
import WhatsAppTab from '@/components/WhatsAppTab';
import InstagramTab from '@/components/InstagramTab';
import FacebookTab from '@/components/FacebookTab';


export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'whatsapp' | 'instagram' | 'facebook'>('overview');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your business automation metrics
        </p>
      </div>

      <div className="flex space-x-2 border-b mb-4">
        <button
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${activeTab === 'overview' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-primary'}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${activeTab === 'whatsapp' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-primary'}`}
          onClick={() => setActiveTab('whatsapp')}
        >
          WhatsApp
        </button>
        <button
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${activeTab === 'instagram' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-primary'}`}
          onClick={() => setActiveTab('instagram')}
        >
          Instagram
        </button>
        <button
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${activeTab === 'facebook' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-primary'}`}
          onClick={() => setActiveTab('facebook')}
        >
          Facebook
        </button>
      </div>

      <div>
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'whatsapp' && <WhatsAppTab />}
        {activeTab === 'instagram' && <InstagramTab />}
        {activeTab === 'facebook' && <FacebookTab />}
      </div>
    </div>
  );
}

