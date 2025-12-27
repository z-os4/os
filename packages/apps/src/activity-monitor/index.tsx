import React, { useState, useEffect } from 'react';
import { ZWindow } from '@z-os/ui';
import { Cpu, MemoryStick, HardDrive, Wifi, Activity, Zap, ActivitySquare } from 'lucide-react';
import { cn } from '@z-os/ui';

interface ActivityMonitorWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

interface ProcessInfo {
  pid: number;
  name: string;
  cpu: number;
  memory: number;
  threads: number;
}

const ActivityMonitorWindow: React.FC<ActivityMonitorWindowProps> = ({ onClose, onFocus }) => {
  const [activeTab, setActiveTab] = useState<'cpu' | 'memory' | 'energy' | 'disk' | 'network'>('cpu');
  const [cpuUsage, setCpuUsage] = useState(32);
  const [memoryUsage, setMemoryUsage] = useState(68);
  const [diskUsage, setDiskUsage] = useState(45);
  const [networkIn, setNetworkIn] = useState(1.2);
  const [networkOut, setNetworkOut] = useState(0.4);
  const [cpuHistory, setCpuHistory] = useState<number[]>(Array(60).fill(0).map(() => Math.random() * 50 + 10));

  const [processes] = useState<ProcessInfo[]>([
    { pid: 1, name: 'kernel_task', cpu: 8.2, memory: 1024, threads: 156 },
    { pid: 245, name: 'Safari', cpu: 12.5, memory: 890, threads: 42 },
    { pid: 312, name: 'Terminal', cpu: 2.1, memory: 156, threads: 8 },
    { pid: 421, name: 'Finder', cpu: 1.8, memory: 234, threads: 12 },
    { pid: 523, name: 'Hanzo AI', cpu: 15.3, memory: 1250, threads: 24 },
    { pid: 612, name: 'Mail', cpu: 0.5, memory: 180, threads: 6 },
    { pid: 734, name: 'Messages', cpu: 0.3, memory: 145, threads: 5 },
    { pid: 845, name: 'Music', cpu: 3.2, memory: 320, threads: 14 },
    { pid: 956, name: 'Photos', cpu: 0.1, memory: 210, threads: 8 },
    { pid: 1067, name: 'Notes', cpu: 0.2, memory: 95, threads: 4 },
  ]);

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCpuUsage(prev => Math.max(5, Math.min(95, prev + (Math.random() - 0.5) * 10)));
      setMemoryUsage(prev => Math.max(40, Math.min(90, prev + (Math.random() - 0.5) * 5)));
      setNetworkIn(prev => Math.max(0, prev + (Math.random() - 0.5) * 0.5));
      setNetworkOut(prev => Math.max(0, prev + (Math.random() - 0.5) * 0.3));
      setCpuHistory(prev => [...prev.slice(1), Math.random() * 50 + 10]);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const tabs = [
    { id: 'cpu', label: 'CPU', icon: Cpu },
    { id: 'memory', label: 'Memory', icon: MemoryStick },
    { id: 'energy', label: 'Energy', icon: Zap },
    { id: 'disk', label: 'Disk', icon: HardDrive },
    { id: 'network', label: 'Network', icon: Wifi },
  ] as const;

  const renderGraph = () => {
    const max = Math.max(...cpuHistory);
    return (
      <div className="h-28 flex items-end gap-px rounded-xl p-3 bg-black/40 backdrop-blur-md border border-white/[0.08] shadow-inner">
        {cpuHistory.map((value, i) => (
          <div
            key={i}
            className="flex-1 rounded-t transition-all duration-200"
            style={{
              height: `${(value / max) * 100}%`,
              opacity: 0.4 + (i / cpuHistory.length) * 0.6,
              background: `linear-gradient(to top, rgba(34, 197, 94, 0.8), rgba(74, 222, 128, 0.4))`,
            }}
          />
        ))}
      </div>
    );
  };

  const renderUsageBar = (label: string, value: number, gradient: string, details?: string) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-white/60 font-medium">{label}</span>
        <span className="text-white/90 font-semibold tabular-nums">{value.toFixed(1)}%</span>
      </div>
      <div className="h-2.5 bg-black/40 backdrop-blur-sm rounded-full overflow-hidden border border-white/[0.06]">
        <div
          className="h-full rounded-full transition-all duration-500 shadow-lg"
          style={{ width: `${value}%`, background: gradient }}
        />
      </div>
      {details && <p className="text-xs text-white/40">{details}</p>}
    </div>
  );

  return (
    <ZWindow
      title="Activity Monitor"
      onClose={onClose}
      onFocus={onFocus}
      initialPosition={{ x: 150, y: 100 }}
      initialSize={{ width: 800, height: 600 }}
    >
      <div className="flex flex-col h-full bg-black/80 backdrop-blur-2xl">
        {/* Glass Tabs */}
        <div className="flex border-b border-white/[0.08] bg-black/40 backdrop-blur-xl">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all duration-200 relative",
                activeTab === tab.id
                  ? "text-white"
                  : "text-white/40 hover:text-white/60 hover:bg-white/[0.04]"
              )}
            >
              <tab.icon className={cn(
                "w-4 h-4 transition-colors",
                activeTab === tab.id ? "text-cyan-400" : ""
              )} />
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-500 to-blue-500" />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Stats panel with glass effect */}
          <div className="p-5 border-b border-white/[0.08] bg-black/30 backdrop-blur-xl">
            {activeTab === 'cpu' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white/60 text-sm font-medium mb-1">CPU Usage</h3>
                    <p className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
                      {cpuUsage.toFixed(1)}%
                    </p>
                  </div>
                  <div className="text-right text-sm space-y-1">
                    <p className="text-white/40">System: <span className="text-white/70 tabular-nums">{(cpuUsage * 0.3).toFixed(1)}%</span></p>
                    <p className="text-white/40">User: <span className="text-white/70 tabular-nums">{(cpuUsage * 0.7).toFixed(1)}%</span></p>
                  </div>
                </div>
                {renderGraph()}
              </div>
            )}
            {activeTab === 'memory' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white/60 text-sm font-medium mb-1">Memory Pressure</h3>
                    <p className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                      {memoryUsage.toFixed(0)}%
                    </p>
                  </div>
                  <div className="text-right text-sm space-y-1">
                    <p className="text-white/40">Physical Memory: <span className="text-white/70">16 GB</span></p>
                    <p className="text-white/40">Used: <span className="text-white/70 tabular-nums">{(16 * memoryUsage / 100).toFixed(1)} GB</span></p>
                  </div>
                </div>
                {renderUsageBar('App Memory', memoryUsage * 0.6, 'linear-gradient(to right, #3b82f6, #60a5fa)')}
                {renderUsageBar('Wired Memory', memoryUsage * 0.25, 'linear-gradient(to right, #f59e0b, #fbbf24)')}
                {renderUsageBar('Cached Files', memoryUsage * 0.15, 'linear-gradient(to right, #22c55e, #4ade80)')}
              </div>
            )}
            {activeTab === 'energy' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white/60 text-sm font-medium mb-1">Energy Impact</h3>
                    <p className="text-sm text-white/40">Last 12 hours</p>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    <span className="text-lg font-bold text-yellow-400">Low</span>
                  </div>
                </div>
                {renderUsageBar('Average Energy Impact', 35, 'linear-gradient(to right, #f59e0b, #fcd34d)', 'Battery remaining: 4:32')}
              </div>
            )}
            {activeTab === 'disk' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white/60 text-sm font-medium mb-1">Disk Activity</h3>
                  </div>
                  <div className="text-right text-sm space-y-1">
                    <p className="text-white/40">Read: <span className="text-green-400 tabular-nums">12.5 MB/s</span></p>
                    <p className="text-white/40">Write: <span className="text-blue-400 tabular-nums">4.2 MB/s</span></p>
                  </div>
                </div>
                {renderUsageBar('Disk Usage', diskUsage, 'linear-gradient(to right, #a855f7, #c084fc)', '256 GB available of 512 GB')}
              </div>
            )}
            {activeTab === 'network' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white/60 text-sm font-medium mb-1">Network Activity</h3>
                  </div>
                  <div className="text-right text-sm space-y-1">
                    <p className="text-green-400 font-medium tabular-nums">↓ {networkIn.toFixed(2)} MB/s</p>
                    <p className="text-blue-400 font-medium tabular-nums">↑ {networkOut.toFixed(2)} MB/s</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-black/40 backdrop-blur-md border border-white/[0.08]">
                    <p className="text-xs text-white/40 mb-2">Data Received</p>
                    <p className="text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent tabular-nums">1.45 GB</p>
                  </div>
                  <div className="p-4 rounded-xl bg-black/40 backdrop-blur-md border border-white/[0.08]">
                    <p className="text-xs text-white/40 mb-2">Data Sent</p>
                    <p className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent tabular-nums">284 MB</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Process list with glass effect */}
          <div className="flex-1 overflow-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-black/60 backdrop-blur-xl border-b border-white/[0.06]">
                <tr>
                  <th className="text-left p-3 font-medium text-white/50">Process Name</th>
                  <th className="text-right p-3 font-medium text-white/50">PID</th>
                  <th className="text-right p-3 font-medium text-white/50">% CPU</th>
                  <th className="text-right p-3 font-medium text-white/50">Memory</th>
                  <th className="text-right p-3 font-medium text-white/50">Threads</th>
                </tr>
              </thead>
              <tbody>
                {processes
                  .sort((a, b) => b.cpu - a.cpu)
                  .map((process, index) => (
                    <tr
                      key={process.pid}
                      className={cn(
                        "border-b border-white/[0.04] transition-colors hover:bg-white/[0.04]",
                        index % 2 === 0 ? "bg-black/20" : "bg-transparent"
                      )}
                    >
                      <td className="p-3 text-white/90 font-medium">{process.name}</td>
                      <td className="p-3 text-right text-white/40 tabular-nums">{process.pid}</td>
                      <td className="p-3 text-right tabular-nums">
                        <span className={cn(
                          "px-2 py-0.5 rounded-md text-xs font-semibold",
                          process.cpu > 10 
                            ? "bg-red-500/20 text-red-400 border border-red-500/30" 
                            : process.cpu > 5 
                              ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30" 
                              : "bg-green-500/20 text-green-400 border border-green-500/30"
                        )}>
                          {process.cpu.toFixed(1)}
                        </span>
                      </td>
                      <td className="p-3 text-right text-white/60 tabular-nums">{process.memory} MB</td>
                      <td className="p-3 text-right text-white/40 tabular-nums">{process.threads}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Footer with glass effect */}
          <div className="flex items-center justify-between p-3 border-t border-white/[0.08] bg-black/40 backdrop-blur-xl text-xs">
            <span className="text-white/40">{processes.length} processes</span>
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-2 text-white/50">
                <Activity className="w-3 h-3 text-green-400" />
                CPU: <span className="text-white/70 tabular-nums">{cpuUsage.toFixed(0)}%</span>
              </span>
              <span className="flex items-center gap-2 text-white/50">
                <MemoryStick className="w-3 h-3 text-blue-400" />
                Memory: <span className="text-white/70 tabular-nums">{memoryUsage.toFixed(0)}%</span>
              </span>
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
 * Activity Monitor app manifest
 */
export const ActivityMonitorManifest = {
  identifier: 'ai.hanzo.activity-monitor',
  name: 'Activity Monitor',
  version: '1.0.0',
  description: 'System activity monitor for zOS',
  category: 'utilities' as const,
  permissions: ['system'] as const,
  window: {
    type: 'default' as const,
    defaultSize: { width: 800, height: 600 },
    resizable: true,
    showInDock: true,
  },
};

/**
 * Activity Monitor menu bar configuration
 */
export const ActivityMonitorMenuBar = {
  menus: [
    {
      id: 'file',
      label: 'File',
      items: [
        { type: 'item' as const, id: 'sampleProcess', label: 'Sample Process...', shortcut: '⌥⌘S' },
        { type: 'item' as const, id: 'runSpindump', label: 'Run Spindump...' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'close', label: 'Close', shortcut: '⌘W' },
      ],
    },
    {
      id: 'edit',
      label: 'Edit',
      items: [
        { type: 'item' as const, id: 'copy', label: 'Copy', shortcut: '⌘C' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'selectAll', label: 'Select All', shortcut: '⌘A' },
      ],
    },
    {
      id: 'view',
      label: 'View',
      items: [
        { type: 'item' as const, id: 'allProcesses', label: 'All Processes', shortcut: '⌘1' },
        { type: 'item' as const, id: 'myProcesses', label: 'My Processes', shortcut: '⌘2' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'showCPU', label: 'CPU' },
        { type: 'item' as const, id: 'showMemory', label: 'Memory' },
        { type: 'item' as const, id: 'showEnergy', label: 'Energy' },
        { type: 'item' as const, id: 'showDisk', label: 'Disk' },
        { type: 'item' as const, id: 'showNetwork', label: 'Network' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'updateFrequency', label: 'Update Frequency' },
      ],
    },
    {
      id: 'window',
      label: 'Window',
      items: [
        { type: 'item' as const, id: 'minimize', label: 'Minimize', shortcut: '⌘M' },
        { type: 'item' as const, id: 'zoom', label: 'Zoom' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'cpuHistory', label: 'CPU History', shortcut: '⌘3' },
        { type: 'item' as const, id: 'cpuUsage', label: 'CPU Usage', shortcut: '⌘4' },
      ],
    },
    {
      id: 'help',
      label: 'Help',
      items: [
        { type: 'item' as const, id: 'activityMonitorHelp', label: 'Activity Monitor Help' },
      ],
    },
  ],
};

/**
 * Activity Monitor dock configuration
 */
export const ActivityMonitorDockConfig = {
  contextMenu: [
    { type: 'item' as const, id: 'showCPUHistory', label: 'Show CPU History' },
    { type: 'separator' as const },
    { type: 'item' as const, id: 'options', label: 'Options' },
  ],
};

/**
 * Activity Monitor App definition for registry
 */
export const ActivityMonitorApp = {
  manifest: ActivityMonitorManifest,
  component: ActivityMonitorWindow,
  icon: ActivitySquare,
  menuBar: ActivityMonitorMenuBar,
  dockConfig: ActivityMonitorDockConfig,
};

export default ActivityMonitorWindow;
