/**
 * History Manager
 *
 * Centralized command-pattern undo/redo system with scoped stacks.
 * Each scope maintains independent history (e.g., per-document, per-widget).
 */

import type {
  HistoryCommand,
  HistoryStack,
  HistoryManagerOptions,
  HistoryChangeListener,
  HistoryState,
} from './types';

const DEFAULT_MAX_SIZE = 100;
const DEFAULT_MERGE_WINDOW = 1000;

/**
 * Creates a new empty history stack
 */
function createStack(maxSize: number): HistoryStack {
  return {
    undoStack: [],
    redoStack: [],
    maxSize,
  };
}

/**
 * History Manager - manages undo/redo stacks per scope
 *
 * Design principles:
 * - Scoped stacks: each document/widget can have isolated history
 * - Command merging: rapid changes can be coalesced
 * - Memory bounded: configurable max stack size
 * - Observable: listeners notified on state changes
 */
export class HistoryManager {
  private stacks: Map<string, HistoryStack> = new Map();
  private listeners: Map<string, Set<HistoryChangeListener>> = new Map();
  private globalOptions: Required<HistoryManagerOptions>;

  constructor(options?: HistoryManagerOptions) {
    this.globalOptions = {
      maxSize: options?.maxSize ?? DEFAULT_MAX_SIZE,
      mergeWindow: options?.mergeWindow ?? DEFAULT_MERGE_WINDOW,
    };
  }

  /**
   * Get or create a history stack for a scope
   */
  private getStack(scope: string): HistoryStack {
    let stack = this.stacks.get(scope);
    if (!stack) {
      stack = createStack(this.globalOptions.maxSize);
      this.stacks.set(scope, stack);
    }
    return stack;
  }

  /**
   * Notify all listeners for a scope of state change
   */
  private notify(scope: string): void {
    const scopeListeners = this.listeners.get(scope);
    if (scopeListeners) {
      for (const listener of scopeListeners) {
        try {
          listener();
        } catch (error) {
          console.error('[HistoryManager] Listener error:', error);
        }
      }
    }
  }

  /**
   * Trim undo stack to max size, removing oldest entries
   */
  private trimStack(stack: HistoryStack): void {
    while (stack.undoStack.length > stack.maxSize) {
      stack.undoStack.shift();
    }
  }

  /**
   * Attempt to merge a new command with the most recent command
   * Returns true if merged, false otherwise
   */
  private tryMerge(stack: HistoryStack, command: HistoryCommand): boolean {
    if (stack.undoStack.length === 0) {
      return false;
    }

    const lastCommand = stack.undoStack[stack.undoStack.length - 1];

    // Check if commands are same type and within merge window
    if (lastCommand.type !== command.type) {
      return false;
    }

    const timeDiff = command.timestamp - lastCommand.timestamp;
    if (timeDiff > this.globalOptions.mergeWindow) {
      return false;
    }

    // Attempt merge if command supports it
    if (!lastCommand.merge) {
      return false;
    }

    const merged = lastCommand.merge(command);
    if (merged) {
      // Replace last command with merged version
      stack.undoStack[stack.undoStack.length - 1] = merged;
      return true;
    }

    return false;
  }

  /**
   * Execute a command and add it to the undo stack.
   *
   * - Clears the redo stack (standard undo/redo behavior)
   * - Attempts to merge with previous command if eligible
   * - Trims stack if it exceeds maxSize
   *
   * @param scope - Scope identifier (e.g., document ID)
   * @param command - Command to execute
   * @returns Result of command execution
   */
  async execute<T>(scope: string, command: HistoryCommand<T>): Promise<T> {
    const stack = this.getStack(scope);

    // Execute the command
    const result = await Promise.resolve(command.execute());

    // Clear redo stack - new action invalidates redo history
    stack.redoStack = [];

    // Attempt to merge with previous command
    const merged = this.tryMerge(stack, command);
    if (!merged) {
      // Add as new command
      stack.undoStack.push(command);
      this.trimStack(stack);
    }

    this.notify(scope);
    return result;
  }

  /**
   * Undo the most recent command in a scope.
   *
   * @param scope - Scope identifier
   * @returns true if undo was performed, false if nothing to undo
   */
  async undo(scope: string): Promise<boolean> {
    const stack = this.stacks.get(scope);
    if (!stack || stack.undoStack.length === 0) {
      return false;
    }

    const command = stack.undoStack.pop()!;

    try {
      await Promise.resolve(command.undo());
      stack.redoStack.push(command);
      this.notify(scope);
      return true;
    } catch (error) {
      // Restore command to undo stack on failure
      stack.undoStack.push(command);
      console.error('[HistoryManager] Undo failed:', error);
      throw error;
    }
  }

