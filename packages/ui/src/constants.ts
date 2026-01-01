// Re-export z-index constants
export { Z_INDEX, windowZIndexManager } from './constants/zIndex';

// Animation durations in milliseconds
export const ANIMATION_DURATIONS = {
  WINDOW_OPEN: 200,
  WINDOW_CLOSE: 150,
  WINDOW_MINIMIZE: 300,
  WINDOW_RESTORE: 300,
  // Notification animations
  TOAST_ENTER: 200,
  TOAST_EXIT: 150,
  NOTIFICATION_CENTER_OPEN: 200,
  NOTIFICATION_CENTER_CLOSE: 150,
} as const;

// Default notification settings
export const NOTIFICATION_DEFAULTS = {
  /** Default auto-dismiss duration in milliseconds */
  DURATION: 5000,
  /** Maximum visible toasts at once */
  MAX_TOASTS: 5,
  /** LocalStorage key for persistent notifications */
  STORAGE_KEY: 'zos-notifications',
} as const;
