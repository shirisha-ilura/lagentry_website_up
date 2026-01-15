import React, { useRef, useEffect } from 'react';
import { useSphereAnimation } from './hooks/useSphereAnimation';

interface SphereColor {
    r: number;
    g: number;
    b: number;
}

interface SphereCanvasProps {
    sphereColor: SphereColor;
    isAnimated?: boolean;
}

const SphereCanvas: React.FC<SphereCanvasProps> = ({ sphereColor, isAnimated = true }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useSphereAnimation(canvasRef, sphereColor, isAnimated);

    return (
        <div className="sphere-container">
            <canvas ref={canvasRef} className="sphere-canvas" />
        </div>
    );
};

export default SphereCanvas;

