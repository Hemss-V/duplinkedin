import React from 'react';

/**
 * The sidebar component for navigation and primary actions.
 * @param {function} onOpenCreatePostModal - A function passed from the parent to open the post creation modal.
 */
function LeftSidebar({ onOpenCreatePostModal }) {
  return (
    <aside className="left-sidebar">
      <nav>
        <ul>
          <li>
            {/* This button triggers the modal to open in the FeedPage */}
            <button className="sidebar-button" onClick={onOpenCreatePostModal}>
              Create Post
            </button>
          </li>
          {/* You can add more navigation links here in the future */}
        </ul>
      </nav>
    </aside>
  );
}

export default LeftSidebar;
