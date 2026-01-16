import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './AdminBookings.css';

const AdminBookings: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [allBookings, setAllBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchAllBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const bookings: any[] = [];
      querySnapshot.forEach((doc) => {
        bookings.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      setAllBookings(bookings);
    } catch (err: any) {
      setError('Failed to fetch bookings: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const adminPassword = process.env.REACT_APP_ADMIN_PASSWORD || 'admin123';
    
    if (password === adminPassword) {
      setIsAuthenticated(true);
      sessionStorage.setItem('adminAuthenticated', 'true');
      fetchAllBookings();
    } else {
      setError('Invalid password. Access denied.');
      setPassword('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('adminAuthenticated');
    setAllBookings([]);
    setPassword('');
  };

  // Check if already authenticated (from sessionStorage)
  useEffect(() => {
    const authStatus = sessionStorage.getItem('adminAuthenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
      fetchAllBookings();
    }
  }, [fetchAllBookings]);

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    try {
      if (date.toDate) {
        return date.toDate().toLocaleString();
      } else if (date instanceof Date) {
        return date.toLocaleString();
      } else if (typeof date === 'string') {
        return new Date(date).toLocaleString();
      }
      return 'N/A';
    } catch {
      return 'N/A';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-login-container">
        <div className="admin-login-box">
          <h1>Admin Access</h1>
          <p>Enter password to view bookings</p>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="admin-password-input"
              autoFocus
            />
            {error && <div className="admin-error">{error}</div>}
            <button type="submit" className="admin-login-btn">
              Login
            </button>
          </form>
          <button onClick={() => navigate('/')} className="admin-back-btn">
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-bookings-container">
      <div className="admin-header">
        <h1>Admin - All Bookings</h1>
        <div className="admin-header-actions">
          <button onClick={fetchAllBookings} className="admin-refresh-btn" disabled={loading}>
            {loading ? 'Loading...' : '🔄 Refresh'}
          </button>
          <button onClick={handleLogout} className="admin-logout-btn">
            Logout
          </button>
        </div>
      </div>

      {error && <div className="admin-error-banner">{error}</div>}

      <div className="admin-bookings-stats">
        <div className="stat-card">
          <h3>Total Bookings</h3>
          <p>{allBookings.length}</p>
        </div>
        <div className="stat-card">
          <h3>Today</h3>
          <p>
            {allBookings.filter((booking) => {
              const today = new Date();
              const bookingDate = booking.createdAt?.toDate?.() || new Date(booking.createdAt);
              return bookingDate.toDateString() === today.toDateString();
            }).length}
          </p>
        </div>
      </div>

      <div className="admin-bookings-list">
        {loading ? (
          <div className="admin-loading">Loading bookings...</div>
        ) : allBookings.length === 0 ? (
          <div className="admin-empty">
            <p>No bookings found.</p>
          </div>
        ) : (
          allBookings.map((booking: any) => (
            <div key={booking.id} className="admin-booking-item">
              <div className="admin-booking-header">
                <div>
                  <h3>{booking.name || 'N/A'}</h3>
                  <span className="admin-booking-id">ID: {booking.id}</span>
                </div>
                <span className="admin-booking-date">
                  {booking.bookingDateTime || 'Date not set'}
                </span>
              </div>
              <div className="admin-booking-details">
                <div className="detail-row">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{booking.email || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Phone:</span>
                  <span className="detail-value">{booking.phone || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Company:</span>
                  <span className="detail-value">{booking.company || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Company Size:</span>
                  <span className="detail-value">{booking.companySize || 'N/A'}</span>
                </div>
                {booking.message && (
                  <div className="detail-row">
                    <span className="detail-label">Message:</span>
                    <span className="detail-value">{booking.message}</span>
                  </div>
                )}
                <div className="detail-row">
                  <span className="detail-label">Created:</span>
                  <span className="detail-value">{formatDate(booking.createdAt)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminBookings;

