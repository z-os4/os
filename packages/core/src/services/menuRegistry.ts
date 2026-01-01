/**
 * MenuRegistry - Dynamic menu registration system for zOS
 * 
 * Provides a centralized registry for app menus with support for:
 * - Dynamic menu registration/unregistration
 * - Menu item manipulation (add, remove, update)
 * - Keyboard shortcut management
 * - Menu action execution
 */

// Menu item types
export type MenuItemType = 'item' | 'separator' | 'checkbox' | 'radio';

export interface MenuItem {
  id: string;
  label?: string;
  shortcut?: string;
  onClick?: () => void;
  submenu?: MenuItem[];
  checked?: boolean;
  disabled?: boolean;
  type?: MenuItemType;
  isSearch?: boolean;
  radioGroup?: string;
}

export interface Menu {
  id: string;
  label: string;
  bold?: boolean;
  items: MenuItem[];
}

export interface AppMenuConfig {
  appId: string;
  appName: string;
  menus: Menu[];
}

export interface MenuActionEvent {
  menuId: string;
  itemId: string;
  appId: string;
}

type MenuActionHandler = (event: MenuActionEvent) => void;
type MenuChangeListener = (config: AppMenuConfig | null) => void;

/**
 * MenuRegistry singleton for managing application menus
 */
class MenuRegistryImpl {
  private configs: Map<string, AppMenuConfig> = new Map();
  private activeAppId: string | null = null;
  private actionHandlers: Map<string, MenuActionHandler> = new Map();
  private changeListeners: Set<MenuChangeListener> = new Set();
  private shortcutHandlers: Map<string, { appId: string; menuId: string; itemId: string }> = new Map();

  /**
   * Register menus for an application
   */
  register(config: AppMenuConfig): void {
    this.configs.set(config.appId, config);
    
    // Register keyboard shortcuts
    this.registerShortcuts(config);
    
    // Notify listeners if this is the active app
    if (this.activeAppId === config.appId) {
      this.notifyListeners();
    }
  }

  /**
   * Unregister menus for an application
   */
  unregister(appId: string): void {
    const config = this.configs.get(appId);
    if (config) {
      // Unregister shortcuts
      this.unregisterShortcuts(config);
      this.configs.delete(appId);
      
      if (this.activeAppId === appId) {
        this.activeAppId = null;
        this.notifyListeners();
      }
    }
  }

  /**
   * Set the active application (whose menus should be displayed)
   */
  setActiveApp(appId: string | null): void {
    if (this.activeAppId !== appId) {
      this.activeAppId = appId;
      this.notifyListeners();
    }
  }

  /**
   * Get the active application's menu config
   */
  getActiveConfig(): AppMenuConfig | null {
    if (!this.activeAppId) return null;
    return this.configs.get(this.activeAppId) ?? null;
  }

  /**
   * Get menu config for a specific app
   */
  getConfig(appId: string): AppMenuConfig | null {
    return this.configs.get(appId) ?? null;
  }

  /**
   * Add a menu item to a specific menu
   */
  addMenuItem(appId: string, menuId: string, item: MenuItem, position?: number): boolean {
    const config = this.configs.get(appId);
    if (!config) return false;

    const menu = config.menus.find(m => m.id === menuId);
    if (!menu) return false;

    if (position !== undefined && position >= 0 && position < menu.items.length) {
      menu.items.splice(position, 0, item);
    } else {
      menu.items.push(item);
    }

    // Register shortcut if present
    if (item.shortcut) {
      this.shortcutHandlers.set(item.shortcut, { appId, menuId, itemId: item.id });
    }

    if (this.activeAppId === appId) {
      this.notifyListeners();
    }

    return true;
  }

  /**
   * Remove a menu item from a specific menu
   */
  removeMenuItem(appId: string, menuId: string, itemId: string): boolean {
    const config = this.configs.get(appId);
    if (!config) return false;

    const menu = config.menus.find(m => m.id === menuId);
    if (!menu) return false;

    const index = menu.items.findIndex(item => item.id === itemId);
    if (index === -1) return false;

    const [removed] = menu.items.splice(index, 1);
    
    // Unregister shortcut if present
    if (removed.shortcut) {
      this.shortcutHandlers.delete(removed.shortcut);
    }

    if (this.activeAppId === appId) {
      this.notifyListeners();
    }

    return true;
  }

