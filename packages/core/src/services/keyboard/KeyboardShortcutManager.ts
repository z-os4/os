/**
 * Keyboard Shortcut Manager
 *
 * Singleton manager for registering, normalizing, and executing keyboard shortcuts.
 * Handles cross-platform key normalization, priority ordering, and conflict detection.
 */

import {
  Shortcut,
  ShortcutConflict,
  ShortcutChangeListener,
  PlatformInfo,
  ParsedKeys,
  PRIORITY,
} from './types';

/**
 * Detect platform for key normalization
 */
function detectPlatform(): PlatformInfo {
  if (typeof navigator === 'undefined') {
    return { isMac: false, isWindows: false, isLinux: false };
  }
  const platform = navigator.platform?.toLowerCase() ?? '';
  const userAgent = navigator.userAgent?.toLowerCase() ?? '';

  return {
    isMac: platform.includes('mac') || userAgent.includes('mac'),
    isWindows: platform.includes('win') || userAgent.includes('win'),
    isLinux: platform.includes('linux') || userAgent.includes('linux'),
  };
}

/**
 * Keyboard Shortcut Manager
 *
 * Manages keyboard shortcuts with support for:
 * - Cross-platform key normalization (Cmd on Mac = Ctrl elsewhere)
 * - Priority-based execution ordering
 * - Conflict detection
 * - Conditional execution via `when` predicates
 * - Scope-based activation (global, app, element)
 */
class KeyboardShortcutManager {
  /** Map of normalized key strings to arrays of shortcuts */
  private shortcuts: Map<string, Shortcut[]> = new Map();

  /** Set of listeners notified on shortcut changes */
  private listeners: Set<ShortcutChangeListener> = new Set();

  /** Cached platform info */
  private platform: PlatformInfo;

  /** Whether the global keydown listener is attached */
  private listenerAttached = false;

  /** Bound keydown handler for cleanup */
  private boundKeyHandler: (e: KeyboardEvent) => void;

  constructor() {
    this.platform = detectPlatform();
    this.boundKeyHandler = this.handleKeyDown.bind(this);
  }

  /**
   * Register a keyboard shortcut
   * @param shortcut The shortcut to register
   * @returns Cleanup function to unregister
   */
  register(shortcut: Shortcut): () => void {
    const normalizedKeys = this.normalizeKeys(shortcut.keys);
    const existing = this.shortcuts.get(normalizedKeys) ?? [];

    // Add shortcut and sort by priority (highest first)
    existing.push({ ...shortcut, keys: normalizedKeys });
    existing.sort((a, b) => b.priority - a.priority);

    this.shortcuts.set(normalizedKeys, existing);
    this.ensureListener();
    this.notifyListeners();

    return () => this.unregister(shortcut.id);
  }

  /**
   * Unregister a shortcut by ID
   * @param id The shortcut ID to remove
   */
  unregister(id: string): void {
    for (const [keys, shortcuts] of this.shortcuts) {
      const filtered = shortcuts.filter((s) => s.id !== id);
      if (filtered.length !== shortcuts.length) {
        if (filtered.length === 0) {
          this.shortcuts.delete(keys);
        } else {
          this.shortcuts.set(keys, filtered);
        }
        this.notifyListeners();
        break;
      }
    }

    // Remove listener if no shortcuts remain
    if (this.shortcuts.size === 0) {
      this.removeListener();
    }
  }

  /**
   * Execute shortcuts matching the given key combination
   * @param keys The key combination string
   * @returns true if a shortcut was executed, false otherwise
   */
  execute(keys: string): boolean {
    const normalizedKeys = this.normalizeKeys(keys);
    const shortcuts = this.shortcuts.get(normalizedKeys);

    if (!shortcuts || shortcuts.length === 0) {
      return false;
    }

    // Execute first matching shortcut (highest priority that passes conditions)
    for (const shortcut of shortcuts) {
      // Check if enabled
      if (shortcut.enabled === false) {
        continue;
      }

      // Check conditional execution
      if (shortcut.when && !shortcut.when()) {
        continue;
      }

      try {
        shortcut.action();
        return true;
      } catch (error) {
        console.error(`[KeyboardManager] Error executing shortcut "${shortcut.id}":`, error);
        return true; // Still consumed the event
      }
    }

    return false;
  }

  /**
   * Get all registered shortcuts
   * @returns Array of all shortcuts
   */
  getAll(): Shortcut[] {
    const all: Shortcut[] = [];
    for (const shortcuts of this.shortcuts.values()) {
      all.push(...shortcuts);
    }
    return all;
  }

