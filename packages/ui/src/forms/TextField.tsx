/**
 * TextField Component
 *
 * A polished text input field with glass styling, icons, and validation states.
 *
 * @example
 * ```tsx
 * <TextField
 *   value={email}
 *   onChange={setEmail}
 *   label="Email"
 *   type="email"
 *   placeholder="you@example.com"
 *   leadingIcon={<Mail />}
 * />
 * ```
 */

import React, { useId, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';
import { SIZE_CLASSES, GLASS_STYLES, type FormSize } from './types';

const textFieldVariants = cva(
  // Base styles with glass effect
  [
    'w-full rounded-lg transition-all duration-200',
    'text-white placeholder-white/40',
    GLASS_STYLES.base,
    GLASS_STYLES.focus,
  ].join(' '),
  {
    variants: {
      size: {
        sm: SIZE_CLASSES.sm.input,
        md: SIZE_CLASSES.md.input,
        lg: SIZE_CLASSES.lg.input,
      },
      hasError: {
        true: GLASS_STYLES.error,
        false: '',
      },
      isDisabled: {
        true: GLASS_STYLES.disabled,
        false: '',
      },
    },
    defaultVariants: {
      size: 'md',
      hasError: false,
      isDisabled: false,
    },
  }
);

export interface TextFieldProps
  extends Omit<VariantProps<typeof textFieldVariants>, 'hasError' | 'isDisabled'> {
  /** Current value */
  value: string;
  /** Change handler */
  onChange: (value: string) => void;
  /** Field label */
  label?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Input type */
  type?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url';
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
  /** Leading (left) icon */
  leadingIcon?: React.ReactNode;
  /** Trailing (right) icon */
  trailingIcon?: React.ReactNode;
  /** Field size */
  size?: FormSize;
  /** Additional class name */
  className?: string;
  /** Name attribute */
  name?: string;
  /** Autocomplete attribute */
  autoComplete?: string;
  /** Auto focus */
  autoFocus?: boolean;
  /** Max length */
  maxLength?: number;
  /** Min value (for number type) */
  min?: number;
  /** Max value (for number type) */
  max?: number;
  /** Step value (for number type) */
  step?: number;
  /** onBlur handler */
  onBlur?: () => void;
  /** onFocus handler */
  onFocus?: () => void;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  (
    {
      value,
      onChange,
      label,
      placeholder,
      type = 'text',
      error,
      hint,
      disabled = false,
      readOnly = false,
      required = false,
      leadingIcon,
      trailingIcon,
      size = 'md',
      className,
      name,
      autoComplete,
      autoFocus,
      maxLength,
      min,
      max,
      step,
      onBlur,
      onFocus,
    },
    ref
  ) => {
    const id = useId();
    const errorId = `${id}-error`;
    const hintId = `${id}-hint`;
    const sizeClasses = SIZE_CLASSES[size];

    const hasLeadingIcon = !!leadingIcon;
    const hasTrailingIcon = !!trailingIcon;

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

        {/* Input wrapper */}
        <div className="relative">
          {/* Leading icon */}
          {hasLeadingIcon && (
            <div
              className={cn(
                'absolute left-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none',
                sizeClasses.icon
              )}
            >
              {leadingIcon}
            </div>
          )}

          {/* Input */}
          <input
            ref={ref}
            id={id}
            name={name}
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
            autoComplete={autoComplete}
            autoFocus={autoFocus}
            maxLength={maxLength}
            min={min}
            max={max}
            step={step}
            onBlur={onBlur}
            onFocus={onFocus}
            aria-invalid={!!error}
            aria-describedby={cn(error && errorId, hint && !error && hintId) || undefined}
            className={cn(
              textFieldVariants({
                size,
                hasError: !!error,
                isDisabled: disabled,
              }),
              hasLeadingIcon && 'pl-9',
              hasTrailingIcon && 'pr-9'
            )}
          />

          {/* Trailing icon */}
          {hasTrailingIcon && (
            <div
              className={cn(
                'absolute right-3 top-1/2 -translate-y-1/2 text-white/40',
                sizeClasses.icon
              )}
            >
              {trailingIcon}
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <p id={errorId} className="mt-1.5 text-xs text-red-400" role="alert">
            {error}
          </p>
        )}

        {/* Hint text (only shown when no error) */}
        {hint && !error && (
          <p id={hintId} className="mt-1.5 text-xs text-white/50">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

TextField.displayName = 'TextField';
