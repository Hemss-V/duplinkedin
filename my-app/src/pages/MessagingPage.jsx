// my-app/src/pages/MessagingPage.jsx
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/common/Navbar.jsx';
import ChatSidebar from '../components/Chat/ChatSidebar.jsx';
import ChatWindow from '../components/Chat/ChatWindow.jsx';

function MessagingPage() {
  const { userId } = useParams(); 
  const [selectedUserId, setSelectedUserId] = useState(userId || null);

  return (
    <div>
      <Navbar />
      <div className="messaging-layout">
        <ChatSidebar 
          selectedUserId={selectedUserId}
          onSelectUser={(id) => setSelectedUserId(id)} 
        />
        <ChatWindow 
          selectedUserId={selectedUserId} 
        />
      </div>
    </div>
  );
}

export default MessagingPage;