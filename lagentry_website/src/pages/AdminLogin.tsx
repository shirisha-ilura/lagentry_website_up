import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css';

const AdminLogin: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Admin credentials - in production, these should be in environment variables
  // For now, using simple hardcoded credentials (can be changed)
  const ADMIN_USERNAME = process.env.REACT_APP_ADMIN_USERNAME || 'admin';
  const ADMIN_PASSWORD = process.env.REACT_APP_ADMIN_PASSWORD || 'lagentry2024';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Simple authentication check
      if (username.trim() === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        // Store authentication token in localStorage
        const authToken = btoa(`${username}:${Date.now()}`); // Simple token generation
        localStorage.setItem('adminAuthToken', authToken);
        localStorage.setItem('adminUsername', username);
        localStorage.setItem('adminLoginTime', Date.now().toString());
        
        // Redirect to admin chats
        navigate('/admin/chats');
      } else {
        setError('Invalid username or password');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <h1>Admin Login</h1>
          <p>Lagentry Chat Admin Panel</p>
        </div>
        
        <form onSubmit={handleSubmit} className="admin-login-form">
          {error && <div className="admin-login-error">{error}</div>}
          
          <div className="admin-login-field">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required
              autoFocus
            />
          </div>
          
          <div className="admin-login-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="admin-login-button"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;

