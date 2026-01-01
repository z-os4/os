/**
 * Context Menu Component
 *
 * Renders the context menu with support for nested submenus,
 * icons, keyboard shortcuts, separators, and checkbox/radio items.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { Z_INDEX } from '../constants';
import type {
  ContextMenuItem,
  ContextMenuActionItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioGroup,
  ContextMenuProps,
  ContextMenuPosition,
} from './types';

/** Animation variants for the menu */
const menuVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.1 } },
};

/** Calculate safe position within viewport bounds */
function calculateSafePosition(
  position: ContextMenuPosition,
  menuRect: DOMRect | null,
  isSubmenu: boolean = false
): { x: number; y: number } {
  if (!menuRect) return position;

  const padding = 8;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  let { x, y } = position;

  // Adjust horizontal position
  if (x + menuRect.width > viewportWidth - padding) {
    if (isSubmenu) {
      // Open submenu to the left of parent
      x = x - menuRect.width - 4;
    } else {
      x = viewportWidth - menuRect.width - padding;
    }
  }

  // Adjust vertical position
  if (y + menuRect.height > viewportHeight - padding) {
    y = viewportHeight - menuRect.height - padding;
  }

  // Ensure minimum position
  x = Math.max(padding, x);
  y = Math.max(padding, y);

  return { x, y };
}

/** Get focusable items from the item list */
function getFocusableItems(items: ContextMenuItem[]): ContextMenuItem[] {
  return items.filter(
    (item) =>
      item.type !== 'separator' &&
      item.type !== 'label' &&
      !item.disabled &&
      !item.hidden
  );
}

