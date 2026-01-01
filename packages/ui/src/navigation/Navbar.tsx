/**
 * Navbar Component
 *
 * Navigation bar with glass styling, multiple variants, and submenu support.
 *
 * @example
 * ```tsx
 * <Navbar
 *   items={[
 *     { id: 'home', label: 'Home', href: '/' },
 *     { id: 'products', label: 'Products', children: [...] },
 *   ]}
 *   activeId="home"
 *   variant="underline"
 * />
 * ```
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { cn } from '../lib/utils';
import type { NavItem, NavSize } from './types';
import { NAV_SIZE_CLASSES, NAV_GLASS_STYLES } from './types';

export type { NavItem };

export interface NavbarProps {
  /** Navigation items */
  items: NavItem[];
  /** Currently active item ID */
  activeId?: string;
  /** Item click handler */
  onItemClick?: (item: NavItem) => void;
  /** Layout orientation */
  orientation?: 'horizontal' | 'vertical';
  /** Visual variant */
  variant?: 'default' | 'pills' | 'underline';
  /** Size variant */
  size?: NavSize;
  /** Additional class name */
  className?: string;
}

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

/** Submenu component */
const NavSubmenu: React.FC<{
  items: NavItem[];
  activeId?: string;
  onItemClick?: (item: NavItem) => void;
  size: NavSize;
  isOpen: boolean;
  onClose: () => void;
}> = ({ items, activeId, onItemClick, size, isOpen, onClose }) => {
  const sizeClasses = NAV_SIZE_CLASSES[size];
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className={cn(
        'absolute top-full left-0 mt-1 min-w-[160px] py-1 rounded-lg z-50',
        NAV_GLASS_STYLES.base
      )}
      role="menu"
    >
      {items.map((item) => {
        const isActive = item.id === activeId;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              if (!item.disabled) {
                item.onClick?.();
                onItemClick?.(item);
                onClose();
              }
            }}
            disabled={item.disabled}
            className={cn(
              'w-full flex items-center',
              sizeClasses.padding,
              sizeClasses.gap,
              sizeClasses.text,
              'text-left transition-colors',
              isActive
                ? 'text-white bg-white/10'
                : 'text-white/70 hover:text-white hover:bg-white/5',
              item.disabled && NAV_GLASS_STYLES.disabled
            )}
            role="menuitem"
          >
            {item.icon && (
              <span className={cn('flex-shrink-0', sizeClasses.icon)}>
                {item.icon}
              </span>
            )}
            <span className="flex-1">{item.label}</span>
            {item.badge && (
              <span className="text-xs text-white/40">{item.badge}</span>
            )}
          </button>
        );
      })}
    </div>
  );
};

/** Individual nav item */
const NavbarItem: React.FC<{
  item: NavItem;
  isActive: boolean;
  onItemClick?: (item: NavItem) => void;
  orientation: 'horizontal' | 'vertical';
  variant: 'default' | 'pills' | 'underline';
  size: NavSize;
}> = ({ item, isActive, onItemClick, orientation, variant, size }) => {
  const [submenuOpen, setSubmenuOpen] = useState(false);
  const sizeClasses = NAV_SIZE_CLASSES[size];
  const hasChildren = item.children && item.children.length > 0;
  const isHorizontal = orientation === 'horizontal';

  const handleClick = useCallback(() => {
    if (item.disabled) return;

    if (hasChildren) {
      setSubmenuOpen((prev) => !prev);
    } else {
      item.onClick?.();
      onItemClick?.(item);
    }
  }, [item, hasChildren, onItemClick]);

  const baseClasses = cn(
    'relative flex items-center',
    sizeClasses.padding,
    sizeClasses.gap,
    sizeClasses.text,
    'font-medium transition-all',
    NAV_GLASS_STYLES.focus,
    item.disabled && NAV_GLASS_STYLES.disabled
  );

  const variantClasses = {
    default: cn(
      'rounded-lg',
      isActive
        ? 'text-white bg-white/10'
        : 'text-white/70 hover:text-white hover:bg-white/5'
    ),
    pills: cn(
      'rounded-full',
      isActive
        ? cn('text-white', NAV_GLASS_STYLES.active)
        : 'text-white/70 hover:text-white hover:bg-white/10'
    ),
    underline: cn(
      'relative',
      isActive
        ? 'text-white'
        : 'text-white/70 hover:text-white',
      isHorizontal && 'border-b-2',
      isHorizontal && (isActive ? 'border-blue-500' : 'border-transparent hover:border-white/30'),
      !isHorizontal && 'border-l-2',
      !isHorizontal && (isActive ? 'border-blue-500' : 'border-transparent hover:border-white/30')
    ),
  };

  const content = (
    <>
      {item.icon && (
        <span className={cn('flex-shrink-0', sizeClasses.icon)}>
          {item.icon}
        </span>
      )}
      <span>{item.label}</span>
      {item.badge && (
        <span className="text-xs bg-blue-500/30 text-blue-300 px-1.5 py-0.5 rounded-full">
          {item.badge}
        </span>
      )}
      {hasChildren && (
        <ChevronDown
          className={cn(
            'w-3 h-3 transition-transform',
            submenuOpen && 'rotate-180'
          )}
        />
      )}
    </>
  );

  const className = cn(baseClasses, variantClasses[variant]);

  if (item.href && !hasChildren) {
    return (
      <a
        href={item.href}
        onClick={(e) => {
          if (item.disabled) {
            e.preventDefault();
            return;
          }
          item.onClick?.();
          onItemClick?.(item);
        }}
        className={className}
        aria-current={isActive ? 'page' : undefined}
      >
        {content}
      </a>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleClick}
        disabled={item.disabled}
        className={className}
        aria-expanded={hasChildren ? submenuOpen : undefined}
        aria-haspopup={hasChildren ? 'menu' : undefined}
        aria-current={isActive ? 'page' : undefined}
      >
        {content}
      </button>
      {hasChildren && (
        <NavSubmenu
          items={item.children!}
          activeId={undefined}
          onItemClick={onItemClick}
          size={size}
          isOpen={submenuOpen}
          onClose={() => setSubmenuOpen(false)}
        />
      )}
    </div>
  );
};

export const Navbar = React.forwardRef<HTMLElement, NavbarProps>(
  (
    {
      items,
      activeId,
      onItemClick,
      orientation = 'horizontal',
      variant = 'default',
      size = 'md',
      className,
    },
    ref
  ) => {
    const isHorizontal = orientation === 'horizontal';
    const sizeClasses = NAV_SIZE_CLASSES[size];

    return (
      <nav
        ref={ref}
        className={cn(
          'flex',
          isHorizontal ? 'flex-row items-center' : 'flex-col',
          sizeClasses.gap,
          className
        )}
        aria-label="Navigation"
      >
        {items.map((item) => (
          <NavbarItem
            key={item.id}
            item={item}
            isActive={item.id === activeId}
            onItemClick={onItemClick}
            orientation={orientation}
            variant={variant}
            size={size}
          />
        ))}
      </nav>
    );
  }
);

Navbar.displayName = 'Navbar';
