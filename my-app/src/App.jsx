import React from 'react';
import { Routes, Route } from 'react-router-dom';
import FeedPage from './pages/FeedPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import ProtectedRoute from './components/common/ProtectedRoute.jsx';
import MessagingPage from './pages/MessagingPage.jsx';
import './App.css'; // Make sure this line exists if you use App.css

function App() {
  return (
    <div className="App">
      <Routes>
        {/* --- Public Routes --- */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* --- Protected Routes --- */}
        {/* Routes inside here require the user to be logged in */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<FeedPage />} />
          
          {/* --- THIS IS THE CRITICAL ROUTE --- */}
          {/* It defines the pattern for user profiles */}
          <Route path="/profile/:userId" element={<ProfilePage />} /> 
          
          <Route path="/messages" element={<MessagingPage />} />
          <Route path="/messages/:userId" element={<MessagingPage />} />
        </Route>
        
        {/* Optional: Add a catch-all route for unmatched paths */}
        <Route path="*" element={<div>Page Not Found</div>} /> 
      </Routes>
    </div>
  );
}

export default App;

