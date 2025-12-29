/**
 * App Lifecycle Manager
 *
 * Manages the complete lifecycle of apps:
 * - Mount/Unmount
 * - Cleanup (event listeners, timers, subscriptions)
 * - Memory management
 * - Force quit
 */

export type CleanupFn = () => void | Promise<void>;

export interface AppLifecycle {
  /** App identifier */
  id: string;
  /** Current state */
  state: 'loading' | 'mounted' | 'unmounting' | 'unmounted';
  /** Registered cleanup functions */
  cleanups: Set<CleanupFn>;
  /** Registered intervals */
  intervals: Set<ReturnType<typeof setInterval>>;
  /** Registered timeouts */
  timeouts: Set<ReturnType<typeof setTimeout>>;
  /** Registered event listeners */
  eventListeners: Map<EventTarget, Array<{ type: string; listener: EventListener }>>;
  /** Mounted timestamp */
  mountedAt: number | null;
  /** Unmounted timestamp */
  unmountedAt: number | null;
  /** DOM container reference */
  container: HTMLElement | null;
}

// Active app lifecycles
const lifecycles = new Map<string, AppLifecycle>();

// Lifecycle event listeners
type LifecycleEvent = 'mount' | 'unmount' | 'forceQuit' | 'cleanup';
const lifecycleListeners = new Map<LifecycleEvent, Set<(appId: string) => void>>();

/**
 * Create a new lifecycle for an app
 */
export function createLifecycle(appId: string): AppLifecycle {
  if (lifecycles.has(appId)) {
    console.warn(`[Lifecycle] App ${appId} already has a lifecycle, cleaning up old one`);
    destroyLifecycle(appId);
  }

  const lifecycle: AppLifecycle = {
    id: appId,
    state: 'loading',
    cleanups: new Set(),
    intervals: new Set(),
    timeouts: new Set(),
    eventListeners: new Map(),
    mountedAt: null,
    unmountedAt: null,
    container: null,
  };

  lifecycles.set(appId, lifecycle);
  console.log(`[Lifecycle] Created lifecycle for: ${appId}`);
  return lifecycle;
}

/**
 * Mark app as mounted
 */
export function markMounted(appId: string, container?: HTMLElement): void {
  const lifecycle = lifecycles.get(appId);
  if (!lifecycle) {
    console.warn(`[Lifecycle] No lifecycle found for: ${appId}`);
    return;
  }

  lifecycle.state = 'mounted';
  lifecycle.mountedAt = Date.now();
  lifecycle.container = container || null;

  emitLifecycleEvent('mount', appId);
  console.log(`[Lifecycle] App mounted: ${appId}`);
}

/**
 * Register a cleanup function to be called on unmount
 */
export function registerCleanup(appId: string, cleanup: CleanupFn): CleanupFn {
  const lifecycle = lifecycles.get(appId);
  if (!lifecycle) {
    console.warn(`[Lifecycle] No lifecycle for ${appId}, cleanup may leak`);
    return cleanup;
  }

  lifecycle.cleanups.add(cleanup);

  // Return unregister function
  return () => {
    lifecycle.cleanups.delete(cleanup);
  };
}

/**
 * Register an interval (auto-cleared on unmount)
 */
export function registerInterval(
  appId: string,
  callback: () => void,
  ms: number
): ReturnType<typeof setInterval> | null {
  const lifecycle = lifecycles.get(appId);
  if (!lifecycle || lifecycle.state !== 'mounted') {
    console.warn(`[Lifecycle] Cannot register interval for unmounted app: ${appId}`);
    return null;
  }

  const id = setInterval(callback, ms);
  lifecycle.intervals.add(id);
  return id;
}

/**
 * Register a timeout (auto-cleared on unmount)
 */
export function registerTimeout(
  appId: string,
  callback: () => void,
  ms: number
): ReturnType<typeof setTimeout> | null {
  const lifecycle = lifecycles.get(appId);
  if (!lifecycle || lifecycle.state !== 'mounted') {
    console.warn(`[Lifecycle] Cannot register timeout for unmounted app: ${appId}`);
    return null;
  }

  const id = setTimeout(() => {
    lifecycle.timeouts.delete(id);
    callback();
  }, ms);
  lifecycle.timeouts.add(id);
  return id;
}

