/**
 * History Service
 *
 * Command pattern-based undo/redo system for zOS.
 *
 * @example
 * ```tsx
 * import {
 *   historyManager,
 *   useHistory,
 *   createCommand,
 *   createPropertyChangeCommand,
 *   HistoryProvider,
 * } from '@zos/core/services/history';
 *
 * // Direct usage with manager
 * const cmd = createPropertyChangeCommand(obj, 'name', 'New Name');
 * await historyManager.execute('my-scope', cmd);
 * await historyManager.undo('my-scope');
 *
 * // React hook usage
 * function Editor({ docId }) {
 *   const { execute, undo, redo, canUndo, canRedo } = useHistory(docId);
 *   // ...
 * }
 *
 * // Context provider usage
 * function App() {
 *   return (
 *     <HistoryProvider scope="editor">
 *       <EditorToolbar />
 *       <EditorCanvas />
 *     </HistoryProvider>
 *   );
 * }
 * ```
 */

// Types
export type {
  HistoryCommand,
  HistoryStack,
  HistoryManagerOptions,
  HistoryChangeListener,
  HistoryState,
} from './types';

// Manager
export { HistoryManager, historyManager } from './HistoryManager';

// Command helpers
export {
  createCommand,
  createPropertyChangeCommand,
  createBatchCommand,
  createArrayInsertCommand,
  createArrayRemoveCommand,
  createArrayMoveCommand,
  createMapSetCommand,
  createMapDeleteCommand,
  createFunctionCommand,
  type CreateCommandOptions,
} from './createCommand';

// React hooks
export {
  useHistory,
  useHistoryWithKeyboard,
  type UseHistoryOptions,
  type UseHistoryResult,
} from './useHistory';

// React context
export {
  HistoryProvider,
  useHistoryContext,
  useOptionalHistoryContext,
  withHistory,
  type HistoryContextValue,
  type HistoryProviderProps,
} from './HistoryContext';
