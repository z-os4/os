/**
 * useClipboard Hook for zOS
 *
 * Provides convenient access to clipboard operations within React components.
 * Can be used with or without ClipboardProvider (falls back to service directly).
 */

import { useEffect, useState, useCallback } from 'react';
import type { ClipboardItem, ClipboardDataType } from './types';
import { clipboard } from './ClipboardService';

/**
 * Return type for useClipboard hook
 */
export interface UseClipboardReturn {
  /** Copy data to clipboard */
  copy: (data: unknown, type?: ClipboardDataType) => Promise<void>;
  /** Cut data to clipboard (copy with deferred delete callback) */
  cut: (data: unknown, type?: ClipboardDataType, onCut?: () => void) => Promise<void>;
  /** Paste from clipboard */
  paste: () => Promise<ClipboardItem | null>;
  /** Copy plain text to clipboard */
  copyText: (text: string) => Promise<void>;
  /** Copy HTML to clipboard */
  copyHtml: (html: string) => Promise<void>;
  /** Copy file paths to clipboard */
  copyFiles: (paths: string[]) => Promise<void>;
  /** Current clipboard item */
  currentItem: ClipboardItem | null;
  /** Clipboard history */
  history: ClipboardItem[];
  /** Paste a specific item from history */
  pasteFromHistory: (id: string) => Promise<ClipboardItem | null>;
  /** Clear clipboard history */
  clearHistory: () => void;
}

/**
 * Hook for clipboard operations
 *
 * Provides reactive access to clipboard state and operations.
 * Subscribes to clipboard changes for automatic updates.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { copy, paste, currentItem } = useClipboard();
 *
 *   const handleCopy = async () => {
 *     await copy('Hello, World!');
 *   };
 *
 *   const handlePaste = async () => {
 *     const item = await paste();
 *     if (item) {
 *       console.log('Pasted:', item.text);
 *     }
 *   };
 *
 *   return (
 *     <div>
 *       <button onClick={handleCopy}>Copy</button>
 *       <button onClick={handlePaste}>Paste</button>
 *       <p>Current: {currentItem?.text}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useClipboard(): UseClipboardReturn {
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

  const pasteFromHistory = useCallback(
    async (id: string): Promise<ClipboardItem | null> => {
      return clipboard.pasteFromHistory(id);
    },
    []
  );

  const clearHistory = useCallback((): void => {
    clipboard.clearHistory();
  }, []);

  return {
    copy,
    cut,
    paste,
    copyText,
    copyHtml,
    copyFiles,
    currentItem,
    history,
    pasteFromHistory,
    clearHistory,
  };
}

/**
 * Hook for simple text clipboard operations
 *
 * Simplified hook for common text-only clipboard use cases.
 *
 * @example
 * ```tsx
 * function CopyButton({ text }: { text: string }) {
 *   const { copyText, copied } = useClipboardText();
 *
 *   return (
 *     <button onClick={() => copyText(text)}>
 *       {copied ? 'Copied!' : 'Copy'}
 *     </button>
 *   );
 * }
 * ```
 */
export function useClipboardText(): {
  copyText: (text: string) => Promise<void>;
  pasteText: () => Promise<string | null>;
  copied: boolean;
} {
  const [copied, setCopied] = useState(false);

  const copyText = useCallback(async (text: string): Promise<void> => {
    await clipboard.copyText(text);
    setCopied(true);

    // Reset copied state after 2 seconds
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const pasteText = useCallback(async (): Promise<string | null> => {
    const item = await clipboard.paste();
    return item?.text || null;
  }, []);

  return { copyText, pasteText, copied };
}
