/**
 * defineApp - Create a zOS application definition
 * 
 * The main entry point for defining zOS applications. Similar to SwiftUI's @main App.
 */

import type {
  AppDefinition,
  AppManifest,
  RegisteredApp,
  Scene,
  WindowSceneConfig,
} from './types';
import { AppRegistry } from './registry';

/**
 * Default window configuration
 */
const DEFAULT_WINDOW_CONFIG: WindowSceneConfig = {
  defaultSize: { width: 700, height: 500 },
  minSize: { width: 300, height: 200 },
  resizable: true,
  style: 'default',
  titlebar: 'default',
  background: 'blur',
  multipleInstances: false,
  showInDock: true,
  rememberFrame: false,
  showTrafficLights: true,
  fullSizeContentView: false,
};

/**
 * Default manifest values
 */
const DEFAULT_MANIFEST: Partial<AppManifest> = {
  category: 'other',
  permissions: [],
  dependencies: [],
  main: 'index.tsx',
};

/**
 * Normalize a manifest with defaults
 */
function normalizeManifest(manifest: AppManifest): Required<Pick<AppManifest, 'identifier' | 'name' | 'version' | 'category'>> & AppManifest {
  return {
    ...DEFAULT_MANIFEST,
    ...manifest,
    category: manifest.category || 'other',
  } as Required<Pick<AppManifest, 'identifier' | 'name' | 'version' | 'category'>> & AppManifest;
}

/**
 * Normalize a scene with defaults
 */
function normalizeScene(scene: Scene): Scene {
  return {
    ...scene,
    window: {
      ...DEFAULT_WINDOW_CONFIG,
      ...scene.window,
      // Override defaults based on scene type
      ...(scene.type === 'settings' && {
        resizable: false,
        style: 'system',
        showInDock: false,
        multipleInstances: false,
      }),
      ...(scene.type === 'about' && {
        resizable: false,
        style: 'system',
        showInDock: false,
        multipleInstances: false,
        defaultSize: { width: 300, height: 200 },
      }),
      ...(scene.type === 'utility' && {
        titlebar: 'inset',
        showInDock: false,
      }),
    },
  };
}

/**
 * Normalize an app definition
 */
export function normalizeAppDefinition<TSettings>(
  definition: AppDefinition<TSettings>
): RegisteredApp<TSettings> {
  // Validate required fields
  if (!definition.manifest?.identifier) {
    throw new Error('App manifest must have an identifier');
  }
  if (!definition.manifest?.name) {
    throw new Error('App manifest must have a name');
  }
  if (!definition.manifest?.version) {
    throw new Error('App manifest must have a version');
  }
  if (!definition.scenes || definition.scenes.length === 0) {
    throw new Error('App must have at least one scene');
  }
  
  // Check for main scene
  const hasMainScene = definition.scenes.some(s => s.isMain);
  if (!hasMainScene) {
    // Mark first scene as main if none specified
    definition.scenes[0].isMain = true;
  }
  
  return {
    ...definition,
    manifest: normalizeManifest(definition.manifest),
    scenes: definition.scenes.map(normalizeScene),
    registeredAt: new Date(),
  };
}

/**
 * Define a zOS application
 * 
 * Creates a complete app definition with all necessary configuration.
 * This is the main entry point for creating zOS apps.
 * 
 * @example
 * ```tsx
 * // Simple app
 * export default defineApp({
 *   manifest: {
 *     identifier: 'ai.hanzo.calculator',
 *     name: 'Calculator',
 *     version: '1.0.0',
 *     category: 'utilities',
 *   },
 *   scenes: [
 *     {
 *       id: 'main',
 *       type: 'window',
 *       title: 'Calculator',
 *       component: CalculatorApp,
 *       isMain: true,
 *       window: {
 *         defaultSize: { width: 280, height: 400 },
 *         resizable: false,
 *       }
 *     }
 *   ],
 *   icon: CalculatorIcon,
 * });
 * 
 * // Document-based app with settings
 * export default defineApp({
 *   manifest: {
 *     identifier: 'ai.hanzo.textedit',
 *     name: 'TextEdit',
 *     version: '2.0.0',
 *     category: 'productivity',
 *     permissions: ['files.read', 'files.write'],
 *   },
 *   scenes: [
 *     {
 *       id: 'document',
 *       type: 'document',
 *       title: (props) => props.documentName || 'Untitled',
 *       component: DocumentEditor,
 *       isMain: true,
 *       window: {
 *         multipleInstances: true,
 *         rememberFrame: true,
 *       }
 *     },
 *     {
 *       id: 'settings',
 *       type: 'settings',
 *       title: 'TextEdit Settings',
 *       component: SettingsScene,
 *       shortcut: '⌘,',
 *     }
 *   ],
 *   menuBar: {
 *     menus: [
 *       {
 *         id: 'format',
 *         label: 'Format',
 *         items: [
 *           { id: 'bold', label: 'Bold', shortcut: '⌘B', action: 'format.bold' },
 *           { id: 'italic', label: 'Italic', shortcut: '⌘I', action: 'format.italic' },
 *         ]
 *       }
 *     ],
 *     standardMenus: ['file', 'edit', 'view', 'window', 'help'],
 *   },
 *   settings: textEditSettings,
 *   defaultSettings: {
 *     fontSize: 14,
 *     fontFamily: 'SF Mono',
 *     wordWrap: true,
 *   },
 *   fileHandlers: [
 *     { extensions: ['txt', 'md', 'rtf'], role: 'editor', action: 'open' }
 *   ],
 *   lifecycle: {
 *     onOpenFile: (path) => {
 *       // Handle file open
 *     }
 *   }
 * });
 * ```
 */
export function defineApp<TSettings = Record<string, unknown>>(
  definition: AppDefinition<TSettings>
): RegisteredApp<TSettings> {
  // Normalize the definition
  const normalized = normalizeAppDefinition(definition);
  
  // Register with the app registry
  AppRegistry.register(normalized);
  
  // Log registration (dev only)
  if (process.env.NODE_ENV === 'development') {
    console.log(`[zOS] Registered app: ${normalized.manifest.identifier} v${normalized.manifest.version}`);
  }
  
  return normalized;
}

export default defineApp;
