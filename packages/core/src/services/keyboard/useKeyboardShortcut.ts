/**
 * useKeyboardShortcut Hook
 *
 * Register a single keyboard shortcut with automatic cleanup.
 */

import { useEffect, useRef, useCallback } from 'react';
import { keyboardManager } from './KeyboardShortcutManager';
import { ShortcutOptions, PRIORITY } from './types';

let shortcutCounter = 0;

/**
 * Generate a unique shortcut ID
 */
function generateId(): string {
  return `shortcut-${++shortcutCounter}-${Date.now()}`;
}

/**
 * Register a keyboard shortcut with automatic cleanup
 *
 * @param keys Key combination string (e.g., "Cmd+S", "Ctrl+Shift+P")
 * @param action Callback to execute when shortcut is triggered
 * @param options Optional configuration
 *
 * @example
 * // Basic usage
 * useKeyboardShortcut('Cmd+S', () => {
 *   saveDocument();
 * });
 *
 * @example
 * // With options
 * useKeyboardShortcut('Cmd+Shift+P', () => {
 *   openCommandPalette();
 * }, {
 *   description: 'Open command palette',
 *   scope: 'global',
 *   priority: 100,
 * });
 *
 * @example
 * // Conditional execution
 * useKeyboardShortcut('Escape', () => {
 *   closeModal();
 * }, {
 *   when: () => isModalOpen,
 *   description: 'Close modal',
 * });
 */
export function useKeyboardShortcut(
  keys: string,
  action: () => void,
  options?: ShortcutOptions
): void {
  // Stable references
  const actionRef = useRef(action);
  const whenRef = useRef(options?.when);
  const idRef = useRef<string>(generateId());

  // Update refs on each render
  actionRef.current = action;
  whenRef.current = options?.when;

  // Create stable wrapped action
  const wrappedAction = useCallback(() => {
    actionRef.current();
  }, []);

  // Create stable when predicate
  const wrappedWhen = useCallback(() => {
    return whenRef.current ? whenRef.current() : true;
  }, []);

  useEffect(() => {
    const id = idRef.current;

    const cleanup = keyboardManager.register({
      id,
      keys,
      description: options?.description ?? '',
      action: wrappedAction,
      scope: options?.scope ?? 'app',
      priority: options?.priority ?? PRIORITY.CUSTOM,
      enabled: options?.enabled ?? true,
      when: options?.when ? wrappedWhen : undefined,
      group: options?.group,
    });

    return cleanup;
  }, [
    keys,
    wrappedAction,
    wrappedWhen,
    options?.description,
    options?.scope,
    options?.priority,
    options?.enabled,
    options?.group,
    // Note: options?.when intentionally excluded to use ref
  ]);
}

export default useKeyboardShortcut;
