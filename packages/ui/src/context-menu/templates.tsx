/**
 * Context Menu Templates
 *
 * Factory functions for creating common context menu configurations.
 */

import React from 'react';
import {
  Copy,
  Scissors,
  Clipboard,
  Trash2,
  FileEdit,
  Info,
  Download,
  ExternalLink,
  FolderOpen,
  Share2,
  Archive,
  Eye,
  FileText,
  Image as ImageIcon,
} from 'lucide-react';
import type { ContextMenuItem } from './types';

/** File information for context menu templates */
export interface FileInfo {
  name: string;
  path: string;
  isDirectory?: boolean;
  isReadOnly?: boolean;
}

/** Image information for context menu templates */
export interface ImageInfo {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
}

/** Handlers for file context menu actions */
export interface FileContextMenuHandlers {
  onCut?: () => void;
  onCopy?: () => void;
  onPaste?: () => void;
  onDelete?: () => void;
  onRename?: () => void;
  onGetInfo?: () => void;
  onOpen?: () => void;
  onOpenWith?: () => void;
  onShare?: () => void;
  onCompress?: () => void;
  onQuickLook?: () => void;
}

/** Handlers for text context menu actions */
export interface TextContextMenuHandlers {
  onCut?: () => void;
  onCopy?: () => void;
  onPaste?: () => void;
  onSelectAll?: () => void;
  canCut?: boolean;
  canCopy?: boolean;
  canPaste?: boolean;
}

/** Handlers for image context menu actions */
export interface ImageContextMenuHandlers {
  onCopy?: () => void;
  onSaveAs?: () => void;
  onOpenWith?: () => void;
  onCopyLink?: () => void;
  onViewOriginal?: () => void;
}

/**
 * Create a file context menu
 *
 * @example
 * ```tsx
 * const menu = createFileContextMenu(
 *   { name: 'document.pdf', path: '/documents/document.pdf' },
 *   {
 *     onCopy: () => copyFile(file),
 *     onDelete: () => deleteFile(file),
 *   }
 * );
 * ```
 */
export function createFileContextMenu(
  file: FileInfo,
  handlers: FileContextMenuHandlers
): ContextMenuItem[] {
  const items: ContextMenuItem[] = [];

  // Open actions
  if (handlers.onOpen) {
    items.push({
      id: 'open',
      label: 'Open',
      icon: <FolderOpen className="w-4 h-4" />,
      onClick: handlers.onOpen,
      shortcut: 'Enter',
    });
  }

  if (handlers.onOpenWith) {
    items.push({
      id: 'open-with',
      label: 'Open With...',
      icon: <ExternalLink className="w-4 h-4" />,
      onClick: handlers.onOpenWith,
    });
  }

  if (handlers.onQuickLook) {
    items.push({
      id: 'quick-look',
      label: 'Quick Look',
      icon: <Eye className="w-4 h-4" />,
      onClick: handlers.onQuickLook,
      shortcut: 'Space',
    });
  }

  // Add separator after open actions
  if (items.length > 0) {
    items.push({ id: 'sep-open', type: 'separator' });
  }

  // Edit actions
  if (handlers.onCut) {
    items.push({
      id: 'cut',
      label: 'Cut',
      icon: <Scissors className="w-4 h-4" />,
      onClick: handlers.onCut,
      shortcut: '⌘X',
      disabled: file.isReadOnly,
    });
  }

  if (handlers.onCopy) {
    items.push({
      id: 'copy',
      label: 'Copy',
      icon: <Copy className="w-4 h-4" />,
      onClick: handlers.onCopy,
      shortcut: '⌘C',
    });
  }

  if (handlers.onPaste) {
    items.push({
      id: 'paste',
      label: 'Paste',
      icon: <Clipboard className="w-4 h-4" />,
      onClick: handlers.onPaste,
      shortcut: '⌘V',
    });
  }

  // Add separator if we have edit actions
  if (handlers.onCut || handlers.onCopy || handlers.onPaste) {
    items.push({ id: 'sep-edit', type: 'separator' });
  }

  // File actions
  if (handlers.onRename) {
    items.push({
      id: 'rename',
      label: 'Rename',
      icon: <FileEdit className="w-4 h-4" />,
      onClick: handlers.onRename,
      disabled: file.isReadOnly,
    });
  }

  if (handlers.onCompress) {
    items.push({
      id: 'compress',
      label: file.isDirectory ? 'Compress Folder' : 'Compress',
      icon: <Archive className="w-4 h-4" />,
      onClick: handlers.onCompress,
    });
  }

  if (handlers.onShare) {
    items.push({
      id: 'share',
      label: 'Share...',
      icon: <Share2 className="w-4 h-4" />,
      onClick: handlers.onShare,
    });
  }

  // Delete action
  if (handlers.onDelete) {
    items.push({ id: 'sep-delete', type: 'separator' });
    items.push({
      id: 'delete',
      label: 'Move to Trash',
      icon: <Trash2 className="w-4 h-4" />,
      onClick: handlers.onDelete,
      shortcut: '⌘⌫',
      destructive: true,
      disabled: file.isReadOnly,
    });
  }

  // Get Info
  if (handlers.onGetInfo) {
    items.push({ id: 'sep-info', type: 'separator' });
    items.push({
      id: 'get-info',
      label: 'Get Info',
      icon: <Info className="w-4 h-4" />,
      onClick: handlers.onGetInfo,
      shortcut: '⌘I',
    });
  }

  return items;
}

