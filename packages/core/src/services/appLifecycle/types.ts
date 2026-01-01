/**
 * zOS App Lifecycle Types
 *
 * Type definitions for app registration, lifecycle management, and state persistence.
 */

import type { ReactNode, ComponentType } from 'react';

/**
 * App status in the lifecycle
 */
export type AppStatus = 'registered' | 'launching' | 'running' | 'suspended' | 'terminating';

/**
 * Capabilities an app can declare
 */
export interface AppCapabilities {
  /** File extensions this app can open (e.g., ['.txt', '.md']) */
  canOpenFiles?: string[];
  /** URL schemes this app handles (e.g., ['mailto', 'tel']) */
  urlSchemes?: string[];
  /** File extensions this app can export to */
  canExportFiles?: string[];
  /** Whether this app supports printing */
  canPrint?: boolean;
  /** Whether this app supports multiple window instances */
  supportsMultipleWindows?: boolean;
}

/**
 * App manifest - static metadata about an app
 */
export interface AppManifest {
  /** Unique identifier (e.g., 'apps.zos.notes') */
  id: string;
  /** Display name */
  name: string;
  /** Semantic version */
  version: string;
  /** Icon (React node - can be emoji string or component) */
  icon?: ReactNode;
  /** App description */
  description?: string;
  /** Category for grouping */
  category?: string;
  /** Declared capabilities */
  capabilities?: AppCapabilities;
  /** Required permissions */
  permissions?: string[];
}

/**
 * Lifecycle hooks that apps can implement
 */
export interface AppLifecycleHooks {
  /** Called when app is launched (can be async for initialization) */
  onLaunch?: () => void | Promise<void>;
  /** Called when app window becomes active/focused */
  onActivate?: () => void;
  /** Called when app window loses focus */
  onDeactivate?: () => void;
  /** Called when app is being terminated (can be async for cleanup) */
  onTerminate?: () => void | Promise<void>;
  /** Called to save app state for persistence */
  onSaveState?: () => unknown;
  /** Called to restore app state from persistence */
  onRestoreState?: (state: unknown) => void;
}

/**
 * Registered app entry in the registry
 */
export interface RegisteredApp {
  /** App manifest */
  manifest: AppManifest;
  /** Current status */
  status: AppStatus;
  /** React component to render */
  component: ComponentType<AppComponentProps>;
  /** Lifecycle hooks */
  hooks?: AppLifecycleHooks;
  /** Active window instance IDs */
  instances: string[];
  /** Timestamp of last activation */
  lastActive?: number;
}

/**
 * Props passed to app components
 */
export interface AppComponentProps {
  /** Window instance ID */
  instanceId: string;
  /** Data passed when launching (e.g., file path) */
  launchData?: unknown;
  /** Callback to request window close */
  onRequestClose?: () => void;
}

/**
 * Launch options when starting an app
 */
export interface LaunchOptions {
  /** Data to pass to the app */
  data?: unknown;
  /** Force new window even if app is running */
  forceNewWindow?: boolean;
  /** Restore from saved state */
  restoreState?: boolean;
}

/**
 * App state saved to localStorage
 */
export interface SavedAppState {
  /** App ID */
  appId: string;
  /** Saved state data */
  state: unknown;
  /** When state was saved */
  savedAt: number;
}
