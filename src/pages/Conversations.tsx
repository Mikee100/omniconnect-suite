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
      <Card className="w-80 flex flex-col overflow-hidden border-r border-border/50 bg-background shadow-lg">
        <div className="p-4 border-b border-border/50 space-y-4 bg-card/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Conversations</h2>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              className="pl-9 h-10 bg-background border-border/50 focus:border-primary/50 transition-all"
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
                    "flex items-start gap-3 p-4 text-left transition-all duration-200 hover:bg-muted/60 border-b border-border/30 last:border-0 group",
                    selectedChat?.id === chat.id && "bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-l-4 border-primary"
                  )}
                >
                  <Avatar className="ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
                    <AvatarFallback className={cn(
                      "text-white font-semibold shadow-md",
                      chat.platform === 'whatsapp' ? 'bg-gradient-to-br from-green-500 to-green-600' :
                        chat.platform === 'instagram' ? 'bg-gradient-to-br from-purple-500 to-pink-500' :
                          chat.platform === 'messenger' ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-gray-500 to-gray-600'
                    )}>
                      {chat.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold truncate text-sm">{chat.name}</span>
                      <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                        {formatDate(chat.lastMessageAt)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm text-muted-foreground truncate flex-1">
                        {chat.lastMessageDirection === 'outbound' && <span className="text-primary font-medium">You: </span>}
                        {chat.lastMessage}
                      </p>
                      <div className="flex-shrink-0">{getPlatformIcon(chat.platform)}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </Card>

      {/* Main Content - Chat View */}
      <Card className="flex-1 flex flex-col overflow-hidden bg-background shadow-lg">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-border/50 flex items-center justify-between bg-card/80 backdrop-blur-sm shadow-sm">
              <div className="flex items-center gap-3">
                <Avatar className="ring-2 ring-primary/20">
                  <AvatarFallback className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-white font-semibold shadow-md">
                    {selectedChat.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold flex items-center gap-2 text-base">
                    {selectedChat.name}
                    <Badge variant="outline" className="text-xs font-normal border-border/50">
                      {selectedChat.platform}
                    </Badge>
                  </h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-2 mt-0.5">
                    {selectedChat.phone || selectedChat.instagramId || selectedChat.messengerId}
                    {selectedChat.isActive && (
                      <span className="flex items-center text-green-600 font-medium">
                        <span className="w-2 h-2 rounded-full bg-green-500 mr-1.5 animate-pulse" />
                        Active
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="hover:bg-accent rounded-lg transition-all">
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
                          "flex w-full mb-3 animate-slideUp",
                          isOutbound ? "justify-end" : "justify-start"
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-[70%] px-4 py-2.5 rounded-2xl text-sm relative group shadow-sm transition-all hover:shadow-md",
                            isOutbound
                              ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-tr-sm"
                              : "bg-muted/80 text-foreground rounded-tl-sm border border-border/50"
                          )}
                        >
                          <p className="leading-relaxed">{msg.content}</p>
                          <div className={cn(
                            "text-[10px] mt-1.5 opacity-70 flex items-center gap-1.5",
                            isOutbound ? "justify-end text-primary-foreground/90" : "text-muted-foreground"
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
            <div className="p-4 border-t border-border/50 bg-card/80 backdrop-blur-sm shadow-sm">
              <form onSubmit={handleSendReply} className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  disabled={sending}
                  className="flex-1 h-11 border-border/50 focus:border-primary/50 transition-all"
                />
                <Button 
                  type="submit" 
                  disabled={!replyText.trim() || sending}
                  className="h-11 px-6 shadow-md hover:shadow-lg transition-all"
                >
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
                  <span className="text-orange-500 flex items-center gap-1.5 font-medium">
                    <Clock className="h-3 w-3" />
                    24h reply window applies
                  </span>
                ) : null}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 animate-fadeIn">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-6 shadow-lg">
              <MessageSquare className="h-10 w-10 text-primary/60" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">No conversation selected</h3>
            <p className="max-w-md text-center text-muted-foreground">
              Select a conversation from the sidebar to view messages and reply.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ConversationsPage;
