// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);
const API_URL = 'http://localhost:3001/api';

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);

  // Check if user is already logged in (from a previous session)
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      setCurrentUser(JSON.parse(user));
      // Set the token for all future axios requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  const login = async (email, password) => {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    const { token, user } = response.data;
    
    // Store in localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));

    // Store in state
    setCurrentUser(user);
    
    // Set token for all future requests
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  const register = async (userData) => {
    await axios.post(`${API_URL}/register`, userData);
  };

  const logout = () => {
    // Clear from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Clear from state
    setCurrentUser(null);
    
    // Remove token from axios headers
    delete axios.defaults.headers.common['Authorization'];
  };

  // The "value" is what all child components can access
  const value = {
    currentUser,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// This is a custom hook to easily access the context
export const useAuth = () => {
  return useContext(AuthContext);
};