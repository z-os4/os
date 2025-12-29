/**
 * useDebounce Hook
 *
 * Debounce a value to limit update frequency.
 *
 * @example
 * ```tsx
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearch = useDebounce(searchTerm, 300);
 *
 * useEffect(() => {
 *   performSearch(debouncedSearch);
 * }, [debouncedSearch]);
 * ```
 */

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Debounce a value
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Debounce a callback function
 *
 * @example
 * ```tsx
 * const debouncedSave = useDebouncedCallback(
 *   (value: string) => saveToServer(value),
 *   500
 * );
 * ```
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number = 300
): T {
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const callbackRef = useRef(callback);

  // Keep callback reference up to date
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay]
  ) as T;

  return debouncedCallback;
}

/**
 * Throttle a callback function (fire immediately, then limit)
 *
 * @example
 * ```tsx
 * const throttledScroll = useThrottledCallback(handleScroll, 100);
 * ```
 */
export function useThrottledCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number = 300
): T {
  const lastRun = useRef(Date.now());
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      const elapsed = now - lastRun.current;

      if (elapsed >= delay) {
        lastRun.current = now;
        callbackRef.current(...args);
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
          lastRun.current = Date.now();
          callbackRef.current(...args);
        }, delay - elapsed);
      }
    },
    [delay]
  ) as T;

  return throttledCallback;
}
