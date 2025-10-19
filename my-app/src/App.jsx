// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import FeedPage from './pages/FeedPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx'; // <-- We will create this
import './App.css';

function App() {
  return (
    <div className="App">
      {/* Routes define which page component to show based on the URL */}
      <Routes>
        <Route path="/" element={<FeedPage />} /> {/* <-- The main page */}
        <Route path="/profile" element={<ProfilePage />} /> {/* <-- The profile page */}
      </Routes>
    </div>
  );
}

export default App;