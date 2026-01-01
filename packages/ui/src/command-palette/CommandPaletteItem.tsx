/**
 * Command Palette Item Component
 *
 * Individual command item with icon, title, subtitle, and keyboard hint.
 */

import React, { forwardRef, memo } from 'react';
import { cn } from '../lib/utils';
import type { PaletteCommand as Command } from './types';

export interface CommandPaletteItemProps {
  /** The command to display */
  command: Command;
  /** Whether this item is selected */
  isSelected: boolean;
  /** Click handler */
  onClick: () => void;
  /** Mouse enter handler for selection */
  onMouseEnter: () => void;
  /** Matched character indices for highlighting */
  matches?: number[];
  /** Custom class name */
  className?: string;
}

/**
 * Render title with highlighted match characters
 */
function HighlightedText({
  text,
  matches,
}: {
  text: string;
  matches?: number[];
}) {
  if (!matches || matches.length === 0) {
    return <span>{text}</span>;
  }

  const matchSet = new Set(matches);
  const parts: React.ReactNode[] = [];
  let currentPart = '';
  let isMatch = false;

  for (let i = 0; i < text.length; i++) {
    const charIsMatch = matchSet.has(i);

    if (charIsMatch !== isMatch) {
      if (currentPart) {
        parts.push(
          isMatch ? (
            <span key={i} className="text-blue-400 font-medium">
              {currentPart}
            </span>
          ) : (
            <span key={i}>{currentPart}</span>
          )
        );
      }
      currentPart = text[i];
      isMatch = charIsMatch;
    } else {
      currentPart += text[i];
    }
  }

  if (currentPart) {
    parts.push(
      isMatch ? (
        <span key="last" className="text-blue-400 font-medium">
          {currentPart}
        </span>
      ) : (
        <span key="last">{currentPart}</span>
      )
    );
  }

  return <>{parts}</>;
}

/**
 * Format keyboard shortcut for display
 */
function KeyboardShortcut({ shortcut }: { shortcut: string }) {
  const parts = shortcut.split('+').map((part) => {
    const normalized = part.trim().toLowerCase();
    switch (normalized) {
      case 'cmd':
      case 'meta':
        return '\u2318';
      case 'ctrl':
      case 'control':
        return '\u2303';
      case 'alt':
      case 'option':
        return '\u2325';
      case 'shift':
        return '\u21E7';
      case 'enter':
      case 'return':
        return '\u21B5';
      case 'esc':
      case 'escape':
        return 'esc';
      case 'tab':
        return '\u21E5';
      case 'space':
        return '\u2423';
      case 'backspace':
      case 'delete':
        return '\u232B';
      case 'up':
        return '\u2191';
      case 'down':
        return '\u2193';
      case 'left':
        return '\u2190';
      case 'right':
        return '\u2192';
      default:
        return part.trim().toUpperCase();
    }
  });

  return (
    <div className="flex items-center gap-0.5">
      {parts.map((part, i) => (
        <kbd
          key={i}
          className={cn(
            'inline-flex items-center justify-center',
            'min-w-[20px] h-5 px-1',
            'text-[10px] font-medium',
            'bg-white/5 rounded border border-white/10',
            'text-white/40'
          )}
        >
          {part}
        </kbd>
      ))}
    </div>
  );
}

/**
 * Command Palette Item
 */
export const CommandPaletteItem = memo(
  forwardRef<HTMLDivElement, CommandPaletteItemProps>(function CommandPaletteItem(
    { command, isSelected, onClick, onMouseEnter, matches, className },
    ref
  ) {
    return (
      <div
        ref={ref}
        role="option"
        aria-selected={isSelected}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 mx-2 rounded-lg cursor-pointer',
          'transition-colors duration-75',
          isSelected
            ? 'bg-blue-500/20 text-white'
            : 'text-white/80 hover:bg-white/5',
          command.disabled && 'opacity-40 cursor-not-allowed',
          className
        )}
      >
        {/* Icon */}
        {command.icon && (
          <div
            className={cn(
              'flex items-center justify-center w-8 h-8 rounded-lg shrink-0',
              'bg-white/10',
              isSelected && 'bg-blue-500/30'
            )}
          >
            <div className="w-4 h-4 text-white/70">{command.icon}</div>
          </div>
        )}

        {/* Title and subtitle */}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">
            <HighlightedText text={command.title} matches={matches} />
          </div>
          {command.subtitle && (
            <div className="text-xs text-white/40 truncate mt-0.5">
              {command.subtitle}
            </div>
          )}
        </div>

        {/* Keyboard shortcut */}
        {command.shortcut && <KeyboardShortcut shortcut={command.shortcut} />}

        {/* Type indicator */}
        {!command.shortcut && (
          <div className="text-[10px] text-white/30 uppercase tracking-wide shrink-0">
            {command.type}
          </div>
        )}
      </div>
    );
  })
);

CommandPaletteItem.displayName = 'CommandPaletteItem';

export default CommandPaletteItem;
