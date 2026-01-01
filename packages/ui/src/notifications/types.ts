/**
 * Notification System Types
 *
 * Type definitions for the zOS notification and toast system.
 */

import type { ReactNode } from 'react';

/** Notification type variants */
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

/** Toast position on screen */
export type NotificationPosition =
  | 'top-right'
  | 'top-left'
  | 'bottom-right'
  | 'bottom-left';

/** Action button for notifications */
export interface NotificationAction {
  /** Button label */
  label: string;
  /** Click handler */
  onClick: () => void;
  /** Optional variant for styling */
  variant?: 'primary' | 'secondary' | 'destructive';
}

/** Full notification configuration */
export interface Notification {
  /** Unique identifier */
  id: string;
  /** Notification title */
  title?: string;
  /** Notification message */
  message: string;
  /** Type determines styling and default icon */
  type: NotificationType;
  /** Custom icon (overrides default type icon) */
  icon?: ReactNode;
  /** Action buttons */
  actions?: NotificationAction[];
  /** Auto-dismiss duration in ms (0 = no auto-dismiss) */
  duration: number;
  /** Show progress indicator */
  progress?: boolean;
  /** Creation timestamp */
  timestamp: number;
  /** Source app identifier for grouping */
  appId?: string;
  /** Persist across page refreshes */
  persistent?: boolean;
  /** Position on screen (for toasts) */
  position?: NotificationPosition;
}

/** Options for creating a notification */
export interface NotifyOptions {
  /** Notification title */
  title?: string;
  /** Notification message */
  message: string;
  /** Type determines styling and default icon */
  type?: NotificationType;
  /** Custom icon (overrides default type icon) */
  icon?: ReactNode;
  /** Action buttons */
  actions?: NotificationAction[];
  /** Auto-dismiss duration in ms (default: 5000, 0 = no auto-dismiss) */
  duration?: number;
  /** Show progress indicator */
  progress?: boolean;
  /** Source app identifier for grouping */
  appId?: string;
  /** Persist across page refreshes */
  persistent?: boolean;
  /** Position on screen */
  position?: NotificationPosition;
}

/** Notification context value */
export interface NotificationContextValue {
  /** All active notifications */
  notifications: Notification[];
  /** Show a notification with full options */
  notify: (options: NotifyOptions) => string;
  /** Quick toast with message and type */
  toast: (message: string, type?: NotificationType) => string;
  /** Dismiss a specific notification by ID */
  dismiss: (id: string) => void;
  /** Dismiss all notifications */
  dismissAll: () => void;
  /** Dismiss all notifications from a specific app */
  dismissByApp: (appId: string) => void;
  /** Default position for new notifications */
  defaultPosition: NotificationPosition;
  /** Set default position */
  setDefaultPosition: (position: NotificationPosition) => void;
  /** Whether notification center is open */
  isNotificationCenterOpen: boolean;
  /** Toggle notification center */
  toggleNotificationCenter: () => void;
  /** Open notification center */
  openNotificationCenter: () => void;
  /** Close notification center */
  closeNotificationCenter: () => void;
}

/** Props for NotificationProvider */
export interface NotificationProviderProps {
  /** Child components */
  children: ReactNode;
  /** Default position for toasts */
  defaultPosition?: NotificationPosition;
  /** Maximum number of visible toasts */
  maxToasts?: number;
  /** Default duration in ms */
  defaultDuration?: number;
  /** Storage key for persistent notifications */
  storageKey?: string;
}
