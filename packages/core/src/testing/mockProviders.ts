/**
 * Mock Provider Factories for zOS Testing
 *
 * Creates mock implementations of zOS contexts and services.
 * All mocks track calls and allow test assertions.
 */

import type {
  MockWindowManager,
  MockDockContext,
  MockMenuContext,
  MockFileSystem,
  MockClipboard,
  MockFn,
  MockDockItem,
  TestMenuActionEvent,
} from './types';
import type { AppType, WindowState, WindowGeometry } from '../hooks/useWindowManager';
import type { FileNode, FileSystemState, FSFileType } from '../services/fileSystem/types';
import type { ClipboardItem, ClipboardDataType } from '../services/clipboard/types';
import type { AppMenuConfig, MenuItem } from '../services/menuRegistry';

/**
 * Create a mock function that tracks calls
 * Compatible with Jest mock and Vitest vi.fn()
 */
export function createMockFn<T extends (...args: any[]) => any>(
  implementation?: T
): MockFn<T> {
  const calls: Parameters<T>[] = [];
  const results: { type: 'return' | 'throw'; value: ReturnType<T> }[] = [];
  const instances: unknown[] = [];

  let currentImpl: T | undefined = implementation;
  let returnValue: ReturnType<T> | undefined;
  let returnValueOnce: ReturnType<T>[] = [];

  const mockFn = ((...args: Parameters<T>): ReturnType<T> => {
    calls.push(args);

    // Return once value if available
    if (returnValueOnce.length > 0) {
      const value = returnValueOnce.shift()!;
      results.push({ type: 'return', value });
      return value;
    }

    // Return fixed value if set
    if (returnValue !== undefined) {
      results.push({ type: 'return', value: returnValue });
      return returnValue;
    }

    // Call implementation
    if (currentImpl) {
      try {
        const result = currentImpl(...args);
        results.push({ type: 'return', value: result });
        return result;
      } catch (error) {
        results.push({ type: 'throw', value: error as ReturnType<T> });
        throw error;
      }
    }

    return undefined as ReturnType<T>;
  }) as MockFn<T>;

  mockFn.mock = { calls, results, instances };

  mockFn.mockClear = () => {
    calls.length = 0;
    results.length = 0;
    instances.length = 0;
  };

  mockFn.mockReset = () => {
    mockFn.mockClear();
    currentImpl = undefined;
    returnValue = undefined;
    returnValueOnce = [];
  };

  mockFn.mockImplementation = (fn: T) => {
    currentImpl = fn;
    return mockFn;
  };

  mockFn.mockReturnValue = (value: ReturnType<T>) => {
    returnValue = value;
    return mockFn;
  };

  mockFn.mockReturnValueOnce = (value: ReturnType<T>) => {
    returnValueOnce.push(value);
    return mockFn;
  };

  mockFn.mockResolvedValue = <U>(value: U) => {
    returnValue = Promise.resolve(value) as ReturnType<T>;
    return mockFn;
  };

  mockFn.mockRejectedValue = (error: Error) => {
    currentImpl = (() => Promise.reject(error)) as T;
    return mockFn;
  };

  return mockFn;
}

/**
 * Create a mock window manager
 */
