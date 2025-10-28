// my-app/src/components/common/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

function Navbar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
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
          <>
            {/* --- UPDATED LINK --- */}
            <Link 
              to={`/profile/${currentUser.user_id}`} 
              className="navbar-button"
            >
              Profile
            </Link>
            <button onClick={handleLogout} className="navbar-button-logout">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="navbar-button">Login</Link>
            <Link to="/register" className="navbar-button">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;