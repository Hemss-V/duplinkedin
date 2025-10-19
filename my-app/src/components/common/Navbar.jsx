// src/components/common/Navbar.jsx
import React from 'react';
import { Link } from 'react-router-dom'; // Use Link for navigation
import '../../assets/Navbar.css'; // We will create this CSS file

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">MySocialApp</Link>
      </div>
      <div className="navbar-search">
        <input type="search" placeholder="Search people, posts, hashtags..." />
      </div>
      <div className="navbar-links">
        <Link to="/profile" className="navbar-button">
          Profile
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;