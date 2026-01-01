/**
 * File Associations Module
 *
 * Maps file types and URL schemes to applications that can handle them.
 *
 * Usage:
 *
 * ```typescript
 * import { fileAssociations, useFileAssociations } from '@zos/core';
 *
 * // Direct registry access
 * const apps = fileAssociations.getAppsForExtension('.txt');
 * const defaultApp = fileAssociations.getDefaultApp('.pdf');
 * fileAssociations.register({ extensions: ['.xyz'], appId: 'my-app', role: 'editor' });
 *
 * // React hook
 * function MyComponent() {
 *   const { openFile, getAppsForFile, isImage } = useFileAssociations();
 *
 *   const handleOpen = (path: string) => {
 *     if (isImage(path)) {
 *       openFile(path, 'photos');
 *     } else {
 *       openFile(path); // Uses default app
 *     }
 *   };
 * }
 * ```
 */

// Types
export type {
  FileAssociation,
  UrlSchemeHandler,
  FileAssociationRole,
  FileTypeCategory,
  OpenFileOptions,
  OpenUrlOptions,
} from './types';

// Registry
export { fileAssociations } from './FileAssociationRegistry';

// Hook
export { useFileAssociations, type UseFileAssociationsReturn } from './useFileAssociations';

// Default associations (for reference/extension)
export {
  DEFAULT_FILE_ASSOCIATIONS,
  DEFAULT_URL_SCHEMES,
  FILE_TYPE_EXTENSIONS,
} from './defaultAssociations';
