/**
 * useSelection Hook
 *
 * Manage single or multi-selection state.
 *
 * @example
 * ```tsx
 * // Single selection
 * const { selected, select, isSelected, clear } = useSelection<string>();
 *
 * // Multi selection
 * const { selected, toggle, isSelected, selectAll } = useSelection<string>({
 *   multiple: true
 * });
 * ```
 */

import { useState, useCallback } from 'react';

export interface UseSelectionOptions<T> {
  /** Allow multiple selections */
  multiple?: boolean;
  /** Initial selection */
  initialSelection?: T | T[];
  /** Callback when selection changes */
  onChange?: (selection: T | T[] | null) => void;
}

export interface UseSelectionReturn<T> {
  /** Current selection (single mode) */
  selected: T | null;
  /** Current selections (multi mode) */
  selectedItems: T[];
  /** Select an item */
  select: (item: T) => void;
  /** Toggle selection */
  toggle: (item: T) => void;
  /** Check if item is selected */
  isSelected: (item: T) => boolean;
  /** Clear selection */
  clear: () => void;
  /** Select all items */
  selectAll: (items: T[]) => void;
  /** Selection count */
  count: number;
  /** Has any selection */
  hasSelection: boolean;
}

export function useSelection<T>(
  options: UseSelectionOptions<T> = {}
): UseSelectionReturn<T> {
  const { multiple = false, initialSelection, onChange } = options;

  const [selectedSet, setSelectedSet] = useState<Set<T>>(() => {
    if (!initialSelection) return new Set();
    if (Array.isArray(initialSelection)) return new Set(initialSelection);
    return new Set([initialSelection]);
  });

  const select = useCallback(
    (item: T) => {
      setSelectedSet((prev) => {
        const next = multiple ? new Set(prev) : new Set<T>();
        next.add(item);
        onChange?.(multiple ? Array.from(next) : item);
        return next;
      });
    },
    [multiple, onChange]
  );

  const toggle = useCallback(
    (item: T) => {
      setSelectedSet((prev) => {
        const next = new Set(prev);
        if (next.has(item)) {
          next.delete(item);
        } else {
          if (!multiple) next.clear();
          next.add(item);
        }
        onChange?.(multiple ? Array.from(next) : next.size > 0 ? item : null);
        return next;
      });
    },
    [multiple, onChange]
  );

  const isSelected = useCallback((item: T) => selectedSet.has(item), [selectedSet]);

  const clear = useCallback(() => {
    setSelectedSet(new Set());
    onChange?.(multiple ? [] : null);
  }, [multiple, onChange]);

  const selectAll = useCallback(
    (items: T[]) => {
      if (!multiple) return;
      setSelectedSet(new Set(items));
      onChange?.(items);
    },
    [multiple, onChange]
  );

  const selectedArray = Array.from(selectedSet);

  return {
    selected: selectedArray[0] ?? null,
    selectedItems: selectedArray,
    select,
    toggle,
    isSelected,
    clear,
    selectAll,
    count: selectedSet.size,
    hasSelection: selectedSet.size > 0,
  };
}
