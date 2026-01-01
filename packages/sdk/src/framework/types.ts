/**
 * zOS App Framework - Core Type Definitions
 * 
 * SwiftUI/Flutter-inspired framework for building native-feeling zOS applications.
 * This file contains the complete type system for the framework.
 */

import { ComponentType, ReactNode } from 'react';

// ============================================================================
// Platform & Device Types
// ============================================================================

/**
 * Platform adaptation modes
 */
export type PlatformMode = 'desktop' | 'tablet' | 'mobile' | 'auto';

/**
 * Device information
 */
export interface DeviceInfo {
  /** Platform type */
  platform: PlatformMode;
  
  /** Screen width */
  screenWidth: number;
  
  /** Screen height */
  screenHeight: number;
  
  /** Device pixel ratio */
  pixelRatio: number;
  
  /** Touch capability */
  hasTouch: boolean;
  
  /** Pointer type */
  pointerType: 'mouse' | 'touch' | 'pen';
  
  /** Preferred color scheme */
  colorScheme: 'light' | 'dark';
  
  /** Reduced motion preference */
  reducedMotion: boolean;
}

// ============================================================================
// App Manifest Types
// ============================================================================

/**
 * App manifest - defines metadata and capabilities
 */
export interface AppManifest {
  /** Unique bundle identifier (reverse DNS) */
  identifier: string;
  
  /** Display name */
  name: string;
  
  /** Semantic version */
  version: string;
  
  /** Build number */
  build?: number;
  
  /** Short description */
  description?: string;
  
  /** Author/company */
  author?: string;
  
  /** Website URL */
  website?: string;
  
  /** Support email */
  supportEmail?: string;
  
  /** App category */
  category: AppCategory;
  
  /** Minimum zOS version */
  minOSVersion?: string;
  
  /** Requested permissions */
  permissions?: AppPermission[];
  
  /** App dependencies */
  dependencies?: AppDependency[];
  
  /** Icon configuration */
  icon?: AppIconConfig;
  
  /** Entry point */
  main?: string;
  
  /** Custom metadata */
  meta?: Record<string, unknown>;
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
  | 'graphics'
  | 'music'
  | 'video'
  | 'games'
  | 'education'
  | 'reference'
  | 'social'
  | 'news'
  | 'health'
  | 'travel'
  | 'weather'
  | 'system'
  | 'other';

/**
 * App permissions
 */
export type AppPermission =
  | 'files.read'
  | 'files.write'
  | 'files.all'
  | 'network'
  | 'network.local'
  | 'notifications'
  | 'notifications.badge'
  | 'clipboard.read'
  | 'clipboard.write'
  | 'camera'
  | 'microphone'
  | 'location'
  | 'storage.local'
  | 'storage.sync'
  | 'storage.icloud'
  | 'system.settings'
  | 'dock.pin'
  | 'dock.badge'
  | 'menu.register'
  | 'keyboard.global'
  | 'accessibility'
  | 'automation';

/**
 * App dependency
 */
export interface AppDependency {
  identifier: string;
  minVersion?: string;
  optional?: boolean;
}

/**
 * App icon configuration
 */
export interface AppIconConfig {
  /** Icon type */
  type: 'svg' | 'component' | 'image' | 'emoji';
  
  /** Source (path or component name) */
  source: string;
  
  /** Background gradient or color */
  background?: string;
  
  /** Border radius */
  borderRadius?: number;
}

// ============================================================================
// Scene Types
// ============================================================================

/**
 * Scene types - different window/view configurations
 */
export type SceneType =
  | 'window'        // Standard window
  | 'document'      // Document-based window
  | 'settings'      // Settings panel
  | 'about'         // About dialog
  | 'utility'       // Floating utility
  | 'panel'         // Inspector panel
  | 'popover'       // Popover window
  | 'menuBarExtra'  // Menu bar widget
  | 'widget';       // Desktop widget

/**
 * Scene definition
 */
export interface Scene<TProps = object, TData = unknown> {
  /** Unique scene identifier */
  id: string;
  
  /** Scene type */
  type: SceneType;
  
  /** Scene title (static or dynamic) */
  title: string | ((props: TProps, data?: TData) => string);
  
