/**
 * Responsive Shell
 *
 * Automatically switches between desktop and mobile layouts based on device.
 * - Mobile: iOS-style home screen with swipeable pages
 * - Tablet: iPad-style with larger grid and split view support
 * - Desktop: macOS-style with windows and dock
 */

import React, { useState, useCallback } from 'react';
import { useWindowManager, type AppType } from '@z-os/core';
import { useDevice } from './hooks/useDevice';
import { MobileShell } from './mobile/MobileShell';
import { MobileApp } from './mobile/MobileApp';
import Desktop from './Desktop';

// Show debug indicator in dev mode
const DEV_MODE = import.meta.env.DEV;

// App type mapping
const APP_ID_TO_TYPE: Record<string, AppType> = {
  finder: 'Finder',
  safari: 'Safari',
  mail: 'Mail',
  photos: 'Photos',
  calendar: 'Calendar',
  messages: 'Messages',
  facetime: 'FaceTime',
  music: 'Music',
  terminal: 'Terminal',
  textedit: 'TextEdit',
  hanzo: 'Hanzo AI',
  lux: 'Lux Wallet',
  zoo: 'Zoo',
  settings: 'System Preferences',
  calculator: 'Calculator',
  notes: 'Notes',
  clock: 'Clock',
  weather: 'Weather',
  reminders: 'Reminders',
  stickies: 'Stickies',
  'activity-monitor': 'Activity Monitor',
};

// Lazy load window components for mobile
const windowComponents: Record<string, React.LazyExoticComponent<React.FC<{ onClose: () => void }>>> = {
  Finder: React.lazy(() => import('./windows/FinderWindow')),
  Safari: React.lazy(() => import('./windows/SafariWindow')),
  Terminal: React.lazy(() => import('./windows/TerminalWindow')),
  Calculator: React.lazy(() => import('./windows/CalculatorWindow')),
  Notes: React.lazy(() => import('./windows/NotesWindow')),
  Mail: React.lazy(() => import('./windows/MailWindow')),
  Calendar: React.lazy(() => import('./windows/CalendarWindow')),
  Messages: React.lazy(() => import('./windows/MessagesWindow')),
  Music: React.lazy(() => import('./windows/MusicWindow')),
  Photos: React.lazy(() => import('./windows/PhotosWindow')),
  Weather: React.lazy(() => import('./windows/WeatherWindow')),
  Clock: React.lazy(() => import('./windows/ClockWindow')),
  'Hanzo AI': React.lazy(() => import('./windows/HanzoAIWindow')),
  'Lux Wallet': React.lazy(() => import('./windows/LuxWindow')),
  Zoo: React.lazy(() => import('./windows/ZooWindow')),
  'System Preferences': React.lazy(() => import('./windows/SettingsWindow')),
  Reminders: React.lazy(() => import('./windows/RemindersWindow')),
  Stickies: React.lazy(() => import('./windows/StickiesWindow')),
  TextEdit: React.lazy(() => import('./windows/TextEditWindow')),
};

interface ResponsiveShellProps {
  isLocked: boolean;
  onUnlock: () => void;
  onShutdown: () => void;
  onRestart: () => void;
  onLock: () => void;
}

// Debug indicator component
const DeviceDebugIndicator: React.FC<{ type: string; width: number }> = ({ type, width }) => {
  if (!DEV_MODE) return null;
  
  const colors: Record<string, string> = {
    mobile: 'bg-green-500',
    tablet: 'bg-blue-500', 
    laptop: 'bg-yellow-500',
    desktop: 'bg-red-500',
  };
  
  return (
    <div className={`fixed bottom-20 right-4 z-[9999] ${colors[type] || 'bg-gray-500'} text-white text-xs px-2 py-1 rounded-full opacity-75`}>
      {type} ({width}px)
    </div>
  );
};

