/**
 * Keyboard Context
 *
 * React context for keyboard shortcuts integration.
 * Provides access to the keyboard manager and utility functions.
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import { keyboardManager, KeyboardShortcutManager } from './KeyboardShortcutManager';
import { Shortcut, ShortcutConflict, ShortcutGroup, PlatformInfo } from './types';

/**
 * Keyboard context value type
 */
export interface KeyboardContextType {
  /** All registered shortcuts */
  shortcuts: Shortcut[];

  /** Shortcuts grouped by group property */
  groups: ShortcutGroup[];

  /** Detected conflicts between shortcuts */
  conflicts: ShortcutConflict[];

  /** Platform information */
  platform: PlatformInfo;

  /** Register a shortcut */
  register: (shortcut: Shortcut) => () => void;

  /** Unregister a shortcut by ID */
  unregister: (id: string) => void;

  /** Format keys for display (platform-specific) */
  formatKeys: (keys: string) => string;

  /** Check if running on Mac */
  isMac: boolean;

  /** Whether the shortcuts panel is open */
  isPanelOpen: boolean;

  /** Open the shortcuts panel */
  openPanel: () => void;

  /** Close the shortcuts panel */
  closePanel: () => void;

  /** Toggle the shortcuts panel */
  togglePanel: () => void;
}

const KeyboardContext = createContext<KeyboardContextType | undefined>(undefined);

/**
 * Props for KeyboardProvider
 */
export interface KeyboardProviderProps {
  children: ReactNode;
}

/**
 * Keyboard shortcuts provider
 *
 * Wraps the application to provide keyboard shortcut functionality.
 * Automatically registers a shortcut to show the shortcuts panel (Cmd+/).
 */
export const KeyboardProvider: React.FC<KeyboardProviderProps> = ({ children }) => {
  const [shortcuts, setShortcuts] = useState<Shortcut[]>([]);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [, forceUpdate] = useState(0);

  // Subscribe to shortcut changes
  useEffect(() => {
    const update = () => {
      setShortcuts(keyboardManager.getAll());
      forceUpdate((n) => n + 1);
    };

    // Initial load
    update();

    // Subscribe to changes
    const unsubscribe = keyboardManager.subscribe(update);
    return unsubscribe;
  }, []);

  // Register shortcut to show shortcuts panel
  useEffect(() => {
    const cleanup = keyboardManager.register({
      id: 'system:show-shortcuts',
      keys: 'Cmd+/',
      description: 'Show keyboard shortcuts',
      action: () => setIsPanelOpen(true),
      scope: 'global',
      priority: 100,
      group: 'System',
    });

    return cleanup;
  }, []);

  // Compute groups from shortcuts
  const groups = useMemo((): ShortcutGroup[] => {
    const groupMap = new Map<string, Shortcut[]>();

    for (const shortcut of shortcuts) {
      const groupId = shortcut.group ?? 'Other';
      const existing = groupMap.get(groupId) ?? [];
      existing.push(shortcut);
      groupMap.set(groupId, existing);
    }

    return Array.from(groupMap.entries())
      .map(([id, shortcuts]) => ({
        id,
        label: id,
        shortcuts,
      }))
      .sort((a, b) => {
        // System group first, then alphabetical
        if (a.id === 'System') return -1;
        if (b.id === 'System') return 1;
        return a.id.localeCompare(b.id);
      });
  }, [shortcuts]);

  // Get conflicts
  const conflicts = useMemo(() => keyboardManager.getConflicts(), [shortcuts]);

  // Platform info
  const platform = keyboardManager.getPlatform();
  const isMac = keyboardManager.isMac();

  // Context methods
  const register = useCallback((shortcut: Shortcut) => {
    return keyboardManager.register(shortcut);
  }, []);

  const unregister = useCallback((id: string) => {
    keyboardManager.unregister(id);
  }, []);

  const formatKeys = useCallback((keys: string) => {
    return keyboardManager.formatForDisplay(keys);
  }, []);

  const openPanel = useCallback(() => setIsPanelOpen(true), []);
  const closePanel = useCallback(() => setIsPanelOpen(false), []);
  const togglePanel = useCallback(() => setIsPanelOpen((open) => !open), []);

  const value: KeyboardContextType = {
    shortcuts,
    groups,
    conflicts,
    platform,
    register,
    unregister,
    formatKeys,
    isMac,
    isPanelOpen,
    openPanel,
    closePanel,
    togglePanel,
  };

  return (
    <KeyboardContext.Provider value={value}>
      {children}
    </KeyboardContext.Provider>
  );
};

/**
 * Default no-op context for graceful degradation
 */
const defaultContext: KeyboardContextType = {
  shortcuts: [],
  groups: [],
  conflicts: [],
  platform: { isMac: false, isWindows: false, isLinux: false },
  register: () => () => {},
  unregister: () => {},
  formatKeys: (keys) => keys,
  isMac: false,
  isPanelOpen: false,
  openPanel: () => {},
  closePanel: () => {},
  togglePanel: () => {},
};

/**
 * Hook to access keyboard context
 *
 * Returns the keyboard context, or a no-op default if outside provider.
 */
export function useKeyboardContext(): KeyboardContextType {
  const context = useContext(KeyboardContext);
  return context ?? defaultContext;
}
