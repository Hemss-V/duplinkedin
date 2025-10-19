// src/pages/FeedPage.jsx
import React, { useState, useEffect } from 'react';
// --- CORRECTED IMPORT PATHS ---
import { getPosts } from '../services/api.js';
import Navbar from '../components/common/Navbar.jsx';
import Post from '../components/Post/Post.jsx';
import CreatePostForm from '../components/Post/CreatePostForm.jsx';
import Modal from '../components/common/Modal.jsx';
import LeftSidebar from '../components/common/LeftSidebar.jsx';
// ---------------------------------

function FeedPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOrder, setSortOrder] = useState('latest');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchPosts = () => {
    setLoading(true);
    setError(null);
    getPosts(sortOrder)
      .then(response => {
        setPosts(response.data);
      })
      .catch(err => {
        console.error("Error fetching posts:", err);
        setError("Failed to load posts. Is the server running?");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPosts();
  }, [sortOrder]);

  return (
    <div>
      <Navbar />
      
      <div className="page-layout">
        <LeftSidebar onOpenCreatePostModal={() => setIsModalOpen(true)} />
        
        <main className="feed-container">
          {/* The Modal for creating a post, controlled by isModalOpen state */}
          <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
            <CreatePostForm 
              onPostCreated={() => {
                fetchPosts(); // Refresh the post feed
                setIsModalOpen(false); // Close the modal on success
              }}
            />
          </Modal>

          <h1>Post Feed</h1>

          <div className="filter-bar">
            <label htmlFor="sort-select">Sort by: </label>
            <select 
              id="sort-select"
              value={sortOrder}
              onChange={e => setSortOrder(e.target.value)}
            >
              <option value="latest">Latest</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>
          
          <div className="post-list">
            {loading && <div>Loading posts...</div>}
            {error && <div style={{ color: 'red' }}>{error}</div>}
            
            {!loading && !error && posts.map(post => (
              <Post key={post.post_id} post={post} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

export default FeedPage;