import React, { useState, useEffect } from 'react';
import { getConversations, getConnections } from '../../services/api';

function ChatSidebar({ selectedUserId, onSelectUser }) {
  const [tab, setTab] = useState('conversations'); // 'conversations' or 'connections'
  const [conversations, setConversations] = useState([]);
  const [connections, setConnections] = useState([]);

  useEffect(() => {
    // Fetch both lists when the component loads
    getConversations()
      .then(res => setConversations(res.data))
      .catch(err => console.error("Error fetching conversations:", err));
    
    getConnections()
      .then(res => setConnections(res.data))
      .catch(err => console.error("Error fetching connections:", err));
  }, []);

  return (
    <aside className="chat-sidebar">
      <div className="chat-sidebar-header">
        <button onClick={() => setTab('conversations')} className={tab === 'conversations' ? 'active' : ''}>
          Chats
        </button>
        <button onClick={() => setTab('connections')} className={tab === 'connections' ? 'active' : ''}>
          New Chat
        </button>
      </div>

      <div className="chat-list">
        {tab === 'conversations' && (
          <ul>
            {conversations.map(convo => (
              <li 
                key={convo.user_id} 
                onClick={() => onSelectUser(convo.user_id)}
                className={selectedUserId === convo.user_id ? 'active' : ''}
              >
                <span className="chat-list-name">{convo.name}</span>
                <span className="chat-list-preview">{convo.lastMessage}</span>
              </li>
            ))}
          </ul>
        )}
        
        {tab === 'connections' && (
          <ul>
            {connections.map(conn => (
              <li 
                key={conn.user_id} 
                onClick={() => onSelectUser(conn.user_id)}
                className={selectedUserId === conn.user_id ? 'active' : ''}
              >
                <span className="chat-list-name">{conn.name}</span>
                <span className="chat-list-preview">{conn.headline}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}

export default ChatSidebar;
