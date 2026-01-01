/**
 * ToolbarButton Component
 *
 * Individual toolbar button with icon, label, tooltip, and state handling.
 *
 * @example
 * ```tsx
 * <ToolbarButton
 *   item={{ id: 'save', icon: <SaveIcon />, tooltip: 'Save file' }}
 *   size="md"
 * />
 * ```
 */

import React, { useState, useRef } from 'react';
import { cn } from '../lib/utils';
import type { ToolbarButtonProps, ToolbarSize } from './types';
import { TOOLBAR_BUTTON_SIZES, TOOLBAR_SIZE_CLASSES } from './types';

/**
 * Tooltip component for toolbar items
 */
const Tooltip: React.FC<{
  text: string;
  visible: boolean;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
}> = ({ text, visible, anchorRef }) => {
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

export const ToolbarButton = React.forwardRef<
  HTMLButtonElement,
  ToolbarButtonProps
>(({ item, size = 'md' }, ref) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const tooltipTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sizeClasses = TOOLBAR_SIZE_CLASSES[size];
  const buttonSizes = TOOLBAR_BUTTON_SIZES[size];

  const handleMouseEnter = () => {
    if (item.tooltip) {
      tooltipTimeout.current = setTimeout(() => {
        setShowTooltip(true);
      }, 500); // Delay before showing tooltip
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
    if (!item.disabled && item.onClick) {
      item.onClick();
    }
  };

  // Merge refs
  const setRefs = (node: HTMLButtonElement | null) => {
    (buttonRef as React.MutableRefObject<HTMLButtonElement | null>).current = node;
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  };

  return (
    <div className="relative">
      <button
        ref={setRefs}
        type="button"
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleMouseEnter}
        onBlur={handleMouseLeave}
        disabled={item.disabled}
        aria-label={item.tooltip || item.label}
        aria-pressed={item.type === 'toggle' ? item.active : undefined}
        className={cn(
          'flex items-center justify-center rounded-md transition-all duration-150',
          buttonSizes.padding,
          buttonSizes.minWidth,
          sizeClasses.gap,
          sizeClasses.text,
          // Base styles
          'text-white/70',
          // Hover styles
          'hover:bg-white/10 hover:text-white',
          // Active/pressed state
          item.active && 'bg-white/15 text-white',
          // Click effect
          'active:bg-white/20 active:scale-95',
          // Disabled state
          item.disabled && 'opacity-40 pointer-events-none',
          // Focus ring
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-1 focus-visible:ring-offset-transparent'
        )}
      >
        {item.icon && (
          <span className={cn('flex-shrink-0', sizeClasses.icon)}>
            {item.icon}
          </span>
        )}
        {item.label && <span className="truncate">{item.label}</span>}
      </button>
      <Tooltip
        text={item.tooltip || ''}
        visible={showTooltip}
        anchorRef={buttonRef}
      />
    </div>
  );
});

ToolbarButton.displayName = 'ToolbarButton';

export default ToolbarButton;
