/**
 * Tabs Component
 *
 * Tab navigation with multiple style variants and glass styling.
 *
 * @example
 * ```tsx
 * <Tabs
 *   tabs={[
 *     { id: 'general', label: 'General', content: <GeneralSettings /> },
 *     { id: 'appearance', label: 'Appearance', icon: <Palette />, content: <AppearanceSettings /> },
 *   ]}
 *   activeId={activeTab}
 *   onChange={setActiveTab}
 *   variant="underline"
 * />
 * ```
 */

import React, { useCallback, useRef, useId } from 'react';
import { cn } from '../lib/utils';
import type { Size } from './types';

export interface Tab {
  /** Unique tab identifier */
  id: string;
  /** Tab label content */
  label: React.ReactNode;
  /** Icon to display before label */
  icon?: React.ReactNode;
  /** Tab content when active */
  content: React.ReactNode;
  /** Whether tab is disabled */
  disabled?: boolean;
  /** Whether tab can be closed */
  closable?: boolean;
}

export interface TabsProps {
  /** Tab definitions */
  tabs: Tab[];
  /** Currently active tab ID */
  activeId: string;
  /** Callback when active tab changes */
  onChange: (id: string) => void;
  /** Callback when tab is closed */
  onClose?: (id: string) => void;
  /** Tab style variant */
  variant?: 'default' | 'pills' | 'underline';
  /** Tab size */
  size?: Size;
  /** Additional CSS classes for tab list */
  className?: string;
  /** Additional CSS classes for content area */
  contentClassName?: string;
}

function CloseIcon() {
  return (
    <svg
      className="w-3.5 h-3.5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

export const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  (
    {
      tabs,
      activeId,
      onChange,
      onClose,
      variant = 'default',
      size = 'md',
      className,
      contentClassName,
    },
    ref
  ) => {
    const tablistRef = useRef<HTMLDivElement>(null);
    const baseId = useId();

    const activeTab = tabs.find((tab) => tab.id === activeId);
    const enabledTabs = tabs.filter((tab) => !tab.disabled);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        const currentIndex = enabledTabs.findIndex((tab) => tab.id === activeId);
        let nextIndex: number;

        switch (e.key) {
          case 'ArrowLeft':
            e.preventDefault();
            nextIndex = currentIndex > 0 ? currentIndex - 1 : enabledTabs.length - 1;
            onChange(enabledTabs[nextIndex].id);
            break;
          case 'ArrowRight':
            e.preventDefault();
            nextIndex = currentIndex < enabledTabs.length - 1 ? currentIndex + 1 : 0;
            onChange(enabledTabs[nextIndex].id);
            break;
          case 'Home':
            e.preventDefault();
            onChange(enabledTabs[0].id);
            break;
          case 'End':
            e.preventDefault();
            onChange(enabledTabs[enabledTabs.length - 1].id);
            break;
        }
      },
      [activeId, enabledTabs, onChange]
    );

    const handleClose = useCallback(
      (e: React.MouseEvent, tabId: string) => {
        e.stopPropagation();
        onClose?.(tabId);
      },
      [onClose]
    );

    const sizeStyles = {
      sm: 'text-xs px-2 py-1.5 gap-1',
      md: 'text-sm px-3 py-2 gap-2',
      lg: 'text-base px-4 py-2.5 gap-2',
    };

    const variantStyles = {
      default: {
        list: 'bg-white/5 backdrop-blur-xl rounded-lg p-1 border border-white/10',
        tab: 'rounded-md transition-colors',
        activeTab: 'bg-white/10 text-white shadow-sm',
        inactiveTab: 'text-white/60 hover:text-white hover:bg-white/5',
      },
      pills: {
        list: 'flex gap-2',
        tab: 'rounded-full transition-colors',
        activeTab: 'bg-blue-500 text-white',
        inactiveTab: 'text-white/60 hover:text-white bg-white/5 hover:bg-white/10',
      },
      underline: {
        list: 'border-b border-white/10',
        tab: 'border-b-2 -mb-px transition-colors',
        activeTab: 'border-blue-500 text-white',
        inactiveTab: 'border-transparent text-white/60 hover:text-white hover:border-white/30',
      },
    };

    const styles = variantStyles[variant];

    return (
      <div ref={ref} className="flex flex-col">
        <div
          ref={tablistRef}
          role="tablist"
          aria-orientation="horizontal"
          className={cn('flex', styles.list, className)}
          onKeyDown={handleKeyDown}
        >
          {tabs.map((tab) => {
            const isActive = tab.id === activeId;
            const tabPanelId = `${baseId}-panel-${tab.id}`;
            const tabId = `${baseId}-tab-${tab.id}`;

            return (
              <button
                key={tab.id}
                id={tabId}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={tabPanelId}
                aria-disabled={tab.disabled}
                tabIndex={isActive ? 0 : -1}
                className={cn(
                  'inline-flex items-center font-medium',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50',
                  styles.tab,
                  sizeStyles[size],
                  isActive ? styles.activeTab : styles.inactiveTab,
                  tab.disabled && 'opacity-50 cursor-not-allowed pointer-events-none'
                )}
                onClick={() => !tab.disabled && onChange(tab.id)}
              >
                {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
                <span>{tab.label}</span>
                {tab.closable && onClose && (
                  <button
                    type="button"
                    className={cn(
                      'flex-shrink-0 p-0.5 rounded hover:bg-white/10 transition-colors',
                      'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50'
                    )}
                    onClick={(e) => handleClose(e, tab.id)}
                    aria-label={`Close ${typeof tab.label === 'string' ? tab.label : 'tab'}`}
                    tabIndex={-1}
                  >
                    <CloseIcon />
                  </button>
                )}
              </button>
            );
          })}
        </div>

        {activeTab && (
          <div
            id={`${baseId}-panel-${activeTab.id}`}
            role="tabpanel"
            aria-labelledby={`${baseId}-tab-${activeTab.id}`}
            tabIndex={0}
            className={cn('mt-4 focus:outline-none', contentClassName)}
          >
            {activeTab.content}
          </div>
        )}
      </div>
    );
  }
);

