/**
 * Search and Filter Types for zOS
 */

// ============================================================================
// Fuzzy Search Types
// ============================================================================

export interface FuzzySearchOptions<T> {
  /** Fields to search in (supports nested paths like 'meta.title') */
  keys: (keyof T | string)[];
  /** Minimum score threshold (0-1), default 0.3 */
  threshold?: number;
  /** Maximum results to return */
  limit?: number;
  /** Case sensitive matching, default false */
  caseSensitive?: boolean;
  /** Sort by score descending, default true */
  sortByScore?: boolean;
}

export interface FuzzyMatch {
  /** Field that matched */
  key: string;
  /** Character indices that matched */
  indices: number[];
  /** Match score for this field (0-1) */
  score: number;
  /** Original value that was matched */
  value: string;
}

export interface FuzzySearchResult<T> {
  /** Original item */
  item: T;
  /** Overall match score (0-1) */
  score: number;
  /** Matches per field */
  matches: Record<string, FuzzyMatch>;
  /** Highlighted strings per field */
  highlights: Record<string, HighlightSegment[]>;
}

export interface HighlightSegment {
  /** Text content */
  text: string;
  /** Whether this segment is highlighted (matched) */
  highlighted: boolean;
}

// ============================================================================
// Search Index Types
// ============================================================================

export interface SearchIndexOptions<T> {
  /** Fields to index */
  fields: (keyof T | string)[];
  /** Enable word stemming, default true */
  stemming?: boolean;
  /** Custom tokenizer function */
  tokenizer?: (text: string) => string[];
  /** Custom stemmer function */
  stemmer?: (word: string) => string;
  /** Stop words to exclude */
  stopWords?: Set<string>;
  /** Minimum token length, default 2 */
  minTokenLength?: number;
}

export interface SearchIndex<T> {
  /** Search the index */
  search: (query: string, options?: { limit?: number; threshold?: number }) => FuzzySearchResult<T>[];
  /** Add item to index */
  add: (item: T, id?: string) => void;
  /** Remove item from index */
  remove: (id: string) => void;
  /** Update item in index */
  update: (id: string, item: T) => void;
  /** Clear all items */
  clear: () => void;
  /** Get index size */
  size: () => number;
}

export interface IndexedItem<T> {
  id: string;
  item: T;
  tokens: Map<string, Set<string>>; // field -> tokens
}

// ============================================================================
// useSearch Hook Types
// ============================================================================

export interface UseSearchOptions<T> {
  /** Fields to search */
  keys: (keyof T | string)[];
  /** Debounce delay in ms, default 200 */
  debounce?: number;
  /** Minimum query length to trigger search, default 1 */
  minQueryLength?: number;
  /** Score threshold, default 0.3 */
  threshold?: number;
  /** Maximum results */
  limit?: number;
  /** Initial query */
  initialQuery?: string;
  /** Enable search indexing for large datasets */
  useIndex?: boolean;
}

export interface UseSearchReturn<T> {
  /** Current search query */
  query: string;
  /** Update search query */
  setQuery: (query: string) => void;
  /** Filtered/ranked results */
  results: FuzzySearchResult<T>[];
  /** Whether search is in progress (debouncing) */
  isSearching: boolean;
  /** Highlights map for easy rendering */
  highlights: Map<T, Record<string, HighlightSegment[]>>;
  /** Clear search */
  clear: () => void;
  /** Total items count */
  totalItems: number;
  /** Matching items count */
  matchCount: number;
}

// ============================================================================
// useFilter Hook Types
// ============================================================================

export type FilterType =
  | 'select'
  | 'multiSelect'
  | 'boolean'
  | 'range'
  | 'dateRange'
  | 'text';

export interface BaseFilterConfig {
  /** Filter type */
  type: FilterType;
  /** Display label */
  label?: string;
  /** Field to filter on (defaults to filter key) */
  field?: string;
}

export interface SelectFilterConfig extends BaseFilterConfig {
  type: 'select';
  options: { value: string | number; label: string }[];
  multiple?: false;
}

export interface MultiSelectFilterConfig extends BaseFilterConfig {
  type: 'multiSelect';
  options: { value: string | number; label: string }[];
}

export interface BooleanFilterConfig extends BaseFilterConfig {
  type: 'boolean';
  /** Labels for true/false states */
  labels?: { true: string; false: string };
}

export interface RangeFilterConfig extends BaseFilterConfig {
  type: 'range';
  min: number;
  max: number;
  step?: number;
}

