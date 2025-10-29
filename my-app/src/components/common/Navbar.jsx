// src/components/common/Navbar.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx'; 

// Placeholder Icon (Replace with a real icon library later)
const NotificationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
  </svg>
);

function Navbar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login'); // Redirect to login after logout
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    // TODO: Fetch notifications from API when opening
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">DuplinkedIn</Link>
      </div>
      <div className="navbar-search">
        <input type="search" placeholder="Search (coming soon)..." disabled/>
      </div>
      <div className="navbar-links">
        {currentUser ? (
          // --- User is LOGGED IN ---
          <>
            <button 
              className="navbar-icon-button" 
              onClick={toggleNotifications}
              title="Notifications"
            >
              <NotificationIcon />
              {showNotifications && (
                <div className="notification-dropdown">
                  <p>Notifications coming soon!</p>
                </div>
              )}
            </button>

            <Link 
              to={`/profile/${currentUser.userId}`}
              className="navbar-button"
            >
              Profile
            </Link>
            <button onClick={handleLogout} className="navbar-button-logout">
              Logout
            </button>
          </>
        ) : (
          // --- User is LOGGED OUT ---
          <>
            <Link to="/login" className="navbar-button">Login</Link>
            <Link to="/register" className="navbar-button" style={{backgroundColor: 'var(--secondary-teal)'}}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;