// src/services/api.js
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

// --- UPDATED ---
// Now takes a 'sortOrder' argument ('latest' or 'oldest')
export const getPosts = (sortOrder = 'latest') => {
  return axios.get(`${API_URL}/posts?sort=${sortOrder}`);
};

// --- NEW ---
// Gets all hashtags for a single post
export const getHashtagsForPost = (postId) => {
  return axios.get(`${API_URL}/posts/${postId}/hashtags`);
};

// Function to get all users
export const getUsers = () => {
  return axios.get(`${API_URL}/users`);
};