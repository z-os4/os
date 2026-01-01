/**
 * System Shortcuts
 *
 * Default system-level keyboard shortcuts for zOS.
 * These are registered at the highest priority and are always available.
 */

import { Shortcut, PRIORITY } from './types';

/**
 * System shortcut definitions
 *
 * These shortcuts can be registered by calling registerSystemShortcuts()
 * with the appropriate action handlers.
 */
export interface SystemShortcutHandlers {
  /** Show/hide Spotlight-like search */
  showSpotlight?: () => void;

  /** Open application launcher */
  openLauncher?: () => void;

  /** Show keyboard shortcuts panel */
  showShortcuts?: () => void;

  /** Show notification center */
  showNotifications?: () => void;

  /** Lock screen */
  lockScreen?: () => void;

  /** Take screenshot */
  takeScreenshot?: () => void;

  /** Take screenshot of selection */
  takeScreenshotSelection?: () => void;

  /** Toggle fullscreen */
  toggleFullscreen?: () => void;

  /** Show desktop (minimize all) */
  showDesktop?: () => void;

  /** Switch to next window */
  nextWindow?: () => void;

  /** Switch to previous window */
  prevWindow?: () => void;

  /** Close current window */
  closeWindow?: () => void;

  /** Minimize current window */
  minimizeWindow?: () => void;

  /** Show Mission Control / Window overview */
  showMissionControl?: () => void;

  /** Open Terminal */
  openTerminal?: () => void;

  /** Open Settings */
  openSettings?: () => void;

  /** Copy */
  copy?: () => void;

  /** Cut */
  cut?: () => void;

  /** Paste */
  paste?: () => void;

  /** Undo */
  undo?: () => void;

  /** Redo */
  redo?: () => void;

  /** Select all */
  selectAll?: () => void;

  /** Find */
  find?: () => void;

  /** Save */
  save?: () => void;

  /** Quit/Close application */
  quit?: () => void;
}

/**
 * Create system shortcuts from handlers
 *
 * @param handlers Object with handler functions for each system shortcut
 * @returns Array of Shortcut definitions to register
 */
export function createSystemShortcuts(handlers: SystemShortcutHandlers): Shortcut[] {
  const shortcuts: Shortcut[] = [];

  // Helper to add shortcut if handler exists
  const add = (
    id: string,
    keys: string,
    description: string,
    action: (() => void) | undefined,
    group: string = 'System'
  ) => {
    if (action) {
      shortcuts.push({
        id: `system:${id}`,
        keys,
        description,
        action,
        scope: 'global',
        priority: PRIORITY.SYSTEM,
        group,
      });
    }
  };

  // System shortcuts
  add('spotlight', 'Cmd+Space', 'Open Spotlight search', handlers.showSpotlight);
  add('launcher', 'Cmd+Shift+Space', 'Open application launcher', handlers.openLauncher);
  add('shortcuts', 'Cmd+/', 'Show keyboard shortcuts', handlers.showShortcuts);
  add('notifications', 'Cmd+N', 'Show notifications', handlers.showNotifications);
  add('lock', 'Cmd+Ctrl+Q', 'Lock screen', handlers.lockScreen);

  // Screenshot shortcuts
  add('screenshot', 'Cmd+Shift+3', 'Take screenshot', handlers.takeScreenshot, 'Screenshots');
  add(
    'screenshot-selection',
    'Cmd+Shift+4',
    'Take screenshot of selection',
    handlers.takeScreenshotSelection,
    'Screenshots'
  );

  // Window management
  add('fullscreen', 'Cmd+Ctrl+F', 'Toggle fullscreen', handlers.toggleFullscreen, 'Windows');
  add('show-desktop', 'Cmd+F3', 'Show desktop', handlers.showDesktop, 'Windows');
  add('next-window', 'Cmd+`', 'Next window', handlers.nextWindow, 'Windows');
  add('prev-window', 'Cmd+Shift+`', 'Previous window', handlers.prevWindow, 'Windows');
  add('close-window', 'Cmd+W', 'Close window', handlers.closeWindow, 'Windows');
  add('minimize', 'Cmd+M', 'Minimize window', handlers.minimizeWindow, 'Windows');
  add('mission-control', 'Ctrl+Up', 'Mission Control', handlers.showMissionControl, 'Windows');

  // Applications
  add('terminal', 'Cmd+Shift+T', 'Open Terminal', handlers.openTerminal, 'Applications');
  add('settings', 'Cmd+,', 'Open Settings', handlers.openSettings, 'Applications');

  // Editing shortcuts
  add('copy', 'Cmd+C', 'Copy', handlers.copy, 'Edit');
  add('cut', 'Cmd+X', 'Cut', handlers.cut, 'Edit');
  add('paste', 'Cmd+V', 'Paste', handlers.paste, 'Edit');
  add('undo', 'Cmd+Z', 'Undo', handlers.undo, 'Edit');
  add('redo', 'Cmd+Shift+Z', 'Redo', handlers.redo, 'Edit');
  add('select-all', 'Cmd+A', 'Select all', handlers.selectAll, 'Edit');
  add('find', 'Cmd+F', 'Find', handlers.find, 'Edit');
  add('save', 'Cmd+S', 'Save', handlers.save, 'Edit');

  // Application control
  add('quit', 'Cmd+Q', 'Quit application', handlers.quit, 'Application');

  return shortcuts;
}

