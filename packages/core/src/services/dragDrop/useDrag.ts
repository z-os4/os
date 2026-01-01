/**
 * useDrag - Hook for making elements draggable
 *
 * Provides drag props and state for draggable elements.
 * Uses HTML5 drag-drop API with context for rich data transfer.
 */

import { useCallback, useState, useRef } from 'react';
import { useDragDropContext } from './DragDropContext';
import {
  UseDragOptions,
  UseDragReturn,
  DragData,
  DropResult,
  DRAG_DATA_MIME,
} from './types';

/**
 * useDrag - Make an element draggable
 *
 * @param options - Configuration for the draggable item
 * @returns Drag props and state
 *
 * @example
 * ```tsx
 * const { dragProps, isDragging } = useDrag({
 *   type: DragType.FILE,
 *   id: 'file-1',
 *   data: { path: '/documents/readme.txt' },
 *   onDragEnd: (result) => console.log('Dropped:', result),
 * });
 *
 * return <div {...dragProps}>Drag me</div>;
 * ```
 */
export function useDrag<T>(options: UseDragOptions<T>): UseDragReturn {
  const { type, id, data, source, onDragStart, onDragEnd, disabled = false } = options;
  const { startDrag, endDrag, dragData } = useDragDropContext();
  const [localDragging, setLocalDragging] = useState(false);
  const dropResultRef = useRef<DropResult | null>(null);

  // Check if this specific element is being dragged
  const isDragging = localDragging && dragData?.id === id;

  const handleDragStart = useCallback(
    (e: React.DragEvent) => {
      if (disabled) {
        e.preventDefault();
        return;
      }

      // Build drag data
      const dragPayload: DragData<T> = {
        type,
        id,
        data,
        source,
      };

      // Set data in DataTransfer for native DnD compatibility
      // Use JSON for cross-browser support
      try {
        e.dataTransfer.setData(DRAG_DATA_MIME, JSON.stringify(dragPayload));
        // Also set text/plain for external drops
        e.dataTransfer.setData('text/plain', JSON.stringify({ type, id }));
      } catch (err) {
        // Some browsers may restrict setData; fall back to context-only
        console.warn('DataTransfer.setData failed:', err);
      }

      // Set drag effect
      e.dataTransfer.effectAllowed = 'all';

      // Update context state
      startDrag(dragPayload);
      setLocalDragging(true);

      // Call user callback
      onDragStart?.();
    },
    [type, id, data, source, disabled, startDrag, onDragStart]
  );

  const handleDragEnd = useCallback(
    (e: React.DragEvent) => {
      if (disabled) return;

      // Determine drop result based on dropEffect
      const wasDropped = e.dataTransfer.dropEffect !== 'none';
      const result: DropResult = dropResultRef.current ?? {
        success: wasDropped,
      };

      // Clear context state
      endDrag(result);
      setLocalDragging(false);
      dropResultRef.current = null;

      // Call user callback
      onDragEnd?.(result);
    },
    [disabled, endDrag, onDragEnd]
  );

  // Build props object
  const dragProps: UseDragReturn['dragProps'] = {
    draggable: true,
    onDragStart: handleDragStart,
    onDragEnd: handleDragEnd,
  };

  // Add data attribute when dragging for CSS styling
  if (isDragging) {
    dragProps['data-dragging'] = true;
  }

  return {
    dragProps,
    isDragging,
  };
}

export default useDrag;
