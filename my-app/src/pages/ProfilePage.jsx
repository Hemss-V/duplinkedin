// src/pages/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { getUserProfile, getConnectionCount } from '../services/api.js';
import Navbar from '../components/common/Navbar.jsx';
import LeftSidebar from '../components/common/LeftSidebar.jsx';
import Modal from '../components/common/Modal.jsx';
import CreatePostForm from '../components/Post/CreatePostForm.jsx';
import { useAuth } from '../context/AuthContext.jsx'; // <-- 1. Import

function ProfilePage() {
  const [user, setUser] = useState(null);
  const [connectionCount, setConnectionCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { currentUser } = useAuth(); // <-- 2. Get the logged-in user

  useEffect(() => {
    if (!currentUser) return; // Don't fetch if no user is logged in

    const userIdToFetch = currentUser.user_id; // <-- 3. Use the real user ID
    setLoading(true);

    Promise.all([
      getUserProfile(userIdToFetch),
      getConnectionCount(userIdToFetch)
    ])
    .then(([profileResponse, countResponse]) => {
      setUser(profileResponse.data);
      setConnectionCount(countResponse.data.count);
    })
    .catch(err => {
      setError("Could not load user profile.");
    })
    .finally(() => {
      setLoading(false);
    });
  }, [currentUser]); // <-- 4. Re-run if the user changes

  const handlePostCreated = () => {
    setIsModalOpen(false);
    alert("Your post has been created!");
  };

  if (!currentUser) {
    return <div>Please log in to see your profile.</div>
  }

  // ... (loading, error, and return statements are the same)
  if (loading) return <div>Loading profile...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!user) return <div>User not found.</div>;

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
            {user.description === 0 && (
              <button className="add-job-button">+ Add New Job</button>
            )}
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