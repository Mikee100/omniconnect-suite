import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Conversation {
  id: string;
  customerName: string;
  platform: 'whatsapp' | 'instagram' | 'messenger' | 'telegram';
  lastMessage: string;
  timestamp: string;
  unread: number;
}

interface Message {
  id: string;
  sender: 'customer' | 'agent';
  text: string;
  timestamp: string;
}

const mockConversations: Conversation[] = [
  {
    id: '1',
    customerName: 'Sarah Johnson',
    platform: 'whatsapp',
    lastMessage: 'Thanks for the information!',
    timestamp: '2 min ago',
    unread: 0,
  },
  {
    id: '2',
    customerName: 'Mike Chen',
    platform: 'instagram',
    lastMessage: 'Can I reschedule my appointment?',
    timestamp: '15 min ago',
    unread: 2,
  },
  {
    id: '3',
    customerName: 'Emma Wilson',
    platform: 'messenger',
    lastMessage: 'What are your opening hours?',
    timestamp: '1 hour ago',
    unread: 1,
  },
];

const mockMessages: Message[] = [
  {
    id: '1',
    sender: 'customer',
    text: 'Hi, I would like to book an appointment',
    timestamp: '10:30 AM',
  },
  {
    id: '2',
    sender: 'agent',
    text: 'Hello! I would be happy to help you with that. What service are you interested in?',
    timestamp: '10:31 AM',
  },
  {
    id: '3',
    sender: 'customer',
    text: 'I need a haircut and styling',
    timestamp: '10:32 AM',
  },
  {
    id: '4',
    sender: 'agent',
    text: 'Great! We have availability this week. What day works best for you?',
    timestamp: '10:33 AM',
  },
];

export default function Conversations() {
  const [selectedConv, setSelectedConv] = useState<string>(mockConversations[0].id);
  const [message, setMessage] = useState('');

  const getPlatformColor = (platform: Conversation['platform']) => {
    switch (platform) {
      case 'whatsapp':
        return 'bg-green-500';
      case 'instagram':
        return 'bg-pink-500';
      case 'messenger':
        return 'bg-blue-500';
      case 'telegram':
        return 'bg-sky-500';
    }
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      // TODO: Send message via API
      setMessage('');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Conversations</h1>
        <p className="text-muted-foreground">
          Manage customer conversations across all platforms
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Conversations List */}
        <Card className="lg:col-span-1 shadow-soft">
          <CardContent className="p-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search conversations..." className="pl-10" />
            </div>
            <ScrollArea className="h-[600px]">
              <div className="space-y-2">
                {mockConversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConv(conv.id)}
                    className={cn(
                      'flex cursor-pointer items-start gap-3 rounded-lg p-3 transition-colors hover:bg-accent',
                      selectedConv === conv.id && 'bg-accent'
                    )}
                  >
                    <div className="relative">
                      <Avatar>
                        <AvatarFallback>
                          {conv.customerName
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={cn(
                          'absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-card',
                          getPlatformColor(conv.platform)
                        )}
                      />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-foreground">
                          {conv.customerName}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {conv.timestamp}
                        </span>
                      </div>
                      <p className="truncate text-sm text-muted-foreground">
                        {conv.lastMessage}
                      </p>
                    </div>
                    {conv.unread > 0 && (
                      <Badge variant="default" className="ml-auto">
                        {conv.unread}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Window */}
        <Card className="lg:col-span-2 shadow-soft">
          <CardContent className="flex h-[700px] flex-col p-0">
            {/* Chat Header */}
            <div className="border-b border-border p-4">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>SJ</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-foreground">Sarah Johnson</h3>
                  <p className="text-sm text-muted-foreground">WhatsApp</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {mockMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      'flex',
                      msg.sender === 'agent' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <div
                      className={cn(
                        'max-w-[70%] rounded-lg px-4 py-2',
                        msg.sender === 'agent'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground'
                      )}
                    >
                      <p className="text-sm">{msg.text}</p>
                      <p
                        className={cn(
                          'mt-1 text-xs',
                          msg.sender === 'agent'
                            ? 'text-primary-foreground/70'
                            : 'text-muted-foreground'
                        )}
                      >
                        {msg.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="border-t border-border p-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button onClick={handleSendMessage}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
