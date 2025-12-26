import React, { createContext, useContext, useState, useCallback } from 'react';
import { logger } from '../lib/logger';
import type { TerminalContextType, TerminalEntry, EditorState } from '../types/terminal';

// Create the context with default values
const TerminalContext = createContext<TerminalContextType | null>(null);

interface TerminalProviderProps {
  children: React.ReactNode;
  // Optional command handler - allows external integration (e.g., WebContainer)
  onExecuteCommand?: (command: string) => Promise<string | void>;
}

export const TerminalProvider: React.FC<TerminalProviderProps> = ({
  children,
  onExecuteCommand,
}) => {
  const [entries, setEntries] = useState<TerminalEntry[]>([
    {
      command: '',
      output: `Welcome to zOS v4.2.0 - z@zeekay.ai
Type 'help' for commands, 'neofetch' for system info`,
      id: 0
    }
  ]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [editorState, setEditorState] = useState<EditorState>({
    isOpen: false,
    fileName: '',
    content: '',
    isNewFile: false,
  });

  // Pending command - queued to run when Terminal opens
  const [pendingCommand, setPendingCommand] = useState<string | null>(null);

  const queueCommand = useCallback((command: string) => {
    setPendingCommand(command);
  }, []);

  const consumePendingCommand = useCallback(() => {
    const cmd = pendingCommand;
    setPendingCommand(null);
    return cmd;
  }, [pendingCommand]);

  const openEditor = useCallback((fileName: string, content: string, isNewFile: boolean = false) => {
    setEditorState({
      isOpen: true,
      fileName,
      content,
      isNewFile,
    });
  }, []);

  const closeEditor = useCallback(() => {
    setEditorState({
      isOpen: false,
      fileName: '',
      content: '',
      isNewFile: false,
    });
  }, []);

  const saveFile = useCallback(async (fileName: string, content: string) => {
    logger.info(`Saving file: ${fileName}`);
    // File saving can be extended with external storage
  }, []);

  const addEntry = useCallback((entry: Omit<TerminalEntry, 'id'> & { id?: number }) => {
    setEntries(prev => [
      ...prev,
      {
        ...entry,
        id: entry.id || Date.now()
      }
    ]);
  }, []);

  const clearEntries = useCallback(() => {
    setEntries([]);
  }, []);

  const executeCommand = async (command: string): Promise<void> => {
    // Add to history
    setCommandHistory(prev => [...prev, command]);

    // Add command entry
    addEntry({ command, output: '' });

    // Handle built-in commands
    const trimmed = command.trim().toLowerCase();

    if (trimmed === 'clear') {
      clearEntries();
      return;
    }

    if (trimmed === 'help') {
      addEntry({
        command: '',
        output: `Available commands:
  help      - Show this help
  clear     - Clear terminal
  neofetch  - System info
  echo      - Print text
  date      - Current date/time`,
      });
      return;
    }

    if (trimmed === 'neofetch') {
      addEntry({
        command: '',
        output: `
   ____  _____
  |_  / / _ \\/ __|
   / / | (_) \\__ \\
  /___| \\___/|___/

  OS: zOS v4.2.0
  Host: Web Browser
  Kernel: React 18
  Shell: zsh`,
      });
      return;
    }

    if (trimmed.startsWith('echo ')) {
      addEntry({
        command: '',
        output: command.slice(5),
      });
      return;
    }

    if (trimmed === 'date') {
      addEntry({
        command: '',
        output: new Date().toString(),
      });
      return;
    }

    // Try external command handler if provided
    if (onExecuteCommand) {
      try {
        const result = await onExecuteCommand(command);
        if (result) {
          addEntry({ command: '', output: result });
        }
      } catch (error) {
        logger.error('Command execution error:', error);
        addEntry({ command: '', output: `Error: ${error}` });
      }
      return;
    }

    // Unknown command
    addEntry({
      command: '',
      output: `zsh: command not found: ${command.split(' ')[0]}`,
    });
  };

  const contextValue: TerminalContextType = {
    entries,
    addEntry,
    executeCommand,
    webContainerInstance: null,
    isWebContainerReady: false,
    commandHistory,
    setCommandHistory,
    clearEntries,
    editorState,
    openEditor,
    closeEditor,
    saveFile,
    pendingCommand,
    queueCommand,
    consumePendingCommand,
  };

  return (
    <TerminalContext.Provider value={contextValue}>
      {children}
    </TerminalContext.Provider>
  );
};

// Custom hook to use the terminal context
export const useTerminal = () => {
  const context = useContext(TerminalContext);

  if (!context) {
    throw new Error('useTerminal must be used within a TerminalProvider');
  }

  return context;
};
