/**
 * Gutter Component
 *
 * Draggable separator between split panes.
 * Supports mouse, touch, and keyboard interaction.
 */

import React, { useCallback, useRef } from 'react';
import { cn } from '../lib/utils';
import type { GutterProps } from './types';

// Keyboard resize step in pixels
const KEYBOARD_STEP = 10;
const KEYBOARD_STEP_LARGE = 50;

export const Gutter: React.FC<GutterProps> = ({
  index,
  direction,
  size,
  isDragging = false,
  onDragStart,
  onDoubleClick,
  onKeyDown,
  className,
}) => {
  const gutterRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      onDragStart(index, e);
    },
    [index, onDragStart]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      onDragStart(index, e);
    },
    [index, onDragStart]
  );

  const handleDoubleClick = useCallback(() => {
    onDoubleClick?.(index);
  }, [index, onDoubleClick]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const { key, shiftKey } = e;
      const step = shiftKey ? KEYBOARD_STEP_LARGE : KEYBOARD_STEP;

      // Map keys based on direction
      const isHorizontal = direction === 'horizontal';
      const decreaseKey = isHorizontal ? 'ArrowLeft' : 'ArrowUp';
      const increaseKey = isHorizontal ? 'ArrowRight' : 'ArrowDown';

      if (key === decreaseKey || key === increaseKey) {
        e.preventDefault();
        onKeyDown?.(index, e);
      } else if (key === 'Enter' || key === ' ') {
        e.preventDefault();
        onDoubleClick?.(index);
      } else if (key === 'Home') {
        e.preventDefault();
        onKeyDown?.(index, e);
      } else if (key === 'End') {
        e.preventDefault();
        onKeyDown?.(index, e);
      }
    },
    [direction, index, onKeyDown, onDoubleClick]
  );

  const isHorizontal = direction === 'horizontal';

  return (
    <div
      ref={gutterRef}
      role="separator"
      aria-orientation={isHorizontal ? 'vertical' : 'horizontal'}
      aria-valuenow={50}
      aria-valuemin={0}
      aria-valuemax={100}
      tabIndex={0}
      className={cn(
        // Base styles
        'flex-shrink-0 select-none',
        'transition-colors duration-150',
        // Direction-specific styles
        isHorizontal
          ? 'cursor-col-resize'
          : 'cursor-row-resize',
        // Size
        isHorizontal
          ? 'h-full'
          : 'w-full',
        // Visual styles
        'bg-white/5 hover:bg-white/20',
        'border-0',
        // Active/dragging state
        isDragging && 'bg-white/30',
        // Focus styles
        'focus:outline-none focus:bg-white/25',
        'focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-inset',
        className
      )}
      style={{
        [isHorizontal ? 'width' : 'height']: size,
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleKeyDown}
    >
      {/* Visual grip indicator */}
      <div
        className={cn(
          'flex items-center justify-center',
          'w-full h-full',
          'opacity-0 hover:opacity-100 transition-opacity',
          isDragging && 'opacity-100'
        )}
      >
        <div
          className={cn(
            'bg-white/40 rounded-full',
            isHorizontal
              ? 'w-1 h-8'
              : 'w-8 h-1'
          )}
        />
      </div>
    </div>
  );
};

Gutter.displayName = 'Gutter';
