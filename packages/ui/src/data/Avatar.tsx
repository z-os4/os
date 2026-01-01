/**
 * Avatar and AvatarGroup Components
 *
 * User avatars with fallback initials and status indicators.
 *
 * @example
 * ```tsx
 * <Avatar src="/user.jpg" alt="John Doe" />
 * <Avatar name="John Doe" />
 * <Avatar status="online" size="lg">JD</Avatar>
 *
 * <AvatarGroup max={3}>
 *   <Avatar src="/user1.jpg" />
 *   <Avatar src="/user2.jpg" />
 *   <Avatar src="/user3.jpg" />
 *   <Avatar src="/user4.jpg" />
 * </AvatarGroup>
 * ```
 */

import React, { useState, useMemo } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

const avatarVariants = cva(
  'relative inline-flex items-center justify-center rounded-full bg-white/10 text-white font-medium overflow-hidden',
  {
    variants: {
      size: {
        xs: 'w-6 h-6 text-xs',
        sm: 'w-8 h-8 text-sm',
        md: 'w-10 h-10 text-base',
        lg: 'w-12 h-12 text-lg',
        xl: 'w-16 h-16 text-xl',
        '2xl': 'w-20 h-20 text-2xl',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

export type AvatarStatus = 'online' | 'offline' | 'busy' | 'away';

export interface AvatarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarVariants> {
  /** Image source */
  src?: string;
  /** Alt text for image */
  alt?: string;
  /** Name to generate initials from */
  name?: string;
  /** Status indicator */
  status?: AvatarStatus;
  /** Fallback content when no image */
  children?: React.ReactNode;
  /** Click handler */
  onClick?: () => void;
}

const statusColors: Record<AvatarStatus, string> = {
  online: 'bg-green-500',
  offline: 'bg-gray-500',
  busy: 'bg-red-500',
  away: 'bg-yellow-500',
};

const statusSizes: Record<string, string> = {
  xs: 'w-1.5 h-1.5 border',
  sm: 'w-2 h-2 border',
  md: 'w-2.5 h-2.5 border-2',
  lg: 'w-3 h-3 border-2',
  xl: 'w-3.5 h-3.5 border-2',
  '2xl': 'w-4 h-4 border-2',
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return '';
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function hashStringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const colors = [
    'bg-red-500/30',
    'bg-orange-500/30',
    'bg-amber-500/30',
    'bg-yellow-500/30',
    'bg-lime-500/30',
    'bg-green-500/30',
    'bg-emerald-500/30',
    'bg-teal-500/30',
    'bg-cyan-500/30',
    'bg-sky-500/30',
    'bg-blue-500/30',
    'bg-indigo-500/30',
    'bg-violet-500/30',
    'bg-purple-500/30',
    'bg-fuchsia-500/30',
    'bg-pink-500/30',
    'bg-rose-500/30',
  ];

  return colors[Math.abs(hash) % colors.length];
}

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  (
    { className, size = 'md', src, alt, name, status, children, onClick, ...props },
    ref
  ) => {
    const [imageError, setImageError] = useState(false);

    const initials = useMemo(() => {
      if (children) return null;
      if (name) return getInitials(name);
      return null;
    }, [children, name]);

    const bgColor = useMemo(() => {
      if (src && !imageError) return '';
      if (name) return hashStringToColor(name);
      return '';
    }, [src, imageError, name]);

    const showImage = src && !imageError;
    const isClickable = !!onClick;

    return (
      <div
        ref={ref}
        role={isClickable ? 'button' : undefined}
        tabIndex={isClickable ? 0 : undefined}
        className={cn(
          avatarVariants({ size }),
          bgColor,
          isClickable && 'cursor-pointer hover:ring-2 hover:ring-white/30',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50',
          className
        )}
        onClick={onClick}
        onKeyDown={
          isClickable
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onClick();
                }
              }
            : undefined
        }
        {...props}
      >
        {showImage ? (
          <img
            src={src}
            alt={alt || name || 'Avatar'}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : children ? (
          children
        ) : initials ? (
          <span aria-hidden="true">{initials}</span>
        ) : (
          <svg
            className="w-1/2 h-1/2 text-white/50"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        )}

        {status && (
          <span
            className={cn(
              'absolute bottom-0 right-0 rounded-full border-[color:inherit]',
              'border-[--zos-bg-primary,#000]',
              statusColors[status],
              statusSizes[size || 'md']
            )}
            aria-label={`Status: ${status}`}
          />
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

/**
 * AvatarGroup - Display multiple avatars in a stacked layout
 */
export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Maximum avatars to show before +N indicator */
  max?: number;
  /** Avatar size */
  size?: VariantProps<typeof avatarVariants>['size'];
  /** Spacing between avatars (negative for overlap) */
  spacing?: 'tight' | 'normal' | 'loose';
}

const spacingStyles = {
  tight: '-space-x-3',
  normal: '-space-x-2',
  loose: '-space-x-1',
};

export const AvatarGroup = React.forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ className, max, size = 'md', spacing = 'normal', children, ...props }, ref) => {
    const childArray = React.Children.toArray(children);
    const visibleCount = max ? Math.min(max, childArray.length) : childArray.length;
    const remainingCount = childArray.length - visibleCount;

    return (
      <div
        ref={ref}
        className={cn('flex items-center', spacingStyles[spacing], className)}
        {...props}
      >
        {childArray.slice(0, visibleCount).map((child, index) => {
          if (React.isValidElement<AvatarProps>(child)) {
            return React.cloneElement(child, {
              key: index,
              size,
              className: cn(
                'ring-2 ring-[--zos-bg-primary,#000]',
                child.props.className
              ),
            });
          }
          return child;
        })}

        {remainingCount > 0 && (
          <div
            className={cn(
              avatarVariants({ size }),
              'bg-white/20 ring-2 ring-[--zos-bg-primary,#000]'
            )}
            aria-label={`${remainingCount} more`}
          >
            +{remainingCount}
          </div>
        )}
      </div>
    );
  }
);

AvatarGroup.displayName = 'AvatarGroup';

export { avatarVariants };
