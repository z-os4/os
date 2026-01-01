/**
 * SettingsLayout - Settings/preferences interface
 * 
 * Features:
 * - Sidebar with section navigation
 * - Main content panel
 * - Settings rows with labels, descriptions, controls
 * 
 * @example
 * <SettingsLayout
 *   sections={[
 *     { id: 'general', label: 'General', icon: <Settings /> },
 *     { id: 'appearance', label: 'Appearance', icon: <Palette /> },
 *   ]}
 *   activeSection="general"
 *   onSectionChange={setActiveSection}
 * >
 *   <SettingsSection title="Display">
 *     <SettingsRow label="Theme" description="Choose light or dark">
 *       <Select value={theme} onChange={setTheme} />
 *     </SettingsRow>
 *   </SettingsSection>
 * </SettingsLayout>
 */

import React, { ReactNode } from 'react';
import { cn } from '../lib/utils';
import type { LayoutSidebarItem } from './types';

export interface SettingsLayoutProps {
  sections: LayoutSidebarItem[];
  activeSection?: string;
  onSectionChange?: (sectionId: string) => void;
  children: ReactNode;
  sidebarWidth?: number;
  className?: string;
}

export function SettingsLayout({
  sections,
  activeSection,
  onSectionChange,
  children,
  sidebarWidth = 240,
  className,
}: SettingsLayoutProps) {
  return (
    <div className={cn('flex h-full bg-zos-bg-primary', className)}>
      {/* Sidebar */}
      <div 
        className="border-r border-zos-border-primary p-3 overflow-y-auto"
        style={{ width: sidebarWidth }}
      >
        <div className="space-y-1">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => onSectionChange?.(section.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                activeSection === section.id
                  ? 'bg-white/10 text-zos-text-primary'
                  : 'text-zos-text-secondary hover:bg-white/5'
              )}
            >
              {section.icon && (
                <span className="w-5 h-5 flex items-center justify-center">
                  {section.icon}
                </span>
              )}
              <span>{section.label}</span>
              {section.badge && (
                <span className="ml-auto px-1.5 py-0.5 text-xs bg-zos-accent-primary text-white rounded-full">
                  {section.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {children}
      </div>
    </div>
  );
}

// Settings Section Component
export interface SettingsSectionProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function SettingsSection({ title, description, children, className }: SettingsSectionProps) {
  return (
    <div className={cn('mb-8', className)}>
      {title && (
        <div className="mb-4">
          <h2 className="text-zos-text-primary font-semibold text-lg">{title}</h2>
          {description && (
            <p className="text-zos-text-muted text-sm mt-1">{description}</p>
          )}
        </div>
      )}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}

// Settings Row Component
export interface SettingsRowProps {
  label: string;
  description?: string;
  children: ReactNode;
  className?: string;
  vertical?: boolean;
}

export function SettingsRow({ label, description, children, className, vertical = false }: SettingsRowProps) {
  return (
    <div 
      className={cn(
        'p-4 bg-white/5 rounded-xl',
        vertical ? 'space-y-3' : 'flex items-center justify-between',
        className
      )}
    >
      <div className={cn(!vertical && 'flex-1 mr-4')}>
        <p className="text-zos-text-primary font-medium">{label}</p>
        {description && (
          <p className="text-zos-text-muted text-sm mt-0.5">{description}</p>
        )}
      </div>
      <div className={cn(vertical && 'w-full')}>
        {children}
      </div>
    </div>
  );
}

// Toggle Switch Component
export interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
}

export function ToggleSwitch({ checked, onChange, disabled = false, size = 'md' }: ToggleSwitchProps) {
  const sizes = {
    sm: { track: 'w-8 h-4', thumb: 'w-3 h-3', translate: 'translate-x-4' },
    md: { track: 'w-11 h-6', thumb: 'w-5 h-5', translate: 'translate-x-5' },
  };
  const s = sizes[size];

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex shrink-0 rounded-full transition-colors',
        s.track,
        checked ? 'bg-zos-accent-primary' : 'bg-white/20',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <span
        className={cn(
          'pointer-events-none inline-block rounded-full bg-white shadow-lg transform transition-transform',
          s.thumb,
          checked ? s.translate : 'translate-x-0.5',
          'mt-0.5'
        )}
      />
    </button>
  );
}

// Select Component
export interface SelectOption {
  value: string;
  label: string;
}

export interface SettingsSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  disabled?: boolean;
  className?: string;
}

export function SettingsSelect({ value, onChange, options, disabled, className }: SettingsSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={cn(
        'bg-white/10 border border-zos-border-primary rounded-lg px-3 py-2 text-zos-text-primary',
        'focus:outline-none focus:border-zos-accent-primary',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export default SettingsLayout;