export const ResponsiveShell: React.FC<ResponsiveShellProps> = (props) => {
  const { isMobile, isTablet, isDesktop, type, screenWidth } = useDevice();
  const windows = useWindowManager();
  const [activeApp, setActiveApp] = useState<AppType | null>(null);
  const [showSearch, setShowSearch] = useState(false);

  // Open app handler for mobile
  const handleOpenApp = useCallback((appId: string) => {
    const appType = APP_ID_TO_TYPE[appId];
    if (appType) {
      if (isMobile || isTablet) {
        // On mobile/tablet, show full-screen app
        setActiveApp(appType);
      } else {
        // On desktop, open window
        windows.openWindow(appType);
      }
    }
  }, [isMobile, isTablet, windows]);

  const handleCloseApp = useCallback(() => {
    setActiveApp(null);
  }, []);

  // Device-specific grid configuration
  const gridConfig = {
    mobile: { columns: 4, rows: 6 },
    tablet: { columns: 5, rows: 5 },
    laptop: { columns: 6, rows: 4 },
    desktop: { columns: 6, rows: 4 },
  }[type];

  // Mobile/Tablet: iOS-style home screen
  if (isMobile || isTablet) {
    return (
      <div className="h-screen w-screen overflow-hidden bg-black">
        <DeviceDebugIndicator type={type} width={screenWidth} />
        {/* Active App (full screen on mobile) */}
        {activeApp && windowComponents[activeApp] && (
          <MobileApp
            appName={activeApp}
            onClose={handleCloseApp}
          >
            <React.Suspense
              fallback={
                <div className="flex items-center justify-center h-full">
                  <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
              }
            >
              {React.createElement(windowComponents[activeApp], {
                onClose: handleCloseApp,
              })}
            </React.Suspense>
          </MobileApp>
        )}

        {/* Home Screen (visible when no app is active) */}
        {!activeApp && (
          <MobileShell
            apps={Object.entries(APP_ID_TO_TYPE).map(([id, name]) => ({
              id,
              name: name.replace(' Wallet', '').replace('System ', ''),
              icon: getAppIcon(id),
              color: getAppColor(id),
            }))}
            dockApps={[
              { id: 'messages', name: 'Messages', icon: '💬', color: 'from-green-400 to-green-600' },
              { id: 'safari', name: 'Safari', icon: '🧭', color: 'from-blue-400 to-blue-600' },
              { id: 'hanzo', name: 'Hanzo', icon: '🥷', color: 'from-purple-500 to-purple-700' },
              { id: 'music', name: 'Music', icon: '🎵', color: 'from-pink-500 to-red-500' },
            ]}
            onOpenApp={handleOpenApp}
            wallpaper="/wallpapers/default.png"
            isTablet={isTablet}
          />
        )}
      </div>
    );
  }

  // Desktop: macOS-style
  return (
    <>
      <DeviceDebugIndicator type={type} width={screenWidth} />
      <Desktop {...props} />
    </>
  );
};

// Helper functions for app icons/colors
function getAppIcon(appId: string): string {
  const icons: Record<string, string> = {
    finder: '📁',
    safari: '🧭',
    mail: '✉️',
    photos: '🖼️',
    calendar: '📅',
    messages: '💬',
    facetime: '📹',
    music: '🎵',
    terminal: '>_',
    textedit: '📄',
    hanzo: '🥷',
    lux: '💎',
    zoo: '🧬',
    settings: '⚙️',
    calculator: '🔢',
    notes: '📝',
    clock: '🕐',
    weather: '⛅',
    reminders: '✓',
    stickies: '📌',
    'activity-monitor': '📊',
  };
  return icons[appId] || '📱';
}

function getAppColor(appId: string): string {
  const colors: Record<string, string> = {
    finder: 'from-blue-400 to-blue-600',
    safari: 'from-blue-400 to-blue-600',
    mail: 'from-blue-400 to-cyan-400',
    photos: 'from-orange-400 to-pink-500',
    calendar: 'from-red-500 to-red-600',
    messages: 'from-green-400 to-green-600',
    facetime: 'from-green-400 to-green-600',
    music: 'from-pink-500 to-red-500',
    terminal: 'from-gray-700 to-gray-900',
    textedit: 'from-gray-100 to-gray-300',
    hanzo: 'from-purple-500 to-purple-700',
    lux: 'from-amber-400 to-orange-500',
    zoo: 'from-green-400 to-emerald-600',
    settings: 'from-gray-400 to-gray-600',
    calculator: 'from-gray-600 to-gray-800',
    notes: 'from-yellow-400 to-yellow-500',
    clock: 'from-gray-800 to-black',
    weather: 'from-blue-400 to-cyan-300',
    reminders: 'from-blue-400 to-blue-500',
    stickies: 'from-yellow-300 to-yellow-500',
    'activity-monitor': 'from-green-500 to-green-700',
  };
  return colors[appId] || 'from-gray-500 to-gray-700';
}

export default ResponsiveShell;
