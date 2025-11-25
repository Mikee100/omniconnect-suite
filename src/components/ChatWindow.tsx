import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Send, User, Bot } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatWindowProps {
  conversationId: string;
  messages: Message[];
  onSendMessage: (message: string) => void;
  isTyping?: boolean;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ conversationId, messages, onSendMessage, isTyping = false }) => {
  const [inputMessage, setInputMessage] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      onSendMessage(inputMessage.trim());
      setInputMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className="flex flex-col h-full bg-gray-50 border border-gray-200 rounded-xl shadow-sm">
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full p-2" ref={scrollAreaRef}>
          <div className="space-y-2">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-end space-x-1 ${
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.sender === 'bot' && (
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-400 rounded-full flex items-center justify-center shadow">
                    <Bot className="w-3 h-3 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[70%] px-3 py-1.5 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-blue-500 text-white rounded-br-none'
                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                  } shadow-sm`}
                >
                  <p className="text-xs leading-snug">{message.content}</p>
                  <p className="text-[10px] opacity-60 mt-0.5 text-right">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {message.sender === 'user' && (
                  <div className="flex-shrink-0 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center shadow">
                    <User className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex items-end space-x-1 justify-start">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-400 rounded-full flex items-center justify-center shadow">
                  <Bot className="w-3 h-3 text-white" />
                </div>
                <div className="max-w-[70%] px-3 py-1.5 rounded-lg bg-white text-gray-800 border border-gray-200 shadow-sm">
                  <div className="flex space-x-0.5">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.1s]"></div>
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.3s]"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
      <div className="border-t p-2 bg-white rounded-b-xl">
        <div className="flex space-x-1">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 text-sm px-2 py-1 rounded-lg border border-gray-200 focus:ring-1 focus:ring-blue-400"
          />
          <Button
            onClick={handleSendMessage}
            size="icon"
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-150"
            style={{ minWidth: 36, minHeight: 36, padding: 0 }}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ChatWindow;
