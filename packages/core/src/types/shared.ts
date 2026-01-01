/**
 * zOS Shared Type Definitions
 *
 * Canonical source of truth for all shared types across zOS packages.
 * Other packages should import from here rather than defining their own.
 *
 * @module @z-os/core/types
 */

import type React from 'react';

// ============================================================================
// App Manifest Types
// ============================================================================

/**
 * App manifest structure - defines metadata and capabilities for a zOS app.
 * This should be in manifest.json at the root of your .app bundle.
 */
export interface AppManifest {
  /** Unique bundle identifier (e.g., "ai.hanzo.calculator") */
  identifier: string;

  /** Display name shown in UI */
  name: string;

  /** Semantic version (e.g., "1.0.0") */
  version: string;

  /** Short description of the app */
  description?: string;

  /** Author/company name */
  author?: string;

  /** App icon configuration */
  icon?: AppIcon;

  /** Minimum zOS version required */
  minOSVersion?: string;

  /** App category for organization */
  category?: AppCategory;

  /** Permissions requested by the app */
  permissions?: AppPermission[];

  /** External dependencies */
  dependencies?: AppDependency[];

  /** Window configuration */
  window?: WindowConfig;

  /** Entry point file (default: "index.tsx") */
  main?: string;

  /** Custom app metadata */
  meta?: Record<string, unknown>;
}

/**
 * App icon configuration
 */
export interface AppIcon {
  /** SVG path or component name */
  type: 'svg' | 'component' | 'image';

  /** Source path or component reference */
  source: string;

  /** Background gradient (CSS gradient string) */
  background?: string;

  /** Rounded corner radius */
  borderRadius?: number;
}

/**
 * App categories
 */
export type AppCategory =
  | 'productivity'
  | 'development'
  | 'utilities'
  | 'entertainment'
  | 'communication'
  | 'finance'
  | 'system'
  | 'other';

/**
 * App permissions - capabilities the app requests
 */
export type AppPermission =
  | 'files.read'        // Read files from file system
  | 'files.write'       // Write files to file system
  | 'network'           // Make network requests
  | 'notifications'     // Show system notifications
  | 'clipboard'         // Access clipboard
  | 'camera'            // Access camera (future)
  | 'microphone'        // Access microphone (future)
  | 'location'          // Access location (future)
  | 'storage.local'     // Local storage access
  | 'storage.sync'      // Synced storage access
  | 'system.settings'   // Read/modify system settings
  | 'dock.pin'          // Pin to dock
  | 'menu.register'     // Register menu items
  | 'keyboard.global';  // Register global keyboard shortcuts

/**
 * External app dependency
 */
export interface AppDependency {
  /** Bundle identifier of dependency */
  identifier: string;

  /** Minimum version required */
  minVersion?: string;

  /** Is this a required or optional dependency */
  optional?: boolean;
}

/**
 * Window configuration for the app
 */
export interface WindowConfig {
  /** Window type/style */
  type?: WindowType;

  /** Default window size */
  defaultSize?: { width: number; height: number };

  /** Minimum window size */
  minSize?: { width: number; height: number };

  /** Maximum window size */
  maxSize?: { width: number; height: number };

  /** Default position (x, y from top-left) */
  defaultPosition?: { x: number; y: number };

  /** Is the window resizable */
  resizable?: boolean;

  /** Show in taskbar/dock when open */
  showInDock?: boolean;

  /** Allow multiple instances */
  multipleInstances?: boolean;

  /** Window background style */
  background?: 'solid' | 'blur' | 'transparent';
}

/**
 * Window style types
 */
export type WindowType =
  | 'default'    // Standard macOS-style window
  | 'terminal'   // Terminal-style (dark)
  | 'safari'     // Browser-style
  | 'itunes'     // Media player style
  | 'textpad'    // Text editor style
  | 'system'     // System dialog style
  | 'about';     // About dialog style

// ============================================================================
// API Types
// ============================================================================

/**
 * Notification options
 */
export interface NotificationOptions {
  /** Notification title */
  title: string;

  /** Notification body text */
  body?: string;

  /** Icon to display */
  icon?: string;

