/**
 * Switch Component (Forms version)
 *
 * A polished toggle switch with glass styling and labels.
 * This is an enhanced version with form integration features.
 *
 * @example
 * ```tsx
 * <Switch
 *   checked={darkMode}
 *   onChange={setDarkMode}
 *   label="Dark Mode"
 *   description="Enable dark mode for better night viewing"
 * />
 * ```
 */

import React, { useId, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { type FormSize } from './types';

export interface FormSwitchProps {
  /** Whether the switch is on */
  checked: boolean;
  /** Change handler */
  onChange: (checked: boolean) => void;
  /** Switch label */
  label?: string;
  /** Description text */
  description?: string;
  /** Whether switch is disabled */
  disabled?: boolean;
  /** Size variant */
  size?: FormSize;
  /** Error message */
  error?: string;
  /** Label position */
  labelPosition?: 'left' | 'right';
  /** Additional class name */
  className?: string;
  /** Name attribute */
  name?: string;
}

const sizeConfig = {
  sm: {
    track: 'w-8 h-4',
    thumb: 'w-3 h-3',
    translate: 'translate-x-4',
    text: 'text-xs',
    gap: 'gap-2',
  },
  md: {
    track: 'w-11 h-6',
    thumb: 'w-5 h-5',
    translate: 'translate-x-5',
    text: 'text-sm',
    gap: 'gap-3',
  },
  lg: {
    track: 'w-14 h-7',
    thumb: 'w-6 h-6',
    translate: 'translate-x-7',
    text: 'text-base',
    gap: 'gap-3',
  },
};

export const FormSwitch = forwardRef<HTMLButtonElement, FormSwitchProps>(
  (
    {
      checked,
      onChange,
      label,
      description,
      disabled = false,
      size = 'md',
      error,
      labelPosition = 'right',
      className,
      name,
    },
    ref
  ) => {
    const id = useId();
    const errorId = `${id}-error`;
    const sizes = sizeConfig[size];

    const switchElement = (
      <button
        ref={ref}
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative rounded-full transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-transparent',
          sizes.track,
          checked ? 'bg-green-500' : 'bg-white/20',
          disabled && 'opacity-50 cursor-not-allowed',
          error && 'ring-2 ring-red-500/50'
        )}
      >
        <motion.span
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className={cn(
            'absolute top-0.5 left-0.5 rounded-full bg-white shadow-sm',
            sizes.thumb,
            checked && sizes.translate
          )}
        />
      </button>
    );

    // Hidden input for form submission
    const hiddenInput = name && (
      <input type="hidden" name={name} value={checked ? 'true' : 'false'} />
    );

    // No label - just return the switch
    if (!label && !description) {
      return (
        <div className={cn('inline-flex', className)}>
          {switchElement}
          {hiddenInput}
        </div>
      );
    }

    // With label
    return (
      <div className={cn('w-full', className)}>
        <label
          htmlFor={id}
          className={cn(
            'flex items-start cursor-pointer',
            sizes.gap,
            labelPosition === 'left' ? 'flex-row-reverse justify-end' : 'flex-row',
            disabled && 'cursor-not-allowed'
          )}
        >
          {switchElement}
          {hiddenInput}

          <div className="flex-1 min-w-0">
            {label && <span className={cn('text-white block', sizes.text)}>{label}</span>}
            {description && (
              <p
                className={cn(
                  'text-white/50 mt-0.5',
                  sizes.text === 'text-base' ? 'text-sm' : 'text-xs'
                )}
              >
                {description}
              </p>
            )}
          </div>
        </label>

        {/* Error message */}
        {error && (
          <p id={errorId} className="mt-1.5 text-xs text-red-400" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

FormSwitch.displayName = 'FormSwitch';
