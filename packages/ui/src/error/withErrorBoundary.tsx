/**
 * withErrorBoundary HOC
 *
 * Higher-order component that wraps a component with an ErrorBoundary.
 *
 * @example
 * ```tsx
 * const SafeComponent = withErrorBoundary(UnsafeComponent, {
 *   fallback: <ErrorFallback error={new Error('default')} />,
 *   onError: (error) => console.error(error),
 * });
 *
 * // Or with render function fallback
 * const SafeApp = withErrorBoundary(App, {
 *   fallback: (error, reset) => (
 *     <ErrorFallback error={error} resetError={reset} />
 *   ),
 * });
 * ```
 */

import React, { type ComponentType } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import type { ErrorBoundaryProps } from './types';

export type WithErrorBoundaryOptions = Omit<ErrorBoundaryProps, 'children'>;

/**
 * HOC that wraps a component with an ErrorBoundary.
 *
 * @param Component - The component to wrap
 * @param options - ErrorBoundary options (fallback, onError, onReset)
 * @returns A new component wrapped with an ErrorBoundary
 */
export function withErrorBoundary<P extends object>(
  Component: ComponentType<P>,
  options?: WithErrorBoundaryOptions
): ComponentType<P> {
  const displayName = Component.displayName || Component.name || 'Component';

  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...options}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${displayName})`;

  return WrappedComponent;
}
