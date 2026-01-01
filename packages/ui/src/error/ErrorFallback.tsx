/**
 * ErrorFallback Component
 *
 * Default error fallback UI with glass morphism styling.
 * Shows a user-friendly error message instead of raw stack traces.
 *
 * @example
 * ```tsx
 * <ErrorFallback
 *   error={error}
 *   resetError={() => window.location.reload()}
 *   title="Something went wrong"
 *   showDetails={true}
 * />
 * ```
 */

import React, { useState } from 'react';
import { cn } from '../lib/utils';
import type { ErrorFallbackProps } from './types';

/** Error icon */
const ErrorIcon = () => (
  <svg
    className="w-12 h-12 text-red-400"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 8v4" />
    <path d="M12 16h.01" />
  </svg>
);

/** Chevron icon for details toggle */
const ChevronIcon = ({ expanded }: { expanded: boolean }) => (
  <svg
    className={cn(
      'w-4 h-4 transition-transform duration-200',
      expanded && 'rotate-180'
    )}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6 9l6 6 6-6" />
  </svg>
);

/** Get user-friendly error message */
function getUserFriendlyMessage(error: Error): string {
  const message = error.message.toLowerCase();

  if (message.includes('network') || message.includes('fetch')) {
    return 'A network error occurred. Please check your connection and try again.';
  }

  if (message.includes('timeout')) {
    return 'The operation timed out. Please try again.';
  }

  if (message.includes('permission') || message.includes('denied')) {
    return 'You do not have permission to perform this action.';
  }

  if (message.includes('not found') || message.includes('404')) {
    return 'The requested resource could not be found.';
  }

  if (message.includes('invalid') || message.includes('validation')) {
    return 'Invalid data was provided. Please check your input.';
  }

  // Default friendly message
  return 'An unexpected error occurred. Our team has been notified.';
}

export function ErrorFallback({
  error,
  resetError,
  title = 'Something went wrong',
  description,
  showDetails = true,
  showReset = true,
  className,
}: ErrorFallbackProps) {
  const [detailsExpanded, setDetailsExpanded] = useState(false);

  const friendlyMessage = description || getUserFriendlyMessage(error);

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8',
        'min-h-[200px]',
        className
      )}
      role="alert"
      aria-live="assertive"
    >
      {/* Icon */}
      <div className="mb-4">
        <ErrorIcon />
      </div>

      {/* Title */}
      <h2 className="text-lg font-semibold text-white mb-2">{title}</h2>

      {/* Description */}
      <p className="text-sm text-white/60 text-center max-w-md mb-6">
        {friendlyMessage}
      </p>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {showReset && resetError && (
          <button
            type="button"
            onClick={resetError}
            className={cn(
              'px-4 py-2',
              'bg-white/10 hover:bg-white/15 active:bg-white/20',
              'text-sm font-medium text-white',
              'rounded-lg',
              'border border-white/10',
              'transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-white/20'
            )}
          >
            Try Again
          </button>
        )}
      </div>

      {/* Error Details */}
      {showDetails && (
        <div className="mt-6 w-full max-w-md">
          <button
            type="button"
            onClick={() => setDetailsExpanded(!detailsExpanded)}
            className={cn(
              'flex items-center justify-between w-full',
              'px-3 py-2',
              'text-xs text-white/40 hover:text-white/60',
              'transition-colors'
            )}
          >
            <span>View technical details</span>
            <ChevronIcon expanded={detailsExpanded} />
          </button>

          {detailsExpanded && (
            <div
              className={cn(
                'mt-2 p-3',
                'bg-black/40',
                'border border-white/5',
                'rounded-lg',
                'overflow-auto max-h-48'
              )}
            >
              <p className="text-xs font-mono text-red-400/80 break-all">
                {error.name}: {error.message}
              </p>
              {error.stack && (
                <pre className="mt-2 text-xs font-mono text-white/30 whitespace-pre-wrap break-all">
                  {error.stack.split('\n').slice(1, 6).join('\n')}
                </pre>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

ErrorFallback.displayName = 'ErrorFallback';
