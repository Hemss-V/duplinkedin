import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate, Link } from 'react-router-dom';

function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    headline: '',
    summary: '',
    age: '',
    description: '1' // Default to 1 (Job Seeker)
  });
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register(formData);
      navigate('/login'); // Redirect to login page on success
      alert('Registration successful! Please log in.');
    } catch (err) {
      setError('Failed to register. Email may already be in use.');
      console.error(err);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Sign Up</h2>
        
        <input type="text" name="name" placeholder="Full Name" onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
        <input type="text" name="headline" placeholder="Headline (e.g., 'Software Engineer')" onChange={handleChange} />
        <textarea name="summary" placeholder="Your professional summary" onChange={handleChange}></textarea>
        <input type="number" name="age" placeholder="Age" onChange={handleChange} />
        
        <label>Are you an employer?</label>
        <select name="description" value={formData.description} onChange={handleChange}>
          <option value="1">No (I am looking for a job)</option>
          <option value="0">Yes (I am hiring)</option>
        </select>
        
        {error && <p className="error-message">{error}</p>}
        <button type="submit">Sign Up</button>
        <p className="auth-switch">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}

// --- THIS LINE WAS MISSING ---
export default RegisterPage;
