// src/components/common/LeftSidebar.jsx
import React from 'react';
import { Link } from 'react-router-dom'; // <-- Fixed: removed extra 's'
import { useAuth } from '../../context/AuthContext.jsx'; 

function LeftSidebar({ onOpenCreatePostModal }) {
  const { currentUser } = useAuth(); // <-- Fixed: removed extra 's'

  // Determine if the user is an employer (description === 0)
  // Use ?. (optional chaining) in case currentUser is loading
  const isEmployer = currentUser?.description === 0;

  return (
    <aside className="left-sidebar">
      <nav>
        <ul>
          <li>
            <button className="sidebar-button" onClick={onOpenCreatePostModal}>
              Create Post
            </button>
          </li>
          <li>
            <Link to="/messages" className="sidebar-link">
              Messages
            </Link>
          </li>
          <li>
            <Link 
              to="/connections" 
              className="sidebar-link" 
              style={{backgroundColor: 'var(--secondary-teal)', marginTop:'10px'}}
            >
              Connections
            </Link>
          </li>
          {/* --- CONDITIONAL JOB LINK --- */}
          <li>
            <Link 
              to={isEmployer ? "/post-job" : "/jobs"} 
              className="sidebar-link" 
              style={{backgroundColor: 'var(--light-blue-bg)', color: 'var(--primary-text-color)', marginTop:'10px'}}
            >
              {isEmployer ? "Post Job / Responses" : "Job Offers"}
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}

export default LeftSidebar;