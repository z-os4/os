/**
 * useKeyboardShortcuts Hook
 *
 * Register multiple keyboard shortcuts at once with automatic cleanup.
 */

import { useEffect, useRef, useCallback } from 'react';
import { keyboardManager } from './KeyboardShortcutManager';
import { ShortcutOptions, PRIORITY } from './types';

let batchCounter = 0;

/**
 * Shortcut definition for batch registration
 */
export interface ShortcutDefinition {
  /** Key combination string (e.g., "Cmd+S") */
  keys: string;

  /** Callback to execute when triggered */
  action: () => void;

  /** Human-readable description */
  description?: string;

  /** Scope where shortcut is active */
  scope?: 'global' | 'app' | 'element';

  /** Execution priority */
  priority?: number;

  /** Conditional execution predicate */
  when?: () => boolean;

  /** Whether shortcut is enabled */
  enabled?: boolean;

  /** Group for UI organization */
  group?: string;
}

/**
 * Register multiple keyboard shortcuts at once
 *
 * All shortcuts are registered on mount and cleaned up on unmount.
 * Changes to the shortcuts array trigger re-registration.
 *
 * @param shortcuts Array of shortcut definitions
 *
 * @example
 * // Basic usage
 * useKeyboardShortcuts([
 *   { keys: 'Cmd+S', action: save, description: 'Save' },
 *   { keys: 'Cmd+Z', action: undo, description: 'Undo' },
 *   { keys: 'Cmd+Shift+Z', action: redo, description: 'Redo' },
 * ]);
 *
 * @example
 * // With groups and priorities
 * useKeyboardShortcuts([
 *   {
 *     keys: 'Cmd+N',
 *     action: () => createNew(),
 *     description: 'New document',
 *     group: 'File',
 *     priority: 50,
 *   },
 *   {
 *     keys: 'Cmd+O',
 *     action: () => openFile(),
 *     description: 'Open file',
 *     group: 'File',
 *     priority: 50,
 *   },
 * ]);
 */
export function useKeyboardShortcuts(shortcuts: ShortcutDefinition[]): void {
  // Store stable action refs
  const actionsRef = useRef<Map<number, () => void>>(new Map());
  const whensRef = useRef<Map<number, (() => boolean) | undefined>>(new Map());
  const batchIdRef = useRef<number>(++batchCounter);

  // Update action refs on each render
  shortcuts.forEach((s, i) => {
    actionsRef.current.set(i, s.action);
    whensRef.current.set(i, s.when);
  });

  useEffect(() => {
    const batchId = batchIdRef.current;
    const cleanups: (() => void)[] = [];

    shortcuts.forEach((shortcut, index) => {
      const id = `batch-${batchId}-${index}`;

      // Create stable wrappers that use refs
      const wrappedAction = () => {
        const action = actionsRef.current.get(index);
        action?.();
      };

      const wrappedWhen = shortcut.when
        ? () => {
            const when = whensRef.current.get(index);
            return when ? when() : true;
          }
        : undefined;

      const cleanup = keyboardManager.register({
        id,
        keys: shortcut.keys,
        description: shortcut.description ?? '',
        action: wrappedAction,
        scope: shortcut.scope ?? 'app',
        priority: shortcut.priority ?? PRIORITY.CUSTOM,
        enabled: shortcut.enabled ?? true,
        when: wrappedWhen,
        group: shortcut.group,
      });

      cleanups.push(cleanup);
    });

    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [
    // Re-register if keys, descriptions, scopes, priorities, or enabled states change
    shortcuts
      .map((s) => `${s.keys}:${s.description}:${s.scope}:${s.priority}:${s.enabled}:${s.group}`)
      .join('|'),
  ]);
}

export default useKeyboardShortcuts;
