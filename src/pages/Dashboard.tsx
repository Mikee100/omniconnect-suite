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
    <div className="space-y-4 animate-fadeIn">
      <PageHeader
        title="Dashboard"
        description="Comprehensive overview of your business automation metrics and performance"
      />

      {/* Modern Segmented Control Tabs */}
      <div className="bg-muted/40 backdrop-blur-sm p-1.5 rounded-xl inline-flex gap-1.5 flex-wrap shadow-sm border border-border/50 animate-slideUp">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'px-5 sm:px-7 py-2.5 sm:py-3 rounded-lg text-sm font-semibold transition-all duration-200 tap-target relative',
              activeTab === tab.id
                ? 'bg-background text-foreground shadow-md shadow-primary/10 scale-105'
                : 'text-muted-foreground hover:text-foreground hover:bg-background/60 active:scale-95'
            )}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-primary rounded-full"></span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content with smooth transitions */}
      <div className="animate-fadeIn" key={activeTab}>
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'whatsapp' && <WhatsAppTab />}
        {activeTab === 'instagram' && <InstagramTab />}
        {activeTab === 'messenger' && <MessengerTab />}
      </div>
    </div>
  );
}
