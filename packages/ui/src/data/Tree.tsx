/**
 * Tree Component
 *
 * Hierarchical tree view with expand/collapse, selection, and drag-drop support.
 *
 * @example
 * ```tsx
 * <Tree
 *   nodes={[
 *     {
 *       id: 'folder-1',
 *       label: 'Documents',
 *       icon: <Folder />,
 *       children: [
 *         { id: 'file-1', label: 'readme.txt' },
 *         { id: 'file-2', label: 'notes.md' },
 *       ],
 *     },
 *   ]}
 *   onNodeClick={handleClick}
 *   expandedIds={expanded}
 *   onNodeExpand={handleExpand}
 * />
 * ```
 */

import React, { useCallback, useState, useRef } from 'react';
import { cn } from '../lib/utils';
import type { DropPosition } from './types';

export interface TreeNode {
  /** Unique node identifier */
  id: string;
  /** Node label content */
  label: React.ReactNode;
  /** Icon to display before label */
  icon?: React.ReactNode;
  /** Child nodes */
  children?: TreeNode[];
  /** Whether node is disabled */
  disabled?: boolean;
  /** Custom data attached to node */
  data?: unknown;
}

export interface TreeProps {
  /** Tree nodes */
  nodes: TreeNode[];
  /** Callback when node is clicked */
  onNodeClick?: (node: TreeNode) => void;
  /** Callback when node is expanded/collapsed */
  onNodeExpand?: (nodeId: string, expanded: boolean) => void;
  /** Set of expanded node IDs */
  expandedIds?: Set<string>;
  /** Currently selected node ID */
  selectedId?: string;
  /** Callback when selection changes */
  onSelect?: (nodeId: string | null) => void;
  /** Show connection lines between nodes */
  showLines?: boolean;
  /** Enable drag and drop reordering */
  draggable?: boolean;
  /** Callback when node is dropped */
  onDrop?: (dragId: string, dropId: string, position: DropPosition) => void;
  /** Additional CSS classes */
  className?: string;
}

interface TreeNodeItemProps {
  node: TreeNode;
  level: number;
  expanded: boolean;
  selected: boolean;
  showLines: boolean;
  draggable: boolean;
  isLast: boolean;
  parentPath: boolean[];
  onToggle: (nodeId: string) => void;
  onClick: (node: TreeNode) => void;
  onSelect: (nodeId: string | null) => void;
  onDragStart?: (e: React.DragEvent, nodeId: string) => void;
  onDragOver?: (e: React.DragEvent, nodeId: string) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, nodeId: string, position: DropPosition) => void;
  dragOverId?: string | null;
  dropPosition?: DropPosition | null;
  expandedIds: Set<string>;
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      className={cn(
        'w-4 h-4 transition-transform duration-200',
        expanded && 'rotate-90'
      )}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}

