import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import './Header.css';
import lagentryImage from '../Lagentry-main.png';
import { ShaderBackground } from './ShaderBackground';
import { hasIntroCompleted, markIntroCompleted } from '../introState';

// Text phrases to display one by one - defined outside component to avoid recreation
const phrases = [
  "INTRODUCING",
  "MENA's First",
  "AI Employees",
  "Built to Run SME's"
];

const Header: React.FC = () => {
  // Only show the intro once per hard refresh.
  const [isActive, setIsActive] = useState(() => !hasIntroCompleted());
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [showCopyright, setShowCopyright] = useState(false);
  const [showLagentry, setShowLagentry] = useState(false);
  const [showNavigation, setShowNavigation] = useState(false);
  const [hideHeader, setHideHeader] = useState(false);
  const [shouldShowIntro, setShouldShowIntro] = useState(isActive);
  const [showBackground, setShowBackground] = useState(false);
  
  // Refs for GSAP animations
  const aiEmployeesRef = useRef<HTMLHeadingElement>(null);
  const builtToRunRef = useRef<HTMLHeadingElement>(null);
  const builtToRunStaticRef = useRef<HTMLSpanElement>(null);
  const builtToRunDynamicRef = useRef<HTMLSpanElement>(null);
  
  // Dynamic words for rotation
  const dynamicWords = ["SMEs.", "Startups.", "Enterprises."];

  useEffect(() => {
    if (!isActive) return;
    
    // Fresh page load: play the intro once, then mark it as completed
    // and deactivate this header so it unmounts.
    setShouldShowIntro(true);
    
    const timers: number[] = [];
    let currentDelay = 0;
    
    // 1. Background appears first (subtle gradient fade-in)
    timers.push(window.setTimeout(() => {
      setShowBackground(true);
    }, currentDelay));
    currentDelay += 300;
    
    // 2. "Introducing" - Typewriter/letter-by-letter reveal with fade
    timers.push(window.setTimeout(() => {
      setCurrentWordIndex(0);
    }, currentDelay));
    currentDelay += 2200; // 2.2s for typewriter effect + pause
    
    // 3. "MENA's First" - Slide + fade reveal
    timers.push(window.setTimeout(() => {
      setCurrentWordIndex(1);
    }, currentDelay));
    currentDelay += 2000; // 2s for slide + pause
    
    // 4. "AI Employees" - GSAP Typewriter → Zoom → Slide Left
    timers.push(window.setTimeout(() => {
      setCurrentWordIndex(2);
      // Trigger GSAP animation after element is rendered
      setTimeout(() => {
        if (aiEmployeesRef.current) {
          animateAIEmployees();
        }
      }, 50);
    }, currentDelay));
    // Wait for AI Employees to completely finish 
    // Timing: typewriter (12*0.07=0.84s) + cursor (0.3s) + pause (0.3s) + zoom (0.8s) + hold (0.5s) + slide (2.2s) = ~5.04s
    // Reduced pause for smoother transition
    currentDelay += 3500; // 3.5 seconds - reduced from 5.2s for faster transition
    
    // 5. "Built to Run" - Static + Rotating Dynamic Word (only shows after AI Employees is completely gone)
    timers.push(window.setTimeout(() => {
      // Ensure AI Employees is hidden first
      setCurrentWordIndex(-1);
      // Small delay to ensure clean transition
      setTimeout(() => {
        setCurrentWordIndex(3);
        // Trigger GSAP animation after element is rendered
        setTimeout(() => {
          if (builtToRunRef.current && builtToRunStaticRef.current && builtToRunDynamicRef.current) {
            animateBuiltToRun();
          } else {
            // Fallback: animate the whole element if refs aren't ready
            if (builtToRunRef.current) {
              const tl = gsap.timeline();
              gsap.set(builtToRunRef.current, { opacity: 0, y: 30 });
              tl.to(builtToRunRef.current, {
                duration: 0.8,
                opacity: 1,
                y: 0,
                ease: "power2.out"
              });
            }
          }
        }, 50);
      }, 100);
    }, currentDelay));
    currentDelay += 6000; // ~6s for static reveal + word rotations + final settle
    
    // End animation after "Built to Run Enterprises" completes
    // The animation ends here - no need to hide or show anything else
    
    // Show copyright after all phrases
    timers.push(window.setTimeout(() => {
      setShowCopyright(true);
    }, currentDelay));
    currentDelay += 1000;
    
    // Show Lagentry logo
    timers.push(window.setTimeout(() => {
      setShowCopyright(false);
      setShowLagentry(true);
    }, currentDelay));
    currentDelay += 2000;
    
    // End intro
    timers.push(window.setTimeout(() => {
      setShowLagentry(false);
      setShowNavigation(true);
      setHideHeader(true);
      markIntroCompleted();
      setShouldShowIntro(false);
      setIsActive(false);
    }, currentDelay + 1000));

    return () => {
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [isActive]);

  const bgRef = useRef<HTMLDivElement>(null);

  // GSAP Animation: AI Employees - Typewriter → Zoom → Slide Left (Train) - Completely Rewritten
  const animateAIEmployees = () => {
    if (!aiEmployeesRef.current) return;
    
    const element = aiEmployeesRef.current;
    const text = "AI Employees";
    
    // Kill any existing animations first
    gsap.killTweensOf(element);
    
    // Reset element completely
    element.style.cssText = '';
    element.textContent = "";
    
    const tl = gsap.timeline();
    
    // Set initial state - clean slate
    gsap.set(element, { 
      opacity: 1, 
      scale: 1,
      x: 0,
      y: 0,
      clearProps: "transform,opacity"
    });
    
    // Typewriter effect - letter by letter
    const chars = text.split("");
    chars.forEach((char, index) => {
      tl.call(() => {
        element.textContent = text.substring(0, index + 1);
      }, undefined, index * 0.07);
    });
    
    // Cursor blink
    const cursor = document.createElement('span');
    cursor.textContent = '|';
    cursor.style.cssText = 'opacity: 0.8; display: inline-block; margin-left: 2px;';
    element.appendChild(cursor);
    tl.to(cursor, { 
      opacity: 0, 
      duration: 0.15, 
      repeat: 1, 
      yoyo: true
    }, "-=0.1");
    tl.call(() => {
      if (cursor.parentNode) cursor.remove();
    });
    
    // Pause
    tl.to({}, { duration: 0.3 });
    
    // Zoom in smoothly - lock scale at 1.6
    tl.to(element, {
      duration: 0.8,
      scale: 1.6,
      ease: "power2.out",
      force3D: true
    });
    
    // Hold at zoom - ensure scale is locked
    tl.set(element, { scale: 1.6 }, ">");
    tl.to({}, { duration: 0.5 });
    
    // Slide left smoothly like a train - use fromTo to ensure smooth transition
    // Lock scale at 1.6 and only animate x position
    tl.fromTo(element, 
      {
        x: 0,
        scale: 1.6,
        opacity: 1
      },
      {
        duration: 2.2,
        x: "-450%",
        scale: 1.6, // Lock scale - no changes
        opacity: 0,
        ease: "power1.inOut", // Smooth train-like movement
        force3D: true
      }
    );
  };

  // GSAP Animation: Built To Run - Kinetic Reveal (no blur) → Dynamic Word Rotation
  const animateBuiltToRun = () => {
    if (!builtToRunRef.current || !builtToRunStaticRef.current || !builtToRunDynamicRef.current) {
      // Fallback: animate the whole element
      if (builtToRunRef.current) {
        const tl = gsap.timeline();
        gsap.set(builtToRunRef.current, { opacity: 0, y: 30 });
        tl.to(builtToRunRef.current, {
          duration: 1,
          opacity: 1,
          y: 0,
          ease: "power3.out"
        });
      }
      return;
    }
    
    const containerEl = builtToRunRef.current;
    const staticEl = builtToRunStaticRef.current;
    const dynamicEl = builtToRunDynamicRef.current;
    const tl = gsap.timeline();
    
    // Set initial state - smooth centered reveal
    gsap.set(containerEl, { 
      opacity: 0, 
      scale: 1.15,
      y: 25,
      x: 0 // Ensure no horizontal offset
    });
    gsap.set(staticEl, { opacity: 1 });
    gsap.set(dynamicEl, { 
      opacity: 1, 
      textContent: dynamicWords[0], // Set first word
      y: 0
    });
    
    // Smooth kinetic reveal animation (centered, no blur)
    tl.to(containerEl, {
      duration: 0.7,
      opacity: 1,
      scale: 1,
      y: 0,
      x: 0, // Ensure centered
      ease: "power2.out",
      force3D: true
    });
    
    // Hold at normal size
    tl.to({}, { duration: 0.4 });
    
    // Rotate through dynamic words with vertical slide-up effect
    dynamicWords.forEach((word, idx) => {
      if (idx === 0) {
        // Skip first word (already shown)
        return;
      }
      
      const duration = 0.4;
      const pause = 0.6; // Total ~1 second per word change
      
      // Slide current word up and fade out
      tl.to(dynamicEl, {
        duration: duration,
        y: -60,
        opacity: 0,
        ease: "power2.in",
        force3D: true,
        onComplete: () => {
          // Change word when hidden
          dynamicEl.textContent = word;
        }
      });
      
      // Set starting position for new word (below, invisible)
      tl.set(dynamicEl, { 
        y: 60, 
        opacity: 0,
        force3D: true
      });
      
      // Slide new word up into position
      tl.to(dynamicEl, {
        duration: duration,
        y: 0,
        opacity: 1,
        ease: "power2.out",
        force3D: true
      });
      
      // Pause before next word (reduced for faster rotation)
      if (idx < dynamicWords.length - 1) {
        tl.to({}, { duration: pause });
      }
    });
    
    // Final pause after last word (reduced)
    tl.to({}, { duration: 0.6 });
    
    // Fade out entire container together (static + dynamic) smoothly - they disappear as one
    tl.to([containerEl, staticEl, dynamicEl], {
      duration: 0.8,
      opacity: 0,
      ease: "power2.in",
      force3D: true
    });
    
    // Also fade out container with slight scale for smooth exit
    tl.to(containerEl, {
      duration: 0.8,
      scale: 0.95,
      y: -20,
      ease: "power2.in",
      force3D: true
    }, "<"); // Start at same time as opacity fade
  };

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

  // If intro is no longer active (already played this load), render nothing.
  if (!isActive) {
    return null;
  }

  return (
    <header className={`header ${hideHeader ? 'header-hidden' : ''} ${showLagentry ? 'lagentry-fullscreen' : ''}`}>
      <div
        ref={bgRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={`header-background ${showLagentry ? 'gradient-active' : ''} ${showBackground ? 'background-active' : ''}`}
      >
        {/* Cinematic Background Effect */}
        <div className={`cinematic-background ${showBackground ? 'visible' : ''}`}></div>
        
        {/* Word-by-word Text Animation */}
        <div className={`sliding-text ${currentWordIndex >= 0 ? 'visible' : ''} ${currentWordIndex < 0 && showLagentry ? 'hidden' : ''}`}>
          <div className="sliding-text-content">
            {currentWordIndex >= 0 && (
              <>
                {currentWordIndex === 2 ? (
                  // AI Employees - GSAP Typewriter
                  <h2 
                    ref={aiEmployeesRef}
                    key={`phrase-${currentWordIndex}`}
                    className="word-animation phrase-2 gsap-ai-employees"
                    style={{ opacity: 0 }}
                  >
                    AI Employees
                  </h2>
                ) : currentWordIndex === 3 ? (
                  // Built To Run - Static + Rotating Dynamic Word
                  <h2 
                    ref={builtToRunRef}
                    key={`phrase-${currentWordIndex}`}
                    className="word-animation phrase-3 gsap-built-to-run"
                    style={{ opacity: 0 }}
                  >
                    <span 
                      ref={builtToRunStaticRef}
                      className="static-text"
                      style={{ display: 'inline-block', marginRight: '0.15em' }}
                    >
                      Built To Run
                    </span>
                    <span 
                      ref={builtToRunDynamicRef}
                      className="dynamic-text"
                      style={{ display: 'inline-block' }}
                    >
                      {dynamicWords[0]}
                    </span>
                  </h2>
                ) : (
                  // Other phrases - CSS animations
                  <h2 
                    key={`phrase-${currentWordIndex}`} 
                    className={`word-animation phrase-${currentWordIndex} ${
                      currentWordIndex === 0 || currentWordIndex === 1 ? 'typewriter-reveal' :
                      'slide-fade-reveal'
                    }`}
                  >
                    {phrases[currentWordIndex]}
                  </h2>
                )}
              </>
            )}
          </div>
        </div>
        
        {/* Copyright */}
        <div className={`copyright-text ${showCopyright ? 'visible' : ''} ${!showCopyright && showLagentry ? 'hidden' : ''}`}>
          <p>© 2025 Lagentry. All rights reserved.</p>
        </div>
        
        {/* Lagentry Year + Logo */}
        <div className={`background-lagentry-text ${showLagentry ? 'visible' : ''}`}>
          <span className="lagentry-year">2025</span>
          <img src={lagentryImage} alt="LAGENTRY logo" className="lagentry-image" />
        </div>
      </div>
    </header>
  );
};

export default Header;
