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

export {
  // Re-export all types (using export type for types, export for interfaces)
  type AppManifest,
  type AppIcon,
  type AppCategory,
  type AppPermission,
  type AppDependency,
  type WindowConfig,
  type WindowType,

  // API Types
  type NotificationOptions,
  type NotificationAction,
  type FileEntry,
  type FileDialogOptions,
  type FileFilter,
  type StorageOptions,
  type ClipboardData,
  type KeyboardOptions,

  // Hook Return Types
  type AppContext,
  type NotificationAPI,
  type StorageAPI,
  type FileSystemAPI,
  type ClipboardAPI,
  type KeyboardAPI,
  type MenuAPI,
  type DockAPI,

  // Menu Types
  type AppMenuBar,
  type AppMenu,
  type AppMenuItem,
  type StandardMenu,
  type StandardFileMenuOptions,
  type StandardEditMenuOptions,
  type StandardViewMenuOptions,
  type StandardWindowMenuOptions,
  type StandardHelpMenuOptions,
  type StandardMenus,
  type ZOSAppDefinition,

  // Dock Types
  type DockConfig,
  type DockMenuItem,

  // App Props
  type AppWindowProps,

  // Events
  type AppLifecycleEvent,
  type WindowEvent,
  type SystemEvent,
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
  useDock,
  subscribeToDockChanges,
  getDockState,
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

// ============================================================================
// Standard Menu Creators
// ============================================================================

/**
 * Create a standard File menu following macOS conventions
 */
export function createFileMenu(options: import('./types').StandardFileMenuOptions): import('./types').AppMenu {
  const items: import('./types').AppMenuItem[] = [];

  if (options.onNew) {
    items.push({ type: 'item', id: 'new', label: 'New', shortcut: '⌘N', onClick: options.onNew });
  }
  if (options.onOpen) {
    items.push({ type: 'item', id: 'open', label: 'Open...', shortcut: '⌘O', onClick: options.onOpen });
  }
  if (options.onNew || options.onOpen) {
    items.push({ type: 'separator' });
  }
  if (options.onSave) {
    items.push({ type: 'item', id: 'save', label: 'Save', shortcut: '⌘S', onClick: options.onSave });
  }
  if (options.onSaveAs) {
    items.push({ type: 'item', id: 'saveAs', label: 'Save As...', shortcut: '⇧⌘S', onClick: options.onSaveAs });
  }
  if (options.onSave || options.onSaveAs) {
    items.push({ type: 'separator' });
  }
  if (options.onPrint) {
    items.push({ type: 'item', id: 'print', label: 'Print...', shortcut: '⌘P', onClick: options.onPrint });
  }
  if (options.onClose) {
    items.push({ type: 'separator' });
    items.push({ type: 'item', id: 'close', label: 'Close', shortcut: '⌘W', onClick: options.onClose });
  }

  return { id: 'file', label: 'File', items };
}

/**
 * Create a standard Edit menu following macOS conventions
 */
export function createEditMenu(options: import('./types').StandardEditMenuOptions): import('./types').AppMenu {
  const items: import('./types').AppMenuItem[] = [];

  if (options.onUndo) {
    items.push({ type: 'item', id: 'undo', label: 'Undo', shortcut: '⌘Z', onClick: options.onUndo });
  }
  if (options.onRedo) {
    items.push({ type: 'item', id: 'redo', label: 'Redo', shortcut: '⇧⌘Z', onClick: options.onRedo });
  }
  if (options.onUndo || options.onRedo) {
    items.push({ type: 'separator' });
  }
  if (options.onCut) {
    items.push({ type: 'item', id: 'cut', label: 'Cut', shortcut: '⌘X', onClick: options.onCut });
  }
  if (options.onCopy) {
    items.push({ type: 'item', id: 'copy', label: 'Copy', shortcut: '⌘C', onClick: options.onCopy });
  }
  if (options.onPaste) {
    items.push({ type: 'item', id: 'paste', label: 'Paste', shortcut: '⌘V', onClick: options.onPaste });
  }
  if (options.onSelectAll) {
    items.push({ type: 'separator' });
    items.push({ type: 'item', id: 'selectAll', label: 'Select All', shortcut: '⌘A', onClick: options.onSelectAll });
  }
  if (options.onFind) {
    items.push({ type: 'separator' });
    items.push({ type: 'item', id: 'find', label: 'Find...', shortcut: '⌘F', onClick: options.onFind });
  }

  return { id: 'edit', label: 'Edit', items };
}

/**
 * Create a standard View menu following macOS conventions
 */
export function createViewMenu(options: import('./types').StandardViewMenuOptions): import('./types').AppMenu {
  const items: import('./types').AppMenuItem[] = [];

  if (options.onZoomIn) {
    items.push({ type: 'item', id: 'zoomIn', label: 'Zoom In', shortcut: '⌘+', onClick: options.onZoomIn });
  }
  if (options.onZoomOut) {
    items.push({ type: 'item', id: 'zoomOut', label: 'Zoom Out', shortcut: '⌘-', onClick: options.onZoomOut });
  }
  if (options.onActualSize) {
    items.push({ type: 'item', id: 'actualSize', label: 'Actual Size', shortcut: '⌘0', onClick: options.onActualSize });
  }
  if (options.onZoomIn || options.onZoomOut || options.onActualSize) {
    items.push({ type: 'separator' });
  }
  if (options.onToggleSidebar) {
    items.push({ type: 'item', id: 'toggleSidebar', label: 'Toggle Sidebar', shortcut: '⌘\\', onClick: options.onToggleSidebar });
  }
  if (options.onToggleToolbar) {
    items.push({ type: 'item', id: 'toggleToolbar', label: 'Toggle Toolbar', onClick: options.onToggleToolbar });
  }
  if (options.onEnterFullScreen) {
    items.push({ type: 'separator' });
    items.push({ type: 'item', id: 'fullScreen', label: 'Enter Full Screen', shortcut: '⌃⌘F', onClick: options.onEnterFullScreen });
  }

  return { id: 'view', label: 'View', items };
}

/**
 * Create a standard Window menu following macOS conventions
 */
export function createWindowMenu(options: import('./types').StandardWindowMenuOptions): import('./types').AppMenu {
  const items: import('./types').AppMenuItem[] = [];

  if (options.onMinimize) {
    items.push({ type: 'item', id: 'minimize', label: 'Minimize', shortcut: '⌘M', onClick: options.onMinimize });
  }
  if (options.onZoom) {
    items.push({ type: 'item', id: 'zoom', label: 'Zoom', onClick: options.onZoom });
  }
  if (options.onBringToFront) {
    items.push({ type: 'separator' });
    items.push({ type: 'item', id: 'bringToFront', label: 'Bring All to Front', onClick: options.onBringToFront });
  }

  return { id: 'window', label: 'Window', items };
}

/**
 * Create a standard Help menu following macOS conventions
 */
export function createHelpMenu(options: import('./types').StandardHelpMenuOptions): import('./types').AppMenu {
  const items: import('./types').AppMenuItem[] = [
    { type: 'item', id: 'help', label: `${options.appName} Help`, onClick: options.onHelp },
  ];

  return { id: 'help', label: 'Help', items };
}

/**
 * Create a complete standard menu bar
 */
export function createStandardMenuBar(appName: string, handlers: {
  file?: import('./types').StandardFileMenuOptions;
  edit?: import('./types').StandardEditMenuOptions;
  view?: import('./types').StandardViewMenuOptions;
  window?: import('./types').StandardWindowMenuOptions;
  help?: import('./types').StandardHelpMenuOptions;
}): import('./types').AppMenuBar {
  const menus: import('./types').AppMenu[] = [];

  if (handlers.file) menus.push(createFileMenu(handlers.file));
  if (handlers.edit) menus.push(createEditMenu(handlers.edit));
  if (handlers.view) menus.push(createViewMenu(handlers.view));
  if (handlers.window) menus.push(createWindowMenu(handlers.window));
  menus.push(createHelpMenu(handlers.help || { appName }));

  return { menus };
}

/**
 * Create a standard dock context menu
 */
export function createDockContextMenu(options: {
  onNewWindow?: () => void;
  onShowAllWindows?: () => void;
  onHide?: () => void;
  onQuit?: () => void;
  customItems?: import('./types').DockMenuItem[];
}): import('./types').DockMenuItem[] {
  const items: import('./types').DockMenuItem[] = [];

  if (options.onNewWindow) {
    items.push({ type: 'item', id: 'newWindow', label: 'New Window', onClick: options.onNewWindow });
  }
  if (options.onShowAllWindows) {
    items.push({ type: 'item', id: 'showAll', label: 'Show All Windows', onClick: options.onShowAllWindows });
  }

  if (options.customItems && options.customItems.length > 0) {
    items.push({ type: 'separator' });
    items.push(...options.customItems);
  }

  items.push({ type: 'separator' });
  if (options.onHide) {
    items.push({ type: 'item', id: 'hide', label: 'Hide', onClick: options.onHide });
  }
  if (options.onQuit) {
    items.push({ type: 'item', id: 'quit', label: 'Quit', onClick: options.onQuit });
  }

  return items;
}

// ============================================================================
// Utilities
// ============================================================================

export * from './utils/formatting';
export * from './utils/colors';
