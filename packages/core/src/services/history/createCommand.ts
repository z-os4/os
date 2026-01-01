/**
 * Command Creation Helpers
 *
 * Factory functions for creating history commands.
 */

import type { HistoryCommand } from './types';

/**
 * Generate a unique ID for a command
 */
function generateId(): string {
  return `cmd_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Options for creating a history command
 */
export interface CreateCommandOptions<T> {
  /** Command type identifier */
  type: string;

  /** Human-readable description */
  description: string;

  /** Execute function */
  execute: () => T | Promise<T>;

  /** Undo function */
  undo: () => void | Promise<void>;

  /** Optional redo function (defaults to execute) */
  redo?: () => T | Promise<T>;

  /** Optional merge function for coalescing commands */
  merge?: (other: HistoryCommand) => HistoryCommand | null;
}

/**
 * Create a history command from options.
 *
 * @example
 * ```ts
 * const cmd = createCommand({
 *   type: 'set-color',
 *   description: 'Change color to red',
 *   execute: () => { element.color = 'red'; },
 *   undo: () => { element.color = 'blue'; },
 * });
 * ```
 */
export function createCommand<T>(options: CreateCommandOptions<T>): HistoryCommand<T> {
  return {
    id: generateId(),
    type: options.type,
    description: options.description,
    timestamp: Date.now(),
    execute: options.execute,
    undo: options.undo,
    redo: options.redo,
    merge: options.merge,
  };
}

/**
 * Create a command for changing a property on an object.
 *
 * Automatically captures the old value for undo.
 *
 * @example
 * ```ts
 * const cmd = createPropertyChangeCommand(
 *   myObject,
 *   'name',
 *   'New Name',
 *   'Rename to "New Name"'
 * );
 * await historyManager.execute('doc', cmd);
 * ```
 */
export function createPropertyChangeCommand<T extends object, K extends keyof T>(
  target: T,
  property: K,
  newValue: T[K],
  description?: string
): HistoryCommand<void> {
  const oldValue = target[property];
  const propName = String(property);
  const desc = description ?? `Change ${propName}`;

  return createCommand({
    type: 'property-change',
    description: desc,
    execute: () => {
      target[property] = newValue;
    },
    undo: () => {
      target[property] = oldValue;
    },
    merge: (other: HistoryCommand) => {
      // Merge consecutive property changes on the same target/property
      if (other.type !== 'property-change') {
        return null;
      }
      // For property commands, we keep the original old value
      // and use the new command's new value
      return createCommand({
        type: 'property-change',
        description: other.description,
        execute: () => {
          // Use the latest new value from the merged command
          const latestCmd = other as HistoryCommand<void> & {
            _newValue?: T[K];
          };
          target[property] = latestCmd._newValue ?? newValue;
        },
        undo: () => {
          // Restore to original old value
          target[property] = oldValue;
        },
      });
    },
  });
}

/**
 * Create a command that batches multiple commands together.
 *
 * All commands are executed in order, and undone in reverse order.
 *
 * @example
 * ```ts
 * const batch = createBatchCommand([
 *   createPropertyChangeCommand(obj, 'x', 10),
 *   createPropertyChangeCommand(obj, 'y', 20),
 * ], 'Move object to (10, 20)');
 * ```
 */
export function createBatchCommand(
  commands: HistoryCommand[],
  description: string
): HistoryCommand<void> {
  if (commands.length === 0) {
    throw new Error('Batch command requires at least one command');
  }

  return createCommand({
    type: 'batch',
    description,
    execute: async () => {
      for (const cmd of commands) {
        await Promise.resolve(cmd.execute());
      }
    },
    undo: async () => {
      // Undo in reverse order
      for (let i = commands.length - 1; i >= 0; i--) {
        await Promise.resolve(commands[i].undo());
      }
    },
    redo: async () => {
      for (const cmd of commands) {
        const redoFn = cmd.redo ?? cmd.execute;
        await Promise.resolve(redoFn());
      }
    },
  });
}

/**
 * Create a command for adding an item to an array.
 *
 * @example
 * ```ts
 * const cmd = createArrayInsertCommand(
 *   items,
 *   newItem,
 *   2, // index
 *   'Add item at position 2'
 * );
 * ```
 */
export function createArrayInsertCommand<T>(
  array: T[],
  item: T,
  index?: number,
  description?: string
): HistoryCommand<void> {
  const insertIndex = index ?? array.length;
  const desc = description ?? `Insert item at index ${insertIndex}`;

  return createCommand({
    type: 'array-insert',
    description: desc,
    execute: () => {
      array.splice(insertIndex, 0, item);
    },
    undo: () => {
      array.splice(insertIndex, 1);
    },
  });
}

/**
 * Create a command for removing an item from an array.
 *
 * @example
 * ```ts
 * const cmd = createArrayRemoveCommand(
 *   items,
 *   2, // index
 *   'Remove item at position 2'
 * );
 * ```
 */
export function createArrayRemoveCommand<T>(
  array: T[],
  index: number,
  description?: string
): HistoryCommand<void> {
  const desc = description ?? `Remove item at index ${index}`;
  let removedItem: T;

  return createCommand({
    type: 'array-remove',
    description: desc,
    execute: () => {
      if (index < 0 || index >= array.length) {
        throw new Error(`Index ${index} out of bounds for array of length ${array.length}`);
      }
      removedItem = array[index];
      array.splice(index, 1);
    },
    undo: () => {
      array.splice(index, 0, removedItem);
    },
  });
}

/**
 * Create a command for moving an item within an array.
 *
 * @example
 * ```ts
 * const cmd = createArrayMoveCommand(
 *   items,
 *   2, // from index
 *   5, // to index
 *   'Reorder items'
 * );
 * ```
 */
export function createArrayMoveCommand<T>(
  array: T[],
  fromIndex: number,
  toIndex: number,
  description?: string
): HistoryCommand<void> {
  const desc = description ?? `Move item from ${fromIndex} to ${toIndex}`;

  return createCommand({
    type: 'array-move',
    description: desc,
    execute: () => {
      if (fromIndex < 0 || fromIndex >= array.length) {
        throw new Error(`fromIndex ${fromIndex} out of bounds`);
      }
      if (toIndex < 0 || toIndex > array.length) {
        throw new Error(`toIndex ${toIndex} out of bounds`);
      }
      const [item] = array.splice(fromIndex, 1);
      const adjustedTo = toIndex > fromIndex ? toIndex - 1 : toIndex;
      array.splice(adjustedTo, 0, item);
    },
    undo: () => {
      const adjustedFrom = toIndex > fromIndex ? toIndex - 1 : toIndex;
      const [item] = array.splice(adjustedFrom, 1);
      array.splice(fromIndex, 0, item);
    },
  });
}

/**
 * Create a command for setting a value in a Map.
 *
 * @example
 * ```ts
 * const cmd = createMapSetCommand(
 *   settings,
 *   'theme',
 *   'dark',
 *   'Change theme to dark'
 * );
 * ```
 */
export function createMapSetCommand<K, V>(
  map: Map<K, V>,
  key: K,
  newValue: V,
  description?: string
): HistoryCommand<void> {
  const hadKey = map.has(key);
  const oldValue = map.get(key);
  const desc = description ?? `Set map key`;

  return createCommand({
    type: 'map-set',
    description: desc,
    execute: () => {
      map.set(key, newValue);
    },
    undo: () => {
      if (hadKey) {
        map.set(key, oldValue!);
      } else {
        map.delete(key);
      }
    },
  });
}

/**
 * Create a command for deleting a value from a Map.
 *
 * @example
 * ```ts
 * const cmd = createMapDeleteCommand(
 *   settings,
 *   'obsoleteKey',
 *   'Remove obsolete setting'
 * );
 * ```
 */
export function createMapDeleteCommand<K, V>(
  map: Map<K, V>,
  key: K,
  description?: string
): HistoryCommand<void> {
  const hadKey = map.has(key);
  const oldValue = map.get(key);
  const desc = description ?? `Delete map key`;

  return createCommand({
    type: 'map-delete',
    description: desc,
    execute: () => {
      map.delete(key);
    },
    undo: () => {
      if (hadKey) {
        map.set(key, oldValue!);
      }
    },
  });
}

/**
 * Create a command that executes a custom function with undo capability.
 *
 * Useful for complex operations that don't fit standard patterns.
 *
 * @example
 * ```ts
 * const cmd = createFunctionCommand(
 *   () => api.updateRecord(id, newData),
 *   () => api.updateRecord(id, oldData),
 *   'Update record'
 * );
 * ```
 */
export function createFunctionCommand<T>(
  executeFn: () => T | Promise<T>,
  undoFn: () => void | Promise<void>,
  description: string,
  redoFn?: () => T | Promise<T>
): HistoryCommand<T> {
  return createCommand({
    type: 'function',
    description,
    execute: executeFn,
    undo: undoFn,
    redo: redoFn,
  });
}
