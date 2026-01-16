import { useEffect, useRef } from 'react';

// Color definitions for different agents
export const agentColors = {
    pink: { r: 236, g: 72, b: 153 },   // Lead Qualification
    green: { r: 16, g: 185, b: 129 },  // Customer Support
    purple: { r: 168, g: 85, b: 247 }    // Real Estate (Ahmed)
};

interface SphereColor {
    r: number;
    g: number;
    b: number;
}

interface Point {
    x: number;
    y: number;
    z: number;
    originalX: number;
    originalY: number;
    originalZ: number;
    theta: number;
    phi: number;
    baseRadius: number;
}

export function useSphereAnimation(canvasRef: React.RefObject<HTMLCanvasElement>, sphereColor: SphereColor, isAnimated: boolean = true) {
    const animationFrameRef = useRef<number>();
    const timeRef = useRef(0);
    const pointsRef = useRef<Point[]>([]);
    const baseRadiusRef = useRef(0);
    const transitionProgressRef = useRef(0);
    const isTransitioningRef = useRef(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d', { 
            alpha: true,
            desynchronized: false,
            willReadFrequently: false
        });
        if (!ctx) return;
        
        // Improve rendering quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        const container = canvas.parentElement;
        if (!container) return;
        
        const size = Math.min(container.offsetWidth, container.offsetHeight);
        const dpr = window.devicePixelRatio || 1;
        canvas.width = size * dpr;
        canvas.height = size * dpr;
        canvas.style.width = size + 'px';
        canvas.style.height = size + 'px';
        ctx.scale(dpr, dpr);

        const baseRadius = size * 0.35;
        baseRadiusRef.current = baseRadius;
        const centerX = size / 2;
        const centerY = size / 2;
        const numPoints = 6000;
        const points: Point[] = [];

        // Generate points on sphere surface
        for (let i = 0; i < numPoints; i++) {
            const u = Math.random();
            const v = Math.random();
            const theta = 2 * Math.PI * u;
            const phi = Math.acos(2 * v - 1);

            const x = baseRadius * Math.sin(phi) * Math.cos(theta);
            const y = baseRadius * Math.sin(phi) * Math.sin(theta);
            const z = baseRadius * Math.cos(phi);

            points.push({
                x, y, z,
                originalX: x, originalY: y, originalZ: z,
                theta, phi,
                baseRadius: baseRadius
            });
        }

        pointsRef.current = points;

        // Rotation matrices
        function rotateX(point: { x: number; y: number; z: number }, angle: number) {
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            const y = point.y * cos - point.z * sin;
            const z = point.y * sin + point.z * cos;
            return { ...point, y, z };
        }

        function rotateY(point: { x: number; y: number; z: number }, angle: number) {
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            const x = point.x * cos + point.z * sin;
            const z = -point.x * sin + point.z * cos;
            return { ...point, x, z };
        }

        function rotateZ(point: { x: number; y: number; z: number }, angle: number) {
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            const x = point.x * cos - point.y * sin;
            const y = point.x * sin + point.y * cos;
            return { ...point, x, y };
        }

        // Draw static dotted circle
        function drawStatic() {
            if (!ctx || !canvas) return;
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            const baseRadius = baseRadiusRef.current;
            const points = pointsRef.current;
            
            // Draw static points arranged in a perfect sphere shape
            points.forEach(point => {
                // Use original position without any distortion or animation
                const x = centerX + point.originalX;
                const y = centerY + point.originalY;
                
                // Simple point size
                const pointSize = 2;
                
                // Opacity based on depth (z position)
                const normalizedZ = (point.originalZ + baseRadius) / (baseRadius * 2);
                const opacity = 0.4 + normalizedZ * 0.6;
                
                ctx.fillStyle = `rgba(${sphereColor.r}, ${sphereColor.g}, ${sphereColor.b}, ${opacity})`;
                
                ctx.beginPath();
                ctx.arc(x, y, pointSize, 0, Math.PI * 2);
                ctx.fill();
            });
        }

        // Redraw static when color or animation state changes
        if (!isAnimated) {
            drawStatic();
        }

        // Draw animated blob with smooth transition
        function drawAnimated() {
            if (!ctx || !canvas) return;
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            timeRef.current += 0.02;

            // Handle transition from static to animated (smooth transition over ~2 seconds)
            const transitionSpeed = 0.015; // Slower for smoother transition
            if (isAnimated && transitionProgressRef.current < 1) {
                transitionProgressRef.current = Math.min(1, transitionProgressRef.current + transitionSpeed);
                isTransitioningRef.current = true;
            } else if (!isAnimated && transitionProgressRef.current > 0) {
                transitionProgressRef.current = Math.max(0, transitionProgressRef.current - transitionSpeed);
                isTransitioningRef.current = true;
            } else {
                isTransitioningRef.current = false;
            }

            const time = timeRef.current;
            const baseRadius = baseRadiusRef.current;
            const transitionProgress = transitionProgressRef.current;

            // Easing function for smooth transition (ease-in-out cubic for smoother feel)
            const easeInOutCubic = (t: number) => {
                return t < 0.5 
                    ? 4 * t * t * t 
                    : 1 - Math.pow(-2 * t + 2, 3) / 2;
            };
            const easedProgress = easeInOutCubic(transitionProgress);

            // Only apply rotation when fully animated (no rotation during transition)
            // Use a threshold to ensure smooth transition without rotation
            const isFullyAnimated = easedProgress > 0.99;
            const rotationX = isFullyAnimated ? Math.sin(time * 1.0) * 0.5 : 0;
            const rotationY = isFullyAnimated ? time * 0.75 : 0;
            const rotationZ = isFullyAnimated ? Math.cos(time * 0.9) * 0.3 : 0;

            // Global pulsing effect (balanced) - scaled by transition progress
            const pulse = 1 + Math.sin(time * 1.6) * 0.08 * easedProgress;

            // Transform points
            const points = pointsRef.current;
            const transformedPoints = points.map((point: Point) => {
                // Wave frequencies (balanced) - scaled by transition progress
                const wave1 = Math.sin(time * 5.5 + point.theta * 3) * 0.2 * easedProgress;
                const wave2 = Math.cos(time * 4.5 + point.phi * 2) * 0.15 * easedProgress;
                const wave3 = Math.sin(time * 6.5 + point.theta * 4 + point.phi * 2) * 0.12 * easedProgress;

                const waveDistortion = (wave1 * 0.4 + wave2 * 0.35 + wave3 * 0.25);
                const noise = Math.sin(time * 3.2 + point.theta * 5 + point.phi * 4) * 0.08 * easedProgress;
                const distortion = waveDistortion + noise;
                const currentRadius = point.baseRadius * (1 + pulse * easedProgress - 1) * (1 + distortion);

                // Position offsets (balanced) - scaled by transition progress
                const offsetX = Math.sin(time * 2.0 + point.phi) * 0.05 * easedProgress;
                const offsetY = Math.cos(time * 2.2 + point.theta) * 0.05 * easedProgress;
                const offsetZ = Math.sin(time * 1.9 + point.phi + point.theta) * 0.05 * easedProgress;

                // Interpolate between static and animated positions (soft morphing without rotation)
                const staticX = point.originalX;
                const staticY = point.originalY;
                const staticZ = point.originalZ;

                // Calculate animated position with wave distortions but no rotation during transition
                let animatedX = currentRadius * Math.sin(point.phi) * Math.cos(point.theta) + offsetX * point.baseRadius;
                let animatedY = currentRadius * Math.sin(point.phi) * Math.sin(point.theta) + offsetY * point.baseRadius;
                let animatedZ = currentRadius * Math.cos(point.phi) + offsetZ * point.baseRadius;

                // Only apply rotations when fully animated (no rotation during transition)
                let pAnimated = { x: animatedX, y: animatedY, z: animatedZ };
                if (isFullyAnimated) {
                    pAnimated = rotateX(pAnimated, rotationX);
                    pAnimated = rotateY(pAnimated, rotationY);
                    pAnimated = rotateZ(pAnimated, rotationZ);
                }

                // Smooth interpolation between static and animated (soft morphing)
                let p = {
                    x: staticX + (pAnimated.x - staticX) * easedProgress,
                    y: staticY + (pAnimated.y - staticY) * easedProgress,
                    z: staticZ + (pAnimated.z - staticZ) * easedProgress,
                    theta: point.theta,
                    phi: point.phi
                };

                return p;
            });

            // Sort by z-depth
            transformedPoints.sort((a, b) => b.z - a.z);

            // Draw points
            transformedPoints.forEach((point) => {
                const perspective = 400;
                const scale = perspective / (perspective + point.z);

                const x = centerX + point.x * scale;
                const y = centerY + point.y * scale;

                const distance = Math.sqrt(point.x * point.x + point.y * point.y + point.z * point.z);
                const normalizedZ = (point.z + baseRadius) / (baseRadius * 2);

                const sizeVariation = 1 + Math.sin(time * 3.2 + point.theta * 2) * 0.15 * easedProgress;
                const pointSize = 2 * scale * (0.8 + normalizedZ * 0.4) * (1 + (sizeVariation - 1) * easedProgress);

                const depthOpacity = 0.4 + normalizedZ * 0.6;
                const distanceOpacity = Math.min(1, 1 - (distance - baseRadius * 0.7) / (baseRadius * 0.5));
                const blobOpacity = 1 + Math.sin(time * 2.7 + point.phi) * 0.1 * easedProgress;
                const opacity = Math.max(0.3, Math.min(1, depthOpacity * distanceOpacity * blobOpacity));

                ctx.fillStyle = `rgba(${sphereColor.r}, ${sphereColor.g}, ${sphereColor.b}, ${opacity})`;

                ctx.beginPath();
                ctx.arc(x, y, pointSize, 0, Math.PI * 2);
                ctx.fill();
            });

            animationFrameRef.current = requestAnimationFrame(drawAnimated);
        }

        // Handle resize
        const handleResize = () => {
            if (!canvas) return;
            const container = canvas.parentElement;
            if (!container) return;
            
            const size = Math.min(container.offsetWidth, container.offsetHeight);
            const dpr = window.devicePixelRatio || 1;
            canvas.width = size * dpr;
            canvas.height = size * dpr;
            canvas.style.width = size + 'px';
            canvas.style.height = size + 'px';
            if (ctx) {
                ctx.scale(dpr, dpr);
            }

            const newBaseRadius = size * 0.35;
            baseRadiusRef.current = newBaseRadius;

            pointsRef.current.forEach((point: Point) => {
                point.baseRadius = newBaseRadius;
                point.x = newBaseRadius * Math.sin(point.phi) * Math.cos(point.theta);
                point.y = newBaseRadius * Math.sin(point.phi) * Math.sin(point.theta);
                point.z = newBaseRadius * Math.cos(point.phi);
                point.originalX = point.x;
                point.originalY = point.y;
                point.originalZ = point.z;
            });

            // Redraw static if not animated
            if (!isAnimated) {
                drawStatic();
            }
        };

        window.addEventListener('resize', handleResize);

        // Draw based on animation state - always use drawAnimated for smooth transition
        // drawAnimated handles both static (when transitionProgress = 0) and animated states
        drawAnimated();

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            window.removeEventListener('resize', handleResize);
        };
    }, [canvasRef, sphereColor, isAnimated]);

    // Redraw static dotted circle when color changes and not animated
    useEffect(() => {
        if (!isAnimated && canvasRef.current && pointsRef.current.length > 0) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            
            const container = canvas.parentElement;
            if (!container) return;
            const size = Math.min(container.offsetWidth, container.offsetHeight);
            
            const baseRadius = baseRadiusRef.current;
            const centerX = size / 2;
            const centerY = size / 2;
            const points = pointsRef.current;
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw static points
            points.forEach((point: Point) => {
                const x = centerX + point.originalX;
                const y = centerY + point.originalY;
                
                const pointSize = 2;
                const normalizedZ = (point.originalZ + baseRadius) / (baseRadius * 2);
                const opacity = 0.4 + normalizedZ * 0.6;
                
                ctx.fillStyle = `rgba(${sphereColor.r}, ${sphereColor.g}, ${sphereColor.b}, ${opacity})`;
                
                ctx.beginPath();
                ctx.arc(x, y, pointSize, 0, Math.PI * 2);
                ctx.fill();
            });
        }
    }, [canvasRef, sphereColor, isAnimated]);
}

