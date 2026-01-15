import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Navigation.css';

const Navigation: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Show navigation after animation completes (8 seconds)
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 8000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className={`navigation ${isScrolled ? 'scrolled' : ''} ${isVisible ? 'visible' : ''}`}>
      <div className="nav-container">
                {/* Logo with purple hexagonal icon */}
          <div className="logo">
                  <div className="logo-icon">
                    <img src="/images/logo.png" alt="Lagentry Logo" className="logo-icon-image" />
                  </div>
          </div>

          {/* Desktop Navigation Menu */}
          <div className="nav-menu desktop-menu">
          <div
            className="nav-item nav-item-agents"
            onClick={() => navigate('/agents')}
          >
            <span>Agents</span>
            <div className="agents-dropdown">
              <button onClick={() => navigate('/agents/gtm-sales')}>
                <span className="agents-dropdown-label">GTM &amp; Sales Agent</span>
              </button>
              <button onClick={() => navigate('/agents/hr-recruitment')}>
                <span className="agents-dropdown-label">HR &amp; Recruitment Agent</span>
              </button>
              <button onClick={() => navigate('/agents/cfo-finance')}>
                <span className="agents-dropdown-label">CFO &amp; Finance Agent</span>
              </button>
              <button onClick={() => navigate('/agents/customer-support')}>
                <span className="agents-dropdown-label">Customer Support Agent</span>
              </button>
              <button onClick={() => navigate('/agents/real-estate')}>
                <span className="agents-dropdown-label">Real Estate &amp; Property Agent</span>
              </button>
              <button onClick={() => navigate('/agents/healthcare')}>
                <span className="agents-dropdown-label">Healthcare Agent</span>
              </button>
            </div>
          </div>
          <div className="nav-item" onClick={() => navigate('/features')}>Features</div>
          <div className="nav-item" onClick={() => navigate('/pricing')}>Pricing</div>
          <div className="nav-item">Contact Us</div>
        </div>

        {/* Desktop Right Side Button */}
        <div className="nav-actions desktop-actions">
          <button className="demo-button" onClick={() => navigate('/book-demo')}>
            Book a Demo
          </button>
        </div>

        {/* Mobile Hamburger Menu */}
        <div className="mobile-menu-toggle" onClick={toggleMobileMenu}>
          <div className={`hamburger ${isMobileMenuOpen ? 'active' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-content">
          <div className="mobile-nav-item" onClick={() => navigate('/agents')}>Agents</div>
          <div className="mobile-nav-item" onClick={() => navigate('/features')}>Features</div>
          <div className="mobile-nav-item" onClick={() => navigate('/pricing')}>Pricing</div>
          <div className="mobile-nav-item">Contact Us</div>
          <div className="mobile-nav-item">
            <button className="mobile-demo-button" onClick={() => navigate('/book-demo')}>
              Book a Demo
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;