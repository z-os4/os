/**
 * zOS Icon System
 *
 * A comprehensive icon system for zOS applications featuring:
 * - Icon: Base wrapper for all icons with sizes, colors, spin animation
 * - AppIcon: macOS-style application icons with badges
 * - FileIcon: Extension-based file type icons
 * - SystemIcons: Organized lucide-react re-exports
 * - IconRegistry: Custom app icon registration
 *
 * @example
 * ```tsx
 * import { Icon, AppIcon, FileIcon, Icons, iconRegistry } from '@z-os/ui/icons';
 *
 * // Basic icon usage
 * <Icon icon={Icons.Settings} size="lg" />
 * <Icon icon={Icons.Loader} size={48} spin />
 *
 * // App icons with badges
 * <AppIcon appId="notes" size={64} badge={3} />
 *
 * // File icons
 * <FileIcon filename="document.pdf" size={32} />
 * <FileIcon type="folder" color="#FFD700" size={32} />
 *
 * // Register custom icons
 * iconRegistry.register('com.myapp', MyAppIcon);
 * ```
 */

// Base Icon component
export { Icon, type IconProps } from './Icon';

// Application icons (macOS-style)
export { AppIcon, type AppIconProps } from './AppIcon';

// File type icons
export { FileIcon, type FileIconProps } from './FileIcon';

// Icon registry for custom app icons
export {
  iconRegistry,
  type IconRegistryClass,
  type RegisteredIconComponent,
  type RegisteredIconProps,
} from './IconRegistry';

// System icons (lucide-react re-exports)
export { Icons, type IconName } from './SystemIcons';

// All individual icon exports for destructuring
export * from './SystemIcons';

// Types
export {
  type IconSize,
  type AppIconSize,
  type IconComponent,
  type FileType,
  ICON_SIZE_MAP,
  EXTENSION_TYPE_MAP,
  getFileType,
} from './types';