export function createMockWindowManager(
  initial?: Partial<MockWindowManager>
): MockWindowManager {
  const windows = new Map<string, WindowState>();
  const geometries = new Map<AppType, WindowGeometry>();
  let activeApp: AppType | null = null;
  let openApps: AppType[] = [];

  const defaultGeometry: WindowGeometry = {
    position: { x: 100, y: 100 },
    size: { width: 800, height: 600 },
    isMinimized: false,
    isMaximized: false,
    isTiled: null,
  };

  const manager: MockWindowManager = {
    windows,
    activeApp,
    openApps,
    geometries,

    openWindow: createMockFn((app: AppType) => {
      openApps = [...openApps, app];
      activeApp = app;
      geometries.set(app, { ...defaultGeometry });
    }),

    closeWindow: createMockFn((app: AppType) => {
      openApps = openApps.filter(a => a !== app);
      geometries.delete(app);
      if (activeApp === app) {
        activeApp = openApps[0] || null;
      }
    }),

    focusWindow: createMockFn((app: AppType) => {
      if (openApps.includes(app)) {
        activeApp = app;
      }
    }),

    toggleWindow: createMockFn((app: AppType) => {
      if (openApps.includes(app)) {
        manager.closeWindow(app);
      } else {
        manager.openWindow(app);
      }
    }),

    minimizeWindow: createMockFn((app: AppType) => {
      const geo = geometries.get(app);
      if (geo) {
        geometries.set(app, { ...geo, isMinimized: true });
      }
    }),

    maximizeWindow: createMockFn((app: AppType) => {
      const geo = geometries.get(app);
      if (geo) {
        geometries.set(app, { ...geo, isMaximized: true, isTiled: null });
      }
    }),

    restoreWindow: createMockFn((app: AppType) => {
      const geo = geometries.get(app);
      if (geo) {
        geometries.set(app, {
          ...geo,
          isMinimized: false,
          isMaximized: false,
          isTiled: null,
        });
      }
    }),

    tileWindowLeft: createMockFn((app: AppType) => {
      const geo = geometries.get(app);
      if (geo) {
        geometries.set(app, { ...geo, isTiled: 'left', isMaximized: false });
      }
    }),

    tileWindowRight: createMockFn((app: AppType) => {
      const geo = geometries.get(app);
      if (geo) {
        geometries.set(app, { ...geo, isTiled: 'right', isMaximized: false });
      }
    }),

    closeAllWindows: createMockFn(() => {
      openApps = [];
      geometries.clear();
      activeApp = null;
    }),

    hideOtherWindows: createMockFn(() => {
      for (const app of openApps) {
        if (app !== activeApp) {
          const geo = geometries.get(app);
          if (geo) {
            geometries.set(app, { ...geo, isMinimized: true });
          }
        }
      }
    }),

    showAllWindows: createMockFn(() => {
      for (const app of openApps) {
        const geo = geometries.get(app);
        if (geo) {
          geometries.set(app, { ...geo, isMinimized: false });
        }
      }
    }),

    getWindowState: createMockFn((app: AppType) => {
      return geometries.get(app) || null;
    }),

    updateWindowGeometry: createMockFn((app: AppType, geometry: Partial<WindowGeometry>) => {
      const current = geometries.get(app) || { ...defaultGeometry };
      geometries.set(app, { ...current, ...geometry });
    }),

    isOpen: createMockFn((app: AppType) => openApps.includes(app)),
    isMinimized: createMockFn((app: AppType) => geometries.get(app)?.isMinimized ?? false),
    isMaximized: createMockFn((app: AppType) => geometries.get(app)?.isMaximized ?? false),
    isTiled: createMockFn((app: AppType) => geometries.get(app)?.isTiled ?? null),

    _reset: () => {
      windows.clear();
      geometries.clear();
      activeApp = null;
      openApps = [];
      Object.values(manager).forEach(v => {
        if (typeof v === 'function' && 'mockClear' in v) {
          (v as MockFn<any>).mockClear();
        }
      });
    },

    _setActiveApp: (app: AppType | null) => {
      activeApp = app;
    },

    _addWindow: (app: AppType) => {
      if (!openApps.includes(app)) {
        openApps.push(app);
        geometries.set(app, { ...defaultGeometry });
      }
    },
  };

  // Apply initial state
  if (initial) {
    if (initial.activeApp !== undefined) activeApp = initial.activeApp;
    if (initial.openApps) openApps = [...initial.openApps];
  }

  // Update accessors to return current state
  Object.defineProperty(manager, 'activeApp', {
    get: () => activeApp,
    enumerable: true,
  });
  Object.defineProperty(manager, 'openApps', {
    get: () => openApps,
    enumerable: true,
  });

  return manager;
}

/**
 * Create a mock dock context
 */