/**
 * Create a text selection context menu
 *
 * @example
 * ```tsx
 * const menu = createTextContextMenu({
 *   onCopy: () => navigator.clipboard.writeText(selectedText),
 *   onPaste: async () => {
 *     const text = await navigator.clipboard.readText();
 *     insertText(text);
 *   },
 *   canCopy: selectedText.length > 0,
 * });
 * ```
 */
export function createTextContextMenu(
  handlers: TextContextMenuHandlers
): ContextMenuItem[] {
  const items: ContextMenuItem[] = [];

  if (handlers.onCut) {
    items.push({
      id: 'cut',
      label: 'Cut',
      icon: <Scissors className="w-4 h-4" />,
      onClick: handlers.onCut,
      shortcut: '⌘X',
      disabled: handlers.canCut === false,
    });
  }

  if (handlers.onCopy) {
    items.push({
      id: 'copy',
      label: 'Copy',
      icon: <Copy className="w-4 h-4" />,
      onClick: handlers.onCopy,
      shortcut: '⌘C',
      disabled: handlers.canCopy === false,
    });
  }

  if (handlers.onPaste) {
    items.push({
      id: 'paste',
      label: 'Paste',
      icon: <Clipboard className="w-4 h-4" />,
      onClick: handlers.onPaste,
      shortcut: '⌘V',
      disabled: handlers.canPaste === false,
    });
  }

  if (handlers.onSelectAll) {
    if (items.length > 0) {
      items.push({ id: 'sep-select', type: 'separator' });
    }
    items.push({
      id: 'select-all',
      label: 'Select All',
      icon: <FileText className="w-4 h-4" />,
      onClick: handlers.onSelectAll,
      shortcut: '⌘A',
    });
  }

  return items;
}

/**
 * Create an image context menu
 *
 * @example
 * ```tsx
 * const menu = createImageContextMenu(
 *   { src: '/images/photo.jpg', alt: 'Photo' },
 *   {
 *     onCopy: () => copyImageToClipboard(image),
 *     onSaveAs: () => downloadImage(image),
 *   }
 * );
 * ```
 */
export function createImageContextMenu(
  image: ImageInfo,
  handlers: ImageContextMenuHandlers
): ContextMenuItem[] {
  const items: ContextMenuItem[] = [];

  if (handlers.onCopy) {
    items.push({
      id: 'copy',
      label: 'Copy Image',
      icon: <Copy className="w-4 h-4" />,
      onClick: handlers.onCopy,
    });
  }

  if (handlers.onCopyLink) {
    items.push({
      id: 'copy-link',
      label: 'Copy Image Address',
      icon: <ExternalLink className="w-4 h-4" />,
      onClick: handlers.onCopyLink,
    });
  }

  if (handlers.onSaveAs) {
    items.push({
      id: 'save-as',
      label: 'Save Image As...',
      icon: <Download className="w-4 h-4" />,
      onClick: handlers.onSaveAs,
    });
  }

  if (handlers.onOpenWith) {
    if (items.length > 0) {
      items.push({ id: 'sep-open', type: 'separator' });
    }
    items.push({
      id: 'open-with',
      label: 'Open With...',
      icon: <ImageIcon className="w-4 h-4" />,
      onClick: handlers.onOpenWith,
    });
  }

  if (handlers.onViewOriginal) {
    items.push({
      id: 'view-original',
      label: 'View Original',
      icon: <Eye className="w-4 h-4" />,
      onClick: handlers.onViewOriginal,
    });
  }

  return items;
}

