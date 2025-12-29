/**
 * Mobile Shell - Complete iOS-style Experience
 *
 * Layout:
 * - Swipe RIGHT from home: Today View (widgets + desktop files)
 * - CENTER: Home screen pages with app icons
 * - Swipe LEFT: App Library (auto-organized)
 * - Pull DOWN: Notification Center
 *
 * Like iOS but with zOS twist - desktop files accessible via swipe
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { cn } from '@z-os/ui';

interface AppIcon {
  id: string;
  name: string;
  icon: string;
  color?: string;
  category?: string;
}

interface MobileShellProps {
  apps: AppIcon[];
  dockApps: AppIcon[];
  onOpenApp: (appId: string) => void;
  wallpaper?: string;
  isTablet?: boolean;
}

// App categories for App Library
const APP_CATEGORIES = {
  'Productivity': ['notes', 'reminders', 'calendar', 'mail', 'textedit'],
  'Communication': ['messages', 'facetime', 'mail'],
  'Entertainment': ['music', 'photos'],
  'Utilities': ['calculator', 'clock', 'weather', 'settings', 'finder', 'terminal'],
  'AI & Web3': ['hanzo', 'lux', 'zoo'],
  'Creativity': ['photos', 'stickies'],
};

export const MobileShell: React.FC<MobileShellProps> = ({
  apps,
  dockApps,
  onOpenApp,
  wallpaper,
  isTablet = false,
}) => {
  // Main horizontal position: -1 = Today, 0 = Home, 1 = App Library
  const [mainPosition, setMainPosition] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchDelta, setTouchDelta] = useState({ x: 0, y: 0 });
  const [showNotifications, setShowNotifications] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Grid config based on device
  const columns = isTablet ? 6 : 4;
  const rows = isTablet ? 5 : 6;
  const appsPerPage = columns * rows;

  // Split apps into pages
  const pages = Math.ceil(apps.length / appsPerPage);
  const pageApps = Array.from({ length: pages }, (_, i) =>
    apps.slice(i * appsPerPage, (i + 1) * appsPerPage)
  );

  // Time
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Touch handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
    setIsTransitioning(false);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStart) return;
    const touch = e.touches[0];
    setTouchDelta({
      x: touch.clientX - touchStart.x,
      y: touch.clientY - touchStart.y,
    });
  }, [touchStart]);

  const handleTouchEnd = useCallback(() => {
    if (!touchStart) return;

    const threshold = 80;
    setIsTransitioning(true);

    // Vertical swipe - notifications
    if (touchDelta.y > threshold && touchStart.y < 50) {
      setShowNotifications(true);
    } else if (touchDelta.y < -threshold && showNotifications) {
      setShowNotifications(false);
    }
    // Horizontal swipe on home screen
    else if (mainPosition === 0) {
      // Within home pages
      if (Math.abs(touchDelta.x) > threshold) {
        if (touchDelta.x < 0) {
          // Swipe left
          if (currentPage < pages - 1) {
            setCurrentPage(currentPage + 1);
          } else {
            // Go to App Library
            setMainPosition(1);
          }
        } else {
          // Swipe right
          if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
          } else {
            // Go to Today View
            setMainPosition(-1);
          }
        }
      }
    }
    // In Today View or App Library
    else if (Math.abs(touchDelta.x) > threshold) {
      if (mainPosition === -1 && touchDelta.x < 0) {
        setMainPosition(0);
        setCurrentPage(0);
      } else if (mainPosition === 1 && touchDelta.x > 0) {
        setMainPosition(0);
        setCurrentPage(pages - 1);
      }
    }

    setTouchStart(null);
    setTouchDelta({ x: 0, y: 0 });
  }, [touchStart, touchDelta, mainPosition, currentPage, pages, showNotifications]);

  // Filter apps for search
  const filteredApps = searchQuery
    ? apps.filter(app =>
        app.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : apps;

  return (
    <div
      className="fixed inset-0 overflow-hidden select-none bg-black"
      style={{
        backgroundImage: wallpaper ? `url(${wallpaper})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Status Bar */}
      <StatusBar time={time} />

      {/* Pull-down Notification Center */}
      <NotificationCenter
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        time={time}
      />

      {/* Main Content Area */}
      <div
        className={cn(
          "absolute inset-0 pt-12 pb-24 flex",
          isTransitioning && "transition-transform duration-300 ease-out"
        )}
        style={{
          transform: `translateX(calc(${mainPosition * -100}% + ${touchDelta.x}px))`,
          width: '300%',
          left: '-100%',
        }}
      >
        {/* Today View (Left) */}
        <div className="w-1/3 h-full overflow-auto px-4 pt-4">
          <TodayView time={time} onOpenApp={onOpenApp} />
        </div>

        {/* Home Screen Pages (Center) */}
        <div className="w-1/3 h-full overflow-hidden flex flex-col">
          {/* Search Bar */}
          <div className="flex-none px-4 pt-2 pb-3">
            <button
              onClick={() => setShowSearch(true)}
              className="w-full h-9 bg-white/15 backdrop-blur-xl rounded-xl flex items-center px-3 gap-2"
            >
              <SearchIcon />
              <span className="text-white/60 text-sm">Search</span>
            </button>
          </div>

          {/* App Pages */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <div
              className={cn(
                "flex h-full",
                isTransitioning && "transition-transform duration-300 ease-out"
              )}
              style={{
                transform: mainPosition === 0
                  ? `translateX(calc(-${currentPage * 100}% + ${touchDelta.x}px))`
                  : 'translateX(0)',
                width: `${pages * 100}%`,
              }}
            >
              {pageApps.map((pageContent, pageIndex) => (
                <AppPage
                  key={pageIndex}
                  apps={pageContent}
                  columns={columns}
                  onOpenApp={onOpenApp}
                  totalPages={pages}
                />
              ))}
            </div>
          </div>

          {/* Page Indicators */}
          <div className="absolute bottom-28 left-0 right-0 flex justify-center gap-1.5">
            {Array.from({ length: pages }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  i === currentPage && mainPosition === 0
                    ? "bg-white w-2.5"
                    : "bg-white/40"
                )}
              />
            ))}
          </div>
        </div>

        {/* App Library (Right) */}
        <div className="w-1/3 h-full overflow-auto px-4 pt-4">
          <AppLibrary apps={apps} onOpenApp={onOpenApp} />
        </div>
      </div>

      {/* Dock */}
      <MobileDock apps={dockApps} onOpenApp={onOpenApp} />

      {/* Home Indicator */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-50">
        <div className="w-32 h-1 bg-white/50 rounded-full" />
      </div>

      {/* Search Overlay */}
      {showSearch && (
        <SearchOverlay
          apps={apps}
          onOpenApp={(id) => {
            onOpenApp(id);
            setShowSearch(false);
          }}
          onClose={() => setShowSearch(false)}
        />
      )}
    </div>
  );
};

