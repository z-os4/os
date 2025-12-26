import { useEffect, useCallback } from 'react';

interface KeyboardShortcutsOptions {
  onAppSwitcher?: () => void;
  onSpotlight?: () => void;
  onCloseWindow?: () => void;
  onMinimizeWindow?: () => void;
  onHideApp?: () => void;
  onQuitApp?: () => void;
  onPreferences?: () => void;
  onNewWindow?: () => void;
  onFullScreen?: () => void;
}

export function useKeyboardShortcuts(options: KeyboardShortcutsOptions) {
  const {
    onAppSwitcher,
    onSpotlight,
    onCloseWindow,
    onMinimizeWindow,
    onHideApp,
    onQuitApp,
    onPreferences,
    onNewWindow,
    onFullScreen,
  } = options;

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const isMeta = e.metaKey || e.ctrlKey;
    const isShift = e.shiftKey;

    // Prevent default for our shortcuts
    if (isMeta) {
      switch (e.key.toLowerCase()) {
        case 'tab':
          // ⌘Tab - App Switcher
          e.preventDefault();
          onAppSwitcher?.();
          break;
        case ' ':
          // ⌘Space - Spotlight
          e.preventDefault();
          onSpotlight?.();
          break;
        case 'w':
          // ⌘W - Close Window
          e.preventDefault();
          onCloseWindow?.();
          break;
        case 'm':
          // ⌘M - Minimize Window
          e.preventDefault();
          onMinimizeWindow?.();
          break;
        case 'h':
          // ⌘H - Hide App
          e.preventDefault();
          onHideApp?.();
          break;
        case 'q':
          // ⌘Q - Quit App
          e.preventDefault();
          onQuitApp?.();
          break;
        case ',':
          // ⌘, - Preferences
          e.preventDefault();
          onPreferences?.();
          break;
        case 'n':
          // ⌘N - New Window
          e.preventDefault();
          onNewWindow?.();
          break;
        case 'f':
          if (isShift || e.ctrlKey) {
            // ⌘⇧F or ⌃⌘F - Full Screen
            e.preventDefault();
            onFullScreen?.();
          }
          break;
      }
    }
  }, [
    onAppSwitcher,
    onSpotlight,
    onCloseWindow,
    onMinimizeWindow,
    onHideApp,
    onQuitApp,
    onPreferences,
    onNewWindow,
    onFullScreen,
  ]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

export default useKeyboardShortcuts;
