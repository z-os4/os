import React, { useState, useEffect, useCallback } from 'react';
import {
  FinderIcon,
  SafariIcon,
  TerminalIcon,
  HanzoIcon,
  MailIcon,
  CalendarIcon,
  MessagesIcon,
  MusicIcon,
  PhotosIcon,
  TextEditIcon,
  FaceTimeIcon,
} from './dock/icons';

interface AppSwitcherProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectApp: (appId: string) => void;
  runningApps: string[];
}

interface AppInfo {
  id: string;
  name: string;
  icon: React.ReactNode;
}

const APP_INFO: Record<string, AppInfo> = {
  finder: { id: 'finder', name: 'Finder', icon: <FinderIcon className="w-16 h-16" /> },
  safari: { id: 'safari', name: 'Safari', icon: <SafariIcon className="w-16 h-16" /> },
  mail: { id: 'mail', name: 'Mail', icon: <MailIcon className="w-16 h-16" /> },
  photos: { id: 'photos', name: 'Photos', icon: <PhotosIcon className="w-16 h-16" /> },
  calendar: { id: 'calendar', name: 'Calendar', icon: <CalendarIcon className="w-16 h-16" /> },
  messages: { id: 'messages', name: 'Messages', icon: <MessagesIcon className="w-16 h-16" /> },
  facetime: { id: 'facetime', name: 'FaceTime', icon: <FaceTimeIcon className="w-16 h-16" /> },
  music: { id: 'music', name: 'Music', icon: <MusicIcon className="w-16 h-16" /> },
  terminal: { id: 'terminal', name: 'Terminal', icon: <TerminalIcon className="w-16 h-16" /> },
  textedit: { id: 'textedit', name: 'TextEdit', icon: <TextEditIcon className="w-16 h-16" /> },
  hanzo: { id: 'hanzo', name: 'Hanzo AI', icon: <HanzoIcon className="w-16 h-16" /> },
};

export const AppSwitcher: React.FC<AppSwitcherProps> = ({
  isOpen,
  onClose,
  onSelectApp,
  runningApps,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Get running apps info
  const apps = runningApps
    .filter(id => APP_INFO[id])
    .map(id => APP_INFO[id]);

  // Always include Finder if nothing else is running
  if (apps.length === 0) {
    apps.push(APP_INFO.finder);
  }

  useEffect(() => {
    if (isOpen) {
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;

    if (e.key === 'Tab' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (e.shiftKey) {
        setSelectedIndex(i => (i - 1 + apps.length) % apps.length);
      } else {
        setSelectedIndex(i => (i + 1) % apps.length);
      }
    }
  }, [isOpen, apps.length]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;

    // When Meta/Ctrl is released, select the app and close
    if (e.key === 'Meta' || e.key === 'Control') {
      if (apps[selectedIndex]) {
        onSelectApp(apps[selectedIndex].id);
      }
      onClose();
    }
  }, [isOpen, apps, selectedIndex, onSelectApp, onClose]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  if (!isOpen || apps.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

      {/* App Switcher */}
      <div className="relative bg-[#2a2a2a]/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/10 p-4">
        <div className="flex items-center gap-4">
          {apps.map((app, index) => (
            <div
              key={app.id}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-colors ${
                index === selectedIndex ? 'bg-white/10' : ''
              }`}
            >
              <div className="w-16 h-16 flex items-center justify-center">
                {app.icon}
              </div>
              <span className="text-white text-xs font-medium">{app.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AppSwitcher;
