/**
 * History System Types
 *
 * Command pattern-based undo/redo system for zOS.
 */

/**
 * A command that can be executed, undone, and redone.
 *
 * @typeParam T - The return type of execute/redo operations
 */
export interface HistoryCommand<T = unknown> {
  /** Unique identifier for this command instance */
  id: string;

  /** Command type identifier (e.g., 'property-change', 'batch') */
  type: string;

  /** Human-readable description for UI display */
  description: string;

  /** Timestamp when command was created */
  timestamp: number;

  /** Execute the command and return result */
  execute: () => T | Promise<T>;

  /** Undo the command's effects */
  undo: () => void | Promise<void>;

  /**
   * Redo the command. Optional - defaults to calling execute().
   * Useful when redo needs different logic than initial execution.
   */
  redo?: () => T | Promise<T>;

  /**
   * Attempt to merge this command with another of the same type.
   * Returns merged command if successful, null if cannot merge.
   * Useful for coalescing rapid changes (e.g., typing characters).
   *
   * @param other - The newer command to potentially merge with this one
   * @returns Merged command or null if merge not possible
   */
  merge?: (other: HistoryCommand) => HistoryCommand | null;
}

/**
 * A stack pair for undo/redo operations within a scope
 */
export interface HistoryStack {
  /** Commands that can be undone (most recent at end) */
  undoStack: HistoryCommand[];

  /** Commands that can be redone (most recent at end) */
  redoStack: HistoryCommand[];

  /** Maximum number of commands to retain in undo stack */
  maxSize: number;
}

/**
 * Configuration options for HistoryManager
 */
export interface HistoryManagerOptions {
  /**
   * Maximum number of commands to retain in each scope's undo stack.
   * When exceeded, oldest commands are discarded.
   * @default 100
   */
  maxSize?: number;

  /**
   * Time window (ms) for merging consecutive commands of the same type.
   * Commands created within this window may be merged if they support it.
   * @default 1000
   */
  mergeWindow?: number;
}

/**
 * Listener callback for history state changes
 */
export type HistoryChangeListener = () => void;

/**
 * Snapshot of history state for a scope
 */
export interface HistoryState {
  /** Descriptions of commands that can be undone */
  undo: string[];

  /** Descriptions of commands that can be redone */
  redo: string[];
}
