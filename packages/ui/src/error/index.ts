/**
 * Error Boundary Components
 *
 * Comprehensive error handling for zOS applications.
 *
 * @module error
 */

// Types
export type {
  ErrorInfo,
  ErrorBoundaryProps,
  AppErrorBoundaryProps,
  ErrorFallbackProps,
  AppCrashScreenProps,
  ErrorContextValue,
  ErrorProviderProps,
  ErrorBoundaryState,
} from './types';

// Components
export { ErrorBoundary } from './ErrorBoundary';
export { AppErrorBoundary } from './AppErrorBoundary';
export { ErrorFallback } from './ErrorFallback';
export { AppCrashScreen } from './AppCrashScreen';

// HOC
export { withErrorBoundary, type WithErrorBoundaryOptions } from './withErrorBoundary';

// Context
export { ErrorContext, ErrorProvider, useErrors } from './ErrorContext';

// Hooks
export { useErrorHandler, useAsyncError, type UseErrorHandlerResult } from './useErrorHandler';
