/**
 * File Association Registry
 *
 * Central registry for mapping file types and URL schemes to applications.
 * Supports multiple apps per file type, default app selection, and type categorization.
 */

import type { ReactNode } from 'react';
import type { FileAssociation, UrlSchemeHandler, FileTypeCategory } from './types';
import { DEFAULT_FILE_ASSOCIATIONS, DEFAULT_URL_SCHEMES, FILE_TYPE_EXTENSIONS } from './defaultAssociations';

// Storage key for persisted defaults
const DEFAULTS_STORAGE_KEY = 'zos:fileAssociations:defaults';

/**
 * FileAssociationRegistryImpl
 *
 * Manages file type associations and URL scheme handlers.
 * Thread-safe singleton pattern.
 */
class FileAssociationRegistryImpl {
  /** Extension to associations mapping */
  private associations: Map<string, FileAssociation[]> = new Map();

  /** MIME type to associations mapping */
  private mimeAssociations: Map<string, FileAssociation[]> = new Map();

  /** URL scheme to handler mapping */
  private urlSchemes: Map<string, UrlSchemeHandler> = new Map();

  /** User-selected default app per extension */
  private defaultApp: Map<string, string> = new Map();

  /** Whether registry has been initialized */
  private initialized = false;

  constructor() {
    this.initialize();
  }

  /**
   * Initialize the registry with default associations.
   */
  private initialize(): void {
    if (this.initialized) return;

    // Register default file associations
    for (const association of DEFAULT_FILE_ASSOCIATIONS) {
      this.register(association);
    }

    // Register default URL schemes
    for (const handler of DEFAULT_URL_SCHEMES) {
      this.registerUrlScheme(handler);
    }

    // Load persisted defaults
    this.loadPersistedDefaults();

    this.initialized = true;
  }

  /**
   * Load user-selected defaults from storage.
   */
  private loadPersistedDefaults(): void {
    try {
      const stored = localStorage.getItem(DEFAULTS_STORAGE_KEY);
      if (stored) {
        const defaults = JSON.parse(stored) as Record<string, string>;
        for (const [ext, appId] of Object.entries(defaults)) {
          this.defaultApp.set(ext, appId);
        }
      }
    } catch {
      // Ignore storage errors
    }
  }

  /**
   * Persist user-selected defaults to storage.
   */
  private savePersistedDefaults(): void {
    try {
      const defaults: Record<string, string> = {};
      for (const [ext, appId] of this.defaultApp) {
        defaults[ext] = appId;
      }
      localStorage.setItem(DEFAULTS_STORAGE_KEY, JSON.stringify(defaults));
    } catch {
      // Ignore storage errors
    }
  }

  /**
   * Normalize extension to lowercase with leading dot.
   */
  private normalizeExtension(ext: string): string {
    const normalized = ext.toLowerCase();
    return normalized.startsWith('.') ? normalized : `.${normalized}`;
  }

  /**
   * Normalize MIME type to lowercase.
   */
  private normalizeMimeType(mimeType: string): string {
    return mimeType.toLowerCase().trim();
  }

  /**
   * Register a file association.
   * Adds the association to both extension and MIME type indices.
   */
  register(association: FileAssociation): void {
    // Index by extension
    for (const ext of association.extensions) {
      const normalizedExt = this.normalizeExtension(ext);
      const existing = this.associations.get(normalizedExt) || [];

      // Remove existing association from same app
      const filtered = existing.filter((a) => a.appId !== association.appId);
      filtered.push(association);

      this.associations.set(normalizedExt, filtered);
    }

    // Index by MIME type
    if (association.mimeTypes) {
      for (const mimeType of association.mimeTypes) {
        const normalizedMime = this.normalizeMimeType(mimeType);
        const existing = this.mimeAssociations.get(normalizedMime) || [];

        // Remove existing association from same app
        const filtered = existing.filter((a) => a.appId !== association.appId);
        filtered.push(association);

        this.mimeAssociations.set(normalizedMime, filtered);
      }
    }
  }

