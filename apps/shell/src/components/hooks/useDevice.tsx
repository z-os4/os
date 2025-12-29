import * as React from "react"

export type DeviceType = 'mobile' | 'tablet' | 'laptop' | 'desktop';
export type Orientation = 'portrait' | 'landscape';

interface DeviceInfo {
  type: DeviceType;
  orientation: Orientation;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouchDevice: boolean;
  screenWidth: number;
  screenHeight: number;
}

const BREAKPOINTS = {
  mobile: 640,
  tablet: 1025,  // Include 1024px (iPad) as tablet
  laptop: 1440,
  desktop: Infinity,
} as const;

export function useDevice(): DeviceInfo {
  const [device, setDevice] = React.useState<DeviceInfo>(() => getDeviceInfo());

  React.useEffect(() => {
    const handleResize = () => setDevice(getDeviceInfo());
    const handleOrientationChange = () => {
      setTimeout(() => setDevice(getDeviceInfo()), 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);
    setDevice(getDeviceInfo());

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  return device;
}

function getDeviceInfo(): DeviceInfo {
  const width = typeof window !== 'undefined' ? window.innerWidth : 1920;
  const height = typeof window !== 'undefined' ? window.innerHeight : 1080;

  const type = getDeviceType(width);
  const orientation: Orientation = width > height ? 'landscape' : 'portrait';
  const isTouchDevice = typeof window !== 'undefined' && (
    'ontouchstart' in window || navigator.maxTouchPoints > 0
  );

  return {
    type,
    orientation,
    isMobile: type === 'mobile',
    isTablet: type === 'tablet',
    isDesktop: type === 'laptop' || type === 'desktop',
    isTouchDevice,
    screenWidth: width,
    screenHeight: height,
  };
}

function getDeviceType(width: number): DeviceType {
  if (width < BREAKPOINTS.mobile) return 'mobile';
  if (width < BREAKPOINTS.tablet) return 'tablet';
  if (width < BREAKPOINTS.laptop) return 'laptop';
  return 'desktop';
}