  /** The component to render */
  component: ComponentType<TProps & SceneProps<TData>>;
  
  /** Is this the main/default scene? */
  isMain?: boolean;
  
  /** Window configuration */
  window?: WindowSceneConfig;
  
  /** Keyboard shortcut to open */
  shortcut?: string;
  
  /** Platform-specific overrides */
  platforms?: Partial<Record<PlatformMode, Partial<Omit<Scene<TProps, TData>, 'platforms'>>>>;
}

/**
 * Window configuration for scenes
 */
export interface WindowSceneConfig {
  /** Default size */
  defaultSize?: { width: number; height: number };
  
  /** Minimum size */
  minSize?: { width: number; height: number };
  
  /** Maximum size */
  maxSize?: { width: number; height: number };
  
  /** Default position */
  defaultPosition?: { x: number; y: number } | 'center' | 'cascade';
  
  /** Is resizable */
  resizable?: boolean;
  
  /** Window style */
  style?: WindowStyle;
  
  /** Titlebar style */
  titlebar?: TitlebarStyle;
  
  /** Background */
  background?: 'solid' | 'blur' | 'transparent' | 'vibrancy';
  
  /** Allow multiple instances */
  multipleInstances?: boolean;
  
  /** Show in dock when open */
  showInDock?: boolean;
  
  /** Remember position/size */
  rememberFrame?: boolean;
  
  /** Show traffic lights */
  showTrafficLights?: boolean;
  
  /** Full-size content view */
  fullSizeContentView?: boolean;
}

export type WindowStyle = 
  | 'default' 
  | 'terminal' 
  | 'safari' 
  | 'textpad' 
  | 'system' 
  | 'unified' 
  | 'hiddenTitle';

export type TitlebarStyle = 
  | 'default' 
  | 'transparent' 
  | 'hidden' 
  | 'inset' 
  | 'overlay';

/**
 * Props passed to all scene components
 */
export interface SceneProps<TData = unknown> {
  /** Close this scene */
  onClose: () => void;
  
  /** Focus this scene */
  onFocus?: () => void;
  
  /** Minimize this scene */
  onMinimize?: () => void;
  
  /** Maximize this scene */
  onMaximize?: () => void;
  
  /** Scene-specific data */
  sceneData?: TData;
  
  /** Open another scene */
  openScene: (sceneId: string, data?: unknown) => void;
  
  /** Window ID */
  windowId: string;
  
  /** Scene ID */
  sceneId: string;
}

// ============================================================================
// Menu Types
// ============================================================================

/**
 * Menu bar configuration
 */
export interface MenuBarConfig {
  /** Custom menus */
  menus: MenuDefinition[];
  
  /** Include standard menus */
  standardMenus?: StandardMenuType[];
  
  /** App menu customization */
  appMenu?: Partial<AppMenuConfig>;
}

export type StandardMenuType = 'apple' | 'file' | 'edit' | 'format' | 'view' | 'window' | 'help';

/**
 * App menu (leftmost menu) customization
 */
export interface AppMenuConfig {
  /** Show About item */
  showAbout: boolean;
  
  /** Show Preferences item */
  showPreferences: boolean;
  
  /** Custom items before Quit */
  customItems?: MenuItem[];
}

/**
 * Menu definition
 */
export interface MenuDefinition {
  /** Unique identifier */
  id: string;
  
  /** Menu label */
  label: string;
  
  /** Menu items */
  items: MenuItem[];
  
  /** Is hidden */
  hidden?: boolean;
  
