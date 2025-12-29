/**
 * zOS Runtime
 *
 * Core OS runtime that provides:
 * - Shared library exposure (core, ui, sdk)
 * - Dynamic app loading from CDN/URLs
 * - Hot reload/swap of running apps
 * - App lifecycle management
 */

import type { ComponentType } from 'react';

// App component interface
export interface AppComponent {
  default: ComponentType<AppProps>;
  manifest?: AppManifest;
}

export interface AppProps {
  onClose: () => void;
  onFocus?: () => void;
}

export interface AppManifest {
  identifier: string;
  name: string;
  version: string;
  main?: string;
}

export interface LoadedApp {
  id: string;
  manifest: AppManifest;
  component: ComponentType<AppProps>;
  module: AppComponent;
  loadedAt: number;
  source: 'bundled' | 'cdn' | 'local';
}

// Global runtime state
const loadedApps = new Map<string, LoadedApp>();
const appListeners = new Set<(apps: Map<string, LoadedApp>) => void>();

// CDN configuration
const CDN_BASES = [
  'https://cdn.jsdelivr.net/gh/zos-apps',
  'https://unpkg.com/@zos-apps',
];

/**
 * Expose OS libraries globally for dynamic apps to use
 * Apps built with externals will reference these
 */
export async function initRuntime(): Promise<void> {
  // Dynamically import and expose libraries
  const [React, core, ui, sdk] = await Promise.all([
    import('react'),
    import('@z-os/core'),
    import('@z-os/ui'),
    import('@z-os/sdk'),
  ]);

  // Expose on window for dynamic ES module imports
  const globals: Record<string, unknown> = {
    'react': React,
    '@z-os/core': core,
    '@z-os/ui': ui,
    '@z-os/sdk': sdk,
  };

  // Create import map for ES modules
  const importMap = {
    imports: Object.fromEntries(
      Object.keys(globals).map(name => [
        name,
        `data:text/javascript,export * from '${name}';export {default} from '${name}';`
      ])
    )
  };

  // Inject import map if not exists
  if (!document.querySelector('script[type="importmap"]')) {
    const script = document.createElement('script');
    script.type = 'importmap';
    script.textContent = JSON.stringify(importMap);
    document.head.prepend(script);
  }

  // Also expose on window for SystemJS-style loading
  (window as Window & { __ZOS_RUNTIME__?: unknown }).__ZOS_RUNTIME__ = {
    version: '1.0.0',
    libs: globals,
    require: (name: string) => globals[name],
  };

  console.log('[zOS Runtime] Initialized with libraries:', Object.keys(globals));
}

/**
 * Load an app from a URL (CDN or local)
 */
export async function loadAppFromUrl(
  url: string,
  manifest?: Partial<AppManifest>
): Promise<LoadedApp> {
  const id = manifest?.identifier || url;

  // Check if already loaded
  if (loadedApps.has(id)) {
    const existing = loadedApps.get(id)!;
    console.log(`[zOS Runtime] App ${id} already loaded, returning cached`);
    return existing;
  }

  console.log(`[zOS Runtime] Loading app from: ${url}`);

  try {
    // Dynamic import from URL
    const module = await import(/* @vite-ignore */ url) as AppComponent;

    const appManifest: AppManifest = {
      identifier: id,
      name: manifest?.name || module.manifest?.name || id,
      version: manifest?.version || module.manifest?.version || '0.0.0',
      ...module.manifest,
      ...manifest,
    };

    const loadedApp: LoadedApp = {
      id,
      manifest: appManifest,
      component: module.default,
      module,
      loadedAt: Date.now(),
      source: url.startsWith('http') ? 'cdn' : 'local',
    };

    loadedApps.set(id, loadedApp);
    notifyListeners();

    console.log(`[zOS Runtime] Loaded app: ${appManifest.name} v${appManifest.version}`);
    return loadedApp;
  } catch (error) {
    console.error(`[zOS Runtime] Failed to load app from ${url}:`, error);
    throw error;
  }
}

/**
 * Load an app from the zos-apps CDN
 */
