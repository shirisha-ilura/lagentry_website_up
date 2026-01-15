import React, { useState, useEffect, useRef, useCallback } from 'react';

interface Member {
  name: string;
  role: string;
  image: string;
  bio: string;
  ig: string;
  tw: string;
}

interface CarouselProps {
  members: Member[];
}

const Carousel: React.FC<CarouselProps> = ({ members }) => {
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const orbitRef = useRef<HTMLDivElement>(null);
  const thumbRefs = useRef<HTMLDivElement[]>([]);
  const autoPlayIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const positionThumbs = useCallback(() => {
    if (!orbitRef.current || members.length === 0) return;

    const rect = orbitRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const count = members.length;

    if (count === 0 || count === 1) return;

    const thumbWidth = thumbRefs.current[0]?.offsetWidth || 110;
    const spacing = 15;
    const totalWidth = count * (thumbWidth + spacing);
    const curveDepth = 80;
    const curveSpread = Math.min(rect.width * 0.9, totalWidth);

    thumbRefs.current.forEach((el, i) => {
      if (!el) return;
      
      const originalIndex = parseInt(el.getAttribute('data-index') || '0');
      const set = parseInt(el.getAttribute('data-set') || '1');
      const setOffset = set - 1;
      const totalOffset = (setOffset * count + originalIndex - current) * (thumbWidth + spacing);
      const x = centerX + totalOffset;
      const xFromCenter = x - centerX;
      const normalizedX = xFromCenter / (curveSpread / 2);
      const curveOffset = curveDepth * (normalizedX * normalizedX);
      const y = centerY + curveOffset;

      const isCurrent = (set === 1 && originalIndex === current);
      const scale = isCurrent ? 1.3 : 0.9;
      const opacity = isCurrent ? 1 : 0.7;
      let rotation = 0;
      if (!isCurrent) {
        const tiltAmount = originalIndex % 2 === 0 ? 8 : -8;
        rotation = tiltAmount;
      }

      if (!isTransitioning) {
        el.style.transition = 'all .6s cubic-bezier(.34, 1.56, .64, 1)';
      } else {
        el.style.transition = 'none';
      }

      el.style.left = `${x - el.offsetWidth / 2}px`;
      el.style.top = `${y - el.offsetHeight / 2}px`;
      el.style.display = '';
      el.style.opacity = opacity.toString();
      el.style.pointerEvents = 'auto';
      el.style.transform = `scale(${scale}) rotate(${rotation}deg)`;
      el.style.zIndex = isCurrent ? '200' : '100';

      if (isCurrent) {
        el.classList.remove('thumb--faded');
      } else {
        el.classList.add('thumb--faded');
      }
    });
  }, [current, members.length, isTransitioning]);

  const goNext = useCallback(() => {
    if (members.length <= 1) return;
    setCurrent((prev) => (prev + 1) % members.length);
  }, [members.length]);

  const goPrev = useCallback(() => {
    if (members.length <= 1) return;
    setCurrent((prev) => (prev - 1 + members.length) % members.length);
  }, [members.length]);

  const startAutoPlay = useCallback(() => {
    if (members.length <= 1) return;
    stopAutoPlay();
    autoPlayIntervalRef.current = setInterval(() => {
      goNext();
    }, 3000);
  }, [members.length, goNext]);

  const stopAutoPlay = useCallback(() => {
    if (autoPlayIntervalRef.current) {
      clearInterval(autoPlayIntervalRef.current);
      autoPlayIntervalRef.current = null;
    }
  }, []);

  // Initialize thumbnails
  useEffect(() => {
    if (!orbitRef.current) return;

    const sets = 3;
    thumbRefs.current = [];
    orbitRef.current.innerHTML = '';

    for (let set = 0; set < sets; set++) {
      members.forEach((m, i) => {
        const el = document.createElement('div');
        el.className = 'thumb thumb--faded';
        el.setAttribute('data-index', i.toString());
        el.setAttribute('data-set', set.toString());
        const img = document.createElement('img');
        img.src = m.image;
        img.alt = m.name;
        el.appendChild(img);
        el.onclick = () => {
          if (i !== current && !isTransitioning) {
            setCurrent(i);
          }
        };
        orbitRef.current?.appendChild(el);
        thumbRefs.current.push(el as unknown as HTMLDivElement);
      });
    }

    // Position after a short delay to ensure DOM is ready
    setTimeout(() => {
      positionThumbs();
    }, 10);
    startAutoPlay();

    return () => {
      stopAutoPlay();
    };
  }, [members.length, startAutoPlay, stopAutoPlay]);

  // Update positions when current changes
  useEffect(() => {
    const timer = setTimeout(() => {
      positionThumbs();
    }, 10);
    return () => clearTimeout(timer);
  }, [current, positionThumbs]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      positionThumbs();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [positionThumbs]);

  const currentMember = members[current] || members[0];

  return (
    <>
      <div className="carousel">
        <button 
          className="nav nav--prev" 
          aria-label="Previous"
          onClick={goPrev}
          style={{ display: members.length <= 1 ? 'none' : '' }}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>

        <div 
          className="orbit" 
          aria-hidden="true"
          ref={orbitRef}
          onMouseEnter={stopAutoPlay}
          onMouseLeave={startAutoPlay}
        ></div>

        <button 
          className="nav nav--next" 
          aria-label="Next"
          onClick={goNext}
          style={{ display: members.length <= 1 ? 'none' : '' }}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>

      <div className="meta active">
        <div className="name fade-in">{currentMember.name}</div>
        <div className="role fade-in">{currentMember.role}</div>
        <p className="bio fade-in">{currentMember.bio}</p>
        <button className="cta">Explore Agent</button>
      </div>
    </>
  );
};

export default Carousel;

