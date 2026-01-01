/**
 * Accessibility Types
 *
 * Type definitions for zOS accessibility utilities.
 * Follows WCAG 2.1 AA guidelines.
 */

/** Priority levels for screen reader announcements */
export type AnnouncementPriority = 'polite' | 'assertive';

/** Keyboard navigation direction */
export type NavigationDirection = 'horizontal' | 'vertical' | 'both' | 'grid';

/** Focus trap options */
export interface FocusTrapOptions {
  /** Element to focus when trap activates. Defaults to first focusable. */
  initialFocus?: HTMLElement | null;
  /** Element to return focus to when trap deactivates */
  returnFocus?: HTMLElement | null;
  /** Whether to contain focus within the trap */
  contain?: boolean;
  /** Elements that should be excluded from the trap */
  excludeRefs?: React.RefObject<HTMLElement>[];
}

/** Focus scope options */
export interface FocusScopeOptions {
  /** Auto-focus first element on mount */
  autoFocus?: boolean;
  /** Restore focus to previous element on unmount */
  restoreFocus?: boolean;
  /** Whether this scope contains focus */
  contain?: boolean;
}

/** Keyboard navigation options */
export interface KeyboardNavOptions {
  /** Navigation direction */
  direction?: NavigationDirection;
  /** Selector for navigable items */
  selector?: string;
  /** Whether to loop at boundaries */
  loop?: boolean;
  /** Current focused index */
  initialIndex?: number;
  /** Called when index changes */
  onIndexChange?: (index: number) => void;
  /** Called when item is selected (Enter/Space) */
  onSelect?: (index: number, element: HTMLElement) => void;
}

/** Accessibility preferences */
export interface AccessibilityPreferences {
  /** User prefers reduced motion */
  prefersReducedMotion: boolean;
  /** User prefers high contrast */
  prefersHighContrast: boolean;
  /** User is using a screen reader (heuristic) */
  screenReaderActive: boolean;
  /** User prefers dark color scheme */
  prefersDarkColorScheme: boolean;
}

/** Accessibility context value */
export interface AccessibilityContextValue extends AccessibilityPreferences {
  /** Announce message to screen readers */
  announce: (message: string, priority?: AnnouncementPriority) => void;
  /** Clear all announcements */
  clearAnnouncements: () => void;
}

/** Focusable element query selectors */
export const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
  'audio[controls]',
  'video[controls]',
  'details > summary:first-of-type',
].join(', ');

/** Tabbable element query selectors (subset of focusable) */
export const TABBABLE_SELECTORS = [
  'a[href]:not([tabindex="-1"])',
  'button:not([disabled]):not([tabindex="-1"])',
  'input:not([disabled]):not([tabindex="-1"])',
  'select:not([disabled]):not([tabindex="-1"])',
  'textarea:not([disabled]):not([tabindex="-1"])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]:not([tabindex="-1"])',
].join(', ');