  /** Is disabled */
  disabled?: boolean;
}

/**
 * Menu item (union type)
 */
export type MenuItem =
  | MenuItemAction
  | MenuItemSeparator
  | MenuItemSubmenu
  | MenuItemToggle
  | MenuItemRadioGroup;

/**
 * Action menu item
 */
export interface MenuItemAction {
  type?: 'item';
  id: string;
  label: string;
  shortcut?: KeyboardShortcut;
  icon?: ReactNode;
  action: string | (() => void);
  disabled?: boolean;
  hidden?: boolean;
}

/**
 * Separator
 */
export interface MenuItemSeparator {
  type: 'separator';
}

/**
 * Submenu
 */
export interface MenuItemSubmenu {
  type: 'submenu';
  id: string;
  label: string;
  icon?: ReactNode;
  items: MenuItem[];
  disabled?: boolean;
}

/**
 * Toggle (checkbox) item
 */
export interface MenuItemToggle {
  type: 'toggle';
  id: string;
  label: string;
  shortcut?: KeyboardShortcut;
  checked: boolean;
  action: string | ((checked: boolean) => void);
  disabled?: boolean;
}

/**
 * Radio group
 */
export interface MenuItemRadioGroup {
  type: 'radioGroup';
  id: string;
  items: Array<{
    id: string;
    label: string;
    value: string;
  }>;
  selected: string;
  action: string | ((value: string) => void);
}

/**
 * Keyboard shortcut definition
 */
export type KeyboardShortcut = string; // e.g., "⌘S", "⌃⌥⌘N"

/**
 * Context menu configuration
 */
export interface ContextMenuConfig {
  items: MenuItem[];
  onOpen?: (event: React.MouseEvent) => void;
  onClose?: () => void;
}

// ============================================================================
// Dock Types
// ============================================================================

/**
 * Dock configuration
 */
export interface DockConfig {
  /** Show when running */
  showWhenRunning?: boolean;
  
  /** Badge */
  badge?: string | number;
  
  /** Progress (0-100) */
  progress?: number;
  
  /** Bounce on attention */
  bounce?: boolean;
  
  /** Context menu */
  contextMenu?: DockMenuItem[];
}

/**
 * Dock menu item
 */
export interface DockMenuItem {
  type: 'item' | 'separator';
  id?: string;
  label?: string;
  onClick?: () => void;
  disabled?: boolean;
  icon?: ReactNode;
}

// ============================================================================
// Settings Types
// ============================================================================

/**
 * Setting types
 */
export type SettingType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'select'
  | 'multiSelect'
  | 'color'
  | 'font'
  | 'fontFamily'
  | 'fontSize'
  | 'path'
  | 'directory'
  | 'keyBinding'
  | 'slider'
  | 'date'
  | 'time'
  | 'custom';

/**
 * Setting definition
 */
export interface SettingDefinition<T = unknown> {
  /** Setting key */
  key: string;
  
  /** Display label */
  label: string;
  
  /** Description */
  description?: string;
  
  /** Setting type */
  type: SettingType;
  
  /** Default value */
  defaultValue: T;
  
  /** Validation */
  validate?: (value: T) => boolean | string;
  
  /** Transform before save */
  transform?: (value: T) => T;
  
  /** Options for select types */
  options?: Array<{ label: string; value: T }>;
  
  /** Range for numbers */
  min?: number;
  max?: number;
  step?: number;
  
  /** Platform restrictions */
  platforms?: PlatformMode[];
  
  /** Requires app restart */
  requiresRestart?: boolean;
  
  /** Group within section */
  group?: string;
  
  /** Custom component */
  component?: ComponentType<SettingControlProps<T>>;
}

/**
 * Props for custom setting controls
 */
export interface SettingControlProps<T> {
  setting: SettingDefinition<T>;
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
}

/**
 * Settings section
 */
export interface SettingsSection {
  id: string;
  title: string;
  icon?: ReactNode;
  description?: string;
  settings: SettingDefinition[];
}

/**
 * Settings schema
 */
export interface SettingsSchema<T = Record<string, unknown>> {
  /** Schema version */
  version: number;
  
  /** Sections */
  sections: SettingsSection[];
  