  /** Duration in milliseconds (0 = persistent) */
  duration?: number;

  /** Notification type/style */
  type?: 'info' | 'success' | 'warning' | 'error';

  /** Actions the user can take */
  actions?: NotificationAction[];

  /** Callback when notification is clicked */
  onClick?: () => void;
}

/**
 * Notification action button
 */
export interface NotificationAction {
  /** Action identifier */
  id: string;

  /** Display label */
  label: string;

  /** Callback when action is clicked */
  onClick: () => void;
}

/**
 * File system entry
 */
export interface FileEntry {
  /** File/folder name */
  name: string;

  /** Full path */
  path: string;

  /** Is this a directory */
  isDirectory: boolean;

  /** File size in bytes (files only) */
  size?: number;

  /** MIME type (files only) */
  mimeType?: string;

  /** Created timestamp */
  created?: Date;

  /** Modified timestamp */
  modified?: Date;
}

/**
 * File open/save dialog options
 */
export interface FileDialogOptions {
  /** Dialog title */
  title?: string;

  /** Default directory */
  defaultPath?: string;

  /** Allowed file types */
  filters?: FileFilter[];

  /** Allow selecting multiple files */
  multiple?: boolean;

  /** Allow selecting directories */
  directory?: boolean;
}

/**
 * File type filter
 */
export interface FileFilter {
  /** Filter name (e.g., "Images") */
  name: string;

  /** File extensions (e.g., ["png", "jpg", "gif"]) */
  extensions: string[];
}

/**
 * Storage options
 */
export interface StorageOptions {
  /** Storage type */
  type: 'local' | 'session' | 'sync';

  /** Namespace for keys (defaults to app identifier) */
  namespace?: string;
}

/**
 * Clipboard data
 */
export interface ClipboardData {
  /** Plain text content */
  text?: string;

  /** HTML content */
  html?: string;

  /** Image data (base64) */
  image?: string;

  /** Files (for file copy operations) */
  files?: FileEntry[];
}

// ============================================================================
// Hook Return Types
// ============================================================================

/**
 * useApp hook return type
 */
export interface AppContext {
  /** App manifest */
  manifest: AppManifest;

  /** Whether app is active/focused */
  isActive: boolean;

  /** Window state */
  window: {
    isMinimized: boolean;
    isMaximized: boolean;
    isTiled: 'left' | 'right' | null;
  };

  /** Close the app window */
  close: () => void;

  /** Minimize the app window */
  minimize: () => void;

  /** Maximize the app window */
  maximize: () => void;

  /** Focus the app window */
  focus: () => void;

  /** Tile window left */
  tileLeft: () => void;

  /** Tile window right */
  tileRight: () => void;

  /** Restore from minimized/maximized/tiled */
  restore: () => void;
}

/**
 * useNotifications hook return type
 */
export interface NotificationAPI {
  /** Show a notification */
  show: (options: NotificationOptions) => string;

  /** Dismiss a notification by ID */
  dismiss: (id: string) => void;

  /** Dismiss all notifications */
  dismissAll: () => void;

  /** Request notification permission */
  requestPermission: () => Promise<boolean>;

  /** Check if notifications are permitted */
  hasPermission: boolean;
}

/**
 * useStorage hook return type
 */
export interface StorageAPI<T = unknown> {
  /** Get a value */
  get: (key: string) => T | null;

  /** Set a value */
  set: (key: string, value: T) => void;

  /** Remove a value */
  remove: (key: string) => void;

  /** Clear all values in namespace */
  clear: () => void;

  /** Get all keys in namespace */
  keys: () => string[];

  /** Check if key exists */
  has: (key: string) => boolean;
}

/**
 * useFileSystem hook return type
 */
export interface FileSystemAPI {
  /** Read file contents */
  readFile: (path: string) => Promise<string | ArrayBuffer>;

  /** Write file contents */
  writeFile: (path: string, content: string | ArrayBuffer) => Promise<void>;

  /** Delete a file */
  deleteFile: (path: string) => Promise<void>;

  /** List directory contents */
  listDirectory: (path: string) => Promise<FileEntry[]>;

  /** Create a directory */
  createDirectory: (path: string) => Promise<void>;

