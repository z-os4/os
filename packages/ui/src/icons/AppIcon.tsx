import React from 'react';
import { cn } from '../lib/utils';
import { iconRegistry } from './IconRegistry';
import type { AppIconSize } from './types';

export interface AppIconProps {
  /**
   * Application ID for icon lookup
   */
  appId: string;

  /**
   * Icon size in pixels
   * @default 64
   */
  size?: AppIconSize | number;

  /**
   * Notification badge count (0 = no badge)
   */
  badge?: number;

  /**
   * Custom placeholder gradient colors [start, end]
   */
  placeholderColors?: [string, string];

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
 * AppIcon - macOS-style application icon
 *
 * Features:
 * - Rounded corners (macOS style)
 * - Standard sizes: 16, 32, 64, 128, 256, 512
 * - Gradient placeholder for missing icons
 * - Badge support for notification counts
 *
 * @example
 * ```tsx
 * import { AppIcon } from '@z-os/ui/icons';
 *
 * <AppIcon appId="notes" size={64} />
 * <AppIcon appId="mail" size={128} badge={5} />
 * <AppIcon
 *   appId="unknown-app"
 *   size={64}
 *   placeholderColors={['#FF6B6B', '#4ECDC4']}
 * />
 * ```
 */
export const AppIcon: React.FC<AppIconProps> = ({
  appId,
  size = 64,
  badge = 0,
  placeholderColors = ['#6366F1', '#8B5CF6'],
  className,
  label,
  onClick,
}) => {
  // Get border radius based on size (macOS uses ~22.37% corner radius)
  const borderRadius = Math.round(size * 0.2237);
  const badgeSize = Math.max(16, Math.round(size * 0.25));
  const badgeFontSize = Math.max(10, Math.round(badgeSize * 0.65));
  const badgeOffset = Math.round(size * -0.08);

  // Try to get registered icon
  const RegisteredIcon = iconRegistry.get(appId);

  // Determine what to render
  const renderIcon = () => {
    if (RegisteredIcon) {
      return (
        <RegisteredIcon
          style={{
            width: size,
            height: size,
            borderRadius,
          }}
        />
      );
    }

    // Render placeholder with gradient and initials
    const initials = appId
      .split(/[-_.]/)
      .map(part => part[0]?.toUpperCase() || '')
      .slice(0, 2)
      .join('');

    const gradientId = `app-icon-gradient-${appId}`;

    return (
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        xmlns="http://www.w3.org/2000/svg"
        style={{ borderRadius }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={placeholderColors[0]} />
            <stop offset="100%" stopColor={placeholderColors[1]} />
          </linearGradient>
        </defs>
        {/* Background */}
        <rect
          width={size}
          height={size}
          rx={borderRadius}
          fill={`url(#${gradientId})`}
        />
        {/* Initials */}
        <text
          x="50%"
          y="50%"
          dominantBaseline="central"
          textAnchor="middle"
          fill="white"
          fontSize={size * 0.35}
          fontWeight="600"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          {initials}
        </text>
      </svg>
    );
  };

  return (
    <div
      className={cn(
        'relative inline-flex shrink-0',
        onClick && 'cursor-pointer',
        className
      )}
      style={{
        width: size,
        height: size,
      }}
      role={label ? 'img' : undefined}
      aria-label={label}
      onClick={onClick}
    >
      {/* Icon container with macOS-style rounded corners */}
      <div
        className="overflow-hidden"
        style={{
          width: size,
          height: size,
          borderRadius,
        }}
      >
        {renderIcon()}
      </div>

      {/* Badge */}
      {badge > 0 && (
        <div
          className="absolute flex items-center justify-center bg-red-500 text-white font-semibold"
          style={{
            top: badgeOffset,
            right: badgeOffset,
            minWidth: badgeSize,
            height: badgeSize,
            borderRadius: badgeSize / 2,
            fontSize: badgeFontSize,
            paddingLeft: badgeSize * 0.25,
            paddingRight: badgeSize * 0.25,
          }}
        >
          {badge > 99 ? '99+' : badge}
        </div>
      )}
    </div>
  );
};

AppIcon.displayName = 'AppIcon';
