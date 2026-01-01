/**
 * WindowChrome Component
 *
 * Complete window frame with toolbar, content area, and status bar.
 *
 * @example
 * ```tsx
 * <WindowChrome
 *   title="Document.txt"
 *   toolbar={[
 *     { id: 'save', icon: <SaveIcon />, tooltip: 'Save' },
 *     { id: 'sep', type: 'separator' },
 *     { id: 'undo', icon: <UndoIcon />, tooltip: 'Undo' },
 *   ]}
 *   statusBar={[
 *     { id: 'line', content: 'Ln 42', align: 'right' },
 *   ]}
 *   showToolbar={true}
 *   showStatusBar={true}
 * >
 *   <div>Window content here</div>
 * </WindowChrome>
 * ```
 */

import React from 'react';
import { cn } from '../lib/utils';
import type { WindowChromeProps } from './types';
import { Toolbar } from './Toolbar';
import { StatusBar } from './StatusBar';

export const WindowChrome = React.forwardRef<HTMLDivElement, WindowChromeProps>(
  (
    {
      title,
      toolbar = [],
      statusBar = [],
      showToolbar = true,
      showStatusBar = true,
      children,
      className,
    },
    ref
  ) => {
    const hasToolbar = showToolbar && toolbar.length > 0;
    const hasStatusBar = showStatusBar && statusBar.length > 0;

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col h-full',
          'bg-zinc-900/80 backdrop-blur-xl',
          'rounded-lg overflow-hidden',
          'border border-white/10',
          'shadow-2xl',
          className
        )}
      >
        {/* Title bar (optional, if title provided) */}
        {title && (
          <div
            className={cn(
              'flex items-center justify-center h-8 px-3',
              'bg-black/20 border-b border-white/5',
              'cursor-move select-none'
            )}
          >
            <span className="text-xs font-medium text-white/60 truncate">
              {title}
            </span>
          </div>
        )}

        {/* Toolbar */}
        {hasToolbar && <Toolbar items={toolbar} size="md" variant="default" />}

        {/* Content area */}
        <div className="flex-1 min-h-0 overflow-auto">{children}</div>

        {/* Status bar */}
        {hasStatusBar && <StatusBar items={statusBar} />}
      </div>
    );
  }
);

WindowChrome.displayName = 'WindowChrome';

export default WindowChrome;
