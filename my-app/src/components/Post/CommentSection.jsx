// my-app/src/components/Post/CommentSection.jsx
import React, { useState, useEffect } from 'react';
import { getCommentsForPost, addComment } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

function CommentSection({ postId }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { currentUser } = useAuth();

  const fetchComments = () => {
    setLoading(true);
    getCommentsForPost(postId)
      .then(response => { setComments(response.data); setError(null); })
      .catch(err => { setError("Could not load comments."); })
      .finally(() => { setLoading(false); });
  };
  useEffect(() => { fetchComments(); }, [postId]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!newComment.trim() || !currentUser) return;

    setIsSubmitting(true);
    
    // UPDATED: We only send the content.
    const commentData = {
      comment_content: newComment,
    };

    addComment(postId, commentData)
      .then(() => {
        setNewComment('');
        fetchComments();
      })
      .catch(err => {
        setError("Failed to post comment.");
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <div className="comment-section">
      <form className="add-comment-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          disabled={isSubmitting}
        />
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? '...' : 'Post'}
        </button>
      </form>
      
      <div className="comment-list">
        {loading && <div>Loading comments...</div>}
        {error && <div className="error-message">{error}</div>}
        {!loading && comments.length === 0 && (
          <div className="no-comments">Be the first to comment.</div>
        )}
        {!loading && comments.map((comment, index) => (
          <div key={index} className="comment">
            <span className="comment-author">{comment.name}</span>
            <p className="comment-content">{comment.comment_content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CommentSection;