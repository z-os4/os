import React, { useState, useCallback } from 'react';
import { useWindowManager, useDesktopSettings, type AppType } from '@z-os/core';
import Dock from './dock/Dock';
import MenuBar from './MenuBar';
import DesktopContextMenu from './DesktopContextMenu';
import AppStore from './AppStore';
import Spotlight from './Spotlight';
import AppSwitcher from './AppSwitcher';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
// System Windows - all bundled locally
import {
  FinderWindow,
  TerminalWindow,
  SafariWindow,
  HanzoAIWindow,
  SettingsWindow,
  CalculatorWindow,
  ClockWindow,
  NotesWindow,
  WeatherWindow,
  RemindersWindow,
  MailWindow,
  PhotosWindow,
  CalendarWindow,
  MessagesWindow,
  FaceTimeWindow,
  MusicWindow,
  TextEditWindow,
  LuxWindow,
  ZooWindow,
} from './windows';

interface DesktopProps {
  isLocked: boolean;
  onUnlock: () => void;
  onShutdown: () => void;
  onRestart: () => void;
  onLock: () => void;
}

// Map dock app ids to window AppTypes
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
  const [activeApp, setActiveApp] = useState('Finder');
  const [showSpotlight, setShowSpotlight] = useState(false);
  const [showAppSwitcher, setShowAppSwitcher] = useState(false);

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
  });

  const handleOpenApp = useCallback((appId: string) => {
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

  if (isLocked) {
    return (
      <div
        className="h-full w-full flex items-center justify-center bg-black"
      >
        <div className="text-center text-white">
          <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-xl mb-4 mx-auto flex items-center justify-center border border-white/30">
            <span className="text-4xl">👤</span>
          </div>
          <h2 className="text-2xl font-semibold mb-2">zOS</h2>
          <button
            onClick={onUnlock}
            className="px-6 py-2 bg-white/20 backdrop-blur-xl rounded-full hover:bg-white/30 border border-white/20 transition-colors"
          >
            Click to unlock
          </button>
        </div>
      </div>
    );
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
          activeApp={activeApp}
          onShutdown={onShutdown}
          onRestart={onRestart}
          onLock={onLock}
        />

        {/* Desktop Content */}
        <div className="pt-7 pb-20 h-full">
          {/* System Windows */}
          {windows.isOpen('Finder') && (
            <FinderWindow
              onClose={() => windows.closeWindow('Finder')}
              onFocus={() => windows.focusWindow('Finder')}
            />
          )}
          {windows.isOpen('Terminal') && (
            <TerminalWindow
              onClose={() => windows.closeWindow('Terminal')}
              onFocus={() => windows.focusWindow('Terminal')}
            />
          )}
          {windows.isOpen('Safari') && (
            <SafariWindow
              onClose={() => windows.closeWindow('Safari')}
              onFocus={() => windows.focusWindow('Safari')}
            />
          )}
          {windows.isOpen('Hanzo AI') && (
            <HanzoAIWindow
              onClose={() => windows.closeWindow('Hanzo AI')}
              onFocus={() => windows.focusWindow('Hanzo AI')}
            />
          )}
          {windows.isOpen('System Preferences') && (
            <SettingsWindow
              onClose={() => windows.closeWindow('System Preferences')}
              onFocus={() => windows.focusWindow('System Preferences')}
            />
          )}
          {windows.isOpen('Calculator') && (
            <CalculatorWindow
              onClose={() => windows.closeWindow('Calculator')}
              onFocus={() => windows.focusWindow('Calculator')}
            />
          )}
          {windows.isOpen('Clock') && (
            <ClockWindow
              onClose={() => windows.closeWindow('Clock')}
              onFocus={() => windows.focusWindow('Clock')}
            />
          )}
          {windows.isOpen('Notes') && (
            <NotesWindow
              onClose={() => windows.closeWindow('Notes')}
              onFocus={() => windows.focusWindow('Notes')}
            />
          )}
          {windows.isOpen('Weather') && (
            <WeatherWindow
              onClose={() => windows.closeWindow('Weather')}
              onFocus={() => windows.focusWindow('Weather')}
            />
          )}
          {windows.isOpen('Reminders') && (
            <RemindersWindow
              onClose={() => windows.closeWindow('Reminders')}
              onFocus={() => windows.focusWindow('Reminders')}
            />
          )}
          {windows.isOpen('Mail') && (
            <MailWindow
              onClose={() => windows.closeWindow('Mail')}
              onFocus={() => windows.focusWindow('Mail')}
            />
          )}
          {windows.isOpen('Photos') && (
            <PhotosWindow
              onClose={() => windows.closeWindow('Photos')}
              onFocus={() => windows.focusWindow('Photos')}
            />
          )}
          {windows.isOpen('Calendar') && (
            <CalendarWindow
              onClose={() => windows.closeWindow('Calendar')}
              onFocus={() => windows.focusWindow('Calendar')}
            />
          )}
          {windows.isOpen('Messages') && (
            <MessagesWindow
              onClose={() => windows.closeWindow('Messages')}
              onFocus={() => windows.focusWindow('Messages')}
            />
          )}
          {windows.isOpen('FaceTime') && (
            <FaceTimeWindow
              onClose={() => windows.closeWindow('FaceTime')}
              onFocus={() => windows.focusWindow('FaceTime')}
            />
          )}
          {windows.isOpen('Music') && (
            <MusicWindow
              onClose={() => windows.closeWindow('Music')}
              onFocus={() => windows.focusWindow('Music')}
            />
          )}
          {windows.isOpen('TextEdit') && (
            <TextEditWindow
              onClose={() => windows.closeWindow('TextEdit')}
              onFocus={() => windows.focusWindow('TextEdit')}
            />
          )}
          {windows.isOpen('Lux Wallet') && (
            <LuxWindow
              onClose={() => windows.closeWindow('Lux Wallet')}
              onFocus={() => windows.focusWindow('Lux Wallet')}
            />
          )}
          {windows.isOpen('Zoo') && (
            <ZooWindow
              onClose={() => windows.closeWindow('Zoo')}
              onFocus={() => windows.focusWindow('Zoo')}
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
      </div>
    </DesktopContextMenu>
  );
};

export default Desktop;