  /**
   * Update a menu item
   */
  updateMenuItem(appId: string, menuId: string, itemId: string, updates: Partial<MenuItem>): boolean {
    const config = this.configs.get(appId);
    if (!config) return false;

    const menu = config.menus.find(m => m.id === menuId);
    if (!menu) return false;

    const item = menu.items.find(i => i.id === itemId);
    if (!item) return false;

    // Handle shortcut changes
    if (updates.shortcut !== undefined && updates.shortcut !== item.shortcut) {
      if (item.shortcut) {
        this.shortcutHandlers.delete(item.shortcut);
      }
      if (updates.shortcut) {
        this.shortcutHandlers.set(updates.shortcut, { appId, menuId, itemId });
      }
    }

    Object.assign(item, updates);

    if (this.activeAppId === appId) {
      this.notifyListeners();
    }

    return true;
  }

  /**
   * Register an action handler for menu item clicks
   */
  registerActionHandler(appId: string, handler: MenuActionHandler): void {
    this.actionHandlers.set(appId, handler);
  }

  /**
   * Unregister an action handler
   */
  unregisterActionHandler(appId: string): void {
    this.actionHandlers.delete(appId);
  }

  /**
   * Execute a menu action
   */
  executeAction(appId: string, menuId: string, itemId: string): void {
    const config = this.configs.get(appId);
    if (!config) return;

    const menu = config.menus.find(m => m.id === menuId);
    if (!menu) return;

    const item = menu.items.find(i => i.id === itemId);
    if (!item || item.disabled) return;

    // Handle checkbox toggle
    if (item.type === 'checkbox') {
      item.checked = !item.checked;
      this.notifyListeners();
    }

    // Handle radio selection
    if (item.type === 'radio' && item.radioGroup) {
      menu.items.forEach(i => {
        if (i.type === 'radio' && i.radioGroup === item.radioGroup) {
          i.checked = i.id === itemId;
        }
      });
      this.notifyListeners();
    }

    // Call item's onClick handler
    if (item.onClick) {
      item.onClick();
    }

    // Call registered action handler
    const handler = this.actionHandlers.get(appId);
    if (handler) {
      handler({ appId, menuId, itemId });
    }
  }

  /**
   * Handle keyboard shortcut
   */
  handleShortcut(shortcut: string): boolean {
    const mapping = this.shortcutHandlers.get(shortcut);
    if (!mapping) return false;

    // Only handle shortcuts for the active app
    if (mapping.appId !== this.activeAppId) return false;

    this.executeAction(mapping.appId, mapping.menuId, mapping.itemId);
    return true;
  }

  /**
   * Subscribe to menu changes
   */
  subscribe(listener: MenuChangeListener): () => void {
    this.changeListeners.add(listener);
    // Immediately notify with current state
    listener(this.getActiveConfig());
    
    return () => {
      this.changeListeners.delete(listener);
    };
  }

  /**
   * Get the active app ID
   */
  getActiveAppId(): string | null {
    return this.activeAppId;
  }

  private registerShortcuts(config: AppMenuConfig): void {
    config.menus.forEach(menu => {
      this.registerMenuItemShortcuts(config.appId, menu.id, menu.items);
    });
  }

  private registerMenuItemShortcuts(appId: string, menuId: string, items: MenuItem[]): void {
    items.forEach(item => {
      if (item.shortcut) {
        this.shortcutHandlers.set(item.shortcut, { appId, menuId, itemId: item.id });
      }
      if (item.submenu) {
        this.registerMenuItemShortcuts(appId, menuId, item.submenu);
      }
    });
  }

  private unregisterShortcuts(config: AppMenuConfig): void {
    config.menus.forEach(menu => {
      this.unregisterMenuItemShortcuts(menu.items);
    });
  }

  private unregisterMenuItemShortcuts(items: MenuItem[]): void {
    items.forEach(item => {
      if (item.shortcut) {
        this.shortcutHandlers.delete(item.shortcut);
      }
      if (item.submenu) {
        this.unregisterMenuItemShortcuts(item.submenu);
      }
    });
  }

  private notifyListeners(): void {
    const config = this.getActiveConfig();
    this.changeListeners.forEach(listener => listener(config));
  }
}

// Export singleton instance
export const menuRegistry = new MenuRegistryImpl();

// Export type for the registry
export type MenuRegistry = typeof menuRegistry;
