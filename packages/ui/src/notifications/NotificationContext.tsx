/**
 * Notification Context and Provider
 *
 * Global state management for the notification system.
 * Handles notification lifecycle, persistence, and coordination.
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import type {
  Notification,
  NotifyOptions,
  NotificationType,
  NotificationPosition,
  NotificationContextValue,
  NotificationProviderProps,
} from './types';

const NotificationContext = createContext<NotificationContextValue | null>(null);

/** Generate unique notification ID */
function generateId(): string {
  return `notif-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Load persistent notifications from storage */
function loadPersistentNotifications(key: string): Notification[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return [];
    const parsed = JSON.parse(stored) as Notification[];
    // Filter out expired non-persistent notifications
    return parsed.filter((n) => n.persistent);
  } catch {
    return [];
  }
}

/** Save persistent notifications to storage */
function savePersistentNotifications(key: string, notifications: Notification[]): void {
  if (typeof window === 'undefined') return;
  try {
    const persistent = notifications.filter((n) => n.persistent);
    localStorage.setItem(key, JSON.stringify(persistent));
  } catch {
    // Storage full or unavailable - silently fail
  }
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
  defaultPosition: initialPosition = 'top-right',
  maxToasts = 5,
  defaultDuration = 5000,
  storageKey = 'zos-notifications',
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [defaultPosition, setDefaultPosition] = useState<NotificationPosition>(initialPosition);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);

  // Track active timers for cleanup
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // Load persistent notifications on mount
  useEffect(() => {
    const persistent = loadPersistentNotifications(storageKey);
    if (persistent.length > 0) {
      setNotifications(persistent);
    }
  }, [storageKey]);

  // Save persistent notifications when they change
  useEffect(() => {
    savePersistentNotifications(storageKey, notifications);
  }, [notifications, storageKey]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => clearTimeout(timer));
      timersRef.current.clear();
    };
  }, []);

  /** Dismiss a notification by ID */
  const dismiss = useCallback((id: string) => {
    // Clear any existing timer
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }

    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  /** Dismiss all notifications */
  const dismissAll = useCallback(() => {
    // Clear all timers
    timersRef.current.forEach((timer) => clearTimeout(timer));
    timersRef.current.clear();

    setNotifications([]);
  }, []);

  /** Dismiss all notifications from a specific app */
  const dismissByApp = useCallback((appId: string) => {
    setNotifications((prev) => {
      const toRemove = prev.filter((n) => n.appId === appId);
      toRemove.forEach((n) => {
        const timer = timersRef.current.get(n.id);
        if (timer) {
          clearTimeout(timer);
          timersRef.current.delete(n.id);
        }
      });
      return prev.filter((n) => n.appId !== appId);
    });
  }, []);

  /** Show a notification with full options */
  const notify = useCallback((options: NotifyOptions): string => {
    const id = generateId();
    const duration = options.duration ?? defaultDuration;

    const notification: Notification = {
      id,
      title: options.title,
      message: options.message,
      type: options.type ?? 'info',
      icon: options.icon,
      actions: options.actions,
      duration,
      progress: options.progress,
      timestamp: Date.now(),
      appId: options.appId,
      persistent: options.persistent,
      position: options.position ?? defaultPosition,
    };

    setNotifications((prev) => {
      // Limit visible toasts (keep persistent ones)
      const existing = [...prev];
      const persistentCount = existing.filter((n) => n.persistent).length;
      const transientNotifications = existing.filter((n) => !n.persistent);

      // If we exceed max, remove oldest transient notifications
      while (transientNotifications.length >= maxToasts) {
        const oldest = transientNotifications.shift();
        if (oldest) {
          const timer = timersRef.current.get(oldest.id);
          if (timer) {
            clearTimeout(timer);
            timersRef.current.delete(oldest.id);
          }
        }
      }

      return [...existing.filter((n) => n.persistent), ...transientNotifications, notification];
    });

    // Set auto-dismiss timer if duration > 0
    if (duration > 0 && !options.persistent) {
      const timer = setTimeout(() => {
        dismiss(id);
      }, duration);
      timersRef.current.set(id, timer);
    }

    return id;
  }, [defaultDuration, defaultPosition, maxToasts, dismiss]);

  /** Quick toast with message and type */
  const toast = useCallback((message: string, type: NotificationType = 'info'): string => {
    return notify({ message, type });
  }, [notify]);

  /** Toggle notification center */
  const toggleNotificationCenter = useCallback(() => {
    setIsNotificationCenterOpen((prev) => !prev);
  }, []);

  /** Open notification center */
  const openNotificationCenter = useCallback(() => {
    setIsNotificationCenterOpen(true);
  }, []);

  /** Close notification center */
  const closeNotificationCenter = useCallback(() => {
    setIsNotificationCenterOpen(false);
  }, []);

  const value: NotificationContextValue = {
    notifications,
    notify,
    toast,
    dismiss,
    dismissAll,
    dismissByApp,
    defaultPosition,
    setDefaultPosition,
    isNotificationCenterOpen,
    toggleNotificationCenter,
    openNotificationCenter,
    closeNotificationCenter,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

/** Access notification context (internal use) */
export function useNotificationContext(): NotificationContextValue {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

export { NotificationContext };
