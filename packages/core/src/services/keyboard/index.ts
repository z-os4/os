/**
 * Keyboard Shortcuts Manager
 *
 * A complete keyboard shortcuts system for zOS with:
 * - Cross-platform key normalization (Cmd on Mac = Ctrl elsewhere)
 * - Priority-based execution ordering
 * - Conflict detection
 * - Conditional execution via `when` predicates
 * - React hooks for easy integration
 * - UI panel for viewing shortcuts
 *
 * @example
 * // Basic usage with hook
 * import { useKeyboardShortcut } from '@zos/core';
 *
 * function MyComponent() {
 *   useKeyboardShortcut('Cmd+S', () => save(), {
 *     description: 'Save document',
 *   });
 * }
 *
 * @example
 * // Multiple shortcuts
 * import { useKeyboardShortcuts } from '@zos/core';
 *
 * function Editor() {
 *   useKeyboardShortcuts([
 *     { keys: 'Cmd+S', action: save, description: 'Save' },
 *     { keys: 'Cmd+Z', action: undo, description: 'Undo' },
 *   ]);
 * }
 *
 * @example
 * // Direct manager usage
 * import { keyboardManager } from '@zos/core';
 *
 * const cleanup = keyboardManager.register({
 *   id: 'my-shortcut',
 *   keys: 'Cmd+K',
 *   description: 'Do something',
 *   action: () => doSomething(),
 *   scope: 'app',
 *   priority: 50,
 * });
 */

// Types
export {
  type Shortcut,
  type ShortcutGroup,
  type ShortcutConflict,
  type ShortcutOptions,
  type ShortcutScope,
  type ShortcutChangeListener,
  type PlatformInfo,
  type ParsedKeys,
  PRIORITY,
} from './types';

// Manager
export {
  keyboardManager,
  KeyboardShortcutManager,
} from './KeyboardShortcutManager';

// Context
export {
  KeyboardProvider,
  useKeyboardContext,
  type KeyboardContextType,
  type KeyboardProviderProps,
} from './KeyboardContext';

// Hooks
export { useKeyboardShortcut } from './useKeyboardShortcut';
export {
  useKeyboardShortcuts,
  type ShortcutDefinition,
} from './useKeyboardShortcuts';

// Components
export {
  KeyboardShortcutsPanel,
  type KeyboardShortcutsPanelProps,
} from './KeyboardShortcutsPanel';

// System shortcuts
export {
  createSystemShortcuts,
  DEFAULT_SYSTEM_SHORTCUTS,
  type SystemShortcutHandlers,
} from './systemShortcuts';
