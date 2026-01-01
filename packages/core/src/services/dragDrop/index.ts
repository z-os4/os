/**
 * Drag & Drop Service for zOS
 *
 * Provides a comprehensive drag-drop system using native HTML5 API
 * with React context for rich data transfer.
 *
 * @example
 * ```tsx
 * // Wrap your app with the provider
 * import { DragDropProvider } from '@zos/core';
 *
 * function App() {
 *   return (
 *     <DragDropProvider>
 *       <Desktop />
 *     </DragDropProvider>
 *   );
 * }
 *
 * // Make an element draggable
 * import { useDrag, DragType } from '@zos/core';
 *
 * function DraggableFile({ file }) {
 *   const { dragProps, isDragging } = useDrag({
 *     type: DragType.FILE,
 *     id: file.id,
 *     data: file,
 *   });
 *
 *   return <div {...dragProps}>File: {file.name}</div>;
 * }
 *
 * // Create a drop target
 * import { useDrop, DragType } from '@zos/core';
 *
 * function Folder({ folder }) {
 *   const { dropProps, isOver, canDrop } = useDrop({
 *     id: folder.id,
 *     accepts: [DragType.FILE],
 *     onDrop: (data) => {
 *       moveFile(data.data, folder);
 *       return { success: true };
 *     },
 *   });
 *
 *   return (
 *     <div {...dropProps} className={isOver ? 'highlight' : ''}>
 *       Folder: {folder.name}
 *     </div>
 *   );
 * }
 * ```
 */

// Types
export {
  DragType,
  DRAG_DATA_MIME,
  type DragData,
  type DropResult,
  type DropTarget,
  type DragDropContextValue,
  type UseDragOptions,
  type UseDragReturn,
  type UseDropOptions,
  type UseDropReturn,
  type DragPreviewProps,
  type DragState,
} from './types';

// Context and Provider
export {
  DragDropProvider,
  useDragDropContext,
  DragDropContext,
  type DragDropProviderProps,
} from './DragDropContext';

// Hooks
export { useDrag } from './useDrag';
export { useDrop } from './useDrop';

// Components
export { DragPreview, DragPreviewContent } from './DragPreview';
