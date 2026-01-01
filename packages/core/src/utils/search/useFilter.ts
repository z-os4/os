/**
 * useFilter Hook for zOS
 *
 * React hook for filtering items with multiple filter types
 */

import { useState, useMemo, useCallback } from 'react';
import type {
  FilterConfigs,
  FilterValues,
  FilterValue,
  UseFilterOptions,
  UseFilterReturn,
  ActiveFilter,
  FilterConfig,
} from './types';

/**
 * Get nested value from object
 */
function getNestedValue<T>(obj: T, path: string): unknown {
  const keys = path.split('.');
  let value: unknown = obj;

  for (const key of keys) {
    if (value === null || value === undefined) return undefined;
    if (typeof value !== 'object') return undefined;
    value = (value as Record<string, unknown>)[key];
  }

  return value;
}

/**
 * Check if a filter value is "active" (not null/undefined/empty)
 */
function isFilterActive(value: FilterValue): boolean {
  if (value === null || value === undefined) return false;
  if (Array.isArray(value) && value.length === 0) return false;
  if (typeof value === 'object' && 'min' in value && 'max' in value) {
    return true; // Range filters are active if they have min/max
  }
  if (typeof value === 'object' && 'start' in value && 'end' in value) {
    return true; // Date range filters are active if they have start/end
  }
  return true;
}

/**
 * Format filter value for display
 */
function formatFilterValue(value: FilterValue, config: FilterConfig): string {
  if (value === null || value === undefined) return '';

  switch (config.type) {
    case 'select':
      const selectOption = config.options.find((o) => o.value === value);
      return selectOption?.label ?? String(value);

    case 'multiSelect':
      if (Array.isArray(value)) {
        return value
          .map((v) => config.options.find((o) => o.value === v)?.label ?? String(v))
          .join(', ');
      }
      return String(value);

    case 'boolean':
      return config.labels
        ? value ? config.labels.true : config.labels.false
        : value ? 'Yes' : 'No';

    case 'range':
      if (typeof value === 'object' && 'min' in value && 'max' in value) {
        return `${value.min} - ${value.max}`;
      }
      return String(value);

    case 'dateRange':
      if (typeof value === 'object' && 'start' in value && 'end' in value) {
        const start = value.start instanceof Date ? value.start.toLocaleDateString() : String(value.start);
        const end = value.end instanceof Date ? value.end.toLocaleDateString() : String(value.end);
        return `${start} - ${end}`;
      }
      return String(value);

    case 'text':
      return String(value);

    default:
      return String(value);
  }
}

/**
 * Apply a single filter to an item
 */
function applyFilter<T>(
  item: T,
  key: string,
  value: FilterValue,
  config: FilterConfig
): boolean {
  if (!isFilterActive(value)) return true;

  const field = config.field ?? key;
  const itemValue = getNestedValue(item, field);

  switch (config.type) {
    case 'select':
      return itemValue === value;

    case 'multiSelect':
      if (Array.isArray(value)) {
        if (value.length === 0) return true;
        if (Array.isArray(itemValue)) {
          return value.some((v) => (itemValue as (string | number)[]).includes(v));
        }
        return (value as (string | number)[]).includes(itemValue as string | number);
      }
      return true;

    case 'boolean':
      return itemValue === value;

    case 'range':
      if (typeof value === 'object' && value !== null && 'min' in value && 'max' in value) {
        const rangeValue = value as { min: number; max: number };
        const numValue = Number(itemValue);
        if (isNaN(numValue)) return false;
        return numValue >= rangeValue.min && numValue <= rangeValue.max;
      }
      return true;

    case 'dateRange':
      if (typeof value === 'object' && value !== null && 'start' in value && 'end' in value) {
        const dateRangeValue = value as { start: Date; end: Date };
        const dateValue = itemValue instanceof Date
          ? itemValue
          : new Date(String(itemValue));
        if (isNaN(dateValue.getTime())) return false;
        return dateValue >= dateRangeValue.start && dateValue <= dateRangeValue.end;
      }
      return true;

    case 'text':
      if (typeof value === 'string' && typeof itemValue === 'string') {
        return itemValue.toLowerCase().includes(value.toLowerCase());
      }
      return true;

    default:
      return true;
  }
}

/**
 * React hook for filtering items with multiple filter types
 *
 * @example
 * ```tsx
 * const { filters, setFilter, results, activeFilters } = useFilter(items, {
 *   filters: {
 *     category: { type: 'select', options: categories },
 *     date: { type: 'dateRange' },
 *     price: { type: 'range', min: 0, max: 1000 },
 *   },
 * });
 *
 * return (
 *   <div>
 *     <select
 *       value={filters.category ?? ''}
 *       onChange={(e) => setFilter('category', e.target.value || null)}
 *     >
 *       <option value="">All</option>
 *       {categories.map((c) => (
 *         <option key={c.value} value={c.value}>{c.label}</option>
 *       ))}
 *     </select>
 *     {results.map((item) => (...))}
 *   </div>
 * );
 * ```
 */
