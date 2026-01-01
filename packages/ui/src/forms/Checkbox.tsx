/**
 * Checkbox Component
 *
 * A polished checkbox with glass styling and smooth animations.
 *
 * @example
 * ```tsx
 * <Checkbox
 *   checked={agreed}
 *   onChange={setAgreed}
 *   label="I agree to the terms"
 * />
 * ```
 */

import React, { useId, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { SIZE_CLASSES, GLASS_STYLES, type FormSize } from './types';

export interface CheckboxProps {
  /** Whether the checkbox is checked */
  checked: boolean;
  /** Change handler */
  onChange: (checked: boolean) => void;
  /** Checkbox label */
  label?: string;
  /** Description text below label */
  description?: string;
  /** Whether checkbox is disabled */
  disabled?: boolean;
  /** Whether checkbox is in indeterminate state */
  indeterminate?: boolean;
  /** Error message */
  error?: string;
  /** Size variant */
  size?: FormSize;
  /** Additional class name */
  className?: string;
  /** Name attribute */
  name?: string;
  /** Value attribute */
  value?: string;
}

// Check icon with animation
const CheckIcon = ({ className }: { className?: string }) => (
  <motion.svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    initial={{ pathLength: 0 }}
    animate={{ pathLength: 1 }}
    transition={{ duration: 0.2 }}
  >
    <motion.polyline
      points="20 6 9 17 4 12"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.2 }}
    />
  </motion.svg>
);

// Minus icon for indeterminate state
const MinusIcon = ({ className }: { className?: string }) => (
  <motion.svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    initial={{ pathLength: 0 }}
    animate={{ pathLength: 1 }}
    transition={{ duration: 0.2 }}
  >
    <motion.line
      x1="5"
      y1="12"
      x2="19"
      y2="12"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.2 }}
    />
  </motion.svg>
);

const sizeConfig = {
  sm: { box: 'w-4 h-4', icon: 'w-3 h-3', text: 'text-xs', gap: 'gap-2' },
  md: { box: 'w-5 h-5', icon: 'w-3.5 h-3.5', text: 'text-sm', gap: 'gap-2.5' },
  lg: { box: 'w-6 h-6', icon: 'w-4 h-4', text: 'text-base', gap: 'gap-3' },
};

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      checked,
      onChange,
      label,
      description,
      disabled = false,
      indeterminate = false,
      error,
      size = 'md',
      className,
      name,
      value,
    },
    ref
  ) => {
    const id = useId();
    const errorId = `${id}-error`;
    const sizes = sizeConfig[size];

    const isActive = checked || indeterminate;

    return (
      <div className={cn('w-full', className)}>
        <label
          htmlFor={id}
          className={cn(
            'flex items-start cursor-pointer group',
            sizes.gap,
            disabled && 'cursor-not-allowed opacity-50'
          )}
        >
          {/* Checkbox box */}
          <div className="relative flex-shrink-0 mt-0.5">
            {/* Hidden input */}
            <input
              ref={ref}
              id={id}
              type="checkbox"
              name={name}
              value={value}
              checked={checked}
              onChange={(e) => onChange(e.target.checked)}
              disabled={disabled}
              aria-invalid={!!error}
              aria-describedby={error ? errorId : undefined}
              className="sr-only peer"
            />

            {/* Visual checkbox */}
            <div
              className={cn(
                'rounded border-2 transition-all duration-200',
                'flex items-center justify-center',
                sizes.box,
                isActive
                  ? 'bg-blue-500 border-blue-500'
                  : 'bg-transparent border-white/30 group-hover:border-white/50',
                'peer-focus:ring-2 peer-focus:ring-blue-500/50 peer-focus:ring-offset-2 peer-focus:ring-offset-transparent',
                error && 'border-red-500'
              )}
            >
              {/* Check or minus icon */}
              {checked && <CheckIcon className={cn(sizes.icon, 'text-white')} />}
              {indeterminate && !checked && <MinusIcon className={cn(sizes.icon, 'text-white')} />}
            </div>
          </div>

          {/* Label and description */}
          {(label || description) && (
            <div className="flex-1 min-w-0">
              {label && <span className={cn('text-white', sizes.text)}>{label}</span>}
              {description && (
                <p className={cn('text-white/50 mt-0.5', sizes.text === 'text-base' ? 'text-sm' : 'text-xs')}>
                  {description}
                </p>
              )}
            </div>
          )}
        </label>

        {/* Error message */}
        {error && (
          <p id={errorId} className="mt-1.5 text-xs text-red-400 pl-7" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