  /** Check if path exists */
  exists: (path: string) => Promise<boolean>;

  /** Get file info */
  stat: (path: string) => Promise<FileEntry | null>;

  /** Show open file dialog */
  showOpenDialog: (options?: FileDialogOptions) => Promise<FileEntry[] | null>;

  /** Show save file dialog */
  showSaveDialog: (options?: FileDialogOptions) => Promise<string | null>;
}

/**
 * useClipboard hook return type
 */
export interface ClipboardAPI {
  /** Read from clipboard */
  read: () => Promise<ClipboardData>;

  /** Write text to clipboard */
  writeText: (text: string) => Promise<void>;

  /** Write HTML to clipboard */
  writeHTML: (html: string) => Promise<void>;

  /** Write image to clipboard */
  writeImage: (imageData: string) => Promise<void>;

  /** Check if clipboard has content */
  hasContent: () => Promise<boolean>;
}

/**
 * useKeyboard hook return type
 */
export interface KeyboardAPI {
  /** Register a keyboard shortcut */
  register: (shortcut: string, callback: () => void, options?: KeyboardOptions) => () => void;

  /** Unregister all shortcuts for this app */
  unregisterAll: () => void;
}

/**
 * Keyboard shortcut options
 */
export interface KeyboardOptions {
  /** Only trigger when app is focused */
  whenFocused?: boolean;

  /** Prevent default browser behavior */
  preventDefault?: boolean;

  /** Description for help menus */
  description?: string;
}

// ============================================================================
// Event Types
// ============================================================================

/**
 * App lifecycle events
 */
export type AppLifecycleEvent =
  | 'app:launch'
  | 'app:activate'
  | 'app:deactivate'
  | 'app:close'
  | 'app:hide'
  | 'app:show';

/**
 * Window events
 */
export type WindowEvent =
  | 'window:resize'
  | 'window:move'
  | 'window:minimize'
  | 'window:maximize'
  | 'window:restore'
  | 'window:focus'
  | 'window:blur';

/**
 * System events
 */
export type SystemEvent =
  | 'system:theme-change'
  | 'system:font-size-change'
  | 'system:dock-position-change';

// ============================================================================
// App Menu Types
// ============================================================================

/**
 * Menu bar configuration for an app
 */
export interface AppMenuBar {
  /** Menu items to show when this app is focused */
  menus: AppMenu[];
}

/**
 * A menu in the menu bar (e.g., "File", "Edit", "View")
 */
export interface AppMenu {
  /** Menu label shown in menu bar */
  label: string;

  /** Unique identifier for the menu */
  id: string;

  /** Menu items */
  items: AppMenuItem[];

  /** Hide this menu (e.g., conditionally hide) */
  hidden?: boolean;
}

/**
 * A menu item within a menu
 */
export interface AppMenuItem {
  /** Item type */
  type: 'item' | 'separator' | 'submenu';

  /** Item label (not used for separator) */
  label?: string;

  /** Unique identifier */
  id?: string;

  /** Keyboard shortcut (e.g., "Cmd+S", "Cmd+Shift+N") */
  shortcut?: string;

  /** Is item disabled */
  disabled?: boolean;

  /** Is item checked (for toggle items) */
  checked?: boolean;

  /** Click handler */
  onClick?: () => void;

  /** Submenu items (only for type: 'submenu') */
  submenu?: AppMenuItem[];

  /** Icon (optional) */
  icon?: React.ReactNode;
}

/**
 * useMenu hook return type
 */
export interface MenuAPI {
  /** Set the app's menu bar configuration */
  setMenuBar: (menuBar: AppMenuBar) => void;

  /** Update a specific menu */
  updateMenu: (menuId: string, menu: Partial<AppMenu>) => void;

  /** Enable/disable a menu item */
  setItemEnabled: (menuId: string, itemId: string, enabled: boolean) => void;

  /** Set checked state of a menu item */
  setItemChecked: (menuId: string, itemId: string, checked: boolean) => void;

  /** Get the current menu bar configuration */
  getMenuBar: () => AppMenuBar | null;
}

/**
 * Standard app menus that follow macOS conventions
 */
