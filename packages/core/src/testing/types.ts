/**
 * Testing Types for zOS
 *
 * Core type definitions for the testing utilities.
 * Designed to work with Jest, Vitest, and similar testing frameworks.
 */

import type { ReactElement } from 'react';
import type { AppType, WindowState, WindowGeometry } from '../hooks/useWindowManager';
import type { LoaderAppManifest } from '../services/appLoader';
import type { FileNode, FileSystemState } from '../services/fileSystem/types';
import type { ClipboardItem, ClipboardDataType } from '../services/clipboard/types';
import type { MenuItem, Menu, AppMenuConfig } from '../services/menuRegistry';
import type { TranslationDict } from '../services/i18n/types';

/**
 * Menu action event for testing
 */
export interface TestMenuActionEvent {
  menuId: string;
  itemId: string;
  appId: string;
}

// Re-export TranslationDict for testing module users
export type { TranslationDict };

/**
 * Result returned from rendering a component
 */
export interface RenderResult {
  /** The root container element */
  container: HTMLElement;
  /** Find element by data-testid attribute */
  getByTestId: (testId: string) => HTMLElement;
  /** Find element by text content */
  getByText: (text: string | RegExp) => HTMLElement;
  /** Find element by ARIA role */
  getByRole: (role: string, options?: { name?: string | RegExp }) => HTMLElement;
  /** Query element by data-testid (returns null if not found) */
  queryByTestId: (testId: string) => HTMLElement | null;
  /** Query element by text content (returns null if not found) */
  queryByText: (text: string | RegExp) => HTMLElement | null;
  /** Query element by role (returns null if not found) */
  queryByRole: (role: string, options?: { name?: string | RegExp }) => HTMLElement | null;
  /** Find all elements matching a selector */
  queryAllByTestId: (testId: string) => HTMLElement[];
  /** Re-render with new props */
  rerender: (ui: ReactElement) => void;
  /** Unmount the component */
  unmount: () => void;
  /** Debug helper - logs the DOM tree */
  debug: () => void;
}

/**
 * Mock function type - compatible with Jest and Vitest
 */
export interface MockFn<T extends (...args: any[]) => any = (...args: any[]) => any> {
  (...args: Parameters<T>): ReturnType<T>;
  mock: {
    calls: Parameters<T>[];
    results: { type: 'return' | 'throw'; value: ReturnType<T> }[];
    instances: unknown[];
  };
  mockClear: () => void;
  mockReset: () => void;
  mockImplementation: (fn: T) => MockFn<T>;
  mockReturnValue: (value: ReturnType<T>) => MockFn<T>;
  mockReturnValueOnce: (value: ReturnType<T>) => MockFn<T>;
  mockResolvedValue: <U>(value: U) => MockFn<T>;
  mockRejectedValue: (error: Error) => MockFn<T>;
}

/**
 * Mock Window Manager for testing window operations
 */
export interface MockWindowManager {
  /** Map of window ID to window state */
  windows: Map<string, WindowState>;
  /** Currently active app */
  activeApp: AppType | null;
  /** List of open apps */
  openApps: AppType[];
  /** Window geometries */
  geometries: Map<AppType, WindowGeometry>;

  // Mock functions
  openWindow: MockFn<(app: AppType) => void>;
  closeWindow: MockFn<(app: AppType) => void>;
  focusWindow: MockFn<(app: AppType) => void>;
  toggleWindow: MockFn<(app: AppType) => void>;
  minimizeWindow: MockFn<(app: AppType) => void>;
  maximizeWindow: MockFn<(app: AppType) => void>;
  restoreWindow: MockFn<(app: AppType) => void>;
  tileWindowLeft: MockFn<(app: AppType) => void>;
  tileWindowRight: MockFn<(app: AppType) => void>;
  closeAllWindows: MockFn<() => void>;
  hideOtherWindows: MockFn<() => void>;
  showAllWindows: MockFn<() => void>;
  getWindowState: MockFn<(app: AppType) => WindowGeometry | null>;
  updateWindowGeometry: MockFn<(app: AppType, geometry: Partial<WindowGeometry>) => void>;
  isOpen: MockFn<(app: AppType) => boolean>;
  isMinimized: MockFn<(app: AppType) => boolean>;
  isMaximized: MockFn<(app: AppType) => boolean>;
  isTiled: MockFn<(app: AppType) => 'left' | 'right' | null>;

