/**
 * Toast Component
 *
 * Individual toast notification with macOS-style glass morphism.
 * Supports title, message, icon, actions, progress, and auto-dismiss.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import {
  X,
  Info,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
} from 'lucide-react';
import { cn } from '../lib/utils';
import type { Notification, NotificationAction } from './types';

const toastVariants = cva(
  // Base styles - glass morphism
  [
    'relative flex w-[360px] max-w-[calc(100vw-2rem)] gap-3 p-3',
    'rounded-xl border backdrop-blur-xl',
    'shadow-lg',
  ].join(' '),
  {
    variants: {
      type: {
        info: [
          'bg-white/10 border-white/20',
          'dark:bg-black/40 dark:border-white/10',
        ].join(' '),
        success: [
          'bg-green-500/10 border-green-500/30',
          'dark:bg-green-500/20 dark:border-green-500/30',
        ].join(' '),
        warning: [
          'bg-orange-500/10 border-orange-500/30',
          'dark:bg-orange-500/20 dark:border-orange-500/30',
        ].join(' '),
        error: [
          'bg-red-500/10 border-red-500/30',
          'dark:bg-red-500/20 dark:border-red-500/30',
        ].join(' '),
      },
    },
    defaultVariants: {
      type: 'info',
    },
  }
);

const iconVariants = cva('w-5 h-5 flex-shrink-0', {
  variants: {
    type: {
      info: 'text-blue-400',
      success: 'text-green-400',
      warning: 'text-orange-400',
      error: 'text-red-400',
    },
  },
  defaultVariants: {
    type: 'info',
  },
});

const progressVariants = cva('absolute bottom-0 left-0 h-0.5 rounded-full', {
  variants: {
    type: {
      info: 'bg-blue-400',
      success: 'bg-green-400',
      warning: 'bg-orange-400',
      error: 'bg-red-400',
    },
  },
  defaultVariants: {
    type: 'info',
  },
});

/** Default icons for notification types */
const defaultIcons: Record<string, React.ElementType> = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertCircle,
};

export interface ToastProps extends VariantProps<typeof toastVariants> {
  /** Notification data */
  notification: Notification;
  /** Dismiss handler */
  onDismiss: (id: string) => void;
  /** Position for animation direction */
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

/** Action button component */
const ActionButton: React.FC<{
  action: NotificationAction;
  onDismiss: () => void;
}> = ({ action, onDismiss }) => {
  const handleClick = () => {
    action.onClick();
    onDismiss();
  };

  const variantStyles: Record<string, string> = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600',
    secondary: 'bg-white/10 text-white hover:bg-white/20',
    destructive: 'bg-red-500/20 text-red-400 hover:bg-red-500/30',
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        'px-2 py-1 text-xs font-medium rounded-md transition-colors',
        variantStyles[action.variant ?? 'secondary']
      )}
    >
      {action.label}
    </button>
  );
};

export const Toast: React.FC<ToastProps> = ({
  notification,
  onDismiss,
  position = 'top-right',
}) => {
  const { id, title, message, type, icon, actions, duration, progress, timestamp } = notification;
  const [progressValue, setProgressValue] = useState(100);
  const [isPaused, setIsPaused] = useState(false);

  // Calculate animation direction based on position
  const isRight = position.includes('right');
  const isTop = position.includes('top');

  const slideDirection = isRight ? 100 : -100;

  // Handle progress countdown
  useEffect(() => {
    if (!progress || duration <= 0 || isPaused) return;

    const elapsed = Date.now() - timestamp;
    const remaining = duration - elapsed;

    if (remaining <= 0) {
      setProgressValue(0);
      return;
    }

    setProgressValue((remaining / duration) * 100);

    const interval = setInterval(() => {
      setProgressValue((prev) => {
        const step = (100 / duration) * 100; // Update every 100ms
        const next = prev - step;
        return next <= 0 ? 0 : next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [progress, duration, timestamp, isPaused]);

  const handleDismiss = useCallback(() => {
    onDismiss(id);
  }, [id, onDismiss]);

  const handleMouseEnter = useCallback(() => {
    setIsPaused(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsPaused(false);
  }, []);

  // Get icon component
  const IconComponent = defaultIcons[type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: slideDirection, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: slideDirection, scale: 0.9 }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 30,
      }}
      className={cn(toastVariants({ type }))}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="alert"
      aria-live="polite"
    >
      {/* Icon */}
      <div className="pt-0.5">
        {icon ?? (IconComponent && <IconComponent className={iconVariants({ type })} />)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {title && (
          <h4 className="font-medium text-white text-sm leading-tight mb-0.5">
            {title}
          </h4>
        )}
        <p className="text-white/70 text-sm leading-snug">{message}</p>

        {/* Actions */}
        {actions && actions.length > 0 && (
          <div className="flex gap-2 mt-2">
            {actions.map((action, idx) => (
              <ActionButton key={idx} action={action} onDismiss={handleDismiss} />
            ))}
          </div>
        )}
      </div>

      {/* Close button */}
      <button
        onClick={handleDismiss}
        className={cn(
          'absolute top-2 right-2 p-1 rounded-md',
          'text-white/40 hover:text-white hover:bg-white/10',
          'transition-colors'
        )}
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Progress bar */}
      {progress && duration > 0 && (
        <motion.div
          className={cn(progressVariants({ type }))}
          initial={{ width: '100%' }}
          animate={{ width: `${progressValue}%` }}
          transition={{ duration: 0.1 }}
        />
      )}
    </motion.div>
  );
};

Toast.displayName = 'Toast';

export { toastVariants, iconVariants };
