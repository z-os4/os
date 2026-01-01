/**
 * zOS SDK Type Definitions
 *
 * Re-exports all shared types from @z-os/core for developer convenience.
 * This allows apps to import types from '@z-os/sdk' without needing
 * to also import from '@z-os/core'.
 *
 * @module @z-os/sdk
 */

// Re-export all shared types from core
export type {
  // App Manifest Types
  AppManifest,
  AppIcon,
  AppCategory,
  AppPermission,
  AppDependency,
  WindowConfig,
  WindowType,

  // API Types
  NotificationOptions,
  NotificationAction,
  FileEntry,
  FileDialogOptions,
  FileFilter,
  StorageOptions,
  ClipboardData,

  // Hook Return Types
  AppContext,
  NotificationAPI,
  StorageAPI,
  FileSystemAPI,
  ClipboardAPI,
  KeyboardAPI,
  KeyboardOptions,

  // Event Types
  AppLifecycleEvent,
  WindowEvent,
  SystemEvent,

  // Menu Types
  AppMenuBar,
  AppMenu,
  AppMenuItem,
  MenuAPI,
  StandardMenu,
  StandardFileMenuOptions,
  StandardEditMenuOptions,
  StandardViewMenuOptions,
  StandardWindowMenuOptions,
  StandardHelpMenuOptions,

  // Dock Types
  DockMenuItem,
  DockConfig,
  DockAPI,

  // App Definition Types
  ZOSAppDefinition,
  AppWindowProps,
  StandardMenus,
} from '@z-os/core';
