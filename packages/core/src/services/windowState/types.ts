/**
 * Window State Types for zOS
 *
 * Type definitions for window position, size, and state persistence.
 */

/**
 * Window position and dimensions
 */
export interface WindowBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Complete persisted state of a single window
 */
export interface PersistedWindowState {
  /** Unique window identifier */
  id: string;
  /** Application identifier */
  appId: string;
  /** Position and size */
  bounds: WindowBounds;
  /** Whether window is maximized */
  isMaximized: boolean;
  /** Whether window is minimized */
  isMinimized: boolean;
  /** Z-ordering index */
  zIndex: number;
  /** Timestamp of last activation */
  lastActive: number;
  /** Pre-maximize bounds for restore */
  preBounds?: WindowBounds;
  /** Application-specific state */
  customState?: Record<string, unknown>;
}

/**
 * Session snapshot for restore
 */
export interface WindowSession {
  /** All windows in session */
  windows: PersistedWindowState[];
  /** Currently active window ID */
  activeWindowId: string | null;
  /** Session save timestamp */
  savedAt: number;
}

/**
 * Screen dimensions for constraint calculations
 */
export interface ScreenDimensions {
  width: number;
  height: number;
  availableWidth: number;
  availableHeight: number;
}

/**
 * Cascade positioning configuration
 */
export interface CascadeConfig {
  /** Initial X offset */
  startX: number;
  /** Initial Y offset */
  startY: number;
  /** X increment per window */
  stepX: number;
  /** Y increment per window */
  stepY: number;
  /** Maximum cascade count before reset */
  maxCascade: number;
}
