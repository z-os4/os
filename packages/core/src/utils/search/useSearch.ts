/**
 * useSearch Hook for zOS
 *
 * React hook for fuzzy search with debouncing and highlighting
 */

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { fuzzySearch } from './fuzzySearch';
import { createSearchIndex } from './searchIndex';
import type {
  UseSearchOptions,
  UseSearchReturn,
  FuzzySearchResult,
  HighlightSegment,
  SearchIndex,
} from './types';

/**
 * Default options
 */
const DEFAULT_OPTIONS = {
  debounce: 200,
  minQueryLength: 1,
  threshold: 0.3,
  useIndex: false,
} as const;

/**
 * Custom debounce hook
 */
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

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
 * React hook for fuzzy searching through items
 *
 * @example
 * ```tsx
 * const { query, setQuery, results, highlights } = useSearch(notes, {
 *   keys: ['title', 'content', 'tags'],
 *   debounce: 200,
 * });
 *
 * return (
 *   <div>
 *     <input value={query} onChange={(e) => setQuery(e.target.value)} />
 *     {results.map((result) => (
 *       <div key={result.item.id}>
 *         {renderHighlights(highlights.get(result.item)?.title ?? [])}
 *       </div>
 *     ))}
 *   </div>
 * );
 * ```
 */
export function useSearch<T>(
  items: T[],
  options: UseSearchOptions<T>
): UseSearchReturn<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const {
    keys,
    debounce,
    minQueryLength,
    threshold,
    limit,
    initialQuery,
    useIndex,
  } = opts;

  // State
  const [query, setQueryState] = useState(initialQuery ?? '');
  const [isSearching, setIsSearching] = useState(false);

  // Debounced query
  const debouncedQuery = useDebounce(query, debounce);

  // Track if we're in debounce period
  useEffect(() => {
    if (query !== debouncedQuery) {
      setIsSearching(true);
    } else {
      setIsSearching(false);
    }
  }, [query, debouncedQuery]);

  // Search index (created once and updated when items change)
  const indexRef = useRef<SearchIndex<T & { id?: string }> | null>(null);

  // Create/update index when items change
  useMemo(() => {
    if (useIndex) {
      indexRef.current = createSearchIndex(items as (T & { id?: string })[], {
        fields: keys as string[],
      });
    }
    return indexRef.current;
  }, [items, keys, useIndex]);

  // Perform search
  const results = useMemo((): FuzzySearchResult<T>[] => {
    // Below minimum length, return all items
    if (debouncedQuery.length < minQueryLength) {
      return items.map((item) => ({
        item,
        score: 1,
        matches: {},
        highlights: {},
      }));
    }

    // Use index if available
    if (useIndex && indexRef.current) {
      return indexRef.current.search(debouncedQuery, { limit, threshold }) as FuzzySearchResult<T>[];
    }

    // Fall back to direct fuzzy search
    return fuzzySearch(debouncedQuery, items, {
      keys,
      threshold,
      limit,
      caseSensitive: false,
      sortByScore: true,
    });
  }, [debouncedQuery, items, keys, threshold, limit, minQueryLength, useIndex]);

  // Build highlights map for easy access
  const highlights = useMemo(() => {
    const map = new Map<T, Record<string, HighlightSegment[]>>();
    for (const result of results) {
      map.set(result.item, result.highlights);
    }
    return map;
  }, [results]);

  // Query setter with immediate state update
  const setQuery = useCallback((newQuery: string) => {
    setQueryState(newQuery);
  }, []);

  // Clear search
  const clear = useCallback(() => {
    setQueryState('');
  }, []);

  return {
    query,
    setQuery,
    results,
    isSearching,
    highlights,
    clear,
    totalItems: items.length,
    matchCount: results.length,
  };
}

/**
 * Hook for searching with async data loading
 */
export function useAsyncSearch<T>(
  fetchItems: (query: string) => Promise<T[]>,
  options: Omit<UseSearchOptions<T>, 'useIndex'> & { initialItems?: T[] }
): UseSearchReturn<T> & { error: Error | null; reload: () => void } {
  const {
    keys,
    debounce = 300,
    minQueryLength = 2,
    threshold = 0.3,
    limit,
    initialQuery = '',
    initialItems = [],
  } = options;

  const [query, setQueryState] = useState(initialQuery);
  const [items, setItems] = useState<T[]>(initialItems);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const debouncedQuery = useDebounce(query, debounce);

  // Fetch items when debounced query changes
  useEffect(() => {
    if (debouncedQuery.length < minQueryLength) {
      setItems(initialItems);
      setIsSearching(false);
      return;
    }

    let cancelled = false;
    setIsSearching(true);
    setError(null);

    fetchItems(debouncedQuery)
      .then((fetchedItems) => {
        if (!cancelled) {
          setItems(fetchedItems);
          setIsSearching(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setIsSearching(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, fetchItems, minQueryLength, initialItems]);

  // Process results with fuzzy search
  const results = useMemo((): FuzzySearchResult<T>[] => {
    if (debouncedQuery.length < minQueryLength) {
      return items.map((item) => ({
        item,
        score: 1,
        matches: {},
        highlights: {},
      }));
    }

    return fuzzySearch(debouncedQuery, items, {
      keys,
      threshold,
      limit,
      caseSensitive: false,
      sortByScore: true,
    });
  }, [debouncedQuery, items, keys, threshold, limit, minQueryLength]);

  const highlights = useMemo(() => {
    const map = new Map<T, Record<string, HighlightSegment[]>>();
    for (const result of results) {
      map.set(result.item, result.highlights);
    }
    return map;
  }, [results]);

  const setQuery = useCallback((newQuery: string) => {
    setQueryState(newQuery);
  }, []);

  const clear = useCallback(() => {
    setQueryState('');
    setItems(initialItems);
  }, [initialItems]);

  const reload = useCallback(() => {
    if (debouncedQuery.length >= minQueryLength) {
      setIsSearching(true);
      fetchItems(debouncedQuery)
        .then(setItems)
        .catch((err) => setError(err instanceof Error ? err : new Error(String(err))))
        .finally(() => setIsSearching(false));
    }
  }, [debouncedQuery, fetchItems, minQueryLength]);

  return {
    query,
    setQuery,
    results,
    isSearching: isSearching || query !== debouncedQuery,
    highlights,
    clear,
    totalItems: items.length,
    matchCount: results.length,
    error,
    reload,
  };
}

export type { UseSearchOptions, UseSearchReturn };
