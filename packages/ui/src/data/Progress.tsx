/**
 * Progress Component
 *
 * Progress bars and circular progress indicators.
 *
 * @example
 * ```tsx
 * <Progress value={75} />
 * <Progress value={50} variant="circular" />
 * <Progress value={30} showLabel />
 * <Progress indeterminate />
 * ```
 */

import React from 'react';
import { cn } from '../lib/utils';
import type { Size, StatusVariant } from './types';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Progress value (0-100) */
  value?: number;
  /** Maximum value */
  max?: number;
  /** Indeterminate loading state */
  indeterminate?: boolean;
  /** Display variant */
  variant?: 'linear' | 'circular';
  /** Color variant */
  color?: StatusVariant;
  /** Size */
  size?: Size;
  /** Show percentage label */
  showLabel?: boolean;
  /** Custom label format */
  formatLabel?: (value: number, max: number) => string;
  /** Animate value changes */
  animated?: boolean;
}

const colorStyles: Record<StatusVariant, { bg: string; fill: string }> = {
  default: { bg: 'bg-white/10', fill: 'bg-white/50' },
  primary: { bg: 'bg-blue-500/20', fill: 'bg-blue-500' },
  success: { bg: 'bg-green-500/20', fill: 'bg-green-500' },
  warning: { bg: 'bg-yellow-500/20', fill: 'bg-yellow-500' },
  error: { bg: 'bg-red-500/20', fill: 'bg-red-500' },
  info: { bg: 'bg-cyan-500/20', fill: 'bg-cyan-500' },
};

const strokeColors: Record<StatusVariant, string> = {
  default: 'stroke-white/50',
  primary: 'stroke-blue-500',
  success: 'stroke-green-500',
  warning: 'stroke-yellow-500',
  error: 'stroke-red-500',
  info: 'stroke-cyan-500',
};

const sizeStyles = {
  sm: { height: 'h-1', text: 'text-xs' },
  md: { height: 'h-2', text: 'text-sm' },
  lg: { height: 'h-3', text: 'text-base' },
};

const circularSizes = {
  sm: { size: 32, stroke: 3 },
  md: { size: 48, stroke: 4 },
  lg: { size: 64, stroke: 5 },
};

interface InternalProgressProps extends ProgressProps {
  innerRef?: React.ForwardedRef<HTMLDivElement>;
}

function LinearProgress({
  value = 0,
  max = 100,
  indeterminate,
  color = 'primary',
  size = 'md',
  showLabel,
  formatLabel,
  animated = true,
  className,
  innerRef,
  ...props
}: InternalProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const colors = colorStyles[color];
  const sizes = sizeStyles[size];

  const label = formatLabel
    ? formatLabel(value, max)
    : `${Math.round(percentage)}%`;

  return (
    <div
      ref={innerRef}
      role="progressbar"
      aria-valuenow={indeterminate ? undefined : value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={indeterminate ? 'Loading' : label}
      className={cn('w-full', className)}
      {...props}
    >
      {showLabel && !indeterminate && (
        <div className={cn('mb-1 text-white/70', sizes.text)}>{label}</div>
      )}
      <div
        className={cn(
          'w-full rounded-full overflow-hidden',
          colors.bg,
          sizes.height
        )}
      >
        <div
          className={cn(
            'h-full rounded-full',
            colors.fill,
            animated && !indeterminate && 'transition-all duration-300',
            indeterminate && 'animate-progress-indeterminate'
          )}
          style={
            indeterminate
              ? { width: '30%' }
              : { width: `${percentage}%` }
          }
        />
      </div>

      <style>{`
        @keyframes progress-indeterminate {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
        .animate-progress-indeterminate {
          animation: progress-indeterminate 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

function CircularProgress({
  value = 0,
  max = 100,
  indeterminate,
  color = 'primary',
  size = 'md',
  showLabel,
  formatLabel,
  animated = true,
  className,
  innerRef,
  ...props
}: InternalProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const { size: circleSize, stroke } = circularSizes[size];
  const radius = (circleSize - stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  const label = formatLabel
    ? formatLabel(value, max)
    : `${Math.round(percentage)}%`;

  return (
    <div
      ref={innerRef}
      role="progressbar"
      aria-valuenow={indeterminate ? undefined : value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={indeterminate ? 'Loading' : label}
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: circleSize, height: circleSize }}
      {...props}
    >
      <svg
        className={cn(
          'transform -rotate-90',
          indeterminate && 'animate-spin'
        )}
        width={circleSize}
        height={circleSize}
      >
        {/* Background circle */}
        <circle
          className="stroke-white/10"
          fill="none"
          strokeWidth={stroke}
          r={radius}
          cx={circleSize / 2}
          cy={circleSize / 2}
        />
        {/* Progress circle */}
        <circle
          className={cn(
            strokeColors[color],
            animated && !indeterminate && 'transition-all duration-300'
          )}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          r={radius}
          cx={circleSize / 2}
          cy={circleSize / 2}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: indeterminate ? circumference * 0.75 : offset,
          }}
        />
      </svg>

      {showLabel && !indeterminate && (
        <span
          className={cn(
            'absolute text-white/70 font-medium',
            sizeStyles[size].text
          )}
        >
          {label}
        </span>
      )}
    </div>
  );
}

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ variant = 'linear', ...props }, ref) => {
    if (variant === 'circular') {
      return <CircularProgress innerRef={ref} {...props} />;
    }
    return <LinearProgress innerRef={ref} {...props} />;
  }
);

Progress.displayName = 'Progress';
