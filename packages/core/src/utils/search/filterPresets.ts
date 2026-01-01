/**
 * Filter Presets for zOS
 *
 * Reusable filter configurations with persistence
 */

import type {
  FilterPreset,
  FilterPresetsConfig,
  FilterPresetsReturn,
  FilterValues,
} from './types';

/**
 * Generate unique preset ID
 */
function generatePresetId(): string {
  return `preset-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Storage abstraction for preset persistence
 */
interface PresetStorage {
  get: (key: string) => FilterPreset[] | null;
  set: (key: string, presets: FilterPreset[]) => void;
  remove: (key: string) => void;
}

/**
 * Default localStorage-based storage
 */
const localStorageAdapter: PresetStorage = {
  get(key: string): FilterPreset[] | null {
    if (typeof window === 'undefined') return null;
    try {
      const data = localStorage.getItem(key);
      if (!data) return null;
      const parsed = JSON.parse(data);
      // Restore Date objects in filter values
      return parsed.map((preset: FilterPreset) => ({
        ...preset,
        values: restoreDateValues(preset.values),
      }));
    } catch {
      return null;
    }
  },

  set(key: string, presets: FilterPreset[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(presets));
    } catch {
      console.warn('Failed to save filter presets to localStorage');
    }
  },

  remove(key: string): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignore errors
    }
  },
};

/**
 * Restore Date objects from ISO strings in filter values
 */
function restoreDateValues<K extends string>(values: FilterValues<K>): FilterValues<K> {
  const restored: FilterValues<K> = { ...values };

  for (const [key, value] of Object.entries(restored)) {
    if (
      typeof value === 'object' &&
      value !== null &&
      'start' in value &&
      'end' in value
    ) {
      (restored as Record<string, unknown>)[key] = {
        start: new Date(value.start as string | Date),
        end: new Date(value.end as string | Date),
      };
    }
  }

  return restored;
}

/**
 * Create filter presets manager
 *
 * @example
 * ```ts
 * const presets = createFilterPresets({
 *   storageKey: 'my-app-filter-presets',
 *   presets: [
 *     { id: 'recent', name: 'Recent Items', values: { date: { start: lastWeek, end: now } }, builtIn: true },
 *     { id: 'expensive', name: 'High Value', values: { price: { min: 500, max: 1000 } }, builtIn: true },
 *   ],
 *   maxPresets: 10,
 * });
 *
 * // Apply preset
 * const values = presets.applyPreset('recent');
 * if (values) {
 *   setFilters(values);
 * }
 *
 * // Save current filters
 * presets.savePreset('My Custom Filter', currentFilters);
 * ```
 */
export function createFilterPresets<K extends string = string>(
  config: FilterPresetsConfig<K>
): FilterPresetsReturn<K> {
  const {
    storageKey,
    presets: builtInPresets = [],
    maxPresets = 20,
  } = config;

  // Initialize presets from storage or built-ins
  let userPresets: FilterPreset<K>[] = [];

  if (storageKey) {
    const stored = localStorageAdapter.get(storageKey) as FilterPreset<K>[] | null;
    if (stored) {
      userPresets = stored.filter((p) => !p.builtIn);
    }
  }

  // Combine built-in and user presets
  const getAllPresets = (): FilterPreset<K>[] => {
    return [...builtInPresets, ...userPresets];
  };

  // Save user presets to storage
  const saveToStorage = (): void => {
    if (storageKey) {
      localStorageAdapter.set(storageKey, userPresets);
    }
  };

  return {
    get presets(): FilterPreset<K>[] {
      return getAllPresets();
    },

    applyPreset(id: string): FilterValues<K> | null {
      const preset = getAllPresets().find((p) => p.id === id);
      return preset ? { ...preset.values } : null;
    },

    savePreset(name: string, values: FilterValues<K>, description?: string): FilterPreset<K> {
      // Check max presets limit (excluding built-ins)
      if (userPresets.length >= maxPresets) {
        // Remove oldest user preset
        userPresets = userPresets.slice(1);
      }

      const preset: FilterPreset<K> = {
        id: generatePresetId(),
        name,
        description,
        values: { ...values },
        builtIn: false,
      };

      userPresets.push(preset);
      saveToStorage();

      return preset;
    },

    deletePreset(id: string): boolean {
      const initialLength = userPresets.length;
      userPresets = userPresets.filter((p) => p.id !== id);

      if (userPresets.length !== initialLength) {
        saveToStorage();
        return true;
      }

      return false;
    },

    updatePreset(id: string, updates: Partial<Omit<FilterPreset<K>, 'id' | 'builtIn'>>): boolean {
      const index = userPresets.findIndex((p) => p.id === id);
      if (index === -1) return false;

      userPresets[index] = {
        ...userPresets[index],
        ...updates,
      };

      saveToStorage();
      return true;
    },

    hasPreset(id: string): boolean {
      return getAllPresets().some((p) => p.id === id);
    },
  };
}

/**
 * React hook for filter presets with state management
 */
export function useFilterPresets<K extends string = string>(
  config: FilterPresetsConfig<K>
): FilterPresetsReturn<K> & {
  /** Refresh presets from storage */
  refresh: () => void;
} {
  // Create presets manager
  const manager = createFilterPresets(config);

  return {
    ...manager,
    refresh(): void {
      // Re-create manager to refresh from storage
      // In a real implementation, this would use React state
    },
  };
}

/**
 * Quick filter utilities for common patterns
 */
export const QuickFilters = {
  /**
   * Create a "today" date range filter
   */
  today(): { start: Date; end: Date } {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    return { start, end };
  },

  /**
   * Create a "this week" date range filter
   */
  thisWeek(): { start: Date; end: Date } {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const start = new Date(now);
    start.setDate(now.getDate() - dayOfWeek);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    return { start, end };
  },

  /**
   * Create a "this month" date range filter
   */
  thisMonth(): { start: Date; end: Date } {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    return { start, end };
  },

  /**
   * Create a "last N days" date range filter
   */
  lastDays(n: number): { start: Date; end: Date } {
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const start = new Date();
    start.setDate(start.getDate() - n);
    start.setHours(0, 0, 0, 0);

    return { start, end };
  },

  /**
   * Create a price range filter
   */
  priceRange(min: number, max: number): { min: number; max: number } {
    return { min, max };
  },
};

export type { FilterPreset, FilterPresetsConfig, FilterPresetsReturn };
