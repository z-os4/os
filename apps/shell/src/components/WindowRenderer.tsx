/**
 * Window Renderer
 *
 * Centralized window rendering with support for both bundled and dynamic apps.
 * Includes proper lifecycle management for clean app quit/cleanup.
 */

import React, { ComponentType, lazy, Suspense, useEffect, useRef, useCallback } from 'react';
import { type AppType } from '@z-os/core';

interface WindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

// Lazy load all window components for code splitting
// Window components map - App Store is excluded as it has custom props and is rendered separately
const windowComponents: Partial<Record<AppType, ComponentType<WindowProps>>> = {
  'Finder': lazy(() => import('./windows/FinderWindow')),
  'Terminal': lazy(() => import('./windows/TerminalWindow')),
  'Safari': lazy(() => import('./windows/SafariWindow')),
  'Hanzo AI': lazy(() => import('./windows/HanzoAIWindow')),
  'System Preferences': lazy(() => import('./windows/SettingsWindow')),
  'Calculator': lazy(() => import('./windows/CalculatorWindow')),
  'Clock': lazy(() => import('./windows/ClockWindow')),
  'Notes': lazy(() => import('./windows/NotesWindow')),
  'Weather': lazy(() => import('./windows/WeatherWindow')),
  'Reminders': lazy(() => import('./windows/RemindersWindow')),
  'Mail': lazy(() => import('./windows/MailWindow')),
  'Photos': lazy(() => import('./windows/PhotosWindow')),
  'Calendar': lazy(() => import('./windows/CalendarWindow')),
  'Messages': lazy(() => import('./windows/MessagesWindow')),
  'FaceTime': lazy(() => import('./windows/FaceTimeWindow')),
  'Music': lazy(() => import('./windows/MusicWindow')),
  'TextEdit': lazy(() => import('./windows/TextEditWindow')),
  'Lux Wallet': lazy(() => import('./windows/LuxWindow')),
  'Zoo': lazy(() => import('./windows/ZooWindow')),
  'Stickies': lazy(() => import('./windows/StickiesWindow')),
  'Activity Monitor': lazy(() => import('./windows/ActivityMonitorWindow')),
};

// Loading fallback component
const WindowLoading: React.FC<{ appName: string }> = ({ appName }) => (
  <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
    <div className="bg-black/80 rounded-xl p-6 text-center">
      <div className="w-8 h-8 mx-auto mb-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      <p className="text-sm text-white/70">Loading {appName}...</p>
    </div>
  </div>
);

interface WindowRendererProps {
  /** The app type to render */
  appType: AppType;
  /** Whether the window is open */
  isOpen: boolean;
  /** Callback when window is closed */
  onClose: () => void;
  /** Callback when window is focused */
  onFocus: () => void;
  /** Callback after window is fully unmounted */
  onUnmounted?: () => void;
}

// Track active window instances for lifecycle management
const activeWindows = new Map<string, {
  mountedAt: number;
  cleanups: Set<() => void>;
}>();

/**
 * Renders a single window if it's open with proper lifecycle management
 */
export const WindowRenderer: React.FC<WindowRendererProps> = ({
  appType,
  isOpen,
  onClose,
  onFocus,
  onUnmounted,
}) => {
  const instanceId = `window-${appType}`;
  const isUnmountingRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Setup lifecycle on mount
  useEffect(() => {
    if (!isOpen) return;

    // Register this window instance
    activeWindows.set(instanceId, {
      mountedAt: Date.now(),
      cleanups: new Set(),
    });

    console.log(`[WindowRenderer] Mounted: ${appType}`);

    return () => {
      // Cleanup on unmount
      const instance = activeWindows.get(instanceId);
      if (instance) {
        console.log(`[WindowRenderer] Unmounting: ${appType} (lifetime: ${Date.now() - instance.mountedAt}ms)`);

        // Run all registered cleanups
        for (const cleanup of instance.cleanups) {
          try {
            cleanup();
          } catch (e) {
            console.error(`[WindowRenderer] Cleanup error for ${appType}:`, e);
          }
        }
        instance.cleanups.clear();
        activeWindows.delete(instanceId);
      }

      // Note: Don't manually remove from DOM - React handles this
      onUnmounted?.();
      console.log(`[WindowRenderer] Fully cleaned up: ${appType}`);
    };
  }, [isOpen, instanceId, appType, onUnmounted]);

  // Handle close with cleanup
  const handleClose = useCallback(() => {
    if (isUnmountingRef.current) return;
    isUnmountingRef.current = true;

    console.log(`[WindowRenderer] Closing: ${appType}`);
    onClose();
  }, [appType, onClose]);

  if (!isOpen) return null;

  const Component = windowComponents[appType];
  if (!Component) {
    console.warn(`No window component for app: ${appType}`);
    return null;
  }

  return (
    <div ref={containerRef} data-window-id={instanceId} className="contents">
      <Suspense fallback={<WindowLoading appName={appType} />}>
        <Component onClose={handleClose} onFocus={onFocus} />
      </Suspense>
    </div>
  );
};

