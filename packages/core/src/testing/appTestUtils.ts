/**
 * App Testing Utilities for zOS
 *
 * Utilities for testing zOS apps including app creation,
 * menu action simulation, keyboard shortcuts, and drag/drop.
 */

import React from 'react';
import type {
  TestAppConfig,
  TestAppResult,
  RenderResult,
  RenderOptions,
  MockWindowManager,
  MockMenuContext,
  KeyboardShortcut,
  DragDropOptions,
} from './types';
import type { LoaderAppManifest } from '../services/appLoader';
import type { AppType } from '../hooks/useWindowManager';
import { renderWithProviders } from './TestProviders';
import { createMockWindowManager, createMockMenuContext } from './mockProviders';

/**
 * Create a test app with manifest and render utilities
 *
 * @param config Test app configuration
 * @returns TestAppResult with manifest, render, and helper methods
 */
export function createTestApp(config: TestAppConfig): TestAppResult {
  const { id, name, component: Component, props = {}, geometry, menus = [] } = config;

  // Generate app manifest
  const manifest: LoaderAppManifest = {
    identifier: `apps.zos.test.${id}`,
    name,
    version: '1.0.0',
    description: `Test app: ${name}`,
    category: 'other',
    icon: '🧪',
  };

  // Create mock instances
  const windowManager = createMockWindowManager();
  const menuContext = createMockMenuContext();

  // Register menus if provided
  if (menus.length > 0) {
    menuContext.registerMenus({
      appId: id,
      appName: name,
      menus,
    });
  }

  // Set initial geometry if provided
  if (geometry) {
    windowManager._addWindow(name as AppType);
    windowManager.updateWindowGeometry(name as AppType, geometry);
  }

  /**
   * Render the test app with providers
   */
  const render = (options?: Partial<RenderOptions>): RenderResult => {
    const element = React.createElement(Component, props);
    const result = renderWithProviders(element, {
      windowManager,
      menu: menuContext,
      ...options,
    });

    // Return RenderResult without testContext for type compatibility
    const { testContext, ...renderResult } = result;
    return renderResult;
  };

  /**
   * Get the mock window manager
   */
  const getWindowManager = (): MockWindowManager => windowManager;

  /**
   * Get the mock menu context
   */
  const getMenuContext = (): MockMenuContext => menuContext;

  /**
   * Simulate opening the app
   */
  const open = (): void => {
    windowManager.openWindow(name as AppType);
    menuContext.setActiveApp(id);
  };

  /**
   * Simulate closing the app
   */
  const close = (): void => {
    windowManager.closeWindow(name as AppType);
    menuContext.setActiveApp(null);
  };

  /**
   * Simulate focusing the app
   */
  const focus = (): void => {
    windowManager.focusWindow(name as AppType);
    menuContext.setActiveApp(id);
  };

  return {
    manifest,
    render,
    getWindowManager,
    getMenuContext,
    open,
    close,
    focus,
  };
}

/**
 * Parse a keyboard shortcut string into components
 *
 * @param shortcut Shortcut string (e.g., "Cmd+S", "Ctrl+Shift+P")
 * @returns Parsed keyboard shortcut
 */
export function parseKeyboardShortcut(shortcut: string): KeyboardShortcut {
  const parts = shortcut.split('+').map(p => p.trim().toLowerCase());
  const key = parts.pop()!;

  return {
    keys: shortcut,
    meta: parts.includes('cmd') || parts.includes('meta') || parts.includes('⌘'),
    ctrl: parts.includes('ctrl') || parts.includes('control') || parts.includes('⌃'),
    shift: parts.includes('shift') || parts.includes('⇧'),
    alt: parts.includes('alt') || parts.includes('option') || parts.includes('⌥'),
    key: key.length === 1 ? key.toUpperCase() : key,
  };
}

/**
 * Simulate a menu action
 *
 * @param menuId Menu identifier (e.g., "file", "edit")
 * @param itemId Menu item identifier
 * @param appId Optional app ID (uses active app if not specified)
 */
export function simulateMenuAction(
  menuId: string,
  itemId: string,
  appId?: string
): void {
  const event = new CustomEvent('zos:menu-action', {
    detail: {
      appId: appId ?? 'active',
      menuId,
      itemId,
    },
    bubbles: true,
    cancelable: true,
  });

  window.dispatchEvent(event);
}

/**
 * Simulate a keyboard shortcut
 *
 * @param shortcut Shortcut string (e.g., "Cmd+S", "Ctrl+Shift+P")
 * @param target Optional target element (defaults to document.body)
 */
export function simulateKeyboardShortcut(
  shortcut: string,
  target: EventTarget = document.body
): void {
  const parsed = parseKeyboardShortcut(shortcut);

  const event = new KeyboardEvent('keydown', {
    key: parsed.key,
    code: `Key${parsed.key.toUpperCase()}`,
    metaKey: parsed.meta ?? false,
    ctrlKey: parsed.ctrl ?? false,
    shiftKey: parsed.shift ?? false,
    altKey: parsed.alt ?? false,
    bubbles: true,
    cancelable: true,
  });

  target.dispatchEvent(event);
}

/**
 * Create a mock DataTransfer object for drag/drop
 */
