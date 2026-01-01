/**
 * Clipboard Service Implementation for zOS
 *
 * Provides a unified clipboard API with:
 * - Native navigator.clipboard integration
 * - Rich data type support (text, HTML, images, files, custom)
 * - Clipboard history (in-memory for security)
 * - Cut operation support with deferred callbacks
 * - Fallback for older browsers
 */

import type {
  ClipboardDataType,
  ClipboardItem,
  ClipboardChangeListener,
  ClipboardCopyOptions,
} from './types';

/**
 * Generate a unique ID for clipboard items
 */
function generateId(): string {
  return `clip-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Check if navigator.clipboard API is available
 */
function hasClipboardAPI(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    typeof navigator.clipboard !== 'undefined'
  );
}

/**
 * Check if ClipboardItem constructor is available (for rich content)
 */
function hasClipboardItemAPI(): boolean {
  return typeof window !== 'undefined' && 'ClipboardItem' in window;
}

/**
 * Extract plain text from HTML string
 */
function htmlToText(html: string): string {
  if (typeof document === 'undefined') {
    // Simple fallback for non-browser environments
    return html.replace(/<[^>]*>/g, '');
  }
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
}

/**
 * Clipboard Service Implementation
 *
 * Singleton service managing clipboard operations with history.
 * Uses native clipboard API with fallback for older browsers.
 */
class ClipboardServiceImpl {
  private history: ClipboardItem[] = [];
  private maxHistory = 50;
  private listeners: Set<ClipboardChangeListener> = new Set();
  private pendingCut: { onCut: () => void } | null = null;
  private currentItem: ClipboardItem | null = null;

  /**
   * Copy data to clipboard
   * @param data - Data to copy
   * @param type - Type of data (default: 'text')
   * @param options - Additional copy options
   */
  async copy(
    data: unknown,
    type: ClipboardDataType = 'text',
    options: ClipboardCopyOptions = {}
  ): Promise<void> {
    const item: ClipboardItem = {
      id: generateId(),
      type,
      data,
      text: this.extractText(data, type, options.fallbackText),
      timestamp: Date.now(),
      source: options.source,
      mimeType: options.mimeType,
    };

    await this.writeToClipboard(item);
    this.addToHistory(item);
    this.pendingCut = null;
    this.notifyListeners();
  }

  /**
   * Cut data to clipboard (copy with deferred delete callback)
   * @param data - Data to cut
   * @param type - Type of data (default: 'text')
   * @param onCut - Callback to invoke when paste completes the cut
   */
  async cut(
    data: unknown,
    type: ClipboardDataType = 'text',
    onCut?: () => void
  ): Promise<void> {
    await this.copy(data, type);

    if (onCut) {
      this.pendingCut = { onCut };
    }
  }

  /**
   * Paste from clipboard
   * Triggers pending cut callback if present
   * @returns The pasted clipboard item, or null if empty
   */
  async paste(): Promise<ClipboardItem | null> {
    const item = await this.readFromClipboard();

    if (item && this.pendingCut) {
      this.pendingCut.onCut();
      this.pendingCut = null;
    }

    return item;
  }

  /**
   * Copy plain text to clipboard
   */
  async copyText(text: string): Promise<void> {
    await this.copy(text, 'text');
  }

  /**
   * Copy HTML to clipboard with plain text fallback
   */
  async copyHtml(html: string, fallbackText?: string): Promise<void> {
    await this.copy(html, 'html', {
      fallbackText: fallbackText || htmlToText(html),
    });
  }

  /**
   * Copy file paths to clipboard
   */
  async copyFiles(paths: string[]): Promise<void> {
    await this.copy(paths, 'files', {
      fallbackText: paths.join('\n'),
    });
  }

  /**
   * Get the current clipboard item
   */
  getCurrentItem(): ClipboardItem | null {
    return this.currentItem;
  }

  /**
   * Get clipboard history (newest first)
   */
  getHistory(): ClipboardItem[] {
    return [...this.history];
  }

  /**
   * Clear clipboard history
   */
  clearHistory(): void {
    this.history = [];
    this.currentItem = null;
    this.pendingCut = null;
    this.notifyListeners();
  }

  /**
   * Paste a specific item from history
   * @param id - ID of the history item
   */
  async pasteFromHistory(id: string): Promise<ClipboardItem | null> {
    const item = this.history.find((h) => h.id === id);
    if (!item) {
      return null;
    }

    // Re-copy to clipboard to make it the current item
    await this.writeToClipboard(item);
    this.currentItem = item;
    this.notifyListeners();

    return item;
  }

  /**
   * Subscribe to clipboard changes
   * @param callback - Listener to call on changes
   * @returns Unsubscribe function
   */
  subscribe(callback: ClipboardChangeListener): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Write item to native clipboard
   */
  private async writeToClipboard(item: ClipboardItem): Promise<void> {
    if (!hasClipboardAPI()) {
      this.fallbackCopy(item.text || '');
      return;
    }

    try {
      if (item.type === 'html' && hasClipboardItemAPI()) {
        // Use ClipboardItem API for HTML content
        const htmlBlob = new Blob([item.data as string], { type: 'text/html' });
        const textBlob = new Blob([item.text || ''], { type: 'text/plain' });

        const clipboardItem = new window.ClipboardItem({
          'text/html': htmlBlob,
          'text/plain': textBlob,
        });

        await navigator.clipboard.write([clipboardItem]);
      } else if (item.type === 'image' && hasClipboardItemAPI()) {
        // Handle image data (Blob or base64)
        let blob: Blob;
        if (item.data instanceof Blob) {
          blob = item.data;
        } else if (typeof item.data === 'string') {
          // Assume base64 data URL
          const response = await fetch(item.data);
          blob = await response.blob();
        } else {
          throw new Error('Invalid image data');
        }

        const clipboardItem = new window.ClipboardItem({
          [blob.type]: blob,
        });

        await navigator.clipboard.write([clipboardItem]);
      } else {
        // Default to text
        await navigator.clipboard.writeText(item.text || '');
      }
    } catch (error) {
      // Fall back to execCommand for older browsers or permission denied
      console.warn('Clipboard API failed, using fallback:', error);
      this.fallbackCopy(item.text || '');
    }
  }

  /**
   * Read from native clipboard
   */
  private async readFromClipboard(): Promise<ClipboardItem | null> {
    if (!hasClipboardAPI()) {
      return this.currentItem;
    }

    try {
      // Try reading rich content first
      if (hasClipboardItemAPI()) {
        const items = await navigator.clipboard.read();
        if (items.length > 0) {
          const clipboardItem = items[0];
          const types = clipboardItem.types;

          // Check for HTML
          if (types.includes('text/html')) {
            const htmlBlob = await clipboardItem.getType('text/html');
            const html = await htmlBlob.text();

            let text: string | undefined;
            if (types.includes('text/plain')) {
              const textBlob = await clipboardItem.getType('text/plain');
              text = await textBlob.text();
            }

            return {
              id: generateId(),
              type: 'html',
              data: html,
              text,
              timestamp: Date.now(),
            };
          }

          // Check for image
          for (const type of types) {
            if (type.startsWith('image/')) {
              const imageBlob = await clipboardItem.getType(type);
              return {
                id: generateId(),
                type: 'image',
                data: imageBlob,
                timestamp: Date.now(),
              };
            }
          }
        }
      }

      // Fall back to plain text
      const text = await navigator.clipboard.readText();
      if (text) {
        return {
          id: generateId(),
          type: 'text',
          data: text,
          text,
          timestamp: Date.now(),
        };
      }

      return this.currentItem;
    } catch (error) {
      // Permission denied or empty clipboard
      console.warn('Failed to read clipboard:', error);
      return this.currentItem;
    }
  }

  /**
   * Fallback copy using execCommand (deprecated but widely supported)
   */
  private fallbackCopy(text: string): void {
    if (typeof document === 'undefined') {
      return;
    }

    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();

    try {
      document.execCommand('copy');
    } catch (error) {
      console.error('Fallback copy failed:', error);
    }

    document.body.removeChild(textarea);
  }

  /**
   * Extract plain text representation from data
   */
  private extractText(
    data: unknown,
    type: ClipboardDataType,
    fallback?: string
  ): string | undefined {
    if (fallback) {
      return fallback;
    }

    switch (type) {
      case 'text':
        return typeof data === 'string' ? data : String(data);
      case 'html':
        return typeof data === 'string' ? htmlToText(data) : undefined;
      case 'files':
        return Array.isArray(data) ? data.join('\n') : undefined;
      case 'custom':
        return typeof data === 'string'
          ? data
          : JSON.stringify(data);
      default:
        return undefined;
    }
  }

  /**
   * Add item to history and update current item
   */
  private addToHistory(item: ClipboardItem): void {
    this.currentItem = item;

    // Deduplicate by text content (avoid duplicate entries for same content)
    const existingIndex = this.history.findIndex(
      (h) => h.text === item.text && h.type === item.type
    );

    if (existingIndex !== -1) {
      // Remove existing entry
      this.history.splice(existingIndex, 1);
    }

    // Add to front
    this.history.unshift(item);

    // Trim to max size
    if (this.history.length > this.maxHistory) {
      this.history = this.history.slice(0, this.maxHistory);
    }
  }

  /**
   * Notify all listeners of changes
   */
  private notifyListeners(): void {
    for (const listener of this.listeners) {
      try {
        listener();
      } catch (error) {
        console.error('Clipboard listener error:', error);
      }
    }
  }
}

/**
 * Singleton clipboard service instance
 */
export const clipboard = new ClipboardServiceImpl();

export { ClipboardServiceImpl };
