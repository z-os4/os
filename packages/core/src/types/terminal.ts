export interface TerminalEntry {
  command: string;
  output: string;
  id: number;
}

export interface EditorState {
  isOpen: boolean;
  fileName: string;
  content: string;
  isNewFile: boolean;
}

export interface TerminalContextType {
  entries: TerminalEntry[];
  addEntry: (entry: Omit<TerminalEntry, 'id'> & { id?: number }) => void;
  executeCommand: (command: string) => Promise<void>;
  webContainerInstance: unknown | null;
  isWebContainerReady: boolean;
  commandHistory: string[];
  setCommandHistory: React.Dispatch<React.SetStateAction<string[]>>;
  clearEntries: () => void;
  editorState: EditorState;
  openEditor: (fileName: string, content: string, isNewFile?: boolean) => void;
  closeEditor: () => void;
  saveFile: (fileName: string, content: string) => Promise<void>;
  pendingCommand: string | null;
  queueCommand: (command: string) => void;
  consumePendingCommand: () => string | null;
}
