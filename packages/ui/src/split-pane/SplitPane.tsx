/**
 * SplitPane Component
 *
 * Resizable split pane layout supporting multiple panes,
 * horizontal or vertical orientation, and collapse/expand.
 */

import React, {
  useCallback,
  useRef,
  useEffect,
  Children,
  cloneElement,
  isValidElement,
  useState,
} from 'react';
import { cn } from '../lib/utils';
import { Gutter } from './Gutter';
import { Pane, isPaneElement } from './Pane';
import { useSplitPane } from './useSplitPane';
import type { SplitPaneProps, PaneProps, PaneSize } from './types';

// Default values
const DEFAULT_GUTTER_SIZE = 4;
const DEFAULT_DIRECTION = 'horizontal';
const KEYBOARD_STEP = 10;
const KEYBOARD_STEP_LARGE = 50;

/**
 * Extract pane props from children for constraint calculation.
 */
function extractPaneProps(children: React.ReactNode): PaneProps[] {
  const paneProps: PaneProps[] = [];

  Children.forEach(children, (child) => {
    if (isPaneElement(child)) {
      paneProps.push(child.props);
    } else if (isValidElement(child)) {
      // Wrap non-Pane children as implicit panes
      paneProps.push({ children: child });
    }
  });

  return paneProps;
}

/**
 * Build size arrays from pane props.
 */
function buildSizeArrays(
  paneProps: PaneProps[],
  defaultSizes?: PaneSize[],
  minSizes?: PaneSize[],
  maxSizes?: PaneSize[]
): {
  defaultSizes: PaneSize[];
  minSizes: PaneSize[];
  maxSizes: PaneSize[];
} {
  return {
    defaultSizes: paneProps.map(
      (p, i) => p.defaultSize ?? defaultSizes?.[i] ?? 'auto'
    ),
    minSizes: paneProps.map((p, i) => p.minSize ?? minSizes?.[i] ?? 50),
    maxSizes: paneProps.map(
      (p, i) => p.maxSize ?? maxSizes?.[i] ?? Infinity
    ),
  };
}

