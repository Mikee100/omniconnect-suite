import React, { useState } from 'react';
import OverviewTab from '@/components/OverviewTab';
import WhatsAppTab from '@/components/WhatsAppTab';
import InstagramTab from '@/components/InstagramTab';
import MessengerTab from '@/components/MessengerTab';
import { PageHeader } from '@/components/PageHeader';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'whatsapp' | 'instagram' | 'messenger'>('overview');

  const tabs = [
    { id: 'overview' as const, label: 'Overview' },
    { id: 'whatsapp' as const, label: 'WhatsApp' },
    { id: 'instagram' as const, label: 'Instagram' },
    { id: 'messenger' as const, label: 'Messenger' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <PageHeader
        title="Dashboard"
        description="Overview of your business automation metrics"
      />

      {/* Segmented Control Tabs */}
      <div className="bg-muted/30 p-1 rounded-lg inline-flex gap-1 flex-wrap animate-slideIn">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'px-4 sm:px-6 py-2 sm:py-2.5 rounded-md text-sm font-medium transition-all duration-200 tap-target',
              activeTab === tab.id
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-fadeIn" key={activeTab}>
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'whatsapp' && <WhatsAppTab />}
        {activeTab === 'instagram' && <InstagramTab />}
        {activeTab === 'messenger' && <MessengerTab />}
      </div>
    </div>
  );
}
