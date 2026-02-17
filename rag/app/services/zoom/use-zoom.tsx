'use client'

import { useState, useEffect } from 'react';

// useZoomLevel is a custom hook that provides zoom level functionality
// this basically focuses on browser zoom level
export function useZoomLevel() {
    const [zoom, setZoom] = useState(1);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const updateZoom = () => {
            setZoom(window.devicePixelRatio ?? 1);
        };

        // imp: else the production will be different
        updateZoom();

        window.addEventListener('resize', updateZoom);

        const mediaQuery = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
        const handleChange = () => updateZoom();

        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', handleChange);
        }

        return () => {
            window.removeEventListener('resize', updateZoom);
            if (mediaQuery.removeEventListener) {
                mediaQuery.removeEventListener('change', handleChange);
            }
        };
    }, []);

    return { zoom };
}