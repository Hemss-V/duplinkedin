// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { loginUser as apiLogin, registerUser as apiRegister } from '../services/api';

// Create the context
const AuthContext = createContext(null);

// Create the provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true); // To check auth status on load

  // Check for existing token in localStorage when app loads
  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      if (token && user) {
        setCurrentUser(JSON.parse(user));
      }
    } catch (e) {
      console.error("Error parsing user data from localStorage", e);
      // Clear bad data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setLoading(false); // Done checking
    }
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      const response = await apiLogin({ email, password });
      const { token, user } = response.data;

      // Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Store in state
      setCurrentUser(user);
      return { success: true };
    } catch (error) {
      console.error('Login failed:', error.response?.data?.error || error.message);
      return { success: false, error: error.response?.data?.error || 'Login failed' };
    }
  };

  // Register function
  const register = async (name, email, password, isEmployer) => {
    try {
      // description: 0 = employer, 1 = employee/user
      const description = isEmployer ? 0 : 1;
      await apiRegister({ name, email, password, description });
      return { success: true };
    } catch (error) {
      console.error('Registration failed:', error.response?.data?.error || error.message);
      return { success: false, error: error.response?.data?.error || 'Registration failed' };
    }
  };

  // Logout function
  const logout = () => {
    // Clear from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Clear from state
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    login,
    register,
    logout,
    isAuthenticated: !!currentUser, // True if currentUser is not null
  };

  // Don't render app until we've checked for a token
  if (loading) {
    return <div>Loading app...</div>; // Or a proper spinner
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};