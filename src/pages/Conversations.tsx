import React, { useState, useEffect, useRef } from 'react';
import {
  Search, Send, Phone, MessageSquare, MessageCircle,
  MoreVertical, CheckCheck, Clock, User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { conversationsApi, Conversation, Message } from '@/api/conversations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ConversationsPage = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedChat, setSelectedChat] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
    // Set up polling interval for real-time updates (placeholder for WebSocket)
    const interval = setInterval(loadConversations, 10000);
    return () => clearInterval(interval);
  }, [filter]);

  useEffect(() => {
    if (selectedChat) {
      loadMessages(selectedChat.id);
    }
  }, [selectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversations = async () => {
    try {
      const platform = filter !== 'all' ? filter : undefined;
      const data = await conversationsApi.getAll(platform);
      setConversations(data);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (customerId: string) => {
    setMessagesLoading(true);
    try {
      const data = await conversationsApi.getMessages(customerId);
      setMessages(data);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChat || !replyText.trim()) return;

    setSending(true);
    try {
      const newMessage = await conversationsApi.sendReply(
        selectedChat.id,
        replyText,
        selectedChat.platform
      );

      // Add message locally immediately
      setMessages([...messages, newMessage]);
      setReplyText('');

      // Update conversations list to show latest message
      loadConversations();
    } catch (error) {
      console.error('Failed to send reply:', error);
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'whatsapp': return <Phone className="h-4 w-4 text-green-500" />;
      case 'instagram': return <MessageSquare className="h-4 w-4 text-purple-500" />;
      case 'messenger': return <MessageCircle className="h-4 w-4 text-blue-500" />;
      default: return <MessageSquare className="h-4 w-4 text-gray-500" />;
    }
  };

  const filteredConversations = conversations.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.phone && c.phone.includes(searchTerm))
  );

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    return isToday ? formatTime(dateString) : date.toLocaleDateString();
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] gap-4 animate-fadeIn">
      {/* Sidebar - Conversation List */}
      <Card className="w-80 flex flex-col overflow-hidden border-r bg-background">
        <div className="p-4 border-b space-y-4">
          <h2 className="text-xl font-bold">Conversations</h2>

          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Tabs defaultValue="all" value={filter} onValueChange={setFilter} className="w-full">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="whatsapp" title="WhatsApp">WA</TabsTrigger>
              <TabsTrigger value="instagram" title="Instagram">IG</TabsTrigger>
              <TabsTrigger value="messenger" title="Messenger">FB</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <ScrollArea className="flex-1">
          {conversations.length === 0 && !loading ? (
            <div className="p-8 text-center text-muted-foreground">
              No conversations found
            </div>
          ) : (
            <div className="flex flex-col">
              {filteredConversations.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => setSelectedChat(chat)}
                  className={cn(
                    "flex items-start gap-3 p-4 text-left transition-colors hover:bg-muted/50 border-b last:border-0",
                    selectedChat?.id === chat.id && "bg-muted"
                  )}
                >
                  <Avatar>
                    <AvatarFallback className={cn(
                      "text-white",
                      chat.platform === 'whatsapp' ? 'bg-green-500' :
                        chat.platform === 'instagram' ? 'bg-purple-500' :
                          chat.platform === 'messenger' ? 'bg-blue-500' : 'bg-gray-500'
                    )}>
                      {chat.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold truncate">{chat.name}</span>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(chat.lastMessageAt)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground truncate max-w-[140px]">
                        {chat.lastMessageDirection === 'outbound' && 'You: '}
                        {chat.lastMessage}
                      </p>
                      {getPlatformIcon(chat.platform)}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </Card>

      {/* Main Content - Chat View */}
      <Card className="flex-1 flex flex-col overflow-hidden bg-background">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b flex items-center justify-between bg-card">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {selectedChat.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold flex items-center gap-2">
                    {selectedChat.name}
                    <Badge variant="outline" className="text-xs font-normal">
                      {selectedChat.platform}
                    </Badge>
                  </h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    {selectedChat.phone || selectedChat.instagramId || selectedChat.messengerId}
                    {selectedChat.isActive && (
                      <span className="flex items-center text-green-500 ml-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 mr-1 animate-pulse" />
                        Active
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </div>

            {/* Chat Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messagesLoading ? (
                  <div className="flex justify-center p-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const isOutbound = msg.direction === 'outbound';
                    const isFirstInSequence = index === 0 || messages[index - 1].direction !== msg.direction;

                    return (
                      <div
                        key={msg.id}
                        className={cn(
                          "flex w-full mb-2",
                          isOutbound ? "justify-end" : "justify-start"
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-[70%] px-4 py-2 rounded-2xl text-sm relative group",
                            isOutbound
                              ? "bg-primary text-primary-foreground rounded-tr-sm"
                              : "bg-muted text-foreground rounded-tl-sm"
                          )}
                        >
                          <p>{msg.content}</p>
                          <div className={cn(
                            "text-[10px] mt-1 opacity-70 flex items-center gap-1",
                            isOutbound ? "justify-end text-primary-foreground/80" : "text-muted-foreground"
                          )}>
                            {formatTime(msg.createdAt)}
                            {isOutbound && <CheckCheck className="h-3 w-3" />}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Reply Input */}
            <div className="p-4 border-t bg-card">
              <form onSubmit={handleSendReply} className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  disabled={sending}
                  className="flex-1"
                />
                <Button type="submit" disabled={!replyText.trim() || sending}>
                  {sending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
              <div className="mt-2 text-xs text-muted-foreground flex items-center justify-between">
                <span>Press Enter to send</span>
                {selectedChat.platform === 'instagram' || selectedChat.platform === 'messenger' ? (
                  <span className="text-orange-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    24h reply window applies
                  </span>
                ) : null}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <MessageSquare className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold">No conversation selected</h3>
            <p className="max-w-xs text-center mt-2">
              Select a conversation from the sidebar to view messages and reply.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ConversationsPage;
