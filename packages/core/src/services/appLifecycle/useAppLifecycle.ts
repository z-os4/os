/**
 * zOS App Lifecycle Hook
 *
 * Hook for app components to integrate with the app lifecycle system.
 * Manages lifecycle hooks, status tracking, and state persistence.
 */

import { useEffect, useCallback, useRef, useMemo } from 'react';
import { appRegistry } from './AppRegistry';
import { useAppRegistry, useActiveApp } from './AppContext';
import type { AppStatus, AppLifecycleHooks } from './types';

/**
 * Result of useAppLifecycle hook
 */
export interface AppLifecycleResult {
  /** Current app status */
  status: AppStatus;
  /** Whether this app is currently active (focused) */
  isActive: boolean;
  /** Manually trigger state save */
  saveState: () => void;
  /** Request to close this app instance */
  requestClose: () => Promise<void>;
}

/**
 * Options for useAppLifecycle hook
 */
export interface UseAppLifecycleOptions {
  /** App ID (required for lifecycle management) */
  appId: string;
  /** Window instance ID */
  instanceId: string;
  /** Lifecycle hooks */
  hooks?: AppLifecycleHooks;
  /** Auto-save state on deactivate */
  autoSaveOnDeactivate?: boolean;
  /** Auto-save interval in ms (0 to disable) */
  autoSaveInterval?: number;
}

/**
 * Hook for app components to integrate with the app lifecycle
 *
 * @param options - Lifecycle options including appId, instanceId, and hooks
 * @returns Lifecycle state and methods
 *
 * @example
 * ```tsx
 * function NotesApp({ instanceId }: AppComponentProps) {
 *   const [content, setContent] = useState('');
 *
 *   const { status, isActive, saveState } = useAppLifecycle({
 *     appId: 'apps.zos.notes',
 *     instanceId,
 *     hooks: {
 *       onSaveState: () => ({ content }),
 *       onRestoreState: (state) => setContent(state?.content || ''),
 *       onTerminate: async () => {
 *         // Cleanup before close
 *       },
 *     },
 *     autoSaveOnDeactivate: true,
 *   });
 *
 *   return <textarea value={content} onChange={(e) => setContent(e.target.value)} />;
 * }
 * ```
 */
export function useAppLifecycle(options: UseAppLifecycleOptions): AppLifecycleResult {
  const { appId, instanceId, hooks, autoSaveOnDeactivate = true, autoSaveInterval = 0 } = options;

  const { apps, terminate } = useAppRegistry();
  const activeAppId = useActiveApp();

  // Track hooks in ref to avoid stale closures
  const hooksRef = useRef(hooks);
  hooksRef.current = hooks;

  // Get current app status
  const status = useMemo((): AppStatus => {
    const app = apps.find((a) => a.manifest.id === appId);
    return app?.status || 'registered';
  }, [apps, appId]);

  // Check if this app is active
  const isActive = activeAppId === appId;

  // Track previous active state for deactivate detection
  const wasActiveRef = useRef(isActive);

  // Save state function
  const saveState = useCallback(() => {
    if (hooksRef.current?.onSaveState) {
      appRegistry.saveState(appId);
    }
  }, [appId]);

  // Request close function
  const requestClose = useCallback(async () => {
    await terminate(instanceId);
  }, [terminate, instanceId]);

  // Register hooks with registry on mount
  useEffect(() => {
    const app = appRegistry.getApp(appId);
    if (app && hooksRef.current) {
      // Update hooks in registry
      app.hooks = hooksRef.current;
    }
  }, [appId]);

  // Handle activation/deactivation
  useEffect(() => {
    const wasActive = wasActiveRef.current;

    if (wasActive && !isActive) {
      // Deactivated
      if (autoSaveOnDeactivate) {
        saveState();
      }
      hooksRef.current?.onDeactivate?.();
    } else if (!wasActive && isActive) {
      // Activated
      hooksRef.current?.onActivate?.();
    }

    wasActiveRef.current = isActive;
  }, [isActive, autoSaveOnDeactivate, saveState]);

  // Auto-save interval
  useEffect(() => {
    if (autoSaveInterval <= 0) {
      return;
    }

    const intervalId = setInterval(() => {
      if (hooksRef.current?.onSaveState) {
        saveState();
      }
    }, autoSaveInterval);

    return () => clearInterval(intervalId);
  }, [autoSaveInterval, saveState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Save state one last time on unmount
      if (hooksRef.current?.onSaveState) {
        saveState();
      }
    };
  }, [saveState]);

  return {
    status,
    isActive,
    saveState,
    requestClose,
  };
}

/**
 * Simplified hook for apps that only need to track active state
 */
export function useAppActive(appId: string): boolean {
  const activeAppId = useActiveApp();
  return activeAppId === appId;
}

/**
 * Hook to get app status
 */
export function useAppStatus(appId: string): AppStatus {
  const { apps } = useAppRegistry();
  const app = apps.find((a) => a.manifest.id === appId);
  return app?.status || 'registered';
}

/**
 * Hook to restore app state on mount
 */
export function useRestoreState<T>(appId: string, onRestore: (state: T) => void): void {
  const restoredRef = useRef(false);

  useEffect(() => {
    if (restoredRef.current) {
      return;
    }

    const app = appRegistry.getApp(appId);
    if (app?.hooks?.onRestoreState) {
      // State will be restored via the hook
      return;
    }

    // Manually restore state
    try {
      const stored = localStorage.getItem(`zos:app-state:${appId}`);
      if (stored) {
        const { state } = JSON.parse(stored);
        onRestore(state as T);
      }
    } catch (error) {
      console.error(`Failed to restore state for ${appId}:`, error);
    }

    restoredRef.current = true;
  }, [appId, onRestore]);
}
