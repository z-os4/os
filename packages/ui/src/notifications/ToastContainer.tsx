/**
 * ToastContainer Component
 *
 * Container for positioning and animating toast notifications.
 * Renders toasts at the specified screen position with proper stacking.
 */

import React, { useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { Toast } from './Toast';
import { useNotificationContext } from './NotificationContext';
import type { NotificationPosition, Notification } from './types';

/** Position styles for each corner */
const positionStyles: Record<NotificationPosition, string> = {
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4',
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
};

/** Stack direction based on position */
const stackStyles: Record<NotificationPosition, string> = {
  'top-right': 'flex-col',
  'top-left': 'flex-col',
  'bottom-right': 'flex-col-reverse',
  'bottom-left': 'flex-col-reverse',
};

export interface ToastContainerProps {
  /** Override default position */
  position?: NotificationPosition;
  /** Additional class names */
  className?: string;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  position: positionOverride,
  className,
}) => {
  const { notifications, dismiss, defaultPosition } = useNotificationContext();
  const position = positionOverride ?? defaultPosition;

  // Group notifications by position
  const notificationsByPosition = useMemo(() => {
    const groups: Record<NotificationPosition, Notification[]> = {
      'top-right': [],
      'top-left': [],
      'bottom-right': [],
      'bottom-left': [],
    };

    notifications.forEach((notification) => {
      const pos = notification.position ?? position;
      groups[pos].push(notification);
    });

    return groups;
  }, [notifications, position]);

  return (
    <>
      {(Object.keys(positionStyles) as NotificationPosition[]).map((pos) => {
        const positionNotifications = notificationsByPosition[pos];
        if (positionNotifications.length === 0) return null;

        return (
          <div
            key={pos}
            className={cn(
              'fixed z-[9999] flex gap-2 pointer-events-none',
              positionStyles[pos],
              stackStyles[pos],
              className
            )}
            role="region"
            aria-label={`Notifications ${pos}`}
          >
            <AnimatePresence mode="popLayout">
              {positionNotifications.map((notification) => (
                <div key={notification.id} className="pointer-events-auto">
                  <Toast
                    notification={notification}
                    onDismiss={dismiss}
                    position={pos}
                  />
                </div>
              ))}
            </AnimatePresence>
          </div>
        );
      })}
    </>
  );
};

ToastContainer.displayName = 'ToastContainer';

export default ToastContainer;
