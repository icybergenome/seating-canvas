import { useState, useEffect } from 'react';

/**
 * Custom hook to detect if the current device is mobile based on screen width
 * @author Bilal S.
 * @param breakpoint - The pixel width to consider as mobile threshold (default: 1024px for lg breakpoint)
 * @returns boolean indicating if the device is mobile
 */
export function useMobileDetection(breakpoint: number = 1024): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    // Initial check
    checkMobile();

    // Add resize listener
    window.addEventListener('resize', checkMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, [breakpoint]);

  return isMobile;
}
