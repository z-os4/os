/**
 * useDrop - Hook for creating drop targets
 *
 * Provides drop props and state for elements that accept dropped items.
 * Uses HTML5 drag-drop API with context for rich data access.
 */

import { useCallback, useState, useEffect, useRef } from 'react';
import { useDragDropContext } from './DragDropContext';
import {
  UseDropOptions,
  UseDropReturn,
  DragData,
  DropResult,
  DRAG_DATA_MIME,
} from './types';

/**
 * Parse drag data from DataTransfer or context
 */
function parseDragData(e: React.DragEvent, contextData: DragData | null): DragData | null {
  // Prefer context data for rich type info
  if (contextData) {
    return contextData;
  }

  // Fall back to DataTransfer (for external drops)
  try {
    const json = e.dataTransfer.getData(DRAG_DATA_MIME);
    if (json) {
      return JSON.parse(json) as DragData;
    }
  } catch (err) {
    // getData may fail during dragover in some browsers
  }

  return null;
}

/**
 * useDrop - Make an element a drop target
 *
 * @param options - Configuration for the drop target
 * @returns Drop props and state
 *
 * @example
 * ```tsx
 * const { dropProps, isOver, canDrop } = useDrop({
 *   id: 'folder-1',
 *   accepts: [DragType.FILE, DragType.FOLDER],
 *   onDrop: (data) => {
 *     console.log('Dropped:', data);
 *     return { success: true };
 *   },
 * });
 *
 * return (
 *   <div {...dropProps} className={isOver ? 'highlight' : ''}>
 *     Drop here
 *   </div>
 * );
 * ```
 */
export function useDrop<T = unknown>(options: UseDropOptions<T>): UseDropReturn {
  const {
    id,
    accepts,
    onDrop,
    onDragOver,
    onDragEnter,
    onDragLeave,
    disabled = false,
  } = options;

  const {
    isDragging,
    dragData,
    registerDropTarget,
    unregisterDropTarget,
    endDrag,
  } = useDragDropContext();

  const [isOver, setIsOver] = useState(false);
  const enterCountRef = useRef(0);

  // Register drop target on mount
  useEffect(() => {
    if (!disabled) {
      registerDropTarget(id, accepts);
    }
    return () => {
      unregisterDropTarget(id);
    };
  }, [id, accepts, disabled, registerDropTarget, unregisterDropTarget]);

  // Check if current drag can be dropped here
  const canDrop = useCallback((): boolean => {
    if (disabled || !isDragging || !dragData) {
      return false;
    }
    return accepts.includes(dragData.type);
  }, [disabled, isDragging, dragData, accepts]);

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      if (disabled) return;

      const data = parseDragData(e, dragData);
      if (!data || !accepts.includes(data.type)) {
        return;
      }

      // Prevent default to allow drop
      e.preventDefault();

      // Check custom validation
      if (onDragOver) {
        const allowed = onDragOver(data as DragData<T>);
        if (!allowed) {
          e.dataTransfer.dropEffect = 'none';
          return;
        }
      }

      // Set drop effect
      e.dataTransfer.dropEffect = 'move';
    },
    [disabled, dragData, accepts, onDragOver]
  );

  const handleDragEnter = useCallback(
    (e: React.DragEvent) => {
      if (disabled) return;

      // Track enter count to handle nested elements
      enterCountRef.current++;

      const data = parseDragData(e, dragData);
      if (!data || !accepts.includes(data.type)) {
        return;
      }

      e.preventDefault();
      setIsOver(true);

      onDragEnter?.(data as DragData<T>);
    },
    [disabled, dragData, accepts, onDragEnter]
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent) => {
      if (disabled) return;

      // Decrement enter count
      enterCountRef.current--;

      // Only set isOver to false when actually leaving the element
      if (enterCountRef.current === 0) {
        setIsOver(false);

        const data = parseDragData(e, dragData);
        if (data) {
          onDragLeave?.(data as DragData<T>);
        }
      }
    },
    [disabled, dragData, onDragLeave]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      if (disabled) return;

      e.preventDefault();
      e.stopPropagation();

      // Reset state
      enterCountRef.current = 0;
      setIsOver(false);

      const data = parseDragData(e, dragData);
      if (!data || !accepts.includes(data.type)) {
        return;
      }

      // Call drop handler
      const result = onDrop(data as DragData<T>);

      // Add target ID to result
      const finalResult: DropResult = {
        ...result,
        targetId: id,
      };

      // Notify context of drop
      endDrag(finalResult);
    },
    [disabled, dragData, accepts, id, onDrop, endDrag]
  );

  // Build props object
  const currentCanDrop = canDrop();
  const dropProps: UseDropReturn['dropProps'] = {
    onDragOver: handleDragOver,
    onDragEnter: handleDragEnter,
    onDragLeave: handleDragLeave,
    onDrop: handleDrop,
  };

  // Add data attributes for CSS styling
  if (isOver) {
    dropProps['data-drop-active'] = true;
  }
  if (currentCanDrop) {
    dropProps['data-can-drop'] = true;
  }

  return {
    dropProps,
    isOver,
    canDrop: currentCanDrop,
  };
}

export default useDrop;
