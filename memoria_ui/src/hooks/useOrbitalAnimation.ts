import { useEffect, useRef, useState } from 'react';
import type { CategoryNode } from '../types';

interface OrbitalPosition {
    x: number;
    y: number;
}

/**
 * Custom hook for orbital animation mechanics
 * Calculates real-time positions for category nodes orbiting around center
 */
export function useOrbitalAnimation(
    categories: CategoryNode[],
    isOrbiting: boolean,
    isExpanded: boolean
) {
    const [positions, setPositions] = useState<Map<string, OrbitalPosition>>(new Map());
    const animationFrameRef = useRef<number>();
    const timeOffsetRef = useRef<number>(0);

    useEffect(() => {
        if (!isExpanded) {
            // Reset positions when not expanded
            setPositions(new Map());
            timeOffsetRef.current = 0;
            return;
        }

        let lastTime = performance.now();

        const animate = (currentTime: number) => {
            // Only increment time offset when orbiting
            if (isOrbiting) {
                const deltaTime = currentTime - lastTime;
                timeOffsetRef.current += deltaTime;
            }
            lastTime = currentTime;

            const newPositions = new Map<string, OrbitalPosition>();

            categories.forEach((category) => {
                // Calculate current angle based on initial angle + angular velocity * time elapsed
                const angleIncrement = category.angularVelocity * timeOffsetRef.current;
                const currentAngle = category.angle + angleIncrement;

                // Convert to radians
                const radians = (currentAngle * Math.PI) / 180;

                // Calculate x, y position (standard circular motion)
                const x = Math.cos(radians) * category.radius;
                const y = Math.sin(radians) * category.radius;

                newPositions.set(category.id, { x, y });
            });

            setPositions(newPositions);
            animationFrameRef.current = requestAnimationFrame(animate);
        };

        animationFrameRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [categories, isOrbiting, isExpanded]);

    return positions;
}
