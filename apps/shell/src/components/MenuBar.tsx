import React, { useState, useEffect, useRef } from 'react';
import { cn, Z_INDEX } from '@z-os/ui';
import { useMenuContext, Menu, MenuItem } from '@z-os/core';
import {
  Wifi,
  Battery,
  BatteryCharging,
  Search,
  Volume2,
  VolumeX,
  Volume1,
  Bluetooth,
  BluetoothOff,
  Moon,
  Sun,
  Airplay,
  Keyboard,
  Music,
  Pause,
  Play,
  SkipForward,
  SkipBack,
  Check,
  ChevronRight,
  Camera,
  Accessibility,
  MonitorSmartphone,
  Layers,
} from 'lucide-react';

// Z Logo for menu bar
const ZMenuLogo: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 100 100"
    className={cn("w-4 h-4", className)}
    fill="currentColor"
  >
    <path d="M 15 15 H 85 V 30 L 35 70 H 85 V 85 H 15 V 70 L 65 30 H 15 Z" />
  </svg>
);

// Control Center icon - two horizontal toggle switches (macOS style)
const ControlCenterIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 18 18"
    className={cn("w-[15px] h-[15px]", className)}
    fill="currentColor"
  >
    <defs>
      <mask id="toggleMask">
        <rect width="18" height="18" fill="white" />
        <circle cx="4.5" cy="4.5" r="2.5" fill="black" />
        <circle cx="13.5" cy="13.5" r="2.5" fill="black" />
      </mask>
    </defs>
    <g mask="url(#toggleMask)">
      <rect x="0" y="1" width="18" height="7" rx="3.5" />
      <rect x="0" y="10" width="18" height="7" rx="3.5" />
    </g>
  </svg>
);

// Simple Slider component
const Slider: React.FC<{
  value: number[];
  onValueChange: (value: number[]) => void;
  max?: number;
  step?: number;
  className?: string;
}> = ({ value, onValueChange, max = 100, step = 1, className }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onValueChange([parseInt(e.target.value)]);
  };

  return (
    <input
      type="range"
      min={0}
      max={max}
      step={step}
      value={value[0]}
      onChange={handleChange}
      className={cn(
        "w-full h-1 bg-[var(--zos-border-primary)] rounded-lg appearance-none cursor-pointer",
        "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3",
        "[&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer",
        className
      )}
    />
  );
};

export interface MenuBarProps {
  className?: string;
  /** Fallback app name when no active menu config */
  fallbackAppName?: string;
  onQuitApp?: () => void;
  onOpenSettings?: () => void;
  onAboutMac?: () => void;
  onAboutApp?: (appName: string) => void;
  onMinimize?: () => void;
  onSleep?: () => void;
  onRestart?: () => void;
  onShutdown?: () => void;
  onLockScreen?: () => void;
  onForceQuit?: () => void;
  onOpenSpotlight?: () => void;
  onOpenAppStore?: () => void;
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
}

// System menu (Z logo menu) items
const luxMenuItems: MenuItem[] = [
  { id: 'about-zos', label: 'About zOS' },
  { id: 'sep1', type: 'separator' },
  { id: 'system-settings', label: 'System Settings...' },
  { id: 'app-store', label: 'App Store...' },
  { id: 'sep2', type: 'separator' },
  { id: 'recent-items', label: 'Recent Items', submenu: [] },
  { id: 'sep3', type: 'separator' },
  { id: 'force-quit', label: 'Force Quit...', shortcut: '\u2325\u2318\u238B' },
  { id: 'sep4', type: 'separator' },
  { id: 'sleep', label: 'Sleep' },
  { id: 'restart', label: 'Restart...' },
  { id: 'shutdown', label: 'Shut Down...' },
  { id: 'sep5', type: 'separator' },
  { id: 'lock-screen', label: 'Lock Screen', shortcut: '\u2303\u2318Q' },
  { id: 'logout', label: 'Log Out Z...', shortcut: '\u21E7\u2318Q' },
];

