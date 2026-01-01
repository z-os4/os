# zOS App Framework Architecture

A comprehensive SwiftUI/Flutter-inspired framework for building native-feeling zOS applications.

## Table of Contents

1. [Overview](#overview)
2. [Unified App Definition](#1-unified-app-definition)
3. [Unified Menu System](#2-unified-menu-system)
4. [Settings & Preferences](#3-settings--preferences)
5. [File System Abstraction](#4-file-system-abstraction)
6. [Navigation Patterns](#5-navigation-patterns)
7. [Implementation Plan](#implementation-plan)

---

## Overview

The zOS App Framework provides a declarative, type-safe way to build desktop-quality applications that run in the browser. Inspired by SwiftUI's `@main App` pattern and Flutter's Material Design components, it offers:

- **Declarative App Structure**: Define your app's windows, scenes, and settings declaratively
- **Unified Menu System**: Standard and custom menus with keyboard shortcuts
- **Reactive Settings**: `@AppStorage`-equivalent with automatic persistence and reactivity
- **Virtual File System**: Full file system abstraction with dialogs and recent files
- **Navigation Patterns**: `NavigationSplitView`, tabs, and modals built-in

### Package Structure

```
packages/
├── sdk/           # App definition, hooks, types
│   ├── app/       # defineApp, scenes, app lifecycle
│   ├── storage/   # @AppStorage, reactive preferences
│   ├── menu/      # Menu system, keyboard shortcuts
│   └── navigation/ # Navigation state, routing
├── ui/            # UI components
│   ├── navigation/ # NavigationSplitView, tabs, modals
│   ├── file/      # File browser, file dialogs
│   └── settings/  # Settings UI components
├── core/          # Core services
│   ├── fs/        # Virtual file system
│   ├── services/  # System services
│   └── platform/  # Platform detection, adaptations
└── runtime/       # App loading, lifecycle
```

---

## 1. Unified App Definition

### Enhanced `defineApp()` Pattern

```typescript
// packages/sdk/src/app/defineApp.ts

import type { ComponentType } from 'react';

/**
 * Platform adaptation modes
 */
export type PlatformMode = 'desktop' | 'tablet' | 'mobile' | 'auto';

/**
 * Scene types - different window configurations
 */
export type SceneType = 
  | 'window'       // Standard window
  | 'settings'     // Settings panel
  | 'about'        // About dialog
  | 'document'     // Document-based app
  | 'utility'      // Floating utility window
  | 'menuBarExtra' // Menu bar widget (future)
  | 'widget';      // Desktop widget (future)

/**
 * Scene definition - represents a distinct window/view
 */
export interface Scene<P = object> {
  /** Scene identifier */
  id: string;
  
  /** Scene type */
  type: SceneType;
  
  /** Scene title (can be dynamic) */
  title: string | ((props: P) => string);
  
  /** The component to render */
  component: ComponentType<P & SceneProps>;
  
  /** Window configuration */
  window?: WindowSceneConfig;
  
  /** Keyboard shortcut to open this scene */
  shortcut?: string;
  
  /** Whether this scene is the main/default scene */
  isMain?: boolean;
  
  /** Platform-specific overrides */
  platforms?: Partial<Record<PlatformMode, Partial<Scene<P>>>>;
}

/**
 * Window-specific scene configuration
 */
export interface WindowSceneConfig {
  /** Default size */
  defaultSize?: { width: number; height: number };
  
  /** Minimum size */
  minSize?: { width: number; height: number };
  
  /** Maximum size */
  maxSize?: { width: number; height: number };
  
  /** Whether resizable */
  resizable?: boolean;
  
  /** Window style */
  style?: 'default' | 'terminal' | 'safari' | 'textpad' | 'system';
  
  /** Titlebar style */
  titlebar?: 'default' | 'transparent' | 'hidden' | 'inset';
  
  /** Window background */
  background?: 'solid' | 'blur' | 'transparent';
  
  /** Allow multiple instances */
  multipleInstances?: boolean;
  
  /** Show in dock when open */
  showInDock?: boolean;
  
  /** Remember window position */
  rememberPosition?: boolean;
}

/**
 * Props passed to all scene components
 */
export interface SceneProps {
  /** Close this scene */
  onClose: () => void;
  
  /** Focus this scene */
  onFocus?: () => void;
  
  /** Scene-specific data */
  sceneData?: unknown;
  
  /** Open another scene */
  openScene: (sceneId: string, data?: unknown) => void;
}

/**
 * Complete app definition
 */
export interface AppDefinition<TSettings = object> {
  /** App manifest (metadata) */
  manifest: AppManifest;
  
  /** App icon component */
  icon?: ComponentType<{ size?: number; className?: string }>;
  
  /** Scenes (windows/views) */
  scenes: Scene[];
  
  /** Menu bar configuration */
  menuBar?: MenuBarConfig;
  
  /** Dock configuration */
  dock?: DockConfig;
  
  /** Settings schema */
  settings?: SettingsSchema<TSettings>;
  
  /** Default settings values */
  defaultSettings?: TSettings;
  
  /** Platform-specific adaptations */
  platforms?: PlatformAdaptations;
  
  /** Lifecycle hooks */
  lifecycle?: AppLifecycleHooks;
  
  /** Services this app provides */
  services?: ServiceDefinition[];
  
  /** File types this app handles */
  fileHandlers?: FileHandler[];
  
  /** URL schemes this app handles */
  urlHandlers?: URLHandler[];
}

/**
 * Define a zOS app with full type safety
 */
export function defineApp<TSettings = object>(
  definition: AppDefinition<TSettings>
): RegisteredApp<TSettings> {
  // Validate and normalize the definition
  const normalized = normalizeAppDefinition(definition);
  
  // Register with the app registry
  AppRegistry.register(normalized);
  
  return normalized as RegisteredApp<TSettings>;
}
```

### Example Usage

```typescript
// apps/textedit/src/index.tsx
import { defineApp, Scene } from '@z-os/sdk';
import { TextEditIcon, TextEditMain, TextEditSettings, TextEditAbout } from './components';
import { textEditSettings } from './settings';

const scenes: Scene[] = [
  {
    id: 'main',
    type: 'document',
    title: (props) => props.documentTitle || 'Untitled',
    component: TextEditMain,
    isMain: true,
    window: {
      defaultSize: { width: 700, height: 500 },
      minSize: { width: 400, height: 300 },
      resizable: true,
      style: 'textpad',
      multipleInstances: true,
      rememberPosition: true,
    },
    platforms: {
      mobile: {
        window: {
          titlebar: 'hidden',
        }
      }
    }
  },
  {
    id: 'settings',
    type: 'settings',
    title: 'TextEdit Settings',
    component: TextEditSettings,
    shortcut: '⌘,',
    window: {
      defaultSize: { width: 500, height: 400 },
      resizable: false,
      style: 'system',
    }
  },
  {
    id: 'about',
    type: 'about',
    title: 'About TextEdit',
    component: TextEditAbout,
    window: {
      defaultSize: { width: 300, height: 200 },
      resizable: false,
      style: 'system',
    }
  }
];

export default defineApp({
  manifest: {
    identifier: 'ai.hanzo.textedit',
    name: 'TextEdit',
    version: '2.0.0',
    description: 'Simple text and rich text editor',
    category: 'productivity',
    author: 'Hanzo AI',
    icon: {
      type: 'component',
      source: 'TextEditIcon',
    },
  },
  
  icon: TextEditIcon,
  scenes,
  
  menuBar: {
    menus: [
      {
        id: 'file',
        label: 'File',
        items: [
          { id: 'new', label: 'New', shortcut: '⌘N', action: 'file.new' },
          { id: 'open', label: 'Open...', shortcut: '⌘O', action: 'file.open' },
          { type: 'separator' },
          { id: 'save', label: 'Save', shortcut: '⌘S', action: 'file.save' },
          { id: 'saveAs', label: 'Save As...', shortcut: '⇧⌘S', action: 'file.saveAs' },
          { type: 'separator' },
          { id: 'close', label: 'Close', shortcut: '⌘W', action: 'window.close' },
        ]
      },
      {
        id: 'format',
        label: 'Format',
        items: [
          { id: 'bold', label: 'Bold', shortcut: '⌘B', action: 'format.bold' },
          { id: 'italic', label: 'Italic', shortcut: '⌘I', action: 'format.italic' },
          { id: 'underline', label: 'Underline', shortcut: '⌘U', action: 'format.underline' },
        ]
      }
    ],
    standardMenus: ['edit', 'view', 'window', 'help'],
  },
  
  settings: textEditSettings,
  
  defaultSettings: {
    fontFamily: 'SF Mono',
    fontSize: 14,
    tabSize: 2,
    wordWrap: true,
    showLineNumbers: true,
    theme: 'auto',
  },
  
  fileHandlers: [
    {
      extensions: ['txt', 'md', 'rtf'],
      role: 'editor',
      action: 'open',
    }
  ],
  
  lifecycle: {
    onLaunch: () => console.log('TextEdit launched'),
    onTerminate: () => console.log('TextEdit terminated'),
    onOpenFile: (path) => console.log('Opening file:', path),
  }
});
```

---

## 2. Unified Menu System

### Core Menu Types

```typescript
// packages/sdk/src/menu/types.ts

/**
 * Menu bar configuration
 */
export interface MenuBarConfig {
  /** Custom menus */
  menus: MenuDefinition[];
  
  /** Include standard menus */
  standardMenus?: StandardMenuType[];
  
  /** Dynamic menu updates */
  dynamicMenus?: () => MenuDefinition[];
}

/**
 * Standard menu types that zOS provides
 */
export type StandardMenuType = 'apple' | 'file' | 'edit' | 'view' | 'window' | 'help';

/**
 * Menu definition
 */
export interface MenuDefinition {
  /** Unique menu identifier */
  id: string;
  
  /** Menu label in menu bar */
  label: string;
  
  /** Menu items */
  items: MenuItem[];
  
  /** Hide this menu */
  hidden?: boolean;
  
  /** Disabled state */
  disabled?: boolean;
}

/**
 * Menu item types
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
  shortcut?: string;
  icon?: React.ReactNode;
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
  icon?: React.ReactNode;
  items: MenuItem[];
  disabled?: boolean;
}

/**
 * Toggle item (checkbox)
 */
export interface MenuItemToggle {
  type: 'toggle';
  id: string;
  label: string;
  shortcut?: string;
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
 * Context menu configuration
 */
export interface ContextMenuConfig {
  items: MenuItem[];
  onOpen?: (event: React.MouseEvent) => void;
  onClose?: () => void;
}
```

### Menu Hooks

```typescript
// packages/sdk/src/menu/hooks.ts

/**
 * useMenu - Full menu bar control
 */
export function useMenu(): MenuAPI {
  const appId = useAppId();
  const [menuBar, setMenuBar] = useState<MenuBarConfig | null>(null);
  
  // Register menu bar with system
  const registerMenuBar = useCallback((config: MenuBarConfig) => {
    setMenuBar(config);
    MenuService.registerAppMenu(appId, config);
  }, [appId]);
  
  // Update individual menu
  const updateMenu = useCallback((menuId: string, updates: Partial<MenuDefinition>) => {
    setMenuBar(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        menus: prev.menus.map(m => 
          m.id === menuId ? { ...m, ...updates } : m
        )
      };
    });
  }, []);
  
  // Enable/disable menu item
  const setItemEnabled = useCallback((menuId: string, itemId: string, enabled: boolean) => {
    updateMenuItem(menuId, itemId, { disabled: !enabled });
  }, []);
  
  // Update menu item
  const updateMenuItem = useCallback((menuId: string, itemId: string, updates: Partial<MenuItem>) => {
    setMenuBar(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        menus: prev.menus.map(menu => 
          menu.id === menuId 
            ? { ...menu, items: updateItemInList(menu.items, itemId, updates) }
            : menu
        )
      };
    });
  }, []);
  
  return {
    menuBar,
    registerMenuBar,
    updateMenu,
    updateMenuItem,
    setItemEnabled,
    setItemChecked: (menuId, itemId, checked) => 
      updateMenuItem(menuId, itemId, { checked }),
  };
}

/**
 * useContextMenu - Context menu for elements
 */
export function useContextMenu(config: ContextMenuConfig): {
  onContextMenu: (e: React.MouseEvent) => void;
  ContextMenu: React.FC;
} {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  const onContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setPosition({ x: e.clientX, y: e.clientY });
    setIsOpen(true);
    config.onOpen?.(e);
  }, [config]);
  
  const ContextMenu = useMemo(() => {
    return () => isOpen ? (
      <ContextMenuPortal
        items={config.items}
        position={position}
        onClose={() => {
          setIsOpen(false);
          config.onClose?.();
        }}
      />
    ) : null;
  }, [isOpen, position, config]);
  
  return { onContextMenu, ContextMenu };
}

/**
 * useKeyboardShortcuts - Register global shortcuts
 */
export function useKeyboardShortcuts(
  shortcuts: Record<string, () => void>,
  options?: { whenFocused?: boolean }
): void {
  const appId = useAppId();
  
  useEffect(() => {
    const unregister = KeyboardService.registerShortcuts(appId, shortcuts, options);
    return unregister;
  }, [appId, shortcuts, options]);
}
```

### Standard Menu Creators

```typescript
// packages/sdk/src/menu/standard.ts

/**
 * Create standard menus with app-specific handlers
 */
export const StandardMenus = {
  /**
   * Apple menu (app-specific section)
   */
  apple: (appName: string, handlers: {
    onAbout?: () => void;
    onPreferences?: () => void;
    onHide?: () => void;
    onQuit?: () => void;
  }): MenuDefinition => ({
    id: 'apple',
    label: '',
    items: [
      { id: 'about', label: `About ${appName}`, action: handlers.onAbout || (() => {}) },
      { type: 'separator' },
      { id: 'preferences', label: 'Settings...', shortcut: '⌘,', action: handlers.onPreferences || (() => {}) },
      { type: 'separator' },
      { id: 'hide', label: `Hide ${appName}`, shortcut: '⌘H', action: handlers.onHide || (() => {}) },
      { id: 'hideOthers', label: 'Hide Others', shortcut: '⌥⌘H', action: 'system.hideOthers' },
      { id: 'showAll', label: 'Show All', action: 'system.showAll' },
      { type: 'separator' },
      { id: 'quit', label: `Quit ${appName}`, shortcut: '⌘Q', action: handlers.onQuit || 'app.quit' },
    ]
  }),
  
  /**
   * Standard File menu
   */
  file: (handlers: StandardFileHandlers): MenuDefinition => ({
    id: 'file',
    label: 'File',
    items: buildFileMenuItems(handlers)
  }),
  
  /**
   * Standard Edit menu
   */
  edit: (handlers: StandardEditHandlers = {}): MenuDefinition => ({
    id: 'edit',
    label: 'Edit',
    items: [
      { id: 'undo', label: 'Undo', shortcut: '⌘Z', action: handlers.onUndo || 'edit.undo' },
      { id: 'redo', label: 'Redo', shortcut: '⇧⌘Z', action: handlers.onRedo || 'edit.redo' },
      { type: 'separator' },
      { id: 'cut', label: 'Cut', shortcut: '⌘X', action: handlers.onCut || 'edit.cut' },
      { id: 'copy', label: 'Copy', shortcut: '⌘C', action: handlers.onCopy || 'edit.copy' },
      { id: 'paste', label: 'Paste', shortcut: '⌘V', action: handlers.onPaste || 'edit.paste' },
      { id: 'delete', label: 'Delete', action: handlers.onDelete || 'edit.delete' },
      { id: 'selectAll', label: 'Select All', shortcut: '⌘A', action: handlers.onSelectAll || 'edit.selectAll' },
      { type: 'separator' },
      { id: 'find', label: 'Find...', shortcut: '⌘F', action: handlers.onFind || 'edit.find' },
      { id: 'findNext', label: 'Find Next', shortcut: '⌘G', action: handlers.onFindNext || 'edit.findNext' },
      { id: 'replace', label: 'Replace...', shortcut: '⌥⌘F', action: handlers.onReplace || 'edit.replace' },
    ]
  }),
  
  /**
   * Standard View menu
   */
  view: (handlers: StandardViewHandlers = {}): MenuDefinition => ({
    id: 'view',
    label: 'View',
    items: [
      { id: 'zoomIn', label: 'Zoom In', shortcut: '⌘+', action: handlers.onZoomIn || 'view.zoomIn' },
      { id: 'zoomOut', label: 'Zoom Out', shortcut: '⌘-', action: handlers.onZoomOut || 'view.zoomOut' },
      { id: 'actualSize', label: 'Actual Size', shortcut: '⌘0', action: handlers.onActualSize || 'view.actualSize' },
      { type: 'separator' },
      ...(handlers.onToggleSidebar ? [
        { id: 'sidebar', label: 'Toggle Sidebar', shortcut: '⌘\\', action: handlers.onToggleSidebar } as MenuItem,
        { type: 'separator' as const }
      ] : []),
      { id: 'fullscreen', label: 'Enter Full Screen', shortcut: '⌃⌘F', action: handlers.onFullScreen || 'view.fullscreen' },
    ]
  }),
  
  /**
   * Standard Window menu
   */
  window: (handlers: StandardWindowHandlers = {}): MenuDefinition => ({
    id: 'window',
    label: 'Window',
    items: [
      { id: 'minimize', label: 'Minimize', shortcut: '⌘M', action: handlers.onMinimize || 'window.minimize' },
      { id: 'zoom', label: 'Zoom', action: handlers.onZoom || 'window.zoom' },
      { id: 'tileLeft', label: 'Tile Window to Left', action: 'window.tileLeft' },
      { id: 'tileRight', label: 'Tile Window to Right', action: 'window.tileRight' },
      { type: 'separator' },
      { id: 'bringFront', label: 'Bring All to Front', action: 'window.bringAllToFront' },
      // Dynamic: list of open windows
    ]
  }),
  
  /**
   * Standard Help menu
   */
  help: (appName: string, handlers: StandardHelpHandlers = {}): MenuDefinition => ({
    id: 'help',
    label: 'Help',
    items: [
      { id: 'search', label: 'Search', action: 'help.search' },
      { type: 'separator' },
      { id: 'help', label: `${appName} Help`, action: handlers.onHelp || 'help.show' },
    ]
  }),
};
```

---

## 3. Settings & Preferences

### `@AppStorage` Equivalent

```typescript
// packages/sdk/src/storage/appStorage.ts

import { useSyncExternalStore, useCallback } from 'react';

/**
 * Storage options
 */
export interface AppStorageOptions<T> {
  /** Default value if not set */
  defaultValue: T;
  
  /** Storage type */
  store?: 'local' | 'session' | 'sync';
  
  /** Serializer (default: JSON) */
  serializer?: {
    serialize: (value: T) => string;
    deserialize: (value: string) => T;
  };
}

/**
 * Create a reactive app storage binding
 * Similar to SwiftUI's @AppStorage
 */
export function useAppStorage<T>(
  key: string,
  options: AppStorageOptions<T>
): [T, (value: T | ((prev: T) => T)) => void] {
  const appId = useAppId();
  const fullKey = `zos:${appId}:${key}`;
  
  const { defaultValue, store = 'local', serializer } = options;
  
  const storage = getStorageBackend(store);
  const serialize = serializer?.serialize ?? JSON.stringify;
  const deserialize = serializer?.deserialize ?? JSON.parse;
  
  // Subscribe to storage changes
  const subscribe = useCallback((callback: () => void) => {
    const handler = (e: StorageEvent) => {
      if (e.key === fullKey) {
        callback();
      }
    };
    window.addEventListener('storage', handler);
    
    // Also subscribe to custom events for same-tab updates
    const customHandler = () => callback();
    window.addEventListener(`zos:storage:${fullKey}`, customHandler);
    
    return () => {
      window.removeEventListener('storage', handler);
      window.removeEventListener(`zos:storage:${fullKey}`, customHandler);
    };
  }, [fullKey]);
  
  // Get current value
  const getSnapshot = useCallback(() => {
    try {
      const item = storage.getItem(fullKey);
      return item !== null ? deserialize(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  }, [fullKey, defaultValue, storage, deserialize]);
  
  // Use sync external store for reactivity
  const value = useSyncExternalStore(subscribe, getSnapshot, () => defaultValue);
  
  // Setter
  const setValue = useCallback((newValue: T | ((prev: T) => T)) => {
    const resolvedValue = typeof newValue === 'function'
      ? (newValue as (prev: T) => T)(getSnapshot())
      : newValue;
    
    storage.setItem(fullKey, serialize(resolvedValue));
    
    // Dispatch custom event for same-tab reactivity
    window.dispatchEvent(new CustomEvent(`zos:storage:${fullKey}`));
  }, [fullKey, storage, serialize, getSnapshot]);
  
  return [value, setValue];
}

/**
 * Create a typed settings hook for an app
 */
export function createSettingsHook<TSettings extends Record<string, unknown>>(
  defaultSettings: TSettings
) {
  return function useSettings(): [TSettings, <K extends keyof TSettings>(key: K, value: TSettings[K]) => void] {
    const [settings, setSettings] = useAppStorage<TSettings>('settings', {
      defaultValue: defaultSettings
    });
    
    const updateSetting = useCallback(<K extends keyof TSettings>(key: K, value: TSettings[K]) => {
      setSettings(prev => ({ ...prev, [key]: value }));
    }, [setSettings]);
    
    return [settings, updateSetting];
  };
}
```

### Settings Schema & UI

```typescript
// packages/sdk/src/settings/types.ts

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
  | 'path'
  | 'keyBinding';

/**
 * Setting definition
 */
export interface SettingDefinition {
  /** Setting key (matches settings object key) */
  key: string;
  
  /** Display label */
  label: string;
  
  /** Description/help text */
  description?: string;
  
  /** Setting type */
  type: SettingType;
  
  /** Default value */
  defaultValue: unknown;
  
  /** Validation */
  validate?: (value: unknown) => boolean | string;
  
  /** Options for select/multiSelect */
  options?: Array<{ label: string; value: string | number }>;
  
  /** Min/max for numbers */
  min?: number;
  max?: number;
  step?: number;
  
  /** Platform restrictions */
  platforms?: PlatformMode[];
  
  /** Requires restart */
  requiresRestart?: boolean;
}

/**
 * Settings section
 */
export interface SettingsSection {
  /** Section ID */
  id: string;
  
  /** Section title */
  title: string;
  
  /** Section icon */
  icon?: React.ReactNode;
  
  /** Settings in this section */
  settings: SettingDefinition[];
}

/**
 * Settings schema
 */
export interface SettingsSchema<T = unknown> {
  /** Schema version */
  version: number;
  
  /** Sections */
  sections: SettingsSection[];
  
  /** Migration from previous versions */
  migrate?: (oldSettings: unknown, fromVersion: number) => T;
}

/**
 * Example settings schema
 */
const textEditSettings: SettingsSchema<TextEditSettings> = {
  version: 1,
  sections: [
    {
      id: 'editor',
      title: 'Editor',
      icon: <EditorIcon />,
      settings: [
        {
          key: 'fontFamily',
          label: 'Font',
          type: 'font',
          defaultValue: 'SF Mono',
        },
        {
          key: 'fontSize',
          label: 'Font Size',
          type: 'number',
          defaultValue: 14,
          min: 8,
          max: 72,
        },
        {
          key: 'tabSize',
          label: 'Tab Size',
          type: 'select',
          defaultValue: 2,
          options: [
            { label: '2 spaces', value: 2 },
            { label: '4 spaces', value: 4 },
            { label: '8 spaces', value: 8 },
          ]
        },
        {
          key: 'wordWrap',
          label: 'Word Wrap',
          type: 'boolean',
          defaultValue: true,
        },
        {
          key: 'showLineNumbers',
          label: 'Show Line Numbers',
          type: 'boolean',
          defaultValue: true,
        }
      ]
    },
    {
      id: 'appearance',
      title: 'Appearance',
      icon: <PaletteIcon />,
      settings: [
        {
          key: 'theme',
          label: 'Theme',
          type: 'select',
          defaultValue: 'auto',
          options: [
            { label: 'Auto', value: 'auto' },
            { label: 'Light', value: 'light' },
            { label: 'Dark', value: 'dark' },
          ]
        }
      ]
    }
  ]
};
```

### Settings UI Component

```typescript
// packages/ui/src/settings/SettingsView.tsx

import { SettingsSchema, SettingDefinition } from '@z-os/sdk';

export interface SettingsViewProps<T> {
  /** Settings schema */
  schema: SettingsSchema<T>;
  
  /** Current values */
  values: T;
  
  /** Update handler */
  onUpdate: <K extends keyof T>(key: K, value: T[K]) => void;
  
  /** Reset to defaults */
  onReset?: () => void;
  
  /** Search query */
  searchQuery?: string;
}

export function SettingsView<T extends Record<string, unknown>>({
  schema,
  values,
  onUpdate,
  onReset,
  searchQuery
}: SettingsViewProps<T>) {
  const [activeSection, setActiveSection] = useState(schema.sections[0]?.id);
  
  const filteredSections = useMemo(() => {
    if (!searchQuery) return schema.sections;
    
    const query = searchQuery.toLowerCase();
    return schema.sections.map(section => ({
      ...section,
      settings: section.settings.filter(s => 
        s.label.toLowerCase().includes(query) ||
        s.description?.toLowerCase().includes(query)
      )
    })).filter(s => s.settings.length > 0);
  }, [schema.sections, searchQuery]);
  
  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <SettingsSidebar
        sections={schema.sections}
        activeSection={activeSection}
        onSelectSection={setActiveSection}
      />
      
      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {filteredSections
          .filter(s => s.id === activeSection)
          .map(section => (
            <SettingsSection key={section.id} section={section}>
              {section.settings.map(setting => (
                <SettingControl
                  key={setting.key}
                  setting={setting}
                  value={values[setting.key as keyof T]}
                  onChange={(value) => onUpdate(setting.key as keyof T, value as T[keyof T])}
                />
              ))}
            </SettingsSection>
          ))
        }
      </div>
    </div>
  );
}
```

---

## 4. File System Abstraction

### Enhanced Virtual File System

```typescript
// packages/core/src/fs/types.ts

/**
 * File system entry
 */
export interface FSEntry {
  /** Entry name */
  name: string;
  
  /** Full path */
  path: string;
  
  /** Entry type */
  type: 'file' | 'directory' | 'symlink';
  
  /** File size in bytes */
  size: number;
  
  /** MIME type */
  mimeType?: string;
  
  /** Created timestamp */
  createdAt: Date;
  
  /** Modified timestamp */
  modifiedAt: Date;
  
  /** Accessed timestamp */
  accessedAt: Date;
  
  /** Permissions */
  permissions?: FSPermissions;
  
  /** Extended attributes */
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
 * Watch options
 */
export interface FSWatchOptions {
  /** Watch recursively */
  recursive?: boolean;
  
  /** Event types to watch */
  events?: Array<'create' | 'modify' | 'delete' | 'rename'>;
}

/**
 * File system API
 */
export interface FileSystemAPI {
  // Basic operations
  readFile(path: string): Promise<ArrayBuffer>;
  readTextFile(path: string): Promise<string>;
  writeFile(path: string, data: ArrayBuffer | string): Promise<void>;
  appendFile(path: string, data: ArrayBuffer | string): Promise<void>;
  deleteFile(path: string): Promise<void>;
  
  // Directory operations
  readDirectory(path: string): Promise<FSEntry[]>;
  createDirectory(path: string, recursive?: boolean): Promise<void>;
  deleteDirectory(path: string, recursive?: boolean): Promise<void>;
  
  // Path operations
  exists(path: string): Promise<boolean>;
  stat(path: string): Promise<FSEntry>;
  rename(oldPath: string, newPath: string): Promise<void>;
  copy(src: string, dest: string): Promise<void>;
  
  // Watching
  watch(path: string, callback: FSWatchCallback, options?: FSWatchOptions): FSWatchHandle;
  
  // Special directories
  getHomeDirectory(): string;
  getDocumentsDirectory(): string;
  getDownloadsDirectory(): string;
  getTempDirectory(): string;
  getAppDataDirectory(appId: string): string;
  
  // Dialogs
  showOpenDialog(options?: OpenDialogOptions): Promise<FSEntry[] | null>;
  showSaveDialog(options?: SaveDialogOptions): Promise<string | null>;
  showDirectoryPicker(options?: DirectoryPickerOptions): Promise<string | null>;
  
  // Recent files
  getRecentFiles(appId: string, limit?: number): Promise<RecentFile[]>;
  addRecentFile(appId: string, path: string): Promise<void>;
  clearRecentFiles(appId: string): Promise<void>;
}

/**
 * Watch callback
 */
export type FSWatchCallback = (event: FSWatchEvent) => void;

/**
 * Watch event
 */
export interface FSWatchEvent {
  type: 'create' | 'modify' | 'delete' | 'rename';
  path: string;
  oldPath?: string; // For rename events
}

/**
 * Watch handle
 */
export interface FSWatchHandle {
  close(): void;
}

/**
 * Recent file entry
 */
export interface RecentFile {
  path: string;
  name: string;
  accessedAt: Date;
  thumbnail?: string;
}
```

### File System Implementation

```typescript
// packages/core/src/fs/virtualFS.ts

import { openDB, IDBPDatabase } from 'idb';

/**
 * IndexedDB-based virtual file system
 */
export class VirtualFileSystem implements FileSystemAPI {
  private db: IDBPDatabase | null = null;
  private watchers = new Map<string, Set<FSWatchCallback>>();
  
  async init(): Promise<void> {
    this.db = await openDB('zos-fs', 1, {
      upgrade(db) {
        // File store
        const files = db.createObjectStore('files', { keyPath: 'path' });
        files.createIndex('parent', 'parent');
        files.createIndex('type', 'type');
        files.createIndex('modifiedAt', 'modifiedAt');
        
        // Recent files store
        const recents = db.createObjectStore('recents', { keyPath: ['appId', 'path'] });
        recents.createIndex('appId', 'appId');
        recents.createIndex('accessedAt', 'accessedAt');
      }
    });
    
    // Initialize default directories
    await this.ensureDirectories();
  }
  
  private async ensureDirectories(): Promise<void> {
    const dirs = [
      '/Home',
      '/Home/Documents',
      '/Home/Downloads',
      '/Home/Desktop',
      '/Home/Pictures',
      '/Home/Music',
      '/Home/Movies',
      '/Applications',
      '/System',
      '/tmp',
    ];
    
    for (const dir of dirs) {
      const exists = await this.exists(dir);
      if (!exists) {
        await this.createDirectory(dir, true);
      }
    }
  }
  
  async readFile(path: string): Promise<ArrayBuffer> {
    const entry = await this.getEntry(path);
    if (!entry) throw new Error(`File not found: ${path}`);
    if (entry.type !== 'file') throw new Error(`Not a file: ${path}`);
    return entry.content;
  }
  
  async readTextFile(path: string): Promise<string> {
    const buffer = await this.readFile(path);
    return new TextDecoder().decode(buffer);
  }
  
  async writeFile(path: string, data: ArrayBuffer | string): Promise<void> {
    const content = typeof data === 'string' 
      ? new TextEncoder().encode(data).buffer 
      : data;
    
    const now = new Date();
    const name = path.split('/').pop() || '';
    const parent = path.substring(0, path.lastIndexOf('/')) || '/';
    
    const entry = await this.getEntry(path);
    
    await this.db!.put('files', {
      path,
      name,
      parent,
      type: 'file',
      size: content.byteLength,
      mimeType: getMimeType(name),
      content,
      createdAt: entry?.createdAt || now,
      modifiedAt: now,
      accessedAt: now,
    });
    
    // Emit watch event
    this.emitWatchEvent(path, entry ? 'modify' : 'create');
  }
  
  async deleteFile(path: string): Promise<void> {
    const entry = await this.getEntry(path);
    if (!entry) throw new Error(`File not found: ${path}`);
    
    await this.db!.delete('files', path);
    this.emitWatchEvent(path, 'delete');
  }
  
  async readDirectory(path: string): Promise<FSEntry[]> {
    const index = this.db!.transaction('files').store.index('parent');
    const entries = await index.getAll(path);
    
    return entries.map(e => ({
      name: e.name,
      path: e.path,
      type: e.type,
      size: e.size,
      mimeType: e.mimeType,
      createdAt: e.createdAt,
      modifiedAt: e.modifiedAt,
      accessedAt: e.accessedAt,
    }));
  }
  
  async createDirectory(path: string, recursive = false): Promise<void> {
    if (recursive) {
      const parts = path.split('/').filter(Boolean);
      let current = '';
      for (const part of parts) {
        current += '/' + part;
        if (!(await this.exists(current))) {
          await this.createSingleDirectory(current);
        }
      }
    } else {
      await this.createSingleDirectory(path);
    }
  }
  
  private async createSingleDirectory(path: string): Promise<void> {
    const now = new Date();
    const name = path.split('/').pop() || '';
    const parent = path.substring(0, path.lastIndexOf('/')) || '/';
    
    await this.db!.put('files', {
      path,
      name,
      parent,
      type: 'directory',
      size: 0,
      createdAt: now,
      modifiedAt: now,
      accessedAt: now,
    });
    
    this.emitWatchEvent(path, 'create');
  }
  
  async exists(path: string): Promise<boolean> {
    const entry = await this.db!.get('files', path);
    return entry !== undefined;
  }
  
  async stat(path: string): Promise<FSEntry> {
    const entry = await this.getEntry(path);
    if (!entry) throw new Error(`Path not found: ${path}`);
    
    return {
      name: entry.name,
      path: entry.path,
      type: entry.type,
      size: entry.size,
      mimeType: entry.mimeType,
      createdAt: entry.createdAt,
      modifiedAt: entry.modifiedAt,
      accessedAt: entry.accessedAt,
    };
  }
  
  watch(path: string, callback: FSWatchCallback, options?: FSWatchOptions): FSWatchHandle {
    if (!this.watchers.has(path)) {
      this.watchers.set(path, new Set());
    }
    this.watchers.get(path)!.add(callback);
    
    return {
      close: () => {
        this.watchers.get(path)?.delete(callback);
      }
    };
  }
  
  private emitWatchEvent(path: string, type: FSWatchEvent['type']): void {
    // Direct watchers
    this.watchers.get(path)?.forEach(cb => cb({ type, path }));
    
    // Parent watchers
    const parent = path.substring(0, path.lastIndexOf('/')) || '/';
    this.watchers.get(parent)?.forEach(cb => cb({ type, path }));
  }
  
  getHomeDirectory(): string { return '/Home'; }
  getDocumentsDirectory(): string { return '/Home/Documents'; }
  getDownloadsDirectory(): string { return '/Home/Downloads'; }
  getTempDirectory(): string { return '/tmp'; }
  getAppDataDirectory(appId: string): string { return `/Home/Library/Application Support/${appId}`; }
  
  // Recent files
  async getRecentFiles(appId: string, limit = 10): Promise<RecentFile[]> {
    const index = this.db!.transaction('recents').store.index('appId');
    const entries = await index.getAll(appId);
    
    return entries
      .sort((a, b) => b.accessedAt.getTime() - a.accessedAt.getTime())
      .slice(0, limit)
      .map(e => ({
        path: e.path,
        name: e.path.split('/').pop() || '',
        accessedAt: e.accessedAt,
      }));
  }
  
  async addRecentFile(appId: string, path: string): Promise<void> {
    await this.db!.put('recents', {
      appId,
      path,
      accessedAt: new Date(),
    });
  }
  
  async clearRecentFiles(appId: string): Promise<void> {
    const index = this.db!.transaction('recents', 'readwrite').store.index('appId');
    let cursor = await index.openCursor(appId);
    
    while (cursor) {
      await cursor.delete();
      cursor = await cursor.continue();
    }
  }
  
  // Dialogs - these dispatch events to the shell
  async showOpenDialog(options?: OpenDialogOptions): Promise<FSEntry[] | null> {
    return new Promise((resolve) => {
      const handler = (e: CustomEvent) => {
        window.removeEventListener('zos:file-dialog-result', handler as EventListener);
        resolve(e.detail?.files || null);
      };
      
      window.addEventListener('zos:file-dialog-result', handler as EventListener);
      window.dispatchEvent(new CustomEvent('zos:file-dialog-open', {
        detail: { ...options, mode: 'open' }
      }));
    });
  }
  
  async showSaveDialog(options?: SaveDialogOptions): Promise<string | null> {
    return new Promise((resolve) => {
      const handler = (e: CustomEvent) => {
        window.removeEventListener('zos:file-dialog-result', handler as EventListener);
        resolve(e.detail?.path || null);
      };
      
      window.addEventListener('zos:file-dialog-result', handler as EventListener);
      window.dispatchEvent(new CustomEvent('zos:file-dialog-open', {
        detail: { ...options, mode: 'save' }
      }));
    });
  }
  
  private async getEntry(path: string) {
    return this.db!.get('files', path);
  }
}

// Singleton
export const fs = new VirtualFileSystem();
```

### File Browser Component

```typescript
// packages/ui/src/file/FileBrowser.tsx

export interface FileBrowserProps {
  /** Initial path */
  initialPath?: string;
  
  /** Selection mode */
  selectionMode?: 'single' | 'multiple' | 'none';
  
  /** File filter */
  filter?: (entry: FSEntry) => boolean;
  
  /** Show hidden files */
  showHidden?: boolean;
  
  /** View mode */
  viewMode?: 'list' | 'grid' | 'columns';
  
  /** On selection change */
  onSelectionChange?: (entries: FSEntry[]) => void;
  
  /** On open file/folder */
  onOpen?: (entry: FSEntry) => void;
  
  /** On path change */
  onPathChange?: (path: string) => void;
}

export function FileBrowser({
  initialPath = '/Home',
  selectionMode = 'single',
  filter,
  showHidden = false,
  viewMode = 'list',
  onSelectionChange,
  onOpen,
  onPathChange,
}: FileBrowserProps) {
  const [currentPath, setCurrentPath] = useState(initialPath);
  const [entries, setEntries] = useState<FSEntry[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Load directory contents
  useEffect(() => {
    loadDirectory(currentPath);
    onPathChange?.(currentPath);
    
    // Watch for changes
    const watcher = fs.watch(currentPath, () => loadDirectory(currentPath));
    return () => watcher.close();
  }, [currentPath]);
  
  const loadDirectory = async (path: string) => {
    const contents = await fs.readDirectory(path);
    
    let filtered = contents.filter(e => showHidden || !e.name.startsWith('.'));
    if (filter) filtered = filtered.filter(filter);
    
    // Sort
    filtered.sort((a, b) => {
      // Directories first
      if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
      
      let cmp = 0;
      switch (sortBy) {
        case 'name': cmp = a.name.localeCompare(b.name); break;
        case 'date': cmp = a.modifiedAt.getTime() - b.modifiedAt.getTime(); break;
        case 'size': cmp = a.size - b.size; break;
      }
      return sortOrder === 'asc' ? cmp : -cmp;
    });
    
    setEntries(filtered);
  };
  
  const handleSelect = (entry: FSEntry, event: React.MouseEvent) => {
    if (selectionMode === 'none') return;
    
    if (selectionMode === 'multiple' && event.metaKey) {
      // Toggle selection
      setSelected(prev => {
        const next = new Set(prev);
        if (next.has(entry.path)) next.delete(entry.path);
        else next.add(entry.path);
        return next;
      });
    } else {
      setSelected(new Set([entry.path]));
    }
  };
  
  const handleOpen = (entry: FSEntry) => {
    if (entry.type === 'directory') {
      setCurrentPath(entry.path);
    } else {
      onOpen?.(entry);
    }
  };
  
  // Report selection changes
  useEffect(() => {
    const selectedEntries = entries.filter(e => selected.has(e.path));
    onSelectionChange?.(selectedEntries);
  }, [selected, entries, onSelectionChange]);
  
  // Context menu
  const { onContextMenu, ContextMenu } = useContextMenu({
    items: [
      { id: 'open', label: 'Open', action: () => selected.size === 1 && handleOpen(entries.find(e => selected.has(e.path))!) },
      { type: 'separator' },
      { id: 'newFolder', label: 'New Folder', action: () => createNewFolder() },
      { type: 'separator' },
      { id: 'delete', label: 'Move to Trash', action: () => deleteSelected() },
    ]
  });
  
  return (
    <div className="flex flex-col h-full" onContextMenu={onContextMenu}>
      {/* Toolbar */}
      <FileBrowserToolbar
        path={currentPath}
        onNavigateUp={() => setCurrentPath(getParentPath(currentPath))}
        onNavigateTo={setCurrentPath}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
      
      {/* Content */}
      {viewMode === 'list' && (
        <FileListView
          entries={entries}
          selected={selected}
          onSelect={handleSelect}
          onOpen={handleOpen}
        />
      )}
      {viewMode === 'grid' && (
        <FileGridView
          entries={entries}
          selected={selected}
          onSelect={handleSelect}
          onOpen={handleOpen}
        />
      )}
      {viewMode === 'columns' && (
        <FileColumnsView
          path={currentPath}
          selected={selected}
          onSelect={handleSelect}
          onOpen={handleOpen}
        />
      )}
      
      <ContextMenu />
    </div>
  );
}
```

---

## 5. Navigation Patterns

### NavigationSplitView

```typescript
// packages/ui/src/navigation/NavigationSplitView.tsx

export interface NavigationSplitViewProps {
  /** Sidebar content */
  sidebar: React.ReactNode;
  
  /** Main content (detail view) */
  content?: React.ReactNode;
  
  /** Inspector panel (optional third column) */
  inspector?: React.ReactNode;
  
  /** Column visibility mode */
  columnVisibility?: NavigationColumnVisibility;
  
  /** Sidebar width */
  sidebarWidth?: number;
  
  /** Inspector width */
  inspectorWidth?: number;
  
  /** Sidebar collapsed state */
  sidebarCollapsed?: boolean;
  
  /** On sidebar collapse change */
  onSidebarCollapsedChange?: (collapsed: boolean) => void;
  
  /** Preferred compact style */
  preferredCompactColumn?: 'sidebar' | 'content';
}

export type NavigationColumnVisibility = 
  | 'all'           // Show all columns
  | 'doubleColumn'  // Sidebar + content
  | 'detailOnly'    // Content only (mobile)
  | 'automatic';    // Based on screen size

export function NavigationSplitView({
  sidebar,
  content,
  inspector,
  columnVisibility = 'automatic',
  sidebarWidth = 250,
  inspectorWidth = 250,
  sidebarCollapsed = false,
  onSidebarCollapsedChange,
  preferredCompactColumn = 'sidebar',
}: NavigationSplitViewProps) {
  const { isMobile, isTablet } = useDevice();
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  
  const collapsed = sidebarCollapsed ?? internalCollapsed;
  const setCollapsed = onSidebarCollapsedChange ?? setInternalCollapsed;
  
  // Calculate visibility based on mode and screen size
  const effectiveVisibility = useMemo(() => {
    if (columnVisibility !== 'automatic') return columnVisibility;
    
    if (isMobile) return 'detailOnly';
    if (isTablet) return 'doubleColumn';
    return 'all';
  }, [columnVisibility, isMobile, isTablet]);
  
  // On mobile, show slide-over navigation
  if (effectiveVisibility === 'detailOnly') {
    return (
      <MobileNavigationLayout
        sidebar={sidebar}
        content={content}
        preferredColumn={preferredCompactColumn}
      />
    );
  }
  
  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <NavigationSidebar
        width={collapsed ? 0 : sidebarWidth}
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
      >
        {sidebar}
      </NavigationSidebar>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        {content}
      </div>
      
      {/* Inspector (optional) */}
      {inspector && effectiveVisibility === 'all' && (
        <NavigationInspector width={inspectorWidth}>
          {inspector}
        </NavigationInspector>
      )}
    </div>
  );
}
```

### Navigation State Management

```typescript
// packages/sdk/src/navigation/NavigationStack.tsx

export interface NavigationPath {
  /** Path segments */
  path: string[];
  
  /** Current data for each segment */
  data: Record<string, unknown>;
}

export interface NavigationStackProps {
  /** Child components */
  children: React.ReactNode;
  
  /** Initial path */
  initialPath?: string[];
}

export interface NavigationContextValue {
  /** Current navigation path */
  path: string[];
  
  /** Navigate to a path */
  navigate: (to: string[], data?: Record<string, unknown>) => void;
  
  /** Push onto navigation stack */
  push: (segment: string, data?: unknown) => void;
  
  /** Pop from navigation stack */
  pop: (count?: number) => void;
  
  /** Replace current segment */
  replace: (segment: string, data?: unknown) => void;
  
  /** Get data for a segment */
  getData: (segment: string) => unknown;
  
  /** Check if can go back */
  canGoBack: boolean;
}

const NavigationContext = createContext<NavigationContextValue | null>(null);

export function NavigationStack({ children, initialPath = [] }: NavigationStackProps) {
  const [path, setPath] = useState<NavigationPath>({
    path: initialPath,
    data: {}
  });
  
  const navigate = useCallback((to: string[], data?: Record<string, unknown>) => {
    setPath({ path: to, data: data || {} });
  }, []);
  
  const push = useCallback((segment: string, data?: unknown) => {
    setPath(prev => ({
      path: [...prev.path, segment],
      data: data ? { ...prev.data, [segment]: data } : prev.data
    }));
  }, []);
  
  const pop = useCallback((count = 1) => {
    setPath(prev => ({
      path: prev.path.slice(0, -count),
      data: prev.data
    }));
  }, []);
  
  const replace = useCallback((segment: string, data?: unknown) => {
    setPath(prev => ({
      path: [...prev.path.slice(0, -1), segment],
      data: data ? { ...prev.data, [segment]: data } : prev.data
    }));
  }, []);
  
  const getData = useCallback((segment: string) => {
    return path.data[segment];
  }, [path.data]);
  
  const value = useMemo<NavigationContextValue>(() => ({
    path: path.path,
    navigate,
    push,
    pop,
    replace,
    getData,
    canGoBack: path.path.length > 0,
  }), [path, navigate, push, pop, replace, getData]);
  
  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation(): NavigationContextValue {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationStack');
  }
  return context;
}
```

### Tab Navigation

```typescript
// packages/ui/src/navigation/TabView.tsx

export interface Tab {
  /** Tab identifier */
  id: string;
  
  /** Tab label */
  label: string;
  
  /** Tab icon */
  icon?: React.ReactNode;
  
  /** Tab content */
  content: React.ReactNode;
  
  /** Whether tab is closable */
  closable?: boolean;
  
  /** Badge */
  badge?: string | number;
}

export interface TabViewProps {
  /** Tabs */
  tabs: Tab[];
  
  /** Active tab ID */
  activeTab?: string;
  
  /** On tab change */
  onTabChange?: (tabId: string) => void;
  
  /** On tab close */
  onTabClose?: (tabId: string) => void;
  
  /** On tab reorder */
  onTabReorder?: (fromIndex: number, toIndex: number) => void;
  
  /** Tab style */
  variant?: 'underline' | 'pills' | 'segment';
  
  /** Position */
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function TabView({
  tabs,
  activeTab,
  onTabChange,
  onTabClose,
  onTabReorder,
  variant = 'underline',
  position = 'top',
}: TabViewProps) {
  const [internalActive, setInternalActive] = useState(tabs[0]?.id);
  const active = activeTab ?? internalActive;
  
  const handleTabChange = (id: string) => {
    onTabChange?.(id);
    if (!activeTab) setInternalActive(id);
  };
  
  const isVertical = position === 'left' || position === 'right';
  
  return (
    <div className={cn('flex h-full', isVertical ? 'flex-row' : 'flex-col')}>
      {(position === 'top' || position === 'left') && (
        <TabBar
          tabs={tabs}
          activeTab={active}
          onTabChange={handleTabChange}
          onTabClose={onTabClose}
          onTabReorder={onTabReorder}
          variant={variant}
          vertical={isVertical}
        />
      )}
      
      <div className="flex-1 min-h-0 min-w-0">
        {tabs.find(t => t.id === active)?.content}
      </div>
      
      {(position === 'bottom' || position === 'right') && (
        <TabBar
          tabs={tabs}
          activeTab={active}
          onTabChange={handleTabChange}
          onTabClose={onTabClose}
          onTabReorder={onTabReorder}
          variant={variant}
          vertical={isVertical}
        />
      )}
    </div>
  );
}
```

### Modal Dialogs

```typescript
// packages/ui/src/navigation/Modal.tsx

export interface ModalProps {
  /** Is modal open */
  isOpen: boolean;
  
  /** Close handler */
  onClose: () => void;
  
  /** Modal title */
  title?: string;
  
  /** Modal content */
  children: React.ReactNode;
  
  /** Modal size */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  
  /** Close on backdrop click */
  closeOnBackdropClick?: boolean;
  
  /** Close on escape */
  closeOnEscape?: boolean;
  
  /** Show close button */
  showCloseButton?: boolean;
  
  /** Footer content */
  footer?: React.ReactNode;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeOnBackdropClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  footer,
}: ModalProps) {
  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);
  
  if (!isOpen) return null;
  
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-[90vw] max-h-[90vh]',
  };
  
  return (
    <Portal>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={closeOnBackdropClick ? onClose : undefined}
      />
      
      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={cn(
          'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50',
          'bg-gray-900 rounded-xl shadow-2xl border border-white/10',
          sizeClasses[size]
        )}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
            {title && <h2 className="text-lg font-semibold text-white">{title}</h2>}
            {showCloseButton && (
              <button onClick={onClose} className="text-white/60 hover:text-white">
                <XIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
        
        {/* Content */}
        <div className="p-6">{children}</div>
        
        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-white/10 flex justify-end gap-3">
            {footer}
          </div>
        )}
      </motion.div>
    </Portal>
  );
}

/**
 * useModal - Easy modal management
 */
export function useModal() {
  const [isOpen, setIsOpen] = useState(false);
  
  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen(prev => !prev),
  };
}

/**
 * Alert dialog (confirmation)
 */
export function AlertDialog({
  isOpen,
  onClose,
  title,
  message,
  confirmLabel = 'OK',
  cancelLabel = 'Cancel',
  onConfirm,
  destructive = false,
}: AlertDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-white/70 mb-6">{message}</p>
      <div className="flex justify-end gap-3">
        <Button variant="ghost" onClick={onClose}>{cancelLabel}</Button>
        <Button 
          variant={destructive ? 'destructive' : 'primary'} 
          onClick={() => { onConfirm(); onClose(); }}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
```

---

## Implementation Plan

### Phase 1: Core Foundation (Week 1-2)

1. **Enhanced `defineApp()`**
   - [ ] Scene system with multiple window types
   - [ ] Platform adaptations
   - [ ] File/URL handlers

2. **`@AppStorage` Implementation**
   - [ ] Reactive storage hooks
   - [ ] Cross-tab synchronization
   - [ ] Type-safe settings factory

### Phase 2: Menu System (Week 2-3)

1. **Menu Infrastructure**
   - [ ] Global menu registry
   - [ ] Keyboard shortcut manager
   - [ ] Action dispatch system

2. **Context Menus**
   - [ ] `useContextMenu` hook
   - [ ] Context menu components
   - [ ] Right-click integration

### Phase 3: File System (Week 3-4)

1. **IndexedDB Backend**
   - [ ] File storage with proper types
   - [ ] Directory operations
   - [ ] Watch API

2. **UI Components**
   - [ ] File browser component
   - [ ] File dialogs (open/save)
   - [ ] Recent files tracking

### Phase 4: Navigation (Week 4-5)

1. **Navigation Components**
   - [ ] `NavigationSplitView`
   - [ ] `TabView`
   - [ ] `Modal` and `AlertDialog`

2. **Navigation State**
   - [ ] `NavigationStack`
   - [ ] Deep linking
   - [ ] History management

### Phase 5: Settings System (Week 5-6)

1. **Settings Schema**
   - [ ] Schema types and validation
   - [ ] Migration support

2. **Settings UI**
   - [ ] `SettingsView` component
   - [ ] Setting controls for all types
   - [ ] Search and filtering

---

## File Structure Summary

```
packages/
├── sdk/
│   ├── src/
│   │   ├── app/
│   │   │   ├── defineApp.ts
│   │   │   ├── scenes.ts
│   │   │   ├── lifecycle.ts
│   │   │   └── registry.ts
│   │   ├── storage/
│   │   │   ├── appStorage.ts
│   │   │   ├── createSettingsHook.ts
│   │   │   └── sync.ts
│   │   ├── menu/
│   │   │   ├── types.ts
│   │   │   ├── hooks.ts
│   │   │   ├── standard.ts
│   │   │   ├── keyboard.ts
│   │   │   └── context.ts
│   │   ├── navigation/
│   │   │   ├── NavigationStack.tsx
│   │   │   ├── hooks.ts
│   │   │   └── types.ts
│   │   ├── settings/
│   │   │   ├── types.ts
│   │   │   ├── schema.ts
│   │   │   └── validation.ts
│   │   └── index.ts
│   └── package.json
├── ui/
│   ├── src/
│   │   ├── navigation/
│   │   │   ├── NavigationSplitView.tsx
│   │   │   ├── TabView.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── index.ts
│   │   ├── file/
│   │   │   ├── FileBrowser.tsx
│   │   │   ├── FileListView.tsx
│   │   │   ├── FileGridView.tsx
│   │   │   ├── FileDialog.tsx
│   │   │   └── index.ts
│   │   ├── settings/
│   │   │   ├── SettingsView.tsx
│   │   │   ├── SettingControls.tsx
│   │   │   └── index.ts
│   │   └── menu/
│   │       ├── ContextMenu.tsx
│   │       ├── MenuDropdown.tsx
│   │       └── index.ts
│   └── package.json
├── core/
│   ├── src/
│   │   ├── fs/
│   │   │   ├── types.ts
│   │   │   ├── virtualFS.ts
│   │   │   ├── operations.ts
│   │   │   └── index.ts
│   │   ├── services/
│   │   │   ├── MenuService.ts
│   │   │   ├── KeyboardService.ts
│   │   │   ├── FileService.ts
│   │   │   └── index.ts
│   │   └── platform/
│   │       ├── detection.ts
│   │       ├── adaptations.ts
│   │       └── index.ts
│   └── package.json
└── runtime/
    └── (existing)
```

---

## Key Interfaces Reference

```typescript
// Quick reference for main exports

// App Definition
export { defineApp } from '@z-os/sdk';
export type { AppDefinition, Scene, SceneProps } from '@z-os/sdk';

// Storage
export { useAppStorage, createSettingsHook } from '@z-os/sdk';

// Menu
export { useMenu, useContextMenu, useKeyboardShortcuts, StandardMenus } from '@z-os/sdk';

// Navigation
export { NavigationStack, useNavigation } from '@z-os/sdk';
export { NavigationSplitView, TabView, Modal, AlertDialog, useModal } from '@z-os/ui';

// File System
export { fs } from '@z-os/core';
export { FileBrowser, FileDialog } from '@z-os/ui';

// Settings
export { SettingsView } from '@z-os/ui';
export type { SettingsSchema, SettingDefinition } from '@z-os/sdk';
```
