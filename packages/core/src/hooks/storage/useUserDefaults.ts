/**
 * useUserDefaults - Global user preferences hook
 * Similar to SwiftUI's @UserDefaults / UserDefaults.standard
 */

import { useCallback, useSyncExternalStore } from 'react';
import {
  getUserDefaultsKey,
  getDefaultStorage,
  createStorageSnapshot,
  createServerSnapshot,
  type SyncedStorage,
} from './storage';

/**
 * Hook for global user preferences
 *
 * Values are shared across all apps and windows.
 * Ideal for system-wide settings like theme, language, accessibility.
 *
 * @param key - Storage key for the preference
 * @param defaultValue - Default value when key doesn't exist
 * @returns Tuple of [value, setValue] similar to useState
 *
 * @example
 * ```tsx
 * function SettingsPanel() {
 *   const [theme, setTheme] = useUserDefaults('theme', 'dark');
 *   const [lang, setLang] = useUserDefaults('language', 'en');
 *   return (
 *     <select value={theme} onChange={(e) => setTheme(e.target.value)}>
 *       <option value="dark">Dark</option>
 *       <option value="light">Light</option>
 *     </select>
 *   );
 * }
 * ```
 */
export function useUserDefaults<T>(
  key: string,
  defaultValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const storage = getDefaultStorage();
  const storageKey = getUserDefaultsKey(key);

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
 * Get a user default value outside of React
 */
export function getUserDefault<T>(key: string, defaultValue: T): T {
  const storage = getDefaultStorage();
  const storageKey = getUserDefaultsKey(key);
  const value = storage.get<T>(storageKey);
  return value !== null ? value : defaultValue;
}

/**
 * Set a user default value outside of React
 */
export function setUserDefault<T>(key: string, value: T): void {
  const storage = getDefaultStorage();
  const storageKey = getUserDefaultsKey(key);
  storage.set(storageKey, value);
}

export default useUserDefaults;
