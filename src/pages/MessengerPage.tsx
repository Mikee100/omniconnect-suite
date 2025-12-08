import React, { useEffect, useState } from 'react';

interface Conversation {
  id: string;
  name: string;
}

interface Message {
  id: string;
  content: string;
  direction: string;
  createdAt: string;
}


const MessengerPage: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    // Fetch Messenger conversations on mount
    fetch('/api/conversations?platform=messenger')
      .then(res => res.json())
      .then(data => setConversations(data))
      .catch(() => setConversations([]));
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      setLoading(true);
      fetch(`/api/conversations/${selectedConversation}/messages?platform=messenger`)
        .then(res => res.json())
        .then(data => setMessages(data))
        .catch(() => setMessages([]))
        .finally(() => setLoading(false));
    }
  }, [selectedConversation]);

  const handleSend = async () => {
    if (!selectedConversation || !newMessage.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`/api/conversations/${selectedConversation}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newMessage, platform: 'messenger' }),
      });
      if (res.ok) {
        setNewMessage('');
        // Refresh messages
        fetch(`/api/conversations/${selectedConversation}/messages?platform=messenger`)
          .then(res => res.json())
          .then(data => setMessages(data));
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ width: 300, borderRight: '1px solid #eee', overflowY: 'auto' }}>
        <h2 style={{ padding: 16 }}>Conversations</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {conversations.map(conv => (
            <li
              key={conv.id}
              style={{
                padding: 16,
                background: selectedConversation === conv.id ? '#f0f0f0' : 'transparent',
                cursor: 'pointer',
              }}
              onClick={() => setSelectedConversation(conv.id)}
            >
              {conv.name}
            </li>
          ))}
        </ul>
      </div>
      <div style={{ flex: 1, padding: 24, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        <h2>Messages</h2>
        {loading && <div>Loading...</div>}
        {!loading && messages.length === 0 && <div>No messages.</div>}
        <ul style={{ listStyle: 'none', padding: 0, flex: 1, overflowY: 'auto' }}>
          {messages.map(msg => (
            <li key={msg.id} style={{ marginBottom: 12 }}>
              <strong>{msg.direction === 'outbound' ? 'You' : 'User'}:</strong> {msg.content}
              <div style={{ fontSize: 12, color: '#888' }}>{new Date(msg.createdAt).toLocaleString()}</div>
            </li>
          ))}
        </ul>
        {selectedConversation && (
          <div style={{ display: 'flex', marginTop: 16 }}>
            <input
              type="text"
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              style={{ flex: 1, padding: 8, fontSize: 16 }}
              onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
              disabled={sending}
            />
            <button
              onClick={handleSend}
              disabled={sending || !newMessage.trim()}
              style={{ marginLeft: 8, padding: '8px 16px', fontSize: 16 }}
            >
              {sending ? 'Sending...' : 'Send'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessengerPage;
