'use client'

import { useState, useEffect } from 'react';

// useDevice is a custom hook that provides device information
// this is dope trust me
export function useDevice() {
    const [device, setDevice] = useState({
        isMobile: false,
        isDesktop: false,
        isTablet: false,
        isTabletPortrait: false,
        isTabletLandscape: false,
        isTouch: false,
        isLandscape: false,
        isMobileLandscape: false,
        isMobilePortrait: false,
        isPcLandscape: false,
        isPcPortrait: false,
    });

    useEffect(() => {
        const checkDevice = () => {
            if (typeof window === 'undefined') return;

            const userAgent = navigator.userAgent;

            // ai generated
            const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
            const tabletRegex = /iPad|Android(?!.*Mobile)|Tablet/i;
            // end

            const isMobileDevice = mobileRegex.test(userAgent) && !tabletRegex.test(userAgent);
            const isTabletDevice = tabletRegex.test(userAgent);

            // ai generated
            const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;
            // end

            const landscape = window.innerWidth > window.innerHeight;
            const isDesktopDevice = !isMobileDevice && !isTabletDevice && !isTouchDevice;

            setDevice({
                isMobile: isMobileDevice,
                isDesktop: isDesktopDevice,
                isTablet: isTabletDevice,
                isTabletPortrait: isTabletDevice && !landscape,
                isTabletLandscape: isTabletDevice && landscape,
                isTouch: isTouchDevice,
                isLandscape: landscape,
                isMobileLandscape: isMobileDevice && landscape,
                isMobilePortrait: isMobileDevice && !landscape,
                isPcLandscape: isDesktopDevice && landscape,
                isPcPortrait: isDesktopDevice && !landscape,
            });
        };

        // imp: else the production will be different
        checkDevice();

        window.addEventListener('resize', checkDevice);
        window.addEventListener('orientationchange', checkDevice);

        return () => {
            window.removeEventListener('resize', checkDevice);
            window.removeEventListener('orientationchange', checkDevice);
        };
    }, []);

    return { device };
}