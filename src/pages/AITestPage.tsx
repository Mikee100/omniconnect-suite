import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const AITestPage: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    setError('');
    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    try {
      const res = await axios.post('http://localhost:4000/api/chat', {
        customerId: 'test-user',
        message: input,
        history: newMessages.filter(m => m.role !== 'system'),
      });
      setMessages([...newMessages, { role: 'assistant', content: res.data.reply || 'No answer received.' }]);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error contacting AI backend.');
      setMessages([...newMessages, { role: 'assistant', content: 'Error contacting AI backend.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', padding: 24, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #eee', height: 600, display: 'flex', flexDirection: 'column' }}>
      <h2>AI Test Chat</h2>
      <div style={{ flex: 1, overflowY: 'auto', marginBottom: 16, background: '#f6f8fa', borderRadius: 4, padding: 12 }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{
            display: 'flex',
            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            marginBottom: 8
          }}>
            <div style={{
              background: msg.role === 'user' ? '#d1e7dd' : '#e2e3e5',
              color: '#222',
              padding: '10px 14px',
              borderRadius: 16,
              maxWidth: '80%',
              whiteSpace: 'pre-line',
              boxShadow: '0 1px 2px #eee'
            }}>
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSend} style={{ display: 'flex', gap: 8 }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type your message..."
          style={{ flex: 1, padding: 10, borderRadius: 8, border: '1px solid #ccc' }}
          disabled={loading}
        />
        <button type="submit" disabled={loading || !input.trim()} style={{ padding: '0 18px', borderRadius: 8 }}>
          {loading ? '...' : 'Send'}
        </button>
      </form>
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
    </div>
  );
};

export default AITestPage;
