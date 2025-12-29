/**
 * useLifecycle Hook
 *
 * React hook for apps to manage their lifecycle.
 * Automatically cleans up intervals, timeouts, and event listeners.
 */

import { useEffect, useRef, useCallback, useContext, createContext } from 'react';
import {
  createLifecycle,
  markMounted,
  unmountApp,
  registerCleanup,
  registerInterval,
  registerTimeout,
  registerEventListener,
  getLifecycle,
  type CleanupFn,
} from '../lifecycle';

// Context for app ID
export const AppIdContext = createContext<string | null>(null);

export interface UseLifecycleReturn {
  /** App ID */
  appId: string;
  /** Register a cleanup function */
  onCleanup: (cleanup: CleanupFn) => void;
  /** Create a managed interval */
  setInterval: (callback: () => void, ms: number) => void;
  /** Create a managed timeout */
  setTimeout: (callback: () => void, ms: number) => void;
  /** Add a managed event listener */
  addEventListener: (
    target: EventTarget,
    type: string,
    listener: EventListener,
    options?: AddEventListenerOptions
  ) => void;
  /** Get current lifecycle state */
  getState: () => 'loading' | 'mounted' | 'unmounting' | 'unmounted' | undefined;
}

/**
 * Hook for managing app lifecycle within a component
 */
export function useLifecycle(explicitAppId?: string): UseLifecycleReturn {
  const contextAppId = useContext(AppIdContext);
  const appId = explicitAppId || contextAppId;

  if (!appId) {
    throw new Error('useLifecycle must be used within AppIdContext or with an explicit appId');
  }

  const mountedRef = useRef(false);
  const cleanupsRef = useRef<CleanupFn[]>([]);

  // Initialize lifecycle on mount
  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;

    // Create lifecycle if it doesn't exist
    if (!getLifecycle(appId)) {
      createLifecycle(appId);
    }
    markMounted(appId);

    // Cleanup on unmount
    return () => {
      // Run local cleanups first
      for (const cleanup of cleanupsRef.current) {
        try {
          cleanup();
        } catch (e) {
          console.error(`[useLifecycle] Cleanup error:`, e);
        }
      }
      cleanupsRef.current = [];

      // Then unmount the app lifecycle
      unmountApp(appId);
    };
  }, [appId]);

  const onCleanup = useCallback((cleanup: CleanupFn) => {
    const unregister = registerCleanup(appId, cleanup);
    cleanupsRef.current.push(unregister);
  }, [appId]);

  const managedSetInterval = useCallback((callback: () => void, ms: number) => {
    registerInterval(appId, callback, ms);
  }, [appId]);

  const managedSetTimeout = useCallback((callback: () => void, ms: number) => {
    registerTimeout(appId, callback, ms);
  }, [appId]);

  const managedAddEventListener = useCallback((
    target: EventTarget,
    type: string,
    listener: EventListener,
    options?: AddEventListenerOptions
  ) => {
    const cleanup = registerEventListener(appId, target, type, listener, options);
    cleanupsRef.current.push(cleanup);
  }, [appId]);

  const getState = useCallback(() => {
    return getLifecycle(appId)?.state;
  }, [appId]);

  return {
    appId,
    onCleanup,
    setInterval: managedSetInterval,
    setTimeout: managedSetTimeout,
    addEventListener: managedAddEventListener,
    getState,
  };
}

/**
 * Hook for running an effect that needs cleanup registration
 */
export function useAppEffect(
  appId: string,
  effect: () => CleanupFn | void,
  deps: React.DependencyList
): void {
  useEffect(() => {
    const cleanup = effect();
    if (cleanup) {
      registerCleanup(appId, cleanup);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/**
 * Hook for a managed interval
 */
export function useAppInterval(
  appId: string,
  callback: () => void,
  ms: number,
  enabled: boolean = true
): void {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (!enabled) return;

    const id = registerInterval(appId, () => callbackRef.current(), ms);
    if (!id) return;

    return () => clearInterval(id);
  }, [appId, ms, enabled]);
}

/**
 * Hook for a managed timeout
 */
export function useAppTimeout(
  appId: string,
  callback: () => void,
  ms: number,
  enabled: boolean = true
): void {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (!enabled) return;

    const id = registerTimeout(appId, () => callbackRef.current(), ms);
    if (!id) return;

    return () => clearTimeout(id);
  }, [appId, ms, enabled]);
}
