/**
 * ToolbarDropdown Component
 *
 * Dropdown menu for toolbar with click-to-open behavior.
 *
 * @example
 * ```tsx
 * <ToolbarDropdown
 *   item={{
 *     id: 'format',
 *     icon: <FormatIcon />,
 *     label: 'Format',
 *     children: [
 *       { id: 'bold', label: 'Bold', onClick: handleBold },
 *       { id: 'italic', label: 'Italic', onClick: handleItalic },
 *     ]
 *   }}
 *   size="md"
 * />
 * ```
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '../lib/utils';
import type { ToolbarDropdownProps, ToolbarSize, ToolbarItem } from './types';
import { TOOLBAR_BUTTON_SIZES, TOOLBAR_SIZE_CLASSES } from './types';

/** Chevron down icon */
const ChevronDown: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

/** Dropdown menu item */
const DropdownItem: React.FC<{
  item: ToolbarItem;
  size: ToolbarSize;
  onClose: () => void;
}> = ({ item, size, onClose }) => {
  const sizeClasses = TOOLBAR_SIZE_CLASSES[size];

  const handleClick = () => {
    if (!item.disabled && item.onClick) {
      item.onClick();
      onClose();
    }
  };

  // Handle separator type
  if (item.type === 'separator') {
    return <div className="h-px bg-white/10 my-1 mx-2" />;
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={item.disabled}
      className={cn(
        'w-full flex items-center px-3 py-1.5 text-left transition-colors',
        sizeClasses.gap,
        sizeClasses.text,
        'text-white/70 hover:text-white hover:bg-white/10',
        item.active && 'text-white bg-white/5',
        item.disabled && 'opacity-40 pointer-events-none'
      )}
    >
      {item.icon && (
        <span className={cn('flex-shrink-0', sizeClasses.icon)}>
          {item.icon}
        </span>
      )}
      <span className="flex-1 truncate">{item.label}</span>
      {/* Checkmark for active toggle items */}
      {item.type === 'toggle' && item.active && (
        <svg
          className="w-4 h-4 text-blue-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      )}
    </button>
  );
};

export const ToolbarDropdown = React.forwardRef<
  HTMLDivElement,
  ToolbarDropdownProps
>(({ item, size = 'md' }, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const sizeClasses = TOOLBAR_SIZE_CLASSES[size];
  const buttonSizes = TOOLBAR_BUTTON_SIZES[size];

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleToggle = useCallback(() => {
    if (!item.disabled) {
      setIsOpen((prev) => !prev);
    }
  }, [item.disabled]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleToggle();
      } else if (e.key === 'ArrowDown' && !isOpen) {
        e.preventDefault();
        setIsOpen(true);
      }
    },
    [handleToggle, isOpen]
  );

  // Merge refs
  const setContainerRef = (node: HTMLDivElement | null) => {
    (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  };

  return (
    <div ref={setContainerRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        disabled={item.disabled}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={item.tooltip || item.label}
        className={cn(
          'flex items-center justify-center rounded-md transition-all duration-150',
          buttonSizes.padding,
          sizeClasses.gap,
          sizeClasses.text,
          'text-white/70',
          'hover:bg-white/10 hover:text-white',
          isOpen && 'bg-white/15 text-white',
          'active:bg-white/20',
          item.disabled && 'opacity-40 pointer-events-none',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50'
        )}
      >
        {item.icon && (
          <span className={cn('flex-shrink-0', sizeClasses.icon)}>
            {item.icon}
          </span>
        )}
        {item.label && <span className="truncate">{item.label}</span>}
        <ChevronDown
          className={cn(
            'w-3 h-3 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {/* Dropdown menu */}
      {isOpen && item.children && item.children.length > 0 && (
        <div
          className={cn(
            'absolute top-full left-0 mt-1 min-w-[160px] py-1 rounded-lg z-50',
            'bg-zinc-900/95 backdrop-blur-lg shadow-xl',
            'border border-white/10',
            'animate-in fade-in-0 slide-in-from-top-2 duration-150'
          )}
          role="menu"
        >
          {item.children.map((child) => (
            <DropdownItem
              key={child.id}
              item={child}
              size={size}
              onClose={handleClose}
            />
          ))}
        </div>
      )}
    </div>
  );
});

ToolbarDropdown.displayName = 'ToolbarDropdown';

export default ToolbarDropdown;
