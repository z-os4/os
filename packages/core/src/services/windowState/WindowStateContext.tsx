/**
 * Window State Context for zOS
 *
 * React context providing window state management throughout the component tree.
 */

import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import type { WindowBounds, PersistedWindowState, WindowSession } from './types';
import { windowStateManager } from './WindowStateManager';

/**
 * Context value interface
 */
export interface WindowStateContextValue {
  /** Save window state */
  saveWindowState: (windowId: string, state: Partial<PersistedWindowState>) => void;
  /** Get window state */
  getWindowState: (windowId: string) => PersistedWindowState | undefined;
  /** Remove window state */
  removeWindowState: (windowId: string) => void;
  /** Restore saved session */
  restoreSession: () => WindowSession | null;
  /** Save current session */
  saveSession: () => void;
  /** Clear saved session */
  clearSession: () => void;
  /** Get default bounds for new window */
  getDefaultBounds: (appId: string) => WindowBounds;
  /** Constrain bounds to screen */
  constrainToScreen: (bounds: WindowBounds) => WindowBounds;
  /** Get all window states */
  getAllStates: () => PersistedWindowState[];
}

const WindowStateContext = createContext<WindowStateContextValue | null>(null);

/**
 * Props for WindowStateProvider
 */
export interface WindowStateProviderProps {
  children: React.ReactNode;
  /** Auto-save session on beforeunload */
  autoSaveSession?: boolean;
}

/**
 * Window State Provider
 *
 * Provides window state management to the component tree.
 */
export function WindowStateProvider({
  children,
  autoSaveSession = true,
}: WindowStateProviderProps): React.ReactElement {
  // Setup beforeunload handler for session save
  useEffect(() => {
    if (!autoSaveSession || typeof window === 'undefined') {
      return;
    }

    const handleBeforeUnload = (): void => {
      windowStateManager.flush();
      windowStateManager.saveSession();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [autoSaveSession]);

  // Setup resize handler for constraint updates
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    let resizeTimeout: ReturnType<typeof setTimeout> | null = null;

    const handleResize = (): void => {
      if (resizeTimeout !== null) {
        clearTimeout(resizeTimeout);
      }

      resizeTimeout = setTimeout(() => {
        // Re-constrain all windows to new screen size
        const states = windowStateManager.getAllStates();
        for (const state of states) {
          if (!state.isMaximized) {
            const constrained = windowStateManager.constrainToScreen(
              state.bounds
            );
            if (
              constrained.x !== state.bounds.x ||
              constrained.y !== state.bounds.y ||
              constrained.width !== state.bounds.width ||
              constrained.height !== state.bounds.height
            ) {
              windowStateManager.saveBounds(state.id, constrained);
            }
          }
        }
        resizeTimeout = null;
      }, 150);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTimeout !== null) {
        clearTimeout(resizeTimeout);
      }
    };
  }, []);

  const saveWindowState = useCallback(
    (windowId: string, state: Partial<PersistedWindowState>): void => {
      windowStateManager.saveState(windowId, state);
    },
    []
  );

  const getWindowState = useCallback(
    (windowId: string): PersistedWindowState | undefined => {
      return windowStateManager.getState(windowId);
    },
    []
  );

  const removeWindowState = useCallback((windowId: string): void => {
    windowStateManager.removeState(windowId);
  }, []);

  const restoreSession = useCallback((): WindowSession | null => {
    return windowStateManager.restoreSession();
  }, []);

  const saveSession = useCallback((): void => {
    windowStateManager.saveSession();
  }, []);

  const clearSession = useCallback((): void => {
    windowStateManager.clearSession();
  }, []);

  const getDefaultBounds = useCallback((appId: string): WindowBounds => {
    return windowStateManager.getDefaultBounds(appId);
  }, []);

  const constrainToScreen = useCallback((bounds: WindowBounds): WindowBounds => {
    return windowStateManager.constrainToScreen(bounds);
  }, []);

  const getAllStates = useCallback((): PersistedWindowState[] => {
    return windowStateManager.getAllStates();
  }, []);

  const value = useMemo<WindowStateContextValue>(
    () => ({
      saveWindowState,
      getWindowState,
      removeWindowState,
      restoreSession,
      saveSession,
      clearSession,
      getDefaultBounds,
      constrainToScreen,
      getAllStates,
    }),
    [
      saveWindowState,
      getWindowState,
      removeWindowState,
      restoreSession,
      saveSession,
      clearSession,
      getDefaultBounds,
      constrainToScreen,
      getAllStates,
    ]
  );

  return (
    <WindowStateContext.Provider value={value}>
      {children}
    </WindowStateContext.Provider>
  );
}

/**
 * Hook to access window state context
 * @throws Error if used outside WindowStateProvider
 */
export function useWindowStateContext(): WindowStateContextValue {
  const context = useContext(WindowStateContext);
  if (!context) {
    throw new Error(
      'useWindowStateContext must be used within a WindowStateProvider'
    );
  }
  return context;
}
