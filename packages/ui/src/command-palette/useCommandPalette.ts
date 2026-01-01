/**
 * useCommandPalette Hook
 *
 * Hook for accessing and controlling the command palette.
 */

import { useContext, useEffect } from 'react';
import { CommandPaletteContext } from './CommandPaletteContext';
import type { PaletteCommand as Command, CommandPaletteContextValue } from './types';

/**
 * Hook to access the command palette context.
 *
 * @example
 * ```tsx
 * const { open, registerCommand, isOpen } = useCommandPalette();
 *
 * // Register a custom command
 * registerCommand({
 *   id: 'notes:new-note',
 *   title: 'New Note',
 *   subtitle: 'Create a new note',
 *   icon: <Plus />,
 *   category: 'Actions',
 *   type: 'ACTION',
 *   keywords: ['create', 'add', 'note'],
 *   shortcut: 'Cmd+N',
 *   action: () => createNewNote(),
 * });
 * ```
 */
export function useCommandPalette(): CommandPaletteContextValue {
  const context = useContext(CommandPaletteContext);

  if (!context) {
    throw new Error(
      'useCommandPalette must be used within a CommandPaletteProvider'
    );
  }

  return context;
}

/**
 * Hook to register commands that auto-unregister on unmount.
 *
 * @example
 * ```tsx
 * useRegisterCommands([
 *   {
 *     id: 'editor:save',
 *     title: 'Save File',
 *     action: () => saveFile(),
 *     // ... other fields
 *   },
 * ]);
 * ```
 */
export function useRegisterCommands(commands: Command[]): void {
  const { registerCommands, unregisterCommand } = useCommandPalette();

  useEffect(() => {
    registerCommands(commands);

    return () => {
      for (const command of commands) {
        unregisterCommand(command.id);
      }
    };
  }, [commands, registerCommands, unregisterCommand]);
}

/**
 * Hook to register a single command that auto-unregisters on unmount.
 *
 * @example
 * ```tsx
 * useRegisterCommand({
 *   id: 'app:action',
 *   title: 'Do Something',
 *   action: () => doSomething(),
 *   // ... other fields
 * });
 * ```
 */
export function useRegisterCommand(command: Command): void {
  const { registerCommand, unregisterCommand } = useCommandPalette();

  useEffect(() => {
    registerCommand(command);

    return () => {
      unregisterCommand(command.id);
    };
  }, [command, registerCommand, unregisterCommand]);
}

export default useCommandPalette;
