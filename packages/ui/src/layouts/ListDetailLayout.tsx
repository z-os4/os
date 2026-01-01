/**
 * ListDetailLayout - List with optional detail view
 * 
 * Features:
 * - Optional header with summary/stats
 * - Tab navigation
 * - Scrollable list of items
 * - Optional footer
 * 
 * @example
 * <ListDetailLayout
 *   header={<WalletHeader balance="$41,955" />}
 *   tabs={[{ id: 'tokens', label: 'Tokens' }, { id: 'activity', label: 'Activity' }]}
 *   activeTab="tokens"
 *   onTabChange={setActiveTab}
 *   items={tokens.map(t => <TokenRow key={t.id} {...t} />)}
 * />
 */

import React, { ReactNode } from 'react';
import { cn } from '../lib/utils';
import type { TabItem } from './types';

export interface ListDetailLayoutProps {
  header?: ReactNode;
  tabs?: TabItem[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  items: ReactNode;
  footer?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function ListDetailLayout({
  header,
  tabs,
  activeTab,
  onTabChange,
  items,
  footer,
  actions,
  className,
}: ListDetailLayoutProps) {
  return (
    <div className={cn('flex flex-col h-full bg-zos-bg-primary', className)}>
      {/* Header */}
      {header && (
        <div className="p-6">
          {header}
        </div>
      )}

      {/* Actions */}
      {actions && (
        <div className="flex justify-center gap-4 px-6 pb-6">
          {actions}
        </div>
      )}

      {/* Tabs */}
      {tabs && tabs.length > 0 && (
        <div className="flex border-b border-zos-border-primary">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange?.(tab.id)}
              className={cn(
                'flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2',
                activeTab === tab.id
                  ? 'text-zos-text-primary border-b-2 border-zos-accent-primary'
                  : 'text-zos-text-muted hover:text-zos-text-secondary'
              )}
            >
              {tab.icon}
              {tab.label}
              {tab.badge && (
                <span className="px-1.5 py-0.5 text-xs bg-zos-accent-primary text-white rounded-full">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Items List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-2">
          {items}
        </div>
      </div>

      {/* Footer */}
      {footer && (
        <div className="p-4 border-t border-zos-border-primary">
          {footer}
        </div>
      )}
    </div>
  );
}

// List Item Component
export interface ListItemRowProps {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  value?: string;
  valueSubtitle?: string;
  valueColor?: 'default' | 'success' | 'error';
  onClick?: () => void;
}

export function ListItemRow({
  icon,
  title,
  subtitle,
  value,
  valueSubtitle,
  valueColor = 'default',
  onClick,
}: ListItemRowProps) {
  const valueColors = {
    default: 'text-zos-text-primary',
    success: 'text-green-400',
    error: 'text-red-400',
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors',
        onClick && 'cursor-pointer'
      )}
    >
      {icon && (
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white">
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-zos-text-primary font-medium">{title}</p>
        {subtitle && <p className="text-zos-text-muted text-sm">{subtitle}</p>}
      </div>
      {(value || valueSubtitle) && (
        <div className="text-right">
          {value && <p className={cn('font-medium', valueColors[valueColor])}>{value}</p>}
          {valueSubtitle && <p className="text-zos-text-muted text-sm">{valueSubtitle}</p>}
        </div>
      )}
    </div>
  );
}

export default ListDetailLayout;
