/**
 * zOS Accessibility Utilities
 *
 * Comprehensive accessibility utilities following WCAG 2.1 AA guidelines.
 *
 * Components:
 * - VisuallyHidden: Hide content visually but keep accessible
 * - LiveRegion: ARIA live regions for announcements
 * - FocusTrap: Trap focus within a container
 * - FocusScope: Manage focus scope with auto-focus/restoration
 * - SkipLink: Skip navigation links
 * - KeyboardNav: Keyboard navigation for lists/grids
 * - AccessibilityProvider: Global a11y context
 *
 * Hooks:
 * - useAnnounce: Screen reader announcements
 * - useMediaQuery: Generic media query detection
 * - useReducedMotion: Detect reduced motion preference
 * - useFocusVisible: Focus-visible polyfill
 * - useFocusWithin: Track focus within container
 * - usePrefersColorScheme: Color scheme preference
 * - usePrefersContrast: Contrast preference
 * - useAccessibility: Access global a11y context
 * - useKeyboardNavigation: Keyboard nav hook
 *
 * @example
 * ```tsx
 * import {
 *   AccessibilityProvider,
 *   useAccessibility,
 *   useAnnounce,
 *   FocusTrap,
 *   SkipLink,
 *   VisuallyHidden,
 * } from '@z-os/ui';
 *
 * // App root
 * <AccessibilityProvider>
 *   <SkipLink href="#main">Skip to main content</SkipLink>
 *   <App />
 * </AccessibilityProvider>
 *
 * // Modal with focus trap
 * <FocusTrap>
 *   <Dialog>
 *     <button>Close</button>
 *   </Dialog>
 * </FocusTrap>
 *
 * // Announce actions
 * const { announce } = useAnnounce();
 * announce('File saved', 'polite');
 *
 * // Respect motion preferences
 * const { prefersReducedMotion } = useAccessibility();
 * const animation = prefersReducedMotion ? 'none' : 'slide';
 * ```
 */

// Types
export type {
  AnnouncementPriority,
  NavigationDirection,
  FocusTrapOptions,
  FocusScopeOptions,
  KeyboardNavOptions,
  AccessibilityPreferences,
  AccessibilityContextValue,
} from './types';

export { FOCUSABLE_SELECTORS, TABBABLE_SELECTORS } from './types';

// Components
export { VisuallyHidden, type VisuallyHiddenProps } from './VisuallyHidden';
export {
  LiveRegion,
  LiveRegionProvider,
  useAnnounce,
  type LiveRegionProps,
  type LiveRegionProviderProps,
} from './LiveRegion';
export { FocusTrap, type FocusTrapProps } from './FocusTrap';
export { FocusScope, useFocusScope, type FocusScopeProps } from './FocusScope';
export { SkipLink, SkipLinks, type SkipLinkProps, type SkipLinksProps } from './SkipLink';
export {
  KeyboardNav,
  useKeyboardNavigation,
  type KeyboardNavProps,
} from './KeyboardNav';
export {
  AccessibilityProvider,
  useAccessibility,
  withAccessibility,
  type AccessibilityProviderProps,
} from './AccessibilityProvider';

// Hooks
export {
  useMediaQuery,
  useReducedMotion,
  useFocusVisible,
  useFocusWithin,
  usePrefersColorScheme,
  usePrefersContrast,
  useId,
  useScreenReaderAnnouncement,
} from './hooks';
