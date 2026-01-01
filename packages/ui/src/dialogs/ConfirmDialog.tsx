/**
 * ConfirmDialog Component
 *
 * Preset dialog for confirm/cancel choices with optional danger styling.
 *
 * @example
 * ```tsx
 * const { confirm } = useDialogs();
 *
 * const confirmed = await confirm({
 *   title: 'Delete Project',
 *   message: 'This action cannot be undone. Are you sure?',
 *   danger: true,
 *   confirmText: 'Delete',
 * });
 *
 * if (confirmed) {
 *   // Proceed with deletion
 * }
 * ```
 */

import React from 'react';
import { cn } from '../lib/utils';
import type { ConfirmOptions } from './types';

export interface ConfirmDialogProps extends ConfirmOptions {
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <div className="flex flex-col">
      {/* Title */}
      {title && (
        <h3 className="text-base font-medium text-white mb-2">{title}</h3>
      )}

      {/* Message */}
      <p className="text-sm text-white/70 mb-6">{message}</p>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className={cn(
            'flex-1 px-4 py-2',
            'bg-white/10 text-white text-sm font-medium',
            'rounded-lg',
            'hover:bg-white/20 active:bg-white/25',
            'transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-black'
          )}
        >
          {cancelText}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className={cn(
            'flex-1 px-4 py-2',
            'text-sm font-medium',
            'rounded-lg',
            'transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black',
            danger
              ? [
                  'bg-red-500 text-white',
                  'hover:bg-red-600 active:bg-red-700',
                  'focus:ring-red-500',
                ]
              : [
                  'bg-blue-500 text-white',
                  'hover:bg-blue-600 active:bg-blue-700',
                  'focus:ring-blue-500',
                ]
          )}
        >
          {confirmText}
        </button>
      </div>
    </div>
  );
}

ConfirmDialog.displayName = 'ConfirmDialog';
