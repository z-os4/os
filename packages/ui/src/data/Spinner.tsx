/**
 * Spinner Component
 *
 * Loading spinner with various sizes and colors.
 *
 * @example
 * ```tsx
 * <Spinner />
 * <Spinner size="lg" color="primary" />
 * <Spinner label="Loading data..." />
 * ```
 */

import React from 'react';
import { cn } from '../lib/utils';
import type { Size, StatusVariant } from './types';

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Spinner size */
  size?: Size | 'xs' | 'xl';
  /** Color variant */
  color?: StatusVariant;
  /** Loading label */
  label?: string;
  /** Show label below spinner */
  showLabel?: boolean;
  /** Spinner thickness */
  thickness?: 'thin' | 'normal' | 'thick';
}

const sizeStyles = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
};

const textSizes = {
  xs: 'text-xs',
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-lg',
};

const colorStyles: Record<StatusVariant, string> = {
  default: 'border-white/30 border-t-white',
  primary: 'border-blue-500/30 border-t-blue-500',
  success: 'border-green-500/30 border-t-green-500',
  warning: 'border-yellow-500/30 border-t-yellow-500',
  error: 'border-red-500/30 border-t-red-500',
  info: 'border-cyan-500/30 border-t-cyan-500',
};

const thicknessStyles = {
  thin: 'border',
  normal: 'border-2',
  thick: 'border-3',
};

export const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  (
    {
      className,
      size = 'md',
      color = 'default',
      label,
      showLabel = false,
      thickness = 'normal',
      ...props
    },
    ref
  ) => {
    const accessibleLabel = label || 'Loading';

    return (
      <div
        ref={ref}
        role="status"
        aria-label={accessibleLabel}
        className={cn(
          'inline-flex flex-col items-center justify-center gap-2',
          className
        )}
        {...props}
      >
        <div
          className={cn(
            'rounded-full animate-spin',
            sizeStyles[size],
            colorStyles[color],
            thicknessStyles[thickness]
          )}
          aria-hidden="true"
        />
        {showLabel && label && (
          <span className={cn('text-white/70', textSizes[size])}>{label}</span>
        )}
        <span className="sr-only">{accessibleLabel}</span>
      </div>
    );
  }
);

Spinner.displayName = 'Spinner';

/**
 * LoadingOverlay - Full container loading overlay with spinner
 */
export interface LoadingOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Whether loading is active */
  loading?: boolean;
  /** Spinner size */
  size?: SpinnerProps['size'];
  /** Loading label */
  label?: string;
  /** Show label */
  showLabel?: boolean;
  /** Blur background content */
  blur?: boolean;
}

export const LoadingOverlay = React.forwardRef<HTMLDivElement, LoadingOverlayProps>(
  (
    {
      className,
      loading = true,
      size = 'lg',
      label = 'Loading...',
      showLabel = true,
      blur = true,
      children,
      ...props
    },
    ref
  ) => {
    if (!loading) {
      return <>{children}</>;
    }

    return (
      <div ref={ref} className={cn('relative', className)} {...props}>
        {children && (
          <div className={cn(blur && 'blur-sm pointer-events-none')}>
            {children}
          </div>
        )}
        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center',
            'bg-black/30 backdrop-blur-sm'
          )}
        >
          <Spinner size={size} label={label} showLabel={showLabel} color="primary" />
        </div>
      </div>
    );
  }
);

LoadingOverlay.displayName = 'LoadingOverlay';

/**
 * Skeleton - Loading placeholder with shimmer effect
 */
export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Width of skeleton */
  width?: number | string;
  /** Height of skeleton */
  height?: number | string;
  /** Make skeleton circular */
  circle?: boolean;
  /** Number of lines for text skeleton */
  lines?: number;
  /** Disable animation */
  static?: boolean;
}

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  (
    {
      className,
      width,
      height,
      circle,
      lines,
      static: isStatic,
      ...props
    },
    ref
  ) => {
    if (lines && lines > 1) {
      return (
        <div ref={ref} className={cn('space-y-2', className)} {...props}>
          {Array.from({ length: lines }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'bg-white/10 rounded',
                !isStatic && 'animate-pulse',
                i === lines - 1 && 'w-3/4' // Last line shorter
              )}
              style={{ height: height || 16 }}
            />
          ))}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          'bg-white/10',
          circle ? 'rounded-full' : 'rounded',
          !isStatic && 'animate-pulse',
          className
        )}
        style={{
          width: width || (circle ? height : '100%'),
          height: height || 16,
        }}
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';
