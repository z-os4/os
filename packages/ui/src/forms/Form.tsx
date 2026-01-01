/**
 * Form Component
 *
 * A form container with validation support and state management.
 *
 * @example
 * ```tsx
 * <Form
 *   onSubmit={handleSubmit}
 *   initialValues={{ email: '', password: '' }}
 *   validate={(values) => {
 *     const errors: Record<string, string> = {};
 *     if (!values.email) errors.email = 'Email is required';
 *     return errors;
 *   }}
 * >
 *   {({ values, errors, handleChange, isSubmitting }) => (
 *     <>
 *       <TextField
 *         value={values.email}
 *         onChange={(v) => handleChange('email', v)}
 *         error={errors.email}
 *         label="Email"
 *       />
 *       <Button type="submit" loading={isSubmitting}>
 *         Submit
 *       </Button>
 *     </>
 *   )}
 * </Form>
 * ```
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { cn } from '../lib/utils';
import { type FormSize, type FormState, type FormContextValue } from './types';

/** Form values type */
export type FormValues = Record<string, unknown>;

/** Form errors type */
export type FormErrors<T> = Partial<Record<keyof T, string>>;

/** Form touched fields type */
export type FormTouched<T> = Partial<Record<keyof T, boolean>>;

/** Validation function type */
export type ValidateFn<T> = (values: T) => FormErrors<T> | Promise<FormErrors<T>>;

/** Form render props */
export interface FormRenderProps<T extends FormValues> {
  /** Current form values */
  values: T;
  /** Current form errors */
  errors: FormErrors<T>;
  /** Touched fields */
  touched: FormTouched<T>;
  /** Whether form is submitting */
  isSubmitting: boolean;
  /** Whether form is valid */
  isValid: boolean;
  /** Whether form is dirty (any value changed) */
  isDirty: boolean;
  /** Handle value change */
  handleChange: <K extends keyof T>(name: K, value: T[K]) => void;
  /** Handle blur */
  handleBlur: (name: keyof T) => void;
  /** Set field value */
  setFieldValue: <K extends keyof T>(name: K, value: T[K]) => void;
  /** Set field error */
  setFieldError: (name: keyof T, error: string | undefined) => void;
  /** Set multiple values */
  setValues: (values: Partial<T>) => void;
  /** Set multiple errors */
  setErrors: (errors: FormErrors<T>) => void;
  /** Reset form to initial values */
  reset: () => void;
  /** Submit the form programmatically */
  submit: () => Promise<void>;
}

export interface FormProps<T extends FormValues> {
  /** Form content - either children or render function */
  children: React.ReactNode | ((props: FormRenderProps<T>) => React.ReactNode);
  /** Initial form values */
  initialValues: T;
  /** Submit handler */
  onSubmit: (values: T) => void | Promise<void>;
  /** Validation function */
  validate?: ValidateFn<T>;
  /** Validate on blur */
  validateOnBlur?: boolean;
  /** Validate on change */
  validateOnChange?: boolean;
  /** Form size (passed to form context) */
  size?: FormSize;
  /** Additional class name */
  className?: string;
  /** Disable the form */
  disabled?: boolean;
  /** Reset form after successful submit */
  resetOnSubmit?: boolean;
  /** Called when form becomes dirty */
  onDirtyChange?: (isDirty: boolean) => void;
}

// Form context for nested components
const FormContext = createContext<FormContextValue | null>(null);

export function useFormContext(): FormContextValue | null {
  return useContext(FormContext);
}

