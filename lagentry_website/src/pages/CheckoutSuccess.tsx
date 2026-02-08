import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './CheckoutSuccess.css';

const CheckoutSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Redirect to home page and scroll to Dashboard section after 2 seconds
    const timer = setTimeout(() => {
      navigate('/');
      // Scroll to dashboard section after navigation
      setTimeout(() => {
        const dashboardElement = document.querySelector('.dashboard-container, .dashboard, [class*="dashboard"]');
        if (dashboardElement) {
          dashboardElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="checkout-success-container">
      <div className="checkout-success-content">
        <div className="success-icon">✓</div>
        <h1 className="success-title">Payment Successful!</h1>
        <p className="success-message">
          Thank you for subscribing to Lagentry. You'll be redirected to your dashboard shortly.
        </p>
        {sessionId && (
          <p className="session-id">Session ID: {sessionId}</p>
        )}
        <button 
          className="dashboard-button" 
          onClick={() => {
            navigate('/');
            // Scroll to dashboard section after navigation
            setTimeout(() => {
              const dashboardElement = document.querySelector('.dashboard-container, .dashboard, [class*="dashboard"]');
              if (dashboardElement) {
                dashboardElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }, 100);
          }}
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
};

export default CheckoutSuccess;
