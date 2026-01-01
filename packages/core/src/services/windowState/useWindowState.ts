/**
 * Window State Hooks for zOS
 *
 * React hooks for managing individual window state and bounds.
 */

import { useState, useCallback, useEffect, useSyncExternalStore } from 'react';
import type { WindowBounds, PersistedWindowState } from './types';
import { windowStateManager } from './WindowStateManager';

/**
 * Hook for managing complete window state
 *
 * @param windowId - Unique window identifier
 * @returns Window state and mutation functions
 */
export function useWindowState(windowId: string): {
  state: PersistedWindowState | undefined;
  saveBounds: (bounds: WindowBounds) => void;
  saveCustomState: (customState: Record<string, unknown>) => void;
  setMaximized: (isMaximized: boolean) => void;
  setMinimized: (isMinimized: boolean) => void;
  setZIndex: (zIndex: number) => void;
  updateLastActive: () => void;
  isMaximized: boolean;
  isMinimized: boolean;
} {
  // Subscribe to state changes
  const state = useSyncExternalStore(
    (callback) => windowStateManager.subscribe(callback),
    () => windowStateManager.getState(windowId),
    () => undefined // Server snapshot
  );

  const saveBounds = useCallback(
    (bounds: WindowBounds): void => {
      windowStateManager.saveBounds(windowId, bounds);
    },
    [windowId]
  );

  const saveCustomState = useCallback(
    (customState: Record<string, unknown>): void => {
      windowStateManager.saveState(windowId, { customState });
    },
    [windowId]
  );

  const setMaximized = useCallback(
    (isMaximized: boolean): void => {
      const current = windowStateManager.getState(windowId);
      if (isMaximized && current && !current.isMaximized) {
        // Store pre-maximize bounds for restore
        windowStateManager.saveState(windowId, {
          isMaximized: true,
          preBounds: current.bounds,
        });
      } else if (!isMaximized && current?.preBounds) {
        // Restore pre-maximize bounds
        windowStateManager.saveState(windowId, {
          isMaximized: false,
          bounds: current.preBounds,
          preBounds: undefined,
        });
      } else {
        windowStateManager.saveState(windowId, { isMaximized });
      }
    },
    [windowId]
  );

  const setMinimized = useCallback(
    (isMinimized: boolean): void => {
      windowStateManager.saveState(windowId, { isMinimized });
    },
    [windowId]
  );

  const setZIndex = useCallback(
    (zIndex: number): void => {
      windowStateManager.saveState(windowId, { zIndex });
    },
    [windowId]
  );

  const updateLastActive = useCallback((): void => {
    windowStateManager.saveState(windowId, { lastActive: Date.now() });
  }, [windowId]);

  return {
    state,
    saveBounds,
    saveCustomState,
    setMaximized,
    setMinimized,
    setZIndex,
    updateLastActive,
    isMaximized: state?.isMaximized ?? false,
    isMinimized: state?.isMinimized ?? false,
  };
}

/**
 * Hook for managing window bounds with local state optimization
 *
 * Provides immediate local updates while persisting to storage.
 * Handles maximize/minimize/restore operations.
 *
 * @param windowId - Unique window identifier
 * @param initialBounds - Initial bounds for new windows
 * @returns Bounds state and mutation functions
 */
