import React, { useState, useRef, useEffect } from 'react';
import './MenaCard.css';

interface MenaCardProps {
  theme?: 'dark' | 'light';
}

interface Landmark {
  id: string;
  name: string;
  x: number; // percentage from left
  y: number; // percentage from top
}

interface ParticleStream {
  id: string;
  startX: number; // percentage from left
  startY: number; // percentage from top
  endX: number;
  endY: number;
  particleCount: number;
  path: 'straight' | 'curved';
}

const landmarks: Landmark[] = [
  { id: 'uae', name: 'UAE', x: 72, y: 42 }, // Arabian Peninsula (UAE/Oman)
  { id: 'west-africa', name: 'West Africa', x: 25, y: 55 }, // West coast of Africa (Senegal/Mauritania)
  { id: 'east-africa', name: 'East Africa', x: 68, y: 65 }, // East Africa (Kenya/Tanzania)
];

const particleStreams: ParticleStream[] = [
  {
    id: 'east-to-west-1',
    startX: 85, // Start from east (right side)
    startY: 40,
    endX: 15, // Flow to west (left side)
    endY: 45,
    particleCount: 25,
    path: 'curved',
  },
  {
    id: 'east-to-west-2',
    startX: 90,
    startY: 55,
    endX: 20,
    endY: 60,
    particleCount: 20,
    path: 'curved',
  },
  {
    id: 'east-to-west-3',
    startX: 88,
    startY: 35,
    endX: 18,
    endY: 38,
    particleCount: 18,
    path: 'curved',
  },
];

