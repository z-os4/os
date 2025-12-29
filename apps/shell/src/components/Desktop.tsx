import React, { useState, useCallback } from 'react';
import { useWindowManager, useDesktopSettings, type AppType } from '@z-os/core';
import Dock from './dock/Dock';
import MenuBar from './MenuBar';
import DesktopContextMenu from './DesktopContextMenu';
import AppStore from './AppStore';
import Spotlight from './Spotlight';
import AppSwitcher from './AppSwitcher';
import Launchpad from './Launchpad';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
// Centralized window rendering with lazy loading
import { AllWindowsRenderer } from './WindowRenderer';
// System dialogs and screens
import ForceQuitDialog from './ForceQuitDialog';
import LockScreen from './LockScreen';
import RestartScreen from './RestartScreen';
import AboutZosWindow from './AboutZosWindow';
import CodeWindow from './CodeWindow';

interface DesktopProps {
  isLocked: boolean;
  onUnlock: () => void;
  onShutdown: () => void;
  onRestart: () => void;
  onLock: () => void;
}

// Map dock app ids to window AppTypes (core bundled apps only)
const APP_ID_TO_TYPE: Record<string, AppType> = {
  'finder': 'Finder',
  'safari': 'Safari',
  'mail': 'Mail',
  'photos': 'Photos',
  'calendar': 'Calendar',
  'messages': 'Messages',
  'facetime': 'FaceTime',
  'music': 'Music',
  'terminal': 'Terminal',
  'textedit': 'TextEdit',
  'hanzo': 'Hanzo AI',
  'lux': 'Lux Wallet',
  'zoo': 'Zoo',
  'settings': 'System Preferences',
  'calculator': 'Calculator',
  'notes': 'Notes',
  'clock': 'Clock',
  'weather': 'Weather',
  'reminders': 'Reminders',
  'stickies': 'Stickies',
  'activity-monitor': 'Activity Monitor',
};

