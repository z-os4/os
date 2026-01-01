/**
 * Toolbar Component
 *
 * Horizontal toolbar with items, keyboard navigation, and size variants.
 *
 * @example
 * ```tsx
 * <Toolbar
 *   items={[
 *     { id: 'new', icon: <PlusIcon />, tooltip: 'New file' },
 *     { id: 'sep1', type: 'separator' },
 *     { id: 'cut', icon: <CutIcon />, tooltip: 'Cut' },
 *     { id: 'spacer', type: 'spacer' },
 *     { id: 'settings', icon: <SettingsIcon />, tooltip: 'Settings' },
 *   ]}
 *   size="md"
 *   variant="default"
 * />
 * ```
 */

import React, { useCallback, useRef } from 'react';
import { cn } from '../lib/utils';
import type { ToolbarProps, ToolbarItem, ToolbarSize } from './types';
import { TOOLBAR_SIZE_CLASSES, TOOLBAR_GLASS_STYLES } from './types';
import { ToolbarButton } from './ToolbarButton';
import { ToolbarDropdown } from './ToolbarDropdown';
import { ToolbarSeparator, ToolbarSpacer } from './ToolbarGroup';

/**
 * Render a single toolbar item based on its type
 */
const renderToolbarItem = (item: ToolbarItem, size: ToolbarSize) => {
  switch (item.type) {
    case 'separator':
      return <ToolbarSeparator key={item.id} />;

    case 'spacer':
      return <ToolbarSpacer key={item.id} />;

    case 'dropdown':
      return <ToolbarDropdown key={item.id} item={item} size={size} />;

    case 'custom':
      if (item.render) {
        return (
          <div key={item.id} className="flex items-center">
            {item.render()}
          </div>
        );
      }
      return null;

    case 'button':
    case 'toggle':
    default:
      return <ToolbarButton key={item.id} item={item} size={size} />;
  }
};

export const Toolbar = React.forwardRef<HTMLDivElement, ToolbarProps>(
  ({ items, size = 'md', variant = 'default', className }, ref) => {
    const toolbarRef = useRef<HTMLDivElement>(null);
    const sizeClasses = TOOLBAR_SIZE_CLASSES[size];

    // Keyboard navigation
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        const toolbar = toolbarRef.current;
        if (!toolbar) return;

        const focusableItems = toolbar.querySelectorAll(
          'button:not([disabled])'
        );
        const currentIndex = Array.from(focusableItems).indexOf(
          document.activeElement as HTMLButtonElement
        );

        let nextIndex = -1;

        switch (e.key) {
          case 'ArrowRight':
          case 'ArrowDown':
            e.preventDefault();
            nextIndex =
              currentIndex < focusableItems.length - 1 ? currentIndex + 1 : 0;
            break;

          case 'ArrowLeft':
          case 'ArrowUp':
            e.preventDefault();
            nextIndex =
              currentIndex > 0 ? currentIndex - 1 : focusableItems.length - 1;
            break;

          case 'Home':
            e.preventDefault();
            nextIndex = 0;
            break;

          case 'End':
            e.preventDefault();
            nextIndex = focusableItems.length - 1;
            break;

          default:
            return;
        }

        if (nextIndex >= 0) {
          (focusableItems[nextIndex] as HTMLButtonElement).focus();
        }
      },
      []
    );

    // Merge refs
    const setRefs = (node: HTMLDivElement | null) => {
      (toolbarRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    };

    return (
      <div
        ref={setRefs}
        role="toolbar"
        aria-label="Toolbar"
        onKeyDown={handleKeyDown}
        className={cn(
          'flex items-center',
          sizeClasses.height,
          sizeClasses.padding,
          sizeClasses.gap,
          TOOLBAR_GLASS_STYLES[variant],
          className
        )}
      >
        {items.map((item) => renderToolbarItem(item, size))}
      </div>
    );
  }
);

Toolbar.displayName = 'Toolbar';

export default Toolbar;