  /** Migration */
  migrate?: (oldSettings: unknown, fromVersion: number) => T;
}

// ============================================================================
// File System Types
// ============================================================================

/**
 * File system entry
 */
export interface FSEntry {
  name: string;
  path: string;
  type: 'file' | 'directory' | 'symlink';
  size: number;
  mimeType?: string;
  createdAt: Date;
  modifiedAt: Date;
  accessedAt: Date;
  permissions?: FSPermissions;
  xattrs?: Record<string, unknown>;
}

/**
 * File permissions
 */
export interface FSPermissions {
  readable: boolean;
  writable: boolean;
  executable: boolean;
}

/**
 * Open dialog options
 */
export interface OpenDialogOptions {
  title?: string;
  defaultPath?: string;
  filters?: FileFilter[];
  multiple?: boolean;
  directory?: boolean;
  showHidden?: boolean;
}

/**
 * Save dialog options
 */
export interface SaveDialogOptions {
  title?: string;
  defaultPath?: string;
  defaultName?: string;
  filters?: FileFilter[];
  showHidden?: boolean;
}

/**
 * File filter
 */
export interface FileFilter {
  name: string;
  extensions: string[];
}

/**
 * Recent file
 */
export interface RecentFile {
  path: string;
  name: string;
  accessedAt: Date;
  thumbnail?: string;
}

/**
 * File handler registration
 */
export interface FileHandler {
  /** File extensions */
  extensions: string[];
  
  /** MIME types */
  mimeTypes?: string[];
  
  /** Handler role */
  role: 'editor' | 'viewer' | 'none';
  
  /** Action to perform */
  action: 'open' | 'preview' | 'import';
  
  /** Icon for file type */
  icon?: ReactNode;
}

/**
 * URL handler registration
 */
export interface URLHandler {
  /** URL scheme */
  scheme: string;
  
  /** Handler function */
  handler: (url: URL) => void;
}

// ============================================================================
// Lifecycle Types
// ============================================================================

/**
 * App lifecycle hooks
 */
export interface AppLifecycleHooks {
  /** Called when app launches */
  onLaunch?: () => void | Promise<void>;
  
  /** Called when app activates (comes to front) */
  onActivate?: () => void;
  
  /** Called when app deactivates (goes to background) */
  onDeactivate?: () => void;
  
  /** Called before app terminates */
  onTerminate?: () => void | Promise<void>;
  
  /** Called when app should open a file */
  onOpenFile?: (path: string) => void;
  
  /** Called when app should open URLs */
  onOpenURL?: (url: URL) => void;
  
  /** Called when system requests save */
  onSaveState?: () => unknown;
  
  /** Called to restore state */
  onRestoreState?: (state: unknown) => void;
  
  /** Called when memory pressure detected */
  onMemoryWarning?: () => void;
}

/**
 * Lifecycle event types
 */
export type LifecycleEvent =
  | 'launch'
  | 'activate'
  | 'deactivate'
  | 'terminate'
  | 'memoryWarning'
  | 'willEnterBackground'
  | 'didEnterForeground';

// ============================================================================
// Navigation Types
// ============================================================================

/**
 * Navigation column visibility
 */
export type NavigationColumnVisibility =
  | 'all'
  | 'doubleColumn'
  | 'detailOnly'
  | 'automatic';

/**
 * Navigation split view props
 */
export interface NavigationSplitViewProps {
  sidebar: ReactNode;
  content?: ReactNode;
  inspector?: ReactNode;
  columnVisibility?: NavigationColumnVisibility;
  sidebarWidth?: number;
  inspectorWidth?: number;
  sidebarCollapsed?: boolean;
  onSidebarCollapsedChange?: (collapsed: boolean) => void;
}

/**
 * Tab definition
 */
export interface TabDefinition {
  id: string;
  label: string;
  icon?: ReactNode;
  content: ReactNode;
  closable?: boolean;
  badge?: string | number;
}

/**
 * Modal size
 */
export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

// ============================================================================
// Service Types
// ============================================================================

/**
 * Service definition
 */
export interface ServiceDefinition {
  /** Service identifier */
  id: string;
  
  /** Service type */
  type: 'action' | 'filter' | 'provider';
  
  /** Supported input types */
  inputTypes?: string[];
  
  /** Output type */
  outputType?: string;
  
  /** Handler */
  handler: (input: unknown) => unknown | Promise<unknown>;
}

// ============================================================================
// App Definition (Complete)
// ============================================================================

/**
 * Complete app definition
 */
export interface AppDefinition<TSettings = Record<string, unknown>> {
  /** App manifest */
  manifest: AppManifest;
  
  /** App icon component */
  icon?: ComponentType<{ size?: number; className?: string }>;
  
  /** Scenes */
  scenes: Scene[];
  
  /** Menu bar configuration */
  menuBar?: MenuBarConfig;
  
  /** Dock configuration */
  dock?: DockConfig;
  
