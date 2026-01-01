/**
 * DragPreview - Custom drag preview component
 *
 * Renders a custom preview during drag operations using a portal.
 * Follows the cursor position and displays custom content.
 */

import React, { useEffect, useState, useRef, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useDragDropContext } from './DragDropContext';
import { DragPreviewProps, DragType } from './types';

/** Default offset from cursor */
const DEFAULT_OFFSET = { x: 12, y: 12 };

/** Styles for the preview container */
const previewStyles: React.CSSProperties = {
  position: 'fixed',
  pointerEvents: 'none',
  zIndex: 10000,
  opacity: 0.9,
  transition: 'opacity 0.1s ease',
};

/**
 * DefaultPreview - Default preview content when no custom preview is provided
 */
const DefaultPreview: React.FC<{ type: DragType; id: string }> = ({ type, id }) => {
  const style: React.CSSProperties = {
    background: 'rgba(0, 0, 0, 0.8)',
    color: 'white',
    padding: '8px 12px',
    borderRadius: '6px',
    fontSize: '13px',
    fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  const iconMap: Record<DragType, string> = {
    [DragType.FILE]: '\uD83D\uDCC4',
    [DragType.FOLDER]: '\uD83D\uDCC1',
    [DragType.APP]: '\uD83D\uDCE6',
    [DragType.WINDOW]: '\uD83D\uDDD7',
    [DragType.TEXT]: '\uD83D\uDCDD',
    [DragType.CUSTOM]: '\uD83D\uDCE6',
  };

  return (
    <div style={style}>
      <span>{iconMap[type] || iconMap[DragType.CUSTOM]}</span>
      <span>{id}</span>
    </div>
  );
};

/**
 * DragPreview - Renders a custom drag preview as a portal
 *
 * Place this component anywhere in your tree - it renders to document.body.
 * When a drag is active, it displays the preview following the cursor.
 *
 * @example
 * ```tsx
 * // Basic usage with default preview
 * <DragPreview />
 *
 * // Custom preview content
 * <DragPreview>
 *   <MyCustomPreview />
 * </DragPreview>
 *
 * // With offset
 * <DragPreview offset={{ x: 20, y: 20 }}>
 *   <FileIcon />
 * </DragPreview>
 * ```
 */
export const DragPreview: React.FC<DragPreviewProps> = ({
  children,
  offset = DEFAULT_OFFSET,
}) => {
  const { isDragging, dragData } = useDragDropContext();
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Create portal container on mount
  useEffect(() => {
    const container = document.createElement('div');
    container.id = 'zos-drag-preview-root';
    container.setAttribute('aria-hidden', 'true');
    document.body.appendChild(container);
    containerRef.current = container;
    setMounted(true);

    return () => {
      if (container.parentNode) {
        container.parentNode.removeChild(container);
      }
    };
  }, []);

  // Track mouse position during drag
  useEffect(() => {
    if (!isDragging) return;

    const handleDrag = (e: DragEvent) => {
      // e.clientX/Y are 0,0 during drag in some browsers
      // Use screenX/Y with offset as fallback
      if (e.clientX !== 0 || e.clientY !== 0) {
        setPosition({
          x: e.clientX + offset.x,
          y: e.clientY + offset.y,
        });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({
        x: e.clientX + offset.x,
        y: e.clientY + offset.y,
      });
    };

    // Use both drag and mouse events for better tracking
    document.addEventListener('drag', handleDrag);
    document.addEventListener('dragover', handleDrag);
    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('drag', handleDrag);
      document.removeEventListener('dragover', handleDrag);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isDragging, offset.x, offset.y]);

  // Don't render if not dragging or not mounted
  if (!mounted || !isDragging || !dragData || !containerRef.current) {
    return null;
  }

  const content = (
    <div
      style={{
        ...previewStyles,
        left: position.x,
        top: position.y,
      }}
    >
      {children || <DefaultPreview type={dragData.type} id={dragData.id} />}
    </div>
  );

  return createPortal(content, containerRef.current);
};

/**
 * DragPreviewContent - Access drag data inside preview
 *
 * Use this component inside DragPreview to access current drag data.
 *
 * @example
 * ```tsx
 * <DragPreview>
 *   <DragPreviewContent>
 *     {(data) => <MyPreview data={data} />}
 *   </DragPreviewContent>
 * </DragPreview>
 * ```
 */
export const DragPreviewContent: React.FC<{
  children: (data: NonNullable<ReturnType<typeof useDragDropContext>['dragData']>) => ReactNode;
}> = ({ children }) => {
  const { dragData } = useDragDropContext();

  if (!dragData) {
    return null;
  }

  return <>{children(dragData)}</>;
};

export default DragPreview;
