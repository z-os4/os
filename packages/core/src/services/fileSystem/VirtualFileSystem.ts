/**
 * VirtualFileSystem - In-memory file system abstraction for zOS
 * 
 * Provides a complete file system API with:
 * - CRUD operations for files and folders
 * - Path resolution and navigation
 * - Metadata management
 * - LocalStorage persistence
 */

import type {
  FileNode,
  FSFileType,
  FileMetadata,
  FileSystemState,
  FileSystemOperationResult,
  CreateFileOptions,
  CreateFolderOptions,
  MoveOptions,
  CopyOptions,
  RenameOptions,
} from './types';

const STORAGE_KEY = 'zos-filesystem';

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`;
}

function getFileType(name: string, mimeType?: string): FSFileType {
  if (mimeType) {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.startsWith('application/')) return 'application';
  }
  
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
    case 'app': case 'exe':
      return 'application';
    default:
      return 'file';
  }
}

function createDefaultFileSystem(): FileSystemState {
  const rootId = generateId();
  const desktopId = generateId();
  const documentsId = generateId();
  const downloadsId = generateId();
  const applicationsId = generateId();
  
  const now = new Date();
  const baseMetadata: FileMetadata = {
    createdAt: now,
    modifiedAt: now,
    size: 0,
  };
  
  return {
    rootId,
    nodes: {
      [rootId]: {
        id: rootId,
        name: '/',
        type: 'folder',
        path: '/',
        parentId: null,
        metadata: baseMetadata,
        children: [desktopId, documentsId, downloadsId, applicationsId],
      },
      [desktopId]: {
        id: desktopId,
        name: 'Desktop',
        type: 'folder',
        path: '/Desktop',
        parentId: rootId,
        metadata: { ...baseMetadata, icon: 'desktop' },
        children: [],
      },
      [documentsId]: {
        id: documentsId,
        name: 'Documents',
        type: 'folder',
        path: '/Documents',
        parentId: rootId,
        metadata: { ...baseMetadata, icon: 'file-text' },
        children: [],
      },
      [downloadsId]: {
        id: downloadsId,
        name: 'Downloads',
        type: 'folder',
        path: '/Downloads',
        parentId: rootId,
        metadata: { ...baseMetadata, icon: 'download' },
        children: [],
      },
      [applicationsId]: {
        id: applicationsId,
        name: 'Applications',
        type: 'folder',
        path: '/Applications',
        parentId: rootId,
        metadata: { ...baseMetadata, icon: 'grid' },
        children: [],
      },
    },
  };
}

export class VirtualFileSystem {
  private state: FileSystemState;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.state = this.load();
  }

  private load(): FileSystemState {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Revive dates
        Object.values(parsed.nodes).forEach((node: any) => {
          node.metadata.createdAt = new Date(node.metadata.createdAt);
          node.metadata.modifiedAt = new Date(node.metadata.modifiedAt);
        });
        return parsed;
      }
    } catch (e) {
      console.error('Failed to load file system:', e);
    }
    return createDefaultFileSystem();
  }

  private save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error('Failed to save file system:', e);
    }
  }

  private notify(): void {
    this.listeners.forEach(listener => listener());
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // Path resolution
  resolvePath(path: string): FileNode | null {
    if (path === '/') {
      return this.state.nodes[this.state.rootId];
    }

    const parts = path.split('/').filter(Boolean);
    let current = this.state.nodes[this.state.rootId];

    for (const part of parts) {
      if (!current.children) return null;
      
      const childId = current.children.find(id => 
        this.state.nodes[id]?.name === part
      );
      
      if (!childId) return null;
      current = this.state.nodes[childId];
    }

    return current;
  }

  getNodeById(id: string): FileNode | null {
    return this.state.nodes[id] || null;
  }

  // Directory operations
  listDirectory(path: string): FileSystemOperationResult {
    const node = this.resolvePath(path);
    
    if (!node) {
      return { success: false, error: 'Path not found' };
    }
    
    if (node.type !== 'folder') {
      return { success: false, error: 'Not a directory' };
    }

    const children = (node.children || [])
      .map(id => this.state.nodes[id])
      .filter(Boolean);

    return { success: true, nodes: children };
  }

  // Create operations
  createFile(options: CreateFileOptions): FileSystemOperationResult {
    const parent = this.resolvePath(options.parentPath);
    
    if (!parent) {
      return { success: false, error: 'Parent path not found' };
    }
    
    if (parent.type !== 'folder') {
      return { success: false, error: 'Parent is not a directory' };
    }

    // Check if name already exists
    const exists = (parent.children || []).some(id => 
      this.state.nodes[id]?.name === options.name
    );
    
    if (exists) {
      return { success: false, error: 'File already exists' };
    }

    const id = generateId();
    const now = new Date();
    const type = options.type || getFileType(options.name, options.mimeType);
    
    const node: FileNode = {
      id,
      name: options.name,
      type,
      path: `${parent.path === '/' ? '' : parent.path}/${options.name}`,
      parentId: parent.id,
      content: options.content || '',
      metadata: {
        createdAt: now,
        modifiedAt: now,
        size: (options.content || '').length,
        mimeType: options.mimeType,
      },
    };

    this.state.nodes[id] = node;
    if (!parent.children) parent.children = [];
    parent.children.push(id);
    parent.metadata.modifiedAt = now;

    this.save();
    this.notify();

    return { success: true, node };
  }

  createFolder(options: CreateFolderOptions): FileSystemOperationResult {
    const parent = this.resolvePath(options.parentPath);
    
    if (!parent) {
      return { success: false, error: 'Parent path not found' };
    }
    
    if (parent.type !== 'folder') {
      return { success: false, error: 'Parent is not a directory' };
    }

    // Check if name already exists
    const exists = (parent.children || []).some(id => 
      this.state.nodes[id]?.name === options.name
    );
    
    if (exists) {
      return { success: false, error: 'Folder already exists' };
    }

    const id = generateId();
    const now = new Date();
    
    const node: FileNode = {
      id,
      name: options.name,
      type: 'folder',
      path: `${parent.path === '/' ? '' : parent.path}/${options.name}`,
      parentId: parent.id,
      children: [],
      metadata: {
        createdAt: now,
        modifiedAt: now,
        size: 0,
        icon: options.icon,
        color: options.color,
      },
    };

    this.state.nodes[id] = node;
    if (!parent.children) parent.children = [];
    parent.children.push(id);
    parent.metadata.modifiedAt = now;

    this.save();
    this.notify();

    return { success: true, node };
  }

  // Read operations
  readFile(path: string): FileSystemOperationResult {
    const node = this.resolvePath(path);
    
    if (!node) {
      return { success: false, error: 'File not found' };
    }
    
    if (node.type === 'folder') {
      return { success: false, error: 'Cannot read a directory' };
    }

    return { success: true, node };
  }

  // Update operations
  writeFile(path: string, content: string): FileSystemOperationResult {
    const node = this.resolvePath(path);
    
    if (!node) {
      return { success: false, error: 'File not found' };
    }
    
    if (node.type === 'folder') {
      return { success: false, error: 'Cannot write to a directory' };
    }

    node.content = content;
    node.metadata.modifiedAt = new Date();
    node.metadata.size = content.length;

    this.save();
    this.notify();

    return { success: true, node };
  }

  rename(options: RenameOptions): FileSystemOperationResult {
    const node = this.resolvePath(options.path);
    
    if (!node) {
      return { success: false, error: 'Path not found' };
    }

    const parent = node.parentId ? this.state.nodes[node.parentId] : null;
    
    // Check if new name already exists in parent
    if (parent?.children) {
      const exists = parent.children.some(id => 
        id !== node.id && this.state.nodes[id]?.name === options.newName
      );
      if (exists) {
        return { success: false, error: 'Name already exists' };
      }
    }

    const oldPath = node.path;
    node.name = options.newName;
    node.path = parent 
      ? `${parent.path === '/' ? '' : parent.path}/${options.newName}`
      : `/${options.newName}`;
    node.metadata.modifiedAt = new Date();

    // Update paths of all descendants
    if (node.type === 'folder' && node.children) {
      this.updateChildPaths(node, oldPath);
    }

    this.save();
    this.notify();

    return { success: true, node };
  }

  private updateChildPaths(parent: FileNode, oldParentPath: string): void {
    if (!parent.children) return;
    
    for (const childId of parent.children) {
      const child = this.state.nodes[childId];
      if (!child) continue;
      
      child.path = `${parent.path}/${child.name}`;
      
      if (child.type === 'folder' && child.children) {
        this.updateChildPaths(child, `${oldParentPath}/${child.name}`);
      }
    }
  }

  // Delete operations
  delete(path: string): FileSystemOperationResult {
    const node = this.resolvePath(path);
    
    if (!node) {
      return { success: false, error: 'Path not found' };
    }
    
    if (node.id === this.state.rootId) {
      return { success: false, error: 'Cannot delete root' };
    }

    // Remove from parent's children
    const parent = node.parentId ? this.state.nodes[node.parentId] : null;
    if (parent?.children) {
      parent.children = parent.children.filter(id => id !== node.id);
      parent.metadata.modifiedAt = new Date();
    }

    // Recursively delete children
    this.deleteRecursive(node);

    this.save();
    this.notify();

    return { success: true };
  }

  private deleteRecursive(node: FileNode): void {
    if (node.children) {
      for (const childId of node.children) {
        const child = this.state.nodes[childId];
        if (child) {
          this.deleteRecursive(child);
        }
      }
    }
    delete this.state.nodes[node.id];
  }

  // Move/Copy operations
  move(options: MoveOptions): FileSystemOperationResult {
    const source = this.resolvePath(options.sourcePath);
    const dest = this.resolvePath(options.destinationPath);
    
    if (!source) {
      return { success: false, error: 'Source not found' };
    }
    
    if (!dest) {
      return { success: false, error: 'Destination not found' };
    }
    
    if (dest.type !== 'folder') {
      return { success: false, error: 'Destination is not a directory' };
    }

    // Check if moving to self or child
    if (options.destinationPath.startsWith(options.sourcePath)) {
      return { success: false, error: 'Cannot move into itself' };
    }

    // Remove from old parent
    const oldParent = source.parentId ? this.state.nodes[source.parentId] : null;
    if (oldParent?.children) {
      oldParent.children = oldParent.children.filter(id => id !== source.id);
      oldParent.metadata.modifiedAt = new Date();
    }

    // Add to new parent
    source.parentId = dest.id;
    source.path = `${dest.path === '/' ? '' : dest.path}/${source.name}`;
    source.metadata.modifiedAt = new Date();
    
    if (!dest.children) dest.children = [];
    dest.children.push(source.id);
    dest.metadata.modifiedAt = new Date();

    // Update child paths
    if (source.type === 'folder' && source.children) {
      this.updateChildPaths(source, options.sourcePath);
    }

    this.save();
    this.notify();

    return { success: true, node: source };
  }

  copy(options: CopyOptions): FileSystemOperationResult {
    const source = this.resolvePath(options.sourcePath);
    const dest = this.resolvePath(options.destinationPath);
    
    if (!source) {
      return { success: false, error: 'Source not found' };
    }
    
    if (!dest) {
      return { success: false, error: 'Destination not found' };
    }
    
    if (dest.type !== 'folder') {
      return { success: false, error: 'Destination is not a directory' };
    }

    const newName = options.newName || source.name;
    const newNode = this.copyNode(source, dest, newName);

    this.save();
    this.notify();

    return { success: true, node: newNode };
  }

  private copyNode(source: FileNode, parent: FileNode, name: string): FileNode {
    const id = generateId();
    const now = new Date();
    
    const newNode: FileNode = {
      ...source,
      id,
      name,
      path: `${parent.path === '/' ? '' : parent.path}/${name}`,
      parentId: parent.id,
      children: source.type === 'folder' ? [] : undefined,
      metadata: {
        ...source.metadata,
        createdAt: now,
        modifiedAt: now,
      },
    };

    this.state.nodes[id] = newNode;
    if (!parent.children) parent.children = [];
    parent.children.push(id);

    // Copy children recursively
    if (source.type === 'folder' && source.children) {
      for (const childId of source.children) {
        const child = this.state.nodes[childId];
        if (child) {
          this.copyNode(child, newNode, child.name);
        }
      }
    }

    return newNode;
  }

  // Utility methods
  getParent(path: string): FileNode | null {
    const parts = path.split('/').filter(Boolean);
    if (parts.length === 0) return null;
    
    parts.pop();
    return this.resolvePath('/' + parts.join('/'));
  }

  exists(path: string): boolean {
    return this.resolvePath(path) !== null;
  }

  isFolder(path: string): boolean {
    const node = this.resolvePath(path);
    return node?.type === 'folder';
  }

  getSize(path: string): number {
    const node = this.resolvePath(path);
    if (!node) return 0;
    
    if (node.type === 'folder') {
      return this.calculateFolderSize(node);
    }
    
    return node.metadata.size;
  }

  private calculateFolderSize(folder: FileNode): number {
    if (!folder.children) return 0;
    
    return folder.children.reduce((total, childId) => {
      const child = this.state.nodes[childId];
      if (!child) return total;
      
      if (child.type === 'folder') {
        return total + this.calculateFolderSize(child);
      }
      
      return total + child.metadata.size;
    }, 0);
  }

  // Search
  search(query: string, path: string = '/'): FileNode[] {
    const results: FileNode[] = [];
    const startNode = this.resolvePath(path);
    
    if (!startNode) return results;
    
    const lowerQuery = query.toLowerCase();
    this.searchRecursive(startNode, lowerQuery, results);
    
    return results;
  }

  private searchRecursive(node: FileNode, query: string, results: FileNode[]): void {
    if (node.name.toLowerCase().includes(query)) {
      results.push(node);
    }
    
    if (node.children) {
      for (const childId of node.children) {
        const child = this.state.nodes[childId];
        if (child) {
          this.searchRecursive(child, query, results);
        }
      }
    }
  }
}

// Singleton instance
export const virtualFileSystem = new VirtualFileSystem();
