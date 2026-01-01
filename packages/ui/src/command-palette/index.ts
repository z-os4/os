/**
 * Command Palette Module
 *
 * Spotlight-style command palette for zOS.
 *
 * @example
 * ```tsx
 * import {
 *   CommandPaletteProvider,
 *   CommandPalette,
 *   useCommandPalette,
 * } from '@z-os/ui/command-palette';
 *
 * // Wrap your app
 * <CommandPaletteProvider>
 *   <App />
 *   <CommandPalette />
 * </CommandPaletteProvider>
 *
 * // Use the hook anywhere
 * const { open, registerCommand } = useCommandPalette();
 *
 * registerCommand({
 *   id: 'notes:new',
 *   title: 'New Note',
 *   category: 'Actions',
 *   type: 'ACTION',
 *   action: () => createNote(),
 * });
 * ```
 */

// Components
export { CommandPalette } from './CommandPalette';
export type { CommandPaletteProps } from './types';

export { CommandPaletteItem } from './CommandPaletteItem';
export type { CommandPaletteItemProps } from './CommandPaletteItem';

// Context and Provider
export {
  CommandPaletteProvider,
  CommandPaletteContext,
} from './CommandPaletteContext';
export type { CommandPaletteProviderProps, CommandPaletteContextValue } from './types';

// Hooks
export {
  useCommandPalette,
  useRegisterCommand,
  useRegisterCommands,
} from './useCommandPalette';

// Types
export type {
  PaletteCommand as Command,  // Export as Command for backwards compatibility
  PaletteCommand,
  CommandCategory,
  CommandType,
  CommandGroup,
  CommandSearchResult,
  CommandPaletteState,
} from './types';

// Utilities
export {
  fuzzyMatch,
  searchCommands,
  groupResultsByCategory,
  evaluateMathExpression,
} from './fuzzySearch';

// System commands factory
export { createSystemCommands } from './systemCommands';
