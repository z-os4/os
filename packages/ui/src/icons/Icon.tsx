import React from 'react';
import { cn } from '../lib/utils';
import { type IconComponent, type IconSize, ICON_SIZE_MAP } from './types';

export interface IconProps {
  /**
   * The icon component to render
   */
  icon: IconComponent;

  /**
   * Icon size - preset name or pixel value
   * @default 'md'
   */
  size?: IconSize;

  /**
   * Icon color
   * @default 'currentColor'
   */
  color?: string;

  /**
   * Enable spin animation (useful for loading states)
   */
  spin?: boolean;

  /**
   * Accessible label for the icon
   */
  label?: string;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Click handler
   */
  onClick?: (e: React.MouseEvent) => void;
}

/**
 * Icon - A wrapper component for all icons
 *
 * Features:
 * - Size presets (xs, sm, md, lg, xl) or custom pixel values
 * - Custom colors
 * - Spin animation for loading states
 * - Accessibility support with aria-label
 *
 * @example
 * ```tsx
 * import { Icon, Icons } from '@z-os/ui/icons';
 *
 * <Icon icon={Icons.Settings} size="lg" />
 * <Icon icon={Icons.Loader} size={48} spin />
 * <Icon icon={Icons.Heart} color="#FF0000" label="Favorite" />
 * ```
 */
export const Icon: React.FC<IconProps> = ({
  icon: IconComponent,
  size = 'md',
  color = 'currentColor',
  spin = false,
  label,
  className,
  onClick,
}) => {
  // Resolve size to pixels
  const sizeInPixels = typeof size === 'number' ? size : ICON_SIZE_MAP[size];

  return (
    <IconComponent
      width={sizeInPixels}
      height={sizeInPixels}
      color={color}
      className={cn(
        'shrink-0',
        spin && 'animate-spin',
        onClick && 'cursor-pointer',
        className
      )}
      aria-label={label}
      aria-hidden={!label}
      role={label ? 'img' : undefined}
      onClick={onClick}
    />
  );
};

Icon.displayName = 'Icon';
