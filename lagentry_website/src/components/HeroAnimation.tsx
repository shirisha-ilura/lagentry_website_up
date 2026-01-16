import React, { useState, useEffect, useRef } from 'react';
import './HeroAnimation.css';

const HeroAnimation: React.FC = () => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  const animatedTexts = [
    "Web Dev",
    "AI Agent Creator", 
    "Tech Innovator",
    "Digital Wizard",
    "Code Master"
  ];

  useEffect(() => {
    // Trigger initial animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    
    // Cycle through texts
    const interval = setInterval(() => {
      setCurrentTextIndex((prev) => (prev + 1) % animatedTexts.length);
    }, 2500);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [animatedTexts.length]);

  // Create particle effect
  useEffect(() => {
    const createParticles = () => {
      const particlesContainer = document.getElementById('particles');
      if (!particlesContainer) return;

      for (let i = 0; i < 80; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 20 + 's';
        particle.style.animationDuration = (Math.random() * 15 + 15) + 's';
        
        // Add variety to star sizes
        const size = Math.random() * 3 + 1; // 1px to 4px
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        
        // Add variety to star brightness
        const brightness = Math.random() * 0.5 + 0.3; // 0.3 to 0.8 opacity
        particle.style.opacity = brightness.toString();
        
        particlesContainer.appendChild(particle);
      }
    };

    createParticles();
  }, []);

  return (
    <div className={`hero-section ${isVisible ? 'visible' : ''}`} ref={heroRef}>
      {/* Particle Background */}
      <div id="particles" className="particles-container"></div>
      
      {/* Hero Overlay */}
      <div className={`hero-overlay ${isVisible ? 'visible' : ''}`}></div>
      
      {/* Background Lights Effect */}
      <div className="hero-lights"></div>
      
      {/* Main Hero Content */}
      <div className="hero-container">
        <div className="hero-content">
          {/* Main animated heading */}
          <div className="main-title-container">
            <h1 className="main-title">
              <span className="title-line"></span>
            </h1>
          </div>

          {/* Subtitle */}
          <div className="subtitle-container">
            <p className="subtitle">
              I craft premium websites for creators, entrepreneurs and startups who want to 
              convert clients, drive serious revenue and stand out in an ever-crowding market.
            </p>
          </div>

          {/* CTA Section */}
          <div className="cta-container">
            <button className="cta-button">
              Let's work together
              <span className="arrow">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroAnimation;

