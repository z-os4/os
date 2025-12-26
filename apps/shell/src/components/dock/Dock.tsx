import React, { useState, useCallback, useRef } from 'react';
import { DockItem } from './DockItem';
import {
  FinderIcon,
  SafariIcon,
  MailIcon,
  PhotosIcon,
  CalendarIcon,
  MessagesIcon,
  FaceTimeIcon,
  MusicIcon,
  TerminalIcon,
  TextEditIcon,
  HanzoIcon,
  LuxLogo,
  ZooLogo,
  MacFolderIcon,
  TrashIcon,
} from './icons';

interface DockProps {
  onOpenApp: (appId: string) => void;
  onOpenDynamicApp?: (identifier: string) => void;
  onOpenAppStore?: () => void;
  onApplicationsClick?: () => void;
  onDownloadsClick?: () => void;
  onTrashClick?: () => void;
  activeApps?: string[];
  runningApps?: string[];
  launchingApp?: string | null;
}

interface DockItemConfig {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: 'app' | 'dynamic' | 'store' | 'custom' | 'folder';
  identifier?: string;
}

// Main system apps - matches original zOS dock order
const DOCK_ITEMS: DockItemConfig[] = [
  { id: 'finder', label: 'Finder', icon: <FinderIcon className="w-full h-full" />, action: 'app' },
  { id: 'safari', label: 'Safari', icon: <SafariIcon className="w-full h-full" />, action: 'app' },
  { id: 'mail', label: 'Mail', icon: <MailIcon className="w-full h-full" />, action: 'app' },
  { id: 'photos', label: 'Photos', icon: <PhotosIcon className="w-full h-full" />, action: 'app' },
  { id: 'calendar', label: 'Calendar', icon: <CalendarIcon className="w-full h-full" />, action: 'app' },
  { id: 'messages', label: 'Messages', icon: <MessagesIcon className="w-full h-full" />, action: 'app' },
  { id: 'facetime', label: 'FaceTime', icon: <FaceTimeIcon className="w-full h-full" />, action: 'app' },
  { id: 'music', label: 'Music', icon: <MusicIcon className="w-full h-full" />, action: 'app' },
  { id: 'terminal', label: 'Terminal', icon: <TerminalIcon className="w-full h-full" />, action: 'app' },
  { id: 'textedit', label: 'TextEdit', icon: <TextEditIcon className="w-full h-full" />, action: 'app' },
];

// Hanzo ecosystem apps
const DOCK_CUSTOM_APPS: DockItemConfig[] = [
  { id: 'hanzo', label: 'Hanzo AI', icon: <HanzoIcon className="w-full h-full" />, action: 'app' },
  { id: 'lux', label: 'Lux Wallet', icon: <LuxLogo className="w-full h-full" />, action: 'app' },
  { id: 'zoo', label: 'Zoo', icon: <ZooLogo className="w-full h-full" />, action: 'app' },
];

// Folder utilities
const DOCK_FOLDERS: DockItemConfig[] = [
  { id: 'applications', label: 'Applications', icon: <MacFolderIcon className="w-full h-full" badgeType="apps" />, action: 'folder' },
  { id: 'downloads', label: 'Downloads', icon: <MacFolderIcon className="w-full h-full" badgeType="downloads" />, action: 'folder' },
];

export const Dock: React.FC<DockProps> = ({
  onOpenApp,
  onOpenDynamicApp,
  onOpenAppStore,
  onApplicationsClick,
  onDownloadsClick,
  onTrashClick,
  activeApps = [],
  runningApps = [],
  launchingApp,
}) => {
  const [mouseX, setMouseX] = useState<number | null>(null);
  const dockRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    // Track mouse position relative to dock container for magnification
    if (dockRef.current) {
      const rect = dockRef.current.getBoundingClientRect();
      setMouseX(e.clientX - rect.left);
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    setMouseX(null);
  }, []);

  const handleItemClick = useCallback((item: DockItemConfig) => {
    switch (item.action) {
      case 'app':
        onOpenApp(item.id);
        break;
      case 'dynamic':
        if (item.identifier && onOpenDynamicApp) {
          onOpenDynamicApp(item.identifier);
        }
        break;
      case 'store':
        if (onOpenAppStore) onOpenAppStore();
        break;
      case 'folder':
        if (item.id === 'applications' && onApplicationsClick) {
          onApplicationsClick();
        } else if (item.id === 'downloads' && onDownloadsClick) {
          onDownloadsClick();
        }
        break;
    }
  }, [onOpenApp, onOpenDynamicApp, onOpenAppStore, onApplicationsClick, onDownloadsClick]);

  const renderItems = (items: DockItemConfig[], startIndex: number) =>
    items.map((item, i) => (
      <DockItem
        key={item.id}
        id={item.id}
        label={item.label}
        icon={item.icon}
        onClick={() => handleItemClick(item)}
        isActive={activeApps.includes(item.id)}
        isRunning={runningApps.includes(item.id)}
        isLaunching={launchingApp === item.id}
        mouseX={mouseX}
        index={startIndex + i}
        magnificationEnabled={true}
      />
    ));

  return (
    <div
      ref={dockRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[9999]"
    >
      <div
        data-dock
        className="
          flex items-end gap-0.5 px-2 py-1.5
          bg-white/10 backdrop-blur-2xl
          rounded-2xl border border-white/20
          shadow-[0_0_0_1px_rgba(0,0,0,0.1),0_8px_40px_rgba(0,0,0,0.4)]
        "
      >
        {/* Main system apps */}
        {renderItems(DOCK_ITEMS, 0)}

        {/* Separator before Hanzo/Lux/Zoo */}
        <div className="w-px h-10 bg-white/20 mx-1 self-center" />

        {/* Hanzo ecosystem apps */}
        {renderItems(DOCK_CUSTOM_APPS, DOCK_ITEMS.length)}

        {/* Separator before folders */}
        <div className="w-px h-10 bg-white/20 mx-1 self-center" />

        {/* Folders - Applications, Downloads */}
        {renderItems(DOCK_FOLDERS, DOCK_ITEMS.length + DOCK_CUSTOM_APPS.length)}

        {/* Trash */}
        <DockItem
          id="trash"
          label="Trash"
          icon={<TrashIcon className="w-full h-full" />}
          onClick={onTrashClick}
          mouseX={mouseX}
          index={DOCK_ITEMS.length + DOCK_CUSTOM_APPS.length + DOCK_FOLDERS.length}
          magnificationEnabled={true}
        />
      </div>
    </div>
  );
};

export default Dock;
