import React from 'react';
import {
  File,
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  FileCode,
  FileArchive,
  FileSpreadsheet,
  Presentation,
  Database,
  Settings,
  Type,
  Package,
  Folder,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { type FileType, type IconSize, getFileType, ICON_SIZE_MAP } from './types';

export interface FileIconProps {
  /**
   * Filename (used to determine file type from extension)
   */
  filename?: string;

  /**
   * Explicit file type (overrides filename-based detection)
   */
  type?: FileType;

  /**
   * Icon size - preset name or pixel value
   * @default 'md'
   */
  size?: IconSize;

  /**
   * Custom color for folder icons
   */
  color?: string;

  /**
   * Thumbnail URL for preview (images/videos)
   */
  thumbnail?: string;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Accessible label
   */
  label?: string;

  /**
   * Click handler
   */
  onClick?: (e: React.MouseEvent) => void;
}

/**
 * File type to Lucide icon mapping
 */
const FILE_TYPE_ICONS: Record<FileType, React.ComponentType<{ className?: string; color?: string }>> = {
  folder: Folder,
  document: FileText,
  image: FileImage,
  video: FileVideo,
  audio: FileAudio,
  code: FileCode,
  archive: FileArchive,
  pdf: FileText,
  spreadsheet: FileSpreadsheet,
  presentation: Presentation,
  text: FileText,
  executable: Package,
  font: Type,
  database: Database,
  config: Settings,
  unknown: File,
};

/**
 * File type to default color mapping
 */
const FILE_TYPE_COLORS: Record<FileType, string> = {
  folder: '#5AC8FA',
  document: '#007AFF',
  image: '#34C759',
  video: '#AF52DE',
  audio: '#FF2D55',
  code: '#FF9500',
  archive: '#8E8E93',
  pdf: '#FF3B30',
  spreadsheet: '#34C759',
  presentation: '#FF9500',
  text: '#8E8E93',
  executable: '#636366',
  font: '#5856D6',
  database: '#FF9500',
  config: '#8E8E93',
  unknown: '#8E8E93',
};

/**
 * FileIcon - File type icons with extension-based detection
 *
 * Features:
 * - Automatic icon selection based on file extension
 * - Custom folder colors
 * - Thumbnail preview support for images/videos
 * - All standard file types covered
 *
 * @example
 * ```tsx
 * import { FileIcon } from '@z-os/ui/icons';
 *
 * <FileIcon filename="document.pdf" size={32} />
 * <FileIcon type="folder" color="#FFD700" size={32} />
 * <FileIcon filename="photo.jpg" thumbnail="/path/to/thumb.jpg" size={64} />
 * ```
 */
export const FileIcon: React.FC<FileIconProps> = ({
  filename,
  type,
  size = 'md',
  color,
  thumbnail,
  className,
  label,
  onClick,
}) => {
  // Determine file type
  const fileType = type || (filename ? getFileType(filename) : 'unknown');

  // Resolve size to pixels
  const sizeInPixels = typeof size === 'number' ? size : ICON_SIZE_MAP[size];

  // Get the appropriate icon component
  const IconComponent = FILE_TYPE_ICONS[fileType];

  // Determine color
  const iconColor = color || FILE_TYPE_COLORS[fileType];

  // If we have a thumbnail and it's an image/video type, render thumbnail
  if (thumbnail && (fileType === 'image' || fileType === 'video')) {
    return (
      <div
        className={cn(
          'relative overflow-hidden rounded shrink-0',
          onClick && 'cursor-pointer',
          className
        )}
        style={{
          width: sizeInPixels,
          height: sizeInPixels,
        }}
        role={label ? 'img' : undefined}
        aria-label={label}
        onClick={onClick}
      >
        <img
          src={thumbnail}
          alt={label || filename || 'File thumbnail'}
          className="w-full h-full object-cover"
        />
        {/* Video play overlay */}
        {fileType === 'video' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div
              className="w-0 h-0 border-solid"
              style={{
                borderWidth: `${sizeInPixels * 0.15}px 0 ${sizeInPixels * 0.15}px ${sizeInPixels * 0.25}px`,
                borderColor: 'transparent transparent transparent white',
              }}
            />
          </div>
        )}
      </div>
    );
  }

  // Render folder with custom color
  if (fileType === 'folder') {
    return (
      <svg
        width={sizeInPixels}
        height={sizeInPixels}
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        className={cn('shrink-0', onClick && 'cursor-pointer', className)}
        role={label ? 'img' : undefined}
        aria-label={label}
        onClick={onClick}
      >
        <defs>
          <linearGradient id="folderGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={iconColor} />
            <stop offset="100%" stopColor={adjustColor(iconColor, -20)} />
          </linearGradient>
        </defs>
        {/* Folder back */}
        <path
          d="M2 6C2 4.89543 2.89543 4 4 4H9L11 6H20C21.1046 6 22 6.89543 22 8V18C22 19.1046 21.1046 20 20 20H4C2.89543 20 2 19.1046 2 18V6Z"
          fill={adjustColor(iconColor, -10)}
        />
        {/* Folder front */}
        <path
          d="M2 8C2 6.89543 2.89543 6 4 6H20C21.1046 6 22 6.89543 22 8V18C22 19.1046 21.1046 20 20 20H4C2.89543 20 2 19.1046 2 18V8Z"
          fill="url(#folderGradient)"
        />
      </svg>
    );
  }

  // Render standard file icon
  return (
    <div
      className={cn('shrink-0 inline-flex', onClick && 'cursor-pointer', className)}
      style={{
        width: sizeInPixels,
        height: sizeInPixels,
      }}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={!label}
      onClick={onClick}
    >
      <IconComponent
        className="w-full h-full"
        color={iconColor}
      />
    </div>
  );
};

FileIcon.displayName = 'FileIcon';

/**
 * Adjust a hex color by a percentage
 */
function adjustColor(color: string, percent: number): string {
  const num = parseInt(color.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, ((num >> 16) & 0xff) + Math.round(2.55 * percent)));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + Math.round(2.55 * percent)));
  const b = Math.min(255, Math.max(0, (num & 0xff) + Math.round(2.55 * percent)));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}
