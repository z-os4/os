/**
 * ErrorBoundary Component
 *
 * Base error boundary for catching and handling React errors.
 * Provides a clean API for error handling with customizable fallback UI.
 *
 * @example
 * ```tsx
 * <ErrorBoundary
 *   fallback={(error, reset) => <ErrorFallback error={error} resetError={reset} />}
 *   onError={(error, info) => console.error(error, info)}
 * >
 *   <App />
 * </ErrorBoundary>
 * ```
 */

import React, { Component } from 'react';
import type { ErrorBoundaryProps, ErrorBoundaryState, ErrorInfo } from './types';
import { ErrorFallback } from './ErrorFallback';

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  static displayName = 'ErrorBoundary';

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Convert React's ErrorInfo to our ErrorInfo type
    const info: ErrorInfo = {
      componentStack: errorInfo.componentStack || '',
    };

    this.setState({ errorInfo: info });

    // Call error handler if provided
    this.props.onError?.(error, info);
  }

  reset = (): void => {
    this.props.onReset?.();
    this.setState({ error: null, errorInfo: null });
  };

  render() {
    const { error } = this.state;
    const { children, fallback } = this.props;

    if (error) {
      // Custom render function
      if (typeof fallback === 'function') {
        return fallback(error, this.reset);
      }

      // Custom fallback element
      if (fallback !== undefined) {
        return fallback;
      }

      // Default fallback
      return <ErrorFallback error={error} resetError={this.reset} />;
    }

    return children;
  }
}
