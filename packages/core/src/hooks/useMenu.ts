import { useEffect, useCallback, useMemo } from 'react';
import { useMenuContext, AppMenuConfig, Menu, MenuItem, MenuActionEvent } from '../contexts/MenuContext';
import { menuRegistry } from '../services/menuRegistry';

export interface UseMenuOptions {
  /** App identifier */
  appId: string;
  /** App display name */
  appName: string;
  /** Initial menu configuration */
  menus?: Menu[];
  /** Action handler for menu item clicks */
  onAction?: (event: MenuActionEvent) => void;
  /** Auto-register on mount and unregister on unmount */
  autoRegister?: boolean;
}

export interface UseMenuReturn {
  /** Set the complete menu configuration */
  setMenus: (menus: Menu[]) => void;
  /** Add a menu item to a specific menu */
  addMenuItem: (menuId: string, item: MenuItem, position?: number) => boolean;
  /** Remove a menu item from a specific menu */
  removeMenuItem: (menuId: string, itemId: string) => boolean;
  /** Update a menu item */
  updateMenuItem: (menuId: string, itemId: string, updates: Partial<MenuItem>) => boolean;
  /** Enable/disable a menu item */
  setItemEnabled: (menuId: string, itemId: string, enabled: boolean) => boolean;
  /** Set checked state of a menu item */
  setItemChecked: (menuId: string, itemId: string, checked: boolean) => boolean;
  /** Get the current menu configuration for this app */
  getMenus: () => Menu[] | undefined;
  /** Check if this app's menus are currently active */
  isActive: boolean;
  /** Activate this app's menus */
  activate: () => void;
}

/**
 * Hook for managing app menus
 * 
 * @example
 * ```tsx
 * const { setMenus, addMenuItem } = useMenu({
 *   appId: 'myapp',
 *   appName: 'My App',
 *   menus: createStandardFileMenu({ onNew: handleNew }),
 *   onAction: (event) => console.log('Menu action:', event.itemId),
 * });
 * ```
 */
export function useMenu(options: UseMenuOptions): UseMenuReturn {
  const {
    appId,
    appName,
    menus: initialMenus,
    onAction,
    autoRegister = true,
  } = options;

  const {
    activeAppId,
    registerMenus,
    unregisterMenus,
    setActiveApp,
    addMenuItem: contextAddMenuItem,
    removeMenuItem: contextRemoveMenuItem,
    updateMenuItem: contextUpdateMenuItem,
    registerActionHandler,
    unregisterActionHandler,
  } = useMenuContext();

  // Register/unregister on mount/unmount
  useEffect(() => {
    if (!autoRegister) return;

    if (initialMenus) {
      registerMenus({
        appId,
        appName,
        menus: initialMenus,
      });
    }

    return () => {
      unregisterMenus(appId);
    };
  }, [appId, appName, autoRegister]); // intentionally exclude initialMenus to avoid re-registering

  // Register action handler
  useEffect(() => {
    if (onAction) {
      registerActionHandler(appId, onAction);
    }
    return () => {
      unregisterActionHandler(appId);
    };
  }, [appId, onAction, registerActionHandler, unregisterActionHandler]);

  const setMenus = useCallback((menus: Menu[]) => {
    registerMenus({
      appId,
      appName,
      menus,
    });
  }, [appId, appName, registerMenus]);

  const addMenuItem = useCallback((menuId: string, item: MenuItem, position?: number) => {
    return contextAddMenuItem(appId, menuId, item, position);
  }, [appId, contextAddMenuItem]);

  const removeMenuItem = useCallback((menuId: string, itemId: string) => {
    return contextRemoveMenuItem(appId, menuId, itemId);
  }, [appId, contextRemoveMenuItem]);

  const updateMenuItem = useCallback((menuId: string, itemId: string, updates: Partial<MenuItem>) => {
    return contextUpdateMenuItem(appId, menuId, itemId, updates);
  }, [appId, contextUpdateMenuItem]);

  const setItemEnabled = useCallback((menuId: string, itemId: string, enabled: boolean) => {
    return contextUpdateMenuItem(appId, menuId, itemId, { disabled: !enabled });
  }, [appId, contextUpdateMenuItem]);

  const setItemChecked = useCallback((menuId: string, itemId: string, checked: boolean) => {
    return contextUpdateMenuItem(appId, menuId, itemId, { checked });
  }, [appId, contextUpdateMenuItem]);

  const getMenus = useCallback(() => {
    const config = menuRegistry.getConfig(appId);
    return config?.menus;
  }, [appId]);

  const isActive = useMemo(() => activeAppId === appId, [activeAppId, appId]);

  const activate = useCallback(() => {
    setActiveApp(appId);
  }, [appId, setActiveApp]);

  return {
    setMenus,
    addMenuItem,
    removeMenuItem,
    updateMenuItem,
    setItemEnabled,
    setItemChecked,
    getMenus,
    isActive,
    activate,
  };
}

/**
 * Hook for activating an app's menus when it gains focus
 */
export function useMenuActivation(appId: string): void {
  const { setActiveApp } = useMenuContext();

  useEffect(() => {
    setActiveApp(appId);
    return () => {
      // Don't deactivate on unmount - let another app take over
    };
  }, [appId, setActiveApp]);
}

// Re-export types
export type { AppMenuConfig, Menu, MenuItem, MenuActionEvent };
