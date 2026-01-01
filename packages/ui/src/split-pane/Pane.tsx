/**
 * Pane Component
 *
 * Individual pane wrapper for SplitPane.
 * Handles overflow, collapse animation, and sizing.
 */

import React, { forwardRef, useMemo } from 'react';
import { cn } from '../lib/utils';
import type { PaneProps, SplitDirection } from './types';

interface InternalPaneProps extends PaneProps {
  /** Current size in pixels (controlled by parent) */
  size?: number;
  /** Split direction (from parent SplitPane) */
  direction?: SplitDirection;
  /** Index of this pane */
  index?: number;
}

export const Pane = forwardRef<HTMLDivElement, InternalPaneProps>(
  (
    {
      size,
      direction = 'horizontal',
      collapsed = false,
      collapsible = false,
      className,
      children,
      // These are used by parent for constraints, not directly here
      minSize: _minSize,
      maxSize: _maxSize,
      defaultSize: _defaultSize,
      index: _index,
    },
    ref
  ) => {
    const isHorizontal = direction === 'horizontal';

    const style = useMemo(() => {
      if (size === undefined) {
        return { flex: 1 };
      }

      // When collapsed, set size to 0 with transition
      const actualSize = collapsed ? 0 : size;

      return {
        [isHorizontal ? 'width' : 'height']: actualSize,
        flexShrink: 0,
        flexGrow: 0,
      };
    }, [size, collapsed, isHorizontal]);

    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          'relative overflow-hidden',
          // Transition for collapse animation
          'transition-[width,height] duration-200 ease-out',
          // Hide content when collapsed
          collapsed && 'opacity-0 pointer-events-none',
          className
        )}
        style={style}
        data-collapsed={collapsed}
        data-collapsible={collapsible}
      >
        {/* Content wrapper with scroll */}
        <div className="w-full h-full overflow-auto">
          {children}
        </div>
      </div>
    );
  }
);

Pane.displayName = 'Pane';

/**
 * Check if a React element is a Pane component.
 */
export function isPaneElement(
  element: React.ReactNode
): element is React.ReactElement<PaneProps> {
  return (
    React.isValidElement(element) &&
    (element.type === Pane ||
      (element.type as React.FC)?.displayName === 'Pane')
  );
}
