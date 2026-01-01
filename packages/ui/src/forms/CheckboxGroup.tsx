/**
 * CheckboxGroup Component
 *
 * A group of checkboxes with shared state management.
 *
 * @example
 * ```tsx
 * <CheckboxGroup
 *   value={selectedFruits}
 *   onChange={setSelectedFruits}
 *   options={[
 *     { value: 'apple', label: 'Apple' },
 *     { value: 'banana', label: 'Banana' },
 *     { value: 'orange', label: 'Orange' },
 *   ]}
 *   label="Select fruits"
 * />
 * ```
 */

import React, { useId, useMemo, useCallback } from 'react';
import { cn } from '../lib/utils';
import { Checkbox } from './Checkbox';
import { SIZE_CLASSES, type FormSize, type SelectOption } from './types';

export interface CheckboxGroupProps<T = string> {
  /** Selected values */
  value: T[];
  /** Change handler */
  onChange: (value: T[]) => void;
  /** Available options */
  options: SelectOption<T>[];
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
  /** Name attribute for all checkboxes */
  name?: string;
}

export function CheckboxGroup<T = string>({
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
}: CheckboxGroupProps<T>) {
  const groupId = useId();
  const errorId = `${groupId}-error`;
  const hintId = `${groupId}-hint`;
  const sizeClasses = SIZE_CLASSES[size];

  // Track which values are selected
  const selectedSet = useMemo(() => new Set(value), [value]);

  // Handle individual checkbox change
  const handleChange = useCallback(
    (optionValue: T, checked: boolean) => {
      if (checked) {
        onChange([...value, optionValue]);
      } else {
        onChange(value.filter((v) => v !== optionValue));
      }
    },
    [value, onChange]
  );

  // Select all / deselect all helpers
  const allSelected = options.every((opt) => selectedSet.has(opt.value) || opt.disabled);
  const someSelected = options.some((opt) => selectedSet.has(opt.value));
  const indeterminate = someSelected && !allSelected;

  const handleSelectAll = useCallback(() => {
    if (allSelected) {
      // Deselect all non-disabled options
      const disabledValues = options.filter((opt) => opt.disabled).map((opt) => opt.value);
      onChange(value.filter((v) => disabledValues.includes(v)));
    } else {
      // Select all non-disabled options
      const nonDisabledValues = options.filter((opt) => !opt.disabled).map((opt) => opt.value);
      const currentDisabledValues = value.filter((v) =>
        options.some((opt) => opt.value === v && opt.disabled)
      );
      onChange([...new Set([...currentDisabledValues, ...nonDisabledValues])]);
    }
  }, [allSelected, options, value, onChange]);

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

      {/* Checkboxes */}
      <div
        role="group"
        className={cn(
          'flex',
          direction === 'vertical' ? 'flex-col gap-2' : 'flex-wrap gap-4'
        )}
      >
        {options.map((option) => (
          <Checkbox
            key={String(option.value)}
            checked={selectedSet.has(option.value)}
            onChange={(checked) => handleChange(option.value, checked)}
            label={option.label}
            disabled={disabled || option.disabled}
            size={size}
            name={name}
            value={String(option.value)}
            error={undefined} // Don't show individual errors
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

CheckboxGroup.displayName = 'CheckboxGroup';
