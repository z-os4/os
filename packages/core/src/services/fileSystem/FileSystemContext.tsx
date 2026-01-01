/**
 * FileSystemContext - React context for virtual file system
 */

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { virtualFileSystem } from './VirtualFileSystem';
import type { FileNode, FileSystemOperationResult, CreateFileOptions, CreateFolderOptions, MoveOptions, CopyOptions, RenameOptions } from './types';

export interface FileSystemContextType {
  // Navigation
  currentPath: string;
  currentNode: FileNode | null;
  navigate: (path: string) => void;
  goUp: () => void;
  canGoUp: boolean;
  
  // Directory contents
  items: FileNode[];
  refresh: () => void;
  
  // Operations
  createFile: (options: Omit<CreateFileOptions, 'parentPath'> & { parentPath?: string }) => FileSystemOperationResult;
  createFolder: (options: Omit<CreateFolderOptions, 'parentPath'> & { parentPath?: string }) => FileSystemOperationResult;
  readFile: (path: string) => FileSystemOperationResult;
  writeFile: (path: string, content: string) => FileSystemOperationResult;
  rename: (options: RenameOptions) => FileSystemOperationResult;
  delete: (path: string) => FileSystemOperationResult;
  move: (options: MoveOptions) => FileSystemOperationResult;
  copy: (options: CopyOptions) => FileSystemOperationResult;
  
  // Utilities
  exists: (path: string) => boolean;
  isFolder: (path: string) => boolean;
  search: (query: string, path?: string) => FileNode[];
  resolvePath: (path: string) => FileNode | null;
}

const FileSystemContext = createContext<FileSystemContextType | undefined>(undefined);

export interface FileSystemProviderProps {
  children: ReactNode;
  initialPath?: string;
}

export function FileSystemProvider({ children, initialPath = '/' }: FileSystemProviderProps) {
  const [currentPath, setCurrentPath] = useState(initialPath);
  const [items, setItems] = useState<FileNode[]>([]);
  const [currentNode, setCurrentNode] = useState<FileNode | null>(null);

  const loadDirectory = useCallback((path: string) => {
    const node = virtualFileSystem.resolvePath(path);
    setCurrentNode(node);
    
    const result = virtualFileSystem.listDirectory(path);
    if (result.success && result.nodes) {
      setItems(result.nodes);
    } else {
      setItems([]);
    }
  }, []);

  // Load initial directory
  useEffect(() => {
    loadDirectory(currentPath);
  }, [currentPath, loadDirectory]);

  // Subscribe to file system changes
  useEffect(() => {
    const unsubscribe = virtualFileSystem.subscribe(() => {
      loadDirectory(currentPath);
    });
    return unsubscribe;
  }, [currentPath, loadDirectory]);

  const navigate = useCallback((path: string) => {
    if (virtualFileSystem.isFolder(path)) {
      setCurrentPath(path);
    }
  }, []);

  const goUp = useCallback(() => {
    if (currentPath === '/') return;
    const parent = virtualFileSystem.getParent(currentPath);
    if (parent) {
      setCurrentPath(parent.path);
    }
  }, [currentPath]);

  const refresh = useCallback(() => {
    loadDirectory(currentPath);
  }, [currentPath, loadDirectory]);

  const createFile = useCallback((options: Omit<CreateFileOptions, 'parentPath'> & { parentPath?: string }) => {
    return virtualFileSystem.createFile({
      ...options,
      parentPath: options.parentPath || currentPath,
    });
  }, [currentPath]);

  const createFolder = useCallback((options: Omit<CreateFolderOptions, 'parentPath'> & { parentPath?: string }) => {
    return virtualFileSystem.createFolder({
      ...options,
      parentPath: options.parentPath || currentPath,
    });
  }, [currentPath]);

  const value: FileSystemContextType = {
    currentPath,
    currentNode,
    navigate,
    goUp,
    canGoUp: currentPath !== '/',
    items,
    refresh,
    createFile,
    createFolder,
    readFile: (path) => virtualFileSystem.readFile(path),
    writeFile: (path, content) => virtualFileSystem.writeFile(path, content),
    rename: (options) => virtualFileSystem.rename(options),
    delete: (path) => virtualFileSystem.delete(path),
    move: (options) => virtualFileSystem.move(options),
    copy: (options) => virtualFileSystem.copy(options),
    exists: (path) => virtualFileSystem.exists(path),
    isFolder: (path) => virtualFileSystem.isFolder(path),
    search: (query, path) => virtualFileSystem.search(query, path),
    resolvePath: (path) => virtualFileSystem.resolvePath(path),
  };

  return (
    <FileSystemContext.Provider value={value}>
      {children}
    </FileSystemContext.Provider>
  );
}

export function useFileSystemContext(): FileSystemContextType {
  const context = useContext(FileSystemContext);
  if (!context) {
    throw new Error('useFileSystemContext must be used within a FileSystemProvider');
  }
  return context;
}
