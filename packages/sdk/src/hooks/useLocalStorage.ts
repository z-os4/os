/**
 * useLocalStorage Hook
 *
 * React hook for persisting state in localStorage with automatic JSON serialization.
 *
 * @example
 * ```tsx
 * const [notes, setNotes] = useLocalStorage<Note[]>('notes', []);
 *
 * // Supports Date objects
 * const [events, setEvents] = useLocalStorage<Event[]>('events', [], {
 *   deserialize: (data) => data.map(e => ({ ...e, date: new Date(e.date) }))
 * });
 * ```
 */

import { useState, useEffect, useCallback } from 'react';

export interface UseLocalStorageOptions<T> {
  /** Custom serializer */
  serialize?: (value: T) => string;
  /** Custom deserializer */
  deserialize?: (value: T) => T;
  /** Namespace prefix for key */
  prefix?: string;
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options: UseLocalStorageOptions<T> = {}
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const {
    serialize = JSON.stringify,
    deserialize = (v) => v,
    prefix = 'zos:',
  } = options;

  const storageKey = `${prefix}${key}`;

  // Initialize state from localStorage or default
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = localStorage.getItem(storageKey);
      if (item) {
        const parsed = JSON.parse(item);
        return deserialize(parsed);
      }
      return initialValue;
    } catch (error) {
      console.error(`[useLocalStorage] Error reading ${storageKey}:`, error);
      return initialValue;
    }
  });

  // Update localStorage when state changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(storageKey, serialize(storedValue));
    } catch (error) {
      console.error(`[useLocalStorage] Error writing ${storageKey}:`, error);
    }
  }, [storageKey, storedValue, serialize]);

  // Setter function that supports functional updates
  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setStoredValue((prev) => {
      const newValue = value instanceof Function ? value(prev) : value;
      return newValue;
    });
  }, []);

  // Remove from storage
  const removeValue = useCallback(() => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(storageKey);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`[useLocalStorage] Error removing ${storageKey}:`, error);
    }
  }, [storageKey, initialValue]);

  return [storedValue, setValue, removeValue];
}

/**
 * Create a namespaced storage hook for an app
 *
 * @example
 * ```tsx
 * const useNotesStorage = createAppStorage('notes');
 * const [notes, setNotes] = useNotesStorage<Note[]>('list', []);
 * ```
 */
export function createAppStorage(appId: string) {
  return function useAppStorage<T>(
    key: string,
    initialValue: T,
    options: Omit<UseLocalStorageOptions<T>, 'prefix'> = {}
  ) {
    return useLocalStorage(key, initialValue, {
      ...options,
      prefix: `zos:${appId}:`,
    });
  };
}
