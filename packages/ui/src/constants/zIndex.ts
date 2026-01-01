/**
 * Z-Index Layers
 *
 * Defines consistent z-index values across the zOS UI.
 * Higher numbers appear above lower numbers.
 *
 * Layer Hierarchy:
 * 1. Windows (100-999) - Regular application windows
 * 2. Dialogs (5000) - Modal dialogs above all windows
 * 3. Context Menus (6000) - Context menus above dialogs
 * 4. Notifications (7000) - Toast notifications
 * 5. Tooltips (7500) - Tooltips above notifications
 * 6. Menu Bar (8000) - System menu bar
 * 7. Menu Bar Dropdowns (8500) - Dropdowns from menu bar
 * 8. Quick Look (9000) - File preview overlay
 * 9. Command Palette (9500) - Spotlight-style search
 * 10. Popovers/Maximum (10000) - Highest layer for special cases
 */

export const Z_INDEX = {
  /** Base level for windows (100-999 range) */
  WINDOW_BASE: 100,

  /** Maximum z-index for windows */
  WINDOW_MAX: 999,

  /** Modal dialogs - above all windows */
  DIALOG: 5000,

  /** Dialog backdrop */
  DIALOG_BACKDROP: 4999,

  /** Context menus - above dialogs */
  CONTEXT_MENU: 6000,

  /** Toast notifications */
  NOTIFICATION: 7000,

  /** Tooltips */
  TOOLTIP: 7500,

  /** System menu bar */
  MENU_BAR: 8000,

  /** Menu bar dropdowns */
  MENU_BAR_DROPDOWN: 8500,

  /** Quick Look file preview */
  QUICK_LOOK: 9000,

  /** Command palette (Spotlight) */
  COMMAND_PALETTE: 9500,

  /** Maximum z-index for special overlays */
  MAX: 10000,
} as const;

/**
 * Window z-index manager
 *
 * Manages z-index allocation for windows within the WINDOW_BASE to WINDOW_MAX range.
 * When the counter reaches MAX, it resets and reassigns all active windows.
 */
class WindowZIndexManager {
  private currentIndex = Z_INDEX.WINDOW_BASE;
  private windowIndexes = new Map<string, number>();

  /**
   * Get the next z-index for a window
   * @param windowId Optional window ID for tracking
   */
  getNextZIndex(windowId?: string): number {
    // Increment within range
    if (this.currentIndex >= Z_INDEX.WINDOW_MAX) {
      // Reset and compact - in practice this rarely happens
      this.currentIndex = Z_INDEX.WINDOW_BASE;
      this.windowIndexes.clear();
    }

    const nextIndex = ++this.currentIndex;

    if (windowId) {
      this.windowIndexes.set(windowId, nextIndex);
    }

    return nextIndex;
  }

  /**
   * Get the current z-index for a window
   */
  getZIndex(windowId: string): number | undefined {
    return this.windowIndexes.get(windowId);
  }

  /**
   * Remove a window from tracking
   */
  removeWindow(windowId: string): void {
    this.windowIndexes.delete(windowId);
  }

  /**
   * Get the current highest z-index
   */
  getCurrentMax(): number {
    return this.currentIndex;
  }

  /**
   * Reset the manager (useful for testing)
   */
  reset(): void {
    this.currentIndex = Z_INDEX.WINDOW_BASE;
    this.windowIndexes.clear();
  }
}

/** Singleton window z-index manager */
export const windowZIndexManager = new WindowZIndexManager();