  /**
   * Unregister associations for an app.
   * If extensions are provided, only removes those; otherwise removes all.
   */
  unregister(appId: string, extensions?: string[]): void {
    if (extensions) {
      // Remove specific extensions
      for (const ext of extensions) {
        const normalizedExt = this.normalizeExtension(ext);
        const existing = this.associations.get(normalizedExt);
        if (existing) {
          const filtered = existing.filter((a) => a.appId !== appId);
          if (filtered.length > 0) {
            this.associations.set(normalizedExt, filtered);
          } else {
            this.associations.delete(normalizedExt);
          }
        }
      }
    } else {
      // Remove all associations for this app
      for (const [ext, associations] of this.associations) {
        const filtered = associations.filter((a) => a.appId !== appId);
        if (filtered.length > 0) {
          this.associations.set(ext, filtered);
        } else {
          this.associations.delete(ext);
        }
      }

      for (const [mime, associations] of this.mimeAssociations) {
        const filtered = associations.filter((a) => a.appId !== appId);
        if (filtered.length > 0) {
          this.mimeAssociations.set(mime, filtered);
        } else {
          this.mimeAssociations.delete(mime);
        }
      }
    }

    // Clean up defaults pointing to this app
    for (const [ext, defaultAppId] of this.defaultApp) {
      if (defaultAppId === appId) {
        this.defaultApp.delete(ext);
      }
    }
    this.savePersistedDefaults();
  }

  /**
   * Register a URL scheme handler.
   */
  registerUrlScheme(handler: UrlSchemeHandler): void {
    const normalizedScheme = handler.scheme.toLowerCase();
    this.urlSchemes.set(normalizedScheme, handler);
  }

  /**
   * Unregister a URL scheme handler.
   */
  unregisterUrlScheme(scheme: string): void {
    const normalizedScheme = scheme.toLowerCase();
    this.urlSchemes.delete(normalizedScheme);
  }

  /**
   * Get all apps that can handle a file extension.
   * Returns apps sorted by role: default > editor > viewer.
   */
  getAppsForExtension(ext: string): FileAssociation[] {
    const normalizedExt = this.normalizeExtension(ext);
    const associations = this.associations.get(normalizedExt) || [];

    // Sort by role priority
    return [...associations].sort((a, b) => {
      const rolePriority: Record<string, number> = { default: 0, editor: 1, viewer: 2 };
      return (rolePriority[a.role] || 3) - (rolePriority[b.role] || 3);
    });
  }

  /**
   * Get all apps that can handle a MIME type.
   */
  getAppsForMimeType(mimeType: string): FileAssociation[] {
    const normalizedMime = this.normalizeMimeType(mimeType);
    const associations = this.mimeAssociations.get(normalizedMime) || [];

    return [...associations].sort((a, b) => {
      const rolePriority: Record<string, number> = { default: 0, editor: 1, viewer: 2 };
      return (rolePriority[a.role] || 3) - (rolePriority[b.role] || 3);
    });
  }

  /**
   * Get the default (preferred) app for a file extension.
   * Returns user selection, or first registered app with role 'default' or 'editor'.
   */
  getDefaultApp(ext: string): string | undefined {
    const normalizedExt = this.normalizeExtension(ext);

    // Check user-selected default first
    const userDefault = this.defaultApp.get(normalizedExt);
    if (userDefault) {
      // Verify the app is still registered
      const associations = this.associations.get(normalizedExt) || [];
      if (associations.some((a) => a.appId === userDefault)) {
        return userDefault;
      }
      // User default is stale, remove it
      this.defaultApp.delete(normalizedExt);
      this.savePersistedDefaults();
    }

    // Fall back to first registered app
    const associations = this.getAppsForExtension(normalizedExt);
    return associations[0]?.appId;
  }

  /**
   * Set the default app for a file extension.
   */
  setDefaultApp(ext: string, appId: string): void {
    const normalizedExt = this.normalizeExtension(ext);

    // Verify the app is registered for this extension
    const associations = this.associations.get(normalizedExt) || [];
    if (!associations.some((a) => a.appId === appId)) {
      throw new Error(`App '${appId}' is not registered for extension '${ext}'`);
    }

    this.defaultApp.set(normalizedExt, appId);
    this.savePersistedDefaults();
  }

  /**
   * Clear the user-selected default for an extension.
   */
  clearDefaultApp(ext: string): void {
    const normalizedExt = this.normalizeExtension(ext);
    this.defaultApp.delete(normalizedExt);
    this.savePersistedDefaults();
  }

  /**
   * Get the URL scheme handler for a scheme.
   */
  getUrlSchemeHandler(scheme: string): UrlSchemeHandler | undefined {
    const normalizedScheme = scheme.toLowerCase();
    return this.urlSchemes.get(normalizedScheme);
  }

  /**
   * Get all registered URL schemes.
   */
  getAllUrlSchemes(): UrlSchemeHandler[] {
    return Array.from(this.urlSchemes.values());
  }

