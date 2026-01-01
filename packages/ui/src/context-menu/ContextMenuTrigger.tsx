/**
 * Context Menu Trigger
 *
 * Wrapper component that attaches context menu behavior to its children.
 *
 * @example
 * ```tsx
 * <ContextMenuTrigger items={[
 *   { id: 'open', label: 'Open', icon: <FolderOpen />, onClick: handleOpen },
 *   { id: 'sep1', type: 'separator' },
 *   { id: 'delete', label: 'Delete', icon: <Trash />, onClick: handleDelete, destructive: true },
 * ]}>
 *   <FileIcon file={file} />
 * </ContextMenuTrigger>
 * ```
 */

import React, { useCallback, useEffect, useRef } from 'react';
import { useContextMenu } from './useContextMenu';
import type { ContextMenuTriggerProps } from './types';
import { cn } from '../lib/utils';

export function ContextMenuTrigger({
  items,
  children,
  disabled = false,
  className,
  onOpen,
  onClose,
}: ContextMenuTriggerProps) {
  const { showContextMenu, hideContextMenu, isOpen } = useContextMenu();
  const triggerRef = useRef<HTMLDivElement>(null);
  const wasOpenedByThisTrigger = useRef(false);

  /** Handle right-click */
  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      if (disabled) return;

      e.preventDefault();
      e.stopPropagation();

      wasOpenedByThisTrigger.current = true;
      showContextMenu(items, { x: e.clientX, y: e.clientY });
      onOpen?.();
    },
    [items, disabled, showContextMenu, onOpen]
  );

  /** Handle long press for touch devices */
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressPositionRef = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (disabled) return;

      const touch = e.touches[0];
      longPressPositionRef.current = { x: touch.clientX, y: touch.clientY };

      longPressTimerRef.current = setTimeout(() => {
        if (longPressPositionRef.current) {
          wasOpenedByThisTrigger.current = true;
          showContextMenu(items, longPressPositionRef.current);
          onOpen?.();
        }
      }, 500);
    },
    [items, disabled, showContextMenu, onOpen]
  );

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    // Cancel long press if touch moves too far
    if (longPressTimerRef.current && longPressPositionRef.current) {
      const touch = e.touches[0];
      const dx = touch.clientX - longPressPositionRef.current.x;
      const dy = touch.clientY - longPressPositionRef.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 10) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    longPressPositionRef.current = null;
  }, []);

  // Track when menu closes
  useEffect(() => {
    if (!isOpen && wasOpenedByThisTrigger.current) {
      wasOpenedByThisTrigger.current = false;
      onClose?.();
    }
  }, [isOpen, onClose]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={triggerRef}
      className={cn('contents', className)}
      onContextMenu={handleContextMenu}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      data-context-menu-trigger
    >
      {children}
    </div>
  );
}
