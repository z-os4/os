/**
 * AccessibilityProvider Component
 *
 * Global accessibility context provider that combines all a11y features:
 * - Reduced motion preference
 * - High contrast mode detection
 * - Screen reader detection (heuristic)
 * - Color scheme preference
 * - Global announcement system
 *
 * @example
 * ```tsx
 * // At app root
 * <AccessibilityProvider>
 *   <App />
 * </AccessibilityProvider>
 *
 * // In components
 * const { prefersReducedMotion, announce, prefersHighContrast } = useAccessibility();
 *
 * // Respect motion preferences
 * const animation = prefersReducedMotion ? 'none' : 'slide';
 *
 * // Announce actions
 * const handleSave = () => {
 *   save();
 *   announce('Document saved');
 * };
 * ```
 */

import React, { createContext, useContext, useMemo, useCallback, useEffect, useState } from 'react';
import type { AccessibilityContextValue, AnnouncementPriority } from './types';
import { useReducedMotion, useMediaQuery, usePrefersColorScheme } from './hooks';
import { LiveRegionProvider, useAnnounce } from './LiveRegion';

const AccessibilityContext = createContext<AccessibilityContextValue | null>(null);

export interface AccessibilityProviderProps {
  children: React.ReactNode;
  /** Force reduced motion preference */
  forceReducedMotion?: boolean;
  /** Force high contrast mode */
  forceHighContrast?: boolean;
  /** Debounce delay for announcements */
  announceDebounce?: number;
}

/**
 * Heuristic detection of screen reader activity.
 * Not reliable but provides useful hints.
 */
function useScreenReaderDetection(): boolean {
  const [detected, setDetected] = useState(false);

  useEffect(() => {
    // Check for common screen reader indicators
    const indicators = [
      // NVDA
      () => typeof (window as any).speechSynthesis !== 'undefined',
      // General accessibility API
      () => (navigator as any).accessibilityEnabled === true,
      // Reduced motion often indicates assistive tech
      () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    ];

    const hasIndicator = indicators.some((check) => {
      try {
        return check();
      } catch {
        return false;
      }
    });

    setDetected(hasIndicator);
  }, []);

  return detected;
}

/**
 * Inner provider that has access to LiveRegion context
 */
const AccessibilityProviderInner: React.FC<{
  children: React.ReactNode;
  forceReducedMotion?: boolean;
  forceHighContrast?: boolean;
}> = ({ children, forceReducedMotion, forceHighContrast }) => {
  const systemReducedMotion = useReducedMotion();
  const systemHighContrast = useMediaQuery('(prefers-contrast: more)');
  const colorScheme = usePrefersColorScheme();
  const screenReaderActive = useScreenReaderDetection();
  const { announce: liveAnnounce, clearAnnouncements } = useAnnounce();

  const prefersReducedMotion = forceReducedMotion ?? systemReducedMotion;
  const prefersHighContrast = forceHighContrast ?? systemHighContrast;
  const prefersDarkColorScheme = colorScheme === 'dark';

  // Enhanced announce with logging in development
  const announce = useCallback(
    (message: string, priority: AnnouncementPriority = 'polite') => {
      liveAnnounce(message, priority);
    },
    [liveAnnounce]
  );

  const value = useMemo<AccessibilityContextValue>(
    () => ({
      prefersReducedMotion,
      prefersHighContrast,
      screenReaderActive,
      prefersDarkColorScheme,
      announce,
      clearAnnouncements,
    }),
    [
      prefersReducedMotion,
      prefersHighContrast,
      screenReaderActive,
      prefersDarkColorScheme,
      announce,
      clearAnnouncements,
    ]
  );

  // Apply body classes for CSS hooks
  useEffect(() => {
    const body = document.body;

    if (prefersReducedMotion) {
      body.classList.add('reduce-motion');
    } else {
      body.classList.remove('reduce-motion');
    }

    if (prefersHighContrast) {
      body.classList.add('high-contrast');
    } else {
      body.classList.remove('high-contrast');
    }

    return () => {
      body.classList.remove('reduce-motion', 'high-contrast');
    };
  }, [prefersReducedMotion, prefersHighContrast]);

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
};

/**
 * Main AccessibilityProvider
 */
export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({
  children,
  forceReducedMotion,
  forceHighContrast,
  announceDebounce = 150,
}) => {
  return (
    <LiveRegionProvider debounceDelay={announceDebounce}>
      <AccessibilityProviderInner
        forceReducedMotion={forceReducedMotion}
        forceHighContrast={forceHighContrast}
      >
        {children}
      </AccessibilityProviderInner>
    </LiveRegionProvider>
  );
};

AccessibilityProvider.displayName = 'AccessibilityProvider';

/**
 * useAccessibility Hook
 *
 * Access global accessibility preferences and utilities.
 *
 * @example
 * ```tsx
 * const {
 *   prefersReducedMotion,
 *   prefersHighContrast,
 *   screenReaderActive,
 *   prefersDarkColorScheme,
 *   announce,
 * } = useAccessibility();
 *
 * // Use in animations
 * const transition = prefersReducedMotion
 *   ? { duration: 0 }
 *   : { duration: 0.3, ease: 'easeOut' };
 *
 * // Announce state changes
 * useEffect(() => {
 *   if (isLoading) {
 *     announce('Loading content...');
 *   } else {
 *     announce('Content loaded');
 *   }
 * }, [isLoading, announce]);
 * ```
 */
export function useAccessibility(): AccessibilityContextValue {
  const context = useContext(AccessibilityContext);

  if (!context) {
    // Return sensible defaults when provider is missing
    console.warn('[useAccessibility] AccessibilityProvider not found. Using defaults.');
    return {
      prefersReducedMotion: false,
      prefersHighContrast: false,
      screenReaderActive: false,
      prefersDarkColorScheme: false,
      announce: (message: string) => {
        console.log(`[a11y] Announce (no provider): ${message}`);
      },
      clearAnnouncements: () => {},
    };
  }

  return context;
}

/**
 * withAccessibility HOC
 *
 * Wraps a component to inject accessibility props.
 *
 * @example
 * ```tsx
 * interface ButtonProps {
 *   onClick: () => void;
 *   reducedMotion?: boolean;
 * }
 *
 * const Button = withAccessibility<ButtonProps>(({ onClick, reducedMotion }) => (
 *   <button
 *     onClick={onClick}
 *     style={{ transition: reducedMotion ? 'none' : 'all 0.2s' }}
 *   >
 *     Click
 *   </button>
 * ));
 * ```
 */
export function withAccessibility<P extends object>(
  Component: React.ComponentType<P & { a11y: AccessibilityContextValue }>
): React.FC<Omit<P, 'a11y'>> {
  const WrappedComponent: React.FC<Omit<P, 'a11y'>> = (props) => {
    const a11y = useAccessibility();
    return <Component {...(props as P)} a11y={a11y} />;
  };

  WrappedComponent.displayName = `withAccessibility(${Component.displayName || Component.name || 'Component'})`;

  return WrappedComponent;
}
