/**
 * useApp Hook
 *
 * React hook for loading and using a specific app.
 */

import { useState, useEffect, useCallback, ComponentType } from 'react';
import {
  getApp,
  loadAppFromCDN,
  subscribeToApps,
  hotReloadApp,
  checkForUpdates,
  type LoadedApp,
  type AppProps,
} from '../index';

export interface UseAppOptions {
  /** Load from CDN if not already loaded */
  autoLoad?: boolean;
  /** Version to load (default: latest) */
  version?: string;
}

export interface UseAppReturn {
  /** The app component (null if not loaded) */
  Component: ComponentType<AppProps> | null;
  /** The loaded app info */
  app: LoadedApp | null;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: Error | null;
  /** Reload the app */
  reload: () => Promise<void>;
  /** Check for updates */
  checkForUpdates: () => Promise<{ hasUpdate: boolean; latestVersion?: string }>;
  /** Has update available */
  hasUpdate: boolean;
}

export function useApp(appId: string, options: UseAppOptions = {}): UseAppReturn {
  const { autoLoad = true, version } = options;

  const [app, setApp] = useState<LoadedApp | null>(() => getApp(appId) || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasUpdate, setHasUpdate] = useState(false);

  // Subscribe to app changes
  useEffect(() => {
    const unsubscribe = subscribeToApps((apps) => {
      const loadedApp = apps.get(appId);
      setApp(loadedApp || null);
    });
    return unsubscribe;
  }, [appId]);

  // Auto-load if not loaded
  useEffect(() => {
    if (!app && autoLoad && !isLoading && !error) {
      setIsLoading(true);
      loadAppFromCDN(appId, version)
        .then(setApp)
        .catch(e => setError(e instanceof Error ? e : new Error(String(e))))
        .finally(() => setIsLoading(false));
    }
  }, [app, appId, autoLoad, version, isLoading, error]);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const reloaded = await hotReloadApp(appId);
      if (reloaded) {
        setApp(reloaded);
        setHasUpdate(false);
      }
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setIsLoading(false);
    }
  }, [appId]);

  const checkUpdates = useCallback(async () => {
    const result = await checkForUpdates(appId);
    setHasUpdate(result.hasUpdate);
    return { hasUpdate: result.hasUpdate, latestVersion: result.latestVersion };
  }, [appId]);

  return {
    Component: app?.component || null,
    app,
    isLoading,
    error,
    reload,
    checkForUpdates: checkUpdates,
    hasUpdate,
  };
}
