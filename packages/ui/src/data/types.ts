/**
 * Shared Types for Data Display Components
 *
 * Common type definitions used across Table, List, Tree, Grid, and other data components.
 */

import type React from 'react';

/**
 * Selection mode for data components
 */
export type SelectionMode = boolean | 'single' | 'multiple';

/**
 * Sort direction
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Sort configuration
 */
export interface SortConfig {
  columnId: string;
  direction: SortDirection;
}

/**
 * Common props for data components with selection support
 */
export interface SelectableProps<K = string> {
  /** Enable selection. true/'multiple' for multi-select, 'single' for single select */
  selectable?: SelectionMode;
  /** Currently selected keys */
  selectedKeys?: Set<K>;
  /** Callback when selection changes */
  onSelectionChange?: (selected: Set<K>) => void;
}

/**
 * Common props for data components with loading/empty states
 */
export interface DataStateProps {
  /** Show loading state */
  loading?: boolean;
  /** Message or element to show when data is empty */
  emptyMessage?: React.ReactNode;
}

/**
 * Common size variants
 */
export type Size = 'sm' | 'md' | 'lg';

/**
 * Common status variants for indicators
 */
export type StatusVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';

/**
 * Position for drop operations in tree/sortable components
 */
export type DropPosition = 'before' | 'after' | 'inside';

/**
 * Alignment options
 */
export type Alignment = 'left' | 'center' | 'right';

/**
 * Key extractor function type
 */
export type KeyExtractor<T> = (item: T, index?: number) => string;

/**
 * Render function type for custom rendering
 */
export type RenderFunction<T, R = React.ReactNode> = (item: T, index: number) => R;
