/**
 * zOS SDK Hooks
 *
 * Core hooks for building zOS applications.
 */

// Core app hooks
export { useApp } from './useApp';
export { useNotifications } from './useNotifications';
export { useStorage } from './useStorage';
export { useFileSystem } from './useFileSystem';
export { useClipboard } from './useClipboard';
export { useKeyboard } from './useKeyboard';
export { useMenu, subscribeToMenuChanges } from './useMenu';
export { useDock, subscribeToDockChanges, getDockState } from './useDock';

// State management hooks
export { useLocalStorage, createAppStorage } from './useLocalStorage';
export { useListState, generateId } from './useListState';
export { useSelection } from './useSelection';

// Utility hooks
export { useDebounce, useDebouncedCallback, useThrottledCallback } from './useDebounce';

// Audio hook
export { useAudio } from './useAudio';

// Graphics hooks
export { useCanvas2D, useWebGL3D, useOrbitControls } from './useGraphics';
export type {
  UseCanvas2DOptions,
  UseCanvas2DReturn,
  UseWebGL3DOptions,
  UseWebGL3DReturn,
} from './useGraphics';
