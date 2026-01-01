/**
 * Context Menu System
 *
 * A comprehensive context menu system for zOS with support for:
 * - Nested submenus
 * - Icons and keyboard shortcuts
 * - Disabled states and separators
 * - Checkbox and radio items
 * - Touch device support (long press)
 *
 * @example
 * ```tsx
 * // 1. Wrap your app with the provider
 * <ContextMenuProvider>
 *   <App />
 * </ContextMenuProvider>
 *
 * // 2. Use ContextMenuTrigger for declarative usage
 * <ContextMenuTrigger items={[
 *   { id: 'open', label: 'Open', icon: <FolderOpen />, onClick: handleOpen },
 *   { id: 'sep1', type: 'separator' },
 *   { id: 'delete', label: 'Delete', icon: <Trash />, onClick: handleDelete, destructive: true },
 * ]}>
 *   <FileIcon file={file} />
 * </ContextMenuTrigger>
 *
 * // 3. Or use the hook for programmatic control
 * const { showContextMenu, hideContextMenu } = useContextMenu();
 *
 * const handleRightClick = (e: MouseEvent) => {
 *   e.preventDefault();
 *   showContextMenu(items, { x: e.clientX, y: e.clientY });
 * };
 * ```
 */

// Core components
export { ContextMenuProvider } from './ContextMenuProvider';
export { ContextMenu } from './ContextMenu';
export { ContextMenuTrigger } from './ContextMenuTrigger';

// Hooks
export { useContextMenu, useContextMenuHandler } from './useContextMenu';

// Context (for advanced usage)
export { ContextMenuContext, useContextMenuContext } from './ContextMenuContext';

// Templates
export {
  createFileContextMenu,
  createTextContextMenu,
  createImageContextMenu,
  createDesktopContextMenu,
} from './templates';

// Types
export type {
  ContextMenuItem,
  ContextMenuActionItem,
  ContextMenuSeparator,
  ContextMenuCheckboxItem,
  ContextMenuRadioGroup,
  ContextMenuLabel,
  ContextMenuPosition,
  ContextMenuState,
  ContextMenuContextValue,
  ContextMenuTriggerProps,
  ContextMenuProps,
} from './types';

export type {
  FileInfo,
  ImageInfo,
  FileContextMenuHandlers,
  TextContextMenuHandlers,
  ImageContextMenuHandlers,
  DesktopContextMenuHandlers,
} from './templates';
