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
  safeAreaInsets: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

// Breakpoints matching common devices
const BREAKPOINTS = {
  mobile: 640,    // < 640px = phone
  tablet: 1024,   // 640-1024px = tablet
  laptop: 1440,   // 1024-1440px = laptop
  desktop: Infinity, // > 1440px = desktop
} as const;

export function useDevice(): DeviceInfo {
  const [device, setDevice] = React.useState<DeviceInfo>(() => getDeviceInfo());

  React.useEffect(() => {
    const handleResize = () => {
      setDevice(getDeviceInfo());
    };

    const handleOrientationChange = () => {
      // Small delay to let the viewport settle
      setTimeout(() => setDevice(getDeviceInfo()), 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    // Initial check
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
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0
  );

  // Safe area insets for notched devices
  const safeAreaInsets = getSafeAreaInsets();

  return {
    type,
    orientation,
    isMobile: type === 'mobile',
    isTablet: type === 'tablet',
    isDesktop: type === 'laptop' || type === 'desktop',
    isTouchDevice,
    screenWidth: width,
    screenHeight: height,
    safeAreaInsets,
  };
}

function getDeviceType(width: number): DeviceType {
  if (width < BREAKPOINTS.mobile) return 'mobile';
  if (width < BREAKPOINTS.tablet) return 'tablet';
  if (width < BREAKPOINTS.laptop) return 'laptop';
  return 'desktop';
}

function getSafeAreaInsets() {
  if (typeof window === 'undefined' || !window.CSS?.supports) {
    return { top: 0, bottom: 0, left: 0, right: 0 };
  }

  // Try to get CSS env() values for safe areas
  const computedStyle = getComputedStyle(document.documentElement);

  return {
    top: parseInt(computedStyle.getPropertyValue('--sat') || '0') || 0,
    bottom: parseInt(computedStyle.getPropertyValue('--sab') || '0') || 0,
    left: parseInt(computedStyle.getPropertyValue('--sal') || '0') || 0,
    right: parseInt(computedStyle.getPropertyValue('--sar') || '0') || 0,
  };
}

// Hook for responsive conditional rendering
export function useResponsive<T>(config: {
  mobile?: T;
  tablet?: T;
  laptop?: T;
  desktop?: T;
  default: T;
}): T {
  const { type } = useDevice();

  return config[type] ?? config.default;
}

// CSS class helper
export function getResponsiveClasses(device: DeviceInfo): string {
  const classes = [
    `device-${device.type}`,
    `orientation-${device.orientation}`,
    device.isTouchDevice ? 'touch' : 'no-touch',
  ];

  return classes.join(' ');
}
