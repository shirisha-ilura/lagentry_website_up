import React, { useEffect, useRef, useState } from 'react';
import './Header.css';
import lagentryImage from '../Lagentry-main.png';
import slantLines from '../slant-lines.png';

const Header: React.FC = () => {
  const [showStars, setShowStars] = useState(false);
  const [showAvatar, setShowAvatar] = useState(false);
  const [showText, setShowText] = useState(false);
  const [showCopyright, setShowCopyright] = useState(false);
  const [showLagentry, setShowLagentry] = useState(false);
  const [showNavigation, setShowNavigation] = useState(false);
  const [hideHeader, setHideHeader] = useState(false);

  useEffect(() => {
    // Animation sequence timing
    const timeline = [
      { delay: 300, action: () => {
        console.log('Stars appearing');
        setShowStars(true);
      }},
      { delay: 1500, action: () => {
        console.log('Text appearing');
        setShowText(true);
      }},
      { delay: 2500, action: () => {
        console.log('Avatar appearing');
        setShowAvatar(true);
      }},
      { delay: 3000, action: () => {
        console.log('Copyright appearing');
        setShowCopyright(true);
      }},
      { delay: 4500, action: () => {
        console.log('Elements disappearing, Lagentry appearing');
        setShowText(false);
        setShowAvatar(false);
        setShowCopyright(false);
        setShowLagentry(true);
      }},
      { delay: 8000, action: () => {
        console.log('Lagentry disappearing, transitioning to main content');
        setShowLagentry(false);
        setShowNavigation(true);
        setHideHeader(true);
      }}
    ];

    timeline.forEach(({ delay, action }) => {
      setTimeout(action, delay);
    });
  }, []);

  // Create beautiful stars with good size and animations
  useEffect(() => {
    const createStars = () => {
      const particlesContainer = document.getElementById('stars-container');
      if (!particlesContainer) return;

      // Clear existing particles
      particlesContainer.innerHTML = '';

      // Create stars with mixed sizes - small and big
      for (let i = 0; i < 40; i++) { // Increased count for more stars
        const star = document.createElement('div');
        
        // Mix of small and big stars - decreased sizes
        let starClass, size;
        if (Math.random() < 0.3) { // 30% chance for big stars
          starClass = 'big-star';
          size = Math.random() * 2 + 2; // 2px to 4px for big stars (was 4px to 8px)
        } else { // 70% chance for small stars
          starClass = 'small-star';
          size = Math.random() * 1 + 0.5; // 0.5px to 1.5px for small stars (was 1px to 3px)
        }
        
        star.className = `beautiful-star ${starClass}`;
        
        // Position stars randomly across the container
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        
        // Set size
        star.style.width = size + 'px';
        star.style.height = size + 'px';
        
        // Good brightness for white stars on black background
        const brightness = Math.random() * 0.3 + 0.7; // 0.7 to 1.0 opacity for good visibility
        star.style.opacity = brightness.toString();
        
        // Random animation delay for variety
        star.style.animationDelay = Math.random() * 5 + 's';
        
        particlesContainer.appendChild(star);
      }
    };

    if (showStars) {
      createStars();
    }
  }, [showStars]);

  const bgRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = bgRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    el.style.setProperty('--mx', `${x}%`);
    el.style.setProperty('--my', `${y}%`);
    el.style.setProperty('--glowOpacity', '1');
  };

  const handleMouseLeave = () => {
    const el = bgRef.current;
    if (!el) return;
    el.style.setProperty('--glowOpacity', '0');
  };

  // removed custom shooting star logic

  // Note: The early return above should prevent reaching here if animation should be skipped

  return (
    <header className={`header ${hideHeader ? 'header-hidden' : ''}`}>
      <div
        ref={bgRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={`header-background ${showLagentry ? 'gradient-active' : ''}`}
      >
        {/* Stars Container */}
        <div id="stars-container" className={`stars-container ${showStars ? 'visible' : ''}`}></div>

        {/* Slant lines banner under navbar, only when Lagentry is visible */}
        {showLagentry && (
          <div className={`slant-banner ${showLagentry ? 'visible' : ''}`}>
            <img src={slantLines} alt="Decorative slant lines" className="slant-banner-image" />
          </div>
        )}
        {/* Avatar */}
        <div className={`avatar-container ${showAvatar ? 'visible' : ''} ${!showAvatar && showLagentry ? 'hidden' : ''}`}>
          <div className="avatar">
            <div className="avatar-face"></div>
            <div className="avatar-body"></div>
          </div>
        </div>
        
        {/* Sliding Text */}
        <div className={`sliding-text ${showText ? 'visible' : ''} ${!showText && showLagentry ? 'hidden' : ''}`}>
          <h2>There's a new AI agent Builder in town</h2>
          {/* Diagonal glow line */}
          <div className={`diagonal-glow-line ${showText ? 'visible' : ''}`}></div>
        </div>
        
        {/* Copyright */}
        <div className={`copyright-text ${showCopyright ? 'visible' : ''} ${!showCopyright && showLagentry ? 'hidden' : ''}`}>
          <p>© 2025 Lagentry. All rights reserved.</p>
        </div>
        
        {/* Lagentry Image */}
        <div className={`background-lagentry-text ${showLagentry ? 'visible' : ''}`}>
          <img src={lagentryImage} alt="Lagentry" className="lagentry-image" />
        </div>

        {/* shooting star removed */}
      </div>
    </header>
  );
};

export default Header;
