// my-app/src/components/Chat/ChatWindow.jsx
import React, { useState, useEffect, useRef } from 'react';
import { getMessages, sendMessage } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

function ChatWindow({ selectedUserId }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const { currentUser } = useAuth();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (selectedUserId) {
      setLoading(true);
      getMessages(selectedUserId)
        .then(res => {
          setMessages(res.data);
        })
        .catch(err => console.error("Error fetching messages:", err))
        .finally(() => setLoading(false));
    }
  }, [selectedUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUserId) return;

    const messageData = {
      receiver_id: selectedUserId,
      content: newMessage
    };

    sendMessage(messageData)
      .then(() => {
        setNewMessage('');
        setMessages(prev => [
          ...prev, 
          { 
            ...messageData, 
            sender_id: currentUser.user_id, 
            content_sent_at: new Date().toISOString() 
          }
        ]);
      })
      .catch(err => console.error("Error sending message:", err));
  };

  if (loading) {
    return <div className="chat-window loading">Loading...</div>;
  }

  if (!selectedUserId) {
    return (
      <div className="chat-window-placeholder">
        <h2>Select a conversation</h2>
        <p>Start a new chat from your connections or continue a previous conversation.</p>
      </div>
    );
  }

  return (
    <main className="chat-window">
      <div className="message-list">
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`message-bubble ${msg.sender_id === currentUser.user_id ? 'sent' : 'received'}`}
          >
            {msg.content}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form className="message-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit">Send</button>
      </form>
    </main>
  );
}

export default ChatWindow;