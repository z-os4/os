/**
 * Window State Manager for zOS
 *
 * Persists window positions, sizes, and states across sessions.
 * Uses localStorage with debounced saves and screen constraint handling.
 */

import type {
  WindowBounds,
  PersistedWindowState,
  WindowSession,
  ScreenDimensions,
  CascadeConfig,
} from './types';

const STORAGE_KEY = 'zos:window-states';
const SESSION_KEY = 'zos:window-session';
const DEBOUNCE_MS = 300;

const DEFAULT_CASCADE: CascadeConfig = {
  startX: 50,
  startY: 50,
  stepX: 30,
  stepY: 30,
  maxCascade: 10,
};

const DEFAULT_BOUNDS: WindowBounds = {
  x: 100,
  y: 100,
  width: 800,
  height: 600,
};

const MIN_VISIBLE_EDGE = 50;
const MIN_WIDTH = 200;
const MIN_HEIGHT = 150;

/**
 * Window State Manager
 *
 * Singleton manager for window state persistence.
 */
class WindowStateManager {
  private states: Map<string, PersistedWindowState> = new Map();
  private cascadeCounters: Map<string, number> = new Map();
  private listeners: Set<() => void> = new Set();
  private saveTimeout: ReturnType<typeof setTimeout> | null = null;
  private initialized = false;

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Load persisted states from localStorage
   */
  private loadFromStorage(): void {
    if (typeof localStorage === 'undefined') {
      this.initialized = true;
      return;
    }

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw) as Record<string, PersistedWindowState>;
        for (const [id, state] of Object.entries(data)) {
          this.states.set(id, state);
        }
      }
    } catch (e) {
      console.error('[WindowStateManager] Failed to load states:', e);
    }

    this.initialized = true;
  }

  /**
   * Save states to localStorage with debouncing
   */
  private scheduleSave(): void {
    if (this.saveTimeout !== null) {
      clearTimeout(this.saveTimeout);
    }

    this.saveTimeout = setTimeout(() => {
      this.persistToStorage();
      this.saveTimeout = null;
    }, DEBOUNCE_MS);
  }

  /**
   * Immediately persist to localStorage
   */
  private persistToStorage(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    try {
      const data: Record<string, PersistedWindowState> = {};
      for (const [id, state] of this.states) {
        data[id] = state;
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('[WindowStateManager] Failed to save states:', e);
    }
  }

  /**
   * Notify all subscribers of state changes
   */
  private notifyListeners(): void {
    for (const listener of this.listeners) {
      try {
        listener();
      } catch (e) {
        console.error('[WindowStateManager] Listener error:', e);
      }
    }
  }

  /**
   * Get current screen dimensions
   */
  private getScreenDimensions(): ScreenDimensions {
    if (typeof window === 'undefined') {
      return {
        width: 1920,
        height: 1080,
        availableWidth: 1920,
        availableHeight: 1080,
      };
    }

    return {
      width: window.screen.width,
      height: window.screen.height,
      availableWidth: window.innerWidth,
      availableHeight: window.innerHeight,
    };
  }

  /**
   * Save window state
   */
  saveState(windowId: string, state: Partial<PersistedWindowState>): void {
    const existing = this.states.get(windowId);
    const updated: PersistedWindowState = {
      id: windowId,
      appId: state.appId ?? existing?.appId ?? 'unknown',
      bounds: state.bounds ?? existing?.bounds ?? { ...DEFAULT_BOUNDS },
      isMaximized: state.isMaximized ?? existing?.isMaximized ?? false,
      isMinimized: state.isMinimized ?? existing?.isMinimized ?? false,
      zIndex: state.zIndex ?? existing?.zIndex ?? 0,
      lastActive: state.lastActive ?? existing?.lastActive ?? Date.now(),
      preBounds: state.preBounds ?? existing?.preBounds,
      customState: state.customState ?? existing?.customState,
    };

    this.states.set(windowId, updated);
    this.scheduleSave();
    this.notifyListeners();
  }

  /**
   * Get window state by ID
   */
  getState(windowId: string): PersistedWindowState | undefined {
    return this.states.get(windowId);
  }

  /**
   * Remove window state
   */
  removeState(windowId: string): void {
    if (this.states.delete(windowId)) {
      this.scheduleSave();
      this.notifyListeners();
    }
  }

  /**
   * Save window bounds
   */
  saveBounds(windowId: string, bounds: WindowBounds): void {
    const existing = this.states.get(windowId);
    if (existing) {
      existing.bounds = bounds;
      this.scheduleSave();
      this.notifyListeners();
    } else {
      this.saveState(windowId, { bounds });
    }
  }

  /**
   * Get last known bounds for an app
   * Returns the most recently active window bounds for the given appId
   */
  getLastBounds(appId: string): WindowBounds | undefined {
    let latestState: PersistedWindowState | undefined;

    for (const state of this.states.values()) {
      if (state.appId === appId && !state.isMaximized) {
        if (!latestState || state.lastActive > latestState.lastActive) {
          latestState = state;
        }
      }
    }

    return latestState?.bounds;
  }

  /**
   * Save current session
   */
  saveSession(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    // Find active window (highest lastActive)
    let activeWindowId: string | null = null;
    let maxLastActive = 0;

    for (const state of this.states.values()) {
      if (state.lastActive > maxLastActive) {
        maxLastActive = state.lastActive;
        activeWindowId = state.id;
      }
    }

    const session: WindowSession = {
      windows: Array.from(this.states.values()),
      activeWindowId,
      savedAt: Date.now(),
    };

    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch (e) {
      console.error('[WindowStateManager] Failed to save session:', e);
    }
  }

  /**
   * Restore session from storage
   */
  restoreSession(): WindowSession | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }

    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) {
        return null;
      }

      const session = JSON.parse(raw) as WindowSession;

      // Constrain all windows to current screen
      const screen = this.getScreenDimensions();
      session.windows = session.windows.map((state) => ({
        ...state,
        bounds: this.constrainToScreen(state.bounds, screen),
      }));

      return session;
    } catch (e) {
      console.error('[WindowStateManager] Failed to restore session:', e);
      return null;
    }
  }

  /**
   * Clear saved session
   */
  clearSession(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    try {
      localStorage.removeItem(SESSION_KEY);
    } catch (e) {
      console.error('[WindowStateManager] Failed to clear session:', e);
    }
  }

  /**
   * Get next cascade position for a new window
   */
  getNextCascadePosition(appId: string): { x: number; y: number } {
    const count = this.cascadeCounters.get(appId) ?? 0;
    const screen = this.getScreenDimensions();

    const cascade = DEFAULT_CASCADE;
    const effectiveCount = count % cascade.maxCascade;

    let x = cascade.startX + effectiveCount * cascade.stepX;
    let y = cascade.startY + effectiveCount * cascade.stepY;

    // Ensure position is within screen bounds
    const maxX = screen.availableWidth - MIN_VISIBLE_EDGE;
    const maxY = screen.availableHeight - MIN_VISIBLE_EDGE;

    if (x > maxX) x = cascade.startX;
    if (y > maxY) y = cascade.startY;

    // Increment counter for next window
    this.cascadeCounters.set(appId, count + 1);

    return { x, y };
  }

  /**
   * Reset cascade counter for an app
   */
  resetCascade(appId: string): void {
    this.cascadeCounters.delete(appId);
  }

  /**
   * Constrain bounds to fit within screen
   */
  constrainToScreen(
    bounds: WindowBounds,
    screen?: ScreenDimensions
  ): WindowBounds {
    const dims = screen ?? this.getScreenDimensions();
    const result = { ...bounds };

    // Ensure minimum dimensions
    result.width = Math.max(result.width, MIN_WIDTH);
    result.height = Math.max(result.height, MIN_HEIGHT);

    // Ensure width and height don't exceed screen
    result.width = Math.min(result.width, dims.availableWidth);
    result.height = Math.min(result.height, dims.availableHeight);

    // Ensure at least MIN_VISIBLE_EDGE pixels visible on right edge
    if (result.x + MIN_VISIBLE_EDGE > dims.availableWidth) {
      result.x = dims.availableWidth - MIN_VISIBLE_EDGE;
    }

    // Ensure at least MIN_VISIBLE_EDGE pixels visible on bottom edge
    if (result.y + MIN_VISIBLE_EDGE > dims.availableHeight) {
      result.y = dims.availableHeight - MIN_VISIBLE_EDGE;
    }

    // Ensure window is not off the left side
    if (result.x < 0) {
      result.x = 0;
    }

    // Ensure window is not off the top side (allow for menu bar)
    if (result.y < 0) {
      result.y = 0;
    }

    return result;
  }

  /**
   * Get default bounds for an app window
   */
  getDefaultBounds(appId: string): WindowBounds {
    // Check for last known bounds for this app
    const lastBounds = this.getLastBounds(appId);
    if (lastBounds) {
      const position = this.getNextCascadePosition(appId);
      return this.constrainToScreen({
        ...lastBounds,
        x: position.x,
        y: position.y,
      });
    }

    // Use default with cascade position
    const position = this.getNextCascadePosition(appId);
    return this.constrainToScreen({
      ...DEFAULT_BOUNDS,
      x: position.x,
      y: position.y,
    });
  }

  /**
   * Get all window states
   */
  getAllStates(): PersistedWindowState[] {
    return Array.from(this.states.values());
  }

  /**
   * Get window states for a specific app
   */
  getAppStates(appId: string): PersistedWindowState[] {
    return Array.from(this.states.values()).filter(
      (state) => state.appId === appId
    );
  }

  /**
   * Subscribe to state changes
   */
  subscribe(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Force immediate save (useful before page unload)
   */
  flush(): void {
    if (this.saveTimeout !== null) {
      clearTimeout(this.saveTimeout);
      this.saveTimeout = null;
    }
    this.persistToStorage();
  }

  /**
   * Clear all window states
   */
  clear(): void {
    this.states.clear();
    this.cascadeCounters.clear();
    this.persistToStorage();
    this.notifyListeners();
  }
}

/**
 * Singleton instance
 */
export const windowStateManager = new WindowStateManager();

export { WindowStateManager };
