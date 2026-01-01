/**
 * Core storage utilities for zOS
 * SwiftUI-style persistent storage with cross-tab synchronization
 */

import { logger } from '../../lib/logger';

// Key prefixes for namespace isolation
const PREFIX = {
  app: 'zos:app:',
  scene: 'zos:scene:',
  user: 'zos:user:',
} as const;

/**
 * Generate namespaced key for app-specific storage
 */
export function getAppStorageKey(appId: string, key: string): string {
  return `${PREFIX.app}${appId}:${key}`;
}

/**
 * Generate namespaced key for scene/window-specific storage
 */
export function getSceneStorageKey(sceneId: string, key: string): string {
  return `${PREFIX.scene}${sceneId}:${key}`;
}

/**
 * Generate namespaced key for global user preferences
 */
export function getUserDefaultsKey(key: string): string {
  return `${PREFIX.user}${key}`;
}

/**
 * Storage adapter interface for pluggable backends
 */
export interface StorageAdapter {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T): void;
  remove(key: string): void;
  keys(): string[];
}

/**
 * JSON serialization helpers with error handling
 */
function serialize<T>(value: T): string {
  try {
    return JSON.stringify(value);
  } catch (e) {
    logger.error('[Storage] Serialization failed:', e);
    throw new Error(`Failed to serialize value: ${e}`);
  }
}

function deserialize<T>(raw: string): T {
  try {
    return JSON.parse(raw) as T;
  } catch (e) {
    logger.error('[Storage] Deserialization failed:', e);
    throw new Error(`Failed to deserialize value: ${e}`);
  }
}

/**
 * LocalStorage adapter with JSON serialization
 */
export class LocalStorageAdapter implements StorageAdapter {
  get<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return null;
      return deserialize<T>(raw);
    } catch {
      return null;
    }
  }

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, serialize(value));
    } catch (e) {
      logger.error('[Storage] Failed to write:', key, e);
    }
  }

  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      logger.error('[Storage] Failed to remove:', key, e);
    }
  }

  keys(): string[] {
    const result: string[] = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key !== null) result.push(key);
      }
    } catch {
      // Ignore errors
    }
    return result;
  }
}

/**
 * SessionStorage adapter for ephemeral data
 */
export class SessionStorageAdapter implements StorageAdapter {
  get<T>(key: string): T | null {
    try {
      const raw = sessionStorage.getItem(key);
      if (raw === null) return null;
      return deserialize<T>(raw);
    } catch {
      return null;
    }
  }

  set<T>(key: string, value: T): void {
    try {
      sessionStorage.setItem(key, serialize(value));
    } catch (e) {
      logger.error('[Storage] Failed to write session:', key, e);
    }
  }

  remove(key: string): void {
    try {
      sessionStorage.removeItem(key);
    } catch (e) {
      logger.error('[Storage] Failed to remove session:', key, e);
    }
  }

  keys(): string[] {
    const result: string[] = [];
    try {
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key !== null) result.push(key);
      }
    } catch {
      // Ignore errors
    }
    return result;
  }
}

/**
 * Message type for cross-tab synchronization
 */
interface SyncMessage {
  type: 'storage:update' | 'storage:remove';
  key: string;
  value?: unknown;
  timestamp: number;
}

/**
 * Synced storage with cross-tab synchronization via BroadcastChannel
 * Falls back to storage events when BroadcastChannel is unavailable
 */
export class SyncedStorage implements StorageAdapter {
  private channel: BroadcastChannel | null = null;
  private listeners = new Map<string, Set<(value: unknown) => void>>();
  private adapter: StorageAdapter;
  private channelName: string;

  constructor(adapter?: StorageAdapter, channelName = 'zos:storage:sync') {
    this.adapter = adapter ?? new LocalStorageAdapter();
    this.channelName = channelName;
    this.initSync();
  }

  private initSync(): void {
    // Try BroadcastChannel first (preferred)
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        this.channel = new BroadcastChannel(this.channelName);
        this.channel.onmessage = (event: MessageEvent<SyncMessage>) => {
          this.handleSyncMessage(event.data);
        };
        return;
      } catch (e) {
        logger.warn('[Storage] BroadcastChannel unavailable, using storage events');
      }
    }

    // Fallback to storage events
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', this.handleStorageEvent);
    }
  }

  private handleStorageEvent = (event: StorageEvent): void => {
    if (event.key === null) return;

    const callbacks = this.listeners.get(event.key);
    if (!callbacks || callbacks.size === 0) return;

    let value: unknown = null;
    if (event.newValue !== null) {
      try {
        value = JSON.parse(event.newValue);
      } catch {
        value = null;
      }
    }

    callbacks.forEach((cb) => {
      try {
        cb(value);
      } catch (e) {
        logger.error('[Storage] Listener error:', e);
      }
    });
  };

  private handleSyncMessage(msg: SyncMessage): void {
    const callbacks = this.listeners.get(msg.key);
    if (!callbacks || callbacks.size === 0) return;

    const value = msg.type === 'storage:remove' ? null : msg.value;
    callbacks.forEach((cb) => {
      try {
        cb(value);
      } catch (e) {
        logger.error('[Storage] Listener error:', e);
      }
    });
  }

  private broadcast(msg: SyncMessage): void {
    if (this.channel) {
      try {
        this.channel.postMessage(msg);
      } catch (e) {
        logger.warn('[Storage] Broadcast failed:', e);
      }
    }
    // Storage events fire automatically for localStorage changes from other tabs
  }

  get<T>(key: string): T | null {
    return this.adapter.get<T>(key);
  }

  set<T>(key: string, value: T): void {
    this.adapter.set(key, value);
    this.broadcast({
      type: 'storage:update',
      key,
      value,
      timestamp: Date.now(),
    });
  }

  remove(key: string): void {
    this.adapter.remove(key);
    this.broadcast({
      type: 'storage:remove',
      key,
      timestamp: Date.now(),
    });
  }

  keys(): string[] {
    return this.adapter.keys();
  }

  /**
   * Subscribe to value changes for a specific key
   * Returns unsubscribe function
   */
  subscribe<T>(key: string, callback: (value: T | null) => void): () => void {
    let keyListeners = this.listeners.get(key);
    if (!keyListeners) {
      keyListeners = new Set();
      this.listeners.set(key, keyListeners);
    }

    const wrappedCallback = (value: unknown) => callback(value as T | null);
    keyListeners.add(wrappedCallback);

    return () => {
      keyListeners?.delete(wrappedCallback);
      if (keyListeners?.size === 0) {
        this.listeners.delete(key);
      }
    };
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', this.handleStorageEvent);
    }
    this.listeners.clear();
  }
}

// Singleton instances
let defaultStorage: SyncedStorage | null = null;

/**
 * Get the default synced storage instance
 */
export function getDefaultStorage(): SyncedStorage {
  if (!defaultStorage) {
    defaultStorage = new SyncedStorage();
  }
  return defaultStorage;
}

/**
 * Snapshot getter for useSyncExternalStore
 */
export function createStorageSnapshot<T>(
  storage: StorageAdapter,
  key: string,
  defaultValue: T
): () => T {
  return () => {
    const value = storage.get<T>(key);
    return value !== null ? value : defaultValue;
  };
}

/**
 * Server snapshot getter (always returns default for SSR)
 */
export function createServerSnapshot<T>(defaultValue: T): () => T {
  return () => defaultValue;
}