export const SplitPane: React.FC<SplitPaneProps> = ({
  direction = DEFAULT_DIRECTION,
  defaultSizes: propDefaultSizes,
  minSizes: propMinSizes,
  maxSizes: propMaxSizes,
  onResize,
  gutterSize = DEFAULT_GUTTER_SIZE,
  snapOffset = 0,
  collapsed: controlledCollapsed,
  onCollapse,
  onExpand,
  children,
  className,
  persistKey,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Extract pane props from children
  const paneProps = extractPaneProps(children);
  const paneCount = paneProps.length;

  // Build size constraint arrays
  const { defaultSizes, minSizes, maxSizes } = buildSizeArrays(
    paneProps,
    propDefaultSizes,
    propMinSizes,
    propMaxSizes
  );

  // Use the split pane hook for state management
  const {
    sizes,
    setSizes,
    collapse,
    expand,
    resetSizes,
    startResize,
    handleResize,
    endResize,
    isResizing,
    resizingGutter,
    collapsedPanes,
  } = useSplitPane({
    count: paneCount,
    direction,
    defaultSizes,
    minSizes,
    maxSizes,
    containerRef,
    onResize,
    snapOffset,
    gutterSize,
    persistKey,
  });

  // Track start position for resize
  const startPosRef = useRef(0);

  // Initialize sizes once container is mounted
  useEffect(() => {
    if (containerRef.current && !isInitialized) {
      const rect = containerRef.current.getBoundingClientRect();
      const totalSpace =
        direction === 'horizontal' ? rect.width : rect.height;

      if (totalSpace > 0) {
        setIsInitialized(true);
        // Trigger reset to calculate proper sizes
        resetSizes();
      }
    }
  }, [direction, isInitialized, resetSizes]);

  // Handle gutter drag start
  const handleGutterDragStart = useCallback(
    (gutterIndex: number, event: React.MouseEvent | React.TouchEvent) => {
      // Get initial position
      if ('touches' in event) {
        startPosRef.current =
          direction === 'horizontal'
            ? event.touches[0].clientX
            : event.touches[0].clientY;
      } else {
        startPosRef.current =
          direction === 'horizontal' ? event.clientX : event.clientY;
      }

      startResize(gutterIndex);
    },
    [direction, startResize]
  );

  // Handle gutter double-click for collapse/expand
  const handleGutterDoubleClick = useCallback(
    (gutterIndex: number) => {
      // Double-click collapses/expands the pane to the left/top of the gutter
      const paneIndex = gutterIndex;
      const isCollapsed =
        controlledCollapsed?.includes(paneIndex) ?? collapsedPanes[paneIndex];

      if (isCollapsed) {
        onExpand?.(paneIndex);
        if (!controlledCollapsed) {
          expand(paneIndex);
        }
      } else {
        // Check if pane is collapsible
        if (paneProps[paneIndex]?.collapsible !== false) {
          onCollapse?.(paneIndex);
          if (!controlledCollapsed) {
            collapse(paneIndex);
          }
        }
      }
    },
    [
      controlledCollapsed,
      collapsedPanes,
      paneProps,
      onCollapse,
      onExpand,
      collapse,
      expand,
    ]
  );

  // Handle keyboard resize
  const handleGutterKeyDown = useCallback(
    (gutterIndex: number, event: React.KeyboardEvent) => {
      const { key, shiftKey } = event;
      const step = shiftKey ? KEYBOARD_STEP_LARGE : KEYBOARD_STEP;
      const isHorizontal = direction === 'horizontal';

      let delta = 0;
      if (key === (isHorizontal ? 'ArrowLeft' : 'ArrowUp')) {
        delta = -step;
      } else if (key === (isHorizontal ? 'ArrowRight' : 'ArrowDown')) {
        delta = step;
      } else if (key === 'Home') {
        // Minimize left pane
        delta = -(sizes[gutterIndex] - 50);
      } else if (key === 'End') {
        // Maximize left pane
        delta = sizes[gutterIndex + 1] - 50;
      }

      if (delta !== 0) {
        const newSizes = [...sizes];
        const leftIndex = gutterIndex;
        const rightIndex = gutterIndex + 1;

        newSizes[leftIndex] = Math.max(50, sizes[leftIndex] + delta);
        newSizes[rightIndex] = Math.max(50, sizes[rightIndex] - delta);

        setSizes(newSizes);
      }
    },
    [direction, sizes, setSizes]
  );

  // Build the rendered content
  const renderContent = () => {
    const elements: React.ReactNode[] = [];
    let paneIndex = 0;

    Children.forEach(children, (child, childIndex) => {
      const currentPaneIndex = paneIndex;
      const size = sizes[currentPaneIndex];
      const isCollapsed =
        controlledCollapsed?.includes(currentPaneIndex) ??
        collapsedPanes[currentPaneIndex];

      // Render the pane
      if (isPaneElement(child)) {
        elements.push(
          cloneElement(child, {
            key: `pane-${currentPaneIndex}`,
            size,
            direction,
            collapsed: isCollapsed,
            index: currentPaneIndex,
          } as any)
        );
      } else if (isValidElement(child)) {
        // Wrap non-Pane children
        elements.push(
          <Pane
            key={`pane-${currentPaneIndex}`}
            size={size}
            direction={direction}
            collapsed={isCollapsed}
            index={currentPaneIndex}
          >
            {child}
          </Pane>
        );
      }

      // Add gutter after each pane except the last
      if (paneIndex < paneCount - 1) {
        elements.push(
          <Gutter
            key={`gutter-${currentPaneIndex}`}
            index={currentPaneIndex}
            direction={direction}
            size={gutterSize}
            isDragging={resizingGutter === currentPaneIndex}
            onDragStart={handleGutterDragStart}
            onDoubleClick={handleGutterDoubleClick}
            onKeyDown={handleGutterKeyDown}
          />
        );
      }

      paneIndex++;
    });

    return elements;
  };

  const isHorizontal = direction === 'horizontal';

  return (
    <div
      ref={containerRef}
      className={cn(
        // Base styles
        'flex w-full h-full',
        // Direction
        isHorizontal ? 'flex-row' : 'flex-col',
        // Prevent text selection while resizing
        isResizing && 'select-none',
        className
      )}
      data-direction={direction}
      data-resizing={isResizing}
    >
      {isInitialized && renderContent()}
    </div>
  );
};

SplitPane.displayName = 'SplitPane';
