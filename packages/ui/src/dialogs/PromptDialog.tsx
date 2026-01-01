/**
 * PromptDialog Component
 *
 * Preset dialog for getting text input from the user.
 *
 * @example
 * ```tsx
 * const { prompt } = useDialogs();
 *
 * const name = await prompt({
 *   title: 'Rename File',
 *   message: 'Enter a new name for this file:',
 *   defaultValue: 'document.txt',
 *   placeholder: 'filename.txt',
 * });
 *
 * if (name !== null) {
 *   // User entered a value
 * }
 * ```
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '../lib/utils';
import type { PromptOptions } from './types';

export interface PromptDialogProps extends PromptOptions {
  onSubmit: (value: string) => void;
  onCancel: () => void;
}

export function PromptDialog({
  title,
  message,
  placeholder,
  defaultValue = '',
  confirmText = 'OK',
  cancelText = 'Cancel',
  onSubmit,
  onCancel,
}: PromptDialogProps) {
  const [value, setValue] = useState(defaultValue);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus and select input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  const handleSubmit = useCallback(
    (event?: React.FormEvent) => {
      event?.preventDefault();
      onSubmit(value);
    },
    [value, onSubmit]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      {/* Title */}
      {title && (
        <h3 className="text-base font-medium text-white mb-2">{title}</h3>
      )}

      {/* Message */}
      {message && (
        <p className="text-sm text-white/70 mb-3">{message}</p>
      )}

      {/* Input */}
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={cn(
          'w-full px-3 py-2 mb-4',
          'bg-white/5 text-white text-sm',
          'border border-white/10 rounded-lg',
          'placeholder-white/30',
          'transition-colors',
          'focus:outline-none focus:border-white/30'
        )}
      />

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
          type="submit"
          className={cn(
            'flex-1 px-4 py-2',
            'bg-blue-500 text-white text-sm font-medium',
            'rounded-lg',
            'hover:bg-blue-600 active:bg-blue-700',
            'transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-black'
          )}
        >
          {confirmText}
        </button>
      </div>
    </form>
  );
}

PromptDialog.displayName = 'PromptDialog';