// Status Bar Component
const StatusBar: React.FC<{ time: Date }> = ({ time }) => (
  <div className="absolute top-0 left-0 right-0 h-12 flex items-center justify-between px-6 z-50">
    <div className="text-white text-sm font-semibold">
      {time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
    </div>
    <div className="flex items-center gap-1.5">
      <WifiIcon />
      <BatteryIcon />
    </div>
  </div>
);

// Today View Component
const TodayView: React.FC<{ time: Date; onOpenApp: (id: string) => void }> = ({ time, onOpenApp }) => (
  <div className="space-y-4">
    <h2 className="text-white text-2xl font-bold">
      {time.toLocaleDateString('en-US', { weekday: 'long' })}
    </h2>
    <p className="text-white/60 text-lg">
      {time.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
    </p>

    {/* Weather Widget */}
    <div
      onClick={() => onOpenApp('weather')}
      className="bg-gradient-to-br from-blue-500/80 to-cyan-500/80 backdrop-blur-xl rounded-3xl p-4 cursor-pointer"
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="text-white/80 text-sm">San Francisco</div>
          <div className="text-white text-5xl font-light">72°</div>
        </div>
        <div className="text-5xl">☀️</div>
      </div>
      <div className="text-white/80 text-sm mt-2">Sunny</div>
    </div>

    {/* Calendar Widget */}
    <div
      onClick={() => onOpenApp('calendar')}
      className="bg-white/10 backdrop-blur-xl rounded-3xl p-4 cursor-pointer"
    >
      <div className="text-red-500 text-xs font-bold uppercase">
        {time.toLocaleDateString('en-US', { weekday: 'long' })}
      </div>
      <div className="text-white text-4xl font-light">{time.getDate()}</div>
      <div className="text-white/60 text-sm mt-2">No events today</div>
    </div>

    {/* Desktop Files Widget */}
    <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-4">
      <div className="text-white/80 text-sm font-medium mb-3">Desktop</div>
      <div className="grid grid-cols-4 gap-3">
        {['📁', '📄', '🖼️', '📊'].map((icon, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-2xl">
              {icon}
            </div>
            <span className="text-white/60 text-[10px]">File {i + 1}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// App Library Component
const AppLibrary: React.FC<{ apps: AppIcon[]; onOpenApp: (id: string) => void }> = ({
  apps,
  onOpenApp,
}) => {
  const categories = Object.entries(APP_CATEGORIES);

  return (
    <div className="space-y-6">
      <h2 className="text-white text-2xl font-bold">App Library</h2>

      {/* Search */}
      <div className="bg-white/15 backdrop-blur-xl rounded-xl px-3 py-2 flex items-center gap-2">
        <SearchIcon />
        <input
          type="text"
          placeholder="Search Apps"
          className="bg-transparent text-white placeholder:text-white/50 outline-none flex-1 text-sm"
        />
      </div>

      {/* Categories */}
      {categories.map(([category, appIds]) => {
        const categoryApps = apps.filter(app => appIds.includes(app.id));
        if (categoryApps.length === 0) return null;

        return (
          <div key={category}>
            <h3 className="text-white/80 text-sm font-medium mb-2">{category}</h3>
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-3">
              <div className="grid grid-cols-4 gap-2">
                {categoryApps.slice(0, 4).map(app => (
                  <button
                    key={app.id}
                    onClick={() => onOpenApp(app.id)}
                    className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl bg-gradient-to-br shadow-lg"
                    style={{
                      background: `linear-gradient(135deg, var(--tw-gradient-from), var(--tw-gradient-to))`,
                    }}
                  >
                    {app.icon}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// App Page Component
const AppPage: React.FC<{
  apps: AppIcon[];
  columns: number;
  onOpenApp: (id: string) => void;
  totalPages: number;
}> = ({ apps, columns, onOpenApp, totalPages }) => (
  <div
    className="flex-shrink-0 px-4 h-full overflow-hidden"
    style={{ width: `${100 / totalPages}%` }}
  >
    <div
      className="grid gap-y-5 gap-x-3 content-start pt-2"
      style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
    >
      {apps.map(app => (
        <AppIconButton key={app.id} app={app} onTap={() => onOpenApp(app.id)} />
      ))}
    </div>
  </div>
);

// Mobile Dock Component
const MobileDock: React.FC<{ apps: AppIcon[]; onOpenApp: (id: string) => void }> = ({
  apps,
  onOpenApp,
}) => (
  <div className="absolute bottom-6 left-4 right-4 z-40">
    <div className="bg-white/20 backdrop-blur-2xl rounded-3xl p-3">
      <div className="flex justify-around">
        {apps.map(app => (
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
);

// Notification Center Component
const NotificationCenter: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  time: Date;
}> = ({ isOpen, onClose, time }) => (
  <div
    className={cn(
      "absolute inset-0 z-[100] bg-black/50 backdrop-blur-xl transition-transform duration-300",
      isOpen ? "translate-y-0" : "-translate-y-full"
    )}
  >
    <div className="p-6 pt-16">
      <div className="text-center mb-8">
        <div className="text-white/60 text-sm">
          {time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
        <div className="text-white text-7xl font-light">
          {time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
        </div>
      </div>

      {/* Notifications */}
      <div className="space-y-3">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
              💬
            </div>
            <div className="flex-1">
              <div className="text-white font-medium text-sm">Messages</div>
              <div className="text-white/60 text-sm">New message from Hanzo</div>
            </div>
            <div className="text-white/40 text-xs">now</div>
          </div>
        </div>
      </div>

      {/* Pull down indicator */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 text-sm"
        onClick={onClose}
      >
        Swipe up to close
      </div>
    </div>
  </div>
);

// Search Overlay
const SearchOverlay: React.FC<{
  apps: AppIcon[];
  onOpenApp: (id: string) => void;
  onClose: () => void;
}> = ({ apps, onOpenApp, onClose }) => {
  const [query, setQuery] = useState('');
  const filtered = query
    ? apps.filter(app => app.name.toLowerCase().includes(query.toLowerCase()))
    : [];

  return (
    <div className="absolute inset-0 z-[100] bg-black/80 backdrop-blur-xl pt-16 px-4">
      <div className="relative">
        <input
          autoFocus
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search"
          className="w-full h-10 bg-white/15 rounded-xl px-4 text-white placeholder:text-white/50 outline-none"
        />
        <button
          onClick={onClose}
          className="absolute right-0 top-0 h-10 px-4 text-blue-400"
        >
          Cancel
        </button>
      </div>

      <div className="mt-4 space-y-2">
        {filtered.map(app => (
          <button
            key={app.id}
            onClick={() => onOpenApp(app.id)}
            className="w-full flex items-center gap-3 p-3 bg-white/10 rounded-xl"
          >
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-gradient-to-br",
              app.color
            )}>
              {app.icon}
            </div>
            <span className="text-white">{app.name}</span>
          </button>
        ))}
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
      className={cn(
        "flex flex-col items-center gap-1.5 transition-transform",
        isPressed && "scale-90"
      )}
    >
      <div
        className={cn(
          iconSize,
          "rounded-[22%] flex items-center justify-center text-2xl shadow-lg",
          "bg-gradient-to-br",
          app.color || "from-gray-500 to-gray-700"
        )}
      >
        {app.icon}
      </div>
      {showLabel && (
        <span className="text-white text-[11px] font-medium drop-shadow-lg truncate w-16 text-center">
          {app.name}
        </span>
      )}
    </button>
  );
};

// Icons
const SearchIcon = () => (
  <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8" strokeWidth="2"/>
    <path d="M21 21l-4.35-4.35" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const WifiIcon = () => (
  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 3C7.46 3 3.34 4.78.29 7.67c-.18.18-.29.43-.29.71 0 .28.11.53.29.71l11 11c.39.39 1.02.39 1.41 0l11-11c.18-.18.29-.43.29-.71 0-.28-.11-.53-.29-.71C20.66 4.78 16.54 3 12 3z"/>
  </svg>
);

const BatteryIcon = () => (
  <svg className="w-6 h-4 text-white" viewBox="0 0 25 12" fill="currentColor">
    <rect x="0" y="0" width="22" height="12" rx="3" stroke="currentColor" strokeWidth="1" fill="none"/>
    <rect x="23" y="3" width="2" height="6" rx="1"/>
    <rect x="2" y="2" width="18" height="8" rx="1"/>
  </svg>
);

export default MobileShell;
