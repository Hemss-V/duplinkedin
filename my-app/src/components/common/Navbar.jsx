// src/components/common/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx'; // <-- 1. Import

function Navbar() {
  const { currentUser, logout } = useAuth(); // <-- 2. Get user and logout function
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login'); // Redirect to login page after logout
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">MySocialApp</Link>
      </div>
      <div className="navbar-search">
        <input type="search" placeholder="Search people, posts, hashtags..." />
      </div>
      <div className="navbar-links">
        {currentUser ? (
          // --- If user IS logged in ---
          <>
            <Link to="/profile" className="navbar-button">
              Profile
            </Link>
            <button onClick={handleLogout} className="navbar-button-logout">
              Logout
            </button>
          </>
        ) : (
          // --- If user is NOT logged in ---
          <>
            <Link to="/login" className="navbar-button">
              Login
            </Link>
            <Link to="/register" className="navbar-button">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;