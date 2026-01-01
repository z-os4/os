/**
 * File Associations Types
 *
 * Defines the data structures for mapping file types to applications.
 */

import type { ReactNode } from 'react';

/**
 * Role describes how an app handles a file type.
 * - viewer: Can display but not modify
 * - editor: Can display and modify
 * - default: Primary handler (used for double-click)
 */
export type FileAssociationRole = 'viewer' | 'editor' | 'default';

/**
 * FileAssociation maps file extensions/MIME types to an application.
 */
export interface FileAssociation {
  /** File extensions this association handles (e.g., ['.txt', '.md']) */
  extensions: string[];
  /** MIME types this association handles (e.g., ['text/plain']) */
  mimeTypes?: string[];
  /** Application identifier that handles these files */
  appId: string;
  /** How the app handles these files */
  role: FileAssociationRole;
  /** Icon to display for these file types */
  icon?: ReactNode;
  /** Human-readable description */
  description?: string;
}

/**
 * UrlSchemeHandler maps URL schemes to applications.
 */
export interface UrlSchemeHandler {
  /** URL scheme (e.g., 'mailto', 'tel', 'zos') */
  scheme: string;
  /** Application identifier that handles this scheme */
  appId: string;
  /** Human-readable description */
  description?: string;
}

/**
 * FileTypeCategory for grouping related file types.
 */
export type FileTypeCategory =
  | 'image'
  | 'video'
  | 'audio'
  | 'document'
  | 'code'
  | 'archive'
  | 'other';

/**
 * OpenFileOptions for opening files with specific apps.
 */
export interface OpenFileOptions {
  /** Path to the file */
  path: string;
  /** Specific app to open with (optional) */
  appId?: string;
  /** Whether to open in new window */
  newWindow?: boolean;
}

/**
 * OpenUrlOptions for opening URLs with handlers.
 */
export interface OpenUrlOptions {
  /** URL to open */
  url: string;
  /** Specific app to open with (optional) */
  appId?: string;
  /** Whether to open in new window */
  newWindow?: boolean;
}