function createMockDataTransfer(options: DragDropOptions = {}): DataTransfer {
  const data = new Map<string, string>();

  const dt = {
    effectAllowed: options.effectAllowed ?? 'all',
    dropEffect: options.dropEffect ?? 'move',
    types: [] as string[],
    files: [] as unknown as FileList,
    items: [] as DataTransferItem[],

    setData(format: string, value: string): void {
      data.set(format, value);
      if (!this.types.includes(format)) {
        (this.types as string[]).push(format);
      }
    },

    getData(format: string): string {
      return data.get(format) ?? '';
    },

    clearData(format?: string): void {
      if (format) {
        data.delete(format);
        (this.types as string[]) = this.types.filter(t => t !== format);
      } else {
        data.clear();
        (this.types as string[]).length = 0;
      }
    },

    setDragImage(): void {
      // No-op in tests
    },
  };

  // Apply initial data
  if (options.dataTransfer) {
    for (const [key, value] of Object.entries(options.dataTransfer)) {
      dt.setData(key, value);
    }
  }

  return dt as unknown as DataTransfer;
}

/**
 * Simulate drag and drop between two elements
 *
 * @param sourceId Test ID of the source element
 * @param targetId Test ID of the target element
 * @param options Drag/drop options
 */
export function simulateDragDrop(
  sourceId: string,
  targetId: string,
  options: DragDropOptions = {}
): void {
  const source = document.querySelector(`[data-testid="${sourceId}"]`);
  const target = document.querySelector(`[data-testid="${targetId}"]`);

  if (!source || !target) {
    throw new Error(
      `Cannot find elements for drag/drop: source=${sourceId}, target=${targetId}`
    );
  }

  const dataTransfer = createMockDataTransfer(options);

  // Dispatch dragstart on source
  const dragStartEvent = new DragEvent('dragstart', {
    bubbles: true,
    cancelable: true,
    dataTransfer,
  });
  source.dispatchEvent(dragStartEvent);

  // Dispatch dragenter on target
  const dragEnterEvent = new DragEvent('dragenter', {
    bubbles: true,
    cancelable: true,
    dataTransfer,
  });
  target.dispatchEvent(dragEnterEvent);

  // Dispatch dragover on target
  const dragOverEvent = new DragEvent('dragover', {
    bubbles: true,
    cancelable: true,
    dataTransfer,
  });
  target.dispatchEvent(dragOverEvent);

  // Dispatch drop on target
  const dropEvent = new DragEvent('drop', {
    bubbles: true,
    cancelable: true,
    dataTransfer,
  });
  target.dispatchEvent(dropEvent);

  // Dispatch dragend on source
  const dragEndEvent = new DragEvent('dragend', {
    bubbles: true,
    cancelable: true,
    dataTransfer,
  });
  source.dispatchEvent(dragEndEvent);
}

/**
 * Simulate dragging from outside the window (e.g., file drop)
 *
 * @param targetId Test ID of the drop target
 * @param files Array of mock file objects
 */
export function simulateFileDrop(
  targetId: string,
  files: Array<{ name: string; type: string; content?: string }>
): void {
  const target = document.querySelector(`[data-testid="${targetId}"]`);
  if (!target) {
    throw new Error(`Cannot find drop target: ${targetId}`);
  }

  // Create mock File objects
  const mockFiles = files.map(f => {
    const content = f.content ?? '';
    const blob = new Blob([content], { type: f.type });
    return new File([blob], f.name, { type: f.type });
  });

  // Create FileList-like object
  const fileList = {
    length: mockFiles.length,
    item: (index: number) => mockFiles[index] ?? null,
    [Symbol.iterator]: function* () {
      for (const file of mockFiles) {
        yield file;
      }
    },
  };

  // Assign numeric indices
  mockFiles.forEach((file, index) => {
    (fileList as any)[index] = file;
  });

  const dataTransfer = createMockDataTransfer();
  Object.defineProperty(dataTransfer, 'files', {
    value: fileList as unknown as FileList,
    writable: false,
  });

  // Dispatch dragenter
  target.dispatchEvent(
    new DragEvent('dragenter', {
      bubbles: true,
      cancelable: true,
      dataTransfer,
    })
  );

  // Dispatch dragover
  target.dispatchEvent(
    new DragEvent('dragover', {
      bubbles: true,
      cancelable: true,
      dataTransfer,
    })
  );

  // Dispatch drop
  target.dispatchEvent(
    new DragEvent('drop', {
      bubbles: true,
      cancelable: true,
      dataTransfer,
    })
  );
}

/**
 * Simulate window resize event
 *
 * @param width New window width
 * @param height New window height
 */
export function simulateWindowResize(width: number, height: number): void {
  Object.defineProperty(window, 'innerWidth', { value: width, writable: true });
  Object.defineProperty(window, 'innerHeight', { value: height, writable: true });

  window.dispatchEvent(new Event('resize'));
}

/**
 * Simulate visibility change (tab focus/blur)
 *
 * @param hidden Whether the document is hidden
 */
export function simulateVisibilityChange(hidden: boolean): void {
  Object.defineProperty(document, 'hidden', { value: hidden, writable: true });
  Object.defineProperty(document, 'visibilityState', {
    value: hidden ? 'hidden' : 'visible',
    writable: true,
  });

  document.dispatchEvent(new Event('visibilitychange'));
}

/**
 * Simulate online/offline status change
 *
 * @param online Whether the browser is online
 */
export function simulateNetworkChange(online: boolean): void {
  Object.defineProperty(navigator, 'onLine', { value: online, writable: true });

  window.dispatchEvent(new Event(online ? 'online' : 'offline'));
}

/**
 * Simulate localStorage storage event (for cross-tab communication)
 *
 * @param key Storage key that changed
 * @param oldValue Previous value
 * @param newValue New value
 */
export function simulateStorageEvent(
  key: string,
  oldValue: string | null,
  newValue: string | null
): void {
  window.dispatchEvent(
    new StorageEvent('storage', {
      key,
      oldValue,
      newValue,
      storageArea: localStorage,
      url: window.location.href,
    })
  );
}
