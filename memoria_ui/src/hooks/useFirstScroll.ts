import { useEffect, useRef } from 'react';
import { useGraphStore } from '../store/graphStore';

/**
 * Custom hook to detect scroll interactions and trigger expansion
 * Now allows multiple expansions after collapse
 */
export function useFirstScroll() {
    const isExpanded = useGraphStore((s) => s.isExpanded);
    const setExpanded = useGraphStore((s) => s.setExpanded);
    const setOrbiting = useGraphStore((s) => s.setOrbiting);

    const isHandlingScrollRef = useRef(false);

    useEffect(() => {
        // Only listen for scroll when NOT expanded
        if (isExpanded) return;

        const handleScroll = (e: WheelEvent) => {
            if (isHandlingScrollRef.current || isExpanded) return;

            isHandlingScrollRef.current = true;

            // Trigger decomposition after a brief moment
            setTimeout(() => {
                setExpanded(true);
                // Start orbiting after decomposition animation
                setTimeout(() => {
                    setOrbiting(true);
                    isHandlingScrollRef.current = false;
                }, 1200);
            }, 100);
        };

        window.addEventListener('wheel', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('wheel', handleScroll);
        };
    }, [isExpanded, setExpanded, setOrbiting]);
}
