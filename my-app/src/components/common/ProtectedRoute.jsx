// src/components/common/ProtectedRoute.jsx
import React from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { Navigate, Outlet } from 'react-router-dom';

function ProtectedRoute() {
  const { currentUser } = useAuth();

  if (!currentUser) {
    // If not logged in, redirect to the /login page
    return <Navigate to="/login" replace />;
  }

  // If logged in, show the child component (e.g., FeedPage or ProfilePage)
  return <Outlet />;
}

export default ProtectedRoute;