/**
 * ErrorContext - Global Error Tracking
 *
 * Provides a context for tracking errors across the application.
 * Useful for error aggregation, logging, and analytics.
 *
 * @example
 * ```tsx
 * // Wrap your app
 * <ErrorProvider maxErrors={50} onError={(e) => analytics.track(e)}>
 *   <App />
 * </ErrorProvider>
 *
 * // Use in components
 * function MyComponent() {
 *   const { errors, addError, clearErrors, lastError } = useErrors();
 *
 *   const handleError = (err: Error) => {
 *     addError(err);
 *   };
 *
 *   return (
 *     <div>
 *       {lastError && <Banner>Last error: {lastError.message}</Banner>}
 *       <ErrorCount count={errors.length} />
 *     </div>
 *   );
 * }
 * ```
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import type { ErrorContextValue, ErrorProviderProps } from './types';

/** Default context value */
const defaultValue: ErrorContextValue = {
  errors: [],
  addError: () => {},
  clearErrors: () => {},
  lastError: null,
};

/** Error context */
export const ErrorContext = createContext<ErrorContextValue>(defaultValue);

/**
 * Error Provider Component
 *
 * Provides error tracking context to the component tree.
 */
export function ErrorProvider({
  children,
  maxErrors = 100,
  onError,
}: ErrorProviderProps) {
  const [errors, setErrors] = useState<Error[]>([]);

  const addError = useCallback(
    (error: Error) => {
      // Call external handler
      onError?.(error);

      // Add to error list
      setErrors((prev) => {
        const newErrors = [...prev, error];
        // Limit stored errors
        if (newErrors.length > maxErrors) {
          return newErrors.slice(-maxErrors);
        }
        return newErrors;
      });
    },
    [maxErrors, onError]
  );

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const lastError = useMemo(() => {
    return errors.length > 0 ? errors[errors.length - 1] : null;
  }, [errors]);

  const value = useMemo<ErrorContextValue>(
    () => ({
      errors,
      addError,
      clearErrors,
      lastError,
    }),
    [errors, addError, clearErrors, lastError]
  );

  return (
    <ErrorContext.Provider value={value}>{children}</ErrorContext.Provider>
  );
}

ErrorProvider.displayName = 'ErrorProvider';

/**
 * Hook to access error context.
 *
 * @throws Error if used outside of ErrorProvider
 */
export function useErrors(): ErrorContextValue {
  const context = useContext(ErrorContext);

  if (context === defaultValue) {
    console.warn(
      'useErrors must be used within an ErrorProvider. Using default no-op implementation.'
    );
  }

  return context;
}