function TreeNodeItem({
  node,
  level,
  expanded,
  selected,
  showLines,
  draggable,
  isLast,
  parentPath,
  onToggle,
  onClick,
  onSelect,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  dragOverId,
  dropPosition,
  expandedIds,
}: TreeNodeItemProps) {
  const hasChildren = node.children && node.children.length > 0;
  const isDragOver = dragOverId === node.id;

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (node.disabled) return;
      onClick(node);
      onSelect(node.id);
    },
    [node, onClick, onSelect]
  );

  const handleToggle = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (hasChildren) {
        onToggle(node.id);
      }
    },
    [node.id, hasChildren, onToggle]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (node.disabled) return;

      switch (e.key) {
        case 'Enter':
        case ' ':
          e.preventDefault();
          onClick(node);
          onSelect(node.id);
          break;
        case 'ArrowRight':
          if (hasChildren && !expanded) {
            e.preventDefault();
            onToggle(node.id);
          }
          break;
        case 'ArrowLeft':
          if (hasChildren && expanded) {
            e.preventDefault();
            onToggle(node.id);
          }
          break;
      }
    },
    [node, hasChildren, expanded, onClick, onSelect, onToggle]
  );

  const handleDragStart = useCallback(
    (e: React.DragEvent) => {
      if (!draggable || node.disabled) return;
      e.dataTransfer.effectAllowed = 'move';
      onDragStart?.(e, node.id);
    },
    [draggable, node, onDragStart]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      if (!draggable) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      onDragOver?.(e, node.id);
    },
    [draggable, node.id, onDragOver]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      if (!draggable || !dropPosition) return;
      e.preventDefault();
      onDrop?.(e, node.id, dropPosition);
    },
    [draggable, node.id, dropPosition, onDrop]
  );

  return (
    <div role="treeitem" aria-expanded={hasChildren ? expanded : undefined}>
      <div
        className={cn(
          'flex items-center gap-1 px-2 py-1 rounded-md cursor-pointer transition-colors',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50',
          selected && 'bg-blue-500/20 text-white',
          !selected && 'hover:bg-white/5',
          node.disabled && 'opacity-50 cursor-not-allowed',
          isDragOver && dropPosition === 'inside' && 'ring-2 ring-blue-500',
          isDragOver && dropPosition === 'before' && 'border-t-2 border-blue-500',
          isDragOver && dropPosition === 'after' && 'border-b-2 border-blue-500'
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        draggable={draggable && !node.disabled}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={onDragLeave}
        onDrop={handleDrop}
        tabIndex={node.disabled ? -1 : 0}
        aria-selected={selected}
        aria-disabled={node.disabled}
      >
        {/* Tree lines */}
        {showLines && level > 0 && (
          <div className="absolute left-0 flex" style={{ paddingLeft: `${(level - 1) * 16 + 12}px` }}>
            {parentPath.map((hasLine, i) => (
              <div
                key={i}
                className={cn(
                  'w-4 h-full',
                  hasLine && 'border-l border-white/20'
                )}
              />
            ))}
            <div
              className={cn(
                'w-4 h-full border-l border-white/20',
                isLast ? 'border-l-transparent' : ''
              )}
            >
              <div className="w-2 h-3 border-b border-white/20" />
            </div>
          </div>
        )}

        {/* Expand/collapse toggle */}
        <button
          type="button"
          className={cn(
            'flex-shrink-0 w-5 h-5 flex items-center justify-center rounded text-white/50 hover:text-white hover:bg-white/10',
            !hasChildren && 'invisible'
          )}
          onClick={handleToggle}
          tabIndex={-1}
          aria-label={expanded ? 'Collapse' : 'Expand'}
        >
          {hasChildren && <ChevronIcon expanded={expanded} />}
        </button>

        {/* Icon */}
        {node.icon && (
          <div className="flex-shrink-0 text-white/60">{node.icon}</div>
        )}

        {/* Label */}
        <span className="flex-1 text-sm truncate">{node.label}</span>
      </div>

      {/* Children */}
      {hasChildren && expanded && (
        <div role="group">
          {node.children!.map((child, index) => (
            <TreeNodeItem
              key={child.id}
              node={child}
              level={level + 1}
              expanded={expandedIds.has(child.id)}
              selected={false}
              showLines={showLines}
              draggable={draggable}
              isLast={index === node.children!.length - 1}
              parentPath={[...parentPath, !isLast]}
              onToggle={onToggle}
              onClick={onClick}
              onSelect={onSelect}
              onDragStart={onDragStart}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              dragOverId={dragOverId}
              dropPosition={dropPosition}
              expandedIds={expandedIds}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export const Tree = React.forwardRef<HTMLDivElement, TreeProps>(
  (
    {
      nodes,
      onNodeClick,
      onNodeExpand,
      expandedIds: controlledExpandedIds,
      selectedId,
      onSelect,
      showLines = false,
      draggable = false,
      onDrop,
      className,
    },
    ref
  ) => {
    const [internalExpandedIds, setInternalExpandedIds] = useState<Set<string>>(new Set());
    const [dragOverId, setDragOverId] = useState<string | null>(null);
    const [dropPosition, setDropPosition] = useState<DropPosition | null>(null);
    const draggedIdRef = useRef<string | null>(null);

    const expandedIds = controlledExpandedIds ?? internalExpandedIds;

    const handleToggle = useCallback(
      (nodeId: string) => {
        const newExpanded = !expandedIds.has(nodeId);

        if (onNodeExpand) {
          onNodeExpand(nodeId, newExpanded);
        }

        if (!controlledExpandedIds) {
          setInternalExpandedIds((prev) => {
            const next = new Set(prev);
            if (newExpanded) {
              next.add(nodeId);
            } else {
              next.delete(nodeId);
            }
            return next;
          });
        }
      },
      [expandedIds, onNodeExpand, controlledExpandedIds]
    );

    const handleClick = useCallback(
      (node: TreeNode) => {
        onNodeClick?.(node);
      },
      [onNodeClick]
    );

    const handleSelect = useCallback(
      (nodeId: string | null) => {
        onSelect?.(nodeId);
      },
      [onSelect]
    );

    const handleDragStart = useCallback((e: React.DragEvent, nodeId: string) => {
      draggedIdRef.current = nodeId;
      e.dataTransfer.setData('text/plain', nodeId);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent, nodeId: string) => {
      if (draggedIdRef.current === nodeId) return;

      setDragOverId(nodeId);

      // Determine drop position based on mouse position
      const rect = e.currentTarget.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const height = rect.height;

      if (y < height * 0.25) {
        setDropPosition('before');
      } else if (y > height * 0.75) {
        setDropPosition('after');
      } else {
        setDropPosition('inside');
      }
    }, []);

    const handleDragLeave = useCallback(() => {
      setDragOverId(null);
      setDropPosition(null);
    }, []);

    const handleDrop = useCallback(
      (e: React.DragEvent, dropId: string, position: DropPosition) => {
        e.preventDefault();
        const dragId = draggedIdRef.current;

        if (dragId && dragId !== dropId && onDrop) {
          onDrop(dragId, dropId, position);
        }

        draggedIdRef.current = null;
        setDragOverId(null);
        setDropPosition(null);
      },
      [onDrop]
    );

    if (nodes.length === 0) {
      return (
        <div
          ref={ref}
          className={cn('text-sm text-white/50 py-4 text-center', className)}
          role="tree"
        >
          No items
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn('relative', className)}
        role="tree"
        aria-multiselectable={false}
      >
        {nodes.map((node, index) => (
          <TreeNodeItem
            key={node.id}
            node={node}
            level={0}
            expanded={expandedIds.has(node.id)}
            selected={selectedId === node.id}
            showLines={showLines}
            draggable={draggable}
            isLast={index === nodes.length - 1}
            parentPath={[]}
            onToggle={handleToggle}
            onClick={handleClick}
            onSelect={handleSelect}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            dragOverId={dragOverId}
            dropPosition={dropPosition}
            expandedIds={expandedIds}
          />
        ))}
      </div>
    );
  }
);

Tree.displayName = 'Tree';