  /**
   * Get the icon for a file extension.
   */
  getFileIcon(ext: string): ReactNode | undefined {
    const normalizedExt = this.normalizeExtension(ext);
    const associations = this.associations.get(normalizedExt) || [];

    // Return first association with an icon
    for (const association of associations) {
      if (association.icon) {
        return association.icon;
      }
    }

    return undefined;
  }

  /**
   * Get the file type category for an extension.
   */
  getFileCategory(ext: string): FileTypeCategory {
    const normalizedExt = this.normalizeExtension(ext);

    if (FILE_TYPE_EXTENSIONS.image.has(normalizedExt)) return 'image';
    if (FILE_TYPE_EXTENSIONS.video.has(normalizedExt)) return 'video';
    if (FILE_TYPE_EXTENSIONS.audio.has(normalizedExt)) return 'audio';
    if (FILE_TYPE_EXTENSIONS.document.has(normalizedExt)) return 'document';
    if (FILE_TYPE_EXTENSIONS.code.has(normalizedExt)) return 'code';
    if (FILE_TYPE_EXTENSIONS.archive.has(normalizedExt)) return 'archive';

    return 'other';
  }

  /**
   * Check if extension is an image file.
   */
  isImage(ext: string): boolean {
    return FILE_TYPE_EXTENSIONS.image.has(this.normalizeExtension(ext));
  }

  /**
   * Check if extension is a video file.
   */
  isVideo(ext: string): boolean {
    return FILE_TYPE_EXTENSIONS.video.has(this.normalizeExtension(ext));
  }

  /**
   * Check if extension is an audio file.
   */
  isAudio(ext: string): boolean {
    return FILE_TYPE_EXTENSIONS.audio.has(this.normalizeExtension(ext));
  }

  /**
   * Check if extension is a document file.
   */
  isDocument(ext: string): boolean {
    return FILE_TYPE_EXTENSIONS.document.has(this.normalizeExtension(ext));
  }

  /**
   * Check if extension is a code file.
   */
  isCode(ext: string): boolean {
    return FILE_TYPE_EXTENSIONS.code.has(this.normalizeExtension(ext));
  }

  /**
   * Check if extension is an archive file.
   */
  isArchive(ext: string): boolean {
    return FILE_TYPE_EXTENSIONS.archive.has(this.normalizeExtension(ext));
  }

  /**
   * Check if extension is a media file (image, video, or audio).
   */
  isMedia(ext: string): boolean {
    const normalizedExt = this.normalizeExtension(ext);
    return (
      FILE_TYPE_EXTENSIONS.image.has(normalizedExt) ||
      FILE_TYPE_EXTENSIONS.video.has(normalizedExt) ||
      FILE_TYPE_EXTENSIONS.audio.has(normalizedExt)
    );
  }

  /**
   * Get all registered extensions.
   */
  getAllExtensions(): string[] {
    return Array.from(this.associations.keys()).sort();
  }

  /**
   * Get all associations for a given app.
   */
  getAssociationsForApp(appId: string): FileAssociation[] {
    const result: FileAssociation[] = [];
    const seen = new Set<string>();

    for (const associations of this.associations.values()) {
      for (const association of associations) {
        if (association.appId === appId) {
          // Use extensions as unique key
          const key = association.extensions.sort().join(',');
          if (!seen.has(key)) {
            seen.add(key);
            result.push(association);
          }
        }
      }
    }

    return result;
  }

  /**
   * Extract extension from a filename.
   */
  getExtensionFromFilename(filename: string): string {
    // Handle compound extensions like .tar.gz
    const lowerFilename = filename.toLowerCase();
    if (lowerFilename.endsWith('.tar.gz')) return '.tar.gz';
    if (lowerFilename.endsWith('.tar.bz2')) return '.tar.bz2';
    if (lowerFilename.endsWith('.tar.xz')) return '.tar.xz';

    // Handle dotfiles without extension
    const lastDot = filename.lastIndexOf('.');
    if (lastDot <= 0) return '';

    return filename.slice(lastDot).toLowerCase();
  }

  /**
   * Get MIME type for an extension (best guess).
   */
  getMimeTypeForExtension(ext: string): string | undefined {
    const normalizedExt = this.normalizeExtension(ext);
    const associations = this.associations.get(normalizedExt) || [];

    for (const association of associations) {
      if (association.mimeTypes && association.mimeTypes.length > 0) {
        return association.mimeTypes[0];
      }
    }

    return undefined;
  }
}

/**
 * Singleton instance of the file association registry.
 */
export const fileAssociations = new FileAssociationRegistryImpl();
