/**
 * Badge Component
 *
 * Small status indicator with various color variants.
 *
 * @example
 * ```tsx
 * <Badge variant="success">Active</Badge>
 * <Badge variant="warning" dot>Pending</Badge>
 * <Badge variant="error" count={5} />
 * ```
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center justify-center font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-white/10 text-white/70',
        primary: 'bg-blue-500/20 text-blue-400',
        success: 'bg-green-500/20 text-green-400',
        warning: 'bg-yellow-500/20 text-yellow-400',
        error: 'bg-red-500/20 text-red-400',
        info: 'bg-cyan-500/20 text-cyan-400',
      },
      size: {
        sm: 'text-xs px-1.5 py-0.5 rounded',
        md: 'text-xs px-2 py-0.5 rounded-md',
        lg: 'text-sm px-2.5 py-1 rounded-md',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  /** Show status dot */
  dot?: boolean;
  /** Numeric count (renders as count badge) */
  count?: number;
  /** Max count before showing + */
  maxCount?: number;
  /** Show zero count */
  showZero?: boolean;
}

const dotVariants: Record<string, string> = {
  default: 'bg-white/50',
  primary: 'bg-blue-400',
  success: 'bg-green-400',
  warning: 'bg-yellow-400',
  error: 'bg-red-400',
  info: 'bg-cyan-400',
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      className,
      variant = 'default',
      size,
      dot,
      count,
      maxCount = 99,
      showZero = false,
      children,
      ...props
    },
    ref
  ) => {
    // Count badge mode
    if (count !== undefined) {
      if (count === 0 && !showZero) {
        return null;
      }

      const displayCount = count > maxCount ? `${maxCount}+` : String(count);

      return (
        <span
          ref={ref}
          className={cn(
            'inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5',
            'text-xs font-medium rounded-full',
            variant === 'default' ? 'bg-white/20 text-white' : badgeVariants({ variant }),
            className
          )}
          {...props}
        >
          {displayCount}
        </span>
      );
    }

    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant, size, className }))}
        {...props}
      >
        {dot && (
          <span
            className={cn(
              'w-1.5 h-1.5 rounded-full mr-1.5',
              dotVariants[variant || 'default']
            )}
            aria-hidden="true"
          />
        )}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export { badgeVariants };
