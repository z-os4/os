/**
 * Command Palette Types
 *
 * Type definitions for the Spotlight-style command palette.
 */

import type { ReactNode } from 'react';

/**
 * Command categories for organizing palette results
 */
export type CommandCategory =
  | 'Apps'
  | 'Files'
  | 'Folders'
  | 'Commands'
  | 'Settings'
  | 'Actions'
  | 'URLs'
  | 'Calculations'
  | 'Recent';

/**
 * Command types for different behaviors
 */
export type CommandType =
  | 'APP'
  | 'FILE'
  | 'FOLDER'
  | 'ACTION'
  | 'SETTING'
  | 'URL'
  | 'CALCULATION';

/**
 * Individual command definition
 */
export interface PaletteCommand {
  /** Unique identifier for the command */
  id: string;
  /** Display title */
  title: string;
  /** Optional subtitle/description */
  subtitle?: string;
  /** Icon element to display */
  icon?: ReactNode;
  /** Category for grouping */
  category: CommandCategory;
  /** Command type for styling and behavior */
  type: CommandType;
  /** Keywords for search matching */
  keywords?: string[];
  /** Keyboard shortcut hint (e.g., "Cmd+N") */
  shortcut?: string;
  /** Action to execute when selected */
  action: () => void | Promise<void>;
  /** Priority for sorting (higher = more prominent) */
  priority?: number;
  /** Whether this command is disabled */
  disabled?: boolean;
  /** Custom data for extensions */
  data?: Record<string, unknown>;
}

/**
 * Grouped commands by category
 */
export interface CommandGroup {
  category: CommandCategory;
  commands: PaletteCommand[];
}

/**
 * Search result with match information
 */
export interface CommandSearchResult {
  command: PaletteCommand;
  /** Match score (0-1, higher is better match) */
  score: number;
  /** Character indices that matched */
  matches?: number[];
}

/**
 * Command palette state
 */
export interface CommandPaletteState {
  /** Whether the palette is open */
  isOpen: boolean;
  /** Current search query */
  query: string;
  /** Currently selected command index */
  selectedIndex: number;
  /** Recent command IDs */
  recentIds: string[];
}

/**
 * Command palette context value
 */
export interface CommandPaletteContextValue {
  /** Current state */
  state: CommandPaletteState;
  /** All registered commands */
  commands: PaletteCommand[];
  /** Open the palette */
  open: () => void;
  /** Close the palette */
  close: () => void;
  /** Toggle the palette */
  toggle: () => void;
  /** Register a new command */
  registerCommand: (command: PaletteCommand) => void;
  /** Unregister a command by ID */
  unregisterCommand: (id: string) => void;
  /** Register multiple commands at once */
  registerCommands: (commands: PaletteCommand[]) => void;
  /** Set the search query */
  setQuery: (query: string) => void;
  /** Set the selected index */
  setSelectedIndex: (index: number) => void;
  /** Execute a command */
  executeCommand: (command: PaletteCommand) => void;
  /** Check if palette is open */
  isOpen: boolean;
}

/**
 * Provider props
 */
export interface CommandPaletteProviderProps {
  children: ReactNode;
  /** Initial commands to register */
  initialCommands?: PaletteCommand[];
  /** Include built-in system commands */
  includeSystemCommands?: boolean;
  /** Maximum recent items to track */
  maxRecentItems?: number;
  /** Custom keyboard shortcut (default: Cmd/Ctrl+Space or Cmd/Ctrl+K) */
  shortcut?: {
    key: string;
    modifiers?: ('meta' | 'ctrl' | 'alt' | 'shift')[];
  };
  /** Callback when command is executed */
  onCommandExecute?: (command: PaletteCommand) => void;
}

/**
 * Command palette component props
 */
export interface CommandPaletteProps {
  /** Custom class name */
  className?: string;
  /** Placeholder text for search input */
  placeholder?: string;
  /** Empty state message */
  emptyMessage?: string;
  /** Maximum height in pixels */
  maxHeight?: number;
}
