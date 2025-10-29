// src/pages/ConnectionsPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getConnections, getAllUsersWithStatus, sendConnectionRequest, acceptConnectionRequest } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

// Import common components
import Navbar from '../components/common/Navbar.jsx';
import LeftSidebar from '../components/common/LeftSidebar.jsx';
import Modal from '../components/common/Modal.jsx';
import CreatePostForm from '../components/Post/CreatePostForm.jsx';

function ConnectionsPage() {
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { currentUser } = useAuth();

  // Function to fetch all users and their status
  const fetchAllUsers = () => {
    setLoading(true);
    getAllUsersWithStatus()
      .then(response => {
        setAllUsers(response.data);
      })
      .catch(err => {
        console.error("Error fetching all users:", err);
        setError("Could not load users.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const handlePostCreated = () => {
    setIsModalOpen(false);
  };

  // Handle connection actions
  const handleConnectionAction = async (targetUserId, status) => {
    try {
      if (status === 'not_connected') {
        await sendConnectionRequest(targetUserId);
      } else if (status === 'pending_received') {
        await acceptConnectionRequest(targetUserId);
      }
      // Refresh the list after action
      fetchAllUsers(); 
    } catch (err) {
      console.error("Error in connection action:", err);
    }
  };

  // Helper to render the correct button for each user
  const renderConnectionButton = (user) => {
    switch (user.status) {
      case 'not_connected':
        return <button className="connect-button not_connected" onClick={() => handleConnectionAction(user.user_id, 'not_connected')}>Connect</button>;
      case 'pending_sent':
        return <button className="connect-button pending_sent" disabled>Request Sent</button>;
      case 'pending_received':
        return <button className="connect-button pending_received" onClick={() => handleConnectionAction(user.user_id, 'pending_received')}>Accept</button>;
      case 'connected':
        return <button className="connect-button connected" disabled>Connected</button>;
      default:
        return null;
    }
  };

  return (
    <div>
      <Navbar />
      
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <CreatePostForm onPostCreated={handlePostCreated} />
      </Modal>

      <div className="page-layout">
        <LeftSidebar onOpenCreatePostModal={() => setIsModalOpen(true)} />
        
        <main className="connections-container">
          <h1>People You May Know</h1>

          {loading && <div>Loading users...</div>}
          {error && <div style={{ color: 'red' }}>{error}</div>}

          {!loading && !error && (
            <div className="connection-list">
              {allUsers.length === 0 ? (
                <p>No other users found.</p>
              ) : (
                allUsers.map(user => (
                  <div key={user.user_id} className="connection-card">
                    <Link to={`/profile/${user.user_id}`} className="connection-name">{user.name}</Link>
                    <p className="connection-headline">{user.headline || "No headline"}</p>
                    <div style={{ marginTop: '10px' }}>
                      {renderConnectionButton(user)}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </main>

        <aside className="right-sidebar">
          {/* Placeholder */}
        </aside>
      </div>
    </div>
  );
}

export default ConnectionsPage;