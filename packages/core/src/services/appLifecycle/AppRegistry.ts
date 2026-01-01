/**
 * zOS App Registry
 *
 * Singleton registry for app registration, lifecycle management, and state persistence.
 * Manages app instances, file/URL handlers, and coordinates lifecycle hooks.
 */

import type { ComponentType } from 'react';
import type {
  AppManifest,
  AppLifecycleHooks,
  RegisteredApp,
  AppStatus,
  LaunchOptions,
  SavedAppState,
  AppComponentProps,
} from './types';

/** Storage key prefix for app state */
const STATE_KEY_PREFIX = 'zos:app-state:';

/** Generate unique instance ID */
function generateInstanceId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Extract file extension from path
 */
function getExtension(path: string): string {
  const match = path.match(/\.([^.]+)$/);
  return match ? `.${match[1].toLowerCase()}` : '';
}

/**
 * Extract URL scheme from URL string
 */
function getScheme(url: string): string {
  const match = url.match(/^([a-z][a-z0-9+.-]*):\/\//i);
  return match ? match[1].toLowerCase() : '';
}

/**
 * App Registry Implementation
 */
class AppRegistryImpl {
  private apps: Map<string, RegisteredApp> = new Map();
  private fileHandlers: Map<string, string[]> = new Map(); // extension -> appIds
  private urlSchemeHandlers: Map<string, string> = new Map(); // scheme -> appId
  private instanceToApp: Map<string, string> = new Map(); // instanceId -> appId
  private listeners: Set<() => void> = new Set();

  /**
   * Register an app with the registry
   */
  register(
    manifest: AppManifest,
    component: ComponentType<AppComponentProps>,
    hooks?: AppLifecycleHooks
  ): void {
    const appId = manifest.id;

    if (this.apps.has(appId)) {
      console.warn(`App ${appId} already registered, updating registration`);
    }

    const registered: RegisteredApp = {
      manifest,
      status: 'registered',
      component,
      hooks,
      instances: [],
      lastActive: undefined,
    };

    this.apps.set(appId, registered);

    // Register file handlers
    if (manifest.capabilities?.canOpenFiles) {
      for (const ext of manifest.capabilities.canOpenFiles) {
        const normalizedExt = ext.startsWith('.') ? ext.toLowerCase() : `.${ext.toLowerCase()}`;
        const handlers = this.fileHandlers.get(normalizedExt) || [];
        if (!handlers.includes(appId)) {
          handlers.push(appId);
          this.fileHandlers.set(normalizedExt, handlers);
        }
      }
    }

    // Register URL scheme handlers
    if (manifest.capabilities?.urlSchemes) {
      for (const scheme of manifest.capabilities.urlSchemes) {
        const normalizedScheme = scheme.toLowerCase();
        // First registration wins for URL schemes
        if (!this.urlSchemeHandlers.has(normalizedScheme)) {
          this.urlSchemeHandlers.set(normalizedScheme, appId);
        }
      }
    }

    this.notifyListeners();
  }

  /**
   * Unregister an app from the registry
   */
  unregister(appId: string): void {
    const app = this.apps.get(appId);
    if (!app) {
      return;
    }

    // Terminate all instances first
    if (app.instances.length > 0) {
      console.warn(`Unregistering app ${appId} with ${app.instances.length} running instances`);
      // Clear instance mappings
      for (const instanceId of app.instances) {
        this.instanceToApp.delete(instanceId);
      }
    }

    // Remove file handlers
    for (const [ext, handlers] of this.fileHandlers) {
      const filtered = handlers.filter((id) => id !== appId);
      if (filtered.length === 0) {
        this.fileHandlers.delete(ext);
      } else if (filtered.length !== handlers.length) {
        this.fileHandlers.set(ext, filtered);
      }
    }

    // Remove URL scheme handlers
    for (const [scheme, handlerId] of this.urlSchemeHandlers) {
      if (handlerId === appId) {
        this.urlSchemeHandlers.delete(scheme);
      }
    }

    this.apps.delete(appId);
    this.notifyListeners();
  }

  /**
   * Launch an app instance
   */
  async launch(appId: string, options: LaunchOptions = {}): Promise<string> {
    const app = this.apps.get(appId);
    if (!app) {
      throw new Error(`App ${appId} not registered`);
    }

    // Check if we should reuse existing instance
    if (
      !options.forceNewWindow &&
      !app.manifest.capabilities?.supportsMultipleWindows &&
      app.instances.length > 0
    ) {
      // Activate existing instance
      const instanceId = app.instances[0];
      this.setStatus(appId, 'running');
      app.lastActive = Date.now();
      this.notifyListeners();
      return instanceId;
    }

    // Generate new instance ID
    const instanceId = generateInstanceId();

    // Update status to launching
    this.setStatus(appId, 'launching');

    try {
      // Call onLaunch hook
      if (app.hooks?.onLaunch) {
        await app.hooks.onLaunch();
      }

      // Restore state if requested
      if (options.restoreState && app.hooks?.onRestoreState) {
        const savedState = this.loadState(appId);
        if (savedState) {
          app.hooks.onRestoreState(savedState.state);
        }
      }

      // Add instance
      app.instances.push(instanceId);
      this.instanceToApp.set(instanceId, appId);

      // Update status to running
      this.setStatus(appId, 'running');
      app.lastActive = Date.now();

      this.notifyListeners();
      return instanceId;
    } catch (error) {
      // Revert status on failure
      this.setStatus(appId, app.instances.length > 0 ? 'running' : 'registered');
      throw error;
    }
  }

  /**
   * Terminate an app instance
   */
  async terminate(instanceId: string): Promise<void> {
    const appId = this.instanceToApp.get(instanceId);
    if (!appId) {
      console.warn(`Instance ${instanceId} not found`);
      return;
    }

    const app = this.apps.get(appId);
    if (!app) {
      return;
    }

    // Update status to terminating
    this.setStatus(appId, 'terminating');

    try {
      // Save state before terminating
      if (app.hooks?.onSaveState) {
        this.saveState(appId);
      }

      // Call onTerminate hook
      if (app.hooks?.onTerminate) {
        await app.hooks.onTerminate();
      }

      // Remove instance
      app.instances = app.instances.filter((id) => id !== instanceId);
      this.instanceToApp.delete(instanceId);

      // Update status based on remaining instances
      this.setStatus(appId, app.instances.length > 0 ? 'running' : 'registered');

      this.notifyListeners();
    } catch (error) {
      // Still remove instance on error but log it
      app.instances = app.instances.filter((id) => id !== instanceId);
      this.instanceToApp.delete(instanceId);
      this.setStatus(appId, app.instances.length > 0 ? 'running' : 'registered');
      this.notifyListeners();
      throw error;
    }
  }

  /**
   * Terminate all instances of an app
   */
  async terminateAll(appId: string): Promise<void> {
    const app = this.apps.get(appId);
    if (!app) {
      return;
    }

    // Copy array since we're modifying it
    const instances = [...app.instances];
    for (const instanceId of instances) {
      await this.terminate(instanceId);
    }
  }

  /**
   * Suspend an app (called when window is minimized or hidden)
   */
  suspend(appId: string): void {
    const app = this.apps.get(appId);
    if (!app || app.status !== 'running') {
      return;
    }

    this.setStatus(appId, 'suspended');

    // Save state on suspend
    if (app.hooks?.onSaveState) {
      this.saveState(appId);
    }

    if (app.hooks?.onDeactivate) {
      app.hooks.onDeactivate();
    }

    this.notifyListeners();
  }

  /**
   * Resume a suspended app
   */
  resume(appId: string): void {
    const app = this.apps.get(appId);
    if (!app || app.status !== 'suspended') {
      return;
    }

    this.setStatus(appId, 'running');
    app.lastActive = Date.now();

    if (app.hooks?.onActivate) {
      app.hooks.onActivate();
    }

    this.notifyListeners();
  }

  /**
   * Activate an app (when its window gains focus)
   */
  activate(appId: string): void {
    const app = this.apps.get(appId);
    if (!app) {
      return;
    }

    if (app.status === 'suspended') {
      this.resume(appId);
    } else if (app.status === 'running') {
      app.lastActive = Date.now();
      if (app.hooks?.onActivate) {
        app.hooks.onActivate();
      }
      this.notifyListeners();
    }
  }

  /**
   * Deactivate an app (when its window loses focus)
   */
  deactivate(appId: string): void {
    const app = this.apps.get(appId);
    if (!app || app.status !== 'running') {
      return;
    }

    if (app.hooks?.onDeactivate) {
      app.hooks.onDeactivate();
    }
  }

  /**
   * Get a registered app by ID
   */
  getApp(appId: string): RegisteredApp | undefined {
    return this.apps.get(appId);
  }

  /**
   * Get all registered apps
   */
  getAll(): RegisteredApp[] {
    return Array.from(this.apps.values());
  }

  /**
   * Get all running apps (has at least one instance)
   */
  getRunningApps(): RegisteredApp[] {
    return Array.from(this.apps.values()).filter(
      (app) => app.status === 'running' || app.status === 'suspended'
    );
  }

  /**
   * Get app ID for an instance
   */
  getAppIdForInstance(instanceId: string): string | undefined {
    return this.instanceToApp.get(instanceId);
  }

  /**
   * Find apps that can open a file extension
   */
  findAppForFile(extension: string): string[] {
    const normalizedExt = extension.startsWith('.') ? extension.toLowerCase() : `.${extension.toLowerCase()}`;
    return this.fileHandlers.get(normalizedExt) || [];
  }

  /**
   * Find app that handles a URL scheme
   */
  findAppForUrl(scheme: string): string | undefined {
    return this.urlSchemeHandlers.get(scheme.toLowerCase());
  }

  /**
   * Open a file with the appropriate app
   */
  async openFile(path: string, preferredAppId?: string): Promise<string | null> {
    const ext = getExtension(path);
    if (!ext) {
      return null;
    }

    let appId = preferredAppId;

    // Find handler if no preference
    if (!appId) {
      const handlers = this.findAppForFile(ext);
      if (handlers.length === 0) {
        return null;
      }
      appId = handlers[0];
    }

    return this.launch(appId, { data: { path, type: 'file' } });
  }

  /**
   * Open a URL with the appropriate app
   */
  async openUrl(url: string): Promise<string | null> {
    const scheme = getScheme(url);
    if (!scheme) {
      return null;
    }

    const appId = this.findAppForUrl(scheme);
    if (!appId) {
      return null;
    }

    return this.launch(appId, { data: { url, type: 'url' } });
  }

  /**
   * Save app state to localStorage
   */
  saveState(appId: string): void {
    const app = this.apps.get(appId);
    if (!app?.hooks?.onSaveState) {
      return;
    }

    try {
      const state = app.hooks.onSaveState();
      const savedState: SavedAppState = {
        appId,
        state,
        savedAt: Date.now(),
      };
      localStorage.setItem(`${STATE_KEY_PREFIX}${appId}`, JSON.stringify(savedState));
    } catch (error) {
      console.error(`Failed to save state for ${appId}:`, error);
    }
  }

  /**
   * Restore app state from localStorage
   */
  restoreState(appId: string): void {
    const app = this.apps.get(appId);
    if (!app?.hooks?.onRestoreState) {
      return;
    }

    const savedState = this.loadState(appId);
    if (savedState) {
      try {
        app.hooks.onRestoreState(savedState.state);
      } catch (error) {
        console.error(`Failed to restore state for ${appId}:`, error);
      }
    }
  }

  /**
   * Load saved state from localStorage
   */
  private loadState(appId: string): SavedAppState | null {
    try {
      const stored = localStorage.getItem(`${STATE_KEY_PREFIX}${appId}`);
      if (!stored) {
        return null;
      }
      return JSON.parse(stored) as SavedAppState;
    } catch {
      return null;
    }
  }

  /**
   * Clear saved state for an app
   */
  clearState(appId: string): void {
    localStorage.removeItem(`${STATE_KEY_PREFIX}${appId}`);
  }

  /**
   * Set app status
   */
  private setStatus(appId: string, status: AppStatus): void {
    const app = this.apps.get(appId);
    if (app) {
      app.status = status;
    }
  }

  /**
   * Subscribe to registry changes
   */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners of changes
   */
  private notifyListeners(): void {
    for (const listener of this.listeners) {
      try {
        listener();
      } catch (error) {
        console.error('Error in registry listener:', error);
      }
    }
  }

  /**
   * Get registry snapshot for debugging
   */
  debug(): {
    apps: [string, RegisteredApp][];
    fileHandlers: [string, string[]][];
    urlSchemeHandlers: [string, string][];
    instances: [string, string][];
  } {
    return {
      apps: Array.from(this.apps.entries()),
      fileHandlers: Array.from(this.fileHandlers.entries()),
      urlSchemeHandlers: Array.from(this.urlSchemeHandlers.entries()),
      instances: Array.from(this.instanceToApp.entries()),
    };
  }
}

/** Singleton app registry instance */
export const appRegistry = new AppRegistryImpl();