export function createMockDockContext(
  initial?: Partial<MockDockContext>
): MockDockContext {
  let dockOrder: MockDockItem[] = initial?.dockOrder ?? [
    { id: 'finder', isPinned: true, order: 0 },
    { id: 'safari', isPinned: true, order: 1 },
    { id: 'terminal', isPinned: true, order: 2 },
  ];

  const context: MockDockContext = {
    dockOrder,

    reorderItems: createMockFn((dragId: string, dropId: string) => {
      const dragIndex = dockOrder.findIndex(item => item.id === dragId);
      const dropIndex = dockOrder.findIndex(item => item.id === dropId);
      if (dragIndex === -1 || dropIndex === -1) return;

      const [item] = dockOrder.splice(dragIndex, 1);
      dockOrder.splice(dropIndex, 0, item);
      dockOrder = dockOrder.map((item, index) => ({ ...item, order: index }));
    }),

    removeFromDock: createMockFn((id: string) => {
      if (id === 'finder') return; // Finder cannot be removed
      dockOrder = dockOrder.filter(item => item.id !== id);
    }),

    addToDock: createMockFn((id: string) => {
      if (dockOrder.some(item => item.id === id)) return;
      dockOrder = [...dockOrder, { id, isPinned: false, order: dockOrder.length }];
    }),

    pinItem: createMockFn((id: string) => {
      dockOrder = dockOrder.map(item =>
        item.id === id ? { ...item, isPinned: true } : item
      );
    }),

    unpinItem: createMockFn((id: string) => {
      if (id === 'finder') return; // Finder is always pinned
      dockOrder = dockOrder.map(item =>
        item.id === id ? { ...item, isPinned: false } : item
      );
    }),

    isItemInDock: createMockFn((id: string) => {
      return dockOrder.some(item => item.id === id);
    }),

    isItemPinned: createMockFn((id: string) => {
      const item = dockOrder.find(i => i.id === id);
      return item?.isPinned ?? false;
    }),

    _reset: () => {
      dockOrder = [
        { id: 'finder', isPinned: true, order: 0 },
        { id: 'safari', isPinned: true, order: 1 },
        { id: 'terminal', isPinned: true, order: 2 },
      ];
      Object.values(context).forEach(v => {
        if (typeof v === 'function' && 'mockClear' in v) {
          (v as MockFn<any>).mockClear();
        }
      });
    },

    _setDockOrder: (items: MockDockItem[]) => {
      dockOrder = items;
    },
  };

  Object.defineProperty(context, 'dockOrder', {
    get: () => dockOrder,
    enumerable: true,
  });

  return context;
}

/**
 * Create a mock menu context
 */
export function createMockMenuContext(
  initial?: Partial<MockMenuContext>
): MockMenuContext {
  let activeConfig: AppMenuConfig | null = initial?.activeConfig ?? null;
  let activeAppId: string | null = initial?.activeAppId ?? null;
  const registeredMenus = new Map<string, AppMenuConfig>();
  const actionHandlers = new Map<string, (event: TestMenuActionEvent) => void>();

  const context: MockMenuContext = {
    activeConfig,
    activeAppId,

    registerMenus: createMockFn((config: AppMenuConfig) => {
      registeredMenus.set(config.appId, config);
      if (activeAppId === config.appId) {
        activeConfig = config;
      }
    }),

    unregisterMenus: createMockFn((appId: string) => {
      registeredMenus.delete(appId);
      if (activeAppId === appId) {
        activeConfig = null;
        activeAppId = null;
      }
    }),

    setActiveApp: createMockFn((appId: string | null) => {
      activeAppId = appId;
      activeConfig = appId ? registeredMenus.get(appId) ?? null : null;
    }),

    addMenuItem: createMockFn((_appId: string, _menuId: string, _item: MenuItem, _position?: number): boolean => {
      return true;
    }),

    removeMenuItem: createMockFn((_appId: string, _menuId: string, _itemId: string): boolean => {
      return true;
    }),

    updateMenuItem: createMockFn((_appId: string, _menuId: string, _itemId: string, _updates: Partial<MenuItem>): boolean => {
      return true;
    }),

    executeAction: createMockFn((appId: string, menuId: string, itemId: string) => {
      const handler = actionHandlers.get(appId);
      if (handler) {
        handler({ appId, menuId, itemId });
      }
    }),

    registerActionHandler: createMockFn((appId: string, handler: (event: TestMenuActionEvent) => void) => {
      actionHandlers.set(appId, handler);
    }),

    unregisterActionHandler: createMockFn((appId: string) => {
      actionHandlers.delete(appId);
    }),

    _reset: () => {
      activeConfig = null;
      activeAppId = null;
      registeredMenus.clear();
      actionHandlers.clear();
      Object.values(context).forEach(v => {
        if (typeof v === 'function' && 'mockClear' in v) {
          (v as MockFn<any>).mockClear();
        }
      });
    },

    _setActiveConfig: (config: AppMenuConfig | null) => {
      activeConfig = config;
      activeAppId = config?.appId ?? null;
    },

    _triggerAction: (event: TestMenuActionEvent) => {
      const handler = actionHandlers.get(event.appId);
      if (handler) {
        handler(event);
      }
    },
  };

  Object.defineProperty(context, 'activeConfig', {
    get: () => activeConfig,
    enumerable: true,
  });
  Object.defineProperty(context, 'activeAppId', {
    get: () => activeAppId,
    enumerable: true,
  });

  return context;
}