const MenaCard: React.FC<MenaCardProps> = ({ theme = 'dark' }) => {
  const [hoveredLandmark, setHoveredLandmark] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const particlesRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for scroll-triggered animations
  useEffect(() => {
    if (!sectionRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -100px 0px',
      }
    );

    observer.observe(sectionRef.current);

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  // Parallax scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current || !cardRef.current) return;
      
      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const elementTop = rect.top;
      const elementHeight = rect.height;
      
      // Calculate scroll progress (0 to 1)
      const progress = Math.max(0, Math.min(1, (windowHeight - elementTop) / (windowHeight + elementHeight)));
      setScrollProgress(progress);
      
      // Parallax effect for card
      const parallaxOffset = (elementTop / windowHeight) * 50;
      cardRef.current.style.transform = `translateY(${parallaxOffset * 0.3}px)`;
      
      // Parallax for map
      if (mapRef.current) {
        mapRef.current.style.transform = `translateY(${parallaxOffset * 0.2}px) scale(${1 + progress * 0.05})`;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial call

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Create animated particle streams
  useEffect(() => {
    const container = particlesRef.current;
    if (!container) return;

    const particles: HTMLDivElement[] = [];

    particleStreams.forEach((stream) => {
      for (let i = 0; i < stream.particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'mena-particle';
        particle.dataset.stream = stream.id;
        
        // Calculate start position based on stream
        const startX = (container.offsetWidth * stream.startX) / 100;
        const startY = (container.offsetHeight * stream.startY) / 100;
        const endX = (container.offsetWidth * stream.endX) / 100;
        const endY = (container.offsetHeight * stream.endY) / 100;
        
        particle.style.left = `${stream.startX}%`;
        particle.style.top = `${stream.startY}%`;
        
        // Calculate animation path
        const deltaX = endX - startX;
        const deltaY = endY - startY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const angle = Math.atan2(deltaY, deltaX);
        
        // Store path data for animation
        particle.style.setProperty('--end-x', `${deltaX}px`);
        particle.style.setProperty('--end-y', `${deltaY}px`);
        particle.style.setProperty('--angle', `${angle}rad`);
        
        // Random delay and duration for natural flow
        particle.style.animationDelay = `${Math.random() * 5}s`;
        particle.style.animationDuration = `${8 + Math.random() * 6}s`;
        
        container.appendChild(particle);
        particles.push(particle);
      }
    });

    return () => {
      particles.forEach(particle => particle.remove());
    };
  }, []);

  return (
    <section 
      ref={sectionRef}
      className={`mena-card-section ${theme === 'light' ? 'light-theme' : ''} ${isVisible ? 'visible' : ''}`}
    >
      <div className="mena-card-container">
        <div 
          ref={cardRef}
          className={`mena-card ${isVisible ? 'visible' : ''}`}
          style={{
            '--scroll-progress': scrollProgress,
          } as React.CSSProperties}
        >
          <div className="mena-card-content">
            <p 
              ref={taglineRef}
              className={`mena-card-tagline ${isVisible ? 'visible' : ''}`}
            >
              Understands Your Market, Language, and Law.
            </p>
            
            <div 
              ref={mapRef}
              className={`mena-map-container ${isVisible ? 'visible' : ''}`}
            >
              <div className="mena-map-particles" ref={particlesRef}></div>
              {/* MENA region map with detailed continent outlines */}
              <svg className="mena-map" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid meet">
                <defs>
                  {/* Grid pattern for background */}
                  <pattern id="gridPattern" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
                    <line x1="0" y1="0" x2="0" y2="50" stroke="rgba(0, 191, 255, 0.15)" strokeWidth="0.5"/>
                    <line x1="0" y1="0" x2="50" y2="0" stroke="rgba(0, 191, 255, 0.15)" strokeWidth="0.5"/>
                  </pattern>
                  
                  {/* Glow filter for map outlines */}
                  <filter id="mapGlow">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                  
                  {/* Lens flare filter for landmarks */}
                  <filter id="lensFlare">
                    <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                  
                  {/* Glow filter for landmarks */}
                  <filter id="landmarkGlow">
                    <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                  
                  {/* Lens flare gradient */}
                  <radialGradient id="lensFlareGradient">
                    <stop offset="0%" stopColor="rgba(255, 255, 255, 1)"/>
                    <stop offset="20%" stopColor="rgba(255, 255, 255, 0.8)"/>
                    <stop offset="40%" stopColor="rgba(135, 206, 250, 0.6)"/>
                    <stop offset="60%" stopColor="rgba(0, 191, 255, 0.4)"/>
                    <stop offset="100%" stopColor="rgba(0, 191, 255, 0.1)"/>
                  </radialGradient>
                  
                  {/* Cyan glow gradient for landmarks */}
                  <radialGradient id="landmarkGlowGradient">
                    <stop offset="0%" stopColor="rgba(255, 255, 255, 0.95)"/>
                    <stop offset="50%" stopColor="rgba(0, 191, 255, 0.7)"/>
                    <stop offset="100%" stopColor="rgba(0, 191, 255, 0.2)"/>
                  </radialGradient>
                  
                  {/* Internal glow for landmasses */}
                  <radialGradient id="landmassGlow">
                    <stop offset="0%" stopColor="rgba(0, 191, 255, 0.3)"/>
                    <stop offset="50%" stopColor="rgba(135, 206, 250, 0.15)"/>
                    <stop offset="100%" stopColor="rgba(0, 191, 255, 0.05)"/>
                  </radialGradient>
                </defs>
                
                {/* Grid background */}
                <rect width="1000" height="600" fill="url(#gridPattern)" opacity="0.4"/>
                
                {/* Europe - Detailed outline */}
                <path
                  d="M 200 80 L 280 75 L 350 85 L 400 100 L 420 130 L 410 160 L 390 180 L 360 190 L 330 200 L 300 210 L 270 215 L 240 210 L 220 200 L 200 180 L 190 150 L 195 120 Z"
                  fill="rgba(0, 191, 255, 0.15)"
                  stroke="rgba(0, 191, 255, 0.7)"
                  strokeWidth="2"
                  filter="url(#mapGlow)"
                  className="continent-outline"
                />
                
                {/* Europe - Internal country borders */}
                <path d="M 250 100 L 250 180" fill="none" stroke="rgba(135, 206, 250, 0.4)" strokeWidth="1" className="country-border"/>
                <path d="M 300 110 L 300 200" fill="none" stroke="rgba(135, 206, 250, 0.4)" strokeWidth="1" className="country-border"/>
                <path d="M 220 120 L 350 130" fill="none" stroke="rgba(135, 206, 250, 0.4)" strokeWidth="1" className="country-border"/>
                
                {/* Africa - Detailed outline */}
                <path
                  d="M 250 200 L 320 195 L 380 205 L 420 230 L 440 280 L 430 340 L 400 400 L 370 450 L 340 480 L 320 500 L 300 510 L 280 500 L 260 480 L 250 450 L 245 400 L 250 350 L 255 300 L 250 250 Z"
                  fill="rgba(0, 191, 255, 0.15)"
                  stroke="rgba(0, 191, 255, 0.7)"
                  strokeWidth="2"
                  filter="url(#mapGlow)"
                  className="continent-outline"
                />
                
                {/* Africa - Internal country borders */}
                <path d="M 300 250 L 300 400" fill="none" stroke="rgba(135, 206, 250, 0.4)" strokeWidth="1" className="country-border"/>
                <path d="M 350 280 L 350 450" fill="none" stroke="rgba(135, 206, 250, 0.4)" strokeWidth="1" className="country-border"/>
                <path d="M 280 300 L 400 320" fill="none" stroke="rgba(135, 206, 250, 0.4)" strokeWidth="1" className="country-border"/>
                <path d="M 320 350 L 420 370" fill="none" stroke="rgba(135, 206, 250, 0.4)" strokeWidth="1" className="country-border"/>
                
                {/* Arabian Peninsula - Detailed outline */}
                <path
                  d="M 600 240 L 680 230 L 720 240 L 740 260 L 730 290 L 700 310 L 660 320 L 620 315 L 590 310 L 570 290 L 560 270 Z"
                  fill="rgba(0, 191, 255, 0.2)"
                  stroke="rgba(0, 191, 255, 0.8)"
                  strokeWidth="2.5"
                  filter="url(#mapGlow)"
                  className="continent-outline"
                />
                
                {/* Arabian Peninsula - Internal borders */}
                <path d="M 650 250 L 650 300" fill="none" stroke="rgba(135, 206, 250, 0.5)" strokeWidth="1" className="country-border"/>
                <path d="M 620 260 L 700 270" fill="none" stroke="rgba(135, 206, 250, 0.5)" strokeWidth="1" className="country-border"/>
                
                {/* Central Asia / India region */}
                <path
                  d="M 750 280 L 850 270 L 900 290 L 920 320 L 910 360 L 880 380 L 840 390 L 800 385 L 760 375 L 740 350 L 735 320 Z"
                  fill="rgba(0, 191, 255, 0.15)"
                  stroke="rgba(0, 191, 255, 0.6)"
                  strokeWidth="2"
                  filter="url(#mapGlow)"
                  className="continent-outline"
                />
                
                {/* Scattered dots across landmasses (data points/urban areas) */}
                {/* Europe dots */}
                {[220, 250, 280, 310, 340, 370].flatMap((x, i) => 
                  [100, 130, 160, 190].map((y, j) => (
                    <circle key={`europe-${i}-${j}`} cx={x} cy={y} r="1.5" fill="rgba(135, 206, 250, 0.6)" className="data-point" />
                  ))
                )}
                {/* Africa dots */}
                {[280, 320, 360, 400].flatMap((x, i) => 
                  [250, 300, 350, 400, 450].map((y, j) => (
                    <circle key={`africa-${i}-${j}`} cx={x} cy={y} r="1.5" fill="rgba(135, 206, 250, 0.6)" className="data-point" />
                  ))
                )}
                {/* Arabian Peninsula dots */}
                {[610, 640, 670, 700].flatMap((x, i) => 
                  [250, 280, 300].map((y, j) => (
                    <circle key={`arabia-${i}-${j}`} cx={x} cy={y} r="1.5" fill="rgba(135, 206, 250, 0.6)" className="data-point" />
                  ))
                )}
                {/* Central Asia/India dots */}
                {[760, 800, 840, 880].flatMap((x, i) => 
                  [300, 330, 360].map((y, j) => (
                    <circle key={`asia-${i}-${j}`} cx={x} cy={y} r="1.5" fill="rgba(135, 206, 250, 0.6)" className="data-point" />
                  ))
                )}
                
                {/* Landmarks with lens flare effects */}
                {landmarks.map((landmark) => {
                  const x = (landmark.x * 1000) / 100;
                  const y = (landmark.y * 600) / 100;
                  return (
                    <g key={landmark.id} className="landmark-group">
                      {/* Lens flare horizontal streaks */}
                      <line
                        x1={x - 40}
                        y1={y}
                        x2={x - 20}
                        y2={y}
                        stroke="rgba(255, 255, 255, 0.8)"
                        strokeWidth="2"
                        filter="url(#lensFlare)"
                        opacity={hoveredLandmark === landmark.id ? 1 : 0.6}
                        className="lens-flare-streak"
                      />
                      <line
                        x1={x + 20}
                        y1={y}
                        x2={x + 40}
                        y2={y}
                        stroke="rgba(255, 255, 255, 0.8)"
                        strokeWidth="2"
                        filter="url(#lensFlare)"
                        opacity={hoveredLandmark === landmark.id ? 1 : 0.6}
                        className="lens-flare-streak"
                      />
                      
                      {/* Outer glow halo */}
                      <circle
                        cx={x}
                        cy={y}
                        r={hoveredLandmark === landmark.id ? 30 : 20}
                        fill="url(#lensFlareGradient)"
                        opacity={hoveredLandmark === landmark.id ? 0.8 : 0.6}
                        filter="url(#lensFlare)"
                        className="landmark-halo"
                      />
                      
                      {/* Inner glow */}
                      <circle
                        cx={x}
                        cy={y}
                        r={hoveredLandmark === landmark.id ? 18 : 12}
                        fill="url(#landmarkGlowGradient)"
                        opacity={hoveredLandmark === landmark.id ? 0.95 : 0.7}
                        filter="url(#landmarkGlow)"
                        className="landmark-glow"
                      />
                      
                      {/* Core bright point */}
                      <circle
                        cx={x}
                        cy={y}
                        r={hoveredLandmark === landmark.id ? 10 : 6}
                        fill="rgba(255, 255, 255, 1)"
                        className="landmark-point"
                        style={{
                          transition: 'all 0.3s ease',
                          cursor: 'pointer',
                        }}
                      />
                      
                      {/* Label on hover */}
                      {hoveredLandmark === landmark.id && (
                        <text
                          x={x}
                          y={y - 40}
                          textAnchor="middle"
                          fill="rgba(255, 255, 255, 0.95)"
                          fontSize="18"
                          fontWeight="700"
                          className="landmark-label"
                          style={{
                            textShadow: '0 2px 8px rgba(0, 191, 255, 0.8)',
                          }}
                        >
                          {landmark.name}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
              
              {/* Interactive hover zones for landmarks */}
              {landmarks.map((landmark) => (
                <div
                  key={landmark.id}
                  className="landmark-hover-zone"
                  style={{
                    left: `${landmark.x}%`,
                    top: `${landmark.y}%`,
                  }}
                  onMouseEnter={() => setHoveredLandmark(landmark.id)}
                  onMouseLeave={() => setHoveredLandmark(null)}
                  aria-label={landmark.name}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MenaCard;

