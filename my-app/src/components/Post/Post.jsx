// src/components/Post/Post.jsx
import React, { useState, useEffect } from 'react';
import { getHashtagsForPost } from '../../services/api';
import '../../assets/Post.css'; // We will create this

function Post({ post }) {
  // 'post' prop comes from FeedPage (it has name, content, etc.)
  const [hashtags, setHashtags] = useState([]);

  // When the component loads, fetch its own hashtags
  useEffect(() => {
    getHashtagsForPost(post.post_id)
      .then(response => {
        setHashtags(response.data);
      })
      .catch(err => {
        console.error("Error fetching hashtags:", err);
      });
  }, [post.post_id]); // Re-run if the post ID changes

  return (
    <div className="post-container">
      <div className="post-header">
        <span className="post-author">{post.name}</span> {/* From the JOIN */}
        <span className="post-time">
          {new Date(post.content_sent_at).toLocaleString()}
        </span>
      </div>
      <div className="post-content">
        <p>{post.content}</p>
      </div>
      <div className="post-footer">
        <div className="post-hashtags">
          {hashtags.map((tag, index) => (
            <span key={index} className="post-hashtag">
              #{tag.hashtag}
            </span>
          ))}
        </div>
        <button className="comment-button">
          Comment
        </button>
      </div>
    </div>
  );
}

export default Post;