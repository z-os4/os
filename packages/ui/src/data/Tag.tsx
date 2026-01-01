/**
 * Tag Component
 *
 * Removable tags for categorization and filtering.
 *
 * @example
 * ```tsx
 * <Tag onRemove={handleRemove}>React</Tag>
 * <Tag color="blue" icon={<Code />}>TypeScript</Tag>
 * <TagGroup>
 *   <Tag>Tag 1</Tag>
 *   <Tag>Tag 2</Tag>
 * </TagGroup>
 * ```
 */

import React from 'react';
import { cn } from '../lib/utils';

export type TagColor =
  | 'default'
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'blue'
  | 'purple'
  | 'pink'
  | 'cyan';

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Tag color */
  color?: TagColor;
  /** Icon before label */
  icon?: React.ReactNode;
  /** Show remove button */
  onRemove?: () => void;
  /** Whether tag is selected */
  selected?: boolean;
  /** Whether tag is disabled */
  disabled?: boolean;
  /** Tag size */
  size?: 'sm' | 'md' | 'lg';
  /** Make tag clickable */
  onClick?: () => void;
}

const colorStyles: Record<TagColor, string> = {
  default: 'bg-white/10 text-white/80 border-white/10',
  red: 'bg-red-500/10 text-red-400 border-red-500/20',
  orange: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  yellow: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  green: 'bg-green-500/10 text-green-400 border-green-500/20',
  blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  pink: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
};

const sizeStyles = {
  sm: 'text-xs px-1.5 py-0.5 gap-1',
  md: 'text-sm px-2 py-0.5 gap-1.5',
  lg: 'text-sm px-2.5 py-1 gap-2',
};

function CloseIcon() {
  return (
    <svg
      className="w-3 h-3"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

export const Tag = React.forwardRef<HTMLSpanElement, TagProps>(
  (
    {
      className,
      color = 'default',
      icon,
      onRemove,
      selected,
      disabled,
      size = 'md',
      onClick,
      children,
      ...props
    },
    ref
  ) => {
    const isInteractive = onClick && !disabled;

    const handleRemove = (e: React.MouseEvent) => {
      e.stopPropagation();
      onRemove?.();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (disabled) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick?.();
      }
      if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        onRemove?.();
      }
    };

    return (
      <span
        ref={ref}
        role={isInteractive ? 'button' : undefined}
        tabIndex={isInteractive ? 0 : undefined}
        className={cn(
          'inline-flex items-center rounded-md border font-medium transition-colors',
          colorStyles[color],
          sizeStyles[size],
          isInteractive && 'cursor-pointer hover:brightness-110',
          selected && 'ring-2 ring-blue-500/50',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        onClick={isInteractive ? onClick : undefined}
        onKeyDown={isInteractive || onRemove ? handleKeyDown : undefined}
        {...props}
      >
        {icon && <span className="flex-shrink-0">{icon}</span>}
        <span className="truncate">{children}</span>
        {onRemove && !disabled && (
          <button
            type="button"
            className={cn(
              'flex-shrink-0 rounded hover:bg-white/10 p-0.5 transition-colors',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50'
            )}
            onClick={handleRemove}
            aria-label="Remove tag"
            tabIndex={-1}
          >
            <CloseIcon />
          </button>
        )}
      </span>
    );
  }
);

Tag.displayName = 'Tag';

/**
 * TagGroup - Container for multiple tags
 */
export interface TagGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Spacing between tags */
  spacing?: 'sm' | 'md' | 'lg';
  /** Wrap tags to multiple lines */
  wrap?: boolean;
}

export const TagGroup = React.forwardRef<HTMLDivElement, TagGroupProps>(
  ({ className, spacing = 'sm', wrap = true, children, ...props }, ref) => {
    const spacingStyles = {
      sm: 'gap-1',
      md: 'gap-2',
      lg: 'gap-3',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center',
          spacingStyles[spacing],
          wrap && 'flex-wrap',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

TagGroup.displayName = 'TagGroup';
