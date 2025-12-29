/**
 * useRuntime Hook
 *
 * React hook for accessing the zOS runtime.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getAllApps,
  subscribeToApps,
  loadAppFromCDN,
  loadAppFromUrl,
  unloadApp,
  hotReloadApp,
  checkForUpdates,
  type LoadedApp,
} from '../index';

export interface UseRuntimeReturn {
  /** All loaded apps */
  apps: LoadedApp[];
  /** Load an app from CDN */
  loadFromCDN: (appName: string, version?: string) => Promise<LoadedApp>;
  /** Load an app from URL */
  loadFromUrl: (url: string) => Promise<LoadedApp>;
  /** Unload an app */
  unload: (id: string) => boolean;
  /** Hot reload an app */
  hotReload: (id: string) => Promise<LoadedApp | null>;
  /** Check for updates */
  checkUpdates: (id: string) => Promise<{ hasUpdate: boolean; latestVersion?: string }>;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: Error | null;
}

export function useRuntime(): UseRuntimeReturn {
  const [apps, setApps] = useState<LoadedApp[]>(getAllApps());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToApps((appsMap) => {
      setApps(Array.from(appsMap.values()));
    });
    return unsubscribe;
  }, []);

  const loadFromCDN = useCallback(async (appName: string, version?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const app = await loadAppFromCDN(appName, version);
      return app;
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadFromUrl = useCallback(async (url: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const app = await loadAppFromUrl(url);
      return app;
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const unload = useCallback((id: string) => {
    return unloadApp(id);
  }, []);

  const hotReload = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const app = await hotReloadApp(id);
      return app;
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkUpdates = useCallback(async (id: string) => {
    const result = await checkForUpdates(id);
    return { hasUpdate: result.hasUpdate, latestVersion: result.latestVersion };
  }, []);

  return {
    apps,
    loadFromCDN,
    loadFromUrl,
    unload,
    hotReload,
    checkUpdates,
    isLoading,
    error,
  };
}
