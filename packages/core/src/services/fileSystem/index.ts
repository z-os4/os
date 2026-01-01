/**
 * zOS File System
 *
 * Provides both:
 * - VirtualFileSystem: In-memory with LocalStorage persistence
 * - NativeFileSystem: Real browser file system access (File System Access API + OPFS)
 */

// Types
export type {
  FSFileType,
  FileNode,
  FileMetadata,
  FileSystemState,
  FileSystemOperationResult,
  CreateFileOptions,
  CreateFolderOptions,
  MoveOptions,
  CopyOptions,
  RenameOptions,
} from './types';

// Virtual file system (in-memory)
export { VirtualFileSystem, virtualFileSystem } from './VirtualFileSystem';
export { FileSystemProvider, useFileSystemContext } from './FileSystemContext';
export type { FileSystemContextType, FileSystemProviderProps } from './FileSystemContext';

// Native file system (browser APIs)
export { NativeFileSystem, nativeFileSystem, opfsFileSystem } from './NativeFileSystem';
export type { NativeFileHandle, NativeFileSystemOptions } from './NativeFileSystem';
export { NativeFileSystemProvider, useNativeFileSystem } from './NativeFileSystemContext';
export type { NativeFileSystemContextType, NativeFileSystemProviderProps } from './NativeFileSystemContext';
