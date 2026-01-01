import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { menuRegistry, AppMenuConfig, Menu, MenuItem, MenuActionEvent } from '../services/menuRegistry';

export interface MenuContextType {
  /** Current active menu configuration */
  activeConfig: AppMenuConfig | null;
  /** Currently active app ID */
  activeAppId: string | null;
  /** Register menus for an app */
  registerMenus: (config: AppMenuConfig) => void;
  /** Unregister menus for an app */
  unregisterMenus: (appId: string) => void;
  /** Set which app's menus should be displayed */
  setActiveApp: (appId: string | null) => void;
  /** Add a menu item to a menu */
  addMenuItem: (appId: string, menuId: string, item: MenuItem, position?: number) => boolean;
  /** Remove a menu item from a menu */
  removeMenuItem: (appId: string, menuId: string, itemId: string) => boolean;
  /** Update a menu item */
  updateMenuItem: (appId: string, menuId: string, itemId: string, updates: Partial<MenuItem>) => boolean;
  /** Execute a menu action */
  executeAction: (appId: string, menuId: string, itemId: string) => void;
  /** Register an action handler for an app */
  registerActionHandler: (appId: string, handler: (event: MenuActionEvent) => void) => void;
  /** Unregister an action handler */
  unregisterActionHandler: (appId: string) => void;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export interface MenuProviderProps {
  children: ReactNode;
}

export const MenuProvider: React.FC<MenuProviderProps> = ({ children }) => {
  const [activeConfig, setActiveConfig] = useState<AppMenuConfig | null>(null);
  const [activeAppId, setActiveAppIdState] = useState<string | null>(null);

  // Subscribe to menu registry changes
  useEffect(() => {
    const unsubscribe = menuRegistry.subscribe((config) => {
      setActiveConfig(config);
      setActiveAppIdState(menuRegistry.getActiveAppId());
    });
    return unsubscribe;
  }, []);

  // Set up keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Build shortcut string from event
      const parts: string[] = [];
      if (event.ctrlKey) parts.push('\u2303'); // Control
      if (event.altKey) parts.push('\u2325');  // Option
      if (event.shiftKey) parts.push('\u21E7'); // Shift
      if (event.metaKey) parts.push('\u2318');  // Command

      // Map key to display character
      const keyMap: Record<string, string> = {
        'Escape': '\u238B',
        'Enter': '\u21A9',
        'Backspace': '\u232B',
        'Delete': '\u2326',
        'Tab': '\u21E5',
        'ArrowUp': '\u2191',
        'ArrowDown': '\u2193',
        'ArrowLeft': '\u2190',
        'ArrowRight': '\u2192',
      };

      const key = keyMap[event.key] || event.key.toUpperCase();
      parts.push(key);

      const shortcut = parts.join('');

      if (menuRegistry.handleShortcut(shortcut)) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const registerMenus = useCallback((config: AppMenuConfig) => {
    menuRegistry.register(config);
  }, []);

  const unregisterMenus = useCallback((appId: string) => {
    menuRegistry.unregister(appId);
  }, []);

  const setActiveApp = useCallback((appId: string | null) => {
    menuRegistry.setActiveApp(appId);
  }, []);

  const addMenuItem = useCallback((appId: string, menuId: string, item: MenuItem, position?: number) => {
    return menuRegistry.addMenuItem(appId, menuId, item, position);
  }, []);

  const removeMenuItem = useCallback((appId: string, menuId: string, itemId: string) => {
    return menuRegistry.removeMenuItem(appId, menuId, itemId);
  }, []);

  const updateMenuItem = useCallback((appId: string, menuId: string, itemId: string, updates: Partial<MenuItem>) => {
    return menuRegistry.updateMenuItem(appId, menuId, itemId, updates);
  }, []);

  const executeAction = useCallback((appId: string, menuId: string, itemId: string) => {
    menuRegistry.executeAction(appId, menuId, itemId);
  }, []);

  const registerActionHandler = useCallback((appId: string, handler: (event: MenuActionEvent) => void) => {
    menuRegistry.registerActionHandler(appId, handler);
  }, []);

  const unregisterActionHandler = useCallback((appId: string) => {
    menuRegistry.unregisterActionHandler(appId);
  }, []);

  return (
    <MenuContext.Provider value={{
      activeConfig,
      activeAppId,
      registerMenus,
      unregisterMenus,
      setActiveApp,
      addMenuItem,
      removeMenuItem,
      updateMenuItem,
      executeAction,
      registerActionHandler,
      unregisterActionHandler,
    }}>
      {children}
    </MenuContext.Provider>
  );
};

// Default no-op context for graceful degradation
const defaultContext: MenuContextType = {
  activeConfig: null,
  activeAppId: null,
  registerMenus: () => {},
  unregisterMenus: () => {},
  setActiveApp: () => {},
  addMenuItem: () => false,
  removeMenuItem: () => false,
  updateMenuItem: () => false,
  executeAction: () => {},
  registerActionHandler: () => {},
  unregisterActionHandler: () => {},
};

export const useMenuContext = (): MenuContextType => {
  const context = useContext(MenuContext);
  return context ?? defaultContext;
};

// Re-export types for convenience
export type { AppMenuConfig, Menu, MenuItem, MenuActionEvent };
