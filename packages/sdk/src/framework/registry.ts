/**
 * App Registry
 * 
 * Global registry for managing registered zOS applications.
 */

import type { RegisteredApp, FileHandler, URLHandler } from './types';

/**
 * App registry - manages all registered apps
 */
export class AppRegistry {
  private static apps = new Map<string, RegisteredApp>();
  private static fileHandlers = new Map<string, { appId: string; handler: FileHandler }[]>();
  private static urlHandlers = new Map<string, { appId: string; handler: URLHandler }>();
  
  // Event listeners
  private static listeners = new Set<(event: RegistryEvent) => void>();
  
  /**
   * Register an app
   */
  static register(app: RegisteredApp): void {
    const { identifier } = app.manifest;
    
    // Check for duplicate
    if (this.apps.has(identifier)) {
      console.warn(`[AppRegistry] App ${identifier} already registered, replacing...`);
      this.unregister(identifier);
    }
    
    // Store app
    this.apps.set(identifier, app);
    
    // Register file handlers
    if (app.fileHandlers) {
      for (const handler of app.fileHandlers) {
        for (const ext of handler.extensions) {
          const key = ext.toLowerCase();
          if (!this.fileHandlers.has(key)) {
            this.fileHandlers.set(key, []);
          }
          this.fileHandlers.get(key)!.push({ appId: identifier, handler });
        }
      }
    }
    
    // Register URL handlers
    if (app.urlHandlers) {
      for (const handler of app.urlHandlers) {
        this.urlHandlers.set(handler.scheme.toLowerCase(), { appId: identifier, handler });
      }
    }
    
    // Emit event
    this.emit({ type: 'register', appId: identifier });
  }
  
  /**
   * Unregister an app
   */
  static unregister(identifier: string): boolean {
    const app = this.apps.get(identifier);
    if (!app) return false;
    
    // Remove file handlers
    for (const [ext, handlers] of this.fileHandlers.entries()) {
      const filtered = handlers.filter(h => h.appId !== identifier);
      if (filtered.length === 0) {
        this.fileHandlers.delete(ext);
      } else {
        this.fileHandlers.set(ext, filtered);
      }
    }
    
    // Remove URL handlers
    for (const [scheme, handler] of this.urlHandlers.entries()) {
      if (handler.appId === identifier) {
        this.urlHandlers.delete(scheme);
      }
    }
    
    // Remove app
    this.apps.delete(identifier);
    
    // Emit event
    this.emit({ type: 'unregister', appId: identifier });
    
    return true;
  }
  
  /**
   * Get an app by identifier
   */
  static get(identifier: string): RegisteredApp | undefined {
    return this.apps.get(identifier);
  }
  
  /**
   * Check if an app is registered
   */
  static has(identifier: string): boolean {
    return this.apps.has(identifier);
  }
  
  /**
   * Get all registered apps
   */
  static getAll(): RegisteredApp[] {
    return Array.from(this.apps.values());
  }
  
  /**
   * Get apps by category
   */
  static getByCategory(category: string): RegisteredApp[] {
    return this.getAll().filter(app => app.manifest.category === category);
  }
  
  /**
   * Get apps that handle a file extension
   */
  static getHandlersForExtension(extension: string): Array<{ app: RegisteredApp; handler: FileHandler }> {
    const handlers = this.fileHandlers.get(extension.toLowerCase()) || [];
    return handlers
      .map(h => ({
        app: this.apps.get(h.appId)!,
        handler: h.handler,
      }))
      .filter(h => h.app !== undefined);
  }
  
  /**
   * Get app that handles a URL scheme
   */
  static getHandlerForScheme(scheme: string): { app: RegisteredApp; handler: URLHandler } | undefined {
    const handler = this.urlHandlers.get(scheme.toLowerCase());
    if (!handler) return undefined;
    
    const app = this.apps.get(handler.appId);
    if (!app) return undefined;
    
    return { app, handler: handler.handler };
  }
  
  /**
   * Get the default app for a file extension
   */
  static getDefaultHandlerForExtension(extension: string): RegisteredApp | undefined {
    const handlers = this.getHandlersForExtension(extension);
    // Prefer editors over viewers
    const editor = handlers.find(h => h.handler.role === 'editor');
    if (editor) return editor.app;
    return handlers[0]?.app;
  }
  
  /**
   * Subscribe to registry events
   */
  static subscribe(listener: (event: RegistryEvent) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  
  /**
   * Emit a registry event
   */
  private static emit(event: RegistryEvent): void {
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (e) {
        console.error('[AppRegistry] Event listener error:', e);
      }
    }
  }
  
  /**
   * Clear all registered apps (for testing)
   */
  static clear(): void {
    this.apps.clear();
    this.fileHandlers.clear();
    this.urlHandlers.clear();
    this.emit({ type: 'clear' });
  }
}

/**
 * Registry event types
 */
export type RegistryEvent =
  | { type: 'register'; appId: string }
  | { type: 'unregister'; appId: string }
  | { type: 'clear' };
