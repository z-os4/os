/**
 * TextArea Component
 *
 * Multi-line text input with auto-resize capability and glass styling.
 *
 * @example
 * ```tsx
 * <TextArea
 *   value={description}
 *   onChange={setDescription}
 *   label="Description"
 *   placeholder="Enter a description..."
 *   autoResize
 *   rows={4}
 * />
 * ```
 */

import React, { useId, forwardRef, useRef, useEffect, useCallback } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';
import { SIZE_CLASSES, GLASS_STYLES, type FormSize } from './types';

const textAreaVariants = cva(
  // Base styles with glass effect
  [
    'w-full rounded-lg transition-all duration-200 resize-none',
    'text-white placeholder-white/40',
    GLASS_STYLES.base,
    GLASS_STYLES.focus,
  ].join(' '),
  {
    variants: {
      size: {
        sm: 'px-2 py-1.5 text-xs',
        md: 'px-3 py-2 text-sm',
        lg: 'px-4 py-3 text-base',
      },
      hasError: {
        true: GLASS_STYLES.error,
        false: '',
      },
      isDisabled: {
        true: GLASS_STYLES.disabled,
        false: '',
      },
      resizable: {
        true: 'resize-y',
        false: 'resize-none',
      },
    },
    defaultVariants: {
      size: 'md',
      hasError: false,
      isDisabled: false,
      resizable: false,
    },
  }
);

export interface TextAreaProps
  extends Omit<VariantProps<typeof textAreaVariants>, 'hasError' | 'isDisabled'> {
  /** Current value */
  value: string;
  /** Change handler */
  onChange: (value: string) => void;
  /** Field label */
  label?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Error message */
  error?: string;
  /** Hint/helper text */
  hint?: string;
  /** Whether field is disabled */
  disabled?: boolean;
  /** Whether field is read-only */
  readOnly?: boolean;
  /** Whether field is required */
  required?: boolean;
  /** Field size */
  size?: FormSize;
  /** Number of visible rows */
  rows?: number;
  /** Minimum number of rows for auto-resize */
  minRows?: number;
  /** Maximum number of rows for auto-resize */
  maxRows?: number;
  /** Enable auto-resize based on content */
  autoResize?: boolean;
  /** Allow manual resizing */
  resizable?: boolean;
  /** Maximum character length */
  maxLength?: number;
  /** Show character count */
  showCount?: boolean;
  /** Additional class name */
  className?: string;
  /** Name attribute */
  name?: string;
  /** onBlur handler */
  onBlur?: () => void;
  /** onFocus handler */
  onFocus?: () => void;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      value,
      onChange,
      label,
      placeholder,
      error,
      hint,
      disabled = false,
      readOnly = false,
      required = false,
      size = 'md',
      rows = 3,
      minRows,
      maxRows,
      autoResize = false,
      resizable = false,
      maxLength,
      showCount = false,
      className,
      name,
      onBlur,
      onFocus,
    },
    ref
  ) => {
    const id = useId();
    const errorId = `${id}-error`;
    const hintId = `${id}-hint`;
    const sizeClasses = SIZE_CLASSES[size];

    // Internal ref for auto-resize
    const internalRef = useRef<HTMLTextAreaElement>(null);
    const textareaRef = (ref as React.RefObject<HTMLTextAreaElement>) || internalRef;

    // Calculate line height based on size
    const lineHeight = size === 'sm' ? 18 : size === 'md' ? 20 : 24;

    // Auto-resize handler
    const adjustHeight = useCallback(() => {
      const textarea = textareaRef.current;
      if (!textarea || !autoResize) return;

      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = 'auto';

      // Calculate min and max heights
      const minHeight = (minRows ?? rows) * lineHeight;
      const maxHeight = maxRows ? maxRows * lineHeight : Infinity;

      // Set new height within bounds
      const newHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight);
      textarea.style.height = `${newHeight}px`;
    }, [autoResize, textareaRef, rows, minRows, maxRows, lineHeight]);

    // Adjust height on value change
    useEffect(() => {
      adjustHeight();
    }, [value, adjustHeight]);

    // Adjust height on mount
    useEffect(() => {
      adjustHeight();
    }, [adjustHeight]);

    const characterCount = value.length;
    const isOverLimit = maxLength ? characterCount > maxLength : false;

    return (
      <div className={cn('w-full', className)}>
        {/* Label */}
        {label && (
          <label
            htmlFor={id}
            className={cn(
              'block font-medium text-white/90',
              sizeClasses.label,
              required && "after:content-['*'] after:ml-0.5 after:text-red-400"
            )}
          >
            {label}
          </label>
        )}

        {/* TextArea */}
        <textarea
          ref={textareaRef}
          id={id}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          rows={autoResize ? (minRows ?? rows) : rows}
          maxLength={maxLength}
          onBlur={onBlur}
          onFocus={onFocus}
          aria-invalid={!!error || isOverLimit}
          aria-describedby={cn(error && errorId, hint && !error && hintId) || undefined}
          className={cn(
            textAreaVariants({
              size,
              hasError: !!error || isOverLimit,
              isDisabled: disabled,
              resizable: resizable && !autoResize,
            })
          )}
        />

        {/* Footer row: error/hint and character count */}
        <div className="flex items-start justify-between mt-1.5 gap-2">
          <div className="flex-1">
            {/* Error message */}
            {error && (
              <p id={errorId} className="text-xs text-red-400" role="alert">
                {error}
              </p>
            )}

            {/* Hint text (only shown when no error) */}
            {hint && !error && (
              <p id={hintId} className="text-xs text-white/50">
                {hint}
              </p>
            )}
          </div>

          {/* Character count */}
          {showCount && (
            <span
              className={cn(
                'text-xs tabular-nums',
                isOverLimit ? 'text-red-400' : 'text-white/40'
              )}
            >
              {characterCount}
              {maxLength && `/${maxLength}`}
            </span>
          )}
        </div>
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';
