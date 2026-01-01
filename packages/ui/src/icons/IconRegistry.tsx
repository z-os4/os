import React from 'react';
import type { ComponentType } from 'react';

/**
 * Icon component props that registered icons must accept
 */
export interface RegisteredIconProps {
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Type for a registered icon component
 */
export type RegisteredIconComponent = ComponentType<RegisteredIconProps>;

/**
 * IconRegistry - Registry for custom application icons
 *
 * Allows applications to register their own icons that can be
 * looked up by application ID.
 *
 * @example
 * ```tsx
 * import { iconRegistry, AppIcon } from '@z-os/ui/icons';
 *
 * // Register a custom icon
 * const MyAppIcon: React.FC<{ className?: string }> = ({ className }) => (
 *   <svg className={className} viewBox="0 0 64 64">
 *     <rect width="64" height="64" rx="12" fill="#FF6B6B" />
 *     <text x="32" y="40" textAnchor="middle" fill="white" fontSize="24">M</text>
 *   </svg>
 * );
 *
 * iconRegistry.register('com.myapp', MyAppIcon);
 *
 * // Now AppIcon will use the registered icon
 * <AppIcon appId="com.myapp" size={64} />
 * ```
 */
class IconRegistryClass {
  private icons: Map<string, RegisteredIconComponent> = new Map();

  /**
   * Register an icon for an application
   *
   * @param appId - Unique application identifier (e.g., 'com.hanzo.terminal')
   * @param icon - React component that renders the icon
   */
  register(appId: string, icon: RegisteredIconComponent): void {
    this.icons.set(appId, icon);
  }

  /**
   * Unregister an icon
   *
   * @param appId - Application identifier to unregister
   */
  unregister(appId: string): void {
    this.icons.delete(appId);
  }

  /**
   * Get a registered icon by application ID
   *
   * @param appId - Application identifier
   * @returns The registered icon component, or undefined if not found
   */
  get(appId: string): RegisteredIconComponent | undefined {
    return this.icons.get(appId);
  }

  /**
   * Check if an icon is registered
   *
   * @param appId - Application identifier
   * @returns True if the icon is registered
   */
  has(appId: string): boolean {
    return this.icons.has(appId);
  }

  /**
   * Get all registered application IDs
   *
   * @returns Array of registered application IDs
   */
  list(): string[] {
    return Array.from(this.icons.keys());
  }

  /**
   * Clear all registered icons
   */
  clear(): void {
    this.icons.clear();
  }

  /**
   * Register multiple icons at once
   *
   * @param icons - Map of appId to icon component
   */
  registerAll(icons: Record<string, RegisteredIconComponent>): void {
    for (const [appId, icon] of Object.entries(icons)) {
      this.register(appId, icon);
    }
  }
}

/**
 * Global icon registry instance
 */
export const iconRegistry = new IconRegistryClass();

// Re-export the class type for type annotations
export type { IconRegistryClass };
