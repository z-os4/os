/**
 * Console App
 *
 * System log viewer for zOS following macOS Console patterns.
 * Black glass UI with backdrop blur and glass morphism.
 */

import React, { useState, useEffect, useRef } from 'react';
import { ZWindow } from '@z-os/ui';
import {
  ScrollText, AlertCircle, AlertTriangle, Info, XCircle,
  Monitor, AppWindow, Trash2, Download, Search, ArrowDown,
  Filter, Clock, ChevronRight
} from 'lucide-react';
import { cn } from '@z-os/ui';

interface ConsoleWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

type LogType = 'info' | 'warning' | 'error' | 'fault';

interface LogEntry {
  id: string;
  timestamp: Date;
  process: string;
  type: LogType;
  message: string;
  subsystem?: string;
}

// Mock system processes
const systemProcesses = [
  'kernel_task', 'launchd', 'WindowServer', 'loginwindow',
  'Finder', 'Dock', 'SystemUIServer', 'Safari', 'Terminal',
  'Mail', 'Messages', 'Calendar', 'Notes', 'Music',
  'HanzoAI', 'netbiosd', 'mDNSResponder', 'bluetoothd',
  'coreaudiod', 'diskarbitrationd', 'configd', 'powerd'
];

// Generate mock log messages
const generateMockMessage = (process: string, type: LogType): string => {
  const messages: Record<LogType, string[]> = {
    info: [
      'Service started successfully',
      'Connection established',
      'Configuration loaded',
      'Cache refreshed',
      'Synchronization complete',
      'Network interface up',
      'Process spawned',
      'Memory allocated',
      'File descriptor opened',
      'Event loop started',
    ],
    warning: [
      'High memory usage detected',
      'Connection timeout, retrying...',
      'Deprecated API usage detected',
      'Rate limit approaching',
      'Certificate expires in 30 days',
      'Disk space running low',
      'Thread pool exhausted',
      'Slow query detected',
    ],
    error: [
      'Failed to connect to server',
      'Permission denied',
      'Resource not found',
      'Invalid configuration',
      'Authentication failed',
      'Socket connection refused',
      'Database query failed',
      'File not found',
    ],
    fault: [
      'Critical system failure',
      'Kernel panic detected',
      'Memory corruption',
      'Hardware error detected',
      'Fatal exception occurred',
    ],
  };

  const typeMessages = messages[type];
  return `[${process}] ${typeMessages[Math.floor(Math.random() * typeMessages.length)]}`;
};

// Generate initial mock logs
const generateMockLogs = (count: number): LogEntry[] => {
  const logs: LogEntry[] = [];
  const now = Date.now();

  for (let i = 0; i < count; i++) {
    const types: LogType[] = ['info', 'info', 'info', 'info', 'warning', 'warning', 'error', 'fault'];
    const type = types[Math.floor(Math.random() * types.length)];
    const process = systemProcesses[Math.floor(Math.random() * systemProcesses.length)];

    logs.push({
      id: `log-${i}`,
      timestamp: new Date(now - (count - i) * 1000 * Math.random() * 10),
      process,
      type,
      message: generateMockMessage(process, type),
      subsystem: Math.random() > 0.7 ? 'com.apple.system' : undefined,
    });
  }

  return logs.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
};

