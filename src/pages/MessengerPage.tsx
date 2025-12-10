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
import { MessageSquare, Settings, AlertCircle, CheckCircle, Send, Loader2, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { API_BASE_URL } from '@/config';
import {
  getMessengerMessages,
  getMessengerConversations,
  sendMessengerMessage,
  testMessengerConnection,
  MessengerMessage,
  MessengerConversation
} from '@/api/messenger';
import { useToast } from '@/hooks/use-toast';
import { io, Socket } from 'socket.io-client';

export default function MessengerPage() {
  // Always minimize sidebar when on this page
  const setSidebarCollapsed = useUIStore((s) => s.setSidebarCollapsed);
  useEffect(() => {
    setSidebarCollapsed(true);
  }, [setSidebarCollapsed]);

  const [messages, setMessages] = useState<MessengerMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [conversations, setConversations] = useState<MessengerConversation[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Initialize WebSocket connection
    socketRef.current = io(API_BASE_URL, {
      transports: ['websocket', 'polling'],
    });

    socketRef.current.on('connect', () => {
      console.log('Connected to WebSocket');
      // Join the messenger room to receive events
      socketRef.current?.emit('join', { platform: 'messenger' });
    });

    socketRef.current.on('disconnect', () => {
      console.log('Disconnected from WebSocket');
    });

    // Listen for new messages
    socketRef.current.on('newMessage', (data: any) => {
      if (data.platform === 'messenger') {
        if (data.customerId === selectedCustomerId) {
          setMessages(prev => [...prev, {
            id: data.id,
            from: data.from,
            to: data.to,
            content: data.content,
            timestamp: data.timestamp,
            direction: data.direction,
            customerId: data.customerId,
          }]);
        }
        // Refresh conversations list
        loadConversations();
      }
    });

    // Listen for conversation updates
    socketRef.current.on('conversationUpdate', (data: any) => {
      if (data.platform === 'messenger') {
        setConversations(data.conversations);
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [selectedCustomerId]);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const response = await getMessengerConversations();
      const conversations = response?.data?.conversations || response?.conversations || [];
      setConversations(Array.isArray(conversations) ? conversations : []);
    } catch (error) {
      console.error('Failed to load conversations:', error);
      setConversations([]);
    }
  };

  // Poll for conversations and messages
  useEffect(() => {
    const pollInterval = setInterval(() => {
      loadConversations();
      if (selectedCustomerId) {
        const loadConversationMessages = async () => {
          try {
            const response = await getMessengerMessages(selectedCustomerId);
            const messages = response?.data?.messages || response?.messages || [];
            setMessages(Array.isArray(messages) ? messages : []);
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
          const response = await getMessengerMessages(selectedCustomerId);
          const messages = response?.data?.messages || response?.messages || [];
          setMessages(Array.isArray(messages) ? messages : []);

          // Check if we should show typing indicator
          const safeMessages = Array.isArray(messages) ? messages : [];
          const lastMessage = safeMessages[safeMessages.length - 1];
          if (lastMessage && lastMessage.direction === 'inbound') {
            const messageTime = new Date(lastMessage.timestamp || lastMessage.createdAt).getTime();
            const now = Date.now();
            const timeDiff = now - messageTime;
            // Show typing for up to 30 seconds after user message if no AI response
            setIsTyping(timeDiff < 30000 && !safeMessages.some(m =>
              m.direction === 'outbound' &&
              new Date(m.timestamp || m.createdAt).getTime() > messageTime
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

  const { toast } = useToast();

  const handleSendMessage = async () => {
    if (newMessage.trim() && selectedRecipient.trim()) {
      setIsTyping(true);
      try {
        // Send message via API
        await sendMessengerMessage({ to: selectedRecipient, message: newMessage });

        // Add to local messages list
        const message: MessengerMessage = {
          id: Date.now().toString(),
          content: newMessage,
          direction: 'outbound',
          createdAt: new Date().toISOString(),
          timestamp: new Date().toISOString(),
          customerId: selectedCustomerId,
          to: selectedRecipient,
        };
        setMessages(prev => [...prev, message]);
        setNewMessage('');

        // Show success toast
        toast({
          title: 'Message sent',
          description: 'Your message has been sent successfully.',
        });
      } catch (error: any) {
        console.error('Failed to send message:', error);
        const errorMessage = error.response?.data?.message || error.message || 'There was an error sending your message. Please try again.';
        toast({
          title: 'Failed to send message',
          description: errorMessage,
          variant: 'destructive',
        });
      } finally {
        setIsTyping(false);
      }
    }
  };

  const formatMessengerId = (id: string) => {
    // Messenger IDs are typically numeric, so just return as is
    return id;
  };

  return (
    <div className="w-full h-[150vh] flex flex-col bg-background rounded-xl shadow overflow-hidden">
      <div className="flex flex-1 min-h-0">
        {/* Conversations List */}
        <div className="w-[200px] lg:w-[220px] bg-muted/30 border-r border-border flex flex-col min-h-0">
          <div className="px-3 py-2 border-b border-border flex items-center gap-2 bg-muted/50 flex-shrink-0">
            <MessageSquare className="h-4 w-4 text-blue-600" />
            <span className="text-base font-semibold text-foreground">Chats</span>
          </div>
          <div className="flex-1 min-h-0">
            <div className="divide-y divide-border overflow-y-auto h-full">
              {(conversations || []).length === 0 && (
                <div className="text-center text-muted-foreground py-6 text-xs">No conversations</div>
              )}
              {(conversations || []).map((conversation) => {
                const isActive = selectedRecipient === conversation.messengerId;
                const displayName = conversation.customerName || 'Unknown';
                return (
                  <div
                    key={conversation.customerId}
                    onClick={() => {
                      setSelectedRecipient(conversation.messengerId);
                      setSelectedCustomerId(conversation.customerId);
                    }}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 cursor-pointer transition-all',
                      isActive ? 'bg-accent' : 'hover:bg-accent/50'
                    )}
                    style={{ minHeight: 48 }}
                  >
                    <Avatar className="h-8 w-8 shadow">
                      <AvatarFallback className="bg-blue-600 text-white font-bold text-xs">
                        {displayName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={cn('font-medium truncate text-sm text-foreground')}>
                          {displayName}
                        </span>
                        <span className="text-[10px] text-muted-foreground ml-2 whitespace-nowrap">
                          {conversation.lastMessageAt ? new Date(conversation.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="text-xs text-muted-foreground truncate max-w-[120px]">{conversation.lastMessage}</span>
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
              <div className="flex-shrink-0 border-b border-border px-4 py-2 bg-muted/30">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs bg-blue-600 text-white">
                        {conversations.find(c => c.messengerId === selectedRecipient)?.customerName.charAt(0).toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-semibold text-sm truncate max-w-[120px]">
                      {conversations.find(c => c.messengerId === selectedRecipient)?.customerName || 'Unknown Customer'}
                    </span>
                    <span className="text-[10px] text-muted-foreground truncate max-w-[90px] ml-2">
                      {formatMessengerId(selectedRecipient)}
                    </span>
                  </div>
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
                    {(messages || []).map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          'flex',
                          message.direction === 'outbound' ? 'justify-end' : 'justify-start'
                        )}
                      >
                        <div
                          className={cn(
                            'messenger-bubble px-3 py-1.5 rounded-xl shadow',
                            message.direction === 'outbound'
                              ? 'bg-blue-600 text-white rounded-br-md'
                              : 'bg-card text-foreground border border-border/50 rounded-bl-md'
                          )}
                          style={{ maxWidth: '70%' }}
                        >
                          <p className="break-words whitespace-pre-wrap text-xs">{message.content}</p>
                          <p className={cn(
                            "text-[10px] mt-0.5 text-right",
                            message.direction === 'outbound' ? 'opacity-80' : 'opacity-60'
                          )}>
                            {new Date(message.timestamp || message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))}
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-card border border-border/50 rounded-xl px-3 py-1.5 text-xs max-w-[70%] shadow">
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
                      className="absolute right-2 bottom-2 z-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow p-1 flex items-center justify-center transition"
                      style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
                      onClick={() => {
                        if (chatScrollRef.current) {
                          chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
                        }
                        setAutoScroll(true);
                      }}
                      aria-label="Scroll to bottom"
                    >
                      <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M12 5v14m0 0l-7-7m7 7l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </button>
                  )}
                </div>
      </div>
              <div className="flex gap-1 items-end p-2 bg-muted/30 flex-shrink-0 border-t border-border">
                <Textarea
                  placeholder="Type a message"
              value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  rows={1}
                  className="flex-1 rounded-2xl resize-none border-none bg-background shadow focus:ring-0 text-xs px-2 py-1"
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
                  className="rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow"
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