export async function loadAppFromCDN(
  appName: string,
  version: string = 'latest'
): Promise<LoadedApp> {
  const repoName = appName.toLowerCase().replace(/\s+/g, '-');

  // Try each CDN base
  for (const base of CDN_BASES) {
    const url = version === 'latest'
      ? `${base}/${repoName}@main/dist/index.js`
      : `${base}/${repoName}@${version}/dist/index.js`;

    try {
      return await loadAppFromUrl(url, { name: appName });
    } catch (e) {
      console.warn(`[zOS Runtime] CDN ${base} failed, trying next...`);
    }
  }

  throw new Error(`Failed to load ${appName} from any CDN`);
}

/**
 * Register a bundled app (already imported)
 */
export function registerBundledApp(
  component: ComponentType<AppProps>,
  manifest: AppManifest
): LoadedApp {
  const loadedApp: LoadedApp = {
    id: manifest.identifier,
    manifest,
    component,
    module: { default: component, manifest },
    loadedAt: Date.now(),
    source: 'bundled',
  };

  loadedApps.set(manifest.identifier, loadedApp);
  notifyListeners();

  return loadedApp;
}

/**
 * Unload an app (for hot swap)
 */
export function unloadApp(id: string): boolean {
  if (loadedApps.has(id)) {
    loadedApps.delete(id);
    notifyListeners();
    console.log(`[zOS Runtime] Unloaded app: ${id}`);
    return true;
  }
  return false;
}

/**
 * Hot reload an app (unload and reload from URL)
 */
export async function hotReloadApp(id: string): Promise<LoadedApp | null> {
  const existing = loadedApps.get(id);
  if (!existing) {
    console.warn(`[zOS Runtime] App ${id} not loaded, cannot hot reload`);
    return null;
  }

  if (existing.source === 'bundled') {
    console.warn(`[zOS Runtime] Cannot hot reload bundled app: ${id}`);
    return existing;
  }

  // Unload
  unloadApp(id);

  // Reload from CDN
  return loadAppFromCDN(existing.manifest.name);
}

/**
 * Get a loaded app
 */
export function getApp(id: string): LoadedApp | undefined {
  return loadedApps.get(id);
}

/**
 * Get all loaded apps
 */
export function getAllApps(): LoadedApp[] {
  return Array.from(loadedApps.values());
}

/**
 * Check for app updates
 */
export async function checkForUpdates(id: string): Promise<{
  hasUpdate: boolean;
  currentVersion: string;
  latestVersion?: string;
}> {
  const app = loadedApps.get(id);
  if (!app) {
    return { hasUpdate: false, currentVersion: '0.0.0' };
  }

  if (app.source === 'bundled') {
    return { hasUpdate: false, currentVersion: app.manifest.version };
  }

  try {
    // Fetch manifest from CDN
    const repoName = app.manifest.name.toLowerCase().replace(/\s+/g, '-');
    const manifestUrl = `${CDN_BASES[0]}/${repoName}@main/package.json`;
    const res = await fetch(manifestUrl);
    const pkg = await res.json();

    return {
      hasUpdate: pkg.version !== app.manifest.version,
      currentVersion: app.manifest.version,
      latestVersion: pkg.version,
    };
  } catch {
    return { hasUpdate: false, currentVersion: app.manifest.version };
  }
}

/**
 * Subscribe to app changes
 */
export function subscribeToApps(
  listener: (apps: Map<string, LoadedApp>) => void
): () => void {
  appListeners.add(listener);
  return () => appListeners.delete(listener);
}

function notifyListeners(): void {
  appListeners.forEach(listener => listener(loadedApps));
}

// React hooks
export { useRuntime } from './hooks/useRuntime';
export { useApp } from './hooks/useApp';
export {
  useLifecycle,
  useAppEffect,
  useAppInterval,
  useAppTimeout,
  AppIdContext,
} from './hooks/useLifecycle';

// Components
export { DynamicApp } from './components/DynamicApp';

// Lifecycle management
export {
  createLifecycle,
  markMounted,
  unmountApp,
  forceQuitApp,
  destroyLifecycle,
  registerCleanup,
  registerInterval,
  registerTimeout,
  registerEventListener,
  getLifecycle,
  getAllLifecycles,
  onLifecycleEvent,
  quitAllApps,
  forceQuitAllApps,
  type AppLifecycle,
  type CleanupFn,
} from './lifecycle';
