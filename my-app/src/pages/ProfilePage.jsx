// src/pages/ProfilePage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { 
  getUserProfile, 
  getConnectionCount, 
  sendConnectionRequest, 
  acceptConnectionRequest 
} from '../services/api.js';

// Import common components
import Navbar from '../components/common/Navbar.jsx';
import LeftSidebar from '../components/common/LeftSidebar.jsx';
import Modal from '../components/common/Modal.jsx';
import CreatePostForm from '../components/Post/CreatePostForm.jsx';

function ProfilePage() {
  const { userId } = useParams(); // Get the user ID from the URL (e.g., /profile/1)
  const { currentUser } = useAuth(); // Get the *logged-in* user
  const navigate = useNavigate(); // To navigate to messaging

  const [user, setUser] = useState(null);
  const [connectionCount, setConnectionCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // For Create Post

  const isOwnProfile = currentUser?.userId === parseInt(userId);

  // Function to fetch all profile data
  const fetchProfileData = useCallback(() => {
    setLoading(true);
    setError(null);

    // Fetch profile and connection count at the same time
    Promise.all([
      getUserProfile(userId),
      getConnectionCount(userId)
    ])
    .then(([profileResponse, countResponse]) => {
      setUser(profileResponse.data);
      setConnectionCount(countResponse.data.count);
    })
    .catch(err => {
      console.error("Error fetching profile data:", err);
      setError("Could not load user profile.");
    })
    .finally(() => {
      setLoading(false);
    });
  }, [userId]); // Re-run this function if the userId in the URL changes

  // Fetch data when component mounts or userId changes
  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  // Handler for the "Create Post" modal
  const handlePostCreated = () => {
    setIsModalOpen(false);
    // No feed refresh needed here, just close modal
  };

  // Handler for the "Message" button
  const handleMessageClick = () => {
    navigate(`/messages/${userId}`); // Navigate to chat page with this user
  };

  // --- Connection Button Logic ---
  const handleConnectionAction = async () => {
    try {
      if (user.connectionStatus === 'not_connected') {
        // Send connection request
        await sendConnectionRequest(userId);
        fetchProfileData(); // Refresh profile to show "Pending"
      } else if (user.connectionStatus === 'pending_received') {
        // Accept connection request
        await acceptConnectionRequest(userId);
        fetchProfileData(); // Refresh profile to show "Connected"
      }
      // Other statuses (pending_sent, connected) might have "Withdraw" or "Remove" actions later
    } catch (err) {
      console.error("Error handling connection action:", err);
      setError("Connection action failed.");
    }
  };

  // Helper to render the correct connection button
  const renderConnectionButton = () => {
    if (isOwnProfile) return null; // Don't show button on your own profile

    switch (user.connectionStatus) {
      case 'not_connected':
        return <button className="connect-button not_connected" onClick={handleConnectionAction}>Connect</button>;
      case 'pending_sent':
        return <button className="connect-button pending_sent" disabled>Request Sent</button>;
      case 'pending_received':
        return <button className="connect-button pending_received" onClick={handleConnectionAction}>Accept</button>;
      case 'connected':
        return <button className="connect-button connected" disabled>Connected</button>;
      default:
        return null; // Or a loading/error state
    }
  };
  // ------------------------------

  if (loading) {
    return <div><Navbar /><div style={{ padding: '20px' }}>Loading profile...</div></div>;
  }
  if (error) {
    return <div><Navbar /><div style={{ padding: '20px', color: 'red' }}>{error}</div></div>;
  }
  if (!user) {
    return <div><Navbar /><div style={{ padding: '20px' }}>User not found.</div></div>;
  }

  return (
    <div>
      <Navbar />
      
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <CreatePostForm onPostCreated={handlePostCreated} />
      </Modal>

      <div className="page-layout">
        <LeftSidebar onOpenCreatePostModal={() => setIsModalOpen(true)} />
        
        <main className="profile-container">
          <div className="profile-card">
            <h1>{user.name}</h1>
            <p className="profile-headline">{user.headline}</p>
            <p className="profile-connections">Connections: {connectionCount}</p>
            
            <div className="profile-actions">
              {renderConnectionButton()}
              {!isOwnProfile && user.connectionStatus === 'connected' && (
                <button className="message-button" onClick={handleMessageClick}>Message</button>
              )}
            </div>
            
            {/* Conditional "Add New Job" Button */}
            {isOwnProfile && user.description === 0 && (
              <button className="add-job-button" onClick={() => navigate('/post-job')}>
                + Add New Job / View Responses
              </button>
            )}

            <div className="profile-summary">
              <h2>Summary</h2>
              <p>{user.summary || "No summary provided."}</p>
            </div>
          </div>
        </main>

        <aside className="right-sidebar">
          {/* Placeholder for future content */}
        </aside>
      </div>
    </div>
  );
}

export default ProfilePage;