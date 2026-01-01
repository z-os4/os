/**
 * Standard menu templates for zOS applications
 * 
 * These templates provide consistent menu structures across apps
 * while allowing customization through handler callbacks.
 */

import { Menu, MenuItem } from './menuRegistry';

// Handler types for menu actions
export interface FileMenuHandlers {
  onNew?: () => void;
  onNewWindow?: () => void;
  onNewTab?: () => void;
  onOpen?: () => void;
  onOpenRecent?: () => void;
  onClose?: () => void;
  onCloseAll?: () => void;
  onSave?: () => void;
  onSaveAs?: () => void;
  onPrint?: () => void;
}

export interface EditMenuHandlers {
  onUndo?: () => void;
  onRedo?: () => void;
  onCut?: () => void;
  onCopy?: () => void;
  onPaste?: () => void;
  onSelectAll?: () => void;
  onFind?: () => void;
  onFindAndReplace?: () => void;
  onDelete?: () => void;
}

export interface ViewMenuHandlers {
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onActualSize?: () => void;
  onToggleFullScreen?: () => void;
  onToggleSidebar?: () => void;
  onToggleStatusBar?: () => void;
  onRefresh?: () => void;
}

export interface WindowMenuHandlers {
  onMinimize?: () => void;
  onZoom?: () => void;
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
  onCycleWindows?: () => void;
  onBringAllToFront?: () => void;
}

export interface HelpMenuHandlers {
  onHelp?: () => void;
  onSearch?: (query: string) => void;
}

export interface AppMenuHandlers {
  onAbout?: () => void;
  onSettings?: () => void;
  onHide?: () => void;
  onHideOthers?: () => void;
  onShowAll?: () => void;
  onQuit?: () => void;
}

/**
 * Create the standard app menu (leftmost menu with app name)
 */
export function createStandardAppMenu(
  appName: string,
  handlers: AppMenuHandlers = {}
): Menu {
  return {
    id: 'app',
    label: appName,
    bold: true,
    items: [
      {
        id: 'about',
        label: `About ${appName}`,
        onClick: handlers.onAbout,
      },
      { id: 'sep1', type: 'separator' },
      {
        id: 'settings',
        label: 'Settings...',
        shortcut: '\u2318,',
        onClick: handlers.onSettings,
      },
      { id: 'sep2', type: 'separator' },
      {
        id: 'services',
        label: 'Services',
        submenu: [],
      },
      { id: 'sep3', type: 'separator' },
      {
        id: 'hide',
        label: `Hide ${appName}`,
        shortcut: '\u2318H',
        onClick: handlers.onHide,
      },
      {
        id: 'hideOthers',
        label: 'Hide Others',
        shortcut: '\u2325\u2318H',
        onClick: handlers.onHideOthers,
      },
      {
        id: 'showAll',
        label: 'Show All',
        onClick: handlers.onShowAll,
      },
      { id: 'sep4', type: 'separator' },
      {
        id: 'quit',
        label: `Quit ${appName}`,
        shortcut: '\u2318Q',
        onClick: handlers.onQuit,
      },
    ],
  };
}

/**
 * Create the standard File menu
 */
export function createStandardFileMenu(handlers: FileMenuHandlers = {}): Menu {
  const items: MenuItem[] = [];

  if (handlers.onNew || handlers.onNewWindow) {
    items.push({
      id: 'newWindow',
      label: 'New Window',
      shortcut: '\u2318N',
      onClick: handlers.onNewWindow ?? handlers.onNew,
    });
  }

  if (handlers.onNewTab) {
    items.push({
      id: 'newTab',
      label: 'New Tab',
      shortcut: '\u2318T',
      onClick: handlers.onNewTab,
    });
  }

  if (items.length > 0) {
    items.push({ id: 'sep1', type: 'separator' });
  }

  if (handlers.onOpen) {
    items.push({
      id: 'open',
      label: 'Open...',
      shortcut: '\u2318O',
      onClick: handlers.onOpen,
    });
  }

  if (handlers.onOpenRecent) {
    items.push({
      id: 'openRecent',
      label: 'Open Recent',
      submenu: [],
      onClick: handlers.onOpenRecent,
    });
  }

  if (handlers.onOpen || handlers.onOpenRecent) {
    items.push({ id: 'sep2', type: 'separator' });
  }

  if (handlers.onClose) {
    items.push({
      id: 'close',
      label: 'Close Window',
      shortcut: '\u2318W',
      onClick: handlers.onClose,
    });
  }

  if (handlers.onCloseAll) {
    items.push({
      id: 'closeAll',
      label: 'Close All',
      shortcut: '\u2325\u2318W',
      onClick: handlers.onCloseAll,
    });
  }

  if (handlers.onSave) {
    items.push({ id: 'sep3', type: 'separator' });
    items.push({
      id: 'save',
      label: 'Save',
      shortcut: '\u2318S',
      onClick: handlers.onSave,
    });
  }

  if (handlers.onSaveAs) {
    items.push({
      id: 'saveAs',
      label: 'Save As...',
      shortcut: '\u21E7\u2318S',
      onClick: handlers.onSaveAs,
    });
  }

  if (handlers.onPrint) {
    items.push({ id: 'sep4', type: 'separator' });
    items.push({
      id: 'print',
      label: 'Print...',
      shortcut: '\u2318P',
      onClick: handlers.onPrint,
    });
  }

  return {
    id: 'file',
    label: 'File',
    items,
  };
}