const Desktop: React.FC<DesktopProps> = ({
  isLocked,
  onUnlock,
  onShutdown,
  onRestart,
  onLock,
}) => {
  const windows = useWindowManager();
  const { theme, customBgUrl } = useDesktopSettings();
  const wallpaper = customBgUrl || `/wallpapers/${theme}.png`;
  const [showAppStore, setShowAppStore] = useState(false);
  const [showLaunchpad, setShowLaunchpad] = useState(false);
  const [activeApp, setActiveApp] = useState('Finder');
  const [showSpotlight, setShowSpotlight] = useState(false);
  const [showAppSwitcher, setShowAppSwitcher] = useState(false);
  const [showForceQuit, setShowForceQuit] = useState(false);
  const [showAboutZos, setShowAboutZos] = useState(false);
  const [restartMode, setRestartMode] = useState<'restart' | 'shutdown' | null>(null);
  const [showXcode, setShowXcode] = useState(false);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onAppSwitcher: () => setShowAppSwitcher(true),
    onSpotlight: () => setShowSpotlight(prev => !prev),
    onCloseWindow: () => {
      // Close the focused window
      const focusedApp = Object.entries(APP_ID_TO_TYPE).find(([_, type]) => type === activeApp);
      if (focusedApp) {
        windows.closeWindow(focusedApp[1]);
      }
    },
    onQuitApp: () => {
      // Close all windows of active app
      const focusedApp = Object.entries(APP_ID_TO_TYPE).find(([_, type]) => type === activeApp);
      if (focusedApp) {
        windows.closeWindow(focusedApp[1]);
      }
    },
    onPreferences: () => {
      windows.openWindow('System Preferences');
      setActiveApp('System Preferences');
    },
    onForceQuit: () => setShowForceQuit(true),
  });

  const handleOpenApp = useCallback((appId: string) => {
    // Handle Xcode specially since it's not in windowManager
    if (appId === 'xcode') {
      setShowXcode(true);
      setActiveApp('Xcode');
      return;
    }
    const appType = APP_ID_TO_TYPE[appId];
    if (appType) {
      windows.openWindow(appType);
      setActiveApp(appType);
    }
  }, [windows]);

  // For dock compatibility - dynamic apps are now bundled
  const openDynamicApp = useCallback((identifier: string) => {
    // Map old dynamic identifiers to new bundled apps
    const identifierMap: Record<string, string> = {
      'ai.hanzo.calculator': 'calculator',
      'ai.hanzo.notes': 'notes',
      'ai.hanzo.clock': 'clock',
      'ai.hanzo.weather': 'weather',
      'ai.hanzo.todo': 'reminders',
    };
    const appId = identifierMap[identifier];
    if (appId) {
      handleOpenApp(appId);
    }
  }, [handleOpenApp]);

  const handleOpenAppStore = useCallback(() => {
    setShowAppStore(true);
  }, []);

  // Get list of running app IDs for dock
  const runningApps = Object.entries(APP_ID_TO_TYPE)
    .filter(([_, appType]) => windows.isOpen(appType))
    .map(([id]) => id);

  // Get active app ID for dock
  const activeAppId = Object.entries(APP_ID_TO_TYPE)
    .find(([_, appType]) => appType === activeApp)?.[0] || '';

  // Handle restart/shutdown completion
  const handleRestartComplete = useCallback(() => {
    setRestartMode(null);
    if (restartMode === 'restart') {
      // Show lock screen after restart
      onLock();
    }
    // For shutdown, the RestartScreen handles the "wake" click
  }, [restartMode, onLock]);

  // Handle restart from menu
  const handleRestart = useCallback(() => {
    setRestartMode('restart');
  }, []);

  // Handle shutdown from menu
  const handleShutdown = useCallback(() => {
    setRestartMode('shutdown');
  }, []);

  // Show restart/shutdown screen if in that mode
  if (restartMode) {
    return (
      <RestartScreen
        mode={restartMode}
        onComplete={handleRestartComplete}
      />
    );
  }

  if (isLocked) {
    return <LockScreen onUnlock={onUnlock} userName="User" />;
  }

  return (
    <DesktopContextMenu
      onChangeWallpaper={() => console.log('Change wallpaper')}
      onNewFolder={() => console.log('New folder')}
    >
      <div
        className="relative h-full w-full"
        style={{ backgroundColor: '#1c1c1e' }}
      >
        {/* Menu Bar */}
        <MenuBar
          appName={activeApp}
          onShutdown={handleShutdown}
          onRestart={handleRestart}
          onLockScreen={onLock}
          onSleep={onLock}
          onOpenSettings={() => windows.openWindow('System Preferences')}
          onOpenSpotlight={() => setShowSpotlight(true)}
          onForceQuit={() => setShowForceQuit(true)}
          onAboutMac={() => setShowAboutZos(true)}
            onOpenAppStore={handleOpenAppStore}
          onQuitApp={() => {
            // Close the active window
            if (windows.activeApp) {
              windows.closeWindow(windows.activeApp);
            }
          }}
        />

        {/* Desktop Content */}
        <div className="pt-7 pb-20 h-full">
          {/* All System Windows - lazy loaded via WindowRenderer */}
          <AllWindowsRenderer
            openWindows={windows.windows}
            closeWindow={windows.closeWindow}
            focusWindow={windows.focusWindow}
          />

          {/* Xcode Window */}
          {showXcode && (
            <CodeWindow
              onClose={() => setShowXcode(false)}
              onFocus={() => setActiveApp('Xcode')}
            />
          )}

          {/* App Store Window */}
          {showAppStore && (
            <div className="fixed glass-window rounded-xl overflow-hidden z-50 animate-window-open"
              style={{
                left: 'calc(50% - 280px)',
                top: 'calc(50% - 250px)',
                width: 560,
                height: 500,
              }}
            >
              {/* Title bar */}
              <div className="h-8 flex items-center px-3 border-b border-white/10 bg-black/20 cursor-move relative">
                <div className="traffic-lights flex gap-1.5">
                  <button onClick={() => setShowAppStore(false)} className="traffic-light traffic-light-close group">
                    <svg viewBox="0 0 8 8" className="text-[#4d0000]">
                      <path d="M1 1L7 7M7 1L1 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                    </svg>
                  </button>
                  <button className="traffic-light traffic-light-minimize group">
                    <svg viewBox="0 0 8 8" className="text-[#995700]">
                      <path d="M1 4h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                    </svg>
                  </button>
                  <button className="traffic-light traffic-light-maximize group">
                    <svg viewBox="0 0 8 8" className="text-[#006500]">
                      <path d="M1 1h6v6H1z" stroke="currentColor" strokeWidth="1" fill="none"/>
                    </svg>
                  </button>
                </div>
                <span className="absolute left-1/2 -translate-x-1/2 text-sm text-white/70 font-medium">
                  App Store
                </span>
              </div>
              <div className="h-[calc(100%-32px)] overflow-hidden">
                <AppStore
                  onLaunchApp={openDynamicApp}
                  onClose={() => setShowAppStore(false)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Dock - using proper macOS-style icons */}
        <Dock
          onOpenApp={handleOpenApp}
          onOpenDynamicApp={openDynamicApp}
          onOpenAppStore={handleOpenAppStore}
          onApplicationsClick={() => setShowLaunchpad(true)}
          onTrashClick={() => handleOpenApp('finder')}
          activeApps={[activeAppId]}
          runningApps={[...runningApps, showAppStore ? 'appstore' : ''].filter(Boolean)}
        />

        {/* Spotlight Search */}
        <Spotlight
          isOpen={showSpotlight}
          onClose={() => setShowSpotlight(false)}
          onOpenApp={handleOpenApp}
        />

        {/* App Switcher */}
        <AppSwitcher
          isOpen={showAppSwitcher}
          onClose={() => setShowAppSwitcher(false)}
          onSelectApp={handleOpenApp}
          runningApps={runningApps}
        />

        {/* Launchpad */}
        <Launchpad
          isOpen={showLaunchpad}
          onClose={() => setShowLaunchpad(false)}
          onOpenApp={handleOpenApp}
        />

        {/* Force Quit Dialog */}
        <ForceQuitDialog
          isOpen={showForceQuit}
          onClose={() => setShowForceQuit(false)}
          openApps={windows.openApps}
          onForceQuit={(app) => {
            windows.closeWindow(app);
          }}
        />

        {/* About zOS Window */}
        <AboutZosWindow
          isOpen={showAboutZos}
          onClose={() => setShowAboutZos(false)}
        />
      </div>
    </DesktopContextMenu>
  );
};

export default Desktop;
