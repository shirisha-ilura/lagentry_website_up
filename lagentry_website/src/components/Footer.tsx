import React, { useRef, useEffect, useState } from 'react';
import './Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          {/* Lagentry Section - FIRST */}
          <div className="footer-section footer-lagentry-section">
            <div className="footer-logo">
              <img
                src="/images/lagentry1.png"
                alt="Lagentry"
                className="footer-logo-image"
              />
            </div>
            <p className="footer-description">
              Empowering businesses to automate all domains, with advanced AI and technology, 100x your company.
            </p>
            <div className="social-icons">
              <a href="https://www.instagram.com/ilura.ai/" target="_blank" rel="noopener noreferrer" className="social-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
              <a href="https://www.linkedin.com/company/ilurai/" target="_blank" rel="noopener noreferrer" className="social-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <rect x="2" y="9" width="4" height="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="4" cy="4" r="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
              <a href="tel:+971503261064" className="social-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
              <a href="mailto:info@lagentry.com" className="social-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Resources, Contact, Legal in 3 columns with equal spacing */}
          <div className="footer-sections-grid">
            {/* Resources Section */}
            <div className="footer-section">
              <h3 className="footer-heading">Resources</h3>
              <ul className="footer-links">
                <li><a href="#" className="footer-link">Documentation</a></li>
                <li><a href="#" className="footer-link">Tutorials</a></li>
                <li><a href="#" className="footer-link">Support</a></li>
              </ul>
            </div>

            {/* Contact Section - in the middle */}
            <div className="footer-section">
              <h3 className="footer-heading">Contact</h3>
              <ul className="footer-links">
                <li><a href="mailto:info@lagentry.com" className="footer-link">info@lagentry.com</a></li>
                <li><a href="tel:+971503261064" className="footer-link">+971 50 3261064</a></li>
                <li><a href="#" className="footer-link">Book a Demo</a></li>
              </ul>
            </div>

            {/* Legal Section */}
            <div className="footer-section">
              <h3 className="footer-heading">Legal</h3>
              <ul className="footer-links">
                <li><a href="#" className="footer-link">Privacy Policy</a></li>
                <li><a href="#" className="footer-link">Terms of Service</a></li>
              </ul>
            </div>
          </div>
        </div>

      </div>

      {/* Giant brand word at the very end */}
      <GiantBrandGlow />
      
      {/* Copyright under the giant brand */}
      <div className="footer-bottom-end">
        <p className="copyright">© 2025 Lagentry. All rights reserved.</p>
      </div>
    </footer>
  );
};

const GiantBrandGlow: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      return () => container.removeEventListener('mousemove', handleMouseMove);
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="giant-brand"
      aria-hidden="true"
      style={{
        '--mouse-x': `${mousePos.x}px`,
        '--mouse-y': `${mousePos.y}px`,
      } as React.CSSProperties}
    >
      <span className="giant-brand-text">Lagentry</span>
    </div>
  );
};

export default Footer;
