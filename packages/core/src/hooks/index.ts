export { useWindowManager, type AppType, type WindowState } from './useWindowManager';
export { useDesktopSettings, type DesktopSettings, type DesktopSettingsActions, type ColorScheme, type FontSize, type DockPosition } from './useDesktopSettings';
export { useOverlays, type OverlayState } from './useOverlays';
export { useIsMobile } from './use-mobile';
export { useMenu, useMenuActivation, type UseMenuOptions, type UseMenuReturn } from './useMenu';

// Storage hooks - SwiftUI-style persistent storage
export {
  // Per-app storage
  useAppStorage,
  // Scene/window storage
  useSceneStorage,
  clearSceneStorage,
  // Global user preferences
  useUserDefaults,
  getUserDefault,
  setUserDefault,
  // Atom-based storage
  createStorageAtom,
  createDerivedAtom,
  type StorageAtom,
  // Core utilities
  getAppStorageKey,
  getSceneStorageKey,
  getUserDefaultsKey,
  LocalStorageAdapter,
  SessionStorageAdapter,
  SyncedStorage,
  getDefaultStorage,
  type StorageAdapter,
} from './storage';
