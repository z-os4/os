/**
 * Clipboard Context for zOS
 *
 * Provides React context wrapper around the clipboard service.
 * Enables reactive updates when clipboard changes.
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react';
import type { ClipboardItem, ClipboardDataType, ClipboardContextValue } from './types';
import { clipboard } from './ClipboardService';

/**
 * React context for clipboard operations
 */
const ClipboardContext = createContext<ClipboardContextValue | null>(null);
ClipboardContext.displayName = 'ClipboardContext';

/**
 * Props for ClipboardProvider
 */
export interface ClipboardProviderProps {
  children: React.ReactNode;
}

/**
 * Provider component for clipboard context
 *
 * Wraps children with clipboard functionality.
 * Subscribes to clipboard service changes for reactive updates.
 *
 * @example
 * ```tsx
 * <ClipboardProvider>
 *   <App />
 * </ClipboardProvider>
 * ```
 */
export function ClipboardProvider({ children }: ClipboardProviderProps): React.ReactElement {
  const [currentItem, setCurrentItem] = useState<ClipboardItem | null>(
    clipboard.getCurrentItem()
  );
  const [history, setHistory] = useState<ClipboardItem[]>(clipboard.getHistory());

  // Subscribe to clipboard changes
  useEffect(() => {
    const unsubscribe = clipboard.subscribe(() => {
      setCurrentItem(clipboard.getCurrentItem());
      setHistory(clipboard.getHistory());
    });

    return unsubscribe;
  }, []);

  // Memoized operations
  const copy = useCallback(
    async (data: unknown, type?: ClipboardDataType): Promise<void> => {
      await clipboard.copy(data, type);
    },
    []
  );

  const cut = useCallback(
    async (
      data: unknown,
      type?: ClipboardDataType,
      onCut?: () => void
    ): Promise<void> => {
      await clipboard.cut(data, type, onCut);
    },
    []
  );

  const paste = useCallback(async (): Promise<ClipboardItem | null> => {
    return clipboard.paste();
  }, []);

  const copyText = useCallback(async (text: string): Promise<void> => {
    await clipboard.copyText(text);
  }, []);

  const copyHtml = useCallback(async (html: string): Promise<void> => {
    await clipboard.copyHtml(html);
  }, []);

  const copyFiles = useCallback(async (paths: string[]): Promise<void> => {
    await clipboard.copyFiles(paths);
  }, []);

  const getHistory = useCallback((): ClipboardItem[] => {
    return clipboard.getHistory();
  }, []);

  const clearHistory = useCallback((): void => {
    clipboard.clearHistory();
  }, []);

  const pasteFromHistory = useCallback(
    async (id: string): Promise<ClipboardItem | null> => {
      return clipboard.pasteFromHistory(id);
    },
    []
  );

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo<ClipboardContextValue>(
    () => ({
      currentItem,
      history,
      copy,
      cut,
      paste,
      copyText,
      copyHtml,
      copyFiles,
      getHistory,
      clearHistory,
      pasteFromHistory,
    }),
    [
      currentItem,
      history,
      copy,
      cut,
      paste,
      copyText,
      copyHtml,
      copyFiles,
      getHistory,
      clearHistory,
      pasteFromHistory,
    ]
  );

  return (
    <ClipboardContext.Provider value={value}>
      {children}
    </ClipboardContext.Provider>
  );
}

/**
 * Access clipboard context
 *
 * Must be used within a ClipboardProvider.
 *
 * @throws Error if used outside ClipboardProvider
 */
export function useClipboardContext(): ClipboardContextValue {
  const context = useContext(ClipboardContext);
  if (!context) {
    throw new Error('useClipboardContext must be used within a ClipboardProvider');
  }
  return context;
}

export { ClipboardContext };
