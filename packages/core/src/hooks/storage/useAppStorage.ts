/**
 * useAppStorage - Per-app persistent storage hook
 * Similar to SwiftUI's @AppStorage property wrapper
 */

import { useCallback, useSyncExternalStore } from 'react';
import {
  getAppStorageKey,
  getDefaultStorage,
  createStorageSnapshot,
  createServerSnapshot,
  type SyncedStorage,
} from './storage';

/**
 * Hook for per-app persistent storage
 *
 * Values are namespaced by appId and persist across sessions.
 * Changes sync across browser tabs automatically.
 *
 * @param appId - Application identifier for namespace isolation
 * @param key - Storage key within the app namespace
 * @param defaultValue - Default value when key doesn't exist
 * @returns Tuple of [value, setValue] similar to useState
 *
 * @example
 * ```tsx
 * function MyApp() {
 *   const [count, setCount] = useAppStorage('my-app', 'count', 0);
 *   return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
 * }
 * ```
 */
export function useAppStorage<T>(
  appId: string,
  key: string,
  defaultValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const storage = getDefaultStorage();
  const storageKey = getAppStorageKey(appId, key);

  return useStorageValue(storage, storageKey, defaultValue);
}

/**
 * Internal hook that handles the actual storage subscription
 */
function useStorageValue<T>(
  storage: SyncedStorage,
  key: string,
  defaultValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  // Create snapshot getter for current value
  const getSnapshot = createStorageSnapshot(storage, key, defaultValue);
  const getServerSnapshot = createServerSnapshot(defaultValue);

  // Subscribe to storage changes
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      return storage.subscribe(key, onStoreChange);
    },
    [storage, key]
  );

  // Get current value using useSyncExternalStore for optimal React 18 integration
  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Setter that supports both direct values and updater functions
  const setValue = useCallback(
    (valueOrUpdater: T | ((prev: T) => T)) => {
      const currentValue = storage.get<T>(key) ?? defaultValue;
      const newValue =
        typeof valueOrUpdater === 'function'
          ? (valueOrUpdater as (prev: T) => T)(currentValue)
          : valueOrUpdater;
      storage.set(key, newValue);
    },
    [storage, key, defaultValue]
  );

  return [value, setValue];
}

export default useAppStorage;
