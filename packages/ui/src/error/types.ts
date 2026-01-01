/**
 * Error Boundary Types
 *
 * Type definitions for error handling components in zOS.
 */

import type { ReactNode } from 'react';

/** React error info from componentDidCatch */
export interface ErrorInfo {
  componentStack: string;
}

/** Base error boundary props */
export interface ErrorBoundaryProps {
  children: ReactNode;
  /** Custom fallback UI or render function */
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  /** Callback when an error is caught */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Callback when error boundary resets */
  onReset?: () => void;
}

/** App-specific error boundary props */
export interface AppErrorBoundaryProps extends ErrorBoundaryProps {
  /** Unique app identifier */
  appId: string;
  /** Display name of the app */
  appName: string;
  /** App icon URL or component */
  appIcon?: string | ReactNode;
  /** Callback when app crashes */
  onCrash?: (error: Error) => void;
  /** Show "Report Issue" button */
  showReportButton?: boolean;
  /** Callback when user reports an issue */
  onReport?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Callback when user closes the app */
  onClose?: () => void;
}

/** Default error fallback props */
export interface ErrorFallbackProps {
  error: Error;
  /** Reset error state */
  resetError?: () => void;
  /** Custom title */
  title?: string;
  /** Custom description */
  description?: string;
  /** Show error details */
  showDetails?: boolean;
  /** Show reset button */
  showReset?: boolean;
  /** Custom class name */
  className?: string;
}

/** App crash screen props */
export interface AppCrashScreenProps {
  /** App name to display */
  appName: string;
  /** App icon URL or component */
  appIcon?: string | ReactNode;
  /** The error that caused the crash */
  error: Error;
  /** Error info with component stack */
  errorInfo?: ErrorInfo;
  /** Callback to restart the app */
  onRestart?: () => void;
  /** Callback to close the app */
  onClose?: () => void;
  /** Show report button */
  showReportButton?: boolean;
  /** Callback when user reports issue */
  onReport?: () => void;
  /** Custom class name */
  className?: string;
}

/** Error context value */
export interface ErrorContextValue {
  /** List of tracked errors */
  errors: Error[];
  /** Add an error to tracking */
  addError: (error: Error) => void;
  /** Clear all tracked errors */
  clearErrors: () => void;
  /** Most recent error */
  lastError: Error | null;
}

/** Error provider props */
export interface ErrorProviderProps {
  children: ReactNode;
  /** Maximum number of errors to track */
  maxErrors?: number;
  /** Callback when error is added */
  onError?: (error: Error) => void;
}

/** Error boundary state */
export interface ErrorBoundaryState {
  error: Error | null;
  errorInfo: ErrorInfo | null;
}
