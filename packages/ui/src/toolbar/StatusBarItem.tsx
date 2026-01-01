/**
 * StatusBarItem Component
 *
 * Individual item for the status bar with click handling and tooltip.
 *
 * @example
 * ```tsx
 * <StatusBarItem
 *   item={{
 *     id: 'line',
 *     content: 'Ln 42, Col 18',
 *     tooltip: 'Go to line',
 *     onClick: handleGoToLine
 *   }}
 * />
 * ```
 */

import React, { useState, useRef } from 'react';
import { cn } from '../lib/utils';
import type { StatusBarItemProps } from './types';

/**
 * Tooltip component for status bar items
 */
const StatusBarTooltip: React.FC<{
  text: string;
  visible: boolean;
}> = ({ text, visible }) => {
  if (!visible || !text) return null;

  return (
    <div
      className={cn(
        'absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5',
        'px-2 py-1 rounded-md text-xs font-medium',
        'bg-zinc-800/95 text-white/90 shadow-lg',
        'border border-white/10 backdrop-blur-sm',
        'whitespace-nowrap z-50',
        'animate-in fade-in-0 zoom-in-95 duration-150'
      )}
      role="tooltip"
    >
      {text}
      {/* Arrow */}
      <div
        className={cn(
          'absolute top-full left-1/2 -translate-x-1/2',
          'w-0 h-0 border-l-4 border-r-4 border-t-4',
          'border-l-transparent border-r-transparent border-t-zinc-800/95'
        )}
      />
    </div>
  );
};

export const StatusBarItem = React.forwardRef<
  HTMLDivElement,
  StatusBarItemProps
>(({ item }, ref) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    if (item.tooltip) {
      tooltipTimeout.current = setTimeout(() => {
        setShowTooltip(true);
      }, 500);
    }
  };

  const handleMouseLeave = () => {
    if (tooltipTimeout.current) {
      clearTimeout(tooltipTimeout.current);
      tooltipTimeout.current = null;
    }
    setShowTooltip(false);
  };

  const handleClick = () => {
    if (item.onClick) {
      item.onClick();
    }
  };

  const isClickable = !!item.onClick;

  return (
    <div
      ref={ref}
      className={cn(
        'relative px-2 py-0.5 text-xs text-white/60 select-none',
        'transition-colors duration-150',
        isClickable && [
          'cursor-pointer',
          'hover:text-white/90 hover:bg-white/5',
          'active:bg-white/10',
        ]
      )}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onKeyDown={(e) => {
        if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleClick();
        }
      }}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
    >
      {item.content}
      <StatusBarTooltip text={item.tooltip || ''} visible={showTooltip} />
    </div>
  );
});

StatusBarItem.displayName = 'StatusBarItem';

export default StatusBarItem;
