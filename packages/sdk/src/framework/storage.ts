/**
 * App Storage - Reactive persistent storage
 *
 * Similar to SwiftUI's @AppStorage property wrapper.
 * Provides automatic persistence and cross-tab reactivity.
 */

import { useSyncExternalStore, useCallback, useEffect } from 'react';

// ============================================================================
// Types
// ============================================================================

/**
 * Storage backend type
 */
export type StorageType = 'local' | 'session' | 'sync';

/**
 * App storage options
 */
export interface AppStorageOptions<T> {
  /** Default value if not set */
  defaultValue: T;

  /** Storage type */
  store?: StorageType;

  /** Custom serializer */
  serializer?: Serializer<T>;

  /** Storage key prefix (default: app identifier) */
  prefix?: string;
}

/**
 * Custom serializer interface
 */
export interface Serializer<T> {
  serialize: (value: T) => string;
  deserialize: (value: string) => T;
}

/**
 * Settings hook factory options
 */
export interface CreateSettingsOptions<T> {
  /** Default settings values */
  defaults: T;

  /** Storage type */
  store?: StorageType;

  /** Schema version for migrations */
  version?: number;

  /** Migration function */
  migrate?: (oldSettings: unknown, fromVersion: number) => T;
}

// ============================================================================
// Storage Store
// ============================================================================

const STORAGE_CHANGE_EVENT = 'zos:storage:change';

function getStorageBackend(type: StorageType): Storage | null {
  if (typeof window === 'undefined') return null;

  switch (type) {
    case 'session':
      return window.sessionStorage;
    case 'sync':
    case 'local':
    default:
      return window.localStorage;
  }
}

class StorageStore {
  private listeners = new Map<string, Set<() => void>>();

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key) this.notify(e.key);
      });

      window.addEventListener(STORAGE_CHANGE_EVENT, ((e: CustomEvent<{ key: string }>) => {
        this.notify(e.detail.key);
      }) as EventListener);
    }
  }

  subscribe(key: string, callback: () => void): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key)!.add(callback);
    return () => this.listeners.get(key)?.delete(callback);
  }

  notify(key: string): void {
    this.listeners.get(key)?.forEach(cb => cb());
  }

  emitChange(key: string): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(STORAGE_CHANGE_EVENT, { detail: { key } }));
    }
  }
}

const storageStore = new StorageStore();

// ============================================================================
// Hooks
// ============================================================================

function useAppId(): string {
  return 'zos-app';
}

/**
 * useAppStorage - Reactive persistent storage for a single value
 */
export function useAppStorage<T>(
  key: string,
  options: AppStorageOptions<T>
): [T, (value: T | ((prev: T) => T)) => void] {
  const appId = useAppId();
  const { defaultValue, store = 'local', serializer, prefix = appId } = options;

  const fullKey = `zos:${prefix}:${key}`;
  const storage = getStorageBackend(store);

  const serialize = serializer?.serialize ?? JSON.stringify;
  const deserialize = serializer?.deserialize ?? JSON.parse;

  const subscribe = useCallback((callback: () => void) => {
    return storageStore.subscribe(fullKey, callback);
  }, [fullKey]);

  const getSnapshot = useCallback(() => {
    if (!storage) return defaultValue;
    try {
      const item = storage.getItem(fullKey);
      if (item === null) return defaultValue;
      return deserialize(item);
    } catch {
      return defaultValue;
    }
  }, [storage, fullKey, defaultValue, deserialize]);

  const getServerSnapshot = useCallback(() => defaultValue, [defaultValue]);

  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setValue = useCallback((newValue: T | ((prev: T) => T)) => {
    if (!storage) return;
    const resolvedValue = typeof newValue === 'function'
      ? (newValue as (prev: T) => T)(getSnapshot())
      : newValue;
    try {
      storage.setItem(fullKey, serialize(resolvedValue));
      storageStore.emitChange(fullKey);
    } catch (e) {
      console.error(`[AppStorage] Failed to save ${fullKey}:`, e);
    }
  }, [storage, fullKey, serialize, getSnapshot]);

  return [value, setValue];
}

/**
 * createSettingsHook - Factory for typed settings hooks
 */
export function createSettingsHook<T extends Record<string, unknown>>(
  options: CreateSettingsOptions<T>
) {
  const { defaults, store = 'local', version = 1, migrate } = options;

  return function useSettings(): [
    T,
    <K extends keyof T>(key: K, value: T[K]) => void,
    () => void
  ] {
    const appId = useAppId();
    const settingsKey = `${appId}:settings`;
    const versionKey = `${appId}:settings:version`;

    const [storedVersion] = useAppStorage(versionKey, { defaultValue: 0 });
    const [settings, setSettings] = useAppStorage<T>(settingsKey, { defaultValue: defaults });

    useEffect(() => {
      if (storedVersion < version && migrate && storedVersion > 0) {
        const migrated = migrate(settings, storedVersion);
        setSettings(migrated);
      }
    }, [storedVersion, version, migrate, settings, setSettings]);

    const updateSetting = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
      setSettings(prev => ({ ...prev, [key]: value }));
    }, [setSettings]);

    const resetSettings = useCallback(() => {
      setSettings(defaults);
    }, [setSettings, defaults]);

    return [settings, updateSetting, resetSettings];
  };
}

export function useLocalStorage<T>(key: string, defaultValue: T): [T, (value: T) => void] {
  return useAppStorage(key, { defaultValue, store: 'local' });
}

export function useSessionStorage<T>(key: string, defaultValue: T): [T, (value: T) => void] {
  return useAppStorage(key, { defaultValue, store: 'session' });
}