/**
 * Register an event listener (auto-removed on unmount)
 */
export function registerEventListener(
  appId: string,
  target: EventTarget,
  type: string,
  listener: EventListener,
  options?: AddEventListenerOptions
): CleanupFn {
  const lifecycle = lifecycles.get(appId);
  if (!lifecycle) {
    console.warn(`[Lifecycle] No lifecycle for ${appId}, event listener may leak`);
    target.addEventListener(type, listener, options);
    return () => target.removeEventListener(type, listener, options);
  }

  target.addEventListener(type, listener, options);

  if (!lifecycle.eventListeners.has(target)) {
    lifecycle.eventListeners.set(target, []);
  }
  lifecycle.eventListeners.get(target)!.push({ type, listener });

  return () => {
    target.removeEventListener(type, listener, options);
    const listeners = lifecycle.eventListeners.get(target);
    if (listeners) {
      const idx = listeners.findIndex(l => l.type === type && l.listener === listener);
      if (idx !== -1) listeners.splice(idx, 1);
    }
  };
}

/**
 * Unmount an app gracefully
 */
export async function unmountApp(appId: string): Promise<void> {
  const lifecycle = lifecycles.get(appId);
  if (!lifecycle) {
    console.warn(`[Lifecycle] No lifecycle found for: ${appId}`);
    return;
  }

  if (lifecycle.state === 'unmounting' || lifecycle.state === 'unmounted') {
    console.warn(`[Lifecycle] App ${appId} is already unmounting/unmounted`);
    return;
  }

  lifecycle.state = 'unmounting';
  console.log(`[Lifecycle] Unmounting app: ${appId}`);

  // Run cleanups
  await runCleanups(lifecycle);

  lifecycle.state = 'unmounted';
  lifecycle.unmountedAt = Date.now();

  emitLifecycleEvent('unmount', appId);
  console.log(`[Lifecycle] App unmounted: ${appId} (lifetime: ${lifecycle.unmountedAt - (lifecycle.mountedAt || 0)}ms)`);
}

/**
 * Force quit an app (immediate cleanup, no graceful shutdown)
 */
export function forceQuitApp(appId: string): void {
  const lifecycle = lifecycles.get(appId);
  if (!lifecycle) {
    console.warn(`[Lifecycle] No lifecycle found for: ${appId}`);
    return;
  }

  console.log(`[Lifecycle] Force quitting app: ${appId}`);
  emitLifecycleEvent('forceQuit', appId);

  // Immediate cleanup
  runCleanupsSync(lifecycle);

  lifecycle.state = 'unmounted';
  lifecycle.unmountedAt = Date.now();

  // Remove from DOM if container exists
  if (lifecycle.container && lifecycle.container.parentNode) {
    lifecycle.container.parentNode.removeChild(lifecycle.container);
  }

  console.log(`[Lifecycle] App force quit: ${appId}`);
}

/**
 * Destroy lifecycle completely (after unmount)
 */
export function destroyLifecycle(appId: string): void {
  const lifecycle = lifecycles.get(appId);
  if (!lifecycle) return;

  // Ensure cleanup happened
  if (lifecycle.state !== 'unmounted') {
    forceQuitApp(appId);
  }

  // Clear all references
  lifecycle.cleanups.clear();
  lifecycle.intervals.clear();
  lifecycle.timeouts.clear();
  lifecycle.eventListeners.clear();
  lifecycle.container = null;

  lifecycles.delete(appId);
  console.log(`[Lifecycle] Lifecycle destroyed: ${appId}`);
}

/**
 * Run all cleanup functions for a lifecycle
 */
