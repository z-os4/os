/**
 * NativeFileSystemContext - React context for browser file system access
 *
 * Provides components with access to real file system via:
 * - File System Access API (user-granted disk access)
 * - Origin Private File System (sandboxed storage)
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { NativeFileSystem, nativeFileSystem, opfsFileSystem } from './NativeFileSystem';
import type { FileNode, FileSystemOperationResult } from './types';

export interface NativeFileSystemContextType {
  // State
  mode: 'native' | 'opfs';
  hasNativeAccess: boolean;
  isSupported: boolean;
  isOPFSSupported: boolean;
  currentPath: string;
  entries: FileNode[];
  loading: boolean;
  error: string | null;

  // Native access
  requestNativeAccess: () => Promise<FileSystemOperationResult>;

  // Navigation
  navigate: (path: string) => Promise<void>;
  refresh: () => Promise<void>;

  // File operations
  readFile: (path: string) => Promise<{ success: boolean; file?: File; error?: string }>;
  readFileAsText: (path: string) => Promise<{ success: boolean; content?: string; error?: string }>;
  writeFile: (path: string, content: string | Blob | ArrayBuffer) => Promise<FileSystemOperationResult>;
  createDirectory: (path: string) => Promise<FileSystemOperationResult>;
  delete: (path: string, recursive?: boolean) => Promise<FileSystemOperationResult>;
  exists: (path: string) => Promise<boolean>;

  // File picker dialogs
  openFiles: (options?: {
    multiple?: boolean;
    types?: { description: string; accept: Record<string, string[]> }[];
  }) => Promise<{ success: boolean; files?: File[]; error?: string }>;
  saveFile: (
    content: string | Blob | ArrayBuffer,
    suggestedName?: string,
    types?: { description: string; accept: Record<string, string[]> }[]
  ) => Promise<FileSystemOperationResult>;

  // Switch modes
  switchToNative: () => Promise<FileSystemOperationResult>;
  switchToOPFS: () => void;
}

const NativeFileSystemContext = createContext<NativeFileSystemContextType | undefined>(undefined);

export interface NativeFileSystemProviderProps {
  children: ReactNode;
  defaultMode?: 'native' | 'opfs';
}

export const NativeFileSystemProvider: React.FC<NativeFileSystemProviderProps> = ({
  children,
  defaultMode = 'opfs',
}) => {
  const [mode, setMode] = useState<'native' | 'opfs'>(defaultMode);
  const [hasNativeAccess, setHasNativeAccess] = useState(false);
  const [currentPath, setCurrentPath] = useState('/');
  const [entries, setEntries] = useState<FileNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fs = mode === 'native' ? nativeFileSystem : opfsFileSystem;

  // Check browser support
  const isSupported = NativeFileSystem.isSupported();
  const isOPFSSupported = NativeFileSystem.isOPFSSupported();

  // Subscribe to file system changes
  useEffect(() => {
    return fs.subscribe(() => {
      // Refresh current directory on changes
      loadDirectory(currentPath);
    });
  }, [fs, currentPath]);

  const loadDirectory = useCallback(async (path: string) => {
    setLoading(true);
    setError(null);

    const result = await fs.listDirectory(path);
    if (result.success && result.nodes) {
      setEntries(result.nodes);
    } else {
      setError(result.error || 'Failed to load directory');
      setEntries([]);
    }

    setLoading(false);
  }, [fs]);

  const navigate = useCallback(async (path: string) => {
    setCurrentPath(path);
    await loadDirectory(path);
  }, [loadDirectory]);

  const refresh = useCallback(async () => {
    await loadDirectory(currentPath);
  }, [loadDirectory, currentPath]);

  const requestNativeAccess = useCallback(async () => {
    const result = await nativeFileSystem.openDirectory();
    if (result.success) {
      setHasNativeAccess(true);
      setMode('native');
      setCurrentPath('/');
      await loadDirectory('/');
    }
    return result;
  }, [loadDirectory]);

  const switchToNative = useCallback(async () => {
    if (!hasNativeAccess) {
      return requestNativeAccess();
    }
    setMode('native');
    setCurrentPath('/');
    await loadDirectory('/');
    return { success: true };
  }, [hasNativeAccess, requestNativeAccess, loadDirectory]);

  const switchToOPFS = useCallback(() => {
    setMode('opfs');
    setCurrentPath('/');
    loadDirectory('/');
  }, [loadDirectory]);

  const value: NativeFileSystemContextType = {
    // State
    mode,
    hasNativeAccess,
    isSupported,
    isOPFSSupported,
    currentPath,
    entries,
    loading,
    error,

    // Native access
    requestNativeAccess,

    // Navigation
    navigate,
    refresh,

    // File operations
    readFile: (path) => fs.readFile(path),
    readFileAsText: (path) => fs.readFileAsText(path),
    writeFile: (path, content) => fs.writeFile(path, content),
    createDirectory: (path) => fs.createDirectory(path),
    delete: (path, recursive) => fs.delete(path, recursive),
    exists: (path) => fs.exists(path),

    // File picker dialogs (only work in native mode)
    openFiles: (options) => nativeFileSystem.openFiles(options),
    saveFile: (content, suggestedName, types) => nativeFileSystem.saveFile(content, suggestedName, types),

    // Mode switching
    switchToNative,
    switchToOPFS,
  };

  return (
    <NativeFileSystemContext.Provider value={value}>
      {children}
    </NativeFileSystemContext.Provider>
  );
};

export const useNativeFileSystem = (): NativeFileSystemContextType => {
  const context = useContext(NativeFileSystemContext);
  if (!context) {
    throw new Error('useNativeFileSystem must be used within NativeFileSystemProvider');
  }
  return context;
};