// Default menus when no app is active (Finder-style)
const defaultMenus: Menu[] = [
  {
    id: 'app',
    label: 'Finder',
    bold: true,
    items: [
      { id: 'about', label: 'About Finder' },
      { id: 'sep1', type: 'separator' },
      { id: 'settings', label: 'Settings...', shortcut: '\u2318,' },
      { id: 'sep2', type: 'separator' },
      { id: 'services', label: 'Services', submenu: [] },
      { id: 'sep3', type: 'separator' },
      { id: 'hide', label: 'Hide Finder', shortcut: '\u2318H' },
      { id: 'hideOthers', label: 'Hide Others', shortcut: '\u2325\u2318H' },
      { id: 'showAll', label: 'Show All' },
      { id: 'sep4', type: 'separator' },
      { id: 'quit', label: 'Quit Finder', shortcut: '\u2318Q' },
    ],
  },
  {
    id: 'file',
    label: 'File',
    items: [
      { id: 'newWindow', label: 'New Window', shortcut: '\u2318N' },
      { id: 'newTab', label: 'New Tab', shortcut: '\u2318T' },
      { id: 'sep1', type: 'separator' },
      { id: 'open', label: 'Open...', shortcut: '\u2318O' },
      { id: 'openRecent', label: 'Open Recent', submenu: [] },
      { id: 'sep2', type: 'separator' },
      { id: 'close', label: 'Close Window', shortcut: '\u2318W' },
      { id: 'closeAll', label: 'Close All', shortcut: '\u2325\u2318W' },
    ],
  },
  {
    id: 'edit',
    label: 'Edit',
    items: [
      { id: 'undo', label: 'Undo', shortcut: '\u2318Z' },
      { id: 'redo', label: 'Redo', shortcut: '\u21E7\u2318Z' },
      { id: 'sep1', type: 'separator' },
      { id: 'cut', label: 'Cut', shortcut: '\u2318X' },
      { id: 'copy', label: 'Copy', shortcut: '\u2318C' },
      { id: 'paste', label: 'Paste', shortcut: '\u2318V' },
      { id: 'selectAll', label: 'Select All', shortcut: '\u2318A' },
      { id: 'sep2', type: 'separator' },
      { id: 'find', label: 'Find', submenu: [] },
    ],
  },
  {
    id: 'view',
    label: 'View',
    items: [
      { id: 'asIcons', label: 'as Icons', shortcut: '\u23181', type: 'radio', radioGroup: 'viewMode', checked: true },
      { id: 'asList', label: 'as List', shortcut: '\u23182', type: 'radio', radioGroup: 'viewMode' },
      { id: 'asColumns', label: 'as Columns', shortcut: '\u23183', type: 'radio', radioGroup: 'viewMode' },
      { id: 'asGallery', label: 'as Gallery', shortcut: '\u23184', type: 'radio', radioGroup: 'viewMode' },
      { id: 'sep1', type: 'separator' },
      { id: 'showSidebar', label: 'Show Sidebar', shortcut: '\u2325\u2318S', type: 'checkbox', checked: true },
      { id: 'sep2', type: 'separator' },
      { id: 'fullScreen', label: 'Enter Full Screen', shortcut: '\u2303\u2318F' },
    ],
  },
  {
    id: 'go',
    label: 'Go',
    items: [
      { id: 'back', label: 'Back', shortcut: '\u2318[' },
      { id: 'forward', label: 'Forward', shortcut: '\u2318]' },
      { id: 'enclosing', label: 'Enclosing Folder', shortcut: '\u2318\u2191' },
      { id: 'sep1', type: 'separator' },
      { id: 'recents', label: 'Recents', shortcut: '\u21E7\u2318F' },
      { id: 'documents', label: 'Documents', shortcut: '\u21E7\u2318O' },
      { id: 'desktop', label: 'Desktop', shortcut: '\u21E7\u2318D' },
      { id: 'downloads', label: 'Downloads', shortcut: '\u2325\u2318L' },
      { id: 'home', label: 'Home', shortcut: '\u21E7\u2318H' },
      { id: 'applications', label: 'Applications', shortcut: '\u21E7\u2318A' },
      { id: 'sep2', type: 'separator' },
      { id: 'goToFolder', label: 'Go to Folder...', shortcut: '\u21E7\u2318G' },
    ],
  },
  {
    id: 'window',
    label: 'Window',
    items: [
      { id: 'minimize', label: 'Minimize', shortcut: '\u2318M' },
      { id: 'zoom', label: 'Zoom' },
      { id: 'moveLeft', label: 'Move Window to Left Side of Screen' },
      { id: 'moveRight', label: 'Move Window to Right Side of Screen' },
      { id: 'sep1', type: 'separator' },
      { id: 'cycleWindows', label: 'Cycle Through Windows', shortcut: '\u2318`' },
      { id: 'sep2', type: 'separator' },
      { id: 'bringAll', label: 'Bring All to Front' },
    ],
  },
  {
    id: 'help',
    label: 'Help',
    items: [
      { id: 'search', label: 'Search', isSearch: true },
      { id: 'sep1', type: 'separator' },
      { id: 'finderHelp', label: 'Finder Help' },
    ],
  },
];