export function ContextMenu({
  items,
  position,
  isSubmenu = false,
  parentPath = [],
  onClose,
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [safePosition, setSafePosition] = useState(position);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [openSubmenuId, setOpenSubmenuId] = useState<string | null>(null);
  const [submenuPosition, setSubmenuPosition] = useState<ContextMenuPosition>({ x: 0, y: 0 });

  // Calculate safe position after mount
  useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const safe = calculateSafePosition(position, rect, isSubmenu);
      setSafePosition(safe);
    }
  }, [position, isSubmenu]);

  // Get focusable items
  const focusableItems = getFocusableItems(items);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle keys for this menu if a submenu is open
      if (openSubmenuId) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex((prev) => {
            const next = prev + 1;
            return next >= focusableItems.length ? 0 : next;
          });
          break;

        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex((prev) => {
            const next = prev - 1;
            return next < 0 ? focusableItems.length - 1 : next;
          });
          break;

        case 'ArrowRight': {
          e.preventDefault();
          const focusedItem = focusableItems[focusedIndex] as ContextMenuActionItem;
          if (focusedItem?.submenu) {
            // Open submenu
            const itemElement = menuRef.current?.querySelector(
              `[data-item-id="${focusedItem.id}"]`
            );
            if (itemElement) {
              const rect = itemElement.getBoundingClientRect();
              setSubmenuPosition({ x: rect.right + 4, y: rect.top });
              setOpenSubmenuId(focusedItem.id);
            }
          }
          break;
        }

        case 'ArrowLeft':
          if (isSubmenu) {
            e.preventDefault();
            onClose?.();
          }
          break;

        case 'Enter':
        case ' ': {
          e.preventDefault();
          const focusedItem = focusableItems[focusedIndex];
          if (focusedItem) {
            handleItemClick(focusedItem);
          }
          break;
        }
      }
    };

    if (!isSubmenu || focusedIndex >= 0) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [focusableItems, focusedIndex, openSubmenuId, isSubmenu, onClose]);

  /** Handle item click */
  const handleItemClick = useCallback(
    (item: ContextMenuItem) => {
      if (item.disabled) return;

      if (item.type === 'checkbox') {
        item.onChange?.(!item.checked);
        return;
      }

      if (item.type === 'radio-group') {
        // Radio groups are handled differently
        return;
      }

      if (!item.type || item.type === 'item') {
        const actionItem = item as ContextMenuActionItem;
        if (actionItem.submenu) {
          // Don't close, open submenu
          return;
        }
        actionItem.onClick?.();
        onClose?.();
      }
    },
    [onClose]
  );

  /** Handle radio option click */
  const handleRadioChange = useCallback(
    (group: ContextMenuRadioGroup, value: string) => {
      group.onChange?.(value);
      onClose?.();
    },
    [onClose]
  );

  /** Handle mouse enter on item with submenu */
  const handleMouseEnter = useCallback(
    (item: ContextMenuActionItem, e: React.MouseEvent) => {
      if (item.submenu && !item.disabled) {
        const target = e.currentTarget as HTMLElement;
        const rect = target.getBoundingClientRect();
        setSubmenuPosition({ x: rect.right + 4, y: rect.top });
        setOpenSubmenuId(item.id);
      } else {
        setOpenSubmenuId(null);
      }

      // Update focused index
      const index = focusableItems.findIndex((fi) => fi.id === item.id);
      if (index >= 0) {
        setFocusedIndex(index);
      }
    },
    [focusableItems]
  );

  /** Close submenu */
  const closeSubmenu = useCallback(() => {
    setOpenSubmenuId(null);
  }, []);

  /** Render a single menu item */
  const renderItem = (item: ContextMenuItem, index: number) => {
    const isFocused = focusableItems[focusedIndex]?.id === item.id;

    // Separator
    if (item.type === 'separator') {
      return (
        <div
          key={item.id}
          className="h-px bg-white/10 my-1 mx-2"
          role="separator"
        />
      );
    }

    // Label
    if (item.type === 'label') {
      return (
        <div
          key={item.id}
          className="px-3 py-1.5 text-xs font-medium text-white/50 select-none"
        >
          {item.label}
        </div>
      );
    }

    // Checkbox
    if (item.type === 'checkbox') {
      return (
        <button
          key={item.id}
          data-item-id={item.id}
          className={cn(
            'flex items-center w-full px-3 py-1.5 text-sm text-left',
            'transition-colors duration-75',
            item.disabled
              ? 'text-white/30 cursor-not-allowed'
              : isFocused
                ? 'bg-blue-500 text-white'
                : 'text-white/90 hover:bg-white/10'
          )}
          onClick={() => handleItemClick(item)}
          disabled={item.disabled}
          role="menuitemcheckbox"
          aria-checked={item.checked}
        >
          <span className="w-5 h-5 mr-2 flex items-center justify-center">
            {item.checked && <Check className="w-4 h-4" />}
          </span>
          {item.icon && <span className="mr-2">{item.icon}</span>}
          <span className="flex-1">{item.label}</span>
        </button>
      );
    }

    // Radio group
    if (item.type === 'radio-group') {
      return (
        <div key={item.id} role="group" aria-label={item.label}>
          {item.label && (
            <div className="px-3 py-1.5 text-xs font-medium text-white/50 select-none">
              {item.label}
            </div>
          )}
          {item.options.map((option) => {
            const isSelected = item.value === option.value;
            const optionFocused =
              focusableItems[focusedIndex]?.id === `${item.id}-${option.value}`;

            return (
              <button
                key={option.value}
                data-item-id={`${item.id}-${option.value}`}
                className={cn(
                  'flex items-center w-full px-3 py-1.5 text-sm text-left',
                  'transition-colors duration-75',
                  option.disabled
                    ? 'text-white/30 cursor-not-allowed'
                    : optionFocused
                      ? 'bg-blue-500 text-white'
                      : 'text-white/90 hover:bg-white/10'
                )}
                onClick={() => handleRadioChange(item, option.value)}
                disabled={option.disabled || item.disabled}
                role="menuitemradio"
                aria-checked={isSelected}
              >
                <span className="w-5 h-5 mr-2 flex items-center justify-center">
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-current" />
                  )}
                </span>
                {option.icon && <span className="mr-2">{option.icon}</span>}
                <span className="flex-1">{option.label}</span>
              </button>
            );
          })}
        </div>
      );
    }

    // Regular action item
    const actionItem = item as ContextMenuActionItem;
    const hasSubmenu = Boolean(actionItem.submenu);

    return (
      <button
        key={item.id}
        data-item-id={item.id}
        className={cn(
          'flex items-center w-full px-3 py-1.5 text-sm text-left',
          'transition-colors duration-75',
          item.disabled
            ? 'text-white/30 cursor-not-allowed'
            : actionItem.destructive
              ? isFocused
                ? 'bg-red-500 text-white'
                : 'text-red-400 hover:bg-red-500/20'
              : isFocused
                ? 'bg-blue-500 text-white'
                : 'text-white/90 hover:bg-white/10'
        )}
        onClick={() => handleItemClick(item)}
        onMouseEnter={(e) => handleMouseEnter(actionItem, e)}
        disabled={item.disabled}
        role="menuitem"
        aria-haspopup={hasSubmenu ? 'menu' : undefined}
        aria-expanded={hasSubmenu ? openSubmenuId === item.id : undefined}
      >
        {actionItem.icon && (
          <span className="w-5 h-5 mr-2 flex items-center justify-center">
            {actionItem.icon}
          </span>
        )}
        <span className="flex-1">{actionItem.label}</span>
        {actionItem.shortcut && (
          <span
            className={cn(
              'ml-4 text-xs',
              item.disabled
                ? 'text-white/20'
                : isFocused
                  ? 'text-white/70'
                  : 'text-white/40'
            )}
          >
            {actionItem.shortcut}
          </span>
        )}
        {hasSubmenu && (
          <ChevronRight
            className={cn(
              'w-4 h-4 ml-2',
              item.disabled ? 'text-white/20' : ''
            )}
          />
        )}
      </button>
    );
  };

  return (
    <>
      <motion.div
        ref={menuRef}
        data-context-menu
        className={cn(
          'fixed',
          'min-w-[180px] max-w-[300px]',
          'py-1 rounded-lg',
          'bg-gray-800/95 backdrop-blur-xl',
          'border border-white/10',
          'shadow-xl shadow-black/30',
          'outline-none'
        )}
        style={{
          left: safePosition.x,
          top: safePosition.y,
          zIndex: Z_INDEX.CONTEXT_MENU,
        }}
        variants={menuVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.15, ease: 'easeOut' }}
        role="menu"
        aria-orientation="vertical"
      >
        {items
          .filter((item) => !item.hidden)
          .map((item, index) => renderItem(item, index))}
      </motion.div>

      {/* Submenu */}
      <AnimatePresence>
        {openSubmenuId && (
          <>
            {items
              .filter(
                (item): item is ContextMenuActionItem =>
                  (!item.type || item.type === 'item') &&
                  item.id === openSubmenuId &&
                  Boolean((item as ContextMenuActionItem).submenu)
              )
              .map((item) => (
                <ContextMenu
                  key={`submenu-${item.id}`}
                  items={item.submenu!}
                  position={submenuPosition}
                  isSubmenu
                  parentPath={[...parentPath, item.id]}
                  onClose={closeSubmenu}
                />
              ))}
          </>
        )}
      </AnimatePresence>
    </>
  );
}
