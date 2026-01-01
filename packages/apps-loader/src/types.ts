/**
 * zOS Apps Loader Types
 *
 * Types specific to the app loading system.
 * Shared types are imported from @z-os/core.
 */

import type { ComponentType } from 'react';
import type {
  AppManifest,
  AppCategory,
  AppPermission,
  WindowConfig,
} from '@z-os/core';

// Re-export shared types for convenience
export type { AppManifest, AppCategory, AppPermission, WindowConfig };

/**
 * Props passed to loaded app components
 */
export interface AppProps {
  onClose?: () => void;
  onFocus?: () => void;
  className?: string;
}

/**
 * A loaded app instance
 */
export interface LoadedApp {
  manifest: AppManifest;
  component: ComponentType<AppProps>;
  source: 'builtin' | 'zos-apps' | 'external';
}

/**
 * App registry structure (from CDN)
 */
export interface AppRegistry {
  apps: Record<string, RegistryEntry>;
  updated: string;
}

/**
 * Registry entry for a loadable app
 */
export interface RegistryEntry {
  name: string;
  version: string;
  cdn: string;
  integrity?: string;
  manifest: AppManifest;
}
