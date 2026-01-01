/**
 * createStorageAtom - Jotai-like atom for shared reactive state
 * Provides both hook-based and direct access patterns
 */

import { useCallback, useSyncExternalStore } from 'react';
import {
  getDefaultStorage,
  createStorageSnapshot,
  createServerSnapshot,
  type StorageAdapter,
  type SyncedStorage,
} from './storage';

/**
 * Storage atom with hook and direct access
 */
export interface StorageAtom<T> {
  /** React hook to read the value reactively */
  useValue: () => T;
  /** React hook to get the setter function */
  useSetValue: () => (value: T | ((prev: T) => T)) => void;
  /** React hook to get both value and setter */
  useAtom: () => [T, (value: T | ((prev: T) => T)) => void];
  /** Direct value getter (non-reactive) */
  getValue: () => T;
  /** Direct value setter */
  setValue: (value: T | ((prev: T) => T)) => void;
  /** Subscribe to changes outside React */
  subscribe: (callback: (value: T) => void) => () => void;
  /** Storage key for debugging */
  key: string;
}

/**
 * Create a storage-backed atom for shared reactive state
 *
 * Provides Jotai-like ergonomics with localStorage persistence.
 * Values automatically sync across browser tabs.
 *
 * @param key - Storage key for persistence
 * @param defaultValue - Default value when key doesn't exist
 * @param storage - Optional custom storage adapter
 * @returns StorageAtom with hook and direct access methods
 *
 * @example
 * ```tsx
 * // Create atom at module level
 * const themeAtom = createStorageAtom('zos:theme', 'dark');
 *
 * // Use in components
 * function ThemePicker() {
 *   const [theme, setTheme] = themeAtom.useAtom();
 *   return <button onClick={() => setTheme('light')}>{theme}</button>;
 * }
 *
 * // Or split reads and writes
 * function ThemeDisplay() {
 *   const theme = themeAtom.useValue();
 *   return <span>{theme}</span>;
 * }
 *
 * // Direct access outside React
 * console.log(themeAtom.getValue());
 * themeAtom.setValue('system');
 * ```
 */
export function createStorageAtom<T>(
  key: string,
  defaultValue: T,
  storage?: StorageAdapter
): StorageAtom<T> {
  // Use provided storage or default synced storage
  const resolvedStorage = (storage ?? getDefaultStorage()) as SyncedStorage;

  // Hook to read value reactively
  const useValue = (): T => {
    const getSnapshot = createStorageSnapshot(resolvedStorage, key, defaultValue);
    const getServerSnapshot = createServerSnapshot(defaultValue);

    const subscribe = useCallback(
      (onStoreChange: () => void) => {
        return resolvedStorage.subscribe(key, onStoreChange);
      },
      []
    );

    return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  };

  // Hook to get setter
  const useSetValue = (): ((value: T | ((prev: T) => T)) => void) => {
    return useCallback((valueOrUpdater: T | ((prev: T) => T)) => {
      const currentValue = resolvedStorage.get<T>(key) ?? defaultValue;
      const newValue =
        typeof valueOrUpdater === 'function'
          ? (valueOrUpdater as (prev: T) => T)(currentValue)
          : valueOrUpdater;
      resolvedStorage.set(key, newValue);
    }, []);
  };

  // Combined hook for value and setter
  const useAtom = (): [T, (value: T | ((prev: T) => T)) => void] => {
    const value = useValue();
    const setValue = useSetValue();
    return [value, setValue];
  };

  // Direct value getter (non-reactive)
  const getValue = (): T => {
    const value = resolvedStorage.get<T>(key);
    return value !== null ? value : defaultValue;
  };

  // Direct value setter
  const setValue = (valueOrUpdater: T | ((prev: T) => T)): void => {
    const currentValue = resolvedStorage.get<T>(key) ?? defaultValue;
    const newValue =
      typeof valueOrUpdater === 'function'
        ? (valueOrUpdater as (prev: T) => T)(currentValue)
        : valueOrUpdater;
    resolvedStorage.set(key, newValue);
  };

  // Subscribe to changes outside React
  const subscribe = (callback: (value: T) => void): (() => void) => {
    return resolvedStorage.subscribe<T | null>(key, (value) => {
      callback(value !== null ? value : defaultValue);
    });
  };

  return {
    useValue,
    useSetValue,
    useAtom,
    getValue,
    setValue,
    subscribe,
    key,
  };
}

/**
 * Create a derived atom that computes from another atom
 */
export function createDerivedAtom<T, D>(
  sourceAtom: StorageAtom<T>,
  derive: (value: T) => D
): {
  useValue: () => D;
  getValue: () => D;
  subscribe: (callback: (value: D) => void) => () => void;
} {
  const useValue = (): D => {
    const sourceValue = sourceAtom.useValue();
    return derive(sourceValue);
  };

  const getValue = (): D => {
    return derive(sourceAtom.getValue());
  };

  const subscribe = (callback: (value: D) => void): (() => void) => {
    return sourceAtom.subscribe((value) => {
      callback(derive(value));
    });
  };

  return { useValue, getValue, subscribe };
}

export default createStorageAtom;
