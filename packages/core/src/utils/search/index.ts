/**
 * Search and Filter Utilities for zOS
 *
 * Comprehensive search, filter, and indexing utilities
 *
 * @packageDocumentation
 */

// Types
export type {
  // Fuzzy Search
  FuzzySearchOptions,
  FuzzySearchResult,
  FuzzyMatch,
  HighlightSegment,

  // Search Index
  SearchIndex,
  SearchIndexOptions,
  IndexedItem,

  // useSearch Hook
  UseSearchOptions,
  UseSearchReturn,

  // useFilter Hook
  FilterType,
  BaseFilterConfig,
  SelectFilterConfig,
  MultiSelectFilterConfig,
  BooleanFilterConfig,
  RangeFilterConfig,
  DateRangeFilterConfig,
  TextFilterConfig,
  FilterConfig,
  FilterConfigs,
  FilterValue,
  FilterValues,
  UseFilterOptions,
  UseFilterReturn,
  ActiveFilter,

  // Filter Presets
  FilterPreset,
  FilterPresetsConfig,
  FilterPresetsReturn,

  // SearchInput
  SearchInputProps,
  RecentSearch,
} from './types';

// Fuzzy Search
export {
  fuzzySearch,
  renderHighlights,
  highlightString,
} from './fuzzySearch';

// Search Index
export { createSearchIndex } from './searchIndex';

// Hooks
export { useSearch, useAsyncSearch } from './useSearch';
export { useFilter, useSearchAndFilter } from './useFilter';

// Filter Presets
export {
  createFilterPresets,
  useFilterPresets,
  QuickFilters,
} from './filterPresets';

// Components
export { SearchInput, SearchInputMinimal } from './SearchInput';
