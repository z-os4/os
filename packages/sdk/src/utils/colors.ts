/**
 * Color Utilities
 *
 * Color palette and utilities for consistent theming.
 */

/**
 * Priority colors for status indicators
 */
export const PRIORITY_COLORS = {
  none: 'text-white/30',
  low: 'text-blue-400',
  medium: 'text-orange-400',
  high: 'text-red-400',
} as const;

export type Priority = keyof typeof PRIORITY_COLORS;

export function getPriorityColor(priority: Priority): string {
  return PRIORITY_COLORS[priority] || PRIORITY_COLORS.none;
}

/**
 * Note/sticky colors
 */
export const NOTE_COLORS = [
  { id: 'yellow', bg: 'bg-yellow-200', text: 'text-yellow-900', border: 'border-yellow-300' },
  { id: 'pink', bg: 'bg-pink-200', text: 'text-pink-900', border: 'border-pink-300' },
  { id: 'blue', bg: 'bg-blue-200', text: 'text-blue-900', border: 'border-blue-300' },
  { id: 'green', bg: 'bg-green-200', text: 'text-green-900', border: 'border-green-300' },
  { id: 'purple', bg: 'bg-purple-200', text: 'text-purple-900', border: 'border-purple-300' },
  { id: 'orange', bg: 'bg-orange-200', text: 'text-orange-900', border: 'border-orange-300' },
] as const;

export type NoteColorId = typeof NOTE_COLORS[number]['id'];

export interface NoteColor {
  id: string;
  bg: string;
  text: string;
  border: string;
}

export function getNoteColor(colorId: string): NoteColor {
  return NOTE_COLORS.find(c => c.id === colorId) || NOTE_COLORS[0];
}

/**
 * Status colors
 */
export const STATUS_COLORS = {
  success: 'text-green-400 bg-green-500/20',
  warning: 'text-orange-400 bg-orange-500/20',
  error: 'text-red-400 bg-red-500/20',
  info: 'text-blue-400 bg-blue-500/20',
} as const;

export type Status = keyof typeof STATUS_COLORS;

export function getStatusColor(status: Status): string {
  return STATUS_COLORS[status] || STATUS_COLORS.info;
}

/**
 * Accent colors for UI elements
 */
export const ACCENT_COLORS = {
  blue: '#3b82f6',
  green: '#22c55e',
  red: '#ef4444',
  orange: '#f97316',
  purple: '#a855f7',
  pink: '#ec4899',
  yellow: '#eab308',
  cyan: '#06b6d4',
} as const;

export type AccentColor = keyof typeof ACCENT_COLORS;

/**
 * Dark theme opacity scale
 */
export const OPACITY = {
  5: 'rgba(255, 255, 255, 0.05)',
  10: 'rgba(255, 255, 255, 0.1)',
  20: 'rgba(255, 255, 255, 0.2)',
  30: 'rgba(255, 255, 255, 0.3)',
  50: 'rgba(255, 255, 255, 0.5)',
  70: 'rgba(255, 255, 255, 0.7)',
} as const;

/**
 * Generate color classes for a category
 */
export function getCategoryColor(category: string): { bg: string; text: string } {
  const colors: Record<string, { bg: string; text: string }> = {
    productivity: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
    development: { bg: 'bg-purple-500/20', text: 'text-purple-400' },
    utilities: { bg: 'bg-gray-500/20', text: 'text-gray-400' },
    entertainment: { bg: 'bg-pink-500/20', text: 'text-pink-400' },
    communication: { bg: 'bg-green-500/20', text: 'text-green-400' },
    finance: { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
    system: { bg: 'bg-gray-500/20', text: 'text-gray-400' },
    games: { bg: 'bg-red-500/20', text: 'text-red-400' },
    audio: { bg: 'bg-orange-500/20', text: 'text-orange-400' },
    social: { bg: 'bg-cyan-500/20', text: 'text-cyan-400' },
  };

  return colors[category] || { bg: 'bg-white/10', text: 'text-white/70' };
}
