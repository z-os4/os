/**
 * Window State Persistence Service for zOS
 *
 * Provides window position, size, and state persistence across sessions.
 */

// Types
export type {
  WindowBounds,
  PersistedWindowState,
  WindowSession,
  ScreenDimensions,
  CascadeConfig,
} from './types';

// Manager
export {
  windowStateManager,
  WindowStateManager,
} from './WindowStateManager';

// Context
export {
  WindowStateProvider,
  useWindowStateContext,
  type WindowStateContextValue,
  type WindowStateProviderProps,
} from './WindowStateContext';

// Hooks
export {
  useWindowState,
  useWindowBounds,
  useAllWindowStates,
  useAppWindowStates,
  useInitialWindowBounds,
} from './useWindowState';