export function useFilter<T, K extends string = string>(
  items: T[],
  options: UseFilterOptions<T, K>
): UseFilterReturn<T, K> {
  const {
    filters: filterConfigs,
    logic = 'and',
    initialValues = {},
    customFilter,
  } = options;

  // Filter state
  const [filterValues, setFilterValues] = useState<FilterValues<K>>(
    initialValues as FilterValues<K>
  );

  // Set a single filter
  const setFilter = useCallback((key: K, value: FilterValue) => {
    setFilterValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  // Set multiple filters
  const setFilters = useCallback((values: FilterValues<K>) => {
    setFilterValues((prev) => ({
      ...prev,
      ...values,
    }));
  }, []);

  // Reset a single filter
  const resetFilter = useCallback((key: K) => {
    setFilterValues((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  // Reset all filters
  const resetFilters = useCallback(() => {
    setFilterValues({});
  }, []);

  // Filter items
  const results = useMemo(() => {
    return items.filter((item) => {
      // Use custom filter if provided
      if (customFilter) {
        return customFilter(item, filterValues);
      }

      // Apply configured filters
      const filterKeys = Object.keys(filterConfigs) as K[];
      const filterResults = filterKeys.map((key) => {
        const config = filterConfigs[key];
        const value = filterValues[key];
        return applyFilter(item, key, value ?? null, config);
      });

      // Combine results based on logic
      if (logic === 'and') {
        return filterResults.every(Boolean);
      } else {
        // 'or' logic: pass if no filters active or at least one matches
        const activeFilters = filterKeys.filter((key) => isFilterActive(filterValues[key] ?? null));
        if (activeFilters.length === 0) return true;
        return filterResults.some(Boolean);
      }
    });
  }, [items, filterValues, filterConfigs, logic, customFilter]);

  // Build list of active filters
  const activeFilters = useMemo((): ActiveFilter<K>[] => {
    const active: ActiveFilter<K>[] = [];

    for (const [key, value] of Object.entries(filterValues)) {
      if (!isFilterActive(value as FilterValue)) continue;

      const config = filterConfigs[key as K];
      if (!config) continue;

      active.push({
        key: key as K,
        label: config.label ?? key,
        value: value as FilterValue,
        displayValue: formatFilterValue(value as FilterValue, config),
      });
    }

    return active;
  }, [filterValues, filterConfigs]);

  return {
    filters: filterValues,
    setFilter,
    setFilters,
    resetFilter,
    resetFilters,
    results,
    activeFilters,
    hasActiveFilters: activeFilters.length > 0,
    filterConfigs,
  };
}

/**
 * Combined search and filter hook
 */
export function useSearchAndFilter<T, K extends string = string>(
  items: T[],
  searchOptions: {
    keys: (keyof T | string)[];
    debounce?: number;
    threshold?: number;
  },
  filterOptions: UseFilterOptions<T, K>
): UseFilterReturn<T, K> & {
  query: string;
  setQuery: (query: string) => void;
  isSearching: boolean;
} {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Debounce query
  useMemo(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setIsSearching(false);
    }, searchOptions.debounce ?? 200);

    if (query !== debouncedQuery) {
      setIsSearching(true);
    }

    return () => clearTimeout(timer);
  }, [query, searchOptions.debounce, debouncedQuery]);

  // Import fuzzySearch dynamically to avoid circular deps
  const searchedItems = useMemo(() => {
    if (!debouncedQuery.trim()) {
      return items;
    }

    // Inline fuzzy search for combined hook
    const { keys, threshold = 0.3 } = searchOptions;
    return items.filter((item) => {
      for (const key of keys) {
        const value = getNestedValue(item, String(key));
        if (typeof value === 'string') {
          const normalizedQuery = debouncedQuery.toLowerCase();
          const normalizedValue = value.toLowerCase();

          // Simple substring match for combined hook
          if (normalizedValue.includes(normalizedQuery)) {
            return true;
          }

          // Basic fuzzy match
          let queryIdx = 0;
          for (let i = 0; i < normalizedValue.length && queryIdx < normalizedQuery.length; i++) {
            if (normalizedValue[i] === normalizedQuery[queryIdx]) {
              queryIdx++;
            }
          }
          if (queryIdx === normalizedQuery.length) {
            return true;
          }
        }
      }
      return false;
    });
  }, [items, debouncedQuery, searchOptions]);

  // Apply filters to searched items
  const filterResult = useFilter(searchedItems, filterOptions);

  return {
    ...filterResult,
    query,
    setQuery,
    isSearching,
  };
}

export type {
  FilterConfigs,
  FilterValues,
  FilterValue,
  UseFilterOptions,
  UseFilterReturn,
  ActiveFilter,
};
