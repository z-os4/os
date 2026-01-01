/**
 * useSceneStorage - Window/scene-specific storage hook
 * Similar to SwiftUI's @SceneStorage property wrapper
 */

import { useCallback, useSyncExternalStore } from 'react';
import {
  getSceneStorageKey,
  getDefaultStorage,
  createStorageSnapshot,
  createServerSnapshot,
  type SyncedStorage,
} from './storage';

/**
 * Hook for window/scene-specific persistent storage
 *
 * Values are namespaced by sceneId, allowing different windows
 * to maintain independent state while persisting across sessions.
 *
 * @param sceneId - Scene/window identifier for namespace isolation
 * @param key - Storage key within the scene namespace
 * @param defaultValue - Default value when key doesn't exist
 * @returns Tuple of [value, setValue] similar to useState
 *
 * @example
 * ```tsx
 * function EditorWindow({ windowId }: { windowId: string }) {
 *   const [scrollPos, setScrollPos] = useSceneStorage(windowId, 'scroll', 0);
 *   return <Editor scrollTop={scrollPos} onScroll={setScrollPos} />;
 * }
 * ```
 */
export function useSceneStorage<T>(
  sceneId: string,
  key: string,
  defaultValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const storage = getDefaultStorage();
  const storageKey = getSceneStorageKey(sceneId, key);

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

/**
 * Clear all storage for a specific scene
 * Useful when closing a window permanently
 */
export function clearSceneStorage(sceneId: string): void {
  const storage = getDefaultStorage();
  const prefix = getSceneStorageKey(sceneId, '');
  const keys = storage.keys().filter((k) => k.startsWith(prefix));
  keys.forEach((k) => storage.remove(k));
}

export default useSceneStorage;
