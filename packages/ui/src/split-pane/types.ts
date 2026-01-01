/**
 * SplitPane Types
 *
 * Type definitions for resizable split pane layouts.
 */

import type { ReactNode } from 'react';

/**
 * Direction of the split - horizontal creates left/right panes,
 * vertical creates top/bottom panes.
 */
export type SplitDirection = 'horizontal' | 'vertical';

/**
 * Size specification for panes.
 * - number: pixels
 * - string: CSS value (e.g., '50%', '200px', 'auto')
 */
export type PaneSize = number | string;

/**
 * Props for the SplitPane container component.
 */
export interface SplitPaneProps {
  /** Split direction - horizontal (left/right) or vertical (top/bottom) */
  direction?: SplitDirection;
  /** Default sizes for each pane (px or %) */
  defaultSizes?: PaneSize[];
  /** Minimum sizes for each pane */
  minSizes?: PaneSize[];
  /** Maximum sizes for each pane */
  maxSizes?: PaneSize[];
  /** Callback when panes are resized, receives sizes in pixels */
  onResize?: (sizes: number[]) => void;
  /** Size of the gutter/divider in pixels */
  gutterSize?: number;
  /** Snap to edges when within this offset (pixels) */
  snapOffset?: number;
  /** Indices of collapsed panes */
  collapsed?: number[];
  /** Callback when a pane is collapsed */
  onCollapse?: (index: number) => void;
  /** Callback when a pane is expanded */
  onExpand?: (index: number) => void;
  /** Pane children */
  children: ReactNode;
  /** Additional CSS class */
  className?: string;
  /** Persist sizes to localStorage with this key */
  persistKey?: string;
}

/**
 * Props for individual Pane components.
 */
export interface PaneProps {
  /** Minimum size constraint */
  minSize?: PaneSize;
  /** Maximum size constraint */
  maxSize?: PaneSize;
  /** Default/initial size */
  defaultSize?: PaneSize;
  /** Whether this pane can be collapsed */
  collapsible?: boolean;
  /** Whether this pane is currently collapsed */
  collapsed?: boolean;
  /** Additional CSS class */
  className?: string;
  /** Pane content */
  children: ReactNode;
}

/**
 * Props for the Gutter component (draggable separator).
 */
export interface GutterProps {
  /** Index of this gutter (0-based) */
  index: number;
  /** Split direction */
  direction: SplitDirection;
  /** Size of the gutter in pixels */
  size: number;
  /** Whether currently being dragged */
  isDragging?: boolean;
  /** Mouse/touch down handler to start drag */
  onDragStart: (index: number, event: React.MouseEvent | React.TouchEvent) => void;
  /** Double-click handler for collapse/expand */
  onDoubleClick?: (index: number) => void;
  /** Keyboard handler for arrow key resizing */
  onKeyDown?: (index: number, event: React.KeyboardEvent) => void;
  /** Additional CSS class */
  className?: string;
}

/**
 * Props for ResizablePane - a single pane with one resize handle.
 */
export interface ResizablePaneProps {
  /** Resize direction */
  direction?: 'horizontal' | 'vertical';
  /** Default size */
  defaultSize?: PaneSize;
  /** Minimum size constraint */
  minSize?: PaneSize;
  /** Maximum size constraint */
  maxSize?: PaneSize;
  /** Callback when resized */
  onResize?: (size: number) => void;
  /** Position of the resize handle */
  handlePosition?: 'start' | 'end';
  /** Pane content */
  children: ReactNode;
  /** Additional CSS class */
  className?: string;
  /** Persist size to localStorage with this key */
  persistKey?: string;
}

/**
 * Internal state for a single pane.
 */
export interface PaneState {
  /** Current size in pixels */
  size: number;
  /** Minimum size in pixels */
  minSize: number;
  /** Maximum size in pixels */
  maxSize: number;
  /** Whether the pane is collapsed */
  collapsed: boolean;
  /** Size before collapse (for restore) */
  sizeBeforeCollapse: number;
}

/**
 * Options for the useSplitPane hook.
 */
export interface UseSplitPaneOptions {
  /** Number of panes */
  count: number;
  /** Split direction */
  direction: SplitDirection;
  /** Default sizes for each pane */
  defaultSizes?: PaneSize[];
  /** Minimum sizes for each pane */
  minSizes?: PaneSize[];
  /** Maximum sizes for each pane */
  maxSizes?: PaneSize[];
  /** Container ref for calculating available space */
  containerRef?: React.RefObject<HTMLElement>;
  /** Callback when sizes change */
  onResize?: (sizes: number[]) => void;
  /** Snap offset in pixels */
  snapOffset?: number;
  /** Gutter size in pixels */
  gutterSize?: number;
  /** LocalStorage key for persistence */
  persistKey?: string;
}

/**
 * Return type for the useSplitPane hook.
 */
export interface UseSplitPaneResult {
  /** Current sizes in pixels */
  sizes: number[];
  /** Set sizes directly */
  setSizes: (sizes: number[]) => void;
  /** Collapse a pane by index */
  collapse: (index: number) => void;
  /** Expand a pane by index */
  expand: (index: number) => void;
  /** Reset to default sizes */
  resetSizes: () => void;
  /** Start resizing at a gutter index */
  startResize: (gutterIndex: number) => void;
  /** Handle mouse/touch move during resize */
  handleResize: (clientX: number, clientY: number) => void;
  /** End resize operation */
  endResize: () => void;
  /** Whether currently resizing */
  isResizing: boolean;
  /** Index of the gutter being dragged */
  resizingGutter: number | null;
  /** Collapsed state for each pane */
  collapsedPanes: boolean[];
}