interface AllWindowsRendererProps {
  /** Window manager state - which windows are open */
  openWindows: Record<AppType, boolean>;
  /** Close window callback */
  closeWindow: (app: AppType) => void;
  /** Focus window callback */
  focusWindow: (app: AppType) => void;
}

/**
 * Renders all open windows
 */
export const AllWindowsRenderer: React.FC<AllWindowsRendererProps> = ({
  openWindows,
  closeWindow,
  focusWindow,
}) => {
  const openAppTypes = (Object.keys(openWindows) as AppType[]).filter(
    (app) => openWindows[app] && windowComponents[app]
  );

  return (
    <>
      {openAppTypes.map((appType) => (
        <WindowRenderer
          key={appType}
          appType={appType}
          isOpen={true}
          onClose={() => closeWindow(appType)}
          onFocus={() => focusWindow(appType)}
        />
      ))}
    </>
  );
};

/**
 * Get list of available window types
 */
export function getAvailableWindows(): AppType[] {
  return Object.keys(windowComponents) as AppType[];
}

/**
 * Check if a window component exists
 */
export function hasWindowComponent(appType: AppType): boolean {
  return appType in windowComponents;
}

/**
 * Get all currently active windows
 */
export function getActiveWindows(): Array<{ appType: string; mountedAt: number }> {
  return Array.from(activeWindows.entries()).map(([id, data]) => ({
    appType: id.replace('window-', ''),
    mountedAt: data.mountedAt,
  }));
}

/**
 * Register a cleanup function for a window
 */
export function registerWindowCleanup(appType: AppType, cleanup: () => void): () => void {
  const instanceId = `window-${appType}`;
  const instance = activeWindows.get(instanceId);
  if (instance) {
    instance.cleanups.add(cleanup);
    return () => instance.cleanups.delete(cleanup);
  }
  console.warn(`[WindowRenderer] No active window for: ${appType}`);
  return () => {};
}

/**
 * Force quit a window (immediate cleanup)
 */
export function forceQuitWindow(appType: AppType): void {
  const instanceId = `window-${appType}`;
  const instance = activeWindows.get(instanceId);
  if (instance) {
    console.log(`[WindowRenderer] Force quitting: ${appType}`);
    for (const cleanup of instance.cleanups) {
      try {
        cleanup();
      } catch (e) {
        console.error(`[WindowRenderer] Force quit cleanup error:`, e);
      }
    }
    instance.cleanups.clear();
    activeWindows.delete(instanceId);
  }
}

/**
 * Force quit all windows (for shutdown)
 */
export function forceQuitAllWindows(): void {
  console.log(`[WindowRenderer] Force quitting all windows (${activeWindows.size} active)`);
  for (const [id, instance] of activeWindows) {
    for (const cleanup of instance.cleanups) {
      try {
        cleanup();
      } catch (e) {
        console.error(`[WindowRenderer] Force quit cleanup error for ${id}:`, e);
      }
    }
    instance.cleanups.clear();
  }
  activeWindows.clear();
  console.log(`[WindowRenderer] All windows force quit`);
}

export default AllWindowsRenderer;
