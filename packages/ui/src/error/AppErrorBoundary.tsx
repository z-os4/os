/**
 * AppErrorBoundary Component
 *
 * App-specific error boundary that shows a crash screen with app context.
 * Logs errors to console with app metadata.
 *
 * @example
 * ```tsx
 * <AppErrorBoundary
 *   appId="notes"
 *   appName="Notes"
 *   appIcon="/icons/notes.png"
 *   onCrash={(error) => analytics.trackCrash(error)}
 *   showReportButton
 *   onReport={(error, info) => sendReport(error, info)}
 * >
 *   <NotesApp />
 * </AppErrorBoundary>
 * ```
 */

import React, { Component } from 'react';
import type { AppErrorBoundaryProps, ErrorBoundaryState, ErrorInfo } from './types';
import { AppCrashScreen } from './AppCrashScreen';

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, ErrorBoundaryState> {
  static displayName = 'AppErrorBoundary';

  constructor(props: AppErrorBoundaryProps) {
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
    const { appId, appName, onError, onCrash } = this.props;

    // Convert React's ErrorInfo to our type
    const info: ErrorInfo = {
      componentStack: errorInfo.componentStack || '',
    };

    this.setState({ errorInfo: info });

    // Log error with app context
    console.group(`[${appName}] Application Crash`);
    console.error('Error:', error);
    console.error('App ID:', appId);
    console.error('App Name:', appName);
    if (info.componentStack) {
      console.error('Component Stack:', info.componentStack);
    }
    console.groupEnd();

    // Call handlers
    onError?.(error, info);
    onCrash?.(error);
  }

  handleRestart = (): void => {
    this.props.onReset?.();
    this.setState({ error: null, errorInfo: null });
  };

  handleClose = (): void => {
    this.props.onClose?.();
  };

  handleReport = (): void => {
    const { error, errorInfo } = this.state;
    if (error && this.props.onReport) {
      this.props.onReport(error, errorInfo || { componentStack: '' });
    }
  };

  render() {
    const { error, errorInfo } = this.state;
    const {
      children,
      fallback,
      appName,
      appIcon,
      showReportButton,
      onClose,
      onReport,
    } = this.props;

    if (error) {
      // Custom render function
      if (typeof fallback === 'function') {
        return fallback(error, this.handleRestart);
      }

      // Custom fallback element
      if (fallback !== undefined) {
        return fallback;
      }

      // Default app crash screen
      return (
        <AppCrashScreen
          appName={appName}
          appIcon={appIcon}
          error={error}
          errorInfo={errorInfo || undefined}
          onRestart={this.handleRestart}
          onClose={onClose ? this.handleClose : undefined}
          showReportButton={showReportButton && !!onReport}
          onReport={this.handleReport}
        />
      );
    }

    return children;
  }
}
