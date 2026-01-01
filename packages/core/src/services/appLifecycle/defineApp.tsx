/**
 * zOS Define App Helper
 *
 * Factory function to define apps with type safety and consistent structure.
 * Simplifies app registration by bundling manifest, component, and hooks.
 */

import type { ComponentType } from 'react';
import type { AppManifest, AppLifecycleHooks, AppComponentProps, AppCapabilities } from './types';

/**
 * App definition configuration
 */
export interface AppDefinition<P extends AppComponentProps = AppComponentProps> {
  /** App manifest */
  manifest: AppManifest;
  /** React component to render */
  component: ComponentType<P>;
  /** Lifecycle hooks */
  hooks?: AppLifecycleHooks;
}

/**
 * Options for defineApp
 */
export interface DefineAppOptions<P extends AppComponentProps = AppComponentProps> {
  /** App manifest */
  manifest: AppManifest;
  /** React component to render */
  component: ComponentType<P>;
  /** Lifecycle hooks */
  hooks?: AppLifecycleHooks;
  /** Default props for the component */
  defaultProps?: Partial<P>;
}

/**
 * Define an app with type safety
 *
 * @param config - App configuration including manifest, component, and hooks
 * @returns App definition object for registration
 *
 * @example
 * ```tsx
 * const NotesApp = defineApp({
 *   manifest: {
 *     id: 'apps.zos.notes',
 *     name: 'Notes',
 *     version: '1.0.0',
 *     icon: '📝',
 *     capabilities: {
 *       canOpenFiles: ['.txt', '.md'],
 *       supportsMultipleWindows: true,
 *     },
 *   },
 *   component: NotesComponent,
 *   hooks: {
 *     onLaunch: async () => {
 *       // Load data
 *     },
 *     onSaveState: () => ({ notes: [] }),
 *     onRestoreState: (state) => {
 *       // Restore state
 *     },
 *   },
 * });
 *
 * // Register with:
 * appRegistry.register(NotesApp.manifest, NotesApp.component, NotesApp.hooks);
 * ```
 */
export function defineApp<P extends AppComponentProps = AppComponentProps>(
  config: DefineAppOptions<P>
): AppDefinition<P> {
  const { manifest, component, hooks, defaultProps } = config;

  // Validate manifest
  if (!manifest.id) {
    throw new Error('App manifest must have an id');
  }
  if (!manifest.name) {
    throw new Error('App manifest must have a name');
  }
  if (!manifest.version) {
    throw new Error('App manifest must have a version');
  }

  // Wrap component with default props if provided
  let wrappedComponent = component;
  if (defaultProps) {
    const WrappedComponent = (props: P) => {
      const Component = component;
      return <Component {...defaultProps} {...props} />;
    };
    WrappedComponent.displayName = `${manifest.name}App`;
    wrappedComponent = WrappedComponent as ComponentType<P>;
  }

  return {
    manifest,
    component: wrappedComponent,
    hooks,
  };
}

/**
 * Builder for creating app definitions with fluent API
 */
export class AppBuilder<P extends AppComponentProps = AppComponentProps> {
  private config: Partial<DefineAppOptions<P>> = {};

  /**
   * Set the app ID
   */
  id(id: string): this {
    this.config.manifest = { ...this.config.manifest, id } as AppManifest;
    return this;
  }

  /**
   * Set the app name
   */
  name(name: string): this {
    this.config.manifest = { ...this.config.manifest, name } as AppManifest;
    return this;
  }

  /**
   * Set the app version
   */
  version(version: string): this {
    this.config.manifest = { ...this.config.manifest, version } as AppManifest;
    return this;
  }

  /**
   * Set the app icon
   */
  icon(icon: React.ReactNode): this {
    this.config.manifest = { ...this.config.manifest, icon } as AppManifest;
    return this;
  }

  /**
   * Set the app description
   */
  description(description: string): this {
    this.config.manifest = { ...this.config.manifest, description } as AppManifest;
    return this;
  }

  /**
   * Set the app category
   */
  category(category: string): this {
    this.config.manifest = { ...this.config.manifest, category } as AppManifest;
    return this;
  }

  /**
   * Set the app capabilities
   */
  capabilities(capabilities: AppCapabilities): this {
    this.config.manifest = { ...this.config.manifest, capabilities } as AppManifest;
    return this;
  }

  /**
   * Set required permissions
   */
  permissions(permissions: string[]): this {
    this.config.manifest = { ...this.config.manifest, permissions } as AppManifest;
    return this;
  }

  /**
   * Set the app component
   */
  component(component: ComponentType<P>): this {
    this.config.component = component;
    return this;
  }

  /**
   * Set lifecycle hooks
   */
  hooks(hooks: AppLifecycleHooks): this {
    this.config.hooks = hooks;
    return this;
  }

  /**
   * Set default props
   */
  defaults(defaultProps: Partial<P>): this {
    this.config.defaultProps = defaultProps;
    return this;
  }

  /**
   * Build the app definition
   */
  build(): AppDefinition<P> {
    if (!this.config.manifest?.id) {
      throw new Error('App must have an id');
    }
    if (!this.config.manifest?.name) {
      throw new Error('App must have a name');
    }
    if (!this.config.manifest?.version) {
      throw new Error('App must have a version');
    }
    if (!this.config.component) {
      throw new Error('App must have a component');
    }

    return defineApp(this.config as DefineAppOptions<P>);
  }
}

/**
 * Create a new app builder
 *
 * @example
 * ```tsx
 * const NotesApp = createApp()
 *   .id('apps.zos.notes')
 *   .name('Notes')
 *   .version('1.0.0')
 *   .icon('📝')
 *   .capabilities({ canOpenFiles: ['.txt', '.md'] })
 *   .component(NotesComponent)
 *   .hooks({
 *     onSaveState: () => ({ notes: [] }),
 *   })
 *   .build();
 * ```
 */
export function createApp<
  P extends AppComponentProps = AppComponentProps
>(): AppBuilder<P> {
  return new AppBuilder<P>();
}

/**
 * Type helper to extract component props from an app definition
 */
export type AppProps<T> = T extends AppDefinition<infer P> ? P : never;
