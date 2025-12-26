import React, { useState, useEffect } from 'react';
import * as ContextMenu from '@radix-ui/react-context-menu';
import { cn } from '@z-os/ui';

// Z Logo for menu bar - matches original zOS
const ZMenuLogo: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 100 100"
    className={cn("w-4 h-4", className)}
    fill="currentColor"
  >
    <path d="M 15 15 H 85 V 30 L 35 70 H 85 V 85 H 15 V 70 L 65 30 H 15 Z" />
  </svg>
);

interface MenuBarProps {
  activeApp?: string;
  onShutdown?: () => void;
  onRestart?: () => void;
  onLock?: () => void;
  onSleep?: () => void;
  onAboutMac?: () => void;
  onOpenSettings?: () => void;
}

export const MenuBar: React.FC<MenuBarProps> = ({
  activeApp = 'Finder',
  onShutdown,
  onRestart,
  onLock,
  onSleep,
  onAboutMac,
  onOpenSettings,
}) => {
  const [time, setTime] = useState(new Date());
  const [showAppleMenu, setShowAppleMenu] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="absolute top-0 left-0 right-0 h-7 menubar flex items-center px-4 text-white text-[13px] z-[100]">
      {/* Z Menu - macOS-style Apple menu */}
      <ContextMenu.Root>
        <ContextMenu.Trigger asChild>
          <button
            className="font-medium text-base hover:bg-white/10 px-2 py-0.5 rounded flex items-center"
            onClick={() => setShowAppleMenu(!showAppleMenu)}
          >
            <ZMenuLogo className="w-[14px] h-[14px] text-white opacity-90" />
          </button>
        </ContextMenu.Trigger>
        <ContextMenu.Portal>
          <ContextMenu.Content
            className="min-w-[220px] bg-black/90 backdrop-blur-xl rounded-lg border border-white/20 p-1 shadow-xl"
          >
            <ContextMenu.Item
              onClick={onAboutMac}
              className="flex items-center px-3 py-1.5 text-sm text-white rounded hover:bg-white/10 outline-none cursor-default"
            >
              About zOS
            </ContextMenu.Item>
            <ContextMenu.Separator className="h-px my-1 bg-white/20" />
            <ContextMenu.Item
              onClick={onOpenSettings}
              className="flex items-center px-3 py-1.5 text-sm text-white rounded hover:bg-white/10 outline-none cursor-default"
            >
              System Settings...
            </ContextMenu.Item>
            <ContextMenu.Item className="flex items-center px-3 py-1.5 text-sm text-white rounded hover:bg-white/10 outline-none cursor-default">
              App Store...
            </ContextMenu.Item>
            <ContextMenu.Separator className="h-px my-1 bg-white/20" />
            <ContextMenu.Item className="flex items-center px-3 py-1.5 text-sm text-white rounded hover:bg-white/10 outline-none cursor-default">
              Recent Items
            </ContextMenu.Item>
            <ContextMenu.Separator className="h-px my-1 bg-white/20" />
            <ContextMenu.Item className="flex items-center px-3 py-1.5 text-sm text-white rounded hover:bg-white/10 outline-none cursor-default">
              Force Quit...
            </ContextMenu.Item>
            <ContextMenu.Separator className="h-px my-1 bg-white/20" />
            <ContextMenu.Item
              onClick={onSleep}
              className="flex items-center px-3 py-1.5 text-sm text-white rounded hover:bg-white/10 outline-none cursor-default"
            >
              Sleep
            </ContextMenu.Item>
            <ContextMenu.Item
              onClick={onRestart}
              className="flex items-center px-3 py-1.5 text-sm text-white rounded hover:bg-white/10 outline-none cursor-default"
            >
              Restart...
            </ContextMenu.Item>
            <ContextMenu.Item
              onClick={onShutdown}
              className="flex items-center px-3 py-1.5 text-sm text-white rounded hover:bg-white/10 outline-none cursor-default"
            >
              Shut Down...
            </ContextMenu.Item>
            <ContextMenu.Separator className="h-px my-1 bg-white/20" />
            <ContextMenu.Item
              onClick={onLock}
              className="flex items-center px-3 py-1.5 text-sm text-white rounded hover:bg-white/10 outline-none cursor-default"
            >
              Lock Screen
              <span className="ml-auto text-white/50 text-xs">⌃⌘Q</span>
            </ContextMenu.Item>
            <ContextMenu.Item className="flex items-center px-3 py-1.5 text-sm text-white rounded hover:bg-white/10 outline-none cursor-default">
              Log Out
              <span className="ml-auto text-white/50 text-xs">⇧⌘Q</span>
            </ContextMenu.Item>
          </ContextMenu.Content>
        </ContextMenu.Portal>
      </ContextMenu.Root>

      {/* Active App Name */}
      <button className="font-semibold ml-4 hover:bg-white/10 px-2 py-0.5 rounded">
        {activeApp}
      </button>

      {/* App Menus */}
      <div className="flex items-center ml-4 gap-1">
        {['File', 'Edit', 'View', 'Go', 'Window', 'Help'].map((menu) => (
          <button
            key={menu}
            className="hover:bg-white/10 px-2 py-0.5 rounded text-white/90"
          >
            {menu}
          </button>
        ))}
      </div>

      {/* Right side - Status icons and time */}
      <div className="ml-auto flex items-center gap-4">
        {/* Bluetooth */}
        <svg className="w-4 h-4 cursor-pointer hover:opacity-70" viewBox="0 0 24 24" fill="white">
          <path d="M17.71 7.71L12 2h-1v7.59L6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 11 14.41V22h1l5.71-5.71-4.3-4.29 4.3-4.29zM13 5.83l1.88 1.88L13 9.59V5.83zm1.88 10.46L13 18.17v-3.76l1.88 1.88z"/>
        </svg>

        {/* Volume/AirPlay */}
        <svg className="w-4 h-4 cursor-pointer hover:opacity-70" viewBox="0 0 24 24" fill="white">
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
        </svg>

        {/* Control Center - two sliders */}
        <svg className="w-4 h-4 cursor-pointer hover:opacity-70" viewBox="0 0 24 24" fill="white">
          <path d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z"/>
        </svg>

        {/* Spotlight */}
        <svg className="w-4 h-4 cursor-pointer hover:opacity-70" viewBox="0 0 24 24" fill="white">
          <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
        </svg>

        {/* Date and Time */}
        <div className="flex items-center gap-2 text-white text-[13px] font-normal">
          <span>{formatDate(time)}</span>
          <span>{formatTime(time)}</span>
        </div>
      </div>
    </div>
  );
};

export default MenuBar;