export const MenuBar: React.FC<MenuBarProps> = ({
  className,
  fallbackAppName = "Finder",
  onQuitApp,
  onOpenSettings,
  onAboutMac,
  onAboutApp,
  onMinimize,
  onSleep,
  onRestart,
  onShutdown,
  onLockScreen,
  onForceQuit,
  onOpenSpotlight,
  onOpenAppStore,
  darkMode = false,
  onToggleDarkMode,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [batteryLevel, setBatteryLevel] = useState(87);
  const [isCharging, setIsCharging] = useState(false);
  const [wifiEnabled, setWifiEnabled] = useState(true);
  const [bluetoothEnabled, setBluetoothEnabled] = useState(true);
  const [volume, setVolume] = useState([75]);
  const [brightness, setBrightness] = useState([80]);
  const [focusEnabled, setFocusEnabled] = useState(false);
  const [airDropEnabled, setAirDropEnabled] = useState(true);
  const [stageManagerEnabled, setStageManagerEnabled] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [screenMirroringEnabled, setScreenMirroringEnabled] = useState(false);
  const [accessibilityEnabled, setAccessibilityEnabled] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [menuBarActive, setMenuBarActive] = useState(false);
  const menuBarRef = useRef<HTMLDivElement>(null);
  const [activeSystemMenu, setActiveSystemMenu] = useState<string | null>(null);

  // Get menu configuration from context
  const { activeConfig, executeAction } = useMenuContext();
  
  // Use active config menus or fallback to defaults
  const menuItems = activeConfig?.menus ?? defaultMenus;
  const appName = activeConfig?.appName ?? fallbackAppName;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Try to get battery info
    interface BatteryManager extends EventTarget {
      level: number;
      charging: boolean;
    }
    interface NavigatorWithBattery extends Navigator {
      getBattery?: () => Promise<BatteryManager>;
    }
    const nav = navigator as NavigatorWithBattery;
    if (nav.getBattery) {
      nav.getBattery().then((battery) => {
        setBatteryLevel(Math.round(battery.level * 100));
        setIsCharging(battery.charging);
        battery.addEventListener('levelchange', () => {
          setBatteryLevel(Math.round(battery.level * 100));
        });
        battery.addEventListener('chargingchange', () => {
          setIsCharging(battery.charging);
        });
      });
    }

    return () => clearInterval(timer);
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuBarRef.current && !menuBarRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
        setActiveSystemMenu(null);
        setMenuBarActive(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleMenuClick = (index: number) => {
    if (activeMenu === index) {
      setActiveMenu(null);
      setMenuBarActive(false);
    } else {
      setActiveMenu(index);
      setActiveSystemMenu(null);
      setMenuBarActive(true);
    }
  };

  const handleMenuHover = (index: number) => {
    if (menuBarActive) {
      setActiveMenu(index);
      setActiveSystemMenu(null);
    }
  };

  const handleSystemMenuClick = (menuName: string) => {
    if (activeSystemMenu === menuName) {
      setActiveSystemMenu(null);
    } else {
      setActiveSystemMenu(menuName);
      setActiveMenu(null);
      setMenuBarActive(false);
    }
  };

  const VolumeIcon = () => {
    if (volume[0] === 0) return <VolumeX className="w-[15px] h-[15px] opacity-90" />;
    if (volume[0] < 50) return <Volume1 className="w-[15px] h-[15px] opacity-90" />;
    return <Volume2 className="w-[15px] h-[15px] opacity-90" />;
  };

  const menuButtonClass = "h-[22px] px-[10px] flex items-center rounded-[5px] mx-[1px] hover:bg-[var(--zos-border-primary)] outline-none focus:outline-none focus:ring-0 transition-colors duration-75";
  const systemTrayButtonClass = "h-[22px] px-[7px] flex items-center rounded-[5px] mx-[1px] hover:bg-[var(--zos-border-primary)] outline-none focus:outline-none focus:ring-0 transition-colors duration-75";

  // Handle menu item click with action routing
  const handleMenuItemClick = (menuId: string, item: MenuItem) => {
    setActiveMenu(null);
    setActiveSystemMenu(null);
    setMenuBarActive(false);

    // Execute through registry if we have an active config
    if (activeConfig) {
      executeAction(activeConfig.appId, menuId, item.id);
      return;
    }

    // Fallback handling for system menu items and default menus
    const label = item.label ?? '';

    // About {appName}
    if (item.id === 'about' || label.startsWith('About ')) {
      if (onAboutApp) onAboutApp(appName);
      return;
    }

    // Quit app
    if (item.id === 'quit' || label.startsWith('Quit ')) {
      if (onQuitApp) onQuitApp();
      return;
    }

    // Settings
    if (item.id === 'settings' || item.id === 'system-settings') {
      if (onOpenSettings) onOpenSettings();
      return;
    }

    // About zOS
    if (item.id === 'about-zos') {
      if (onAboutMac) onAboutMac();
      return;
    }

    // Minimize
    if (item.id === 'minimize') {
      if (onMinimize) onMinimize();
      return;
    }

    // Hide app
    if (item.id === 'hide') {
      if (onMinimize) onMinimize();
      return;
    }

    // Sleep, Restart, Shutdown, Lock Screen
    if (item.id === 'sleep') {
      if (onSleep) onSleep();
      return;
    }
    if (item.id === 'restart') {
      if (onRestart) onRestart();
      return;
    }
    if (item.id === 'shutdown') {
      if (onShutdown) onShutdown();
      return;
    }
    if (item.id === 'lock-screen' || item.id === 'logout') {
      if (onLockScreen) onLockScreen();
      return;
    }

    // Force Quit
    if (item.id === 'force-quit') {
      if (onForceQuit) onForceQuit();
      return;
    }

    // App Store
    if (item.id === 'app-store') {
      if (onOpenAppStore) onOpenAppStore();
      return;
    }

    // Enter Full Screen
    if (item.id === 'fullScreen') {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        document.documentElement.requestFullscreen();
      }
      return;
    }

    // Close Window
    if (item.id === 'close' || item.id === 'closeAll') {
      if (onQuitApp) onQuitApp();
      return;
    }

    // Call item's onClick if present
    if (item.onClick) {
      item.onClick();
      return;
    }

    console.log('Menu action:', item.id, label);
  };

  const renderMenuItem = (menuId: string, item: MenuItem, itemIndex: number) => {
    if (item.type === 'separator') {
      return <div key={itemIndex} className="h-[1px] bg-[var(--zos-border-primary)] my-[6px] mx-3" />;
    }
    if (item.isSearch) {
      return (
        <div key={itemIndex} className="px-2 py-1.5">
          <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg">
            <Search className="w-3.5 h-3.5 zos-text-muted" />
            <input
              type="text"
              placeholder="Search"
              className="flex-1 bg-transparent zos-text-primary text-[13px] outline-none placeholder:zos-text-muted"
            />
          </div>
        </div>
      );
    }
    if (item.submenu && item.submenu.length > 0) {
      return (
        <div
          key={itemIndex}
          className={cn(
            "flex items-center justify-between mx-1.5 px-3 py-[6px] rounded-[5px] hover:bg-blue-500 cursor-pointer transition-colors",
            item.disabled && "opacity-40 cursor-default hover:bg-transparent"
          )}
        >
          <span>{item.label}</span>
          <ChevronRight className="w-3 h-3 opacity-50" />
        </div>
      );
    }
    
    const isCheckable = item.type === 'checkbox' || item.type === 'radio';
    
    return (
      <div
        key={itemIndex}
        className={cn(
          "flex items-center justify-between mx-1.5 px-3 py-[6px] rounded-[5px] hover:bg-blue-500 cursor-pointer transition-colors",
          item.disabled && "opacity-40 cursor-default hover:bg-transparent"
        )}
        onClick={() => !item.disabled && handleMenuItemClick(menuId, item)}
      >
        <span className="flex items-center gap-2">
          {isCheckable && (
            <span className="w-3.5 flex justify-center">
              {item.checked && <Check className="w-3.5 h-3.5" />}
            </span>
          )}
          {!isCheckable && item.checked && <Check className="w-3.5 h-3.5" />}
          {item.label}
        </span>
        {item.shortcut && (
          <span className="zos-text-muted ml-4">{item.shortcut}</span>
        )}
      </div>
    );
  };

  return (
    <div
      ref={menuBarRef}
      className={cn(
        'fixed top-0 left-0 right-0',
        'h-[28px] px-4',
        'flex items-center justify-between',
        // Glass effect with theme-aware styling
        'glass-menubar',
        'zos-text-primary text-[13px] font-medium tracking-[-0.01em]',
        'select-none',
        className
      )}
      style={{ zIndex: Z_INDEX.MENU_BAR }}
    >
      {/* Left side - Logo and menus */}
      <div className="flex items-center h-full">
        {/* Z Logo (system menu) */}
        <div className="relative h-full">
          <button
            className={cn(menuButtonClass, "px-[8px]", activeMenu === -1 && "bg-[var(--zos-border-primary)]")}
            onClick={() => handleMenuClick(-1)}
            onMouseEnter={() => handleMenuHover(-1)}
          >
            <ZMenuLogo className="w-[14px] h-[14px] opacity-90" />
          </button>
          {activeMenu === -1 && (
            <div className="absolute top-full left-0 mt-[5px] min-w-[230px] glass-menu rounded-[10px] shadow-2xl zos-text-primary text-[13px] p-1" style={{ zIndex: Z_INDEX.MENU_BAR_DROPDOWN }}>
              {luxMenuItems.map((item, index) => renderMenuItem('system', item, index))}
            </div>
          )}
        </div>

        {/* App menus */}
        {menuItems.map((menu, index) => (
          <div key={menu.id} className="relative h-full">
            <button
              className={cn(
                menuButtonClass,
                menu.bold && "font-bold",
                activeMenu === index && "bg-[var(--zos-border-primary)]"
              )}
              onClick={() => handleMenuClick(index)}
              onMouseEnter={() => handleMenuHover(index)}
            >
              {menu.label}
            </button>
            {activeMenu === index && (
              <div className="absolute top-full left-0 mt-[5px] min-w-[230px] glass-menu rounded-[10px] shadow-2xl zos-text-primary text-[13px] p-1 max-h-[80vh] overflow-y-auto" style={{ zIndex: Z_INDEX.MENU_BAR_DROPDOWN }}>
                {menu.items.map((item, itemIndex) => renderMenuItem(menu.id, item, itemIndex))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Right side - System tray */}
      <div className="flex items-center h-full gap-0">
        {/* Bluetooth */}
        <div className="relative h-full">
          <button
            className={cn(systemTrayButtonClass, activeSystemMenu === 'bluetooth' && "bg-[var(--zos-border-primary)]")}
            onClick={() => handleSystemMenuClick('bluetooth')}
          >
            {bluetoothEnabled ? (
              <Bluetooth className="w-[15px] h-[15px] opacity-90" />
            ) : (
              <BluetoothOff className="w-[15px] h-[15px] opacity-50" />
            )}
          </button>
          {activeSystemMenu === 'bluetooth' && (
            <div className="absolute top-full right-0 mt-[5px] min-w-[280px] glass-menu rounded-[10px] shadow-2xl zos-text-primary text-[13px] p-1" style={{ zIndex: Z_INDEX.MENU_BAR_DROPDOWN }}>
              <div className="px-3 py-2 flex items-center justify-between">
                <span className="font-semibold">Bluetooth</span>
                <button
                  onClick={() => setBluetoothEnabled(!bluetoothEnabled)}
                  className={cn(
                    "w-10 h-6 rounded-full transition-colors relative",
                    bluetoothEnabled ? "bg-blue-500" : "bg-[var(--zos-border-primary)]"
                  )}
                >
                  <div className={cn(
                    "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                    bluetoothEnabled ? "left-5" : "left-1"
                  )} />
                </button>
              </div>
              <div className="h-[1px] bg-[var(--zos-border-primary)] my-1" />
              <div className="px-3 py-1 zos-text-muted text-xs">Devices</div>
              <div className="px-3 py-2 flex items-center gap-3 rounded-md hover:bg-blue-500 cursor-pointer mx-1">
                <Keyboard className="w-4 h-4" />
                <div className="flex-1">
                  <p>Magic Keyboard</p>
                  <p className="zos-text-muted text-xs">Connected</p>
                </div>
                <div className="w-2 h-2 rounded-full bg-green-500" />
              </div>
              <div className="h-[1px] bg-[var(--zos-border-primary)] my-1" />
              <div className="px-3 py-1.5 rounded-md hover:bg-blue-500 cursor-pointer mx-1">
                Bluetooth Settings...
              </div>
            </div>
          )}
        </div>

        {/* Battery */}
        <div className="relative h-full">
          <button
            className={cn(systemTrayButtonClass, activeSystemMenu === 'battery' && "bg-[var(--zos-border-primary)]")}
            onClick={() => handleSystemMenuClick('battery')}
          >
            <div className="flex items-center gap-1">
              {isCharging ? (
                <BatteryCharging className="w-[18px] h-[18px] opacity-90" />
              ) : (
                <Battery className="w-[18px] h-[18px] opacity-90" />
              )}
            </div>
          </button>
          {activeSystemMenu === 'battery' && (
            <div className="absolute top-full right-0 mt-[5px] min-w-[200px] glass-menu rounded-[10px] shadow-2xl zos-text-primary text-[13px] p-1" style={{ zIndex: Z_INDEX.MENU_BAR_DROPDOWN }}>
              <div className="px-3 py-2">
                <p className="font-semibold">Battery</p>
                <p className="zos-text-muted">{batteryLevel}% {isCharging ? '(Charging)' : ''}</p>
              </div>
              <div className="h-[1px] bg-[var(--zos-border-primary)] my-1" />
              <div className="px-3 py-1.5 rounded-md hover:bg-blue-500 cursor-pointer mx-1">
                Battery Settings...
              </div>
            </div>
          )}
        </div>

        {/* Volume */}
        <div className="relative h-full">
          <button
            className={cn(systemTrayButtonClass, activeSystemMenu === 'volume' && "bg-[var(--zos-border-primary)]")}
            onClick={() => handleSystemMenuClick('volume')}
          >
            <VolumeIcon />
          </button>
          {activeSystemMenu === 'volume' && (
            <div className="absolute top-full right-0 mt-[5px] min-w-[200px] glass-menu rounded-[10px] shadow-2xl zos-text-primary text-[13px] p-3" style={{ zIndex: Z_INDEX.MENU_BAR_DROPDOWN }}>
              <p className="font-semibold mb-2">Sound</p>
              <Slider
                value={volume}
                onValueChange={setVolume}
                max={100}
                step={1}
              />
              <div className="h-[1px] bg-[var(--zos-border-primary)] my-2" />
              <div className="py-1.5 rounded-md hover:bg-blue-500 cursor-pointer px-2 -mx-2">
                Sound Settings...
              </div>
            </div>
          )}
        </div>

        {/* Control Center */}
        <div className="relative h-full">
          <button
            className={cn(systemTrayButtonClass, activeSystemMenu === 'control' && "bg-[var(--zos-border-primary)]")}
            onClick={() => handleSystemMenuClick('control')}
          >
            <ControlCenterIcon className="w-[15px] h-[15px] opacity-90" />
          </button>
          {activeSystemMenu === 'control' && (
            <div className="absolute top-full right-0 mt-[1px] w-[320px] glass-menu rounded-2xl shadow-2xl zos-text-primary text-[13px] p-3" style={{ zIndex: Z_INDEX.MENU_BAR_DROPDOWN }}>
              {/* Top Row - Connectivity */}
              <div className="flex gap-2 mb-2">
                <div className="flex-1 bg-[var(--zos-border-primary)] rounded-2xl p-2 flex gap-2">
                  <button
                    onClick={() => setWifiEnabled(!wifiEnabled)}
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                      wifiEnabled ? "bg-blue-500" : "bg-[var(--zos-border-primary)] hover:bg-[var(--zos-surface-glass-hover)]"
                    )}
                  >
                    <Wifi className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setBluetoothEnabled(!bluetoothEnabled)}
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                      bluetoothEnabled ? "bg-blue-500" : "bg-[var(--zos-border-primary)] hover:bg-[var(--zos-surface-glass-hover)]"
                    )}
                  >
                    <Bluetooth className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setAirDropEnabled(!airDropEnabled)}
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                      airDropEnabled ? "bg-blue-500" : "bg-[var(--zos-border-primary)] hover:bg-[var(--zos-surface-glass-hover)]"
                    )}
                  >
                    <Airplay className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Second Row - Focus and Now Playing */}
              <div className="flex gap-2 mb-2">
                <button
                  onClick={() => setFocusEnabled(!focusEnabled)}
                  className={cn(
                    "flex-1 p-3 rounded-2xl text-left transition-colors",
                    focusEnabled ? "bg-purple-500" : "bg-[var(--zos-border-primary)] hover:bg-[var(--zos-surface-glass-hover)]"
                  )}
                >
                  <Moon className="w-5 h-5 mb-1" />
                  <p className="text-sm font-semibold">Focus</p>
                  <p className="text-xs opacity-70">{focusEnabled ? "On" : "Off"}</p>
                </button>

                <div className="flex-1 bg-[var(--zos-border-primary)] rounded-2xl p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-md bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center">
                      <Music className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate">Not Playing</p>
                      <p className="text-xs opacity-50 truncate">Music</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-3">
                    <button className="p-1 hover:bg-[var(--zos-border-primary)] rounded">
                      <SkipBack className="w-4 h-4" />
                    </button>
                    <button
                      className="p-1 hover:bg-[var(--zos-border-primary)] rounded"
                      onClick={() => setIsPlaying(!isPlaying)}
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    <button className="p-1 hover:bg-[var(--zos-border-primary)] rounded">
                      <SkipForward className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Third Row - Stage Manager, Screen Mirroring */}
              <div className="flex gap-2 mb-2">
                <button
                  onClick={() => setStageManagerEnabled(!stageManagerEnabled)}
                  className={cn(
                    "flex-1 p-3 rounded-2xl text-left transition-colors",
                    stageManagerEnabled ? "bg-blue-500" : "bg-[var(--zos-border-primary)] hover:bg-[var(--zos-surface-glass-hover)]"
                  )}
                >
                  <Layers className="w-5 h-5 mb-1" />
                  <p className="text-xs font-semibold">Stage Manager</p>
                </button>

                <button
                  onClick={() => setScreenMirroringEnabled(!screenMirroringEnabled)}
                  className={cn(
                    "flex-1 p-3 rounded-2xl text-left transition-colors",
                    screenMirroringEnabled ? "bg-blue-500" : "bg-[var(--zos-border-primary)] hover:bg-[var(--zos-surface-glass-hover)]"
                  )}
                >
                  <MonitorSmartphone className="w-5 h-5 mb-1" />
                  <p className="text-xs font-semibold">Screen Mirroring</p>
                </button>
              </div>

              {/* Fourth Row - Small buttons */}
              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => setAccessibilityEnabled(!accessibilityEnabled)}
                  className={cn(
                    "flex-1 p-3 rounded-2xl transition-colors flex flex-col items-center",
                    accessibilityEnabled ? "bg-blue-500" : "bg-[var(--zos-border-primary)] hover:bg-[var(--zos-surface-glass-hover)]"
                  )}
                >
                  <Accessibility className="w-5 h-5" />
                  <p className="text-[10px] mt-1 opacity-70">Accessibility</p>
                </button>
                <button
                  onClick={() => setCameraEnabled(!cameraEnabled)}
                  className={cn(
                    "flex-1 p-3 rounded-2xl transition-colors flex flex-col items-center",
                    cameraEnabled ? "bg-green-500" : "bg-[var(--zos-border-primary)] hover:bg-[var(--zos-surface-glass-hover)]"
                  )}
                >
                  <Camera className="w-5 h-5" />
                  <p className="text-[10px] mt-1 opacity-70">{cameraEnabled ? "In Use" : "Camera"}</p>
                </button>
                <button
                  onClick={onToggleDarkMode}
                  className={cn(
                    "flex-1 p-3 rounded-2xl transition-colors flex flex-col items-center",
                    darkMode ? "bg-indigo-500" : "bg-[var(--zos-border-primary)] hover:bg-[var(--zos-surface-glass-hover)]"
                  )}
                >
                  {darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                  <p className="text-[10px] mt-1 opacity-70">{darkMode ? "Dark" : "Light"}</p>
                </button>
              </div>

              {/* Display Slider */}
              <div className="bg-[var(--zos-border-primary)] rounded-2xl p-3 mb-2">
                <div className="flex items-center gap-3">
                  <Sun className="w-4 h-4 opacity-50" />
                  <Slider
                    value={brightness}
                    onValueChange={setBrightness}
                    max={100}
                    step={1}
                    className="flex-1"
                  />
                  <Sun className="w-5 h-5" />
                </div>
              </div>

              {/* Sound Slider */}
              <div className="bg-[var(--zos-border-primary)] rounded-2xl p-3">
                <div className="flex items-center gap-3">
                  <VolumeX className="w-4 h-4 opacity-50" />
                  <Slider
                    value={volume}
                    onValueChange={setVolume}
                    max={100}
                    step={1}
                    className="flex-1"
                  />
                  <Volume2 className="w-5 h-5" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Spotlight Search */}
        <button
          className={cn(systemTrayButtonClass)}
          onClick={onOpenSpotlight}
        >
          <Search className="w-[14px] h-[14px] opacity-90" />
        </button>

        {/* Date/Time */}
        <div className="relative h-full">
          <button
            className={cn(systemTrayButtonClass, "px-[10px]", activeSystemMenu === 'datetime' && "bg-[var(--zos-border-primary)]")}
            onClick={() => handleSystemMenuClick('datetime')}
          >
            <span className="text-[13px] opacity-90">{formatTime(currentTime)}</span>
          </button>
          {activeSystemMenu === 'datetime' && (
            <div className="absolute top-full right-0 mt-[5px] min-w-[280px] glass-menu rounded-[10px] shadow-2xl zos-text-primary text-[13px] p-1" style={{ zIndex: Z_INDEX.MENU_BAR_DROPDOWN }}>
              <div className="px-3 py-2 text-center">
                <p className="text-2xl font-light">
                  {currentTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                </p>
                <p className="zos-text-muted">
                  {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <div className="h-[1px] bg-[var(--zos-border-primary)] my-1" />
              <div className="px-3 py-1.5 rounded-md hover:bg-blue-500 cursor-pointer mx-1">
                Open Date & Time Settings...
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Click outside handler overlay */}
      {(activeMenu !== null || activeSystemMenu !== null) && (
        <div
          className="fixed inset-0 z-[-1]"
          onClick={() => {
            setActiveMenu(null);
            setActiveSystemMenu(null);
            setMenuBarActive(false);
          }}
        />
      )}
    </div>
  );
};

export default MenuBar;