/**
 * Create the standard Edit menu
 */
export function createStandardEditMenu(handlers: EditMenuHandlers = {}): Menu {
  return {
    id: 'edit',
    label: 'Edit',
    items: [
      {
        id: 'undo',
        label: 'Undo',
        shortcut: '\u2318Z',
        onClick: handlers.onUndo,
        disabled: !handlers.onUndo,
      },
      {
        id: 'redo',
        label: 'Redo',
        shortcut: '\u21E7\u2318Z',
        onClick: handlers.onRedo,
        disabled: !handlers.onRedo,
      },
      { id: 'sep1', type: 'separator' },
      {
        id: 'cut',
        label: 'Cut',
        shortcut: '\u2318X',
        onClick: handlers.onCut,
      },
      {
        id: 'copy',
        label: 'Copy',
        shortcut: '\u2318C',
        onClick: handlers.onCopy,
      },
      {
        id: 'paste',
        label: 'Paste',
        shortcut: '\u2318V',
        onClick: handlers.onPaste,
      },
      {
        id: 'delete',
        label: 'Delete',
        onClick: handlers.onDelete,
        disabled: !handlers.onDelete,
      },
      {
        id: 'selectAll',
        label: 'Select All',
        shortcut: '\u2318A',
        onClick: handlers.onSelectAll,
      },
      { id: 'sep2', type: 'separator' },
      {
        id: 'find',
        label: 'Find...',
        shortcut: '\u2318F',
        onClick: handlers.onFind,
        submenu: handlers.onFindAndReplace ? [
          {
            id: 'findMain',
            label: 'Find...',
            shortcut: '\u2318F',
            onClick: handlers.onFind,
          },
          {
            id: 'findReplace',
            label: 'Find and Replace...',
            shortcut: '\u2325\u2318F',
            onClick: handlers.onFindAndReplace,
          },
        ] : undefined,
      },
    ],
  };
}

/**
 * Create the standard View menu
 */
export function createStandardViewMenu(handlers: ViewMenuHandlers = {}): Menu {
  const items: MenuItem[] = [];

  if (handlers.onRefresh) {
    items.push({
      id: 'refresh',
      label: 'Refresh',
      shortcut: '\u2318R',
      onClick: handlers.onRefresh,
    });
    items.push({ id: 'sep1', type: 'separator' });
  }

  items.push({
    id: 'actualSize',
    label: 'Actual Size',
    shortcut: '\u23180',
    onClick: handlers.onActualSize,
  });

  items.push({
    id: 'zoomIn',
    label: 'Zoom In',
    shortcut: '\u2318+',
    onClick: handlers.onZoomIn,
  });

  items.push({
    id: 'zoomOut',
    label: 'Zoom Out',
    shortcut: '\u2318-',
    onClick: handlers.onZoomOut,
  });

  items.push({ id: 'sep2', type: 'separator' });

  if (handlers.onToggleSidebar) {
    items.push({
      id: 'toggleSidebar',
      label: 'Show Sidebar',
      shortcut: '\u2325\u2318S',
      type: 'checkbox',
      checked: true,
      onClick: handlers.onToggleSidebar,
    });
  }

  if (handlers.onToggleStatusBar) {
    items.push({
      id: 'toggleStatusBar',
      label: 'Show Status Bar',
      type: 'checkbox',
      checked: true,
      onClick: handlers.onToggleStatusBar,
    });
  }

  items.push({ id: 'sep3', type: 'separator' });

  items.push({
    id: 'fullScreen',
    label: 'Enter Full Screen',
    shortcut: '\u2303\u2318F',
    onClick: handlers.onToggleFullScreen ?? (() => {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        document.documentElement.requestFullscreen();
      }
    }),
  });

  return {
    id: 'view',
    label: 'View',
    items,
  };
}

