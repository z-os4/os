/**
 * useMenu Hook
 *
 * Hook for managing app menu bars in zOS. Allows apps to register
 * custom menus that appear in the menu bar when the app is focused.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  AppMenuBar,
  AppMenu,
  AppMenuItem,
  MenuAPI,
  StandardFileMenuOptions,
  StandardEditMenuOptions,
} from '../types';

// Global menu event bus
type MenuEventHandler = (menuBar: AppMenuBar | null) => void;
const menuEventHandlers = new Set<MenuEventHandler>();

/**
 * Subscribe to menu changes
 */
export function subscribeToMenuChanges(handler: MenuEventHandler): () => void {
  menuEventHandlers.add(handler);
  return () => menuEventHandlers.delete(handler);
}

/**
 * Notify all subscribers of menu change
 */
function notifyMenuChange(menuBar: AppMenuBar | null) {
  menuEventHandlers.forEach((handler) => handler(menuBar));
}

/**
 * useMenu - Manage app menu bar
 *
 * @example
 * ```tsx
 * function MyApp() {
 *   const { setMenuBar, createFileMenu } = useMenu();
 *
 *   useEffect(() => {
 *     setMenuBar({
 *       menus: [
 *         createFileMenu({
 *           onNew: () => createNewDoc(),
 *           onSave: () => saveDoc(),
 *         }),
 *         {
 *           id: 'custom',
 *           label: 'Custom',
 *           items: [
 *             { type: 'item', label: 'Do Thing', shortcut: 'Cmd+T', onClick: doThing },
 *           ],
 *         },
 *       ],
 *     });
 *   }, []);
 *
 *   return <div>My App</div>;
 * }
 * ```
 */