export function Form<T extends FormValues>({
  children,
  initialValues,
  onSubmit,
  validate,
  validateOnBlur = true,
  validateOnChange = false,
  size = 'md',
  className,
  disabled = false,
  resetOnSubmit = false,
  onDirtyChange,
}: FormProps<T>) {
  // State
  const [values, setValuesState] = useState<T>(initialValues);
  const [errors, setErrorsState] = useState<FormErrors<T>>({});
  const [touched, setTouched] = useState<FormTouched<T>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Refs for latest values in callbacks
  const valuesRef = useRef(values);
  valuesRef.current = values;

  const initialValuesRef = useRef(initialValues);

  // Compute derived state
  const isDirty = useMemo(() => {
    return Object.keys(values).some(
      (key) => values[key as keyof T] !== initialValuesRef.current[key as keyof T]
    );
  }, [values]);

  const isValid = useMemo(() => {
    return Object.keys(errors).length === 0;
  }, [errors]);

  // Notify on dirty change
  const prevIsDirtyRef = useRef(isDirty);
  if (prevIsDirtyRef.current !== isDirty) {
    prevIsDirtyRef.current = isDirty;
    onDirtyChange?.(isDirty);
  }

  // Run validation
  const runValidation = useCallback(
    async (valuesToValidate: T): Promise<FormErrors<T>> => {
      if (!validate) return {};
      try {
        const result = await validate(valuesToValidate);
        return result;
      } catch (err) {
        console.error('Form validation error:', err);
        return {};
      }
    },
    [validate]
  );

  // Handle value change
  const handleChange = useCallback(
    async <K extends keyof T>(name: K, value: T[K]) => {
      const newValues = { ...valuesRef.current, [name]: value };
      setValuesState(newValues);

      if (validateOnChange) {
        const newErrors = await runValidation(newValues);
        setErrorsState(newErrors);
      }
    },
    [validateOnChange, runValidation]
  );

  // Handle blur
  const handleBlur = useCallback(
    async (name: keyof T) => {
      setTouched((prev) => ({ ...prev, [name]: true }));

      if (validateOnBlur) {
        const newErrors = await runValidation(valuesRef.current);
        setErrorsState(newErrors);
      }
    },
    [validateOnBlur, runValidation]
  );

  // Set field value
  const setFieldValue = useCallback(
    <K extends keyof T>(name: K, value: T[K]) => {
      handleChange(name, value);
    },
    [handleChange]
  );

  // Set field error
  const setFieldError = useCallback((name: keyof T, error: string | undefined) => {
    setErrorsState((prev) => {
      if (error === undefined) {
        const { [name]: _, ...rest } = prev;
        return rest as FormErrors<T>;
      }
      return { ...prev, [name]: error };
    });
  }, []);

  // Set multiple values
  const setValues = useCallback((newValues: Partial<T>) => {
    setValuesState((prev) => ({ ...prev, ...newValues }));
  }, []);

  // Set multiple errors
  const setErrors = useCallback((newErrors: FormErrors<T>) => {
    setErrorsState(newErrors);
  }, []);

  // Reset form
  const reset = useCallback(() => {
    setValuesState(initialValuesRef.current);
    setErrorsState({});
    setTouched({});
  }, []);

  // Submit form
  const submit = useCallback(async () => {
    if (disabled || isSubmitting) return;

    // Mark all fields as touched
    const allTouched = Object.keys(valuesRef.current).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {} as FormTouched<T>
    );
    setTouched(allTouched);

    // Run validation
    const validationErrors = await runValidation(valuesRef.current);
    setErrorsState(validationErrors);

    // Check if valid
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    // Submit
    setIsSubmitting(true);
    try {
      await onSubmit(valuesRef.current);
      if (resetOnSubmit) {
        reset();
      }
    } catch (err) {
      console.error('Form submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  }, [disabled, isSubmitting, runValidation, onSubmit, resetOnSubmit, reset]);

  // Handle form submit
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      await submit();
    },
    [submit]
  );

  // Render props
  const renderProps: FormRenderProps<T> = {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    isDirty,
    handleChange,
    handleBlur,
    setFieldValue,
    setFieldError,
    setValues,
    setErrors,
    reset,
    submit,
  };

  // Context value
  const contextValue: FormContextValue = useMemo(
    () => ({
      registerField: () => {},
      unregisterField: () => {},
      getValue: (name: string) => values[name as keyof T],
      setValue: (name: string, value: unknown) =>
        handleChange(name as keyof T, value as T[keyof T]),
      getError: (name: string) => errors[name as keyof T],
      setError: (name: string, error: string | undefined) =>
        setFieldError(name as keyof T, error),
      getFieldState: (name: string) => ({
        touched: touched[name as keyof T] ?? false,
        dirty: values[name as keyof T] !== initialValuesRef.current[name as keyof T],
        error: errors[name as keyof T],
        validating: false,
      }),
      setTouched: (name: string) => handleBlur(name as keyof T),
      formState: {
        isSubmitting,
        isValid,
        isDirty,
        fields: {},
      },
      size,
    }),
    [values, errors, touched, isSubmitting, isValid, isDirty, handleChange, setFieldError, handleBlur, size]
  );

  return (
    <FormContext.Provider value={contextValue}>
      <form
        onSubmit={handleSubmit}
        className={cn('w-full space-y-4', className)}
        noValidate
      >
        <fieldset disabled={disabled || isSubmitting} className="contents">
          {typeof children === 'function' ? children(renderProps) : children}
        </fieldset>
      </form>
    </FormContext.Provider>
  );
}

Form.displayName = 'Form';

/**
 * FormActions Component
 *
 * Container for form action buttons (submit, cancel, etc.)
 *
 * @example
 * ```tsx
 * <FormActions>
 *   <Button variant="ghost" onClick={handleCancel}>Cancel</Button>
 *   <Button type="submit">Save</Button>
 * </FormActions>
 * ```
 */
export interface FormActionsProps {
  /** Child elements (buttons) */
  children: React.ReactNode;
  /** Alignment */
  align?: 'left' | 'center' | 'right' | 'between';
  /** Additional class name */
  className?: string;
}

const alignClasses = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
  between: 'justify-between',
};

export function FormActions({ children, align = 'right', className }: FormActionsProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 pt-4',
        alignClasses[align],
        className
      )}
    >
      {children}
    </div>
  );
}

FormActions.displayName = 'FormActions';

/**
 * useFormField Hook
 *
 * Hook for connecting custom form controls to the form context.
 *
 * @example
 * ```tsx
 * function MyField({ name }: { name: string }) {
 *   const { value, error, onChange, onBlur } = useFormField(name);
 *   return (
 *     <input
 *       value={value as string}
 *       onChange={(e) => onChange(e.target.value)}
 *       onBlur={onBlur}
 *     />
 *   );
 * }
 * ```
 */
export function useFormField(name: string) {
  const ctx = useFormContext();

  if (!ctx) {
    throw new Error('useFormField must be used within a Form component');
  }

  return {
    value: ctx.getValue(name),
    error: ctx.getError(name),
    fieldState: ctx.getFieldState(name),
    onChange: (value: unknown) => ctx.setValue(name, value),
    onBlur: () => ctx.setTouched(name),
    setError: (error: string | undefined) => ctx.setError(name, error),
    size: ctx.size,
  };
}
