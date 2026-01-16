import React, { useEffect, useRef } from 'react';

type Star = {
  x: number;
  y: number;
  radius: number;
  baseAlpha: number;
  twinkleSpeed: number;
  phase: number;
};

interface StarsOverlayProps {
  starCount?: number;
}

const StarsOverlay: React.FC<StarsOverlayProps> = ({ starCount = 140 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const starsRef = useRef<Star[]>([]);
  const rafRef = useRef<number | null>(null);

  const resizeCanvas = (canvas: HTMLCanvasElement) => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const createStars = (width: number, height: number) => {
    const stars: Star[] = [];
    for (let i = 0; i < starCount; i++) {
      const radius = Math.random() < 0.25 ? Math.random() * 1.8 + 0.8 : Math.random() * 0.9 + 0.3;
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius,
        baseAlpha: Math.random() * 0.45 + 0.2,
        twinkleSpeed: Math.random() * 1.2 + 0.4,
        phase: Math.random() * Math.PI * 2,
      });
    }
    starsRef.current = stars;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    resizeCanvas(canvas);
    createStars(window.innerWidth, window.innerHeight);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let start = performance.now();
    const render = (t: number) => {
      const elapsed = (t - start) / 1000;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      // Draw stars
      for (const s of starsRef.current) {
        const alpha = s.baseAlpha * (0.7 + 0.3 * Math.sin(s.phase + elapsed * s.twinkleSpeed));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        // Deeper blue tint instead of white
        ctx.fillStyle = `rgba(100, 140, 255, ${alpha.toFixed(3)})`;
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);

    const onResize = () => {
      resizeCanvas(canvas);
      createStars(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', onResize);
    };
  }, [starCount]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1,
        pointerEvents: 'none',
      }}
    />
  );
};

export default StarsOverlay;


