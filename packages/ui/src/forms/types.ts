/**
 * Shared Form Types
 *
 * Common types used across all form components.
 */

import type React from 'react';

/** Form field size variants */
export type FormSize = 'sm' | 'md' | 'lg';

/** Base props shared by all form field components */
export interface FormFieldBaseProps {
  /** Field label */
  label?: string;
  /** Error message to display */
  error?: string;
  /** Helper/hint text */
  hint?: string;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Whether the field is required */
  required?: boolean;
  /** Size variant */
  size?: FormSize;
  /** Additional class name */
  className?: string;
}

/** Props for text-based inputs */
export interface TextInputBaseProps extends FormFieldBaseProps {
  /** Current value */
  value: string;
  /** Change handler */
  onChange: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Whether the field is read-only */
  readOnly?: boolean;
  /** Leading icon */
  leadingIcon?: React.ReactNode;
  /** Trailing icon */
  trailingIcon?: React.ReactNode;
}

/** Select option type */
export interface SelectOption<T = string> {
  /** Option value */
  value: T;
  /** Display label */
  label: string;
  /** Whether option is disabled */
  disabled?: boolean;
  /** Optional group name */
  group?: string;
}

/** Validation rule */
export interface ValidationRule {
  /** Validation function - returns error message or undefined */
  validate: (value: unknown) => string | undefined;
  /** When to run validation */
  trigger?: 'change' | 'blur' | 'submit';
}

/** Form field state */
export interface FieldState {
  /** Whether field has been touched */
  touched: boolean;
  /** Whether field is dirty (value changed) */
  dirty: boolean;
  /** Current error message */
  error?: string;
  /** Whether field is being validated */
  validating: boolean;
}

/** Form state */
export interface FormState {
  /** Whether form is submitting */
  isSubmitting: boolean;
  /** Whether form is valid */
  isValid: boolean;
  /** Whether form is dirty */
  isDirty: boolean;
  /** Field states by name */
  fields: Record<string, FieldState>;
}

/** Form context value */
export interface FormContextValue {
  /** Register a field */
  registerField: (name: string, rules?: ValidationRule[]) => void;
  /** Unregister a field */
  unregisterField: (name: string) => void;
  /** Get field value */
  getValue: (name: string) => unknown;
  /** Set field value */
  setValue: (name: string, value: unknown) => void;
  /** Get field error */
  getError: (name: string) => string | undefined;
  /** Set field error */
  setError: (name: string, error: string | undefined) => void;
  /** Get field state */
  getFieldState: (name: string) => FieldState | undefined;
  /** Mark field as touched */
  setTouched: (name: string) => void;
  /** Form state */
  formState: FormState;
  /** Form size */
  size?: FormSize;
}

/** Size class mappings for form components */
export const SIZE_CLASSES = {
  sm: {
    input: 'h-7 px-2 text-xs',
    label: 'text-xs mb-1',
    icon: 'w-3.5 h-3.5',
    gap: 'gap-1',
  },
  md: {
    input: 'h-9 px-3 text-sm',
    label: 'text-sm mb-1.5',
    icon: 'w-4 h-4',
    gap: 'gap-2',
  },
  lg: {
    input: 'h-11 px-4 text-base',
    label: 'text-base mb-2',
    icon: 'w-5 h-5',
    gap: 'gap-3',
  },
} as const;

/** Glass styling constants */
export const GLASS_STYLES = {
  base: 'bg-black/40 backdrop-blur-xl border border-white/10',
  hover: 'hover:bg-white/10 hover:border-white/20',
  focus: 'focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-white/30',
  disabled: 'opacity-50 cursor-not-allowed',
  error: 'border-red-500/50 focus:border-red-500 focus:ring-red-500/50',
} as const;
