/**
 * useContextMenu Hook
 *
 * Provides programmatic access to the context menu system.
 *
 * @example
 * ```tsx
 * const { showContextMenu, hideContextMenu, isOpen } = useContextMenu();
 *
 * const handleRightClick = (e: MouseEvent) => {
 *   e.preventDefault();
 *   showContextMenu(menuItems, { x: e.clientX, y: e.clientY });
 * };
 * ```
 */

import { useCallback } from 'react';
import { useContextMenuContext } from './ContextMenuContext';
import type { ContextMenuItem, ContextMenuPosition } from './types';

export interface UseContextMenuReturn {
  /** Whether the context menu is currently open */
  isOpen: boolean;
  /** Current position of the context menu */
  position: ContextMenuPosition;
  /** Current menu items */
  items: ContextMenuItem[];
  /** Show the context menu at a position with the given items */
  showContextMenu: (items: ContextMenuItem[], position: ContextMenuPosition) => void;
  /** Hide the context menu */
  hideContextMenu: () => void;
}

export function useContextMenu(): UseContextMenuReturn {
  const { state, showContextMenu, hideContextMenu } = useContextMenuContext();

  return {
    isOpen: state.isOpen,
    position: state.position,
    items: state.items,
    showContextMenu,
    hideContextMenu,
  };
}

/**
 * Hook for creating a right-click handler that shows a context menu
 *
 * @example
 * ```tsx
 * const handleContextMenu = useContextMenuHandler(menuItems);
 *
 * return <div onContextMenu={handleContextMenu}>Right-click me</div>;
 * ```
 */
export function useContextMenuHandler(items: ContextMenuItem[]) {
  const { showContextMenu } = useContextMenu();

  return useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      showContextMenu(items, { x: e.clientX, y: e.clientY });
    },
    [items, showContextMenu]
  );
}
