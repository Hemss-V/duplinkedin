// src/components/Post/CreatePostForm.jsx
import React, { useState } from 'react';
import { createPost } from '../../services/api';
import { useAuth } from '../../context/AuthContext'; // <-- 1. Import

function CreatePostForm({ onPostCreated }) {
  const [content, setContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState('');
  const { currentUser } = useAuth(); // <-- 2. Get the logged-in user

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!content.trim()) {
      setError('Post cannot be empty.');
      return;
    }
    if (!currentUser) { // Safety check
      setError('You must be logged in to post.');
      return;
    }

    setIsPosting(true);
    setError('');

    const postData = {
      content: content,
      user_id: currentUser.user_id // <-- 3. Use the real user ID
    };

    createPost(postData)
      .then(response => {
        setContent('');
        onPostCreated();
      })
      .catch(err => {
        setError('Failed to create post.');
      })
      .finally(() => {
        setIsPosting(false);
      });
  };
  
  // ... (return statement is the same)
  return (
    <div className="create-post-container">
      <h2>Create a New Post</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          rows="5"
          disabled={isPosting}
        />
        <div className="form-footer">
          {error && <p className="error-message">{error}</p>}
          <button type="submit" disabled={isPosting}>
            {isPosting ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreatePostForm;