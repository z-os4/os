/**
 * Drag & Drop Types for zOS
 *
 * Defines the core types for the drag-drop system.
 * Uses native HTML5 drag-drop API with context for rich data transfer.
 */

/** Supported drag item types */
export enum DragType {
  FILE = 'file',
  FOLDER = 'folder',
  APP = 'app',
  WINDOW = 'window',
  TEXT = 'text',
  CUSTOM = 'custom',
}

/** Data carried during a drag operation */
export interface DragData<T = unknown> {
  /** Type of the dragged item */
  type: DragType;
  /** Unique identifier for the drag operation */
  id: string;
  /** Payload data */
  data: T;
  /** Source identifier (e.g., app ID, window ID) */
  source?: string;
}

/** Result of a drop operation */
export interface DropResult<T = unknown> {
  /** Whether the drop was successful */
  success: boolean;
  /** Result data from the drop handler */
  data?: T;
  /** ID of the drop target */
  targetId?: string;
}

/** Drop target registration info */
export interface DropTarget {
  /** Unique ID for the drop target */
  id: string;
  /** Drag types this target accepts */
  accepts: DragType[];
}

/** Context value for drag-drop state management */
export interface DragDropContextValue {
  /** Whether a drag operation is in progress */
  isDragging: boolean;
  /** Current drag data, null if not dragging */
  dragData: DragData | null;
  /** Start a drag operation */
  startDrag: (data: DragData) => void;
  /** End the current drag operation */
  endDrag: (result?: DropResult) => void;
  /** Register a drop target */
  registerDropTarget: (id: string, accepts: DragType[]) => void;
  /** Unregister a drop target */
  unregisterDropTarget: (id: string) => void;
  /** Check if a target can accept the current drag */
  canDropOnTarget: (targetId: string) => boolean;
  /** Get all registered drop targets */
  getDropTargets: () => Map<string, DropTarget>;
}

/** Options for useDrag hook */
export interface UseDragOptions<T> {
  /** Type of the draggable item */
  type: DragType;
  /** Unique identifier */
  id: string;
  /** Data to transfer */
  data: T;
  /** Source identifier */
  source?: string;
  /** Callback when drag starts */
  onDragStart?: () => void;
  /** Callback when drag ends */
  onDragEnd?: (result: DropResult) => void;
  /** Whether dragging is disabled */
  disabled?: boolean;
}

/** Return value from useDrag hook */
export interface UseDragReturn {
  /** Props to spread on the draggable element */
  dragProps: {
    draggable: true;
    onDragStart: (e: React.DragEvent) => void;
    onDragEnd: (e: React.DragEvent) => void;
    'data-dragging'?: boolean;
  };
  /** Whether this element is currently being dragged */
  isDragging: boolean;
}

/** Options for useDrop hook */
export interface UseDropOptions<T = unknown> {
  /** Unique identifier for the drop target */
  id: string;
  /** Drag types this target accepts */
  accepts: DragType[];
  /** Handler called when an item is dropped */
  onDrop: (data: DragData<T>) => DropResult;
  /** Optional handler to determine if drop is allowed */
  onDragOver?: (data: DragData<T>) => boolean;
  /** Callback when drag enters the target */
  onDragEnter?: (data: DragData<T>) => void;
  /** Callback when drag leaves the target */
  onDragLeave?: (data: DragData<T>) => void;
  /** Whether drop target is disabled */
  disabled?: boolean;
}

/** Return value from useDrop hook */
export interface UseDropReturn {
  /** Props to spread on the drop target element */
  dropProps: {
    onDragOver: (e: React.DragEvent) => void;
    onDragEnter: (e: React.DragEvent) => void;
    onDragLeave: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
    'data-drop-active'?: boolean;
    'data-can-drop'?: boolean;
  };
  /** Whether a dragged item is currently over this target */
  isOver: boolean;
  /** Whether the current drag can be dropped here */
  canDrop: boolean;
}

/** Props for DragPreview component */
export interface DragPreviewProps {
  /** Custom render function for the preview */
  children?: React.ReactNode;
  /** Offset from cursor */
  offset?: { x: number; y: number };
}

/** Internal drag state for the context */
export interface DragState {
  isDragging: boolean;
  dragData: DragData | null;
  dropTargets: Map<string, DropTarget>;
  lastDropResult: DropResult | null;
}

/** MIME type used for DataTransfer */
export const DRAG_DATA_MIME = 'application/x-zos-drag';
