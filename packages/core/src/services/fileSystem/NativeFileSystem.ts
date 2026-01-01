/**
 * NativeFileSystem - Real file system access using browser APIs
 *
 * Uses the File System Access API (for real disk access) and
 * Origin Private File System (OPFS) for sandboxed storage.
 *
 * Browser Support:
 * - File System Access API: Chrome 86+, Edge 86+, Opera 72+
 * - OPFS: Chrome 86+, Firefox 111+, Safari 15.2+
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/File_System_API
 */

import type { FileNode, FileMetadata, FSFileType, FileSystemOperationResult } from './types';

// File System Access API type declarations
declare global {
  interface Window {
    showDirectoryPicker?: (options?: {
      id?: string;
      mode?: 'read' | 'readwrite';
      startIn?: FileSystemHandle | 'desktop' | 'documents' | 'downloads' | 'music' | 'pictures' | 'videos';
    }) => Promise<FileSystemDirectoryHandle>;

    showOpenFilePicker?: (options?: {
      multiple?: boolean;
      excludeAcceptAllOption?: boolean;
      types?: { description?: string; accept: Record<string, string[]> }[];
    }) => Promise<FileSystemFileHandle[]>;

    showSaveFilePicker?: (options?: {
      suggestedName?: string;
      excludeAcceptAllOption?: boolean;
      types?: { description?: string; accept: Record<string, string[]> }[];
    }) => Promise<FileSystemFileHandle>;
  }

  // Extend FileSystemDirectoryHandle with entries() method
  interface FileSystemDirectoryHandle {
    entries(): AsyncIterableIterator<[string, FileSystemDirectoryHandle | FileSystemFileHandle]>;
    keys(): AsyncIterableIterator<string>;
    values(): AsyncIterableIterator<FileSystemDirectoryHandle | FileSystemFileHandle>;
  }
}

// Extend types for native handles
export interface NativeFileHandle {
  kind: 'file' | 'directory';
  name: string;
  handle: FileSystemFileHandle | FileSystemDirectoryHandle;
}

export interface NativeFileSystemOptions {
  mode: 'native' | 'opfs';
}

function generateId(): string {
  return `native-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`;
}

function getFileType(name: string): FSFileType {
  const ext = name.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'png': case 'jpg': case 'jpeg': case 'gif': case 'webp': case 'svg':
      return 'image';
    case 'mp4': case 'webm': case 'mov': case 'avi':
      return 'video';
    case 'mp3': case 'wav': case 'ogg': case 'flac':
      return 'audio';
    case 'pdf': case 'doc': case 'docx': case 'txt': case 'md':
      return 'document';
    default:
      return 'file';
  }
}

export class NativeFileSystem {
  private rootHandle: FileSystemDirectoryHandle | null = null;
  private opfsRoot: FileSystemDirectoryHandle | null = null;
  private listeners: Set<() => void> = new Set();
  private mode: 'native' | 'opfs';

  constructor(options: NativeFileSystemOptions = { mode: 'opfs' }) {
    this.mode = options.mode;
    if (options.mode === 'opfs') {
      this.initOPFS();
    }
  }

  private async initOPFS(): Promise<void> {
    try {
      // Get OPFS root
      this.opfsRoot = await navigator.storage.getDirectory();
    } catch (e) {
      console.error('Failed to initialize OPFS:', e);
    }
  }

