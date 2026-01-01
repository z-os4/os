/**
 * NavSidebar Component
 *
 * Full-featured sidebar navigation with sections, collapsing, and glass styling.
 * Named NavSidebar to avoid conflict with existing Sidebar component.
 *
 * @example
 * ```tsx
 * <NavSidebar
 *   sections={[
 *     {
 *       id: 'main',
 *       title: 'Navigation',
 *       items: [
 *         { id: 'home', label: 'Home', icon: <Home /> },
 *         { id: 'settings', label: 'Settings', icon: <Settings /> },
 *       ],
 *     },
 *   ]}
 *   activeId="home"
 *   collapsed={false}
 * />
 * ```
 */

import React, { useState, useCallback } from 'react';
import { cn } from '../lib/utils';
import type { NavItem, SidebarSection } from './types';
import { NAV_GLASS_STYLES } from './types';

export type { SidebarSection };

export interface NavSidebarProps {
  /** Sidebar sections */
  sections: SidebarSection[];
  /** Currently active item ID */
  activeId?: string;
  /** Item click handler */
  onItemClick?: (item: NavItem) => void;
  /** Whether sidebar is collapsed */
  collapsed?: boolean;
  /** Collapsed state change handler */
  onCollapsedChange?: (collapsed: boolean) => void;
  /** Expanded width */
  width?: number;
  /** Collapsed width */
  collapsedWidth?: number;
  /** Header content */
  header?: React.ReactNode;
  /** Footer content */
  footer?: React.ReactNode;
  /** Additional class name */
  className?: string;
}

/** Chevron icons */
const ChevronLeft: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRight: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);

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

/** Sidebar nav item */
const SidebarNavItem: React.FC<{
  item: NavItem;
  isActive: boolean;
  onItemClick?: (item: NavItem) => void;
  collapsed: boolean;
  depth?: number;
}> = ({ item, isActive, onItemClick, collapsed, depth = 0 }) => {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

  const handleClick = useCallback(() => {
    if (item.disabled) return;

    if (hasChildren) {
      setExpanded((prev) => !prev);
    } else {
      item.onClick?.();
      onItemClick?.(item);
    }
  }, [item, hasChildren, onItemClick]);

  const content = (
    <>
      {item.icon && (
        <span className="flex-shrink-0 w-5 h-5">{item.icon}</span>
      )}
      {!collapsed && (
        <>
          <span className="flex-1 truncate text-left">{item.label}</span>
          {item.badge && (
            <span className="flex-shrink-0 text-xs text-white/40 tabular-nums">
              {item.badge}
            </span>
          )}
          {hasChildren && (
            <ChevronDown
              className={cn(
                'w-4 h-4 transition-transform flex-shrink-0',
                expanded && 'rotate-180'
              )}
            />
          )}
        </>
      )}
    </>
  );

  const buttonClasses = cn(
    'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
    'text-white/70 hover:bg-white/5 hover:text-white',
    isActive && 'bg-blue-500/20 text-white',
    item.disabled && NAV_GLASS_STYLES.disabled,
    collapsed && 'justify-center',
    depth > 0 && !collapsed && 'pl-8',
    NAV_GLASS_STYLES.focus
  );

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
        className={buttonClasses}
        aria-current={isActive ? 'page' : undefined}
        title={collapsed ? String(item.label) : undefined}
      >
        {content}
      </a>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={item.disabled}
        className={buttonClasses}
        aria-expanded={hasChildren ? expanded : undefined}
        aria-current={isActive ? 'page' : undefined}
        title={collapsed ? String(item.label) : undefined}
      >
        {content}
      </button>
      {hasChildren && expanded && !collapsed && (
        <div className="mt-0.5 space-y-0.5">
          {item.children!.map((child) => (
            <SidebarNavItem
              key={child.id}
              item={child}
              isActive={false}
              onItemClick={onItemClick}
              collapsed={collapsed}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/** Sidebar section */
const SidebarSectionComponent: React.FC<{
  section: SidebarSection;
  activeId?: string;
  onItemClick?: (item: NavItem) => void;
  collapsed: boolean;
}> = ({ section, activeId, onItemClick, collapsed }) => {
  const [sectionCollapsed, setSectionCollapsed] = useState(
    section.defaultCollapsed ?? false
  );

  const showSection = !sectionCollapsed || !section.collapsible;

  return (
    <div className="py-2">
      {section.title && !collapsed && (
        <button
          type="button"
          onClick={() =>
            section.collapsible && setSectionCollapsed((prev) => !prev)
          }
          disabled={!section.collapsible}
          className={cn(
            'w-full flex items-center justify-between px-3 py-1',
            'text-xs font-semibold text-white/40 uppercase tracking-wider',
            section.collapsible && 'hover:text-white/60 cursor-pointer',
            !section.collapsible && 'cursor-default'
          )}
        >
          <span>{section.title}</span>
          {section.collapsible && (
            <ChevronDown
              className={cn(
                'w-3 h-3 transition-transform',
                sectionCollapsed && '-rotate-90'
              )}
            />
          )}
        </button>
      )}
      {showSection && (
        <div className="px-2 space-y-0.5">
          {section.items.map((item) => (
            <SidebarNavItem
              key={item.id}
              item={item}
              isActive={item.id === activeId}
              onItemClick={onItemClick}
              collapsed={collapsed}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const NavSidebar = React.forwardRef<HTMLElement, NavSidebarProps>(
  (
    {
      sections,
      activeId,
      onItemClick,
      collapsed = false,
      onCollapsedChange,
      width = 240,
      collapsedWidth = 64,
      header,
      footer,
      className,
    },
    ref
  ) => {
    const currentWidth = collapsed ? collapsedWidth : width;

    return (
      <aside
        ref={ref}
        className={cn(
          'flex flex-col overflow-hidden transition-all duration-200',
          NAV_GLASS_STYLES.base,
          className
        )}
        style={{ width: currentWidth }}
      >
        {/* Header */}
        {header && (
          <div className="flex-shrink-0 border-b border-white/10 p-3">
            {header}
          </div>
        )}

        {/* Navigation sections */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden">
          {sections.map((section) => (
            <SidebarSectionComponent
              key={section.id}
              section={section}
              activeId={activeId}
              onItemClick={onItemClick}
              collapsed={collapsed}
            />
          ))}
        </nav>

        {/* Footer */}
        {footer && (
          <div className="flex-shrink-0 border-t border-white/10 p-3">
            {footer}
          </div>
        )}

        {/* Collapse toggle */}
        {onCollapsedChange && (
          <button
            type="button"
            onClick={() => onCollapsedChange(!collapsed)}
            className={cn(
              'flex-shrink-0 flex items-center justify-center py-3',
              'border-t border-white/10 text-white/50 hover:text-white',
              'transition-colors',
              NAV_GLASS_STYLES.focus
            )}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
        )}
      </aside>
    );
  }
);

NavSidebar.displayName = 'NavSidebar';
