// my-app/src/components/common/LeftSidebar.jsx
import React from 'react';
import { Link } from 'react-router-dom'; // <-- Import Link

function LeftSidebar({ onOpenCreatePostModal }) {
  return (
    <aside className="left-sidebar">
      <nav>
        <ul>
          <li>
            <button className="sidebar-button" onClick={onOpenCreatePostModal}>
              Create Post
            </button>
          </li>
          {/* --- NEW LINK --- */}
          <li>
            <Link to="/messages" className="sidebar-link">
              Messages
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}

export default LeftSidebar;