  private notify(): void {
    this.listeners.forEach(listener => listener());
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // Check if File System Access API is supported
  static isSupported(): boolean {
    return 'showOpenFilePicker' in window || 'showDirectoryPicker' in window;
  }

  // Check if OPFS is supported
  static isOPFSSupported(): boolean {
    return 'storage' in navigator && 'getDirectory' in navigator.storage;
  }

  // Open a native directory (with user permission)
  async openDirectory(): Promise<FileSystemOperationResult> {
    try {
      if (!('showDirectoryPicker' in window)) {
        return { success: false, error: 'File System Access API not supported' };
      }

      this.rootHandle = await window.showDirectoryPicker!({
        mode: 'readwrite',
      });

      this.mode = 'native';
      this.notify();

      return { success: true };
    } catch (e: any) {
      if (e.name === 'AbortError') {
        return { success: false, error: 'User cancelled' };
      }
      return { success: false, error: e.message };
    }
  }

  // Open file(s) with picker
  async openFiles(options?: {
    multiple?: boolean;
    types?: { description: string; accept: Record<string, string[]> }[];
  }): Promise<{ success: boolean; files?: File[]; error?: string }> {
    try {
      if (!('showOpenFilePicker' in window)) {
        return { success: false, error: 'File System Access API not supported' };
      }

      const handles = await window.showOpenFilePicker!({
        multiple: options?.multiple ?? false,
        types: options?.types,
      });

      const files = await Promise.all(
        handles.map(handle => handle.getFile())
      );

      return { success: true, files };
    } catch (e: any) {
      if (e.name === 'AbortError') {
        return { success: false, error: 'User cancelled' };
      }
      return { success: false, error: e.message };
    }
  }

  // Save file with picker
  async saveFile(
    content: string | Blob | ArrayBuffer,
    suggestedName?: string,
    types?: { description: string; accept: Record<string, string[]> }[]
  ): Promise<FileSystemOperationResult> {
    try {
      if (!('showSaveFilePicker' in window)) {
        return { success: false, error: 'File System Access API not supported' };
      }

      const handle = await window.showSaveFilePicker!({
        suggestedName,
        types,
      });

      const writable = await handle.createWritable();
      await writable.write(content);
      await writable.close();

      return { success: true };
    } catch (e: any) {
      if (e.name === 'AbortError') {
        return { success: false, error: 'User cancelled' };
      }
      return { success: false, error: e.message };
    }
  }

  // List directory contents
  async listDirectory(path: string = '/'): Promise<FileSystemOperationResult> {
    const root = this.mode === 'opfs' ? this.opfsRoot : this.rootHandle;
    if (!root) {
      return { success: false, error: 'No directory opened' };
    }

    try {
      const dirHandle = path === '/' ? root : await this.getDirectoryHandle(root, path);
      if (!dirHandle) {
        return { success: false, error: 'Directory not found' };
      }

      const nodes: FileNode[] = [];
      for await (const [name, handle] of dirHandle.entries()) {
        const isFile = handle.kind === 'file';
        let metadata: FileMetadata = {
          createdAt: new Date(),
          modifiedAt: new Date(),
          size: 0,
        };

        if (isFile) {
          try {
            const file = await (handle as FileSystemFileHandle).getFile();
            metadata = {
              createdAt: new Date(file.lastModified),
              modifiedAt: new Date(file.lastModified),
              size: file.size,
              mimeType: file.type,
            };
          } catch { }
        }

        nodes.push({
          id: generateId(),
          name,
          type: isFile ? getFileType(name) : 'folder',
          path: path === '/' ? `/${name}` : `${path}/${name}`,
          parentId: null,
          metadata,
        });
      }

      return { success: true, nodes };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  // Read file contents
  async readFile(path: string): Promise<{ success: boolean; content?: string | ArrayBuffer; file?: File; error?: string }> {
    const root = this.mode === 'opfs' ? this.opfsRoot : this.rootHandle;
    if (!root) {
      return { success: false, error: 'No directory opened' };
    }

    try {
      const fileHandle = await this.getFileHandle(root, path);
      if (!fileHandle) {
        return { success: false, error: 'File not found' };
      }

      const file = await fileHandle.getFile();
      return { success: true, file };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  // Read file as text
  async readFileAsText(path: string): Promise<{ success: boolean; content?: string; error?: string }> {
    const result = await this.readFile(path);
    if (!result.success || !result.file) {
      return { success: false, error: result.error };
    }

    const content = await result.file.text();
    return { success: true, content };
  }

  // Read file as ArrayBuffer
  async readFileAsBuffer(path: string): Promise<{ success: boolean; content?: ArrayBuffer; error?: string }> {
    const result = await this.readFile(path);
    if (!result.success || !result.file) {
      return { success: false, error: result.error };
    }

    const content = await result.file.arrayBuffer();
    return { success: true, content };
  }

  // Write file
  async writeFile(path: string, content: string | Blob | ArrayBuffer): Promise<FileSystemOperationResult> {
    const root = this.mode === 'opfs' ? this.opfsRoot : this.rootHandle;
    if (!root) {
      return { success: false, error: 'No directory opened' };
    }

    try {
      // Parse path to get parent directory and filename
      const parts = path.split('/').filter(Boolean);
      const filename = parts.pop();
      if (!filename) {
        return { success: false, error: 'Invalid path' };
      }

      // Navigate to parent directory, creating if needed
      let dirHandle = root;
      for (const part of parts) {
        dirHandle = await dirHandle.getDirectoryHandle(part, { create: true });
      }

      // Create or get file handle
      const fileHandle = await dirHandle.getFileHandle(filename, { create: true });

      // Write content
      const writable = await fileHandle.createWritable();
      await writable.write(content);
      await writable.close();

      this.notify();
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  // Create directory
  async createDirectory(path: string): Promise<FileSystemOperationResult> {
    const root = this.mode === 'opfs' ? this.opfsRoot : this.rootHandle;
    if (!root) {
      return { success: false, error: 'No directory opened' };
    }

    try {
      const parts = path.split('/').filter(Boolean);
      let dirHandle = root;

      for (const part of parts) {
        dirHandle = await dirHandle.getDirectoryHandle(part, { create: true });
      }

      this.notify();
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  // Delete file or directory
  async delete(path: string, recursive: boolean = false): Promise<FileSystemOperationResult> {
    const root = this.mode === 'opfs' ? this.opfsRoot : this.rootHandle;
    if (!root) {
      return { success: false, error: 'No directory opened' };
    }

    try {
      const parts = path.split('/').filter(Boolean);
      const name = parts.pop();
      if (!name) {
        return { success: false, error: 'Invalid path' };
      }

      // Navigate to parent
      let parentHandle = root;
      for (const part of parts) {
        parentHandle = await parentHandle.getDirectoryHandle(part);
      }

      await parentHandle.removeEntry(name, { recursive });

      this.notify();
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  // Helper to get directory handle by path
  private async getDirectoryHandle(
    root: FileSystemDirectoryHandle,
    path: string
  ): Promise<FileSystemDirectoryHandle | null> {
    const parts = path.split('/').filter(Boolean);
    let current = root;

    for (const part of parts) {
      try {
        current = await current.getDirectoryHandle(part);
      } catch {
        return null;
      }
    }

    return current;
  }

  // Helper to get file handle by path
  private async getFileHandle(
    root: FileSystemDirectoryHandle,
    path: string
  ): Promise<FileSystemFileHandle | null> {
    const parts = path.split('/').filter(Boolean);
    const filename = parts.pop();
    if (!filename) return null;

    const dirHandle = parts.length > 0
      ? await this.getDirectoryHandle(root, parts.join('/'))
      : root;

    if (!dirHandle) return null;

    try {
      return await dirHandle.getFileHandle(filename);
    } catch {
      return null;
    }
  }

  // Check if path exists
  async exists(path: string): Promise<boolean> {
    const root = this.mode === 'opfs' ? this.opfsRoot : this.rootHandle;
    if (!root) return false;

    try {
      const parts = path.split('/').filter(Boolean);
      const name = parts.pop();
      if (!name) return false;

      const parent = parts.length > 0
        ? await this.getDirectoryHandle(root, parts.join('/'))
        : root;

      if (!parent) return false;

      // Try as file first, then directory
      try {
        await parent.getFileHandle(name);
        return true;
      } catch {
        try {
          await parent.getDirectoryHandle(name);
          return true;
        } catch {
          return false;
        }
      }
    } catch {
      return false;
    }
  }
}

// Singleton instances
export const nativeFileSystem = new NativeFileSystem({ mode: 'native' });
export const opfsFileSystem = new NativeFileSystem({ mode: 'opfs' });
