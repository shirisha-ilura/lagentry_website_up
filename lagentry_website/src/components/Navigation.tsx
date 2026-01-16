import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Navigation.css';

// Logo path - React serves public folder from root
// Use process.env.PUBLIC_URL to ensure correct path resolution
const logoPath = `${process.env.PUBLIC_URL || ''}/images/lagentry-Logo.png`;

const Navigation: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isAgentsOpen, setIsAgentsOpen] = useState(false);
  const [isMobileAgentsOpen, setIsMobileAgentsOpen] = useState(false);
  const agentsHoverTimeoutRef = useRef<number | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

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

  const scrollToSection = (selector: string, maxRetries = 10, delay = 100) => {
    let retries = 0;
    const tryScroll = () => {
      const element = document.querySelector(selector);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      } else if (retries < maxRetries) {
        retries++;
        setTimeout(tryScroll, delay);
      }
    };
    tryScroll();
  };


  const handleAgentsMouseEnter = () => {
    if (agentsHoverTimeoutRef.current) {
      window.clearTimeout(agentsHoverTimeoutRef.current);
      agentsHoverTimeoutRef.current = null;
    }
    setIsAgentsOpen(true);
  };

  const handleAgentsMouseLeave = () => {
    // Small delay so the menu doesn't close the instant the cursor hits the gap
    agentsHoverTimeoutRef.current = window.setTimeout(() => {
      setIsAgentsOpen(false);
      agentsHoverTimeoutRef.current = null;
    }, 120);
  };

  const handleAgentItemClick = (path: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering parent click
    setIsAgentsOpen(false); // Close dropdown
    navigate(path); // Navigate to agent page
  };

  const handleFeaturesClick = () => {
    navigate('/features');
  };

  const handleContactClick = () => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => scrollToSection('.footer', 15, 150), 200);
    } else {
      scrollToSection('.footer');
    }
  };

  return (
    <nav className={`navigation ${isScrolled ? 'scrolled' : ''} ${isVisible ? 'visible' : ''}`}>
      <div className="nav-container">
                {/* Logo with purple hexagonal icon */}
          <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                  <div className="logo-icon">
                    <img 
                      src={logoPath}
                      alt="Lagentry Logo" 
                      className="logo-icon-image"
                      style={{ display: 'block', width: '100%', height: '100%', objectFit: 'contain' }}
                      onLoad={() => console.log('Logo loaded successfully:', logoPath)}
                      onError={(e) => {
                        console.error('Logo image failed to load:', e.currentTarget.src);
                        const target = e.currentTarget;
                        const attempts = target.getAttribute('data-attempts') || '0';
                        const attemptNum = parseInt(attempts);
                        const baseUrl = process.env.PUBLIC_URL || '';
                        
                        if (attemptNum === 0) {
                          target.setAttribute('data-attempts', '1');
                          // Try without PUBLIC_URL
                          target.src = "/images/lagentry-Logo.png";
                        } else if (attemptNum === 1) {
                          target.setAttribute('data-attempts', '2');
                          // Try alternative logo
                          target.src = `${baseUrl}/images/lagentry-logo.png`;
                        } else {
                          console.error('Logo failed to load after all attempts');
                        }
                      }}
                    />
                  </div>
          </div>

          {/* Desktop Navigation Menu */}
          <div className="nav-menu desktop-menu">
          <div
            className="nav-item nav-item-agents"
            style={{ cursor: 'default', position: 'relative' }}
            onMouseEnter={handleAgentsMouseEnter}
            onMouseLeave={handleAgentsMouseLeave}
          >
            <span>Agents</span>
            <div 
              className={`agents-dropdown ${isAgentsOpen ? 'open' : ''}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="agents-dropdown-grid">
                <button type="button" onClick={(e) => handleAgentItemClick('/agents/gtm-sales', e)}>
                  <div className="agents-dropdown-pill">
                    <div className="agents-dropdown-blob">
                      <img src="/images/ChatGPT_Image_Oct_22__2025__04_29_44_PM-removebg-preview.png" alt="GTM & Sales Agent" className="agents-dropdown-image" />
                    </div>
                    <div className="agents-dropdown-copy">
                      <span className="agents-dropdown-title">GTM &amp; Sales Agent</span>
                      <span className="agents-dropdown-subtitle">
                        Drive outreach, qualify intent, and keep deals in motion.
                      </span>
                    </div>
                  </div>
                </button>
                <button type="button" onClick={(e) => handleAgentItemClick('/agents/hr-recruitment', e)}>
                  <div className="agents-dropdown-pill">
                    <div className="agents-dropdown-blob">
                      <img src="/images/ChatGPT_Image_Oct_22__2025__04_14_54_PM-removebg-preview.png" alt="HR & Recruitment Agent" className="agents-dropdown-image" />
                    </div>
                    <div className="agents-dropdown-copy">
                      <span className="agents-dropdown-title">HR &amp; Recruitment</span>
                      <span className="agents-dropdown-subtitle">
                        Orchestrate hiring, onboarding, and people ops flows.
                      </span>
                    </div>
                  </div>
                </button>
                <button type="button" onClick={(e) => handleAgentItemClick('/agents/cfo-finance', e)}>
                  <div className="agents-dropdown-pill">
                    <div className="agents-dropdown-blob">
                      <img src="/images/ChatGPT_Image_Oct_22__2025__03_54_44_PM-removebg-preview.png" alt="CFO & Finance Agent" className="agents-dropdown-image" />
                    </div>
                    <div className="agents-dropdown-copy">
                      <span className="agents-dropdown-title">CFO &amp; Finance</span>
                      <span className="agents-dropdown-subtitle">
                        See cash, margin, and risk in one focused lane.
                      </span>
                    </div>
                  </div>
                </button>
                <button type="button" onClick={(e) => handleAgentItemClick('/agents/customer-support', e)}>
                  <div className="agents-dropdown-pill">
                    <div className="agents-dropdown-blob">
                      <img src="/images/ChatGPT_Image_Oct_22__2025_at_02_45_40_PM-removebg-preview.png" alt="Customer Support Agent" className="agents-dropdown-image" />
                    </div>
                    <div className="agents-dropdown-copy">
                      <span className="agents-dropdown-title">Customer Support</span>
                      <span className="agents-dropdown-subtitle">
                        Always-on help that feeds product with real signals.
                      </span>
                    </div>
                  </div>
                </button>
                <button type="button" onClick={(e) => handleAgentItemClick('/agents/real-estate', e)}>
                  <div className="agents-dropdown-pill">
                    <div className="agents-dropdown-blob">
                      <img src="/images/ChatGPT_Image_Oct_22__2025_at_04_55_49_PM-removebg-preview.png" alt="Real Estate & Property Agent" className="agents-dropdown-image" />
                    </div>
                    <div className="agents-dropdown-copy">
                      <span className="agents-dropdown-title">Real Estate &amp; Property</span>
                      <span className="agents-dropdown-subtitle">
                        From leads to leases and maintenance, handled quietly.
                      </span>
                    </div>
                  </div>
                </button>
                <button type="button" onClick={(e) => handleAgentItemClick('/agents/healthcare', e)}>
                  <div className="agents-dropdown-pill">
                    <div className="agents-dropdown-blob">
                      <img src="/images/ChatGPT_Image_Oct_8__2025_at_03_27_37_PM-removebg-preview.png" alt="Healthcare Agent" className="agents-dropdown-image" />
                    </div>
                    <div className="agents-dropdown-copy">
                      <span className="agents-dropdown-title">Healthcare</span>
                      <span className="agents-dropdown-subtitle">
                        Coordinate intake, scheduling, and follow‑ups with care.
                      </span>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
          <div className="nav-item" onClick={handleFeaturesClick} style={{ cursor: 'pointer' }}>Features</div>
          <div className="nav-item" onClick={() => navigate('/pricing')} style={{ cursor: 'pointer' }}>Pricing</div>
          <div className="nav-item" onClick={handleContactClick} style={{ cursor: 'pointer' }}>Contact Us</div>
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
          <div className="mobile-nav-item mobile-homepage" onClick={() => { navigate('/'); setIsMobileMenuOpen(false); }} style={{ cursor: 'pointer' }}>Home</div>
          <div className="mobile-nav-item mobile-agents-parent" style={{ cursor: 'pointer' }}>
            <div onClick={() => setIsMobileAgentsOpen(!isMobileAgentsOpen)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <span>Agents</span>
              <span style={{ transform: isMobileAgentsOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>▼</span>
            </div>
            {isMobileAgentsOpen && (
              <div className="mobile-agents-submenu">
                <div className="mobile-nav-subitem" onClick={(e) => { handleAgentItemClick('/agents/gtm-sales', e); setIsMobileMenuOpen(false); setIsMobileAgentsOpen(false); }}>GTM & Sales</div>
                <div className="mobile-nav-subitem" onClick={(e) => { handleAgentItemClick('/agents/hr-recruitment', e); setIsMobileMenuOpen(false); setIsMobileAgentsOpen(false); }}>HR & Recruitment</div>
                <div className="mobile-nav-subitem" onClick={(e) => { handleAgentItemClick('/agents/cfo-finance', e); setIsMobileMenuOpen(false); setIsMobileAgentsOpen(false); }}>CFO & Finance</div>
                <div className="mobile-nav-subitem" onClick={(e) => { handleAgentItemClick('/agents/customer-support', e); setIsMobileMenuOpen(false); setIsMobileAgentsOpen(false); }}>Customer Support</div>
                <div className="mobile-nav-subitem" onClick={(e) => { handleAgentItemClick('/agents/real-estate', e); setIsMobileMenuOpen(false); setIsMobileAgentsOpen(false); }}>Real Estate</div>
                <div className="mobile-nav-subitem" onClick={(e) => { handleAgentItemClick('/agents/healthcare', e); setIsMobileMenuOpen(false); setIsMobileAgentsOpen(false); }}>Healthcare</div>
              </div>
            )}
          </div>
          <div className="mobile-nav-item" onClick={() => { handleFeaturesClick(); setIsMobileMenuOpen(false); }} style={{ cursor: 'pointer' }}>Features</div>
          <div className="mobile-nav-item" onClick={() => { navigate('/pricing'); setIsMobileMenuOpen(false); }} style={{ cursor: 'pointer' }}>Pricing</div>
          <div className="mobile-nav-item" onClick={() => { handleContactClick(); setIsMobileMenuOpen(false); }} style={{ cursor: 'pointer' }}>Contact Us</div>
          <div className="mobile-nav-item">
            <button className="mobile-demo-button" onClick={() => { navigate('/book-demo'); setIsMobileMenuOpen(false); }}>
              Book a Demo
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;