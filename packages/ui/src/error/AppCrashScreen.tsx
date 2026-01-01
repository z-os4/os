/**
 * AppCrashScreen Component
 *
 * Full app crash UI with glass morphism styling.
 * Shows app context and provides restart/close actions.
 *
 * @example
 * ```tsx
 * <AppCrashScreen
 *   appName="Notes"
 *   appIcon="/icons/notes.png"
 *   error={error}
 *   onRestart={() => restartApp()}
 *   onClose={() => closeApp()}
 *   showReportButton={true}
 *   onReport={() => reportIssue()}
 * />
 * ```
 */

import React, { useState, type ReactNode } from 'react';
import { cn } from '../lib/utils';
import type { AppCrashScreenProps } from './types';

/** Crash icon */
const CrashIcon = () => (
  <svg
    className="w-16 h-16 text-red-400/80"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
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

/** Refresh icon */
const RefreshIcon = () => (
  <svg
    className="w-4 h-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M23 4v6h-6" />
    <path d="M1 20v-6h6" />
    <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
  </svg>
);

/** Close icon */
const CloseIcon = () => (
  <svg
    className="w-4 h-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 6L6 18" />
    <path d="M6 6l12 12" />
  </svg>
);

/** Report icon */
const ReportIcon = () => (
  <svg
    className="w-4 h-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
    <line x1="4" y1="22" x2="4" y2="15" />
  </svg>
);

/** Render app icon from string URL or ReactNode */
function renderAppIcon(icon: string | ReactNode | undefined): ReactNode {
  if (!icon) return null;

  if (typeof icon === 'string') {
    return (
      <img
        src={icon}
        alt=""
        className="w-16 h-16 rounded-xl shadow-lg"
        draggable={false}
      />
    );
  }

  return icon;
}

export function AppCrashScreen({
  appName,
  appIcon,
  error,
  errorInfo,
  onRestart,
  onClose,
  showReportButton = false,
  onReport,
  className,
}: AppCrashScreenProps) {
  const [detailsExpanded, setDetailsExpanded] = useState(false);

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center',
        'w-full h-full min-h-[300px]',
        'p-8',
        'bg-gradient-to-b from-black/40 to-black/60',
        className
      )}
      role="alert"
      aria-live="assertive"
    >
      {/* App Icon or Crash Icon */}
      <div className="mb-6">
        {appIcon ? (
          <div className="relative">
            {renderAppIcon(appIcon)}
            <div className="absolute -bottom-1 -right-1 bg-red-500 rounded-full p-1">
              <svg
                className="w-3 h-3 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </div>
          </div>
        ) : (
          <CrashIcon />
        )}
      </div>

      {/* Title */}
      <h2 className="text-xl font-semibold text-white mb-2">
        {appName} has crashed
      </h2>

      {/* Subtitle */}
      <p className="text-sm text-white/60 text-center max-w-md mb-8">
        An unexpected error occurred and the application could not continue.
      </p>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 mb-6">
        {onRestart && (
          <button
            type="button"
            onClick={onRestart}
            className={cn(
              'flex items-center gap-2',
              'px-4 py-2.5',
              'bg-blue-500 hover:bg-blue-600 active:bg-blue-700',
              'text-sm font-medium text-white',
              'rounded-lg',
              'transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-black'
            )}
          >
            <RefreshIcon />
            Try Again
          </button>
        )}

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className={cn(
              'flex items-center gap-2',
              'px-4 py-2.5',
              'bg-white/10 hover:bg-white/15 active:bg-white/20',
              'text-sm font-medium text-white',
              'rounded-lg',
              'border border-white/10',
              'transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-white/20'
            )}
          >
            <CloseIcon />
            Close App
          </button>
        )}
      </div>

      {/* Report Button */}
      {showReportButton && onReport && (
        <button
          type="button"
          onClick={onReport}
          className={cn(
            'flex items-center gap-2',
            'px-3 py-1.5',
            'text-xs text-white/40 hover:text-white/60',
            'transition-colors'
          )}
        >
          <ReportIcon />
          Report Issue
        </button>
      )}

      {/* Error Details */}
      <div className="mt-6 w-full max-w-lg">
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
          <span>View Details</span>
          <ChevronIcon expanded={detailsExpanded} />
        </button>

        {detailsExpanded && (
          <div
            className={cn(
              'mt-2 p-4',
              'bg-black/40 backdrop-blur-sm',
              'border border-white/5',
              'rounded-lg',
              'overflow-auto max-h-64'
            )}
          >
            {/* Error Name and Message */}
            <div className="mb-3">
              <p className="text-xs font-medium text-red-400 mb-1">
                {error.name}
              </p>
              <p className="text-xs text-white/60 break-all">
                {error.message}
              </p>
            </div>

            {/* Stack Trace */}
            {error.stack && (
              <div className="mb-3">
                <p className="text-xs font-medium text-white/40 mb-1">
                  Stack Trace
                </p>
                <pre className="text-xs font-mono text-white/30 whitespace-pre-wrap break-all">
                  {error.stack.split('\n').slice(1, 8).join('\n')}
                </pre>
              </div>
            )}

            {/* Component Stack */}
            {errorInfo?.componentStack && (
              <div>
                <p className="text-xs font-medium text-white/40 mb-1">
                  Component Stack
                </p>
                <pre className="text-xs font-mono text-white/30 whitespace-pre-wrap break-all">
                  {errorInfo.componentStack.trim().split('\n').slice(0, 5).join('\n')}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

AppCrashScreen.displayName = 'AppCrashScreen';