  /**
   * Get shortcuts grouped by their group property
   * @returns Map of group ID to shortcuts
   */
  getGrouped(): Map<string, Shortcut[]> {
    const grouped = new Map<string, Shortcut[]>();
    for (const shortcut of this.getAll()) {
      const groupId = shortcut.group ?? 'ungrouped';
      const existing = grouped.get(groupId) ?? [];
      existing.push(shortcut);
      grouped.set(groupId, existing);
    }
    return grouped;
  }

  /**
   * Detect conflicting shortcuts (same key, multiple shortcuts)
   * @returns Array of conflicts
   */
  getConflicts(): ShortcutConflict[] {
    const conflicts: ShortcutConflict[] = [];
    for (const [keys, shortcuts] of this.shortcuts) {
      if (shortcuts.length > 1) {
        conflicts.push({ keys, shortcuts: [...shortcuts] });
      }
    }
    return conflicts;
  }

  /**
   * Check if a key combination has any registered shortcuts
   * @param keys The key combination to check
   */
  hasShortcut(keys: string): boolean {
    const normalizedKeys = this.normalizeKeys(keys);
    return this.shortcuts.has(normalizedKeys);
  }

  /**
   * Get shortcuts for a specific key combination
   * @param keys The key combination
   */
  getShortcuts(keys: string): Shortcut[] {
    const normalizedKeys = this.normalizeKeys(keys);
    return [...(this.shortcuts.get(normalizedKeys) ?? [])];
  }