export function useMenu(): MenuAPI & {
  createFileMenu: (options?: StandardFileMenuOptions) => AppMenu;
  createEditMenu: (options?: StandardEditMenuOptions) => AppMenu;
  createViewMenu: (items?: AppMenuItem[]) => AppMenu;
  createWindowMenu: () => AppMenu;
  createHelpMenu: (appName: string) => AppMenu;
} {
  const [menuBar, setMenuBarState] = useState<AppMenuBar | null>(null);
  const menuBarRef = useRef<AppMenuBar | null>(null);

  // Update menu bar and notify listeners
  const setMenuBar = useCallback((newMenuBar: AppMenuBar) => {
    menuBarRef.current = newMenuBar;
    setMenuBarState(newMenuBar);
    notifyMenuChange(newMenuBar);
  }, []);

  // Update a specific menu
  const updateMenu = useCallback((menuId: string, updates: Partial<AppMenu>) => {
    if (!menuBarRef.current) return;

    const newMenuBar: AppMenuBar = {
      menus: menuBarRef.current.menus.map((menu) =>
        menu.id === menuId ? { ...menu, ...updates } : menu
      ),
    };
    setMenuBar(newMenuBar);
  }, [setMenuBar]);

  // Enable/disable menu item
  const setItemEnabled = useCallback((menuId: string, itemId: string, enabled: boolean) => {
    if (!menuBarRef.current) return;

    const newMenuBar: AppMenuBar = {
      menus: menuBarRef.current.menus.map((menu) =>
        menu.id === menuId
          ? {
              ...menu,
              items: menu.items.map((item) =>
                item.id === itemId ? { ...item, disabled: !enabled } : item
              ),
            }
          : menu
      ),
    };
    setMenuBar(newMenuBar);
  }, [setMenuBar]);

  // Set item checked state
  const setItemChecked = useCallback((menuId: string, itemId: string, checked: boolean) => {
    if (!menuBarRef.current) return;

    const newMenuBar: AppMenuBar = {
      menus: menuBarRef.current.menus.map((menu) =>
        menu.id === menuId
          ? {
              ...menu,
              items: menu.items.map((item) =>
                item.id === itemId ? { ...item, checked } : item
              ),
            }
          : menu
      ),
    };
    setMenuBar(newMenuBar);
  }, [setMenuBar]);

  // Get current menu bar
  const getMenuBar = useCallback(() => menuBarRef.current, []);

  // Clear menu on unmount
  useEffect(() => {
    return () => {
      notifyMenuChange(null);
    };
  }, []);

  // Standard File menu
  const createFileMenu = useCallback((options: StandardFileMenuOptions = {}): AppMenu => {
    const items: AppMenuItem[] = [];

    if (options.onNew) {
      items.push({ type: 'item', id: 'new', label: 'New', shortcut: '⌘N', onClick: options.onNew });
    }
    if (options.onOpen) {
      items.push({ type: 'item', id: 'open', label: 'Open...', shortcut: '⌘O', onClick: options.onOpen });
    }
    if (options.onNew || options.onOpen) {
      items.push({ type: 'separator' });
    }
    if (options.onSave) {
      items.push({ type: 'item', id: 'save', label: 'Save', shortcut: '⌘S', onClick: options.onSave });
    }
    if (options.onSaveAs) {
      items.push({ type: 'item', id: 'saveas', label: 'Save As...', shortcut: '⇧⌘S', onClick: options.onSaveAs });
    }
    if (options.onSave || options.onSaveAs) {
      items.push({ type: 'separator' });
    }
    if (options.onPrint) {
      items.push({ type: 'item', id: 'print', label: 'Print...', shortcut: '⌘P', onClick: options.onPrint });
      items.push({ type: 'separator' });
    }
    if (options.onClose) {
      items.push({ type: 'item', id: 'close', label: 'Close Window', shortcut: '⌘W', onClick: options.onClose });
    }

    return { id: 'file', label: 'File', items };
  }, []);

  // Standard Edit menu
  const createEditMenu = useCallback((options: StandardEditMenuOptions = {}): AppMenu => {
    const items: AppMenuItem[] = [];

    if (options.onUndo) {
      items.push({ type: 'item', id: 'undo', label: 'Undo', shortcut: '⌘Z', onClick: options.onUndo });
    }
    if (options.onRedo) {
      items.push({ type: 'item', id: 'redo', label: 'Redo', shortcut: '⇧⌘Z', onClick: options.onRedo });
    }
    if (options.onUndo || options.onRedo) {
      items.push({ type: 'separator' });
    }
    if (options.onCut) {
      items.push({ type: 'item', id: 'cut', label: 'Cut', shortcut: '⌘X', onClick: options.onCut });
    }
    if (options.onCopy) {
      items.push({ type: 'item', id: 'copy', label: 'Copy', shortcut: '⌘C', onClick: options.onCopy });
    }
    if (options.onPaste) {
      items.push({ type: 'item', id: 'paste', label: 'Paste', shortcut: '⌘V', onClick: options.onPaste });
    }
    if (options.onSelectAll) {
      items.push({ type: 'separator' });
      items.push({ type: 'item', id: 'selectall', label: 'Select All', shortcut: '⌘A', onClick: options.onSelectAll });
    }
    if (options.onFind) {
      items.push({ type: 'separator' });
      items.push({ type: 'item', id: 'find', label: 'Find...', shortcut: '⌘F', onClick: options.onFind });
    }

    return { id: 'edit', label: 'Edit', items };
  }, []);

  // Standard View menu
  const createViewMenu = useCallback((customItems: AppMenuItem[] = []): AppMenu => {
    return {
      id: 'view',
      label: 'View',
      items: customItems.length > 0 ? customItems : [
        { type: 'item', id: 'zoomin', label: 'Zoom In', shortcut: '⌘+' },
        { type: 'item', id: 'zoomout', label: 'Zoom Out', shortcut: '⌘-' },
        { type: 'item', id: 'actualsize', label: 'Actual Size', shortcut: '⌘0' },
      ],
    };
  }, []);

  // Standard Window menu
  const createWindowMenu = useCallback((): AppMenu => {
    return {
      id: 'window',
      label: 'Window',
      items: [
        { type: 'item', id: 'minimize', label: 'Minimize', shortcut: '⌘M' },
        { type: 'item', id: 'zoom', label: 'Zoom' },
        { type: 'separator' },
        { type: 'item', id: 'front', label: 'Bring All to Front' },
      ],
    };
  }, []);

  // Standard Help menu
  const createHelpMenu = useCallback((appName: string): AppMenu => {
    return {
      id: 'help',
      label: 'Help',
      items: [
        { type: 'item', id: 'help', label: `${appName} Help` },
      ],
    };
  }, []);

  return {
    setMenuBar,
    updateMenu,
    setItemEnabled,
    setItemChecked,
    getMenuBar,
    createFileMenu,
    createEditMenu,
    createViewMenu,
    createWindowMenu,
    createHelpMenu,
  };
}

export default useMenu;
