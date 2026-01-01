/**
 * FormField Component
 *
 * A wrapper component that provides consistent label, error, and hint styling.
 * Useful for wrapping custom form controls.
 *
 * @example
 * ```tsx
 * <FormField
 *   label="Custom Input"
 *   error={errors.custom}
 *   hint="Enter a value"
 *   required
 * >
 *   <MyCustomInput value={value} onChange={onChange} />
 * </FormField>
 * ```
 */

import React, { useId } from 'react';
import { cn } from '../lib/utils';
import { SIZE_CLASSES, type FormSize } from './types';

export interface FormFieldProps {
  /** Child elements (form control) */
  children: React.ReactNode;
  /** Field label */
  label?: string;
  /** Error message */
  error?: string;
  /** Hint/helper text */
  hint?: string;
  /** Whether field is required */
  required?: boolean;
  /** Whether field is disabled */
  disabled?: boolean;
  /** Size variant */
  size?: FormSize;
  /** Additional class name */
  className?: string;
  /** HTML for attribute for the label */
  htmlFor?: string;
  /** Description to display between label and field */
  description?: string;
}

export function FormField({
  children,
  label,
  error,
  hint,
  required = false,
  disabled = false,
  size = 'md',
  className,
  htmlFor,
  description,
}: FormFieldProps) {
  const id = useId();
  const fieldId = htmlFor ?? id;
  const errorId = `${fieldId}-error`;
  const hintId = `${fieldId}-hint`;
  const descId = `${fieldId}-desc`;
  const sizeClasses = SIZE_CLASSES[size];

  return (
    <div className={cn('w-full', disabled && 'opacity-50', className)}>
      {/* Label */}
      {label && (
        <label
          htmlFor={fieldId}
          className={cn(
            'block font-medium text-white/90',
            sizeClasses.label,
            required && "after:content-['*'] after:ml-0.5 after:text-red-400"
          )}
        >
          {label}
        </label>
      )}

      {/* Description */}
      {description && (
        <p id={descId} className="text-xs text-white/50 mb-2">
          {description}
        </p>
      )}

      {/* Field content */}
      <div
        aria-describedby={
          cn(
            error && errorId,
            hint && !error && hintId,
            description && descId
          ) || undefined
        }
      >
        {children}
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

FormField.displayName = 'FormField';

/**
 * FormFieldRow Component
 *
 * Horizontal layout for multiple form fields.
 *
 * @example
 * ```tsx
 * <FormFieldRow>
 *   <TextField label="First Name" value={first} onChange={setFirst} />
 *   <TextField label="Last Name" value={last} onChange={setLast} />
 * </FormFieldRow>
 * ```
 */
export interface FormFieldRowProps {
  /** Child elements (form fields) */
  children: React.ReactNode;
  /** Gap between fields */
  gap?: 'sm' | 'md' | 'lg';
  /** Additional class name */
  className?: string;
}

const gapClasses = {
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
};

export function FormFieldRow({ children, gap = 'md', className }: FormFieldRowProps) {
  return (
    <div className={cn('flex flex-col sm:flex-row w-full', gapClasses[gap], className)}>
      {React.Children.map(children, (child) => (
        <div className="flex-1 min-w-0">{child}</div>
      ))}
    </div>
  );
}

FormFieldRow.displayName = 'FormFieldRow';

/**
 * FormSection Component
 *
 * Groups related form fields with an optional title and description.
 *
 * @example
 * ```tsx
 * <FormSection title="Personal Information" description="Enter your details">
 *   <TextField label="Name" value={name} onChange={setName} />
 *   <TextField label="Email" value={email} onChange={setEmail} />
 * </FormSection>
 * ```
 */
export interface FormSectionProps {
  /** Child elements (form fields) */
  children: React.ReactNode;
  /** Section title */
  title?: string;
  /** Section description */
  description?: string;
  /** Additional class name */
  className?: string;
}

export function FormSection({ children, title, description, className }: FormSectionProps) {
  return (
    <fieldset className={cn('w-full', className)}>
      {/* Title */}
      {title && (
        <legend className="text-lg font-semibold text-white mb-1">{title}</legend>
      )}

      {/* Description */}
      {description && <p className="text-sm text-white/50 mb-4">{description}</p>}

      {/* Fields */}
      <div className="space-y-4">{children}</div>
    </fieldset>
  );
}

FormSection.displayName = 'FormSection';

/**
 * FormDivider Component
 *
 * A visual separator for form sections.
 */
export interface FormDividerProps {
  /** Additional class name */
  className?: string;
}

export function FormDivider({ className }: FormDividerProps) {
  return (
    <hr className={cn('border-t border-white/10 my-6', className)} />
  );
}

FormDivider.displayName = 'FormDivider';
