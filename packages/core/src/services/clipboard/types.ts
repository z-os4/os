/**
 * Clipboard Service Types for zOS
 *
 * Defines core types for the unified clipboard API with history support.
 * Wraps native navigator.clipboard with rich data types and history tracking.
 */

/** Supported clipboard data types */
export type ClipboardDataType = 'text' | 'html' | 'image' | 'files' | 'custom';

/**
 * A single clipboard item with metadata
 */
export interface ClipboardItem {
  /** Unique identifier for this clipboard entry */
  id: string;
  /** Type of the clipboard data */
  type: ClipboardDataType;
  /** The actual data payload */
  data: unknown;
  /** Plain text representation for compatibility */
  text?: string;
  /** Unix timestamp when this was copied */
  timestamp: number;
  /** Source app ID that created this item */
  source?: string;
  /** Custom MIME type for 'custom' type items */
  mimeType?: string;
}

/**
 * Options for copy/cut operations
 */
export interface ClipboardCopyOptions {
  /** Type of data being copied */
  type?: ClipboardDataType;
  /** Source app ID */
  source?: string;
  /** Custom MIME type for 'custom' type */
  mimeType?: string;
  /** Plain text fallback for non-text types */
  fallbackText?: string;
}

/**
 * Context value exposed by ClipboardProvider
 */
export interface ClipboardContextValue {
  /** The most recent clipboard item */
  currentItem: ClipboardItem | null;
  /** History of clipboard items (newest first) */
  history: ClipboardItem[];

  /**
   * Copy data to clipboard
   * @param data - Data to copy
   * @param type - Type of data (default: 'text')
   */
  copy: (data: unknown, type?: ClipboardDataType) => Promise<void>;

  /**
   * Cut data to clipboard (copy + trigger onCut callback)
   * @param data - Data to cut
   * @param type - Type of data (default: 'text')
   * @param onCut - Callback invoked after paste to complete cut operation
   */
  cut: (data: unknown, type?: ClipboardDataType, onCut?: () => void) => Promise<void>;

  /**
   * Paste from clipboard
   * @returns The pasted clipboard item, or null if empty
   */
  paste: () => Promise<ClipboardItem | null>;

  /** Copy plain text to clipboard */
  copyText: (text: string) => Promise<void>;

  /** Copy HTML to clipboard with optional fallback text */
  copyHtml: (html: string) => Promise<void>;

  /** Copy file paths to clipboard */
  copyFiles: (paths: string[]) => Promise<void>;

  /** Get clipboard history */
  getHistory: () => ClipboardItem[];

  /** Clear clipboard history */
  clearHistory: () => void;

  /**
   * Paste a specific item from history
   * @param id - ID of the history item to paste
   */
  pasteFromHistory: (id: string) => Promise<ClipboardItem | null>;
}

/**
 * Listener callback for clipboard changes
 */
export type ClipboardChangeListener = () => void;

/**
 * Internal clipboard state
 */
export interface ClipboardState {
  currentItem: ClipboardItem | null;
  history: ClipboardItem[];
  pendingCut: { onCut: () => void } | null;
}
