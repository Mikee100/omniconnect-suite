import { useState, useEffect, useRef, useCallback } from 'react';
import { useUIStore } from '@/state/uiStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Phone, MessageSquare, Settings, AlertCircle, CheckCircle, Send, Loader2, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MetricCard } from '@/components/MetricCard';
import {
  getWhatsAppSettings,
  updateWhatsAppSettings,
  testWhatsAppConnection,
  sendWhatsAppMessage,
  getWhatsAppMessages,
  getWhatsAppConversations,
  toggleCustomerAi,
  getWhatsAppStats,
  WhatsAppSettings,
  WhatsAppMessage,
  WhatsAppConversation
} from '@/api/whatsapp';
import { useToast } from '@/hooks/use-toast';

interface WhatsAppStats {
  totalMessages: number;
  inboundMessages: number;
  outboundMessages: number;
  activeConversations: number;
}

export default function WhatsApp() {
  // Always minimize sidebar when on this page
  const setSidebarCollapsed = useUIStore((s) => s.setSidebarCollapsed);
  useEffect(() => {
    setSidebarCollapsed(true);
    // Optionally, restore on unmount:
    // return () => setSidebarCollapsed(false);
  }, [setSidebarCollapsed]);
  const [settings, setSettings] = useState<WhatsAppSettings>({
    phoneNumberId: '',
    accessToken: '',
    verifyToken: '',
    webhookUrl: '',
  });

  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [conversations, setConversations] = useState<WhatsAppConversation[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [customerAiEnabled, setCustomerAiEnabled] = useState<boolean | null>(null);



  useEffect(() => {
    // Load conversations from backend
    const loadConversations = async () => {
      try {
        const response = await getWhatsAppConversations();
        setConversations(Array.isArray(response.conversations) ? response.conversations : []);
      } catch (error) {
        console.error('Failed to load conversations:', error);
        // Show empty array if API fails
        setConversations([]);
      }
    };

    loadConversations();

    // Load settings from localStorage or API
    const savedSettings = localStorage.getItem('whatsapp-settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }

    // Set up polling for real-time updates
    const pollInterval = setInterval(() => {
      loadConversations();
      if (selectedCustomerId) {
        const loadConversationMessages = async () => {
          try {
            const response = await getWhatsAppMessages({ customerId: selectedCustomerId });
            setMessages(response.messages);
          } catch (error) {
            console.error('Failed to load conversation messages:', error);
          }
        };
        loadConversationMessages();
      }
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(pollInterval);
  }, [selectedCustomerId]);

  // Load conversation messages when customer is selected
  useEffect(() => {
    if (selectedCustomerId) {
      const loadConversationMessages = async () => {
        try {
          const response = await getWhatsAppMessages({ customerId: selectedCustomerId });
          setMessages(response.messages);

          // Load customer AI status
          // Note: We need to get customer details to check aiEnabled
          // For now, we'll assume it's enabled or add a separate API call later

          // Check if we should show typing indicator
          // Show typing if the last message is from user (inbound) and no recent AI response
          const lastMessage = response.messages[response.messages.length - 1];
          if (lastMessage && lastMessage.direction === 'inbound') {
            const messageTime = new Date(lastMessage.timestamp).getTime();
            const now = Date.now();
            const timeDiff = now - messageTime;
            // Show typing for up to 30 seconds after user message if no AI response
            setIsTyping(timeDiff < 30000 && !response.messages.some(m =>
              m.direction === 'outbound' &&
              new Date(m.timestamp).getTime() > messageTime
            ));
          } else {
            setIsTyping(false);
          }
        } catch (error) {
          console.error('Failed to load conversation messages:', error);
        }
      };
      loadConversationMessages();
    }
  }, [selectedCustomerId]);


  // Scroll to bottom only on first load or if user is at bottom
  useEffect(() => {
    if (!chatScrollRef.current) return;
    if (autoScroll) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
    // eslint-disable-next-line
  }, [messages, selectedCustomerId]);

  // Handler for scroll events in chat
  const handleChatScroll = useCallback(() => {
    const el = chatScrollRef.current;
    if (!el) return;
    const threshold = 120;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
    setShowScrollDown(!atBottom);
    setAutoScroll(atBottom);
  }, []);

  const handleSaveSettings = () => {
    localStorage.setItem('whatsapp-settings', JSON.stringify(settings));
    // TODO: Save to backend API
    alert('Settings saved successfully!');
  };

  const handleTestConnection = async () => {
    setIsLoading(true);
    try {
      // TODO: Test connection with WhatsApp API
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsConnected(true);
    } catch (error) {
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const { toast } = useToast();

  const handleSendMessage = async () => {
    if (newMessage.trim() && selectedRecipient) {
      setIsTyping(true);
      try {
        // Send message via API
        await sendWhatsAppMessage(selectedRecipient, newMessage);

        // Add to local messages list
        const message: WhatsAppMessage = {
          id: Date.now().toString(),
          from: settings.phoneNumberId,
          to: selectedRecipient,
          content: newMessage,
          timestamp: new Date().toISOString(),
          direction: 'outbound',
          customerId: selectedCustomerId,
        };
        setMessages(prev => [...prev, message]);
        setNewMessage('');

        // Show success toast
        toast({
          title: 'Message sent',
          description: 'Your message has been sent successfully.',
        });
      } catch (error) {
        console.error('Failed to send message:', error);
        toast({
          title: 'Failed to send message',
          description: 'There was an error sending your message. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsTyping(false);
      }
    }
  };

  const formatPhoneNumber = (number: string) => {
    // Remove any non-digits except +
    let digits = number.replace(/[^\d+]/g, '');
    
    // If it starts with +, remove it for processing
    const hasPlus = digits.startsWith('+');
    if (hasPlus) {
      digits = digits.slice(1);
    }
    
    // Handle Kenyan numbers (254 followed by 9 digits)
    if (digits.length === 12 && digits.startsWith('254')) {
      return `+${digits.slice(0,3)} ${digits.slice(3,6)} ${digits.slice(6,9)} ${digits.slice(9)}`;
    }
    
    // Handle US/Canada 10-digit numbers
    if (digits.length === 10) {
      return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
    }
    
    // Handle other international numbers (assume 3-digit country code + 9 digits)
    if (digits.length === 12) {
      return `+${digits.slice(0,3)} ${digits.slice(3,6)} ${digits.slice(6,9)} ${digits.slice(9)}`;
    }
    
    // Fallback: add + if not present and return as is
    if (!hasPlus && digits.length > 0) {
      return `+${digits}`;
    }
    
    return number;
  };

  return (
    <div className="w-full h-[110vh] flex flex-col bg-[#111b21] dark:bg-[#111b21] rounded-xl shadow overflow-hidden">
      <div className="flex flex-1 min-h-0">
        {/* Conversations List */}
        <div className="w-full lg:w-[300px] bg-[#202c33] border-r border-[#222c2a] flex flex-col min-h-0">
          <div className="px-3 py-2 border-b border-[#222c2a] flex items-center gap-2 bg-[#202c33] flex-shrink-0">
            <MessageSquare className="h-4 w-4 text-[#25d366]" />
            <span className="text-base font-semibold text-white">Chats</span>
          </div>
          <div className="flex-1 min-h-0">
            <div className="divide-y divide-[#222c2a] overflow-y-auto h-full">
              {(conversations || []).length === 0 && (
                <div className="text-center text-muted-foreground py-6 text-white/60 text-xs">No conversations</div>
              )}
              {(conversations || []).map((conversation) => {
                const isActive = selectedRecipient === conversation.phone;
                return (
                  <div
                    key={conversation.customerId}
                    onClick={() => {
                      setSelectedRecipient(conversation.phone);
                      setSelectedCustomerId(conversation.customerId);
                    }}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 cursor-pointer transition-all',
                      isActive ? 'bg-[#2a3942]' : 'hover:bg-[#222c2a]'
                    )}
                    style={{ minHeight: 48 }}
                  >
                    <Avatar className="h-8 w-8 shadow">
                      <AvatarFallback className="bg-[#25d366] text-white font-bold text-xs">
                        {conversation.customerName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={cn('font-medium truncate text-sm', isActive ? 'text-white' : 'text-white/90')}>
                          {formatPhoneNumber(conversation.phone)}
                        </span>
                        <span className="text-[10px] text-[#8696a0] ml-2 whitespace-nowrap">
                          {conversation.latestTimestamp ? new Date(conversation.latestTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="text-xs text-[#8696a0] truncate max-w-[120px]">{conversation.latestMessage}</span>
                        {conversation.unreadCount > 0 && (
                          <span className="ml-2 bg-[#25d366] text-[10px] text-white rounded-full px-1.5 py-0.5 font-semibold">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="flex flex-col flex-1 min-h-0">
          {selectedRecipient ? (
            <>
              <div className="flex-shrink-0 border-b border-[#222c2a] px-4 py-2 bg-[#ece5dd] dark:bg-[#222c2a]">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {conversations.find(c => c.phone === selectedRecipient)?.customerName.charAt(0).toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-semibold text-sm truncate max-w-[120px]">
                      {conversations.find(c => c.phone === selectedRecipient)?.customerName || 'Unknown Customer'}
                    </span>
                    <span className="text-[10px] text-muted-foreground truncate max-w-[90px] ml-2">
                      {formatPhoneNumber(selectedRecipient)}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      try {
                        const result = await toggleCustomerAi(selectedCustomerId);
                        setCustomerAiEnabled(result.aiEnabled);
                        toast({
                          title: 'AI toggled',
                          description: `AI is now ${result.aiEnabled ? 'enabled' : 'disabled'} for this customer.`,
                        });
                      } catch (error) {
                        console.error('Failed to toggle AI:', error);
                        toast({
                          title: 'Failed to toggle AI',
                          description: 'There was an error toggling AI for this customer.',
                          variant: 'destructive',
                        });
                      }
                    }}
                    className="flex items-center gap-1 text-xs px-2 py-1 whitespace-nowrap"
                  >
                    <Bot className="h-3 w-3" />
                    {customerAiEnabled ? 'Disable AI' : 'Enable AI'}
                  </Button>
                </div>
              </div>
              <div className="flex-1 min-h-0 relative">
                <div
                  ref={chatScrollRef}
                  className="absolute inset-0 p-2 overflow-y-auto"
                  style={{ scrollBehavior: 'smooth', background: 'inherit' }}
                  onScroll={handleChatScroll}
                >
                  <div className="flex flex-col gap-1 pb-6">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          'flex',
                          message.direction === 'outbound' ? 'justify-end' : 'justify-start'
                        )}
                      >
                        <div
                          className={cn(
                            'whatsapp-bubble px-3 py-1.5 rounded-xl shadow',
                            message.direction === 'outbound'
                              ? 'bg-[#d1f7c4] text-black rounded-br-md'
                              : 'bg-white dark:bg-[#2a2f32] text-black dark:text-white rounded-bl-md'
                          )}
                          style={{ maxWidth: '70%' }}
                        >
                          <p className="break-words whitespace-pre-wrap text-xs">{message.content}</p>
                          <p className="text-[10px] opacity-60 mt-0.5 text-right">
                            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))}
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-white dark:bg-[#2a2f32] rounded-xl px-3 py-1.5 text-xs max-w-[70%] shadow">
                          <div className="flex items-center space-x-1">
                            <div className="flex space-x-0.5">
                              <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></div>
                              <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                            <span className="text-[10px] text-muted-foreground ml-1">AI is typing...</span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                  {showScrollDown && (
                    <button
                      className="absolute right-2 bottom-2 z-10 bg-[#25d366] hover:bg-[#1ebc59] text-white rounded-full shadow p-1 flex items-center justify-center transition"
                      style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
                      onClick={() => {
                        if (chatScrollRef.current) {
                          chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
                        }
                        setAutoScroll(true);
                      }}
                      aria-label="Scroll to bottom"
                    >
                      <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M12 5v14m0 0l-7-7m7 7l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                  )}
                </div>
              </div>
              <div className="flex gap-1 items-end p-2 bg-[#ece5dd] dark:bg-[#222c2a] flex-shrink-0 border-t border-[#222c2a]">
                <Textarea
                  placeholder="Type a message"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  rows={1}
                  className="flex-1 rounded-2xl resize-none border-none bg-white dark:bg-[#2a2f32] shadow focus:ring-0 text-xs px-2 py-1"
                  style={{ minHeight: 28, maxHeight: 80 }}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  size="icon"
                  className="rounded-full bg-[#25d366] hover:bg-[#1ebc59] text-white shadow"
                  style={{ height: 28, width: 28, minWidth: 28, minHeight: 28 }}
                  aria-label="Send"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <div className="text-center text-muted-foreground">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs">Select a conversation to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
