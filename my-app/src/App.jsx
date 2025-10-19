// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import FeedPage from './pages/FeedPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import LoginPage from './pages/LoginPage.jsx'; // <-- Import
import RegisterPage from './pages/RegisterPage.jsx'; // <-- Import
import ProtectedRoute from './components/common/ProtectedRoute.jsx'; // <-- Import
import './App.css';

function App() {
  return (
    <div className="App">
      <Routes>
        {/* --- Public Routes --- */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* --- Protected Routes --- */}
        {/* These routes can only be visited if the user is logged in */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<FeedPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          {/* We'll change /profile to /profile/:userId later */}
        </Route>
      </Routes>
    </div>
  );
}

export default App;