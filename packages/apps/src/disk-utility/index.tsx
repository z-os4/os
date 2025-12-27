/**
 * Disk Utility App
 *
 * Storage management and disk operations for zOS.
 * Unified black glass UI with macOS dark mode aesthetic.
 */

import React, { useState } from 'react';
import { ZWindow } from '@z-os/ui';
import {
  HardDrive, Database, Usb, AlertCircle, CheckCircle,
  Trash2, LayoutGrid, Shield, RefreshCw, ChevronRight,
  FolderOpen, Image, Music, Film, FileText, AppWindow,
  Settings, Info, Play, Pause
} from 'lucide-react';
import { cn } from '@z-os/ui';

interface DiskUtilityWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

interface StorageCategory {
  name: string;
  size: number;
  color: string;
  icon: React.ElementType;
}

interface Drive {
  id: string;
  name: string;
  type: 'internal' | 'external';
  capacity: number;
  used: number;
  fileSystem: string;
  mountPoint: string;
  status: 'healthy' | 'warning' | 'error';
  partitions?: { name: string; size: number; used: number }[];
}

// Mock drive data
const mockDrives: Drive[] = [
  {
    id: 'macintosh-hd',
    name: 'Macintosh HD',
    type: 'internal',
    capacity: 512,
    used: 384,
    fileSystem: 'APFS',
    mountPoint: '/',
    status: 'healthy',
    partitions: [
      { name: 'Macintosh HD', size: 480, used: 360 },
      { name: 'Macintosh HD - Data', size: 32, used: 24 },
    ],
  },
  {
    id: 'recovery',
    name: 'Recovery',
    type: 'internal',
    capacity: 5,
    used: 2.5,
    fileSystem: 'APFS',
    mountPoint: '/System/Volumes/Recovery',
    status: 'healthy',
  },
  {
    id: 'external-ssd',
    name: 'External SSD',
    type: 'external',
    capacity: 1024,
    used: 450,
    fileSystem: 'exFAT',
    mountPoint: '/Volumes/External SSD',
    status: 'healthy',
  },
  {
    id: 'backup-drive',
    name: 'Backup Drive',
    type: 'external',
    capacity: 2048,
    used: 1536,
    fileSystem: 'HFS+',
    mountPoint: '/Volumes/Backup Drive',
    status: 'warning',
  },
];

// Storage breakdown for main drive
const storageCategories: StorageCategory[] = [
  { name: 'Applications', size: 85, color: 'bg-blue-500', icon: AppWindow },
  { name: 'Documents', size: 45, color: 'bg-yellow-500', icon: FileText },
  { name: 'Photos', size: 120, color: 'bg-purple-500', icon: Image },
  { name: 'Music', size: 35, color: 'bg-pink-500', icon: Music },
  { name: 'Videos', size: 65, color: 'bg-red-500', icon: Film },
  { name: 'System', size: 25, color: 'bg-green-500', icon: Settings },
  { name: 'Other', size: 9, color: 'bg-gray-500', icon: FolderOpen },
];