/**
 * Default system shortcuts with no-op handlers (for reference)
 */
export const DEFAULT_SYSTEM_SHORTCUTS: Array<{
  id: string;
  keys: string;
  description: string;
  group: string;
}> = [
  // System
  { id: 'spotlight', keys: 'Cmd+Space', description: 'Open Spotlight search', group: 'System' },
  { id: 'launcher', keys: 'Cmd+Shift+Space', description: 'Open application launcher', group: 'System' },
  { id: 'shortcuts', keys: 'Cmd+/', description: 'Show keyboard shortcuts', group: 'System' },
  { id: 'notifications', keys: 'Cmd+N', description: 'Show notifications', group: 'System' },
  { id: 'lock', keys: 'Cmd+Ctrl+Q', description: 'Lock screen', group: 'System' },

  // Screenshots
  { id: 'screenshot', keys: 'Cmd+Shift+3', description: 'Take screenshot', group: 'Screenshots' },
  { id: 'screenshot-selection', keys: 'Cmd+Shift+4', description: 'Take screenshot of selection', group: 'Screenshots' },

  // Windows
  { id: 'fullscreen', keys: 'Cmd+Ctrl+F', description: 'Toggle fullscreen', group: 'Windows' },
  { id: 'show-desktop', keys: 'Cmd+F3', description: 'Show desktop', group: 'Windows' },
  { id: 'next-window', keys: 'Cmd+`', description: 'Next window', group: 'Windows' },
  { id: 'prev-window', keys: 'Cmd+Shift+`', description: 'Previous window', group: 'Windows' },
  { id: 'close-window', keys: 'Cmd+W', description: 'Close window', group: 'Windows' },
  { id: 'minimize', keys: 'Cmd+M', description: 'Minimize window', group: 'Windows' },
  { id: 'mission-control', keys: 'Ctrl+Up', description: 'Mission Control', group: 'Windows' },

  // Applications
  { id: 'terminal', keys: 'Cmd+Shift+T', description: 'Open Terminal', group: 'Applications' },
  { id: 'settings', keys: 'Cmd+,', description: 'Open Settings', group: 'Applications' },

  // Edit
  { id: 'copy', keys: 'Cmd+C', description: 'Copy', group: 'Edit' },
  { id: 'cut', keys: 'Cmd+X', description: 'Cut', group: 'Edit' },
  { id: 'paste', keys: 'Cmd+V', description: 'Paste', group: 'Edit' },
  { id: 'undo', keys: 'Cmd+Z', description: 'Undo', group: 'Edit' },
  { id: 'redo', keys: 'Cmd+Shift+Z', description: 'Redo', group: 'Edit' },
  { id: 'select-all', keys: 'Cmd+A', description: 'Select all', group: 'Edit' },
  { id: 'find', keys: 'Cmd+F', description: 'Find', group: 'Edit' },
  { id: 'save', keys: 'Cmd+S', description: 'Save', group: 'Edit' },

  // Application
  { id: 'quit', keys: 'Cmd+Q', description: 'Quit application', group: 'Application' },
];
