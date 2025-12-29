/**
 * DynamicApp Component
 *
 * Renders an app dynamically with proper lifecycle management.
 * Handles loading, errors, and clean unmounting.
 */

import React, { Suspense, useEffect, useRef, useCallback } from 'react';
import { useApp, type UseAppOptions } from '../hooks/useApp';
import { AppIdContext } from '../hooks/useLifecycle';
import {
  createLifecycle,
  markMounted,
  unmountApp,
  forceQuitApp,
  destroyLifecycle,
  getLifecycle,
} from '../lifecycle';

export interface DynamicAppProps {
  /** App identifier or name */
  appId: string;
  /** Close handler - called when app requests close */
  onClose: () => void;
  /** Focus handler */
  onFocus?: () => void;
  /** Called after app is fully unmounted and cleaned up */
  onUnmounted?: () => void;
  /** Loading options */
  options?: UseAppOptions;
  /** Custom loading component */
  loadingComponent?: React.ReactNode;
  /** Custom error component */
  errorComponent?: (error: Error, retry: () => void) => React.ReactNode;
  /** Force quit timeout (ms) - if app doesn't quit gracefully, force it */
  forceQuitTimeout?: number;
}

const DefaultLoading: React.FC<{ appId: string }> = ({ appId }) => (
  <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
    <div className="bg-black/80 backdrop-blur-xl rounded-2xl p-8 text-center shadow-2xl">
      <div className="w-12 h-12 mx-auto mb-4 border-3 border-white/20 border-t-white rounded-full animate-spin" />
      <p className="text-white/80 text-sm font-medium">Loading {appId}...</p>
      <p className="text-white/40 text-xs mt-1">Fetching from CDN</p>
    </div>
  </div>
);

const DefaultError: React.FC<{ error: Error; appId: string; onRetry: () => void; onClose: () => void }> = ({
  error,
  appId,
  onRetry,
  onClose,
}) => (
  <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
    <div className="bg-black/80 backdrop-blur-xl rounded-2xl p-8 text-center shadow-2xl max-w-sm pointer-events-auto">
      <div className="text-4xl mb-4">⚠️</div>
      <h3 className="text-white font-semibold text-lg mb-2">Failed to load {appId}</h3>
      <p className="text-white/60 text-sm mb-4">{error.message}</p>
      <div className="flex gap-3 justify-center">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
        >
          Close
        </button>
        <button
          onClick={onRetry}
          className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  </div>
);

export const DynamicApp: React.FC<DynamicAppProps> = ({
  appId,
  onClose,
  onFocus,
  onUnmounted,
  options,
  loadingComponent,
  errorComponent,
  forceQuitTimeout = 5000,
}) => {
  const { Component, isLoading, error, reload, hasUpdate } = useApp(appId, options);
  const containerRef = useRef<HTMLDivElement>(null);
  const isUnmountingRef = useRef(false);

  // Initialize lifecycle when component mounts
  useEffect(() => {
    // Create lifecycle for this app instance
    if (!getLifecycle(appId)) {
      createLifecycle(appId);
    }

    return () => {
      // Cleanup on unmount
      if (!isUnmountingRef.current) {
        handleQuit();
      }
    };
  }, [appId]);

  // Mark as mounted when component loads
  useEffect(() => {
    if (Component && containerRef.current) {
      markMounted(appId, containerRef.current);
    }
  }, [Component, appId]);

  // Handle graceful quit with force quit fallback
  const handleQuit = useCallback(async () => {
    if (isUnmountingRef.current) return;
    isUnmountingRef.current = true;

    console.log(`[DynamicApp] Quitting app: ${appId}`);

    // Set up force quit timeout
    const forceQuitTimer = setTimeout(() => {
      console.warn(`[DynamicApp] App ${appId} didn't quit gracefully, forcing...`);
      forceQuitApp(appId);
      destroyLifecycle(appId);
      onUnmounted?.();
    }, forceQuitTimeout);

    try {
      // Try graceful unmount
      await unmountApp(appId);
      clearTimeout(forceQuitTimer);
      destroyLifecycle(appId);
      onUnmounted?.();
    } catch (e) {
      console.error(`[DynamicApp] Error during unmount:`, e);
      clearTimeout(forceQuitTimer);
      forceQuitApp(appId);
      destroyLifecycle(appId);
      onUnmounted?.();
    }
  }, [appId, forceQuitTimeout, onUnmounted]);

  // Handle close request from app
  const handleClose = useCallback(() => {
    handleQuit().then(() => {
      onClose();
    });
  }, [handleQuit, onClose]);

  // Loading state
  if (isLoading || !Component) {
    return loadingComponent ? <>{loadingComponent}</> : <DefaultLoading appId={appId} />;
  }

  // Error state
  if (error) {
    return errorComponent ? (
      <>{errorComponent(error, reload)}</>
    ) : (
      <DefaultError error={error} appId={appId} onRetry={reload} onClose={onClose} />
    );
  }

  // Render the app with lifecycle context
  return (
    <div ref={containerRef} data-app-id={appId} className="contents">
      <AppIdContext.Provider value={appId}>
        <Suspense fallback={loadingComponent || <DefaultLoading appId={appId} />}>
          <Component onClose={handleClose} onFocus={onFocus} />
          {hasUpdate && (
            <div className="fixed bottom-4 right-4 z-50">
              <button
                onClick={reload}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium shadow-lg transition-colors flex items-center gap-2"
              >
                <span>↻</span>
                Update Available
              </button>
            </div>
          )}
        </Suspense>
      </AppIdContext.Provider>
    </div>
  );
};

export default DynamicApp;
