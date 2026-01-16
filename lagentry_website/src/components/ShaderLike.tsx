import React, { useEffect, useRef } from 'react';

type ShaderLikeProps = {
  size?: number;
};

const ShaderLike: React.FC<ShaderLikeProps> = ({ size = 600 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let start = performance.now();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const render = (t: number) => {
      const elapsed = (t - start) / 1000;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      ctx.clearRect(0, 0, width, height);

      // Animated center position
      const cx = width / 2 + Math.sin(elapsed * 0.6) * (width * 0.06);
      const cy = height / 2 + Math.cos(elapsed * 0.7) * (height * 0.06);

      const radius = Math.max(width, height) * 0.6;
      const gradient = ctx.createRadialGradient(cx, cy, 0, width / 2, height / 2, radius);
      gradient.addColorStop(0, 'rgba(155, 92, 255, 0.75)');
      gradient.addColorStop(0.45, 'rgba(106, 90, 205, 0.55)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0.0)');

      ctx.fillStyle = gradient as unknown as CanvasGradient;
      ctx.fillRect(0, 0, width, height);

      // Soft moving rings
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 3; i++) {
        const phase = elapsed * (0.4 + i * 0.1) + i;
        const ringR = radius * (0.45 + 0.12 * Math.sin(phase));
        const alpha = 0.08 + 0.05 * Math.cos(phase * 1.5);
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, ringR, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(155, 92, 255, ${alpha})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      ctx.globalCompositeOperation = 'source-over';

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div style={{
      width: size,
      height: size,
      maxWidth: '90vw',
      maxHeight: '70vh',
      borderRadius: '24px',
      overflow: 'hidden',
      boxShadow: '0 20px 60px rgba(0,0,0,0.45)'
    }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block', background: '#050507' }} />
    </div>
  );
};

export default ShaderLike;














