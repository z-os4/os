/**
 * RadioGroup Component
 *
 * A group of radio buttons with shared state management.
 *
 * @example
 * ```tsx
 * <RadioGroup
 *   value={plan}
 *   onChange={setPlan}
 *   options={[
 *     { value: 'free', label: 'Free', description: '0$/month' },
 *     { value: 'pro', label: 'Pro', description: '10$/month' },
 *     { value: 'enterprise', label: 'Enterprise', description: 'Contact us' },
 *   ]}
 *   label="Select a plan"
 * />
 * ```
 */

import React, { useId } from 'react';
import { cn } from '../lib/utils';
import { Radio } from './Radio';
import { SIZE_CLASSES, type FormSize, type SelectOption } from './types';

export interface RadioOption<T = string> extends SelectOption<T> {
  /** Optional description for the option */
  description?: string;
}

export interface RadioGroupProps<T = string> {
  /** Currently selected value */
  value: T | undefined;
  /** Change handler */
  onChange: (value: T) => void;
  /** Available options */
  options: RadioOption<T>[];
  /** Group label */
  label?: string;
  /** Hint/helper text */
  hint?: string;
  /** Error message */
  error?: string;
  /** Whether the group is disabled */
  disabled?: boolean;
  /** Whether the group is required */
  required?: boolean;
  /** Size variant */
  size?: FormSize;
  /** Layout direction */
  direction?: 'horizontal' | 'vertical';
  /** Additional class name */
  className?: string;
  /** Name attribute for all radios */
  name?: string;
}

export function RadioGroup<T = string>({
  value,
  onChange,
  options,
  label,
  hint,
  error,
  disabled = false,
  required = false,
  size = 'md',
  direction = 'vertical',
  className,
  name,
}: RadioGroupProps<T>) {
  const groupId = useId();
  const groupName = name ?? groupId;
  const errorId = `${groupId}-error`;
  const hintId = `${groupId}-hint`;
  const sizeClasses = SIZE_CLASSES[size];

  return (
    <fieldset
      className={cn('w-full', className)}
      aria-describedby={cn(error && errorId, hint && !error && hintId) || undefined}
    >
      {/* Legend / Label */}
      {label && (
        <legend
          className={cn(
            'font-medium text-white/90 mb-2',
            sizeClasses.label,
            required && "after:content-['*'] after:ml-0.5 after:text-red-400"
          )}
        >
          {label}
        </legend>
      )}

      {/* Radio buttons */}
      <div
        role="radiogroup"
        className={cn(
          'flex',
          direction === 'vertical' ? 'flex-col gap-2' : 'flex-wrap gap-4'
        )}
      >
        {options.map((option) => (
          <Radio
            key={String(option.value)}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            label={option.label}
            description={option.description}
            disabled={disabled || option.disabled}
            size={size}
            name={groupName}
            value={String(option.value)}
          />
        ))}
      </div>

      {/* Error message */}
      {error && (
        <p id={errorId} className="mt-2 text-xs text-red-400" role="alert">
          {error}
        </p>
      )}

      {/* Hint text */}
      {hint && !error && (
        <p id={hintId} className="mt-2 text-xs text-white/50">
          {hint}
        </p>
      )}
    </fieldset>
  );
}

RadioGroup.displayName = 'RadioGroup';
