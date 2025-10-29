// src/components/Post/CreatePostForm.jsx
import React, { useState } from 'react';
import { createPost } from '../../services/api';

function CreatePostForm({ onPostCreated }) {
  const [content, setContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!content.trim()) {
      setError('Post cannot be empty.');
      return;
    }

    setIsPosting(true);
    setError('');

    // The user_id is now handled by the token on the server!
    // We only need to send the content.
    const postData = {
      content: content,
      // No user_id needed!
    };

    createPost(postData)
      .then(response => {
        console.log('Post created!', response.data);
        setContent(''); // Clear the textarea
        onPostCreated(); // Tell the parent component to refresh/close
      })
      .catch(err => {
        console.error('Error creating post:', err);
        setError('Failed to create post. Please try again.');
      })
      .finally(() => {
        setIsPosting(false); // Re-enable the button
      });
  };

  return (
    <div className="create-post-container">
      <h2>Create a new post</h2>
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