const ConsoleWindow: React.FC<ConsoleWindowProps> = ({ onClose, onFocus }) => {
  const [logs, setLogs] = useState<LogEntry[]>(() => generateMockLogs(100));
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [processFilter, setProcessFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<LogType | ''>('');
  const [autoScroll, setAutoScroll] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Generate new logs periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const types: LogType[] = ['info', 'info', 'info', 'warning', 'error'];
      const type = types[Math.floor(Math.random() * types.length)];
      const process = systemProcesses[Math.floor(Math.random() * systemProcesses.length)];

      const newLog: LogEntry = {
        id: `log-${Date.now()}`,
        timestamp: new Date(),
        process,
        type,
        message: generateMockMessage(process, type),
      };

      setLogs(prev => [...prev.slice(-499), newLog]);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const categories = [
    { id: 'all', label: 'All Messages', icon: ScrollText, count: logs.length },
    { id: 'errors', label: 'Errors', icon: AlertCircle, count: logs.filter(l => l.type === 'error').length },
    { id: 'faults', label: 'Faults', icon: XCircle, count: logs.filter(l => l.type === 'fault').length },
    { id: 'system', label: 'System', icon: Monitor, count: logs.filter(l => ['kernel_task', 'launchd', 'WindowServer'].includes(l.process)).length },
    { id: 'apps', label: 'Apps', icon: AppWindow, count: logs.filter(l => !['kernel_task', 'launchd', 'WindowServer', 'loginwindow'].includes(l.process)).length },
  ];

  const getTypeIcon = (type: LogType) => {
    switch (type) {
      case 'info': return <Info className="w-4 h-4 text-blue-400/80" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-400/90" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-400/90" />;
      case 'fault': return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getTypeColor = (type: LogType) => {
    switch (type) {
      case 'info': return 'text-white/60';
      case 'warning': return 'text-yellow-300/90';
      case 'error': return 'text-red-400/90';
      case 'fault': return 'text-red-500 font-medium';
    }
  };

  const filteredLogs = logs.filter(log => {
    // Category filter
    if (selectedCategory === 'errors' && log.type !== 'error') return false;
    if (selectedCategory === 'faults' && log.type !== 'fault') return false;
    if (selectedCategory === 'system' && !['kernel_task', 'launchd', 'WindowServer'].includes(log.process)) return false;
    if (selectedCategory === 'apps' && ['kernel_task', 'launchd', 'WindowServer', 'loginwindow'].includes(log.process)) return false;

    // Search filter
    if (searchQuery && !log.message.toLowerCase().includes(searchQuery.toLowerCase())) return false;

    // Process filter
    if (processFilter && log.process !== processFilter) return false;

    // Type filter
    if (typeFilter && log.type !== typeFilter) return false;

    return true;
  });

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatFullDate = (date: Date) => {
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  const clearLogs = () => {
    setLogs([]);
    setSelectedLog(null);
  };

  const exportLogs = () => {
    const content = filteredLogs
      .map(log => `[${formatFullDate(log.timestamp)}] [${log.type.toUpperCase()}] ${log.process}: ${log.message}`)
      .join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `console-logs-${new Date().toISOString().split('T')[0]}.log`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const uniqueProcesses = [...new Set(logs.map(l => l.process))].sort();

  return (
    <ZWindow
      title="Console"
      onClose={onClose}
      onFocus={onFocus}
      initialPosition={{ x: 100, y: 80 }}
      initialSize={{ width: 1000, height: 650 }}
      windowType="system"
    >
      <div className="flex h-full bg-black/80">
        {/* Sidebar - Glass with backdrop blur */}
        <div className="w-48 bg-white/[0.03] backdrop-blur-xl border-r border-white/[0.08] flex flex-col">
          <div className="p-3 border-b border-white/[0.06]">
            <span className="text-[10px] text-white/40 uppercase tracking-widest font-medium">Categories</span>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 rounded-md text-[13px] transition-all duration-150",
                  selectedCategory === category.id
                    ? "bg-white/[0.08] text-white/90 shadow-sm"
                    : "text-white/50 hover:bg-white/[0.04] hover:text-white/70"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <category.icon className={cn(
                    "w-4 h-4",
                    selectedCategory === category.id ? "text-blue-400/90" : "text-white/40"
                  )} />
                  <span>{category.label}</span>
                </div>
                <span className="text-[11px] text-white/30 tabular-nums">{category.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar - Glass morphism filter bar */}
          <div className="flex items-center gap-2 p-2 border-b border-white/[0.06] bg-white/[0.02] backdrop-blur-md">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search logs..."
                className="w-full pl-9 pr-3 py-1.5 bg-white/[0.04] border border-white/[0.08] rounded-md text-[13px] text-white/80 placeholder:text-white/25 focus:outline-none focus:border-white/20 focus:bg-white/[0.06] transition-all font-mono"
              />
            </div>

            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "p-2 rounded-md transition-all duration-150",
                showFilters 
                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" 
                  : "hover:bg-white/[0.06] text-white/40 hover:text-white/60 border border-transparent"
              )}
              title="Filters"
            >
              <Filter className="w-4 h-4" />
            </button>

            {/* Auto-scroll toggle */}
            <button
              onClick={() => setAutoScroll(!autoScroll)}
              className={cn(
                "p-2 rounded-md transition-all duration-150",
                autoScroll 
                  ? "bg-green-500/15 text-green-400 border border-green-500/25" 
                  : "hover:bg-white/[0.06] text-white/40 hover:text-white/60 border border-transparent"
              )}
              title={autoScroll ? "Auto-scroll on" : "Auto-scroll off"}
            >
              <ArrowDown className="w-4 h-4" />
            </button>

            {/* Clear */}
            <button
              onClick={clearLogs}
              className="p-2 hover:bg-white/[0.06] rounded-md transition-all duration-150 text-white/40 hover:text-red-400 border border-transparent"
              title="Clear logs"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {/* Export */}
            <button
              onClick={exportLogs}
              className="p-2 hover:bg-white/[0.06] rounded-md transition-all duration-150 text-white/40 hover:text-white/70 border border-transparent"
              title="Export logs"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>

          {/* Filters row - Glass morphism */}
          {showFilters && (
            <div className="flex items-center gap-6 px-3 py-2 border-b border-white/[0.06] bg-white/[0.02] backdrop-blur-md">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-white/40 uppercase tracking-wide">Process</span>
                <select
                  value={processFilter}
                  onChange={(e) => setProcessFilter(e.target.value)}
                  className="bg-white/[0.04] border border-white/[0.08] rounded-md px-2.5 py-1 text-[12px] text-white/70 focus:outline-none focus:border-white/20 font-mono cursor-pointer"
                >
                  <option value="">All</option>
                  {uniqueProcesses.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-white/40 uppercase tracking-wide">Type</span>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as LogType | '')}
                  className="bg-white/[0.04] border border-white/[0.08] rounded-md px-2.5 py-1 text-[12px] text-white/70 focus:outline-none focus:border-white/20 font-mono cursor-pointer"
                >
                  <option value="">All</option>
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                  <option value="fault">Fault</option>
                </select>
              </div>
            </div>
          )}

          {/* Log entries - Monospace light text */}
          <div
            ref={logContainerRef}
            className="flex-1 overflow-auto font-mono text-[12px] bg-black/40"
          >
            <table className="w-full">
              <thead className="sticky top-0 bg-black/70 backdrop-blur-sm text-white/40 border-b border-white/[0.06]">
                <tr>
                  <th className="text-left px-3 py-2 font-medium w-20 text-[11px] uppercase tracking-wide">Time</th>
                  <th className="text-left px-2 py-2 font-medium w-6"></th>
                  <th className="text-left px-2 py-2 font-medium w-32 text-[11px] uppercase tracking-wide">Process</th>
                  <th className="text-left px-3 py-2 font-medium text-[11px] uppercase tracking-wide">Message</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map(log => (
                  <tr
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className={cn(
                      "border-b border-white/[0.03] cursor-pointer transition-all duration-100",
                      selectedLog?.id === log.id 
                        ? "bg-blue-500/15" 
                        : "hover:bg-white/[0.03]"
                    )}
                  >
                    <td className="px-3 py-1.5 text-white/35 tabular-nums">{formatTime(log.timestamp)}</td>
                    <td className="px-2 py-1.5">{getTypeIcon(log.type)}</td>
                    <td className="px-2 py-1.5 text-purple-400/80">{log.process}</td>
                    <td className={cn("px-3 py-1.5", getTypeColor(log.type))}>{log.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredLogs.length === 0 && (
              <div className="flex items-center justify-center h-32 text-white/25 text-[13px]">
                No log entries match your filters
              </div>
            )}
          </div>

          {/* Detail panel - Glass morphism */}
          {selectedLog && (
            <div className="border-t border-white/[0.06] bg-white/[0.02] backdrop-blur-md p-3">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-0.5">
                  {getTypeIcon(selectedLog.type)}
                </div>
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-4 text-[11px]">
                    <span className="text-white/40 flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      {formatFullDate(selectedLog.timestamp)}
                    </span>
                    <span className="text-purple-400/80 font-mono">{selectedLog.process}</span>
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[10px] uppercase tracking-wide font-medium",
                      selectedLog.type === 'info' && "bg-blue-500/15 text-blue-400/80 border border-blue-500/20",
                      selectedLog.type === 'warning' && "bg-yellow-500/15 text-yellow-400/90 border border-yellow-500/20",
                      selectedLog.type === 'error' && "bg-red-500/15 text-red-400/90 border border-red-500/20",
                      selectedLog.type === 'fault' && "bg-red-600/20 text-red-500 border border-red-500/25"
                    )}>
                      {selectedLog.type}
                    </span>
                  </div>
                  <p className="text-[13px] text-white/70 font-mono leading-relaxed">{selectedLog.message}</p>
                  {selectedLog.subsystem && (
                    <p className="text-[11px] text-white/30 font-mono">Subsystem: {selectedLog.subsystem}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Status bar - Subtle glass */}
          <div className="flex items-center justify-between px-3 py-1.5 border-t border-white/[0.06] bg-white/[0.02] text-[11px] text-white/40 font-mono">
            <span className="tabular-nums">{filteredLogs.length} entries</span>
            <div className="flex items-center gap-3">
              {autoScroll && (
                <span className="flex items-center gap-1.5 text-green-400/70">
                  <ArrowDown className="w-3 h-3" />
                  Auto-scroll
                </span>
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
 * Console app manifest
 */
export const ConsoleManifest = {
  identifier: 'ai.hanzo.console',
  name: 'Console',
  version: '1.0.0',
  description: 'System log viewer for zOS',
  category: 'utilities' as const,
  permissions: ['system'] as const,
  window: {
    type: 'system' as const,
    defaultSize: { width: 1000, height: 650 },
    resizable: true,
    showInDock: true,
  },
};

/**
 * Console menu bar configuration
 */
export const ConsoleMenuBar = {
  menus: [
    {
      id: 'file',
      label: 'File',
      items: [
        { type: 'item' as const, id: 'newQuery', label: 'New Query', shortcut: '⌘N' },
        { type: 'item' as const, id: 'saveQuery', label: 'Save Query...', shortcut: '⌘S' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'export', label: 'Export...', shortcut: '⌘E' },
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
        { type: 'separator' as const },
        { type: 'item' as const, id: 'find', label: 'Find...', shortcut: '⌘F' },
      ],
    },
    {
      id: 'view',
      label: 'View',
      items: [
        { type: 'item' as const, id: 'allMessages', label: 'All Messages' },
        { type: 'item' as const, id: 'errors', label: 'Errors Only' },
        { type: 'item' as const, id: 'faults', label: 'Faults Only' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'clear', label: 'Clear', shortcut: '⌘K' },
      ],
    },
    {
      id: 'action',
      label: 'Action',
      items: [
        { type: 'item' as const, id: 'startStreaming', label: 'Start Streaming' },
        { type: 'item' as const, id: 'pauseStreaming', label: 'Pause Streaming' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'includeInfoMessages', label: 'Include Info Messages' },
        { type: 'item' as const, id: 'includeDebugMessages', label: 'Include Debug Messages' },
      ],
    },
    {
      id: 'window',
      label: 'Window',
      items: [
        { type: 'item' as const, id: 'minimize', label: 'Minimize', shortcut: '⌘M' },
        { type: 'item' as const, id: 'zoom', label: 'Zoom' },
      ],
    },
    {
      id: 'help',
      label: 'Help',
      items: [
        { type: 'item' as const, id: 'consoleHelp', label: 'Console Help' },
      ],
    },
  ],
};

/**
 * Console dock configuration
 */
export const ConsoleDockConfig = {
  contextMenu: [
    { type: 'item' as const, id: 'showAllMessages', label: 'Show All Messages' },
    { type: 'item' as const, id: 'clearConsole', label: 'Clear Console' },
    { type: 'separator' as const },
    { type: 'item' as const, id: 'options', label: 'Options' },
  ],
};

/**
 * Console App definition for registry
 */
export const ConsoleApp = {
  manifest: ConsoleManifest,
  component: ConsoleWindow,
  icon: ScrollText,
  menuBar: ConsoleMenuBar,
  dockConfig: ConsoleDockConfig,
};

export default ConsoleWindow;