  // Test helpers
  _reset: () => void;
  _setActiveApp: (app: AppType | null) => void;
  _addWindow: (app: AppType) => void;
}

/**
 * Dock item for mock dock context
 */
export interface MockDockItem {
  id: string;
  isPinned: boolean;
  order: number;
}

/**
 * Mock Dock Context for testing dock operations
 */
export interface MockDockContext {
  dockOrder: MockDockItem[];

  reorderItems: MockFn<(dragId: string, dropId: string) => void>;
  removeFromDock: MockFn<(id: string) => void>;
  addToDock: MockFn<(id: string) => void>;
  pinItem: MockFn<(id: string) => void>;
  unpinItem: MockFn<(id: string) => void>;
  isItemInDock: MockFn<(id: string) => boolean>;
  isItemPinned: MockFn<(id: string) => boolean>;

  _reset: () => void;
  _setDockOrder: (items: MockDockItem[]) => void;
}

/**
 * Mock Menu Context for testing menu operations
 */
export interface MockMenuContext {
  activeConfig: AppMenuConfig | null;
  activeAppId: string | null;

  registerMenus: MockFn<(config: AppMenuConfig) => void>;
  unregisterMenus: MockFn<(appId: string) => void>;
  setActiveApp: MockFn<(appId: string | null) => void>;
  addMenuItem: MockFn<(appId: string, menuId: string, item: MenuItem, position?: number) => boolean>;
  removeMenuItem: MockFn<(appId: string, menuId: string, itemId: string) => boolean>;
  updateMenuItem: MockFn<(appId: string, menuId: string, itemId: string, updates: Partial<MenuItem>) => boolean>;
  executeAction: MockFn<(appId: string, menuId: string, itemId: string) => void>;
  registerActionHandler: MockFn<(appId: string, handler: (event: TestMenuActionEvent) => void) => void>;
  unregisterActionHandler: MockFn<(appId: string) => void>;

  _reset: () => void;
  _setActiveConfig: (config: AppMenuConfig | null) => void;
  _triggerAction: (event: TestMenuActionEvent) => void;
}

/**
 * Mock File System for testing file operations
 */
export interface MockFileSystem {
  state: FileSystemState;

  // Read operations
  getNode: MockFn<(path: string) => FileNode | null>;
  listDirectory: MockFn<(path: string) => FileNode[]>;
  exists: MockFn<(path: string) => boolean>;
  isDirectory: MockFn<(path: string) => boolean>;
  isFile: MockFn<(path: string) => boolean>;
  readFile: MockFn<(path: string) => string | null>;

  // Write operations
  createFile: MockFn<(path: string, content?: string) => FileNode | null>;
  createFolder: MockFn<(path: string) => FileNode | null>;
  writeFile: MockFn<(path: string, content: string) => boolean>;
  deleteNode: MockFn<(path: string) => boolean>;
  moveNode: MockFn<(source: string, destination: string) => boolean>;
  copyNode: MockFn<(source: string, destination: string) => FileNode | null>;
  renameNode: MockFn<(path: string, newName: string) => boolean>;

  // Test helpers
  _reset: () => void;
  _addFile: (path: string, content?: string) => void;
  _addFolder: (path: string) => void;
  _getState: () => FileSystemState;
}

/**
 * Mock Clipboard for testing clipboard operations
 */
export interface MockClipboard {
  currentItem: ClipboardItem | null;
  history: ClipboardItem[];