export type StandardMenu = 'file' | 'edit' | 'view' | 'window' | 'help';

/**
 * Create standard File menu items
 */
export interface StandardFileMenuOptions {
  onNew?: () => void;
  onOpen?: () => void;
  onSave?: () => void;
  onSaveAs?: () => void;
  onPrint?: () => void;
  onClose?: () => void;
}

/**
 * Create standard Edit menu items
 */
export interface StandardEditMenuOptions {
  onUndo?: () => void;
  onRedo?: () => void;
  onCut?: () => void;
  onCopy?: () => void;
  onPaste?: () => void;
  onSelectAll?: () => void;
  onFind?: () => void;
}

/**
 * Dock context menu item (right-click on dock icon)
 */
export interface DockMenuItem {
  /** Item type */
  type: 'item' | 'separator';

  /** Item label */
  label?: string;

  /** Unique identifier */
  id?: string;

  /** Click handler */
  onClick?: () => void;

  /** Is item disabled */
  disabled?: boolean;

  /** Icon */
  icon?: React.ReactNode;
}

/**
 * Dock configuration for the app
 */
export interface DockConfig {
  /** Show in dock when running */
  showWhenRunning?: boolean;

  /** Show badge (e.g., notification count) */
  badge?: string | number;

  /** Progress indicator (0-100) */
  progress?: number;

  /** Bounce icon to get attention */
  bounce?: boolean;

  /** Context menu items (right-click) */
  contextMenu?: DockMenuItem[];
}

/**
 * App definition - simplified way to define a zOS app
 */
export interface ZOSAppDefinition {
  /** App manifest */
  manifest: AppManifest;

  /** App menu bar configuration */
  menuBar?: AppMenuBar;

  /** Dock configuration */
  dock?: DockConfig;

  /** App component */
  component: React.ComponentType<AppWindowProps>;

  /** Dock icon component */
  icon?: React.ComponentType<{ className?: string }>;

  /** Lifecycle hooks */
  lifecycle?: {
    /** Called when app launches */
    onLaunch?: () => void;
    /** Called when app becomes active */
    onActivate?: () => void;
    /** Called when app becomes inactive */
    onDeactivate?: () => void;
    /** Called before app closes */
    onClose?: () => boolean | void;
    /** Called when app receives data from another app */
    onReceiveData?: (data: unknown, from: string) => void;
  };
}

/**
 * Standard props passed to app window components
 */
export interface AppWindowProps {
  onClose: () => void;
  onFocus?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
}

/**
 * useDock hook return type
 */
export interface DockAPI {
  /** Set badge on dock icon */
  setBadge: (badge: string | number | null) => void;

  /** Set progress indicator */
  setProgress: (progress: number | null) => void;

  /** Bounce dock icon to get attention */
  bounce: (type?: 'critical' | 'informational') => void;

  /** Update context menu */
  setContextMenu: (items: DockMenuItem[]) => void;

  /** Request attention */
  requestAttention: () => void;
}

/**
 * Standard menu creators for common menu patterns
 */
export interface StandardMenus {
  /** Create standard File menu */
  createFileMenu: (options: StandardFileMenuOptions) => AppMenu;

  /** Create standard Edit menu */
  createEditMenu: (options: StandardEditMenuOptions) => AppMenu;

  /** Create standard View menu */
  createViewMenu: (options: StandardViewMenuOptions) => AppMenu;

  /** Create standard Window menu */
  createWindowMenu: (options: StandardWindowMenuOptions) => AppMenu;

  /** Create standard Help menu */
  createHelpMenu: (options: StandardHelpMenuOptions) => AppMenu;
}

/**
 * View menu options
 */
export interface StandardViewMenuOptions {
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onActualSize?: () => void;
  onToggleSidebar?: () => void;
  onToggleToolbar?: () => void;
  onEnterFullScreen?: () => void;
}

/**
 * Window menu options
 */
export interface StandardWindowMenuOptions {
  onMinimize?: () => void;
  onZoom?: () => void;
  onBringToFront?: () => void;
}

/**
 * Help menu options
 */
export interface StandardHelpMenuOptions {
  appName: string;
  onHelp?: () => void;
}
