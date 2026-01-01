/**
 * StatusBar Component
 *
 * Bottom status bar with left, center, and right sections.
 *
 * @example
 * ```tsx
 * <StatusBar
 *   items={[
 *     { id: 'mode', content: 'Insert', align: 'left' },
 *     { id: 'file', content: 'main.ts', align: 'center' },
 *     { id: 'line', content: 'Ln 42', align: 'right' },
 *   ]}
 * />
 *
 * // Or with explicit sections:
 * <StatusBar
 *   leftContent={<span>Ready</span>}
 *   centerContent={<span>file.txt</span>}
 *   rightContent={<span>UTF-8</span>}
 * />
 * ```
 */

import React, { useMemo } from 'react';
import { cn } from '../lib/utils';
import type { StatusBarProps, StatusBarItem as StatusBarItemType } from './types';
import { STATUS_BAR_GLASS_STYLES } from './types';
import { StatusBarItem } from './StatusBarItem';

export const StatusBar = React.forwardRef<HTMLDivElement, StatusBarProps>(
  (
    { items = [], leftContent, centerContent, rightContent, className },
    ref
  ) => {
    // Group items by alignment
    const { leftItems, centerItems, rightItems } = useMemo(() => {
      const left: StatusBarItemType[] = [];
      const center: StatusBarItemType[] = [];
      const right: StatusBarItemType[] = [];

      items.forEach((item) => {
        switch (item.align) {
          case 'center':
            center.push(item);
            break;
          case 'right':
            right.push(item);
            break;
          case 'left':
          default:
            left.push(item);
            break;
        }
      });

      return { leftItems: left, centerItems: center, rightItems: right };
    }, [items]);

    return (
      <div
        ref={ref}
        role="status"
        aria-label="Status bar"
        className={cn(
          'flex items-center justify-between h-6',
          'px-2',
          STATUS_BAR_GLASS_STYLES.base,
          className
        )}
      >
        {/* Left section */}
        <div className="flex items-center gap-1 flex-1 justify-start min-w-0">
          {leftContent}
          {leftItems.map((item) => (
            <StatusBarItem key={item.id} item={item} />
          ))}
        </div>

        {/* Center section */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {centerContent}
          {centerItems.map((item) => (
            <StatusBarItem key={item.id} item={item} />
          ))}
        </div>

        {/* Right section */}
        <div className="flex items-center gap-1 flex-1 justify-end min-w-0">
          {rightItems.map((item) => (
            <StatusBarItem key={item.id} item={item} />
          ))}
          {rightContent}
        </div>
      </div>
    );
  }
);

StatusBar.displayName = 'StatusBar';

export default StatusBar;