  copy: MockFn<(data: unknown, type?: ClipboardDataType) => Promise<void>>;
  cut: MockFn<(data: unknown, type?: ClipboardDataType, onCut?: () => void) => Promise<void>>;
  paste: MockFn<() => Promise<ClipboardItem | null>>;
  copyText: MockFn<(text: string) => Promise<void>>;
  copyHtml: MockFn<(html: string) => Promise<void>>;
  copyFiles: MockFn<(paths: string[]) => Promise<void>>;
  getHistory: MockFn<() => ClipboardItem[]>;
  clearHistory: MockFn<() => void>;
  pasteFromHistory: MockFn<(id: string) => Promise<ClipboardItem | null>>;

  _reset: () => void;
  _setCurrentItem: (item: ClipboardItem | null) => void;
  _addToHistory: (item: ClipboardItem) => void;
}

/**
 * Options for renderWithProviders
 */
export interface RenderOptions {
  /** Custom wrapper component */
  wrapper?: React.ComponentType<{ children: React.ReactNode }>;
  /** Initial window manager state */
  windowManager?: Partial<MockWindowManager>;
  /** Initial dock state */
  dock?: Partial<MockDockContext>;
  /** Initial menu state */
  menu?: Partial<MockMenuContext>;
  /** Initial file system state */
  fileSystem?: Partial<MockFileSystem>;
  /** Initial clipboard state */
  clipboard?: Partial<MockClipboard>;
  /** Initial i18n configuration */
  i18n?: {
    locale?: string;
    translations?: TranslationDict;
  };
  /** Initial theme */
  theme?: 'light' | 'dark' | 'system';
  /** Initial route/path for routing tests */
  route?: string;
  /** Container element to render into */
  container?: HTMLElement;
}

/**
 * Test app configuration
 */
export interface TestAppConfig {
  /** Unique app identifier */
  id: string;
  /** Display name */
  name: string;
  /** App component */
  component: React.ComponentType<any>;
  /** Initial props for the component */
  props?: Record<string, unknown>;
  /** Initial window geometry */
  geometry?: Partial<WindowGeometry>;
  /** Menu configuration */
  menus?: Menu[];
}

/**
 * Result from createTestApp
 */
export interface TestAppResult {
  /** Generated app manifest */
  manifest: LoaderAppManifest;
  /** Render the app with providers */
  render: (options?: Partial<RenderOptions>) => RenderResult;
  /** Get the mock window manager */
  getWindowManager: () => MockWindowManager;
  /** Get the mock menu context */
  getMenuContext: () => MockMenuContext;
  /** Simulate opening the app */
  open: () => void;
  /** Simulate closing the app */
  close: () => void;
  /** Simulate focusing the app */
  focus: () => void;
}

/**
 * Keyboard shortcut definition
 */
export interface KeyboardShortcut {
  /** Key combination (e.g., "Cmd+S", "Ctrl+Shift+P") */
  keys: string;
  /** Whether Cmd/Ctrl is pressed */
  meta?: boolean;
  /** Whether Shift is pressed */
  shift?: boolean;
  /** Whether Alt/Option is pressed */
  alt?: boolean;
  /** Whether Ctrl is pressed */
  ctrl?: boolean;
  /** The key code */
  key: string;
}

/**
 * Drag and drop simulation options
 */
export interface DragDropOptions {
  /** Data to transfer */
  dataTransfer?: Record<string, string>;
  /** Drag effect */
  effectAllowed?: 'copy' | 'move' | 'link' | 'all' | 'none';
  /** Drop effect */
  dropEffect?: 'copy' | 'move' | 'link' | 'none';
}

/**
 * Wait options for async utilities
 */
export interface WaitOptions {
  /** Maximum time to wait in ms (default: 1000) */
  timeout?: number;
  /** Polling interval in ms (default: 50) */
  interval?: number;
  /** Error message on timeout */
  message?: string;
}
