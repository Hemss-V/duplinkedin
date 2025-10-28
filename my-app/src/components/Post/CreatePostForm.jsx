// my-app/src/components/Post/CreatePostForm.jsx
import React, { useState } from 'react';
import { createPost } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

function CreatePostForm({ onPostCreated }) {
  const [content, setContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!content.trim()) return setError('Post cannot be empty.');
    if (!currentUser) return setError('You must be logged in to post.');

    setIsPosting(true);
    setError('');

    // UPDATED: We only send the content.
    const postData = {
      content: content,
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