  /** Settings schema */
  settings?: SettingsSchema<TSettings>;
  
  /** Default settings */
  defaultSettings?: TSettings;
  
  /** Platform adaptations */
  platforms?: Partial<Record<PlatformMode, Partial<Omit<AppDefinition<TSettings>, 'platforms'>>>>;
  
  /** Lifecycle hooks */
  lifecycle?: AppLifecycleHooks;
  
  /** Services provided */
  services?: ServiceDefinition[];
  
  /** File handlers */
  fileHandlers?: FileHandler[];
  
  /** URL handlers */
  urlHandlers?: URLHandler[];
}

/**
 * Registered app (after defineApp)
 */
export interface RegisteredApp<TSettings = Record<string, unknown>> extends AppDefinition<TSettings> {
  /** Registration timestamp */
  registeredAt: Date;
  
  /** Normalized manifest */
  manifest: Required<Pick<AppManifest, 'identifier' | 'name' | 'version' | 'category'>> & AppManifest;
}

// ============================================================================
// Hook Return Types
// ============================================================================

/**
 * useApp return type
 */
export interface AppAPI {
  manifest: AppManifest;
  isActive: boolean;
  windowId: string;
  close: () => void;
  minimize: () => void;
  maximize: () => void;
  focus: () => void;
  openScene: (sceneId: string, data?: unknown) => void;
}

/**
 * useMenu return type
 */
export interface MenuAPI {
  setMenuBar: (config: MenuBarConfig) => void;
  updateMenu: (menuId: string, updates: Partial<MenuDefinition>) => void;
  updateMenuItem: (menuId: string, itemId: string, updates: Partial<MenuItem>) => void;
  setItemEnabled: (menuId: string, itemId: string, enabled: boolean) => void;
  setItemChecked: (menuId: string, itemId: string, checked: boolean) => void;
  getMenuBar: () => MenuBarConfig | null;
}

/**
 * useDock return type
 */
export interface DockAPI {
  setBadge: (badge: string | number | null) => void;
  setProgress: (progress: number | null) => void;
  bounce: (type?: 'critical' | 'informational') => void;
  setContextMenu: (items: DockMenuItem[]) => void;
  requestAttention: () => void;
}

/**
 * useNavigation return type
 */
export interface NavigationAPI {
  path: string[];
  navigate: (to: string[], data?: Record<string, unknown>) => void;
  push: (segment: string, data?: unknown) => void;
  pop: (count?: number) => void;
  replace: (segment: string, data?: unknown) => void;
  getData: (segment: string) => unknown;
  canGoBack: boolean;
}

/**
 * useFileSystem return type
 */
export interface FileSystemAPI {
  readFile: (path: string) => Promise<ArrayBuffer>;
  readTextFile: (path: string) => Promise<string>;
  writeFile: (path: string, data: ArrayBuffer | string) => Promise<void>;
  appendFile: (path: string, data: ArrayBuffer | string) => Promise<void>;
  deleteFile: (path: string) => Promise<void>;
  readDirectory: (path: string) => Promise<FSEntry[]>;
  createDirectory: (path: string, recursive?: boolean) => Promise<void>;
  deleteDirectory: (path: string, recursive?: boolean) => Promise<void>;
  exists: (path: string) => Promise<boolean>;
  stat: (path: string) => Promise<FSEntry>;
  rename: (oldPath: string, newPath: string) => Promise<void>;
  copy: (src: string, dest: string) => Promise<void>;
  showOpenDialog: (options?: OpenDialogOptions) => Promise<FSEntry[] | null>;
  showSaveDialog: (options?: SaveDialogOptions) => Promise<string | null>;
  getRecentFiles: (limit?: number) => Promise<RecentFile[]>;
  addRecentFile: (path: string) => Promise<void>;
}

/**
 * useStorage return type
 */
export interface StorageAPI<T = unknown> {
  get: (key: string) => T | null;
  set: (key: string, value: T) => void;
  remove: (key: string) => void;
  clear: () => void;
  keys: () => string[];
  has: (key: string) => boolean;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Deep partial type
 */
export type DeepPartial<T> = T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T;

/**
 * Make specific keys required
 */
export type RequireKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;
