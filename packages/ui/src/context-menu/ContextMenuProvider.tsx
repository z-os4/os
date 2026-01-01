/**
 * Context Menu Provider
 *
 * Global provider that manages context menu state and handles
 * global click events to dismiss the menu.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ContextMenuContext, defaultContextMenuState } from './ContextMenuContext';
import { ContextMenu } from './ContextMenu';
import type { ContextMenuItem, ContextMenuPosition, ContextMenuState } from './types';

export interface ContextMenuProviderProps {
  /** Child components */
  children: React.ReactNode;
}

export function ContextMenuProvider({ children }: ContextMenuProviderProps) {
  const [state, setState] = useState<ContextMenuState>(defaultContextMenuState);

  /** Show the context menu at the given position with the given items */
  const showContextMenu = useCallback(
    (items: ContextMenuItem[], position: ContextMenuPosition) => {
      // Filter out hidden items
      const visibleItems = items.filter((item) => !item.hidden);

      setState({
        isOpen: true,
        position,
        items: visibleItems,
        activeSubmenuPath: [],
        focusedIndex: 0,
      });
    },
    []
  );

  /** Hide the context menu */
  const hideContextMenu = useCallback(() => {
    setState(defaultContextMenuState);
  }, []);

  /** Set the active submenu path */
  const setActiveSubmenuPath = useCallback((path: string[]) => {
    setState((prev) => ({ ...prev, activeSubmenuPath: path }));
  }, []);

  /** Set the focused item index */
  const setFocusedIndex = useCallback((index: number) => {
    setState((prev) => ({ ...prev, focusedIndex: index }));
  }, []);

  // Close menu on escape key or click outside
  useEffect(() => {
    if (!state.isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        hideContextMenu();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Check if click is inside any context menu
      if (!target.closest('[data-context-menu]')) {
        hideContextMenu();
      }
    };

    // Handle scroll to close menu
    const handleScroll = () => {
      hideContextMenu();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('scroll', handleScroll, true);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('scroll', handleScroll, true);
    };
  }, [state.isOpen, hideContextMenu]);

  const contextValue = useMemo(
    () => ({
      state,
      showContextMenu,
      hideContextMenu,
      setActiveSubmenuPath,
      setFocusedIndex,
    }),
    [state, showContextMenu, hideContextMenu, setActiveSubmenuPath, setFocusedIndex]
  );

  return (
    <ContextMenuContext.Provider value={contextValue}>
      {children}
      {state.isOpen && (
        <ContextMenu
          items={state.items}
          position={state.position}
          onClose={hideContextMenu}
        />
      )}
    </ContextMenuContext.Provider>
  );
}
