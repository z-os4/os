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

// Breakpoints aligned with common device sizes
// Mobile: iPhone, small Android (up to 767px)
// Tablet: iPad Mini, iPad, Android tablets (768px - 1023px)
// Laptop: MacBook Air, most laptops (1024px - 1439px)
// Desktop: Large monitors (1440px+)
const BREAKPOINTS = {
  mobile: 768,   // < 768 = mobile (includes iPhone Plus at 414px)
  tablet: 1024,  // < 1024 = tablet (iPad portrait is 768px, landscape 1024px)
  laptop: 1440,  // < 1440 = laptop
  desktop: Infinity,
} as const;

// Check if user prefers mobile view (for testing/debugging)
function getForceMode(): DeviceType | null {
  if (typeof window === 'undefined') return null;
  const urlParams = new URLSearchParams(window.location.search);
  const forceMode = urlParams.get('device');
  if (forceMode && ['mobile', 'tablet', 'laptop', 'desktop'].includes(forceMode)) {
    return forceMode as DeviceType;
  }
  return null;
}

export function useDevice(): DeviceInfo {
  const [device, setDevice] = React.useState<DeviceInfo>(() => getDeviceInfo());

  React.useEffect(() => {
    const handleResize = () => setDevice(getDeviceInfo());
    const handleOrientationChange = () => {
      // Delay to allow viewport to update after orientation change
      setTimeout(() => setDevice(getDeviceInfo()), 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);
    
    // Re-calculate on mount to ensure SSR mismatch is resolved
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

  // Check for forced device mode (debugging)
  const forcedMode = getForceMode();
  const type = forcedMode || getDeviceType(width);
  
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

// Hook to check if we should show mobile UI
// Returns true for both mobile AND tablet (iOS-style UI)
export function useMobileUI(): boolean {
  const { isMobile, isTablet } = useDevice();
  return isMobile || isTablet;
}