/**
 * Create a mock file system
 */
export function createMockFileSystem(
  initial?: Partial<MockFileSystem>
): MockFileSystem {
  let idCounter = 1;

  const generateId = () => `node-${idCounter++}`;

  const createNode = (
    name: string,
    path: string,
    type: FSFileType,
    parentId: string | null,
    content?: string
  ): FileNode => ({
    id: generateId(),
    name,
    path,
    type,
    parentId,
    content,
    children: type === 'folder' ? [] : undefined,
    metadata: {
      createdAt: new Date(),
      modifiedAt: new Date(),
      size: content?.length ?? 0,
    },
  });

  // Initialize with root
  const rootNode = createNode('/', '/', 'folder', null);
  let state: FileSystemState = initial?.state ?? {
    nodes: { [rootNode.id]: rootNode },
    rootId: rootNode.id,
  };

  const getNodeByPath = (path: string): FileNode | null => {
    return Object.values(state.nodes).find(n => n.path === path) ?? null;
  };

  const fs: MockFileSystem = {
    state,

    getNode: createMockFn((path: string) => getNodeByPath(path)),

    listDirectory: createMockFn((path: string) => {
      const node = getNodeByPath(path);
      if (!node || node.type !== 'folder') return [];
      return (node.children ?? [])
        .map(id => state.nodes[id])
        .filter(Boolean) as FileNode[];
    }),

    exists: createMockFn((path: string) => getNodeByPath(path) !== null),

    isDirectory: createMockFn((path: string) => {
      const node = getNodeByPath(path);
      return node?.type === 'folder';
    }),

    isFile: createMockFn((path: string) => {
      const node = getNodeByPath(path);
      return node !== null && node.type !== 'folder';
    }),

    readFile: createMockFn((path: string) => {
      const node = getNodeByPath(path);
      if (!node || node.type === 'folder') return null;
      return node.content ?? null;
    }),

    createFile: createMockFn((path: string, content?: string) => {
      const parentPath = path.split('/').slice(0, -1).join('/') || '/';
      const name = path.split('/').pop()!;
      const parent = getNodeByPath(parentPath);
      if (!parent || parent.type !== 'folder') return null;

      const node = createNode(name, path, 'file', parent.id, content);
      state.nodes[node.id] = node;
      parent.children = [...(parent.children ?? []), node.id];
      return node;
    }),

    createFolder: createMockFn((path: string) => {
      const parentPath = path.split('/').slice(0, -1).join('/') || '/';
      const name = path.split('/').pop()!;
      const parent = getNodeByPath(parentPath);
      if (!parent || parent.type !== 'folder') return null;

      const node = createNode(name, path, 'folder', parent.id);
      state.nodes[node.id] = node;
      parent.children = [...(parent.children ?? []), node.id];
      return node;
    }),

    writeFile: createMockFn((path: string, content: string) => {
      const node = getNodeByPath(path);
      if (!node || node.type === 'folder') return false;
      node.content = content;
      node.metadata.modifiedAt = new Date();
      node.metadata.size = content.length;
      return true;
    }),

    deleteNode: createMockFn((path: string) => {
      const node = getNodeByPath(path);
      if (!node || path === '/') return false;

      const parent = node.parentId ? state.nodes[node.parentId] : null;
      if (parent && parent.children) {
        parent.children = parent.children.filter(id => id !== node.id);
      }
      delete state.nodes[node.id];
      return true;
    }),

    moveNode: createMockFn((source: string, destination: string) => {
      const node = getNodeByPath(source);
      if (!node) return false;

      const destParentPath = destination.split('/').slice(0, -1).join('/') || '/';
      const destName = destination.split('/').pop()!;
      const destParent = getNodeByPath(destParentPath);
      if (!destParent || destParent.type !== 'folder') return false;

      // Remove from old parent
      const oldParent = node.parentId ? state.nodes[node.parentId] : null;
      if (oldParent && oldParent.children) {
        oldParent.children = oldParent.children.filter(id => id !== node.id);
      }

      // Add to new parent
      node.parentId = destParent.id;
      node.path = destination;
      node.name = destName;
      destParent.children = [...(destParent.children ?? []), node.id];

      return true;
    }),

    copyNode: createMockFn((source: string, destination: string) => {
      const node = getNodeByPath(source);
      if (!node) return null;

      const destParentPath = destination.split('/').slice(0, -1).join('/') || '/';
      const destName = destination.split('/').pop()!;
      const destParent = getNodeByPath(destParentPath);
      if (!destParent || destParent.type !== 'folder') return null;

      const copy = createNode(destName, destination, node.type, destParent.id, node.content);
      state.nodes[copy.id] = copy;
      destParent.children = [...(destParent.children ?? []), copy.id];

      return copy;
    }),

    renameNode: createMockFn((path: string, newName: string) => {
      const node = getNodeByPath(path);
      if (!node) return false;

      const parentPath = path.split('/').slice(0, -1).join('/') || '/';
      node.name = newName;
      node.path = `${parentPath}/${newName}`;
      return true;
    }),

    _reset: () => {
      idCounter = 1;
      const newRoot = createNode('/', '/', 'folder', null);
      state = {
        nodes: { [newRoot.id]: newRoot },
        rootId: newRoot.id,
      };
      Object.values(fs).forEach(v => {
        if (typeof v === 'function' && 'mockClear' in v) {
          (v as MockFn<any>).mockClear();
        }
      });
    },

    _addFile: (path: string, content?: string) => {
      fs.createFile(path, content);
    },

    _addFolder: (path: string) => {
      fs.createFolder(path);
    },

    _getState: () => state,
  };

  Object.defineProperty(fs, 'state', {
    get: () => state,
    enumerable: true,
  });

  return fs;
}

