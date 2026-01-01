/**
 * zOS App Context
 *
 * React context for app lifecycle management. Provides hooks and utilities
 * for components to interact with the app registry.
 */

import React, {
  createContext,
  useContext,
  useCallback,
  useSyncExternalStore,
  useMemo,
  type ReactNode,
  type ComponentType,
} from 'react';
import { appRegistry } from './AppRegistry';
import type {
  AppManifest,
  AppLifecycleHooks,
  RegisteredApp,
  LaunchOptions,
  AppComponentProps,
} from './types';

/**
 * Context value interface
 */
export interface AppContextValue {
  /** All registered apps */
  apps: RegisteredApp[];
  /** Apps with at least one running instance */
  runningApps: RegisteredApp[];
  /** Currently active (focused) app ID */
  activeAppId: string | null;

  /** Register an app */
  register: (
    manifest: AppManifest,
    component: ComponentType<AppComponentProps>,
    hooks?: AppLifecycleHooks
  ) => void;
  /** Unregister an app */
  unregister: (appId: string) => void;
  /** Launch an app */
  launch: (appId: string, options?: LaunchOptions) => Promise<string>;
  /** Terminate an instance */
  terminate: (instanceId: string) => Promise<void>;
  /** Terminate all instances of an app */
  terminateAll: (appId: string) => Promise<void>;
  /** Set active app */
  setActiveApp: (appId: string | null) => void;

  /** Open a file with appropriate app */
  openFile: (path: string, preferredApp?: string) => Promise<string | null>;
  /** Open a URL with appropriate app */
  openUrl: (url: string) => Promise<string | null>;

  /** Get app by ID */
  getApp: (appId: string) => RegisteredApp | undefined;
  /** Find apps that can open a file extension */
  findAppForFile: (extension: string) => string[];
  /** Find app that handles a URL scheme */
  findAppForUrl: (scheme: string) => string | undefined;
}

/** Context for app registry */
const AppContext = createContext<AppContextValue | null>(null);

/** Track active app ID */
let activeAppId: string | null = null;
const activeAppListeners = new Set<() => void>();

function subscribeToActiveApp(callback: () => void): () => void {
  activeAppListeners.add(callback);
  return () => activeAppListeners.delete(callback);
}

function getActiveApp(): string | null {
  return activeAppId;
}

function setActiveAppId(appId: string | null): void {
  const previousAppId = activeAppId;
  activeAppId = appId;

  // Notify registry of activation/deactivation
  if (previousAppId && previousAppId !== appId) {
    appRegistry.deactivate(previousAppId);
  }
  if (appId) {
    appRegistry.activate(appId);
  }

  // Notify listeners
  for (const listener of activeAppListeners) {
    listener();
  }
}

/**
 * Provider props
 */
interface AppProviderProps {
  children: ReactNode;
}

/**
 * App provider component
 *
 * Wraps the application and provides access to the app registry context.
 */
export function AppProvider({ children }: AppProviderProps): React.ReactElement {
  // Subscribe to registry changes
  const apps = useSyncExternalStore(
    appRegistry.subscribe.bind(appRegistry),
    () => appRegistry.getAll(),
    () => appRegistry.getAll()
  );

  // Subscribe to active app changes
  const currentActiveApp = useSyncExternalStore(
    subscribeToActiveApp,
    getActiveApp,
    getActiveApp
  );

  // Memoize running apps
  const runningApps = useMemo(
    () => apps.filter((app) => app.status === 'running' || app.status === 'suspended'),
    [apps]
  );

  // Callbacks bound to registry
  const register = useCallback(
    (
      manifest: AppManifest,
      component: ComponentType<AppComponentProps>,
      hooks?: AppLifecycleHooks
    ) => {
      appRegistry.register(manifest, component, hooks);
    },
    []
  );

  const unregister = useCallback((appId: string) => {
    appRegistry.unregister(appId);
  }, []);

  const launch = useCallback(
    async (appId: string, options?: LaunchOptions): Promise<string> => {
      const instanceId = await appRegistry.launch(appId, options);
      // Set as active after launch
      setActiveAppId(appId);
      return instanceId;
    },
    []
  );

  const terminate = useCallback(async (instanceId: string): Promise<void> => {
    const appId = appRegistry.getAppIdForInstance(instanceId);
    await appRegistry.terminate(instanceId);
    // Clear active if this was the active app and no more instances
    if (appId && currentActiveApp === appId) {
      const app = appRegistry.getApp(appId);
      if (!app || app.instances.length === 0) {
        setActiveAppId(null);
      }
    }
  }, [currentActiveApp]);

  const terminateAll = useCallback(async (appId: string): Promise<void> => {
    await appRegistry.terminateAll(appId);
    if (currentActiveApp === appId) {
      setActiveAppId(null);
    }
  }, [currentActiveApp]);

  const setActiveApp = useCallback((appId: string | null) => {
    setActiveAppId(appId);
  }, []);

  const openFile = useCallback(
    async (path: string, preferredApp?: string): Promise<string | null> => {
      const instanceId = await appRegistry.openFile(path, preferredApp);
      if (instanceId) {
        const appId = appRegistry.getAppIdForInstance(instanceId);
        if (appId) {
          setActiveAppId(appId);
        }
      }
      return instanceId;
    },
    []
  );

  const openUrl = useCallback(async (url: string): Promise<string | null> => {
    const instanceId = await appRegistry.openUrl(url);
    if (instanceId) {
      const appId = appRegistry.getAppIdForInstance(instanceId);
      if (appId) {
        setActiveAppId(appId);
      }
    }
    return instanceId;
  }, []);

  const getApp = useCallback(
    (appId: string): RegisteredApp | undefined => appRegistry.getApp(appId),
    []
  );

  const findAppForFile = useCallback(
    (extension: string): string[] => appRegistry.findAppForFile(extension),
    []
  );

  const findAppForUrl = useCallback(
    (scheme: string): string | undefined => appRegistry.findAppForUrl(scheme),
    []
  );

  const value: AppContextValue = useMemo(
    () => ({
      apps,
      runningApps,
      activeAppId: currentActiveApp,
      register,
      unregister,
      launch,
      terminate,
      terminateAll,
      setActiveApp,
      openFile,
      openUrl,
      getApp,
      findAppForFile,
      findAppForUrl,
    }),
    [
      apps,
      runningApps,
      currentActiveApp,
      register,
      unregister,
      launch,
      terminate,
      terminateAll,
      setActiveApp,
      openFile,
      openUrl,
      getApp,
      findAppForFile,
      findAppForUrl,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

/**
 * Hook to access the app registry context
 *
 * @throws Error if used outside of AppProvider
 */
export function useAppRegistry(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppRegistry must be used within an AppProvider');
  }
  return context;
}

/**
 * Hook to access specific app info
 */
export function useApp(appId: string): RegisteredApp | undefined {
  const { getApp } = useAppRegistry();
  return getApp(appId);
}

/**
 * Hook to check if an app is running
 */
export function useAppRunning(appId: string): boolean {
  const { apps } = useAppRegistry();
  const app = apps.find((a) => a.manifest.id === appId);
  return app?.status === 'running' || app?.status === 'suspended' || false;
}

/**
 * Hook to get the active app ID
 */
export function useActiveApp(): string | null {
  const { activeAppId } = useAppRegistry();
  return activeAppId;
}
