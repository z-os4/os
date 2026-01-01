/**
 * Storage hooks for zOS
 * SwiftUI-style persistent storage with cross-tab synchronization
 */

// Core storage utilities
export {
  // Key helpers
  getAppStorageKey,
  getSceneStorageKey,
  getUserDefaultsKey,
  // Adapters
  LocalStorageAdapter,
  SessionStorageAdapter,
  SyncedStorage,
  // Singleton
  getDefaultStorage,
  // Snapshot helpers
  createStorageSnapshot,
  createServerSnapshot,
  // Types
  type StorageAdapter,
} from './storage';

// Per-app storage
export { useAppStorage } from './useAppStorage';

// Scene/window storage
export { useSceneStorage, clearSceneStorage } from './useSceneStorage';

// Global user preferences
export {
  useUserDefaults,
  getUserDefault,
  setUserDefault,
} from './useUserDefaults';

// Atom-based storage
export {
  createStorageAtom,
  createDerivedAtom,
  type StorageAtom,
} from './createStorageAtom';