export function useWindowBounds(
  windowId: string,
  initialBounds: WindowBounds
): {
  bounds: WindowBounds;
  setBounds: (bounds: WindowBounds) => void;
  maximize: () => void;
  minimize: () => void;
  restore: () => void;
  isMaximized: boolean;
  isMinimized: boolean;
} {
  // Get persisted state
  const persisted = useSyncExternalStore(
    (callback) => windowStateManager.subscribe(callback),
    () => windowStateManager.getState(windowId),
    () => undefined
  );

  // Local state for immediate updates during drag/resize
  const [localBounds, setLocalBounds] = useState<WindowBounds>(
    () => persisted?.bounds ?? initialBounds
  );

  const [isMaximized, setIsMaximized] = useState(
    () => persisted?.isMaximized ?? false
  );

  const [isMinimized, setIsMinimized] = useState(
    () => persisted?.isMinimized ?? false
  );

  const [preBounds, setPreBounds] = useState<WindowBounds | undefined>(
    () => persisted?.preBounds
  );

  // Sync local state with persisted state
  useEffect(() => {
    if (persisted) {
      setLocalBounds(persisted.bounds);
      setIsMaximized(persisted.isMaximized);
      setIsMinimized(persisted.isMinimized);
      setPreBounds(persisted.preBounds);
    }
  }, [persisted]);

  const setBounds = useCallback(
    (bounds: WindowBounds): void => {
      const constrained = windowStateManager.constrainToScreen(bounds);
      setLocalBounds(constrained);
      windowStateManager.saveBounds(windowId, constrained);
    },
    [windowId]
  );

  const maximize = useCallback((): void => {
    if (isMaximized) return;

    // Save current bounds for restore
    setPreBounds(localBounds);
    setIsMaximized(true);
    setIsMinimized(false);

    windowStateManager.saveState(windowId, {
      isMaximized: true,
      isMinimized: false,
      preBounds: localBounds,
    });
  }, [windowId, localBounds, isMaximized]);

  const minimize = useCallback((): void => {
    setIsMinimized(true);
    windowStateManager.saveState(windowId, { isMinimized: true });
  }, [windowId]);

  const restore = useCallback((): void => {
    if (isMinimized) {
      setIsMinimized(false);
      windowStateManager.saveState(windowId, { isMinimized: false });
    } else if (isMaximized && preBounds) {
      // Restore from maximize
      const constrained = windowStateManager.constrainToScreen(preBounds);
      setLocalBounds(constrained);
      setIsMaximized(false);
      setPreBounds(undefined);

      windowStateManager.saveState(windowId, {
        bounds: constrained,
        isMaximized: false,
        preBounds: undefined,
      });
    }
  }, [windowId, isMaximized, isMinimized, preBounds]);

  return {
    bounds: localBounds,
    setBounds,
    maximize,
    minimize,
    restore,
    isMaximized,
    isMinimized,
  };
}

/**
 * Hook for tracking all window states
 *
 * @returns All current window states
 */
export function useAllWindowStates(): PersistedWindowState[] {
  return useSyncExternalStore(
    (callback) => windowStateManager.subscribe(callback),
    () => windowStateManager.getAllStates(),
    () => []
  );
}

/**
 * Hook for tracking window states for a specific app
 *
 * @param appId - Application identifier
 * @returns Window states for the specified app
 */
export function useAppWindowStates(appId: string): PersistedWindowState[] {
  const allStates = useAllWindowStates();
  return allStates.filter((state) => state.appId === appId);
}

/**
 * Hook for initializing a new window with default bounds
 *
 * @param windowId - Unique window identifier
 * @param appId - Application identifier
 * @returns Initial bounds for the window
 */
export function useInitialWindowBounds(
  windowId: string,
  appId: string
): WindowBounds {
  const [bounds] = useState<WindowBounds>(() => {
    // Check if we have persisted state for this window
    const existing = windowStateManager.getState(windowId);
    if (existing) {
      return windowStateManager.constrainToScreen(existing.bounds);
    }

    // Get default bounds with cascade positioning
    return windowStateManager.getDefaultBounds(appId);
  });

  // Initialize state if not exists
  useEffect(() => {
    const existing = windowStateManager.getState(windowId);
    if (!existing) {
      windowStateManager.saveState(windowId, {
        id: windowId,
        appId,
        bounds,
        isMaximized: false,
        isMinimized: false,
        zIndex: Date.now(), // Use timestamp for initial z-order
        lastActive: Date.now(),
      });
    }
  }, [windowId, appId, bounds]);

  return bounds;
}
