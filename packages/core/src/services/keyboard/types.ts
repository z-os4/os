/**
 * Keyboard Shortcuts Manager Types
 *
 * Core type definitions for the keyboard shortcuts system.
 */

/** Scope determines where a shortcut is active */
export type ShortcutScope = 'global' | 'app' | 'element';

/** Priority levels for shortcut execution order */
export const PRIORITY = {
  SYSTEM: 100,
  APP: 50,
  CUSTOM: 10,
} as const;

/**
 * A keyboard shortcut definition
 */
export interface Shortcut {
  /** Unique identifier for this shortcut */
  id: string;

  /**
   * Key combination string, e.g., "Cmd+Shift+P", "Ctrl+S", "Alt+Enter"
   * Uses platform-agnostic names: Cmd, Ctrl, Alt, Shift, Meta
   * Cmd is normalized to Ctrl on non-Mac platforms
   */
  keys: string;

  /** Human-readable description of what this shortcut does */
  description: string;

  /** Function to execute when shortcut is triggered */
  action: () => void;

  /** Scope where this shortcut is active */
  scope: ShortcutScope;

  /**
   * Priority for execution order when multiple shortcuts match
   * Higher priority executes first. System=100, App=50, Custom=10
   */
  priority: number;

  /** Whether this shortcut is currently enabled (default: true) */
  enabled?: boolean;

  /**
   * Conditional execution predicate
   * If provided, shortcut only triggers when this returns true
   */
  when?: () => boolean;

  /** Optional group/category for UI organization */
  group?: string;
}

/**
 * A group of related shortcuts for UI display
 */
export interface ShortcutGroup {
  /** Unique identifier for this group */
  id: string;

  /** Display label for the group */
  label: string;

  /** Shortcuts in this group */
  shortcuts: Shortcut[];
}

/**
 * Conflict information when multiple shortcuts use the same key combination
 */
export interface ShortcutConflict {
  /** The conflicting key combination */
  keys: string;

  /** All shortcuts registered for this combination */
  shortcuts: Shortcut[];
}

/**
 * Options for registering a shortcut via hooks
 */
export interface ShortcutOptions {
  /** Human-readable description */
  description?: string;

  /** Scope where shortcut is active */
  scope?: ShortcutScope;

  /** Execution priority */
  priority?: number;

  /** Conditional execution predicate */
  when?: () => boolean;

  /** Whether shortcut is enabled */
  enabled?: boolean;

  /** Group/category for UI organization */
  group?: string;
}

/**
 * Keyboard event listener function type
 */
export type KeyboardListener = (event: KeyboardEvent) => void;

/**
 * Subscription callback for shortcut changes
 */
export type ShortcutChangeListener = () => void;

/**
 * Platform detection result
 */
export interface PlatformInfo {
  isMac: boolean;
  isWindows: boolean;
  isLinux: boolean;
}

/**
 * Parsed key combination
 */
export interface ParsedKeys {
  ctrl: boolean;
  alt: boolean;
  shift: boolean;
  meta: boolean;
  key: string;
}
