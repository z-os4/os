/**
 * NotificationCenter Component
 *
 * macOS-style notification center panel.
 * Groups notifications by app, supports clear all, and persistent notifications.
 */

import React, { useMemo, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Bell,
  Trash2,
  Info,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useNotificationContext } from './NotificationContext';
import type { Notification, NotificationType } from './types';

/** Default icons for notification types */
const defaultIcons: Record<NotificationType, React.ElementType> = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertCircle,
};

/** Icon colors by type */
const iconColors: Record<NotificationType, string> = {
  info: 'text-blue-400',
  success: 'text-green-400',
  warning: 'text-orange-400',
  error: 'text-red-400',
};

/** Format relative time */
function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return new Date(timestamp).toLocaleDateString();
}

/** Notification item in the center */
const NotificationItem: React.FC<{
  notification: Notification;
  onDismiss: (id: string) => void;
  onAction?: () => void;
}> = ({ notification, onDismiss, onAction }) => {
  const { id, title, message, type, icon, timestamp, actions } = notification;
  const IconComponent = defaultIcons[type];

  const handleClick = () => {
    if (actions && actions.length > 0) {
      actions[0].onClick();
      onDismiss(id);
    } else if (onAction) {
      onAction();
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
      className={cn(
        'group relative p-3 rounded-lg',
        'bg-white/5 hover:bg-white/10',
        'border border-white/10',
        'transition-colors cursor-pointer'
      )}
      onClick={handleClick}
    >
      <div className="flex gap-3">
        {/* Icon */}
        <div className="pt-0.5">
          {icon ?? (IconComponent && (
            <IconComponent className={cn('w-5 h-5', iconColors[type])} />
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className="font-medium text-white text-sm leading-tight mb-0.5 truncate">
              {title}
            </h4>
          )}
          <p className="text-white/70 text-sm leading-snug line-clamp-2">
            {message}
          </p>
          <p className="text-white/40 text-xs mt-1">
            {formatRelativeTime(timestamp)}
          </p>
        </div>

        {/* Close button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDismiss(id);
          }}
          className={cn(
            'absolute top-2 right-2 p-1 rounded-md',
            'opacity-0 group-hover:opacity-100',
            'text-white/40 hover:text-white hover:bg-white/10',
            'transition-all'
          )}
          aria-label="Dismiss notification"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
};

/** App group in notification center */
const NotificationGroup: React.FC<{
  appId: string;
  notifications: Notification[];
  onDismiss: (id: string) => void;
  onDismissAll: () => void;
  defaultExpanded?: boolean;
}> = ({ appId, notifications, onDismiss, onDismissAll, defaultExpanded = true }) => {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);

  return (
    <div className="space-y-2">
      {/* Group header */}
      <div className="flex items-center justify-between px-1">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
        >
          <span className="text-xs font-medium uppercase tracking-wide">
            {appId || 'System'}
          </span>
          <span className="text-xs text-white/40">
            ({notifications.length})
          </span>
          {isExpanded ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>
        <button
          onClick={onDismissAll}
          className={cn(
            'text-xs text-white/40 hover:text-white',
            'transition-colors'
          )}
        >
          Clear
        </button>
      </div>

      {/* Notifications */}
      <AnimatePresence mode="popLayout">
        {isExpanded && notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onDismiss={onDismiss}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export interface NotificationCenterProps {
  /** Additional class names */
  className?: string;
  /** Width of the panel */
  width?: number;
  /** Callback when notification is clicked (for focusing source app) */
  onNotificationClick?: (notification: Notification) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  className,
  width = 360,
  onNotificationClick,
}) => {
  const {
    notifications,
    dismiss,
    dismissAll,
    dismissByApp,
    isNotificationCenterOpen,
    closeNotificationCenter,
  } = useNotificationContext();

  const panelRef = useRef<HTMLDivElement>(null);

  // Group notifications by appId
  const groupedNotifications = useMemo(() => {
    const groups: Record<string, Notification[]> = {};

    // Sort by timestamp descending (newest first)
    const sorted = [...notifications].sort((a, b) => b.timestamp - a.timestamp);

    sorted.forEach((notification) => {
      const appId = notification.appId ?? 'System';
      if (!groups[appId]) {
        groups[appId] = [];
      }
      groups[appId].push(notification);
    });

    return groups;
  }, [notifications]);

  const appIds = Object.keys(groupedNotifications);

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isNotificationCenterOpen) {
        closeNotificationCenter();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isNotificationCenterOpen, closeNotificationCenter]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        isNotificationCenterOpen
      ) {
        closeNotificationCenter();
      }
    };

    // Delay to prevent immediate close on toggle click
    const timer = setTimeout(() => {
      window.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotificationCenterOpen, closeNotificationCenter]);

  const handleDismissApp = useCallback((appId: string) => {
    if (appId === 'System') {
      // Dismiss all notifications without appId
      notifications
        .filter((n) => !n.appId)
        .forEach((n) => dismiss(n.id));
    } else {
      dismissByApp(appId);
    }
  }, [notifications, dismiss, dismissByApp]);

  return (
    <AnimatePresence>
      {isNotificationCenterOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[9998]"
            onClick={closeNotificationCenter}
          />

          {/* Panel */}
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 30,
            }}
            className={cn(
              'fixed top-10 right-4 z-[9999]',
              'flex flex-col max-h-[calc(100vh-5rem)]',
              'rounded-xl overflow-hidden',
              'bg-black/70 backdrop-blur-2xl',
              'border border-white/10',
              'shadow-2xl',
              className
            )}
            style={{ width }}
            role="dialog"
            aria-label="Notification Center"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-white/60" />
                <h2 className="text-white font-medium">Notifications</h2>
                {notifications.length > 0 && (
                  <span className="text-xs text-white/40">
                    ({notifications.length})
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {notifications.length > 0 && (
                  <button
                    onClick={dismissAll}
                    className={cn(
                      'p-1.5 rounded-md',
                      'text-white/40 hover:text-white hover:bg-white/10',
                      'transition-colors'
                    )}
                    aria-label="Clear all notifications"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={closeNotificationCenter}
                  className={cn(
                    'p-1.5 rounded-md',
                    'text-white/40 hover:text-white hover:bg-white/10',
                    'transition-colors'
                  )}
                  aria-label="Close notification center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Bell className="w-12 h-12 text-white/20 mb-3" />
                  <p className="text-white/40 text-sm">No notifications</p>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {appIds.map((appId) => (
                    <NotificationGroup
                      key={appId}
                      appId={appId}
                      notifications={groupedNotifications[appId]}
                      onDismiss={dismiss}
                      onDismissAll={() => handleDismissApp(appId)}
                    />
                  ))}
                </AnimatePresence>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

NotificationCenter.displayName = 'NotificationCenter';

export default NotificationCenter;
