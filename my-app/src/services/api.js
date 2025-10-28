// my-app/src/services/api.js
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

// --- Post Endpoints ---
export const getPosts = (sortOrder = 'latest') => axios.get(`${API_URL}/posts?sort=${sortOrder}`);
export const createPost = (postData) => axios.post(`${API_URL}/posts`, postData);
export const getHashtagsForPost = (postId) => axios.get(`${API_URL}/posts/${postId}/hashtags`);

// --- Comment Endpoints ---
export const getCommentsForPost = (postId) => axios.get(`${API_URL}/posts/${postId}/comments`);
export const addComment = (postId, commentData) => axios.post(`${API_URL}/posts/${postId}/comments`, commentData);

// --- User & Profile Endpoints ---
export const getUserProfile = (userId) => axios.get(`${API_URL}/users/${userId}`);
export const getConnectionCount = (userId) => axios.get(`${API_URL}/users/${userId}/connections/count`);

// --- Messaging Endpoints ---
export const getConversations = () => axios.get(`${API_URL}/conversations`);
export const getConnections = () => axios.get(`${API_URL}/connections`);
export const getMessages = (otherUserId) => axios.get(`${API_URL}/messages/${otherUserId}`);
export const sendMessage = (messageData) => axios.post(`${API_URL}/messages`, messageData);

// --- NEW Connection Management Endpoints ---
export const getConnectionStatus = (otherUserId) => {
  return axios.get(`${API_URL}/connections/status/${otherUserId}`);
};
export const sendConnectionRequest = (otherUserId) => {
  return axios.post(`${API_URL}/connections/request/${otherUserId}`);
};
export const acceptConnectionRequest = (otherUserId) => {
  return axios.put(`${API_URL}/connections/accept/${otherUserId}`);
};
export const removeConnection = (otherUserId) => {
  // Includes rejecting pending or removing existing
  return axios.delete(`${API_URL}/connections/remove/${otherUserId}`);
};