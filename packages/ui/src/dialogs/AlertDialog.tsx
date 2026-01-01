/**
 * AlertDialog Component
 *
 * Preset dialog for displaying alerts with optional icons.
 *
 * @example
 * ```tsx
 * const { alert } = useDialogs();
 *
 * await alert({
 *   title: 'File Saved',
 *   message: 'Your file has been saved successfully.',
 *   icon: 'success',
 * });
 * ```
 */

import React from 'react';
import { cn } from '../lib/utils';
import type { AlertOptions } from './types';

/** Icon components for alert types */
const AlertIcons = {
  info: () => (
    <svg
      className="w-10 h-10 text-blue-400"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" strokeLinecap="round" />
    </svg>
  ),
  warning: () => (
    <svg
      className="w-10 h-10 text-yellow-400"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <path d="M12 9v4M12 17h.01" strokeLinecap="round" />
    </svg>
  ),
  error: () => (
    <svg
      className="w-10 h-10 text-red-400"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M15 9l-6 6M9 9l6 6" strokeLinecap="round" />
    </svg>
  ),
  success: () => (
    <svg
      className="w-10 h-10 text-green-400"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

export interface AlertDialogProps extends AlertOptions {
  onClose: () => void;
}

export function AlertDialog({
  title,
  message,
  icon,
  buttonText = 'OK',
  onClose,
}: AlertDialogProps) {
  const IconComponent = icon ? AlertIcons[icon] : null;

  return (
    <div className="flex flex-col items-center text-center">
      {/* Icon */}
      {IconComponent && (
        <div className="mb-4">
          <IconComponent />
        </div>
      )}

      {/* Title */}
      {title && (
        <h3 className="text-base font-medium text-white mb-2">{title}</h3>
      )}

      {/* Message */}
      <p className="text-sm text-white/70 mb-6">{message}</p>

      {/* Button */}
      <button
        type="button"
        onClick={onClose}
        className={cn(
          'w-full px-4 py-2',
          'bg-blue-500 text-white text-sm font-medium',
          'rounded-lg',
          'hover:bg-blue-600 active:bg-blue-700',
          'transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-black'
        )}
      >
        {buttonText}
      </button>
    </div>
  );
}

AlertDialog.displayName = 'AlertDialog';
