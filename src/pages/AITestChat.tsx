import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { sendConversationMessage, ConversationMessage } from '@/api/ai';

const AITestChat: React.FC = () => {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [customerId, setCustomerId] = useState('test-customer-123');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ConversationMessage = { role: 'user', content: inputMessage };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await sendConversationMessage(inputMessage, customerId, messages);
      let content: any = response.response;
      // If response is a JSON string, try to parse it
      if (typeof content === 'string') {
        try {
          const parsed = JSON.parse(content);
          if (parsed && typeof parsed === 'object' && (parsed.text || parsed.mediaUrls)) {
            content = parsed;
          }
        } catch {}
      }
      const assistantMessage: ConversationMessage = { role: 'assistant', content };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ConversationMessage = { role: 'assistant', content: 'Sorry, there was an error processing your message.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>AI Test Chat</CardTitle>
          <div className="flex gap-2 items-center">
            <label htmlFor="customerId" className="text-sm font-medium">Customer ID:</label>
            <Input
              id="customerId"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-48"
              placeholder="Enter customer ID"
            />
            <Button onClick={clearChat} variant="outline">Clear Chat</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-96 w-full border rounded-md p-4 overflow-y-auto">
            {messages.length === 0 ? (
              <p className="text-gray-500 text-center">Start a conversation with the AI...</p>
            ) : (
              messages.map((msg, index) => {
                const isObj = typeof msg.content === 'object' && msg.content !== null;
                const text = isObj ? msg.content.text : msg.content;
                const mediaUrls = isObj && Array.isArray(msg.content.mediaUrls) ? msg.content.mediaUrls : [];
                return (
                  <div key={index} className={`mb-4 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                    <div className={`inline-block p-3 rounded-lg max-w-xs lg:max-w-md ${
                      msg.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-800'
                    }`}>
                      <p className="whitespace-pre-wrap">{text}</p>
                      {mediaUrls.length > 0 && (
                        <div className="mt-2 space-y-2">
                          {mediaUrls.map((url: string, i: number) => (
                            <img key={url} src={url} alt={`media ${i + 1}`} className="max-w-full rounded" />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            {isLoading && (
              <div className="text-left mb-4">
                <div className="inline-block p-3 rounded-lg bg-gray-200 text-gray-800">
                  <p>AI is typing...</p>
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-2 mt-4">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button onClick={handleSendMessage} disabled={isLoading || !inputMessage.trim()}>
              Send
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AITestChat;
