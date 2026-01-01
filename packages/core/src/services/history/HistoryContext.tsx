/**
 * History Context
 *
 * React context provider for scoped history access.
 * Useful when you want to provide history to a subtree without prop drilling.
 */

import React, { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useHistory, type UseHistoryResult } from './useHistory';
import { historyManager, HistoryManager } from './HistoryManager';
import type { HistoryCommand, HistoryState } from './types';

/**
 * Context value interface - matches UseHistoryResult
 */
export interface HistoryContextValue {
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

  /** The scope this context is bound to */
  scope: string;
}

/**
 * History context - null when not inside a provider
 */
const HistoryContext = createContext<HistoryContextValue | null>(null);

/**
 * Props for HistoryProvider
 */
export interface HistoryProviderProps {
  /** Unique scope identifier for this history context */
  scope: string;

  /** Child components that will have access to this history */
  children: ReactNode;

  /** Optional custom history manager instance */
  manager?: HistoryManager;
}

/**
 * Provides history context to child components.
 *
 * @example
 * ```tsx
 * function DocumentEditor({ documentId }) {
 *   return (
 *     <HistoryProvider scope={`document-${documentId}`}>
 *       <EditorToolbar />
 *       <EditorCanvas />
 *     </HistoryProvider>
 *   );
 * }
 * ```
 */
export function HistoryProvider({
  scope,
  children,
  manager,
}: HistoryProviderProps): JSX.Element {
  const history = useHistory(scope, { manager });

  const contextValue = useMemo<HistoryContextValue>(
    () => ({
      execute: history.execute,
      undo: history.undo,
      redo: history.redo,
      canUndo: history.canUndo,
      canRedo: history.canRedo,
      undoDescription: history.undoDescription,
      redoDescription: history.redoDescription,
      clear: history.clear,
      getHistory: history.getHistory,
      scope,
    }),
    [
      history.execute,
      history.undo,
      history.redo,
      history.canUndo,
      history.canRedo,
      history.undoDescription,
      history.redoDescription,
      history.clear,
      history.getHistory,
      scope,
    ]
  );

  return <HistoryContext.Provider value={contextValue}>{children}</HistoryContext.Provider>;
}

/**
 * Hook to access history context from a child component.
 *
 * Must be used within a HistoryProvider.
 *
 * @throws Error if used outside of HistoryProvider
 *
 * @example
 * ```tsx
 * function UndoButton() {
 *   const { undo, canUndo, undoDescription } = useHistoryContext();
 *   return (
 *     <button onClick={undo} disabled={!canUndo}>
 *       Undo {undoDescription}
 *     </button>
 *   );
 * }
 * ```
 */
export function useHistoryContext(): HistoryContextValue {
  const context = useContext(HistoryContext);
  if (!context) {
    throw new Error('useHistoryContext must be used within a HistoryProvider');
  }
  return context;
}

/**
 * Hook to optionally access history context.
 *
 * Returns null if not inside a HistoryProvider.
 * Useful for components that can work with or without history.
 *
 * @example
 * ```tsx
 * function SmartInput({ onChange }) {
 *   const history = useOptionalHistoryContext();
 *
 *   const handleChange = (value) => {
 *     if (history) {
 *       history.execute(createCommand(...));
 *     } else {
 *       onChange(value);
 *     }
 *   };
 * }
 * ```
 */
export function useOptionalHistoryContext(): HistoryContextValue | null {
  return useContext(HistoryContext);
}

/**
 * HOC to inject history props into a component.
 *
 * @example
 * ```tsx
 * const ToolbarWithHistory = withHistory(Toolbar);
 * // Toolbar receives history, canUndo, canRedo, etc. as props
 * ```
 */
export function withHistory<P extends HistoryContextValue>(
  Component: React.ComponentType<P>
): React.FC<Omit<P, keyof HistoryContextValue>> {
  const WithHistory: React.FC<Omit<P, keyof HistoryContextValue>> = (props) => {
    const history = useHistoryContext();
    return <Component {...(props as P)} {...history} />;
  };

  WithHistory.displayName = `withHistory(${Component.displayName || Component.name || 'Component'})`;

  return WithHistory;
}
