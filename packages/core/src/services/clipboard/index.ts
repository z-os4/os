/**
 * Clipboard Service Exports for zOS
 *
 * Unified clipboard API with history and custom type support.
 */

// Types
export type {
  ClipboardDataType,
  ClipboardItem,
  ClipboardContextValue,
  ClipboardChangeListener,
  ClipboardState,
  ClipboardCopyOptions,
} from './types';

// Service
export { clipboard, ClipboardServiceImpl } from './ClipboardService';

// Context
export {
  ClipboardProvider,
  ClipboardContext,
  useClipboardContext,
  type ClipboardProviderProps,
} from './ClipboardContext';

// Hooks
export {
  useClipboard,
  useClipboardText,
  type UseClipboardReturn,
} from './useClipboard';
