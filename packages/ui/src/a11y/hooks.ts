/**
 * Accessibility Hooks
 *
 * React hooks for accessibility features including:
 * - useMediaQuery: Generic media query detection
 * - useReducedMotion: Reduced motion preference
 * - useFocusVisible: Focus-visible polyfill
 * - usePrefersColorScheme: Color scheme preference
 * - usePrefersContrast: Contrast preference
 */

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * useMediaQuery Hook
 *
 * Generic hook for detecting media query matches.
 * Supports server-side rendering with optional default value.
 *
 * @example
 * ```tsx
 * const isWide = useMediaQuery('(min-width: 1024px)');
 * const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
 * ```
 */
export function useMediaQuery(query: string, defaultValue = false): boolean {
  const getMatches = useCallback((query: string): boolean => {
    // Server-side rendering
    if (typeof window === 'undefined') {
      return defaultValue;
    }
    return window.matchMedia(query).matches;
  }, [defaultValue]);

  const [matches, setMatches] = useState<boolean>(() => getMatches(query));

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);

    // Set initial value
    setMatches(mediaQuery.matches);

    // Handler for changes
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }

    // Legacy browsers
    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, [query]);

  return matches;
}

/**
 * useReducedMotion Hook
 *
 * Detects if user prefers reduced motion.
 * Use to disable animations and transitions.
 *
 * @example
 * ```tsx
 * const prefersReducedMotion = useReducedMotion();
 *
 * const animationDuration = prefersReducedMotion ? 0 : 300;
 * const transition = prefersReducedMotion ? 'none' : 'all 0.3s ease';
 * ```
 */
export function useReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)', false);
}

/**
 * usePrefersColorScheme Hook
 *
 * Detects user's preferred color scheme.
 *
 * @example
 * ```tsx
 * const colorScheme = usePrefersColorScheme();
 * // Returns 'dark' | 'light' | 'no-preference'
 * ```
 */
export function usePrefersColorScheme(): 'dark' | 'light' | 'no-preference' {
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
  const prefersLight = useMediaQuery('(prefers-color-scheme: light)');

  if (prefersDark) return 'dark';
  if (prefersLight) return 'light';
  return 'no-preference';
}

/**
 * usePrefersContrast Hook
 *
 * Detects user's preferred contrast level.
 *
 * @example
 * ```tsx
 * const contrast = usePrefersContrast();
 * // Returns 'more' | 'less' | 'no-preference' | 'custom'
 * ```
 */
export function usePrefersContrast(): 'more' | 'less' | 'no-preference' | 'custom' {
  const prefersMore = useMediaQuery('(prefers-contrast: more)');
  const prefersLess = useMediaQuery('(prefers-contrast: less)');
  const prefersCustom = useMediaQuery('(prefers-contrast: custom)');

  if (prefersMore) return 'more';
  if (prefersLess) return 'less';
  if (prefersCustom) return 'custom';
  return 'no-preference';
}

/**
 * useFocusVisible Hook
 *
 * Determines if focus should be visible (keyboard navigation).
 * Implements :focus-visible behavior for elements.
 *
 * Returns true when focus should show a visible ring (keyboard nav),
 * false when focus is from mouse/touch interaction.
 *
 * @example
 * ```tsx
 * const { isFocusVisible, focusProps } = useFocusVisible();
 *
 * <button
 *   {...focusProps}
 *   className={cn(
 *     'focus:outline-none',
 *     isFocusVisible && 'ring-2 ring-blue-500'
 *   )}
 * >
 *   Click me
 * </button>
 * ```
 */
