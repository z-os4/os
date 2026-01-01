/**
 * useFileAssociations Hook
 *
 * React hook for working with file associations in components.
 * Provides methods to find apps for files and open files/URLs.
 */

import { useCallback, useMemo } from 'react';
import type { FileAssociation, FileTypeCategory, OpenFileOptions, OpenUrlOptions } from './types';
import { fileAssociations } from './FileAssociationRegistry';

/**
 * Hook return type.
 */
export interface UseFileAssociationsReturn {
  /** Get all apps that can handle a file */
  getAppsForFile: (filename: string) => FileAssociation[];

  /** Get the default app for a file */
  getDefaultAppForFile: (filename: string) => string | undefined;

  /** Open a file with an app */
  openFile: (path: string, appId?: string) => void;

  /** Open a URL with the appropriate handler */
  openUrl: (url: string, appId?: string) => void;

  /** Get the file type category */
  getFileCategory: (filename: string) => FileTypeCategory;

  /** Check file type */
  isImage: (filename: string) => boolean;
  isVideo: (filename: string) => boolean;
  isAudio: (filename: string) => boolean;
  isDocument: (filename: string) => boolean;
  isCode: (filename: string) => boolean;
  isArchive: (filename: string) => boolean;
  isMedia: (filename: string) => boolean;

  /** Set default app for extension */
  setDefaultApp: (ext: string, appId: string) => void;

  /** Clear default app for extension */
  clearDefaultApp: (ext: string) => void;

  /** Get extension from filename */
  getExtension: (filename: string) => string;
}

/**
 * useFileAssociations
 *
 * Hook for working with file associations.
 */
export function useFileAssociations(): UseFileAssociationsReturn {
  /**
   * Get extension from a filename.
   */
  const getExtension = useCallback((filename: string): string => {
    return fileAssociations.getExtensionFromFilename(filename);
  }, []);

  /**
   * Get all apps that can handle a file.
   */
  const getAppsForFile = useCallback((filename: string): FileAssociation[] => {
    const ext = fileAssociations.getExtensionFromFilename(filename);
    if (!ext) return [];
    return fileAssociations.getAppsForExtension(ext);
  }, []);

  /**
   * Get the default app for a file.
   */
  const getDefaultAppForFile = useCallback((filename: string): string | undefined => {
    const ext = fileAssociations.getExtensionFromFilename(filename);
    if (!ext) return undefined;
    return fileAssociations.getDefaultApp(ext);
  }, []);

  /**
   * Open a file with an app.
   * Dispatches a custom event that the window manager can handle.
   */
  const openFile = useCallback((path: string, appId?: string): void => {
    const filename = path.split('/').pop() || path;
    const targetAppId = appId || getDefaultAppForFile(filename);

    if (!targetAppId) {
      console.warn(`No app found to open file: ${path}`);
      // Could dispatch error event or show dialog
      window.dispatchEvent(
        new CustomEvent('zos:file-open-error', {
          detail: { path, error: 'No associated app found' },
        })
      );
      return;
    }

    // Dispatch event to open file
    window.dispatchEvent(
      new CustomEvent('zos:open-file', {
        detail: {
          path,
          appId: targetAppId,
          filename,
        } satisfies OpenFileOptions & { filename: string },
      })
    );
  }, [getDefaultAppForFile]);

  /**
   * Open a URL with the appropriate handler.
   */
  const openUrl = useCallback((url: string, appId?: string): void => {
    let targetAppId = appId;

    if (!targetAppId) {
      // Parse URL to get scheme
      try {
        const parsed = new URL(url);
        const scheme = parsed.protocol.replace(':', '');
        const handler = fileAssociations.getUrlSchemeHandler(scheme);
        targetAppId = handler?.appId;
      } catch {
        // Invalid URL, try to detect scheme manually
        const colonIndex = url.indexOf(':');
        if (colonIndex > 0) {
          const scheme = url.slice(0, colonIndex);
          const handler = fileAssociations.getUrlSchemeHandler(scheme);
          targetAppId = handler?.appId;
        }
      }
    }

    if (!targetAppId) {
      console.warn(`No handler found for URL: ${url}`);
      window.dispatchEvent(
        new CustomEvent('zos:url-open-error', {
          detail: { url, error: 'No URL scheme handler found' },
        })
      );
      return;
    }

    // Dispatch event to open URL
    window.dispatchEvent(
      new CustomEvent('zos:open-url', {
        detail: {
          url,
          appId: targetAppId,
        } satisfies OpenUrlOptions,
      })
    );
  }, []);

  /**
   * Get file type category.
   */
  const getFileCategory = useCallback((filename: string): FileTypeCategory => {
    const ext = fileAssociations.getExtensionFromFilename(filename);
    if (!ext) return 'other';
    return fileAssociations.getFileCategory(ext);
  }, []);

  /**
   * Type checking helpers.
   */
  const isImage = useCallback((filename: string): boolean => {
    const ext = fileAssociations.getExtensionFromFilename(filename);
    return ext ? fileAssociations.isImage(ext) : false;
  }, []);

  const isVideo = useCallback((filename: string): boolean => {
    const ext = fileAssociations.getExtensionFromFilename(filename);
    return ext ? fileAssociations.isVideo(ext) : false;
  }, []);

  const isAudio = useCallback((filename: string): boolean => {
    const ext = fileAssociations.getExtensionFromFilename(filename);
    return ext ? fileAssociations.isAudio(ext) : false;
  }, []);

  const isDocument = useCallback((filename: string): boolean => {
    const ext = fileAssociations.getExtensionFromFilename(filename);
    return ext ? fileAssociations.isDocument(ext) : false;
  }, []);

  const isCode = useCallback((filename: string): boolean => {
    const ext = fileAssociations.getExtensionFromFilename(filename);
    return ext ? fileAssociations.isCode(ext) : false;
  }, []);

  const isArchive = useCallback((filename: string): boolean => {
    const ext = fileAssociations.getExtensionFromFilename(filename);
    return ext ? fileAssociations.isArchive(ext) : false;
  }, []);

  const isMedia = useCallback((filename: string): boolean => {
    const ext = fileAssociations.getExtensionFromFilename(filename);
    return ext ? fileAssociations.isMedia(ext) : false;
  }, []);

  /**
   * Default app management.
   */
  const setDefaultApp = useCallback((ext: string, appId: string): void => {
    fileAssociations.setDefaultApp(ext, appId);
  }, []);

  const clearDefaultApp = useCallback((ext: string): void => {
    fileAssociations.clearDefaultApp(ext);
  }, []);

  return useMemo(
    () => ({
      getAppsForFile,
      getDefaultAppForFile,
      openFile,
      openUrl,
      getFileCategory,
      isImage,
      isVideo,
      isAudio,
      isDocument,
      isCode,
      isArchive,
      isMedia,
      setDefaultApp,
      clearDefaultApp,
      getExtension,
    }),
    [
      getAppsForFile,
      getDefaultAppForFile,
      openFile,
      openUrl,
      getFileCategory,
      isImage,
      isVideo,
      isAudio,
      isDocument,
      isCode,
      isArchive,
      isMedia,
      setDefaultApp,
      clearDefaultApp,
      getExtension,
    ]
  );
}
