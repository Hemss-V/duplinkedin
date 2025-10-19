// src/pages/FeedPage.jsx
import React, { useState, useEffect } from 'react';
import { getPosts } from '../services/api';
import Navbar from '../components/common/Navbar.jsx'; // <-- Import Navbar
import Post from '../components/Post/Post.jsx'; // <-- Import Post
import '../assets/Navbar.css'; // <-- Import CSS
import '../assets/Post.css'; // <-- Import CSS

function FeedPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOrder, setSortOrder] = useState('latest'); // <-- State for sorting

  // This effect now re-runs whenever 'sortOrder' changes
  useEffect(() => {
    setLoading(true);
    getPosts(sortOrder) // <-- Pass the sortOrder to the API
      .then(response => {
        setPosts(response.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching posts:", err);
        setError("Failed to load posts.");
        setLoading(false);
      });
  }, [sortOrder]); // <-- Dependency array

  return (
    <div>
      <Navbar /> {/* <-- Add the Navbar at the top */}
      
      <main className="feed-container">
        <h1>Post Feed</h1>

        {/* --- Filter Bar --- */}
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
        
        {/* --- Post List --- */}
        <div className="post-list">
          {loading && <div>Loading posts...</div>}
          {error && <div>{error}</div>}
          
          {!loading && !error && posts.map(post => (
            // Pass each post object as a prop to the Post component
            <Post key={post.post_id} post={post} />
          ))}
        </div>
      </main>
    </div>
  );
}

export default FeedPage;