export function useFocusVisible(): {
  isFocusVisible: boolean;
  focusProps: {
    onFocus: (e: React.FocusEvent) => void;
    onBlur: (e: React.FocusEvent) => void;
    onMouseDown: (e: React.MouseEvent) => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
  };
} {
  const [isFocusVisible, setIsFocusVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const hadKeyboardEvent = useRef(false);

  // Track whether the most recent interaction was keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only set true for navigation keys
      if (
        e.key === 'Tab' ||
        e.key === 'ArrowUp' ||
        e.key === 'ArrowDown' ||
        e.key === 'ArrowLeft' ||
        e.key === 'ArrowRight' ||
        e.key === 'Enter' ||
        e.key === ' '
      ) {
        hadKeyboardEvent.current = true;
      }
    };

    const handleMouseDown = () => {
      hadKeyboardEvent.current = false;
    };

    const handlePointerDown = () => {
      hadKeyboardEvent.current = false;
    };

    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('mousedown', handleMouseDown, true);
    document.addEventListener('pointerdown', handlePointerDown, true);

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('mousedown', handleMouseDown, true);
      document.removeEventListener('pointerdown', handlePointerDown, true);
    };
  }, []);

  const onFocus = useCallback(() => {
    setIsFocused(true);
    setIsFocusVisible(hadKeyboardEvent.current);
  }, []);

  const onBlur = useCallback(() => {
    setIsFocused(false);
    setIsFocusVisible(false);
  }, []);

  const onMouseDown = useCallback(() => {
    hadKeyboardEvent.current = false;
  }, []);

  const onKeyDown = useCallback(() => {
    hadKeyboardEvent.current = true;
    if (isFocused) {
      setIsFocusVisible(true);
    }
  }, [isFocused]);

  return {
    isFocusVisible,
    focusProps: {
      onFocus,
      onBlur,
      onMouseDown,
      onKeyDown,
    },
  };
}

/**
 * useFocusWithin Hook
 *
 * Tracks whether focus is within a container element.
 *
 * @example
 * ```tsx
 * const { isFocusWithin, focusWithinProps } = useFocusWithin();
 *
 * <div {...focusWithinProps} className={isFocusWithin ? 'ring-2' : ''}>
 *   <input />
 *   <button>Submit</button>
 * </div>
 * ```
 */
export function useFocusWithin(): {
  isFocusWithin: boolean;
  focusWithinProps: {
    onFocus: (e: React.FocusEvent) => void;
    onBlur: (e: React.FocusEvent) => void;
  };
} {
  const [isFocusWithin, setIsFocusWithin] = useState(false);

  const onFocus = useCallback(() => {
    setIsFocusWithin(true);
  }, []);

  const onBlur = useCallback((e: React.FocusEvent) => {
    // Only blur if focus is leaving the container entirely
    const currentTarget = e.currentTarget;
    // Use requestAnimationFrame to check after focus has moved
    requestAnimationFrame(() => {
      if (!currentTarget.contains(document.activeElement)) {
        setIsFocusWithin(false);
      }
    });
  }, []);

  return {
    isFocusWithin,
    focusWithinProps: {
      onFocus,
      onBlur,
    },
  };
}

/**
 * useId Hook
 *
 * Generates stable unique IDs for accessibility attributes.
 * Compatible with React 18's useId but works in React 17+.
 *
 * @example
 * ```tsx
 * const id = useId('input');
 * // Returns 'input-1', 'input-2', etc.
 *
 * <label htmlFor={id}>Name</label>
 * <input id={id} />
 * ```
 */
let idCounter = 0;

export function useId(prefix = 'a11y'): string {
  const [id] = useState(() => `${prefix}-${++idCounter}`);
  return id;
}

/**
 * useScreenReaderAnnouncement Hook
 *
 * Simple hook for one-off announcements without the full LiveRegion setup.
 * Creates a temporary live region, announces, then removes it.
 *
 * @example
 * ```tsx
 * const announce = useScreenReaderAnnouncement();
 *
 * const handleSave = () => {
 *   save();
 *   announce('Document saved');
 * };
 * ```
 */
export function useScreenReaderAnnouncement() {
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    // Create temporary live region
    const region = document.createElement('div');
    region.setAttribute('role', priority === 'assertive' ? 'alert' : 'status');
    region.setAttribute('aria-live', priority);
    region.setAttribute('aria-atomic', 'true');
    Object.assign(region.style, {
      position: 'absolute',
      width: '1px',
      height: '1px',
      padding: '0',
      margin: '-1px',
      overflow: 'hidden',
      clip: 'rect(0, 0, 0, 0)',
      whiteSpace: 'nowrap',
      border: '0',
    });

    document.body.appendChild(region);

    // Delay for screen reader to recognize the region
    requestAnimationFrame(() => {
      region.textContent = message;

      // Remove after announcement
      setTimeout(() => {
        document.body.removeChild(region);
      }, 1000);
    });
  }, []);

  return announce;
}
