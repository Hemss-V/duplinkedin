// src/services/api.js
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

export const getPosts = (sortOrder = 'latest') => {
  return axios.get(`${API_URL}/posts?sort=${sortOrder}`);
};

// --- NEW ---
// Sends post data to the server
export const createPost = (postData) => {
  // postData should be an object like { content: "...", user_id: 1 }
  return axios.post(`${API_URL}/posts`, postData);
};



// src/services/api.js
// ... (keep existing getPosts, createPost, getHashtagsForPost)

export const getHashtagsForPost = (postId) => {
  return axios.get(`${API_URL}/posts/${postId}/hashtags`);
};

// --- NEW: Get all comments for a post ---
export const getCommentsForPost = (postId) => {
  return axios.get(`${API_URL}/posts/${postId}/comments`);
};

// --- NEW: Add a new comment ---
export const addComment = (postId, commentData) => {
  // commentData = { comment_content: "...", commenter_id: 1 }
  return axios.post(`${API_URL}/posts/${postId}/comments`, commentData);
};
// src/services/api.js
// ... (keep existing functions)

export const getUserProfile = (userId) => {
  return axios.get(`${API_URL}/users/${userId}`);
};

// --- NEW: Get the connection count for a user ---
export const getConnectionCount = (userId) => {
  return axios.get(`${API_URL}/users/${userId}/connections/count`);
};

export const getUsers = () => {
  return axios.get(`${API_URL}/users`);
};