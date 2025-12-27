/**
 * Finder App
 *
 * File browser for zOS following macOS Finder patterns.
 * Includes Quick Look integration for file previews.
 * Unified black glass UI with glassmorphism design.
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { ZWindow, QuickLookOverlay } from '@z-os/ui';
import type { QuickLookFile, FileType } from '@z-os/ui';
import {
  Folder,
  File,
  HardDrive,
  Image,
  Music,
  Video,
  Download,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Search,
  Grid,
  List,
  Columns,
  FileText,
  FileCode,
  FileImage,
  FileVideo,
  FileAudio,
} from 'lucide-react';
import {
  EXTENSION_TYPE_MAP,
  MIME_TYPE_MAP,
} from '@z-os/core';

// ============================================================================
// Types
// ============================================================================

interface FinderWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

interface FileItem {
  id: string;
  name: string;
  type: 'folder' | 'file';
  modified: string;
  size?: string;
  sizeBytes?: number;
  extension?: string;
  path?: string;
  content?: string;
}

type ViewMode = 'icons' | 'list' | 'columns';

// ============================================================================
// File Type Detection
// ============================================================================

function getFileType(file: QuickLookFile): FileType {
  if (file.mimeType && MIME_TYPE_MAP[file.mimeType]) {
    return MIME_TYPE_MAP[file.mimeType];
  }

  const extension = file.name.split('.').pop()?.toLowerCase();
  if (extension && EXTENSION_TYPE_MAP[extension]) {
    return EXTENSION_TYPE_MAP[extension];
  }

  return 'unknown';
}

function getFileIcon(file: FileItem) {
  if (file.type === 'folder') return Folder;

  const ext = file.extension?.toLowerCase() || file.name.split('.').pop()?.toLowerCase() || '';

  // Images
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext)) {
    return FileImage;
  }

  // Videos
  if (['mp4', 'webm', 'mov', 'avi', 'mkv'].includes(ext)) {
    return FileVideo;
  }

  // Audio
  if (['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a'].includes(ext)) {
    return FileAudio;
  }

  // Code
  if (['js', 'jsx', 'ts', 'tsx', 'py', 'rb', 'go', 'rs', 'java', 'c', 'cpp', 'h', 'sh'].includes(ext)) {
    return FileCode;
  }

  // Text/Documents
  if (['txt', 'md', 'json', 'yaml', 'yml', 'xml', 'html', 'css'].includes(ext)) {
    return FileText;
  }

  return File;
}

// Convert FileItem to QuickLookFile
function toQuickLookFile(item: FileItem): QuickLookFile {
  return {
    id: item.id,
    name: item.name,
    path: item.path || `/files/${item.name}`,
    size: item.sizeBytes,
    modified: item.modified ? new Date(item.modified) : undefined,
    content: item.content,
  };
}

// ============================================================================
// Sample Data
// ============================================================================

const sampleFiles: FileItem[] = [
  { id: '1', name: 'Applications', type: 'folder', modified: 'Oct 24, 2024' },
  { id: '2', name: 'Documents', type: 'folder', modified: 'Dec 20, 2024' },
  { id: '3', name: 'Downloads', type: 'folder', modified: 'Dec 25, 2024' },
  { id: '4', name: 'Desktop', type: 'folder', modified: 'Dec 24, 2024' },
  { id: '5', name: 'Pictures', type: 'folder', modified: 'Nov 15, 2024' },
  { id: '6', name: 'Music', type: 'folder', modified: 'Sep 10, 2024' },
  { id: '7', name: 'Movies', type: 'folder', modified: 'Aug 5, 2024' },
  {
    id: '8',
    name: 'readme.md',
    type: 'file',
    modified: 'Dec 25, 2024',
    size: '2.4 KB',
    sizeBytes: 2458,
    extension: 'md',
    content: `# Welcome to zOS

A beautiful web-based operating system experience.

## Features

- Window management
- File browser (Finder)
- Quick Look preview
- Multiple applications
- Dark theme

## Quick Look

Press **Space** on a selected file to preview it.

- Use **Arrow keys** to navigate between files
- Press **Escape** or **Space** again to close
- Press **Cmd+F** for fullscreen

Enjoy!
`,
  },
  {
    id: '9',
    name: 'config.json',
    type: 'file',
    modified: 'Dec 24, 2024',
    size: '512 B',
    sizeBytes: 512,
    extension: 'json',
    content: `{
  "name": "z-os",
  "version": "1.0.0",
  "theme": "dark",
  "features": {
    "quickLook": true,
    "dock": true,
    "menuBar": true
  }
}`,
  },
  {
    id: '10',
    name: 'script.ts',
    type: 'file',
    modified: 'Dec 23, 2024',
    size: '1.8 KB',
    sizeBytes: 1843,
    extension: 'ts',
    content: `/**
 * Example TypeScript file
 */

