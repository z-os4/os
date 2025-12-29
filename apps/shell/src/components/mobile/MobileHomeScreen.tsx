/**
 * Mobile Home Screen - iOS-style
 *
 * Features:
 * - Swipeable pages of app icons
 * - App grid (4 columns on phone, 5-6 on tablet)
 * - Fixed dock at bottom with favorites
 * - Page indicators
 * - Folders support (future)
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { cn } from '@z-os/ui';

interface AppIcon {
  id: string;
  name: string;
  icon: string;
  color?: string;
  folder?: string;
}

interface MobileHomeScreenProps {
  apps: AppIcon[];
  dockApps: AppIcon[];
  onOpenApp: (appId: string) => void;
  onOpenSearch: () => void;
  wallpaper?: string;
  columns?: number;
  rows?: number;
}

// Default app icons with SF Symbol-style gradients
const defaultApps: AppIcon[] = [
  { id: 'finder', name: 'Files', icon: '📁', color: 'from-blue-400 to-blue-600' },
  { id: 'safari', name: 'Safari', icon: '🧭', color: 'from-blue-400 to-blue-600' },
  { id: 'mail', name: 'Mail', icon: '✉️', color: 'from-blue-400 to-cyan-400' },
  { id: 'photos', name: 'Photos', icon: '🖼️', color: 'from-orange-400 to-pink-500' },
  { id: 'calendar', name: 'Calendar', icon: '📅', color: 'from-red-500 to-red-600' },
  { id: 'messages', name: 'Messages', icon: '💬', color: 'from-green-400 to-green-600' },
  { id: 'facetime', name: 'FaceTime', icon: '📹', color: 'from-green-400 to-green-600' },
  { id: 'music', name: 'Music', icon: '🎵', color: 'from-pink-500 to-red-500' },
  { id: 'terminal', name: 'Terminal', icon: '>_', color: 'from-gray-700 to-gray-900' },
  { id: 'notes', name: 'Notes', icon: '📝', color: 'from-yellow-400 to-yellow-500' },
  { id: 'reminders', name: 'Reminders', icon: '✓', color: 'from-blue-400 to-blue-500' },
  { id: 'weather', name: 'Weather', icon: '⛅', color: 'from-blue-400 to-cyan-300' },
  { id: 'calculator', name: 'Calculator', icon: '🔢', color: 'from-gray-600 to-gray-800' },
  { id: 'clock', name: 'Clock', icon: '🕐', color: 'from-gray-800 to-black' },
  { id: 'settings', name: 'Settings', icon: '⚙️', color: 'from-gray-400 to-gray-600' },
  { id: 'hanzo', name: 'Hanzo AI', icon: '🥷', color: 'from-purple-500 to-purple-700' },
  { id: 'lux', name: 'Lux', icon: '💎', color: 'from-amber-400 to-orange-500' },
  { id: 'zoo', name: 'Zoo', icon: '🧬', color: 'from-green-400 to-emerald-600' },
  { id: 'stickies', name: 'Stickies', icon: '📌', color: 'from-yellow-300 to-yellow-500' },
  { id: 'textedit', name: 'TextEdit', icon: '📄', color: 'from-gray-100 to-gray-300' },
];

const defaultDockApps: AppIcon[] = [
  { id: 'messages', name: 'Messages', icon: '💬', color: 'from-green-400 to-green-600' },
  { id: 'safari', name: 'Safari', icon: '🧭', color: 'from-blue-400 to-blue-600' },
  { id: 'hanzo', name: 'Hanzo AI', icon: '🥷', color: 'from-purple-500 to-purple-700' },
  { id: 'music', name: 'Music', icon: '🎵', color: 'from-pink-500 to-red-500' },
];

export const MobileHomeScreen: React.FC<MobileHomeScreenProps> = ({
  apps = defaultApps,
  dockApps = defaultDockApps,
  onOpenApp,
  onOpenSearch,
  wallpaper,
  columns = 4,
  rows = 6,
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchDelta, setTouchDelta] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate pages based on grid size
  const appsPerPage = columns * rows;
  const pages = Math.ceil(apps.length / appsPerPage);
  const pageApps = Array.from({ length: pages }, (_, i) =>
    apps.slice(i * appsPerPage, (i + 1) * appsPerPage)
  );

  // Touch handlers for swipe
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
    setIsTransitioning(false);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStart === null) return;
    const delta = e.touches[0].clientX - touchStart;
    setTouchDelta(delta);
  }, [touchStart]);

  const handleTouchEnd = useCallback(() => {
    if (touchStart === null) return;

    const threshold = 50;
    setIsTransitioning(true);

    if (touchDelta < -threshold && currentPage < pages - 1) {
      setCurrentPage(currentPage + 1);
    } else if (touchDelta > threshold && currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }

    setTouchStart(null);
    setTouchDelta(0);
  }, [touchStart, touchDelta, currentPage, pages]);

  // Time display
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = time.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  const formattedDate = time.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div
      className="fixed inset-0 overflow-hidden select-none"
      style={{
        backgroundImage: wallpaper ? `url(${wallpaper})` : undefined,
        backgroundColor: '#000',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Status Bar */}
      <div className="absolute top-0 left-0 right-0 h-12 flex items-center justify-between px-6 z-50">
        <div className="text-white text-sm font-semibold">{formattedTime}</div>
        <div className="flex items-center gap-1.5">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 3C7.46 3 3.34 4.78.29 7.67c-.18.18-.29.43-.29.71 0 .28.11.53.29.71l11 11c.39.39 1.02.39 1.41 0l11-11c.18-.18.29-.43.29-.71 0-.28-.11-.53-.29-.71C20.66 4.78 16.54 3 12 3z"/>
          </svg>
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17 4h-3V2h-4v2H7v18h10V4zm-5 16c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/>
          </svg>
        </div>
      </div>

      {/* Date/Time Widget (lock screen style) */}
      <div className="pt-16 pb-4 text-center">
        <div className="text-white/60 text-sm">{formattedDate}</div>
        <div className="text-white text-6xl font-light tracking-tight">{formattedTime}</div>
      </div>

      {/* Search Bar */}
      <div className="px-4 pb-4">
        <button
          onClick={onOpenSearch}
          className="w-full h-9 bg-white/10 backdrop-blur-xl rounded-lg flex items-center px-3 gap-2"
        >
          <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" strokeWidth="2"/>
            <path d="M21 21l-4.35-4.35" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span className="text-white/60 text-sm">Search</span>
        </button>
      </div>

      {/* App Pages Container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-hidden relative"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ height: 'calc(100% - 280px)' }}
      >
        <div
          className={cn(
            "flex h-full",
            isTransitioning && "transition-transform duration-300 ease-out"
          )}
          style={{
            transform: `translateX(calc(-${currentPage * 100}% + ${touchDelta}px))`,
            width: `${pages * 100}%`,
          }}
        >
          {pageApps.map((pageContent, pageIndex) => (
            <div
              key={pageIndex}
              className="flex-shrink-0 px-4"
              style={{ width: `${100 / pages}%` }}
            >
              <div
                className="grid gap-y-6 gap-x-4 h-full content-start pt-2"
                style={{
                  gridTemplateColumns: `repeat(${columns}, 1fr)`,
                }}
              >
                {pageContent.map((app) => (
                  <AppIconButton
                    key={app.id}
                    app={app}
                    onTap={() => onOpenApp(app.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Page Indicators */}
      <div className="flex justify-center gap-1.5 py-2">
        {Array.from({ length: pages }).map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setIsTransitioning(true);
              setCurrentPage(i);
            }}
            className={cn(
              "w-2 h-2 rounded-full transition-all",
              i === currentPage ? "bg-white w-2.5" : "bg-white/40"
            )}
          />
        ))}
      </div>

      {/* Dock */}
      <div className="absolute bottom-0 left-0 right-0 pb-8 px-4">
        <div className="bg-white/20 backdrop-blur-2xl rounded-3xl p-3 mx-2">
          <div className="flex justify-around">
            {dockApps.map((app) => (
              <AppIconButton
                key={app.id}
                app={app}
                onTap={() => onOpenApp(app.id)}
                showLabel={false}
                size="dock"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Home Indicator */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
        <div className="w-32 h-1 bg-white/50 rounded-full" />
      </div>
    </div>
  );
};

// App Icon Button Component
interface AppIconButtonProps {
  app: AppIcon;
  onTap: () => void;
  showLabel?: boolean;
  size?: 'normal' | 'dock';
}

const AppIconButton: React.FC<AppIconButtonProps> = ({
  app,
  onTap,
  showLabel = true,
  size = 'normal',
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const iconSize = size === 'dock' ? 'w-14 h-14' : 'w-16 h-16';

  return (
    <button
      onClick={onTap}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      className={cn(
        "flex flex-col items-center gap-1.5 transition-transform",
        isPressed && "scale-90"
      )}
    >
      <div
        className={cn(
          iconSize,
          "rounded-2xl flex items-center justify-center text-2xl",
          "bg-gradient-to-br shadow-lg",
          app.color || "from-gray-500 to-gray-700"
        )}
      >
        {app.icon.length <= 2 ? (
          <span>{app.icon}</span>
        ) : (
          <span className="text-white font-mono text-xs">{app.icon}</span>
        )}
      </div>
      {showLabel && (
        <span className="text-white text-[11px] font-medium drop-shadow-lg truncate w-16 text-center">
          {app.name}
        </span>
      )}
    </button>
  );
};

export default MobileHomeScreen;
