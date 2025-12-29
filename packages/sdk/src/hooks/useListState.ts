/**
 * useListState Hook
 *
 * Manage CRUD operations for list data with immutable updates.
 *
 * @example
 * ```tsx
 * const {
 *   items,
 *   add,
 *   update,
 *   remove,
 *   toggle,
 *   move,
 *   clear
 * } = useListState<Todo>(initialTodos);
 *
 * add({ id: '1', text: 'New todo', done: false });
 * toggle('1', 'done');
 * remove('1');
 * ```
 */

import { useState, useCallback } from 'react';

export interface ListItem {
  id: string;
  [key: string]: unknown;
}

export interface UseListStateReturn<T extends ListItem> {
  /** Current items */
  items: T[];
  /** Set items directly */
  setItems: React.Dispatch<React.SetStateAction<T[]>>;
  /** Add item to beginning */
  add: (item: T) => void;
  /** Add item to end */
  append: (item: T) => void;
  /** Add multiple items */
  addMany: (newItems: T[]) => void;
  /** Update item by id */
  update: (id: string, changes: Partial<T>) => void;
  /** Remove item by id */
  remove: (id: string) => void;
  /** Toggle boolean field */
  toggle: (id: string, field: keyof T) => void;
  /** Move item to new index */
  move: (id: string, toIndex: number) => void;
  /** Clear all items */
  clear: () => void;
  /** Find item by id */
  find: (id: string) => T | undefined;
  /** Get item count */
  count: number;
  /** Check if empty */
  isEmpty: boolean;
}

export function useListState<T extends ListItem>(
  initialItems: T[] = []
): UseListStateReturn<T> {
  const [items, setItems] = useState<T[]>(initialItems);

  const add = useCallback((item: T) => {
    setItems((prev) => [item, ...prev]);
  }, []);

  const append = useCallback((item: T) => {
    setItems((prev) => [...prev, item]);
  }, []);

  const addMany = useCallback((newItems: T[]) => {
    setItems((prev) => [...newItems, ...prev]);
  }, []);

  const update = useCallback((id: string, changes: Partial<T>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...changes } : item))
    );
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const toggle = useCallback((id: string, field: keyof T) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [field]: !item[field] } : item
      )
    );
  }, []);

  const move = useCallback((id: string, toIndex: number) => {
    setItems((prev) => {
      const fromIndex = prev.findIndex((item) => item.id === id);
      if (fromIndex === -1) return prev;

      const newItems = [...prev];
      const [item] = newItems.splice(fromIndex, 1);
      newItems.splice(toIndex, 0, item);
      return newItems;
    });
  }, []);

  const clear = useCallback(() => {
    setItems([]);
  }, []);

  const find = useCallback(
    (id: string) => items.find((item) => item.id === id),
    [items]
  );

  return {
    items,
    setItems,
    add,
    append,
    addMany,
    update,
    remove,
    toggle,
    move,
    clear,
    find,
    count: items.length,
    isEmpty: items.length === 0,
  };
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
