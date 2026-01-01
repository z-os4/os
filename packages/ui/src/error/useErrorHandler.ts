/**
 * useErrorHandler Hook
 *
 * Hooks for handling errors in functional components.
 *
 * @example
 * ```tsx
 * // Basic error handling
 * function MyComponent() {
 *   const { handleError, error, clearError } = useErrorHandler();
 *
 *   const fetchData = async () => {
 *     try {
 *       await api.getData();
 *     } catch (err) {
 *       handleError(err as Error);
 *     }
 *   };
 *
 *   if (error) {
 *     return <ErrorFallback error={error} resetError={clearError} />;
 *   }
 *
 *   return <Data />;
 * }
 *
 * // Throw error to boundary
 * function AsyncComponent() {
 *   const throwError = useAsyncError();
 *
 *   useEffect(() => {
 *     fetch('/api/data')
 *       .catch((err) => throwError(err));
 *   }, []);
 *
 *   return <Content />;
 * }
 * ```
 */

import { useState, useCallback } from 'react';

export interface UseErrorHandlerResult {
  /** Handle an error (sets error state) */
  handleError: (error: Error) => void;
  /** Clear the current error */
  clearError: () => void;
  /** Current error or null */
  error: Error | null;
}

/**
 * Hook for handling errors in functional components.
 * Provides error state management without throwing to boundary.
 */
export function useErrorHandler(): UseErrorHandlerResult {
  const [error, setError] = useState<Error | null>(null);

  const handleError = useCallback((err: Error) => {
    console.error('Error caught by useErrorHandler:', err);
    setError(err);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    handleError,
    clearError,
    error,
  };
}

/**
 * Hook for throwing async errors to the nearest error boundary.
 * Use this to propagate errors from async operations to React's error boundary.
 *
 * Note: React error boundaries don't catch errors in:
 * - Event handlers
 * - Asynchronous code (setTimeout, fetch, etc.)
 * - Server-side rendering
 * - Errors in the boundary itself
 *
 * This hook works around the async limitation by forcing a re-render
 * that throws the error during the render phase.
 */
export function useAsyncError(): (error: Error) => void {
  const [, setError] = useState<Error | null>(null);

  return useCallback((error: Error) => {
    setError(() => {
      throw error;
    });
  }, []);
}