/**
 * Create a desktop/background context menu
 *
 * @example
 * ```tsx
 * const menu = createDesktopContextMenu({
 *   onNewFolder: () => createFolder(),
 *   onPaste: () => pasteFromClipboard(),
 *   onSortBy: (criteria) => sortDesktop(criteria),
 * });
 * ```
 */
export interface DesktopContextMenuHandlers {
  onNewFolder?: () => void;
  onNewFile?: () => void;
  onPaste?: () => void;
  onSelectAll?: () => void;
  onSortBy?: (by: 'name' | 'date' | 'size' | 'kind') => void;
  onCleanUp?: () => void;
  onShowViewOptions?: () => void;
  onChangeDesktopBackground?: () => void;
  canPaste?: boolean;
  currentSortBy?: 'name' | 'date' | 'size' | 'kind';
}

export function createDesktopContextMenu(
  handlers: DesktopContextMenuHandlers
): ContextMenuItem[] {
  const items: ContextMenuItem[] = [];

  // New items
  if (handlers.onNewFolder || handlers.onNewFile) {
    const newSubmenu: ContextMenuItem[] = [];

    if (handlers.onNewFolder) {
      newSubmenu.push({
        id: 'new-folder',
        label: 'Folder',
        onClick: handlers.onNewFolder,
        shortcut: '⇧⌘N',
      });
    }

    if (handlers.onNewFile) {
      newSubmenu.push({
        id: 'new-file',
        label: 'File',
        onClick: handlers.onNewFile,
      });
    }

    items.push({
      id: 'new',
      label: 'New',
      submenu: newSubmenu,
    });
  }

  // Edit actions
  if (handlers.onPaste) {
    items.push({
      id: 'paste',
      label: 'Paste',
      icon: <Clipboard className="w-4 h-4" />,
      onClick: handlers.onPaste,
      shortcut: '⌘V',
      disabled: handlers.canPaste === false,
    });
  }

  if (handlers.onSelectAll) {
    items.push({
      id: 'select-all',
      label: 'Select All',
      onClick: handlers.onSelectAll,
      shortcut: '⌘A',
    });
  }

  // View options
  if (handlers.onSortBy || handlers.onCleanUp) {
    items.push({ id: 'sep-view', type: 'separator' });

    if (handlers.onSortBy) {
      items.push({
        id: 'sort-by',
        type: 'radio-group',
        label: 'Sort By',
        value: handlers.currentSortBy || 'name',
        options: [
          { value: 'name', label: 'Name' },
          { value: 'date', label: 'Date Modified' },
          { value: 'size', label: 'Size' },
          { value: 'kind', label: 'Kind' },
        ],
        onChange: (value) =>
          handlers.onSortBy?.(value as 'name' | 'date' | 'size' | 'kind'),
      });
    }

    if (handlers.onCleanUp) {
      items.push({
        id: 'clean-up',
        label: 'Clean Up',
        onClick: handlers.onCleanUp,
      });
    }
  }

  // Settings
  if (handlers.onShowViewOptions || handlers.onChangeDesktopBackground) {
    items.push({ id: 'sep-settings', type: 'separator' });

    if (handlers.onShowViewOptions) {
      items.push({
        id: 'view-options',
        label: 'Show View Options',
        onClick: handlers.onShowViewOptions,
        shortcut: '⌘J',
      });
    }

    if (handlers.onChangeDesktopBackground) {
      items.push({
        id: 'change-background',
        label: 'Change Desktop Background...',
        onClick: handlers.onChangeDesktopBackground,
      });
    }
  }

  return items;
}