Tabs.displayName = 'Tabs';

/**
 * Simple TabList for custom tab implementations
 */
export interface TabListProps {
  /** Tab list children */
  children: React.ReactNode;
  /** Tab style variant */
  variant?: 'default' | 'pills' | 'underline';
  /** Additional CSS classes */
  className?: string;
}

export const TabList = React.forwardRef<HTMLDivElement, TabListProps>(
  ({ children, variant = 'default', className }, ref) => {
    const variantStyles = {
      default: 'bg-white/5 backdrop-blur-xl rounded-lg p-1 border border-white/10',
      pills: 'flex gap-2',
      underline: 'border-b border-white/10',
    };

    return (
      <div
        ref={ref}
        role="tablist"
        className={cn('flex', variantStyles[variant], className)}
      >
        {children}
      </div>
    );
  }
);

TabList.displayName = 'TabList';

/**
 * Simple TabButton for custom tab implementations
 */
export interface TabButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Whether tab is active */
  active?: boolean;
  /** Tab style variant */
  variant?: 'default' | 'pills' | 'underline';
  /** Tab size */
  size?: Size;
}

export const TabButton = React.forwardRef<HTMLButtonElement, TabButtonProps>(
  ({ active, variant = 'default', size = 'md', className, children, ...props }, ref) => {
    const sizeStyles = {
      sm: 'text-xs px-2 py-1.5 gap-1',
      md: 'text-sm px-3 py-2 gap-2',
      lg: 'text-base px-4 py-2.5 gap-2',
    };

    const variantStyles = {
      default: {
        tab: 'rounded-md transition-colors',
        active: 'bg-white/10 text-white shadow-sm',
        inactive: 'text-white/60 hover:text-white hover:bg-white/5',
      },
      pills: {
        tab: 'rounded-full transition-colors',
        active: 'bg-blue-500 text-white',
        inactive: 'text-white/60 hover:text-white bg-white/5 hover:bg-white/10',
      },
      underline: {
        tab: 'border-b-2 -mb-px transition-colors',
        active: 'border-blue-500 text-white',
        inactive: 'border-transparent text-white/60 hover:text-white hover:border-white/30',
      },
    };

    const styles = variantStyles[variant];

    return (
      <button
        ref={ref}
        type="button"
        role="tab"
        aria-selected={active}
        className={cn(
          'inline-flex items-center font-medium',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50',
          styles.tab,
          sizeStyles[size],
          active ? styles.active : styles.inactive,
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

TabButton.displayName = 'TabButton';

/**
 * TabPanel wrapper for custom tab implementations
 */
export interface TabPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Whether panel is visible */
  active?: boolean;
}

export const TabPanel = React.forwardRef<HTMLDivElement, TabPanelProps>(
  ({ active = true, className, children, ...props }, ref) => {
    if (!active) return null;

    return (
      <div
        ref={ref}
        role="tabpanel"
        tabIndex={0}
        className={cn('focus:outline-none', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

TabPanel.displayName = 'TabPanel';
