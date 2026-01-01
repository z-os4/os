/**
 * useToolbar Hook
 *
 * State management hook for toolbar items with update methods.
 *
 * @example
 * ```tsx
 * const { items, setItemEnabled, setItemActive, updateItem } = useToolbar([
 *   { id: 'save', icon: <SaveIcon />, disabled: true },
 *   { id: 'undo', icon: <UndoIcon /> },
 *   { id: 'redo', icon: <RedoIcon /> },
 * ]);
 *
 * // Enable save when document is modified
 * useEffect(() => {
 *   setItemEnabled('save', isModified);
 * }, [isModified]);
 *
 * // Toggle bold state
 * const handleBoldClick = () => {
 *   setItemActive('bold', !items.find(i => i.id === 'bold')?.active);
 * };
 * ```
 */

import { useState, useCallback, useMemo } from 'react';
import type { ToolbarItem } from './types';

export interface UseToolbarResult {
  /** Current toolbar items */
  items: ToolbarItem[];
  /** Set item enabled/disabled state */
  setItemEnabled: (id: string, enabled: boolean) => void;
  /** Set item active state (for toggles) */
  setItemActive: (id: string, active: boolean) => void;
  /** Update any properties of an item */
  updateItem: (id: string, updates: Partial<ToolbarItem>) => void;
  /** Get a single item by ID */
  getItem: (id: string) => ToolbarItem | undefined;
  /** Reset to initial items */
  reset: () => void;
}

/**
 * Hook for managing toolbar item state
 */
export function useToolbar(initialItems: ToolbarItem[]): UseToolbarResult {
  const [items, setItems] = useState<ToolbarItem[]>(initialItems);

  /**
   * Update item enabled/disabled state
   */
  const setItemEnabled = useCallback((id: string, enabled: boolean) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, disabled: !enabled } : item
      )
    );
  }, []);

  /**
   * Update item active state
   */
  const setItemActive = useCallback((id: string, active: boolean) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, active } : item))
    );
  }, []);

  /**
   * Update any properties of an item
   */
  const updateItem = useCallback(
    (id: string, updates: Partial<ToolbarItem>) => {
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
      );
    },
    []
  );

  /**
   * Get a single item by ID
   */
  const getItem = useCallback(
    (id: string) => items.find((item) => item.id === id),
    [items]
  );

  /**
   * Reset to initial items
   */
  const reset = useCallback(() => {
    setItems(initialItems);
  }, [initialItems]);

  return useMemo(
    () => ({
      items,
      setItemEnabled,
      setItemActive,
      updateItem,
      getItem,
      reset,
    }),
    [items, setItemEnabled, setItemActive, updateItem, getItem, reset]
  );
}

/**
 * Create toolbar items with click handlers that update active state
 */
export function createToggleItems(
  items: Array<Omit<ToolbarItem, 'type' | 'onClick'> & { onToggle?: (active: boolean) => void }>
): ToolbarItem[] {
  return items.map((item) => ({
    ...item,
    type: 'toggle' as const,
    onClick: () => {
      item.onToggle?.(!item.active);
    },
  }));
}

export default useToolbar;