async function runCleanups(lifecycle: AppLifecycle): Promise<void> {
  emitLifecycleEvent('cleanup', lifecycle.id);

  // Clear all timeouts
  for (const id of lifecycle.timeouts) {
    clearTimeout(id);
  }
  lifecycle.timeouts.clear();

  // Clear all intervals
  for (const id of lifecycle.intervals) {
    clearInterval(id);
  }
  lifecycle.intervals.clear();

  // Remove all event listeners
  for (const [target, listeners] of lifecycle.eventListeners) {
    for (const { type, listener } of listeners) {
      target.removeEventListener(type, listener);
    }
  }
  lifecycle.eventListeners.clear();

  // Run cleanup functions (may be async)
  const cleanupPromises: Promise<void>[] = [];
  for (const cleanup of lifecycle.cleanups) {
    try {
      const result = cleanup();
      if (result instanceof Promise) {
        cleanupPromises.push(result);
      }
    } catch (e) {
      console.error(`[Lifecycle] Cleanup error in ${lifecycle.id}:`, e);
    }
  }
  lifecycle.cleanups.clear();

  // Wait for async cleanups
  if (cleanupPromises.length > 0) {
    await Promise.allSettled(cleanupPromises);
  }
}

/**
 * Synchronous cleanup (for force quit)
 */
function runCleanupsSync(lifecycle: AppLifecycle): void {
  // Clear all timeouts
  for (const id of lifecycle.timeouts) {
    clearTimeout(id);
  }
  lifecycle.timeouts.clear();

  // Clear all intervals
  for (const id of lifecycle.intervals) {
    clearInterval(id);
  }
  lifecycle.intervals.clear();

  // Remove all event listeners
  for (const [target, listeners] of lifecycle.eventListeners) {
    for (const { type, listener } of listeners) {
      target.removeEventListener(type, listener);
    }
  }
  lifecycle.eventListeners.clear();

  // Run cleanup functions synchronously
  for (const cleanup of lifecycle.cleanups) {
    try {
      cleanup();
    } catch (e) {
      console.error(`[Lifecycle] Cleanup error in ${lifecycle.id}:`, e);
    }
  }
  lifecycle.cleanups.clear();
}

/**
 * Get lifecycle state for an app
 */
export function getLifecycle(appId: string): AppLifecycle | undefined {
  return lifecycles.get(appId);
}

/**
 * Get all active lifecycles
 */
export function getAllLifecycles(): AppLifecycle[] {
  return Array.from(lifecycles.values());
}

/**
 * Subscribe to lifecycle events
 */
export function onLifecycleEvent(
  event: LifecycleEvent,
  callback: (appId: string) => void
): CleanupFn {
  if (!lifecycleListeners.has(event)) {
    lifecycleListeners.set(event, new Set());
  }
  lifecycleListeners.get(event)!.add(callback);

  return () => {
    lifecycleListeners.get(event)?.delete(callback);
  };
}

function emitLifecycleEvent(event: LifecycleEvent, appId: string): void {
  const listeners = lifecycleListeners.get(event);
  if (listeners) {
    for (const listener of listeners) {
      try {
        listener(appId);
      } catch (e) {
        console.error(`[Lifecycle] Event listener error:`, e);
      }
    }
  }
}

/**
 * Quit all apps (for shutdown)
 */
export async function quitAllApps(): Promise<void> {
  console.log(`[Lifecycle] Quitting all apps (${lifecycles.size} active)`);

  const unmountPromises: Promise<void>[] = [];
  for (const lifecycle of lifecycles.values()) {
    if (lifecycle.state === 'mounted') {
      unmountPromises.push(unmountApp(lifecycle.id));
    }
  }

  await Promise.allSettled(unmountPromises);

  // Destroy all lifecycles
  for (const appId of Array.from(lifecycles.keys())) {
    destroyLifecycle(appId);
  }

  console.log(`[Lifecycle] All apps quit`);
}

/**
 * Force quit all apps (immediate)
 */
export function forceQuitAllApps(): void {
  console.log(`[Lifecycle] Force quitting all apps (${lifecycles.size} active)`);

  for (const appId of Array.from(lifecycles.keys())) {
    forceQuitApp(appId);
    destroyLifecycle(appId);
  }

  console.log(`[Lifecycle] All apps force quit`);
}
