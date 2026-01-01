/**
 * Context Menu Context
 *
 * React context for managing global context menu state.
 */

import { createContext, useContext } from 'react';
import type { ContextMenuContextValue, ContextMenuState } from './types';

/** Default context menu state */
export const defaultContextMenuState: ContextMenuState = {
  isOpen: false,
  position: { x: 0, y: 0 },
  items: [],
  activeSubmenuPath: [],
  focusedIndex: -1,
};

/** Context for the context menu system */
export const ContextMenuContext = createContext<ContextMenuContextValue | null>(null);

/** Hook to access context menu context (internal use) */
export function useContextMenuContext(): ContextMenuContextValue {
  const context = useContext(ContextMenuContext);
  if (!context) {
    throw new Error('useContextMenuContext must be used within a ContextMenuProvider');
  }
  return context;
}