/**
 * Create a mock clipboard
 */
export function createMockClipboard(
  initial?: Partial<MockClipboard>
): MockClipboard {
  let currentItem: ClipboardItem | null = initial?.currentItem ?? null;
  let history: ClipboardItem[] = initial?.history ?? [];
  let idCounter = 1;

  const createItem = (
    data: unknown,
    type: ClipboardDataType = 'text'
  ): ClipboardItem => ({
    id: `clip-${idCounter++}`,
    type,
    data,
    text: typeof data === 'string' ? data : JSON.stringify(data),
    timestamp: Date.now(),
  });

  const clipboard: MockClipboard = {
    currentItem,
    history,

    copy: createMockFn(async (data: unknown, type?: ClipboardDataType) => {
      const item = createItem(data, type);
      currentItem = item;
      history = [item, ...history].slice(0, 50);
    }),

    cut: createMockFn(async (data: unknown, type?: ClipboardDataType, onCut?: () => void) => {
      const item = createItem(data, type);
      currentItem = item;
      history = [item, ...history].slice(0, 50);
      if (onCut) {
        // Store for later execution on paste
        (currentItem as any)._onCut = onCut;
      }
    }),

    paste: createMockFn(async () => {
      if (currentItem && (currentItem as any)._onCut) {
        (currentItem as any)._onCut();
        delete (currentItem as any)._onCut;
      }
      return currentItem;
    }),

    copyText: createMockFn(async (text: string) => {
      await clipboard.copy(text, 'text');
    }),

    copyHtml: createMockFn(async (html: string) => {
      await clipboard.copy(html, 'html');
    }),

    copyFiles: createMockFn(async (paths: string[]) => {
      await clipboard.copy(paths, 'files');
    }),

    getHistory: createMockFn(() => history),

    clearHistory: createMockFn(() => {
      history = [];
      currentItem = null;
    }),

    pasteFromHistory: createMockFn(async (id: string) => {
      const item = history.find(i => i.id === id);
      if (item) {
        currentItem = item;
        return item;
      }
      return null;
    }),

    _reset: () => {
      currentItem = null;
      history = [];
      idCounter = 1;
      Object.values(clipboard).forEach(v => {
        if (typeof v === 'function' && 'mockClear' in v) {
          (v as MockFn<any>).mockClear();
        }
      });
    },

    _setCurrentItem: (item: ClipboardItem | null) => {
      currentItem = item;
    },

    _addToHistory: (item: ClipboardItem) => {
      history = [item, ...history].slice(0, 50);
    },
  };

  Object.defineProperty(clipboard, 'currentItem', {
    get: () => currentItem,
    enumerable: true,
  });
  Object.defineProperty(clipboard, 'history', {
    get: () => history,
    enumerable: true,
  });

  return clipboard;
}
