/**
 * zOS SDK
 *
 * The official SDK for building zOS applications. Provides components,
 * hooks, and utilities for creating native-feeling apps that integrate
 * seamlessly with the zOS desktop environment.
 *
 * @example
 * ```tsx
 * import { ZOSApp, useSDK, AppManifest } from '@/sdk';
 *
 * const manifest: AppManifest = {
 *   identifier: 'ai.hanzo.myapp',
 *   name: 'My App',
 *   version: '1.0.0',
 * };
 *
 * function MyApp({ onClose }) {
 *   return (
 *     <ZOSApp manifest={manifest} onClose={onClose}>
 *       <MyAppContent />
 *     </ZOSApp>
 *   );
 * }
 *
 * function MyAppContent() {
 *   const { notifications, storage } = useSDK();
 *
 *   const handleSave = () => {
 *     storage.set('lastSaved', Date.now());
 *     notifications.show({ title: 'Saved!' });
 *   };
 *
 *   return <button onClick={handleSave}>Save</button>;
 * }
 * ```
 *
 * @packageDocumentation
 */

// ============================================================================
// Types
// ============================================================================

export type {
  // App Manifest
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
  KeyboardOptions,

  // Hook Return Types
  AppContext,
  NotificationAPI,
  StorageAPI,
  FileSystemAPI,
  ClipboardAPI,
  KeyboardAPI,
  MenuAPI,

  // Menu Types
  AppMenuBar,
  AppMenu,
  AppMenuItem,
  StandardMenu,
  StandardFileMenuOptions,
  StandardEditMenuOptions,
  ZOSAppDefinition,

  // Events
  AppLifecycleEvent,
  WindowEvent,
  SystemEvent,
} from './types';

// ============================================================================
// Components
// ============================================================================

export { ZOSApp, useSDK } from './components';

// ============================================================================
// Hooks
// ============================================================================

export {
  useApp,
  useNotifications,
  useStorage,
  useFileSystem,
  useClipboard,
  useKeyboard,
  useMenu,
  subscribeToMenuChanges,
} from './hooks';

// ============================================================================
// Utilities
// ============================================================================

/**
 * Create a new app manifest with defaults
 */
export function createManifest(
  partial: Partial<import('./types').AppManifest> & Pick<import('./types').AppManifest, 'identifier' | 'name'>
): import('./types').AppManifest {
  return {
    version: '1.0.0',
    category: 'other',
    permissions: [],
    dependencies: [],
    window: {
      type: 'default',
      defaultSize: { width: 700, height: 500 },
      resizable: true,
      showInDock: true,
      multipleInstances: false,
      background: 'blur',
    },
    main: 'index.tsx',
    ...partial,
  };
}

/**
 * Define a zOS app with all necessary configuration
 *
 * @example
 * ```tsx
 * import { defineApp, AppManifest, AppMenuBar } from '@z-os/sdk';
 *
 * const TextEditApp = defineApp({
 *   manifest: {
 *     identifier: 'ai.hanzo.textedit',
 *     name: 'TextEdit',
 *     version: '1.0.0',
 *     category: 'productivity',
 *     window: {
 *       type: 'textpad',
 *       defaultSize: { width: 600, height: 400 },
 *     },
 *   },
 *   menuBar: {
 *     menus: [
 *       { id: 'file', label: 'File', items: [...] },
 *       { id: 'edit', label: 'Edit', items: [...] },
 *     ],
 *   },
 *   icon: TextEditIcon,
 *   component: TextEditContent,
 * });
 *
 * export default TextEditApp;
 * ```
 */
export function defineApp(definition: import('./types').ZOSAppDefinition): import('./types').ZOSAppDefinition {
  return {
    ...definition,
    manifest: createManifest(definition.manifest),
  };
}

/**
 * App registry for managing registered apps
 */
export class AppRegistry {
  private static apps = new Map<string, import('./types').ZOSAppDefinition>();

  /** Register an app */
  static register(app: import('./types').ZOSAppDefinition): void {
    this.apps.set(app.manifest.identifier, app);
  }

  /** Get an app by identifier */
  static get(identifier: string): import('./types').ZOSAppDefinition | undefined {
    return this.apps.get(identifier);
  }

  /** Get all registered apps */
  static getAll(): import('./types').ZOSAppDefinition[] {
    return Array.from(this.apps.values());
  }

  /** Check if an app is registered */
  static has(identifier: string): boolean {
    return this.apps.has(identifier);
  }

  /** Unregister an app */
  static unregister(identifier: string): boolean {
    return this.apps.delete(identifier);
  }
}

/**
 * Version information
 */
export const SDK_VERSION = '1.0.0';

/**
 * Minimum zOS version required
 */
export const MIN_ZOS_VERSION = '1.0.0';
