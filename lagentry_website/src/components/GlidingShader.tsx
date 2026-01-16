import React, { useEffect, useState } from 'react';
import { ShaderCanvas } from './ShaderCanvas';

interface GlidingShaderProps {
  isVisible?: boolean;
}

export const GlidingShader: React.FC<GlidingShaderProps> = ({ isVisible = true }) => {
  const [position, setPosition] = useState({ x: 300, y: 200 }); // Start in center
  const [shaderId, setShaderId] = useState(1);

  useEffect(() => {
    if (!isVisible) return;

    // Start the gliding animation after a delay
    const startDelay = setTimeout(() => {
      // Animate the shader within the container
      const animateShader = () => {
        const containerWidth = 600; // Approximate container width
        const containerHeight = 400; // Approximate container height
        const duration = 8000; // 8 seconds for smooth movement
        const startTime = Date.now();

        const animate = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          // Smooth easing function
          const easeInOut = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
          const easedProgress = easeInOut(progress);
          
          // Create a figure-8 or orbital motion within the container
          const angle = easedProgress * Math.PI * 4; // Multiple rotations
          const centerX = containerWidth / 2;
          const centerY = containerHeight / 2;
          const radiusX = containerWidth * 0.3;
          const radiusY = containerHeight * 0.25;
          
          const currentX = centerX + Math.cos(angle) * radiusX;
          const currentY = centerY + Math.sin(angle * 0.5) * radiusY; // Different frequency for figure-8
          
          setPosition({ x: currentX, y: currentY });

          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            // Reset and change shader for next cycle
            setTimeout(() => {
              setShaderId(prev => prev === 1 ? 2 : 1);
              animateShader(); // Start next cycle
            }, 2000); // 2 second pause between cycles
          }
        };

        animate();
      };

      animateShader();
    }, 500); // Start after 0.5 seconds

    return () => clearTimeout(startDelay);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      className="shader-reminder-gliding"
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -50%)',
        transition: 'none', // We handle animation manually
        zIndex: 10,
        pointerEvents: 'none'
      }}
    >
      <ShaderCanvas
        size={150}
        shaderId={shaderId}
        className="opacity-100"
        style={{
          filter: 'blur(0px)',
          boxShadow: '0 0 30px rgba(139, 92, 246, 0.6)'
        }}
      />
    </div>
  );
};
