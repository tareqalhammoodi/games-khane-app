import { useEffect, useState } from 'react';

interface UseDeviceOrientationResult {
  isLandscape: boolean;
}

function checkIsLandscape(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const byViewport = window.innerWidth > window.innerHeight;
  const orientationType = window.screen?.orientation?.type;
  const byScreenOrientation =
    typeof orientationType === 'string' && orientationType.toLowerCase().includes('landscape');

  return byViewport || byScreenOrientation;
}

export function useDeviceOrientation(): UseDeviceOrientationResult {
  const [isLandscape, setIsLandscape] = useState(false);

  useEffect(() => {
    const updateOrientation = () => {
      setIsLandscape(checkIsLandscape());
    };

    updateOrientation();

    window.addEventListener('resize', updateOrientation);
    window.addEventListener('orientationchange', updateOrientation);
    window.screen?.orientation?.addEventListener?.('change', updateOrientation);

    return () => {
      window.removeEventListener('resize', updateOrientation);
      window.removeEventListener('orientationchange', updateOrientation);
      window.screen?.orientation?.removeEventListener?.('change', updateOrientation);
    };
  }, []);

  return { isLandscape };
}