export interface DateRangeFilterConfig extends BaseFilterConfig {
  type: 'dateRange';
  /** Min selectable date */
  minDate?: Date;
  /** Max selectable date */
  maxDate?: Date;
}

export interface TextFilterConfig extends BaseFilterConfig {
  type: 'text';
  /** Placeholder text */
  placeholder?: string;
}

export type FilterConfig =
  | SelectFilterConfig
  | MultiSelectFilterConfig
  | BooleanFilterConfig
  | RangeFilterConfig
  | DateRangeFilterConfig
  | TextFilterConfig;

export type FilterConfigs<K extends string = string> = Record<K, FilterConfig>;

export type FilterValue =
  | string
  | number
  | boolean
  | string[]
  | number[]
  | { min: number; max: number }
  | { start: Date; end: Date }
  | null;

export type FilterValues<K extends string = string> = Partial<Record<K, FilterValue>>;

export interface UseFilterOptions<T, K extends string = string> {
  /** Filter configurations */
  filters: FilterConfigs<K>;
  /** Logic for combining filters: 'and' | 'or', default 'and' */
  logic?: 'and' | 'or';
  /** Initial filter values */
  initialValues?: FilterValues<K>;
  /** Custom filter function for complex logic */
  customFilter?: (item: T, filters: FilterValues<K>) => boolean;
}

export interface ActiveFilter<K extends string = string> {
  key: K;
  label: string;
  value: FilterValue;
  displayValue: string;
}

export interface UseFilterReturn<T, K extends string = string> {
  /** Current filter values */
  filters: FilterValues<K>;
  /** Set a single filter value */
  setFilter: (key: K, value: FilterValue) => void;
  /** Set multiple filter values */
  setFilters: (values: FilterValues<K>) => void;
  /** Reset a single filter */
  resetFilter: (key: K) => void;
  /** Reset all filters */
  resetFilters: () => void;
  /** Filtered results */
  results: T[];
  /** List of active (non-null) filters */
  activeFilters: ActiveFilter<K>[];
  /** Whether any filters are active */
  hasActiveFilters: boolean;
  /** Filter configurations (for rendering UI) */
  filterConfigs: FilterConfigs<K>;
}

// ============================================================================
// Filter Presets Types
// ============================================================================

export interface FilterPreset<K extends string = string> {
  /** Preset ID */
  id: string;
  /** Display name */
  name: string;
  /** Optional description */
  description?: string;
  /** Filter values for this preset */
  values: FilterValues<K>;
  /** Whether this is a built-in preset */
  builtIn?: boolean;
  /** Optional icon */
  icon?: string;
}

export interface FilterPresetsConfig<K extends string = string> {
  /** Storage key for persistence */
  storageKey?: string;
  /** Built-in presets */
  presets?: FilterPreset<K>[];
  /** Maximum saved presets */
  maxPresets?: number;
}

export interface FilterPresetsReturn<K extends string = string> {
  /** All available presets */
  presets: FilterPreset<K>[];
  /** Apply a preset */
  applyPreset: (id: string) => FilterValues<K> | null;
  /** Save current filters as preset */
  savePreset: (name: string, values: FilterValues<K>, description?: string) => FilterPreset<K>;
  /** Delete a preset */
  deletePreset: (id: string) => boolean;
  /** Update a preset */
  updatePreset: (id: string, updates: Partial<Omit<FilterPreset<K>, 'id' | 'builtIn'>>) => boolean;
  /** Check if preset exists */
  hasPreset: (id: string) => boolean;
}

// ============================================================================
// SearchInput Component Types
// ============================================================================

export interface SearchInputProps {
  /** Current value */
  value: string;
  /** Change handler */
  onChange: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Show recent searches */
  showRecent?: boolean;
  /** Maximum recent searches to store */
  maxRecent?: number;
  /** Storage key for recent searches */
  storageKey?: string;
  /** Debounce delay (if not handled externally) */
  debounce?: number;
  /** Loading state */
  isLoading?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Auto focus on mount */
  autoFocus?: boolean;
  /** Custom class name */
  className?: string;
  /** On clear callback */
  onClear?: () => void;
  /** On focus callback */
  onFocus?: () => void;
  /** On blur callback */
  onBlur?: () => void;
  /** On submit (Enter key) callback */
  onSubmit?: (value: string) => void;
}

export interface RecentSearch {
  query: string;
  timestamp: number;
}
