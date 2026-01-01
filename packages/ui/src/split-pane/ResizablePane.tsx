/**
 * ResizablePane Component
 *
 * A single pane with one resize handle on either side.
 * Simpler alternative to SplitPane when you only need one resizable panel.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '../lib/utils';
import type { ResizablePaneProps, PaneSize } from './types';

// Default values
const DEFAULT_SIZE = 250;
const DEFAULT_MIN_SIZE = 100;
const DEFAULT_MAX_SIZE = Infinity;

/**
 * Parse a size value to pixels.
 */
function parseSizeToPixels(
  size: PaneSize | undefined,
  containerSize: number,
  fallback: number
): number {
  if (size === undefined || size === 'auto') {
    return fallback;
  }
  if (typeof size === 'number') {
    return size;
  }
  if (size.endsWith('%')) {
    const percent = parseFloat(size);
    return (percent / 100) * containerSize;
  }
  if (size.endsWith('px')) {
    return parseFloat(size);
  }
  const parsed = parseFloat(size);
  return isNaN(parsed) ? fallback : parsed;
}

/**
 * Load persisted size from localStorage.
 */
function loadPersistedSize(persistKey: string | undefined): number | null {
  if (!persistKey || typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(`resizablepane:${persistKey}`);
    if (stored) {
      const parsed = parseFloat(stored);
      if (!isNaN(parsed)) {
        return parsed;
      }
    }
  } catch {
    // Ignore errors
  }
  return null;
}

/**
 * Save size to localStorage.
 */
function savePersistedSize(persistKey: string | undefined, size: number): void {
  if (!persistKey || typeof window === 'undefined') return;
  try {
    localStorage.setItem(`resizablepane:${persistKey}`, String(size));
  } catch {
    // Ignore errors
  }
}

export const ResizablePane: React.FC<ResizablePaneProps> = ({
  direction = 'horizontal',
  defaultSize,
  minSize,
  maxSize,
  onResize,
  handlePosition = 'end',
  children,
  className,
  persistKey,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<number>(() => {
    const persisted = loadPersistedSize(persistKey);
    if (persisted !== null) {
      return persisted;
    }
    if (typeof defaultSize === 'number') {
      return defaultSize;
    }
    return DEFAULT_SIZE;
  });
  const [isResizing, setIsResizing] = useState(false);

  // Refs for resize tracking
  const startPosRef = useRef(0);
  const startSizeRef = useRef(0);

  const isHorizontal = direction === 'horizontal';

  // Get container dimensions for percentage calculations
  const getContainerSize = useCallback(() => {
    if (!containerRef.current?.parentElement) return 800;
    const parent = containerRef.current.parentElement;
    const rect = parent.getBoundingClientRect();
    return isHorizontal ? rect.width : rect.height;
  }, [isHorizontal]);

  // Calculate constraints in pixels
  const getConstraints = useCallback(() => {
    const containerSize = getContainerSize();
    return {
      minSize: parseSizeToPixels(minSize, containerSize, DEFAULT_MIN_SIZE),
      maxSize: parseSizeToPixels(maxSize, containerSize, DEFAULT_MAX_SIZE),
    };
  }, [minSize, maxSize, getContainerSize]);

  // Initialize size from defaultSize if needed
  useEffect(() => {
    const persisted = loadPersistedSize(persistKey);
    if (persisted !== null) {
      setSize(persisted);
      return;
    }

    if (defaultSize !== undefined) {
      const containerSize = getContainerSize();
      const pixelSize = parseSizeToPixels(defaultSize, containerSize, DEFAULT_SIZE);
      setSize(pixelSize);
    }
  }, [defaultSize, getContainerSize, persistKey]);

  // Handle mouse/touch move
  const handleMove = useCallback(
    (clientX: number, clientY: number) => {
      const currentPos = isHorizontal ? clientX : clientY;
      let delta = currentPos - startPosRef.current;

      // Invert delta for start handle position
      if (handlePosition === 'start') {
        delta = -delta;
      }

      const newSize = startSizeRef.current + delta;
      const constraints = getConstraints();
      const clampedSize = Math.min(
        Math.max(newSize, constraints.minSize),
        constraints.maxSize
      );

      setSize(clampedSize);
      savePersistedSize(persistKey, clampedSize);
      onResize?.(clampedSize);
    },
    [isHorizontal, handlePosition, getConstraints, persistKey, onResize]
  );

  // Handle resize start
  const handleResizeStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();

      if ('touches' in e) {
        startPosRef.current = isHorizontal
          ? e.touches[0].clientX
          : e.touches[0].clientY;
      } else {
        startPosRef.current = isHorizontal ? e.clientX : e.clientY;
      }

      startSizeRef.current = size;
      setIsResizing(true);
    },
    [isHorizontal, size]
  );

  // Global event listeners for resize
  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleEnd = () => setIsResizing(false);

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleEnd);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleEnd);
    };
  }, [isResizing, handleMove]);

  // Handle keyboard resize
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const { key, shiftKey } = e;
      const step = shiftKey ? 50 : 10;

      let delta = 0;
      if (key === (isHorizontal ? 'ArrowLeft' : 'ArrowUp')) {
        delta = handlePosition === 'end' ? -step : step;
      } else if (key === (isHorizontal ? 'ArrowRight' : 'ArrowDown')) {
        delta = handlePosition === 'end' ? step : -step;
      }

      if (delta !== 0) {
        e.preventDefault();
        const newSize = size + delta;
        const constraints = getConstraints();
        const clampedSize = Math.min(
          Math.max(newSize, constraints.minSize),
          constraints.maxSize
        );

        setSize(clampedSize);
        savePersistedSize(persistKey, clampedSize);
        onResize?.(clampedSize);
      }
    },
    [isHorizontal, handlePosition, size, getConstraints, persistKey, onResize]
  );

  // Render the resize handle
  const renderHandle = () => (
    <div
      role="separator"
      aria-orientation={isHorizontal ? 'vertical' : 'horizontal'}
      tabIndex={0}
      className={cn(
        // Base styles
        'flex-shrink-0 select-none',
        'transition-colors duration-150',
        // Cursor
        isHorizontal ? 'cursor-col-resize' : 'cursor-row-resize',
        // Size
        isHorizontal ? 'w-1 h-full' : 'w-full h-1',
        // Visual
        'bg-white/5 hover:bg-white/20',
        isResizing && 'bg-white/30',
        // Focus
        'focus:outline-none focus:bg-white/25',
        'focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-inset'
      )}
      onMouseDown={handleResizeStart}
      onTouchStart={handleResizeStart}
      onKeyDown={handleKeyDown}
    >
      {/* Visual grip */}
      <div
        className={cn(
          'flex items-center justify-center w-full h-full',
          'opacity-0 hover:opacity-100 transition-opacity',
          isResizing && 'opacity-100'
        )}
      >
        <div
          className={cn(
            'bg-white/40 rounded-full',
            isHorizontal ? 'w-0.5 h-6' : 'w-6 h-0.5'
          )}
        />
      </div>
    </div>
  );

  return (
    <div
      ref={containerRef}
      className={cn(
        'flex',
        isHorizontal ? 'flex-row' : 'flex-col',
        isResizing && 'select-none',
        className
      )}
      style={{
        [isHorizontal ? 'width' : 'height']: size,
        flexShrink: 0,
      }}
      data-resizing={isResizing}
    >
      {handlePosition === 'start' && renderHandle()}
      <div className="flex-1 min-w-0 min-h-0 overflow-hidden">
        {children}
      </div>
      {handlePosition === 'end' && renderHandle()}
    </div>
  );
};

ResizablePane.displayName = 'ResizablePane';