const DiskUtilityWindow: React.FC<DiskUtilityWindowProps> = ({ onClose, onFocus }) => {
  const [selectedDrive, setSelectedDrive] = useState<Drive>(mockDrives[0]);
  const [operationInProgress, setOperationInProgress] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  const formatSize = (gb: number) => {
    if (gb >= 1024) {
      return `${(gb / 1024).toFixed(2)} TB`;
    }
    return `${gb.toFixed(1)} GB`;
  };

  const getAvailableSpace = (drive: Drive) => drive.capacity - drive.used;
  const getUsagePercent = (drive: Drive) => (drive.used / drive.capacity) * 100;

  const getStatusIcon = (status: Drive['status']) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-amber-400" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-400" />;
    }
  };

  const runFirstAid = () => {
    setOperationInProgress('firstAid');
    setTimeout(() => {
      setOperationInProgress(null);
    }, 3000);
  };

  const totalCategorySize = storageCategories.reduce((sum, cat) => sum + cat.size, 0);

  // Pie chart calculation
  const renderPieChart = () => {
    let cumulativePercent = 0;
    const segments = storageCategories.map((cat, i) => {
      const percent = (cat.size / selectedDrive.used) * 100;
      const startAngle = cumulativePercent * 3.6; // 360 / 100
      cumulativePercent += percent;
      const endAngle = cumulativePercent * 3.6;

      // Convert to SVG arc path
      const startRad = (startAngle - 90) * Math.PI / 180;
      const endRad = (endAngle - 90) * Math.PI / 180;
      const x1 = 50 + 40 * Math.cos(startRad);
      const y1 = 50 + 40 * Math.sin(startRad);
      const x2 = 50 + 40 * Math.cos(endRad);
      const y2 = 50 + 40 * Math.sin(endRad);
      const largeArc = percent > 50 ? 1 : 0;

      return (
        <path
          key={cat.name}
          d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
          className={cat.color.replace('bg-', 'fill-')}
          opacity={0.85}
        />
      );
    });

    return (
      <svg viewBox="0 0 100 100" className="w-36 h-36">
        {segments}
        <circle cx="50" cy="50" r="22" className="fill-black/60" />
      </svg>
    );
  };

  const internalDrives = mockDrives.filter(d => d.type === 'internal');
  const externalDrives = mockDrives.filter(d => d.type === 'external');

  // Glass panel styles
  const glassPanel = "bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] shadow-lg shadow-black/20";
  const glassPanelHover = "hover:bg-white/[0.06] hover:border-white/[0.12]";

  return (
    <ZWindow
      title="Disk Utility"
      onClose={onClose}
      onFocus={onFocus}
      initialPosition={{ x: 120, y: 90 }}
      initialSize={{ width: 900, height: 600 }}
      windowType="system"
    >
      <div className="flex h-full bg-black/90">
        {/* Sidebar - Glass morphism with backdrop blur */}
        <div className="w-56 bg-white/[0.03] backdrop-blur-2xl border-r border-white/[0.06] flex flex-col">
          {/* Internal drives section */}
          <div className="px-4 py-3 border-b border-white/[0.06]">
            <span className="text-[10px] font-semibold text-white/40 uppercase tracking-widest">Internal</span>
          </div>
          <div className="p-2">
            {internalDrives.map(drive => (
              <button
                key={drive.id}
                onClick={() => setSelectedDrive(drive)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200",
                  selectedDrive.id === drive.id
                    ? "bg-white/[0.08] border border-white/[0.1] shadow-sm"
                    : "hover:bg-white/[0.04] border border-transparent"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center",
                  selectedDrive.id === drive.id
                    ? "bg-gradient-to-br from-blue-500/30 to-blue-600/20"
                    : "bg-white/[0.05]"
                )}>
                  <HardDrive className={cn(
                    "w-4 h-4",
                    selectedDrive.id === drive.id ? "text-blue-400" : "text-white/50"
                  )} />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={cn(
                      "truncate",
                      selectedDrive.id === drive.id ? "text-white" : "text-white/80"
                    )}>{drive.name}</span>
                    {getStatusIcon(drive.status)}
                  </div>
                  <div className="text-[11px] text-white/40">{formatSize(getAvailableSpace(drive))} free</div>
                </div>
              </button>
            ))}
          </div>

          {/* External drives section */}
          <div className="px-4 py-3 border-t border-white/[0.06]">
            <span className="text-[10px] font-semibold text-white/40 uppercase tracking-widest">External</span>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {externalDrives.map(drive => (
              <button
                key={drive.id}
                onClick={() => setSelectedDrive(drive)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200",
                  selectedDrive.id === drive.id
                    ? "bg-white/[0.08] border border-white/[0.1] shadow-sm"
                    : "hover:bg-white/[0.04] border border-transparent"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center",
                  selectedDrive.id === drive.id
                    ? "bg-gradient-to-br from-blue-500/30 to-blue-600/20"
                    : "bg-white/[0.05]"
                )}>
                  <Usb className={cn(
                    "w-4 h-4",
                    selectedDrive.id === drive.id ? "text-blue-400" : "text-white/50"
                  )} />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={cn(
                      "truncate",
                      selectedDrive.id === drive.id ? "text-white" : "text-white/80"
                    )}>{drive.name}</span>
                    {getStatusIcon(drive.status)}
                  </div>
                  <div className="text-[11px] text-white/40">{formatSize(getAvailableSpace(drive))} free</div>
                </div>
              </button>
            ))}
            {externalDrives.length === 0 && (
              <div className="text-center text-white/25 text-xs py-6">
                No external drives connected
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Toolbar - Glass effect */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] bg-white/[0.02] backdrop-blur-xl">
            <div className="flex items-center gap-2">
              <button
                onClick={runFirstAid}
                disabled={operationInProgress !== null}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  glassPanel,
                  operationInProgress
                    ? "opacity-40 cursor-not-allowed"
                    : "hover:bg-blue-500/20 hover:border-blue-500/30 text-blue-400"
                )}
              >
                <Shield className="w-4 h-4" />
                First Aid
              </button>
              <button
                disabled={operationInProgress !== null}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  glassPanel,
                  glassPanelHover,
                  "text-white/70"
                )}
              >
                <LayoutGrid className="w-4 h-4" />
                Partition
              </button>
              <button
                disabled={operationInProgress !== null}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  glassPanel,
                  "hover:bg-red-500/15 hover:border-red-500/25 text-red-400/80"
                )}
              >
                <Trash2 className="w-4 h-4" />
                Erase
              </button>
            </div>
            <button
              onClick={() => setShowInfo(!showInfo)}
              className={cn(
                "p-2 rounded-lg transition-all duration-200",
                glassPanel,
                showInfo 
                  ? "bg-blue-500/15 border-blue-500/25 text-blue-400" 
                  : "text-white/50 hover:text-white/70"
              )}
            >
              <Info className="w-4 h-4" />
            </button>
          </div>

          {/* Operation progress */}
          {operationInProgress && (
            <div className={cn("mx-4 mt-4 p-4 rounded-xl", glassPanel, "border-blue-500/20 bg-blue-500/[0.08]")}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">Running First Aid on "{selectedDrive.name}"</p>
                  <p className="text-sm text-white/50">Checking file system structure...</p>
                </div>
              </div>
              <div className="mt-3 h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full animate-pulse" style={{ width: '45%' }} />
              </div>
            </div>
          )}

          {/* Drive content */}
          <div className="flex-1 overflow-auto p-4">
            <div className="space-y-4">
              {/* Drive header */}
              <div className={cn("p-5 rounded-2xl flex items-start gap-5", glassPanel)}>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/40 to-blue-700/30 border border-blue-400/20 flex items-center justify-center shadow-lg shadow-blue-500/10">
                  <HardDrive className="w-8 h-8 text-blue-300" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-white mb-1">{selectedDrive.name}</h2>
                  <div className="flex items-center gap-3 text-sm text-white/50">
                    <span className="px-2 py-0.5 rounded bg-white/[0.06] text-white/60">{selectedDrive.fileSystem}</span>
                    <span className="text-white/30">|</span>
                    <span className="font-mono text-xs">{selectedDrive.mountPoint}</span>
                    <span className="text-white/30">|</span>
                    <div className="flex items-center gap-1.5">
                      {getStatusIcon(selectedDrive.status)}
                      <span className={cn(
                        "font-medium",
                        selectedDrive.status === 'healthy' && "text-emerald-400",
                        selectedDrive.status === 'warning' && "text-amber-400",
                        selectedDrive.status === 'error' && "text-red-400",
                      )}>
                        {selectedDrive.status.charAt(0).toUpperCase() + selectedDrive.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Capacity info - Glass panel */}
              <div className={cn("p-5 rounded-2xl", glassPanel)}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-white font-medium">Storage</p>
                    <p className="text-sm text-white/50">
                      {formatSize(selectedDrive.used)} used of {formatSize(selectedDrive.capacity)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">{formatSize(getAvailableSpace(selectedDrive))}</p>
                    <p className="text-sm text-white/40">Available</p>
                  </div>
                </div>

                {/* Usage bar - Glass style */}
                <div className="h-5 bg-white/[0.06] rounded-full overflow-hidden flex border border-white/[0.04]">
                  {selectedDrive.id === 'macintosh-hd' ? (
                    // Show category breakdown for main drive
                    storageCategories.map((cat) => (
                      <div
                        key={cat.name}
                        className={cn("h-full transition-all duration-300", cat.color, "opacity-80")}
                        style={{ width: `${(cat.size / selectedDrive.capacity) * 100}%` }}
                        title={`${cat.name}: ${formatSize(cat.size)}`}
                      />
                    ))
                  ) : (
                    // Simple usage bar for other drives
                    <div
                      className={cn(
                        "h-full transition-all duration-300",
                        getUsagePercent(selectedDrive) > 90 ? "bg-red-500" :
                        getUsagePercent(selectedDrive) > 75 ? "bg-amber-500" :
                        "bg-blue-500"
                      )}
                      style={{ width: `${getUsagePercent(selectedDrive)}%` }}
                    />
                  )}
                </div>
              </div>

              {/* Storage breakdown (for main drive) */}
              {selectedDrive.id === 'macintosh-hd' && (
                <div className="grid grid-cols-2 gap-4">
                  {/* Pie chart - Glass panel */}
                  <div className={cn("p-5 rounded-2xl flex items-center justify-center", glassPanel)}>
                    {renderPieChart()}
                  </div>

                  {/* Categories list - Glass panel */}
                  <div className={cn("p-5 rounded-2xl", glassPanel)}>
                    <h3 className="text-white/80 font-medium text-sm mb-4">Storage Breakdown</h3>
                    <div className="space-y-2.5">
                      {storageCategories.map((cat) => (
                        <div key={cat.name} className="flex items-center justify-between py-1">
                          <div className="flex items-center gap-3">
                            <div className={cn("w-2.5 h-2.5 rounded-full", cat.color)} />
                            <cat.icon className="w-4 h-4 text-white/40" />
                            <span className="text-white/70 text-sm">{cat.name}</span>
                          </div>
                          <span className="text-white/90 font-medium text-sm">{formatSize(cat.size)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Partitions - Glass panel */}
              {selectedDrive.partitions && (
                <div className={cn("p-5 rounded-2xl", glassPanel)}>
                  <h3 className="text-white/80 font-medium text-sm mb-4">Partitions</h3>
                  <div className="space-y-2">
                    {selectedDrive.partitions.map((partition, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center">
                            <Database className="w-4 h-4 text-white/50" />
                          </div>
                          <div>
                            <p className="text-white/90 text-sm font-medium">{partition.name}</p>
                            <p className="text-xs text-white/40">
                              {formatSize(partition.used)} used of {formatSize(partition.size)}
                            </p>
                          </div>
                        </div>
                        <div className="w-28">
                          <div className="h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500/70 rounded-full"
                              style={{ width: `${(partition.used / partition.size) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Drive info panel - Glass panel */}
              {showInfo && (
                <div className={cn("p-5 rounded-2xl", glassPanel)}>
                  <h3 className="text-white/80 font-medium text-sm mb-4">Drive Information</h3>
                  <div className="grid grid-cols-2 gap-6 text-sm">
                    <div className="space-y-3">
                      <div className="flex justify-between py-1.5 border-b border-white/[0.04]">
                        <span className="text-white/40">Name</span>
                        <span className="text-white/90">{selectedDrive.name}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-white/[0.04]">
                        <span className="text-white/40">Type</span>
                        <span className="text-white/90">{selectedDrive.type === 'internal' ? 'Internal' : 'External'}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-white/[0.04]">
                        <span className="text-white/40">File System</span>
                        <span className="text-white/90">{selectedDrive.fileSystem}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between py-1.5 border-b border-white/[0.04]">
                        <span className="text-white/40">Mount Point</span>
                        <span className="text-white/90 font-mono text-xs">{selectedDrive.mountPoint}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-white/[0.04]">
                        <span className="text-white/40">Capacity</span>
                        <span className="text-white/90">{formatSize(selectedDrive.capacity)}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-white/[0.04]">
                        <span className="text-white/40">Available</span>
                        <span className="text-white/90">{formatSize(getAvailableSpace(selectedDrive))}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ZWindow>
  );
};

// ============================================================================
// App Definition
// ============================================================================

/**
 * Disk Utility app manifest
 */
export const DiskUtilityManifest = {
  identifier: 'ai.hanzo.disk-utility',
  name: 'Disk Utility',
  version: '1.0.0',
  description: 'Storage management for zOS',
  category: 'utilities' as const,
  permissions: ['system', 'storage'] as const,
  window: {
    type: 'system' as const,
    defaultSize: { width: 900, height: 600 },
    resizable: true,
    showInDock: true,
  },
};

/**
 * Disk Utility menu bar configuration
 */
export const DiskUtilityMenuBar = {
  menus: [
    {
      id: 'file',
      label: 'File',
      items: [
        { type: 'item' as const, id: 'newImage', label: 'New Image', shortcut: 'CmdN' },
        { type: 'item' as const, id: 'openImage', label: 'Open Disk Image...', shortcut: 'CmdO' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'close', label: 'Close', shortcut: 'CmdW' },
      ],
    },
    {
      id: 'edit',
      label: 'Edit',
      items: [
        { type: 'item' as const, id: 'copy', label: 'Copy', shortcut: 'CmdC' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'selectAll', label: 'Select All', shortcut: 'CmdA' },
      ],
    },
    {
      id: 'view',
      label: 'View',
      items: [
        { type: 'item' as const, id: 'showAllDevices', label: 'Show All Devices' },
        { type: 'item' as const, id: 'showOnlyVolumes', label: 'Show Only Volumes' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'showAPFSSnapshots', label: 'Show APFS Snapshots' },
      ],
    },
    {
      id: 'images',
      label: 'Images',
      items: [
        { type: 'item' as const, id: 'convertImage', label: 'Convert...' },
        { type: 'item' as const, id: 'resizeImage', label: 'Resize...' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'verify', label: 'Verify...' },
      ],
    },
    {
      id: 'window',
      label: 'Window',
      items: [
        { type: 'item' as const, id: 'minimize', label: 'Minimize', shortcut: 'CmdM' },
        { type: 'item' as const, id: 'zoom', label: 'Zoom' },
      ],
    },
    {
      id: 'help',
      label: 'Help',
      items: [
        { type: 'item' as const, id: 'diskUtilityHelp', label: 'Disk Utility Help' },
      ],
    },
  ],
};

/**
 * Disk Utility dock configuration
 */
export const DiskUtilityDockConfig = {
  contextMenu: [
    { type: 'item' as const, id: 'showAllDevices', label: 'Show All Devices' },
    { type: 'separator' as const },
    { type: 'item' as const, id: 'options', label: 'Options' },
  ],
};

/**
 * Disk Utility App definition for registry
 */
export const DiskUtilityApp = {
  manifest: DiskUtilityManifest,
  component: DiskUtilityWindow,
  icon: HardDrive,
  menuBar: DiskUtilityMenuBar,
  dockConfig: DiskUtilityDockConfig,
};

export default DiskUtilityWindow;
