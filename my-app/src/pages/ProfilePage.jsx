import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  getUserProfile, 
  getConnectionCount, 
  getConnectionStatus,
  sendConnectionRequest, 
  acceptConnectionRequest, 
  removeConnection 
} from '../services/api.js';
import Navbar from '../components/common/Navbar.jsx';
import LeftSidebar from '../components/common/LeftSidebar.jsx';
import Modal from '../components/common/Modal.jsx';
import CreatePostForm from '../components/Post/CreatePostForm.jsx';
import { useAuth } from '../context/AuthContext.jsx';

function ProfilePage() {
  const { userId } = useParams(); 
  const { currentUser } = useAuth();
  const navigate = useNavigate(); 

  const [user, setUser] = useState(null);
  const [connectionCount, setConnectionCount] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdatingConnection, setIsUpdatingConnection] = useState(false);

  useEffect(() => {
    const userIdToFetch = parseInt(userId);
    if (!userIdToFetch || !currentUser) {
        setLoading(false); 
        return; 
    }

    setLoading(true);
    setError(null); 

    Promise.all([
      getUserProfile(userIdToFetch),
      getConnectionCount(userIdToFetch),
      currentUser.user_id !== userIdToFetch ? getConnectionStatus(userIdToFetch) : Promise.resolve({ data: { status: 'same_user' } }) 
    ])
    .then(([profileResponse, countResponse, statusResponse]) => {
      setUser(profileResponse.data);
      setConnectionCount(countResponse.data.count);
      setConnectionStatus(statusResponse.data.status); 
      // console.log("Connection Status Received:", statusResponse.data.status); // Keep for debugging if needed
    })
    .catch(err => {
      console.error(`Error fetching profile data for user ${userIdToFetch}:`, err);
      setError("Could not load user profile.");
    })
    .finally(() => {
      setLoading(false);
    });
  }, [userId, currentUser]); 

  const handlePostCreated = () => {
    setIsModalOpen(false);
    alert("Your post has been created!"); 
  };
  
  const handleMessageClick = () => {
    navigate(`/messages/${userId}`);
  };

  const handleConnectionAction = async () => {
    if (!connectionStatus || connectionStatus === 'same_user' || !userId) return;
    
    setIsUpdatingConnection(true);
    setError(null); 
    
    try {
      let response;
      const otherUserId = parseInt(userId); 
      switch(connectionStatus) {
        case 'not_connected':
          response = await sendConnectionRequest(otherUserId);
          break;
        case 'pending_sent':
          response = await removeConnection(otherUserId); 
          break;
        case 'pending_received':
          response = await acceptConnectionRequest(otherUserId);
          break;
        case 'connected':
          response = await removeConnection(otherUserId);
          break;
        default:
          throw new Error("Invalid connection status");
      }
      setConnectionStatus(response.data.status); 
      if (response.data.status === 'connected' || response.data.status === 'not_connected') {
        getConnectionCount(otherUserId).then(res => setConnectionCount(res.data.count));
      }
    } catch (err) {
        console.error("Error updating connection:", err);
        const serverError = err.response?.data?.error || "Could not update connection. Please try again.";
        setError(serverError);
    } finally {
        setIsUpdatingConnection(false);
    }
  };

  const getConnectionButtonText = () => {
    switch (connectionStatus) {
      case 'not_connected': return 'Connect';
      case 'pending_sent': return 'Request Sent';
      case 'pending_received': return 'Accept Request';
      case 'connected': return 'Connected';
      default: return ''; 
    }
  };

  if (loading) return <div>Loading profile...</div>;
  if (!currentUser) return <div>Please log in to view profiles.</div>; 
  if (error && !user) return <div style={{ color: 'red' }}>{error}</div>; 
  if (!user) return <div>User not found.</div>;

  const isOwnProfile = connectionStatus === 'same_user';

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
              {!isOwnProfile && connectionStatus && ( 
                <>
                  {/* Connection Button (Connect/Pending/Accept/Connected) */}
                  <button 
                    className={`connect-button ${connectionStatus}`} 
                    onClick={handleConnectionAction}
                    disabled={isUpdatingConnection} 
                  >
                    {isUpdatingConnection ? '...' : getConnectionButtonText()}
                  </button>

                  {/* --- THIS IS THE CHANGE --- */}
                  {/* Message Button - Now always shows if it's not your own profile */}
                  <button className="message-button" onClick={handleMessageClick}>
                    Message
                  </button>
                  {/* ------------------------ */}

                </>
              )}
               {isOwnProfile && user.description === 0 && ( 
                <button className="add-job-button">+ Add New Job</button>
              )}
            </div>

            {/* Display connection error if any */}
            {error && <p className="error-message" style={{marginBottom: '15px'}}>{error}</p>}

            <div className="profile-summary">
              <h2>Summary</h2>
              <p>{user.summary}</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default ProfilePage;

