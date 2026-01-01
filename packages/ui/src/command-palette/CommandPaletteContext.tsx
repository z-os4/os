/**
 * Command Palette Context and Provider
 *
 * Global context for managing command palette state and commands.
 */

import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
} from 'react';
import type {
  PaletteCommand,
  CommandPaletteContextValue,
  CommandPaletteProviderProps,
  CommandPaletteState,
} from './types';
import { createSystemCommands } from './systemCommands';

// Storage key for recent commands
const RECENT_COMMANDS_KEY = 'zos-command-palette-recent';

// Default state
const initialState: CommandPaletteState = {
  isOpen: false,
  query: '',
  selectedIndex: 0,
  recentIds: [],
};

// Action types
type Action =
  | { type: 'OPEN' }
  | { type: 'CLOSE' }
  | { type: 'TOGGLE' }
  | { type: 'SET_QUERY'; payload: string }
  | { type: 'SET_SELECTED_INDEX'; payload: number }
  | { type: 'ADD_RECENT'; payload: string }
  | { type: 'SET_RECENT_IDS'; payload: string[] };

// Reducer
function reducer(state: CommandPaletteState, action: Action): CommandPaletteState {
  switch (action.type) {
    case 'OPEN':
      return { ...state, isOpen: true, query: '', selectedIndex: 0 };
    case 'CLOSE':
      return { ...state, isOpen: false, query: '', selectedIndex: 0 };
    case 'TOGGLE':
      return state.isOpen
        ? { ...state, isOpen: false, query: '', selectedIndex: 0 }
        : { ...state, isOpen: true, query: '', selectedIndex: 0 };
    case 'SET_QUERY':
      return { ...state, query: action.payload, selectedIndex: 0 };
    case 'SET_SELECTED_INDEX':
      return { ...state, selectedIndex: action.payload };
    case 'ADD_RECENT': {
      const filtered = state.recentIds.filter((id) => id !== action.payload);
      return { ...state, recentIds: [action.payload, ...filtered].slice(0, 10) };
    }
    case 'SET_RECENT_IDS':
      return { ...state, recentIds: action.payload };
    default:
      return state;
  }
}

// Context
export const CommandPaletteContext =
  createContext<CommandPaletteContextValue | null>(null);

/**
 * Command Palette Provider
 *
 * Provides global command palette functionality to the app.
 */
export function CommandPaletteProvider({
  children,
  initialCommands = [],
  includeSystemCommands = true,
  maxRecentItems = 10,
  shortcut,
  onCommandExecute,
}: CommandPaletteProviderProps) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [commands, setCommands] = React.useState<PaletteCommand[]>(() => {
    const baseCommands = [...initialCommands];
    if (includeSystemCommands) {
      baseCommands.push(...createSystemCommands());
    }
    return baseCommands;
  });

  // Load recent items from storage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_COMMANDS_KEY);
      if (stored) {
        const recentIds = JSON.parse(stored) as string[];
        dispatch({ type: 'SET_RECENT_IDS', payload: recentIds.slice(0, maxRecentItems) });
      }
    } catch {
      // Ignore storage errors
    }
  }, [maxRecentItems]);

  // Save recent items to storage
  useEffect(() => {
    try {
      localStorage.setItem(RECENT_COMMANDS_KEY, JSON.stringify(state.recentIds));
    } catch {
      // Ignore storage errors
    }
  }, [state.recentIds]);

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Default shortcuts: Cmd+Space or Cmd+K (configurable)
      const key = shortcut?.key ?? 'k';
      const modifiers = shortcut?.modifiers ?? ['meta'];

      const modifiersMatch =
        modifiers.every((mod) => {
          switch (mod) {
            case 'meta':
              return e.metaKey;
            case 'ctrl':
              return e.ctrlKey;
            case 'alt':
              return e.altKey;
            case 'shift':
              return e.shiftKey;
            default:
              return false;
          }
        }) &&
        // Ensure no extra modifiers
        (modifiers.includes('meta') ? e.metaKey : !e.metaKey) &&
        (modifiers.includes('ctrl') ? e.ctrlKey : !e.ctrlKey) &&
        (modifiers.includes('alt') ? e.altKey : !e.altKey) &&
        (modifiers.includes('shift') ? e.shiftKey : !e.shiftKey);

      // Check for Cmd+Space as alternative
      const isSpaceShortcut =
        e.key === ' ' && e.metaKey && !e.ctrlKey && !e.altKey && !e.shiftKey;

      if (
        (e.key.toLowerCase() === key.toLowerCase() && modifiersMatch) ||
        isSpaceShortcut
      ) {
        e.preventDefault();
        dispatch({ type: 'TOGGLE' });
      }

      // Escape to close
      if (e.key === 'Escape' && state.isOpen) {
        e.preventDefault();
        dispatch({ type: 'CLOSE' });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcut, state.isOpen]);

  // Context methods
  const open = useCallback(() => dispatch({ type: 'OPEN' }), []);
  const close = useCallback(() => dispatch({ type: 'CLOSE' }), []);
  const toggle = useCallback(() => dispatch({ type: 'TOGGLE' }), []);

  const setQuery = useCallback((query: string) => {
    dispatch({ type: 'SET_QUERY', payload: query });
  }, []);

  const setSelectedIndex = useCallback((index: number) => {
    dispatch({ type: 'SET_SELECTED_INDEX', payload: index });
  }, []);

  const registerCommand = useCallback((command: PaletteCommand) => {
    setCommands((prev) => {
      // Replace if exists, otherwise add
      const exists = prev.some((c) => c.id === command.id);
      if (exists) {
        return prev.map((c) => (c.id === command.id ? command : c));
      }
      return [...prev, command];
    });
  }, []);

  const unregisterCommand = useCallback((id: string) => {
    setCommands((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const registerCommands = useCallback((newCommands: PaletteCommand[]) => {
    setCommands((prev) => {
      const commandMap = new Map(prev.map((c) => [c.id, c]));
      for (const command of newCommands) {
        commandMap.set(command.id, command);
      }
      return Array.from(commandMap.values());
    });
  }, []);

  const executeCommand = useCallback(
    (command: PaletteCommand) => {
      // Add to recent
      dispatch({ type: 'ADD_RECENT', payload: command.id });

      // Close palette
      dispatch({ type: 'CLOSE' });

      // Execute action
      try {
        const result = command.action();
        if (result instanceof Promise) {
          result.catch(console.error);
        }
      } catch (error) {
        console.error('Command execution failed:', error);
      }

      // Notify callback
      onCommandExecute?.(command);
    },
    [onCommandExecute]
  );

  const contextValue = useMemo<CommandPaletteContextValue>(
    () => ({
      state,
      commands,
      open,
      close,
      toggle,
      registerCommand,
      unregisterCommand,
      registerCommands,
      setQuery,
      setSelectedIndex,
      executeCommand,
      isOpen: state.isOpen,
    }),
    [
      state,
      commands,
      open,
      close,
      toggle,
      registerCommand,
      unregisterCommand,
      registerCommands,
      setQuery,
      setSelectedIndex,
      executeCommand,
    ]
  );

  return (
    <CommandPaletteContext.Provider value={contextValue}>
      {children}
    </CommandPaletteContext.Provider>
  );
}

export default CommandPaletteProvider;