interface User {
  id: string;
  name: string;
  email: string;
}

async function fetchUsers(): Promise<User[]> {
  const response = await fetch('/api/users');
  return response.json();
}

export { fetchUsers };
export type { User };
`,
  },
  {
    id: '11',
    name: 'photo.jpg',
    type: 'file',
    modified: 'Dec 22, 2024',
    size: '2.1 MB',
    sizeBytes: 2202009,
    extension: 'jpg',
    path: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200',
  },
  {
    id: '12',
    name: 'landscape.png',
    type: 'file',
    modified: 'Dec 21, 2024',
    size: '3.4 MB',
    sizeBytes: 3565158,
    extension: 'png',
    path: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200',
  },
  {
    id: '13',
    name: 'notes.txt',
    type: 'file',
    modified: 'Dec 20, 2024',
    size: '856 B',
    sizeBytes: 856,
    extension: 'txt',
    content: `Quick notes from today's meeting:

1. Review Quick Look implementation
2. Test keyboard navigation
3. Add more file type support
4. Improve animations

TODO:
- [ ] Audio waveform visualization
- [ ] PDF page navigation
- [ ] Video thumbnail generation
`,
  },
];

// ============================================================================
// Finder Window Component
// ============================================================================

const FinderWindow: React.FC<FinderWindowProps> = ({ onClose, onFocus }) => {
  const [selectedItem, setSelectedItem] = useState<string | null>('desktop');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('icons');
  const [searchQuery, setSearchQuery] = useState('');
  const [history, setHistory] = useState<string[]>(['desktop']);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Quick Look state
  const [quickLookOpen, setQuickLookOpen] = useState(false);
  const [quickLookFile, setQuickLookFile] = useState<QuickLookFile | null>(null);
  const [quickLookIndex, setQuickLookIndex] = useState(0);
  const [quickLookFullscreen, setQuickLookFullscreen] = useState(false);

  const sidebarItems = [
    { id: 'favorites', label: 'Favorites', icon: null, isHeader: true },
    { id: 'airdrop', label: 'AirDrop', icon: HardDrive },
    { id: 'recents', label: 'Recents', icon: File },
    { id: 'applications', label: 'Applications', icon: Folder },
    { id: 'desktop', label: 'Desktop', icon: Folder },
    { id: 'documents', label: 'Documents', icon: Folder },
    { id: 'downloads', label: 'Downloads', icon: Download },
    { id: 'pictures', label: 'Pictures', icon: Image },
    { id: 'music', label: 'Music', icon: Music },
    { id: 'movies', label: 'Movies', icon: Video },
    { id: 'icloud', label: 'iCloud Drive', icon: null, isHeader: true },
    { id: 'icloud-drive', label: 'iCloud Drive', icon: HardDrive },
    { id: 'locations', label: 'Locations', icon: null, isHeader: true },
    { id: 'macintosh-hd', label: 'Macintosh HD', icon: HardDrive },
    { id: 'network', label: 'Network', icon: HardDrive },
    { id: 'tags', label: 'Tags', icon: null, isHeader: true },
    { id: 'trash', label: 'Trash', icon: Trash2 },
  ];

  const filteredFiles = useMemo(() => {
    return searchQuery
      ? sampleFiles.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
      : sampleFiles;
  }, [searchQuery]);

  // Get list of previewable files for Quick Look navigation
  const previewableFiles = useMemo(() => {
    return filteredFiles.filter(f => f.type === 'file').map(toQuickLookFile);
  }, [filteredFiles]);

  const navigate = useCallback((itemId: string) => {
    setSelectedItem(itemId);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(itemId);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const goBack = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setSelectedItem(history[historyIndex - 1]);
    }
  }, [history, historyIndex]);

  const goForward = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setSelectedItem(history[historyIndex + 1]);
    }
  }, [history, historyIndex]);

  // Handle file selection
  const handleFileClick = useCallback((file: FileItem) => {
    setSelectedFile(file.id);
  }, []);

  // Handle file double-click (open)
  const handleFileDoubleClick = useCallback((file: FileItem) => {
    if (file.type === 'folder') {
      navigate(file.id);
    } else {
      // Open file - for now just show Quick Look
      const qlFile = toQuickLookFile(file);
      const index = previewableFiles.findIndex(f => f.id === file.id);
      setQuickLookFile(qlFile);
      setQuickLookIndex(index >= 0 ? index : 0);
      setQuickLookOpen(true);
    }
  }, [navigate, previewableFiles]);

  // Quick Look handlers
  const showQuickLook = useCallback((file: FileItem) => {
    if (file.type === 'folder') return;

    const qlFile = toQuickLookFile(file);
    const index = previewableFiles.findIndex(f => f.id === file.id);
    setQuickLookFile(qlFile);
    setQuickLookIndex(index >= 0 ? index : 0);
    setQuickLookOpen(true);
  }, [previewableFiles]);

  const hideQuickLook = useCallback(() => {
    setQuickLookOpen(false);
    setQuickLookFullscreen(false);
  }, []);

  const nextQuickLookFile = useCallback(() => {
    if (quickLookIndex < previewableFiles.length - 1) {
      const newIndex = quickLookIndex + 1;
      setQuickLookIndex(newIndex);
      setQuickLookFile(previewableFiles[newIndex]);
    }
  }, [quickLookIndex, previewableFiles]);

  const prevQuickLookFile = useCallback(() => {
    if (quickLookIndex > 0) {
      const newIndex = quickLookIndex - 1;
      setQuickLookIndex(newIndex);
      setQuickLookFile(previewableFiles[newIndex]);
    }
  }, [quickLookIndex, previewableFiles]);

  const toggleQuickLookFullscreen = useCallback(() => {
    setQuickLookFullscreen(prev => !prev);
  }, []);

  // Keyboard handler for Quick Look
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Space to toggle Quick Look on selected file
      if (e.key === ' ' && !quickLookOpen && selectedFile) {
        e.preventDefault();
        const file = filteredFiles.find(f => f.id === selectedFile);
        if (file && file.type === 'file') {
          showQuickLook(file);
        }
      }

      // Quick Look keyboard navigation is handled by the overlay itself
      // but we need to sync state if arrows are pressed
      if (quickLookOpen) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault();
          nextQuickLookFile();
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          prevQuickLookFile();
        } else if (e.key === 'Escape' || e.key === ' ') {
          e.preventDefault();
          hideQuickLook();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [quickLookOpen, selectedFile, filteredFiles, showQuickLook, hideQuickLook, nextQuickLookFile, prevQuickLookFile]);

  return (
    <>
      <ZWindow
        title="Finder"
        onClose={onClose}
        onFocus={onFocus}
        initialPosition={{ x: 80, y: 60 }}
        initialSize={{ width: 900, height: 550 }}
        windowType="default"
      >
        <div className="flex h-full bg-black/80 backdrop-blur-2xl">
          {/* Sidebar - Dark glass with transparency */}
          <div className="w-52 bg-black/60 backdrop-blur-xl border-r border-white/10 overflow-y-auto">
            <div className="p-2">
              {sidebarItems.map((item) => (
                item.isHeader ? (
                  <div key={item.id} className="px-3 py-1.5 text-[11px] font-semibold text-white/40 uppercase tracking-wider mt-4 first:mt-1">
                    {item.label}
                  </div>
                ) : (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md text-[13px] transition-all duration-150 ${
                      selectedItem === item.id
                        ? 'bg-white/15 text-white shadow-sm'
                        : 'text-white/70 hover:bg-white/8 hover:text-white/90'
                    }`}
                  >
                    {item.icon && <item.icon className={`w-4 h-4 ${selectedItem === item.id ? 'text-blue-400' : 'text-blue-400/80'}`} />}
                    <span>{item.label}</span>
                  </button>
                )
              ))}
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 flex flex-col bg-black/40">
            {/* Toolbar - Glass morphism */}
            <div className="h-11 flex items-center gap-2 px-3 border-b border-white/10 bg-black/30 backdrop-blur-xl">
              <button
                onClick={goBack}
                disabled={historyIndex === 0}
                className="p-1.5 rounded-md hover:bg-white/10 disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-white/60" />
              </button>
              <button
                onClick={goForward}
                disabled={historyIndex >= history.length - 1}
                className="p-1.5 rounded-md hover:bg-white/10 disabled:opacity-30 transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-white/60" />
              </button>

              <div className="flex-1" />

              {/* View mode buttons - Glass pill */}
              <div className="flex bg-white/8 backdrop-blur-md rounded-lg p-0.5 border border-white/5">
                <button
                  onClick={() => setViewMode('icons')}
                  className={`p-1.5 rounded-md transition-all ${viewMode === 'icons' ? 'bg-white/15 shadow-sm' : 'hover:bg-white/10'}`}
                >
                  <Grid className={`w-4 h-4 ${viewMode === 'icons' ? 'text-white/90' : 'text-white/50'}`} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white/15 shadow-sm' : 'hover:bg-white/10'}`}
                >
                  <List className={`w-4 h-4 ${viewMode === 'list' ? 'text-white/90' : 'text-white/50'}`} />
                </button>
                <button
                  onClick={() => setViewMode('columns')}
                  className={`p-1.5 rounded-md transition-all ${viewMode === 'columns' ? 'bg-white/15 shadow-sm' : 'hover:bg-white/10'}`}
                >
                  <Columns className={`w-4 h-4 ${viewMode === 'columns' ? 'text-white/90' : 'text-white/50'}`} />
                </button>
              </div>

              {/* Search - Glass input */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-48 h-7 pl-8 pr-3 rounded-lg bg-white/8 backdrop-blur-md border border-white/10 text-[13px] text-white placeholder-white/40 focus:outline-none focus:border-white/25 focus:bg-white/12 transition-all"
                />
              </div>
            </div>

            {/* File list - Dark glass background */}
            <div className="flex-1 overflow-auto p-4 bg-black/20">
              {viewMode === 'icons' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {filteredFiles.map((file) => {
                    const FileIcon = getFileIcon(file);
                    const isSelected = selectedFile === file.id;
                    return (
                      <button
                        key={file.id}
                        className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-150 ${
                          isSelected 
                            ? 'bg-white/15 shadow-lg ring-1 ring-white/20' 
                            : 'hover:bg-white/8'
                        }`}
                        onClick={() => handleFileClick(file)}
                        onDoubleClick={() => handleFileDoubleClick(file)}
                      >
                        <FileIcon className={`w-12 h-12 ${file.type === 'folder' ? 'text-blue-400' : 'text-white/60'}`} />
                        <span className="text-[12px] text-white/90 text-center leading-tight">{file.name}</span>
                      </button>
                    );
                  })}
                </div>
              )}
              {viewMode === 'list' && (
                <div className="bg-black/20 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-white/50 text-[11px] border-b border-white/10 bg-white/5">
                        <th className="py-2 px-3 font-medium">Name</th>
                        <th className="py-2 px-3 font-medium">Date Modified</th>
                        <th className="py-2 px-3 font-medium">Size</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredFiles.map((file) => {
                        const FileIcon = getFileIcon(file);
                        const isSelected = selectedFile === file.id;
                        return (
                          <tr
                            key={file.id}
                            className={`border-b border-white/5 cursor-pointer transition-colors ${
                              isSelected 
                                ? 'bg-white/15' 
                                : 'hover:bg-white/8'
                            }`}
                            onClick={() => handleFileClick(file)}
                            onDoubleClick={() => handleFileDoubleClick(file)}
                          >
                            <td className="py-2 px-3 flex items-center gap-2.5">
                              <FileIcon className={`w-4 h-4 ${file.type === 'folder' ? 'text-blue-400' : 'text-white/60'}`} />
                              <span className="text-[13px] text-white/90">{file.name}</span>
                            </td>
                            <td className="py-2 px-3 text-[12px] text-white/50">{file.modified}</td>
                            <td className="py-2 px-3 text-[12px] text-white/50">{file.size || '--'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              {viewMode === 'columns' && (
                <div className="flex h-full gap-px rounded-xl overflow-hidden border border-white/10">
                  <div className="w-52 bg-black/30 backdrop-blur-md p-2 border-r border-white/10">
                    {filteredFiles.map((file) => {
                      const FileIcon = getFileIcon(file);
                      const isSelected = selectedFile === file.id;
                      return (
                        <button
                          key={file.id}
                          className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[13px] transition-all ${
                            isSelected 
                              ? 'bg-white/15 text-white shadow-sm' 
                              : 'text-white/80 hover:bg-white/8'
                          }`}
                          onClick={() => handleFileClick(file)}
                          onDoubleClick={() => handleFileDoubleClick(file)}
                        >
                          <FileIcon className={`w-4 h-4 ${file.type === 'folder' ? 'text-blue-400' : 'text-white/60'}`} />
                          <span className="flex-1 text-left truncate">{file.name}</span>
                          {file.type === 'folder' && <ChevronRight className="w-3 h-3 text-white/30" />}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex-1 bg-black/20 backdrop-blur-md flex items-center justify-center text-white/40 text-[13px]">
                    {selectedFile ? (
                      <div className="text-center p-4">
                        <p className="mb-2 text-white/50">Press Space to Quick Look</p>
                        <p className="text-[11px] text-white/30">or double-click to open</p>
                      </div>
                    ) : (
                      'Select an item to see its contents'
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Status bar - Subtle glass */}
            <div className="h-6 flex items-center px-3 border-t border-white/10 bg-black/30 backdrop-blur-md text-[11px] text-white/50">
              {filteredFiles.length} items
              {selectedFile && (
                <span className="ml-2 text-white/40">
                  | Press Space to preview
                </span>
              )}
            </div>
          </div>
        </div>
      </ZWindow>

      {/* Quick Look Overlay */}
      <QuickLookOverlay
        isOpen={quickLookOpen}
        currentFile={quickLookFile}
        fileList={previewableFiles}
        currentIndex={quickLookIndex}
        isFullscreen={quickLookFullscreen}
        getFileType={getFileType}
        onClose={hideQuickLook}
        onNext={nextQuickLookFile}
        onPrev={prevQuickLookFile}
        onToggleFullscreen={toggleQuickLookFullscreen}
      />
    </>
  );
};

// ============================================================================
// App Definition
// ============================================================================

/**
 * Finder app manifest
 */
export const FinderManifest = {
  identifier: 'ai.hanzo.finder',
  name: 'Finder',
  version: '1.0.0',
  description: 'File browser for zOS',
  category: 'productivity' as const,
  permissions: ['filesystem'] as const,
  window: {
    type: 'default' as const,
    defaultSize: { width: 900, height: 550 },
    resizable: true,
    showInDock: true,
  },
};

/**
 * Finder menu bar configuration
 */
export const FinderMenuBar = {
  menus: [
    {
      id: 'file',
      label: 'File',
      items: [
        { type: 'item' as const, id: 'newFolder', label: 'New Folder', shortcut: '---N' },
        { type: 'item' as const, id: 'newWindow', label: 'New Finder Window', shortcut: '---N' },
        { type: 'item' as const, id: 'newTab', label: 'New Tab', shortcut: '---T' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'open', label: 'Open', shortcut: '---O' },
        { type: 'item' as const, id: 'openWith', label: 'Open With' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'close', label: 'Close Window', shortcut: '---W' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'getInfo', label: 'Get Info', shortcut: '---I' },
        { type: 'item' as const, id: 'rename', label: 'Rename' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'moveToTrash', label: 'Move to Trash', shortcut: '------' },
      ],
    },
    {
      id: 'edit',
      label: 'Edit',
      items: [
        { type: 'item' as const, id: 'undo', label: 'Undo', shortcut: '---Z' },
        { type: 'item' as const, id: 'redo', label: 'Redo', shortcut: '------Z' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'cut', label: 'Cut', shortcut: '---X' },
        { type: 'item' as const, id: 'copy', label: 'Copy', shortcut: '---C' },
        { type: 'item' as const, id: 'paste', label: 'Paste', shortcut: '---V' },
        { type: 'item' as const, id: 'selectAll', label: 'Select All', shortcut: '---A' },
      ],
    },
    {
      id: 'view',
      label: 'View',
      items: [
        { type: 'item' as const, id: 'asIcons', label: 'as Icons', shortcut: '---1' },
        { type: 'item' as const, id: 'asList', label: 'as List', shortcut: '---2' },
        { type: 'item' as const, id: 'asColumns', label: 'as Columns', shortcut: '---3' },
        { type: 'item' as const, id: 'asGallery', label: 'as Gallery', shortcut: '---4' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'showSidebar', label: 'Show Sidebar', shortcut: '------S' },
        { type: 'item' as const, id: 'showPreview', label: 'Show Preview', shortcut: '------P' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'showPathBar', label: 'Show Path Bar', shortcut: '------P' },
        { type: 'item' as const, id: 'showStatusBar', label: 'Show Status Bar' },
      ],
    },
    {
      id: 'go',
      label: 'Go',
      items: [
        { type: 'item' as const, id: 'back', label: 'Back', shortcut: '---[' },
        { type: 'item' as const, id: 'forward', label: 'Forward', shortcut: '---]' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'enclosingFolder', label: 'Enclosing Folder', shortcut: '------' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'recents', label: 'Recents', shortcut: '------F' },
        { type: 'item' as const, id: 'documents', label: 'Documents', shortcut: '------O' },
        { type: 'item' as const, id: 'desktop', label: 'Desktop', shortcut: '------D' },
        { type: 'item' as const, id: 'downloads', label: 'Downloads', shortcut: '------L' },
        { type: 'item' as const, id: 'home', label: 'Home', shortcut: '------H' },
        { type: 'item' as const, id: 'applications', label: 'Applications', shortcut: '------A' },
        { type: 'item' as const, id: 'utilities', label: 'Utilities', shortcut: '------U' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'goToFolder', label: 'Go to Folder...', shortcut: '------G' },
      ],
    },
    {
      id: 'window',
      label: 'Window',
      items: [
        { type: 'item' as const, id: 'minimize', label: 'Minimize', shortcut: '---M' },
        { type: 'item' as const, id: 'zoom', label: 'Zoom' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'bringAllToFront', label: 'Bring All to Front' },
      ],
    },
    {
      id: 'help',
      label: 'Help',
      items: [
        { type: 'item' as const, id: 'finderHelp', label: 'Finder Help' },
      ],
    },
  ],
};

/**
 * Finder dock configuration
 */
export const FinderDockConfig = {
  contextMenu: [
    { type: 'item' as const, id: 'newWindow', label: 'New Finder Window' },
    { type: 'item' as const, id: 'newTab', label: 'New Tab' },
    { type: 'separator' as const },
    { type: 'item' as const, id: 'connect', label: 'Connect to Server...' },
    { type: 'separator' as const },
    { type: 'item' as const, id: 'options', label: 'Options' },
  ],
};

/**
 * Finder App definition for registry
 */
export const FinderApp = {
  manifest: FinderManifest,
  component: FinderWindow,
  icon: Folder,
  menuBar: FinderMenuBar,
  dockConfig: FinderDockConfig,
};

export default FinderWindow;