  /**
   * Redo the most recently undone command in a scope.
   *
   * @param scope - Scope identifier
   * @returns true if redo was performed, false if nothing to redo
   */
  async redo(scope: string): Promise<boolean> {
    const stack = this.stacks.get(scope);
    if (!stack || stack.redoStack.length === 0) {
      return false;
    }

    const command = stack.redoStack.pop()!;
    const redoFn = command.redo ?? command.execute;

    try {
      await Promise.resolve(redoFn());
      stack.undoStack.push(command);
      this.notify(scope);
      return true;
    } catch (error) {
      // Restore command to redo stack on failure
      stack.redoStack.push(command);
      console.error('[HistoryManager] Redo failed:', error);
      throw error;
    }
  }

  /**
   * Check if undo is available for a scope
   */
  canUndo(scope: string): boolean {
    const stack = this.stacks.get(scope);
    return stack !== undefined && stack.undoStack.length > 0;
  }

  /**
   * Check if redo is available for a scope
   */
  canRedo(scope: string): boolean {
    const stack = this.stacks.get(scope);
    return stack !== undefined && stack.redoStack.length > 0;
  }

  /**
   * Get description of the command that would be undone
   */
  getUndoDescription(scope: string): string | undefined {
    const stack = this.stacks.get(scope);
    if (!stack || stack.undoStack.length === 0) {
      return undefined;
    }
    return stack.undoStack[stack.undoStack.length - 1].description;
  }

  /**
   * Get description of the command that would be redone
   */
  getRedoDescription(scope: string): string | undefined {
    const stack = this.stacks.get(scope);
    if (!stack || stack.redoStack.length === 0) {
      return undefined;
    }
    return stack.redoStack[stack.redoStack.length - 1].description;
  }

  /**
   * Clear history for a specific scope
   */
  clear(scope: string): void {
    const stack = this.stacks.get(scope);
    if (stack) {
      stack.undoStack = [];
      stack.redoStack = [];
      this.notify(scope);
    }
  }

  /**
   * Clear all history across all scopes
   */
  clearAll(): void {
    const scopes = Array.from(this.stacks.keys());
    this.stacks.clear();
    for (const scope of scopes) {
      this.notify(scope);
    }
  }

  /**
   * Get history state for a scope
   *
   * @param scope - Scope identifier
   * @returns Object with undo and redo description arrays
   */
  getHistory(scope: string): HistoryState {
    const stack = this.stacks.get(scope);
    if (!stack) {
      return { undo: [], redo: [] };
    }
    return {
      undo: stack.undoStack.map((cmd) => cmd.description),
      redo: stack.redoStack.map((cmd) => cmd.description),
    };
  }

  /**
   * Get the full undo stack for a scope (for advanced inspection)
   */
  getUndoStack(scope: string): readonly HistoryCommand[] {
    const stack = this.stacks.get(scope);
    return stack ? [...stack.undoStack] : [];
  }

  /**
   * Get the full redo stack for a scope (for advanced inspection)
   */
  getRedoStack(scope: string): readonly HistoryCommand[] {
    const stack = this.stacks.get(scope);
    return stack ? [...stack.redoStack] : [];
  }

  /**
   * Subscribe to history changes for a scope.
   *
   * @param scope - Scope identifier
   * @param callback - Function to call on changes
   * @returns Unsubscribe function
   */
  subscribe(scope: string, callback: HistoryChangeListener): () => void {
    let scopeListeners = this.listeners.get(scope);
    if (!scopeListeners) {
      scopeListeners = new Set();
      this.listeners.set(scope, scopeListeners);
    }
    scopeListeners.add(callback);

    return () => {
      scopeListeners!.delete(callback);
      if (scopeListeners!.size === 0) {
        this.listeners.delete(scope);
      }
    };
  }

  /**
   * Remove a scope entirely (clears history and listeners)
   */
  removeScope(scope: string): void {
    this.stacks.delete(scope);
    this.listeners.delete(scope);
  }

  /**
   * Get list of all active scopes
   */
  getScopes(): string[] {
    return Array.from(this.stacks.keys());
  }
}

/**
 * Global history manager instance with default configuration.
 * Use this for application-wide history management.
 */
export const historyManager = new HistoryManager({ maxSize: 100 });
