/**
 * zOS App Framework
 * 
 * SwiftUI/Flutter-inspired framework for building native-feeling zOS applications.
 * 
 * @example
 * ```tsx
 * import { defineApp, useAppStorage, useNavigation } from '@z-os/sdk/framework';
 * 
 * export default defineApp({
 *   manifest: {
 *     identifier: 'ai.hanzo.myapp',
 *     name: 'My App',
 *     version: '1.0.0',
 *     category: 'productivity',
 *   },
 *   scenes: [
 *     {
 *       id: 'main',
 *       type: 'window',
 *       title: 'My App',
 *       component: MainScene,
 *       isMain: true,
 *     }
 *   ],
 * });
 * ```
 */

// ============================================================================
// Types
// ============================================================================

export * from './types';

// ============================================================================
// App Definition
// ============================================================================

export { defineApp, normalizeAppDefinition } from './defineApp';
export { AppRegistry } from './registry';

// ============================================================================
// Storage (to be implemented)
// ============================================================================

// export { useAppStorage, createSettingsHook } from './storage';

// ============================================================================
// Menu (to be implemented)
// ============================================================================

// export { useContextMenu, useKeyboardShortcuts, StandardMenus } from './menu';

// ============================================================================
// Navigation (to be implemented)
// ============================================================================

// export { NavigationStack, useNavigation } from './navigation';
