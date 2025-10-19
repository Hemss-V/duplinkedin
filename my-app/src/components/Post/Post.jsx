// src/components/Post/Post.jsx
import React, { useState, useEffect } from 'react';
import { getHashtagsForPost } from '../../services/api';
import CommentSection from './CommentSection.jsx'; // <-- 1. Import new component

function Post({ post }) {
  const [hashtags, setHashtags] = useState([]);
  const [showComments, setShowComments] = useState(false); // <-- 2. Add state

  useEffect(() => {
    getHashtagsForPost(post.post_id)
      .then(response => {
        setHashtags(response.data);
      })
      .catch(err => {
        console.error("Error fetching hashtags:", err);
      });
  }, [post.post_id]);

  return (
    <div className="post-container">
      {/* --- Post Header --- */}
      <div className="post-header">
        <span className="post-author">{post.name}</span>
        <span className="post-time">
          {new Date(post.content_sent_at).toLocaleString()}
        </span>
      </div>
      
      {/* --- Post Content --- */}
      <div className="post-content">
        <p>{post.content}</p>
      </div>
      
      {/* --- Post Footer --- */}
      <div className="post-footer">
        <div className="post-hashtags">
          {hashtags.map((tag, index) => (
            <span key={index} className="post-hashtag">
              #{tag.hashtag}
            </span>
          ))}
        </div>
        
        {/* --- 3. Update onClick --- */}
        <button 
          className="comment-button"
          onClick={() => setShowComments(!showComments)}
        >
          Comment
        </button>
      </div>
      
      {/* --- 4. Conditionally render the CommentSection --- */}
      {showComments && <CommentSection postId={post.post_id} />}
    </div>
  );
}

export default Post;