import type { ComponentType } from 'react';
import type { AppManifest, LoadedApp, AppProps, AppRegistry, RegistryEntry } from './types';

// Cache for loaded apps
const appCache = new Map<string, LoadedApp>();

// Registry cache
let registryCache: AppRegistry | null = null;
let registryCacheTime = 0;
const REGISTRY_TTL = 5 * 60 * 1000; // 5 minutes

// Registry URLs
const REGISTRY_URL = 'https://zeekay.io/zos-apps/apps.json';
const REGISTRY_CDN_URL = 'https://cdn.jsdelivr.net/gh/zeekay/zos-apps@main/docs/apps.json';

/**
 * Fetch the app registry from GitHub Pages
 * Falls back to jsDelivr CDN if registry not available
 */
export async function fetchRegistry(): Promise<AppRegistry> {
  // Check cache
  if (registryCache && Date.now() - registryCacheTime < REGISTRY_TTL) {
    return registryCache;
  }

  try {
    // Try GitHub Pages registry first (no rate limit)
    const res = await fetch(REGISTRY_URL);
    if (res.ok) {
      registryCache = await res.json();
      registryCacheTime = Date.now();
      return registryCache!;
    }
  } catch {
    // Fall through to CDN fallback
  }

  // Fallback: fetch from jsDelivr CDN
  try {
    const res = await fetch(REGISTRY_CDN_URL);
    if (res.ok) {
      registryCache = await res.json();
      registryCacheTime = Date.now();
      return registryCache!;
    }
  } catch {
    // Fall through to empty registry
  }

  // Return empty registry if all fails
  return { apps: {}, updated: new Date().toISOString() };
}


/**
 * Load an app dynamically from CDN
 */
export async function loadApp(identifier: string): Promise<LoadedApp> {
  // Check cache
  if (appCache.has(identifier)) {
    return appCache.get(identifier)!;
  }

  const registry = await fetchRegistry();
  const entry = registry.apps[identifier];

  if (!entry) {
    throw new Error(`App not found: ${identifier}`);
  }

  // Dynamic import from CDN
  let module: { default?: ComponentType<AppProps> };
  try {
    module = await import(/* @vite-ignore */ entry.cdn);
  } catch (error) {
    // Fallback: try loading from raw GitHub
    const fallbackUrl = entry.cdn.replace('cdn.jsdelivr.net/gh', 'raw.githubusercontent.com');
    module = await import(/* @vite-ignore */ fallbackUrl);
  }

  const component = module.default;
  if (!component) {
    throw new Error(`App ${identifier} does not export a default component`);
  }

  const loadedApp: LoadedApp = {
    manifest: entry.manifest,
    component,
    source: 'zos-apps',
  };

  appCache.set(identifier, loadedApp);
  return loadedApp;
}

/**
 * Preload an app (fetch but don't render)
 */
export async function preloadApp(identifier: string): Promise<void> {
  await loadApp(identifier);
}

/**
 * Clear app cache
 */
export function clearCache(): void {
  appCache.clear();
  registryCache = null;
  registryCacheTime = 0;
}

/**
 * Get all available apps from registry
 */
export async function getAvailableApps(): Promise<AppManifest[]> {
  const registry = await fetchRegistry();
  return Object.values(registry.apps).map(entry => entry.manifest);
}

/**
 * Check if an app is cached/loaded
 */
export function isAppLoaded(identifier: string): boolean {
  return appCache.has(identifier);
}
