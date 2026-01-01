/**
 * useHistory Hook
 *
 * React hook for accessing scoped history functionality.
 */

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { historyManager, HistoryManager } from './HistoryManager';
import type { HistoryCommand, HistoryState } from './types';

/**
 * Hook options
 */
export interface UseHistoryOptions {
  /** Custom history manager instance (defaults to global) */
  manager?: HistoryManager;
}

/**
 * Return value of useHistory hook
 */
export interface UseHistoryResult {
  /** Execute a command and add to history */
  execute: <T>(command: HistoryCommand<T>) => Promise<T>;

  /** Undo the last command */
  undo: () => Promise<boolean>;

  /** Redo the last undone command */
  redo: () => Promise<boolean>;

  /** Whether undo is available */
  canUndo: boolean;

  /** Whether redo is available */
  canRedo: boolean;

  /** Description of command that would be undone */
  undoDescription: string | undefined;

  /** Description of command that would be redone */
  redoDescription: string | undefined;

  /** Clear all history for this scope */
  clear: () => void;

  /** Get full history state */
  getHistory: () => HistoryState;

  /** Get the undo stack (for inspection) */
  getUndoStack: () => readonly HistoryCommand[];

  /** Get the redo stack (for inspection) */
  getRedoStack: () => readonly HistoryCommand[];
}

/**
 * Internal state snapshot for useSyncExternalStore
 */
interface HistorySnapshot {
  canUndo: boolean;
  canRedo: boolean;
  undoDescription: string | undefined;
  redoDescription: string | undefined;
}

/**
 * Hook for accessing history functionality within a scope.
 *
 * @example
 * ```tsx
 * function Editor({ documentId }) {
 *   const { execute, undo, redo, canUndo, canRedo } = useHistory(documentId);
 *
 *   const handleChange = useCallback((newValue) => {
 *     execute(createPropertyChangeCommand(doc, 'content', newValue));
 *   }, [execute]);
 *
 *   return (
 *     <div>
 *       <button onClick={undo} disabled={!canUndo}>Undo</button>
 *       <button onClick={redo} disabled={!canRedo}>Redo</button>
 *       <TextArea onChange={handleChange} />
 *     </div>
 *   );
 * }
 * ```
 */
export function useHistory(scope: string, options?: UseHistoryOptions): UseHistoryResult {
  const manager = options?.manager ?? historyManager;

  // Create stable subscription function
  const subscribe = useCallback(
    (callback: () => void) => manager.subscribe(scope, callback),
    [manager, scope]
  );

  // Create stable getSnapshot function
  const getSnapshot = useCallback((): HistorySnapshot => {
    return {
      canUndo: manager.canUndo(scope),
      canRedo: manager.canRedo(scope),
      undoDescription: manager.getUndoDescription(scope),
      redoDescription: manager.getRedoDescription(scope),
    };
  }, [manager, scope]);

  // Use React 18's useSyncExternalStore for safe concurrent rendering
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  // Memoized action functions
  const execute = useCallback(
    <T,>(command: HistoryCommand<T>): Promise<T> => {
      return manager.execute(scope, command);
    },
    [manager, scope]
  );

  const undo = useCallback((): Promise<boolean> => {
    return manager.undo(scope);
  }, [manager, scope]);

  const redo = useCallback((): Promise<boolean> => {
    return manager.redo(scope);
  }, [manager, scope]);

  const clear = useCallback((): void => {
    manager.clear(scope);
  }, [manager, scope]);

  const getHistory = useCallback((): HistoryState => {
    return manager.getHistory(scope);
  }, [manager, scope]);

  const getUndoStack = useCallback((): readonly HistoryCommand[] => {
    return manager.getUndoStack(scope);
  }, [manager, scope]);

  const getRedoStack = useCallback((): readonly HistoryCommand[] => {
    return manager.getRedoStack(scope);
  }, [manager, scope]);

  return {
    execute,
    undo,
    redo,
    canUndo: snapshot.canUndo,
    canRedo: snapshot.canRedo,
    undoDescription: snapshot.undoDescription,
    redoDescription: snapshot.redoDescription,
    clear,
    getHistory,
    getUndoStack,
    getRedoStack,
  };
}

/**
 * Hook for using history with keyboard shortcuts.
 *
 * Automatically binds Cmd/Ctrl+Z for undo and Cmd/Ctrl+Shift+Z for redo.
 *
 * @example
 * ```tsx
 * function Editor({ documentId }) {
 *   const history = useHistoryWithKeyboard(documentId);
 *   // Keyboard shortcuts are automatically active
 *   return <EditorContent history={history} />;
 * }
 * ```
 */
export function useHistoryWithKeyboard(
  scope: string,
  options?: UseHistoryOptions
): UseHistoryResult {
  const history = useHistory(scope, options);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifier = isMac ? event.metaKey : event.ctrlKey;

      if (!modifier) return;

      if (event.key === 'z' && !event.shiftKey) {
        // Undo: Cmd/Ctrl + Z
        if (history.canUndo) {
          event.preventDefault();
          history.undo();
        }
      } else if (
        (event.key === 'z' && event.shiftKey) ||
        (event.key === 'y' && !event.shiftKey)
      ) {
        // Redo: Cmd/Ctrl + Shift + Z or Cmd/Ctrl + Y
        if (history.canRedo) {
          event.preventDefault();
          history.redo();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [history]);

  return history;
}