  /**
   * Subscribe to shortcut changes
   * @param listener Callback invoked on changes
   * @returns Cleanup function
   */
  subscribe(listener: ShortcutChangeListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Get platform info
   */
  getPlatform(): PlatformInfo {
    return { ...this.platform };
  }

  /**
   * Check if running on Mac
   */
  isMac(): boolean {
    return this.platform.isMac;
  }

  /**
   * Format keys for display (using platform-specific symbols)
   * @param keys The key combination
   */
  formatForDisplay(keys: string): string {
    const parsed = this.parseKeys(keys);
    const parts: string[] = [];

    if (this.platform.isMac) {
      if (parsed.ctrl) parts.push('\u2303'); // Control
      if (parsed.alt) parts.push('\u2325'); // Option
      if (parsed.shift) parts.push('\u21E7'); // Shift
      if (parsed.meta) parts.push('\u2318'); // Command
    } else {
      if (parsed.ctrl) parts.push('Ctrl');
      if (parsed.alt) parts.push('Alt');
      if (parsed.shift) parts.push('Shift');
      if (parsed.meta) parts.push('Meta');
    }

    // Format the key
    const keyDisplay = this.formatKeyForDisplay(parsed.key);
    parts.push(keyDisplay);

    return this.platform.isMac ? parts.join('') : parts.join('+');
  }

  /**
   * Normalize a key combination string to a consistent format
   * Handles platform differences (Cmd -> Ctrl on non-Mac)
   */
  normalizeKeys(keys: string): string {
    const parsed = this.parseKeys(keys);

    // Build normalized string in consistent order: Ctrl+Alt+Shift+Meta+Key
    const parts: string[] = [];
    if (parsed.ctrl) parts.push('Ctrl');
    if (parsed.alt) parts.push('Alt');
    if (parsed.shift) parts.push('Shift');
    if (parsed.meta) parts.push('Meta');
    parts.push(parsed.key.toLowerCase());

    return parts.join('+');
  }

  /**
   * Parse a key combination string into components
   */
  private parseKeys(keys: string): ParsedKeys {
    const parts = keys.split('+').map((p) => p.trim().toLowerCase());

    let ctrl = false;
    let alt = false;
    let shift = false;
    let meta = false;
    let key = '';

    for (const part of parts) {
      switch (part) {
        case 'ctrl':
        case 'control':
          ctrl = true;
          break;
        case 'alt':
        case 'option':
        case 'opt':
          alt = true;
          break;
        case 'shift':
          shift = true;
          break;
        case 'meta':
        case 'super':
        case 'win':
        case 'windows':
          meta = true;
          break;
        case 'cmd':
        case 'command':
          // Cmd = Meta on Mac, Ctrl on others
          if (this.platform.isMac) {
            meta = true;
          } else {
            ctrl = true;
          }
          break;
        default:
          key = part;
      }
    }

    return { ctrl, alt, shift, meta, key };
  }

  /**
   * Parse a KeyboardEvent into a normalized key string
   */
  parseKeyEvent(e: KeyboardEvent): string {
    const parts: string[] = [];

    if (e.ctrlKey) parts.push('Ctrl');
    if (e.altKey) parts.push('Alt');
    if (e.shiftKey) parts.push('Shift');
    if (e.metaKey) parts.push('Meta');

    // Get the key, normalizing special cases
    let key = e.key;

    // Skip if only modifier was pressed
    if (['Control', 'Alt', 'Shift', 'Meta'].includes(key)) {
      return '';
    }

    // Normalize key names
    key = this.normalizeKeyName(key);
    parts.push(key.toLowerCase());

    return parts.join('+');
  }

  /**
   * Normalize a key name to consistent format
   */
  private normalizeKeyName(key: string): string {
    // Map special keys to consistent names
    const keyMap: Record<string, string> = {
      ' ': 'space',
      'Escape': 'escape',
      'Enter': 'enter',
      'Return': 'enter',
      'Tab': 'tab',
      'Backspace': 'backspace',
      'Delete': 'delete',
      'ArrowUp': 'up',
      'ArrowDown': 'down',
      'ArrowLeft': 'left',
      'ArrowRight': 'right',
      'Home': 'home',
      'End': 'end',
      'PageUp': 'pageup',
      'PageDown': 'pagedown',
      'Insert': 'insert',
    };

    return keyMap[key] ?? key;
  }

  /**
   * Format a key for display
   */
  private formatKeyForDisplay(key: string): string {
    const displayMap: Record<string, string> = {
      space: this.platform.isMac ? 'Space' : 'Space',
      escape: this.platform.isMac ? '\u238B' : 'Esc',
      enter: this.platform.isMac ? '\u21A9' : 'Enter',
      tab: this.platform.isMac ? '\u21E5' : 'Tab',
      backspace: this.platform.isMac ? '\u232B' : 'Backspace',
      delete: this.platform.isMac ? '\u2326' : 'Delete',
      up: this.platform.isMac ? '\u2191' : 'Up',
      down: this.platform.isMac ? '\u2193' : 'Down',
      left: this.platform.isMac ? '\u2190' : 'Left',
      right: this.platform.isMac ? '\u2192' : 'Right',
      home: 'Home',
      end: 'End',
      pageup: 'PgUp',
      pagedown: 'PgDn',
    };

    return displayMap[key.toLowerCase()] ?? key.toUpperCase();
  }

  /**
   * Handle keydown events
   */
  private handleKeyDown(e: KeyboardEvent): void {
    const keys = this.parseKeyEvent(e);
    if (!keys) return;

    // Don't intercept shortcuts when typing in input fields (unless global scope)
    const target = e.target as HTMLElement;
    const isInputField =
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable;

    // Get matching shortcuts
    const normalizedKeys = this.normalizeKeys(keys);
    const shortcuts = this.shortcuts.get(normalizedKeys);

    if (!shortcuts || shortcuts.length === 0) return;

    // Find first executable shortcut
    for (const shortcut of shortcuts) {
      // Check if enabled
      if (shortcut.enabled === false) continue;

      // Skip non-global shortcuts when in input fields
      if (isInputField && shortcut.scope !== 'global') continue;

      // Check conditional execution
      if (shortcut.when && !shortcut.when()) continue;

      // Execute the shortcut
      try {
        e.preventDefault();
        e.stopPropagation();
        shortcut.action();
        return;
      } catch (error) {
        console.error(`[KeyboardManager] Error executing shortcut "${shortcut.id}":`, error);
        return;
      }
    }
  }

  /**
   * Ensure the global keydown listener is attached
   */
  private ensureListener(): void {
    if (this.listenerAttached || typeof window === 'undefined') return;

    window.addEventListener('keydown', this.boundKeyHandler, { capture: true });
    this.listenerAttached = true;
  }

  /**
   * Remove the global keydown listener
   */
  private removeListener(): void {
    if (!this.listenerAttached || typeof window === 'undefined') return;

    window.removeEventListener('keydown', this.boundKeyHandler, { capture: true });
    this.listenerAttached = false;
  }

  /**
   * Notify all listeners of changes
   */
  private notifyListeners(): void {
    for (const listener of this.listeners) {
      try {
        listener();
      } catch (error) {
        console.error('[KeyboardManager] Error in listener:', error);
      }
    }
  }

  /**
   * Clear all registered shortcuts
   */
  clear(): void {
    this.shortcuts.clear();
    this.removeListener();
    this.notifyListeners();
  }
}

/** Singleton instance */
export const keyboardManager = new KeyboardShortcutManager();

/** Export class for testing */
export { KeyboardShortcutManager };
