/**
 * Virtual File System Types
 * 
 * Types for the in-memory file system abstraction.
 */

export type FSFileType = 'file' | 'folder' | 'application' | 'image' | 'video' | 'audio' | 'document';

export interface FileMetadata {
  createdAt: Date;
  modifiedAt: Date;
  size: number;
  mimeType?: string;
  icon?: string;
  color?: string;
}

export interface FileNode {
  id: string;
  name: string;
  type: FSFileType;
  path: string;
  parentId: string | null;
  metadata: FileMetadata;
  content?: string;
  children?: string[]; // IDs of child nodes for folders
}

export interface FileSystemState {
  nodes: Record<string, FileNode>;
  rootId: string;
}

export interface FileSystemOperationResult {
  success: boolean;
  error?: string;
  node?: FileNode;
  nodes?: FileNode[];
}

export interface CreateFileOptions {
  name: string;
  parentPath: string;
  type?: FSFileType;
  content?: string;
  mimeType?: string;
}

export interface CreateFolderOptions {
  name: string;
  parentPath: string;
  icon?: string;
  color?: string;
}

export interface MoveOptions {
  sourcePath: string;
  destinationPath: string;
}

export interface CopyOptions {
  sourcePath: string;
  destinationPath: string;
  newName?: string;
}

export interface RenameOptions {
  path: string;
  newName: string;
}