/**
 * Create the standard Window menu
 */
export function createStandardWindowMenu(handlers: WindowMenuHandlers = {}): Menu {
  return {
    id: 'window',
    label: 'Window',
    items: [
      {
        id: 'minimize',
        label: 'Minimize',
        shortcut: '\u2318M',
        onClick: handlers.onMinimize,
      },
      {
        id: 'zoom',
        label: 'Zoom',
        onClick: handlers.onZoom,
      },
      {
        id: 'moveLeft',
        label: 'Move Window to Left Side of Screen',
        onClick: handlers.onMoveLeft,
      },
      {
        id: 'moveRight',
        label: 'Move Window to Right Side of Screen',
        onClick: handlers.onMoveRight,
      },
      { id: 'sep1', type: 'separator' },
      {
        id: 'cycleWindows',
        label: 'Cycle Through Windows',
        shortcut: '\u2318`',
        onClick: handlers.onCycleWindows,
      },
      { id: 'sep2', type: 'separator' },
      {
        id: 'bringAll',
        label: 'Bring All to Front',
        onClick: handlers.onBringAllToFront,
      },
    ],
  };
}

/**
 * Create the standard Help menu
 */
export function createStandardHelpMenu(appName: string, handlers: HelpMenuHandlers = {}): Menu {
  return {
    id: 'help',
    label: 'Help',
    items: [
      {
        id: 'search',
        label: 'Search',
        isSearch: true,
      },
      { id: 'sep1', type: 'separator' },
      {
        id: 'appHelp',
        label: `${appName} Help`,
        onClick: handlers.onHelp,
      },
    ],
  };
}

/**
 * Create a complete standard menu set for an application
 */
export interface StandardMenuOptions {
  appName: string;
  appHandlers?: AppMenuHandlers;
  fileHandlers?: FileMenuHandlers;
  editHandlers?: EditMenuHandlers;
  viewHandlers?: ViewMenuHandlers;
  windowHandlers?: WindowMenuHandlers;
  helpHandlers?: HelpMenuHandlers;
  /** Additional custom menus to insert before Window menu */
  customMenus?: Menu[];
  /** Exclude specific standard menus */
  exclude?: ('file' | 'edit' | 'view' | 'window' | 'help')[];
}

export function createStandardMenus(options: StandardMenuOptions): Menu[] {
  const {
    appName,
    appHandlers = {},
    fileHandlers = {},
    editHandlers = {},
    viewHandlers = {},
    windowHandlers = {},
    helpHandlers = {},
    customMenus = [],
    exclude = [],
  } = options;

  const menus: Menu[] = [
    createStandardAppMenu(appName, appHandlers),
  ];

  if (!exclude.includes('file')) {
    menus.push(createStandardFileMenu(fileHandlers));
  }

  if (!exclude.includes('edit')) {
    menus.push(createStandardEditMenu(editHandlers));
  }

  if (!exclude.includes('view')) {
    menus.push(createStandardViewMenu(viewHandlers));
  }

  // Insert custom menus before Window menu
  menus.push(...customMenus);

  if (!exclude.includes('window')) {
    menus.push(createStandardWindowMenu(windowHandlers));
  }

  if (!exclude.includes('help')) {
    menus.push(createStandardHelpMenu(appName, helpHandlers));
  }

  return menus;
}

/**
 * Create a separator menu item
 */
export function createSeparator(id: string): MenuItem {
  return { id, type: 'separator' };
}

/**
 * Create a checkbox menu item
 */
export function createCheckboxItem(
  id: string,
  label: string,
  checked: boolean,
  onClick: () => void,
  shortcut?: string
): MenuItem {
  return {
    id,
    label,
    type: 'checkbox',
    checked,
    shortcut,
    onClick,
  };
}

/**
 * Create a radio group of menu items
 */
export function createRadioGroup(
  groupId: string,
  items: { id: string; label: string; shortcut?: string }[],
  selectedId: string,
  onSelect: (id: string) => void
): MenuItem[] {
  return items.map(item => ({
    id: item.id,
    label: item.label,
    shortcut: item.shortcut,
    type: 'radio' as const,
    radioGroup: groupId,
    checked: item.id === selectedId,
    onClick: () => onSelect(item.id),
  }));
}
