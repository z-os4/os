/**
 * useDialogs Hook
 *
 * Provides access to the dialog context for managing dialogs programmatically.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { alert, confirm, prompt, open, close } = useDialogs();
 *
 *   const handleDelete = async () => {
 *     const confirmed = await confirm({
 *       title: 'Delete Item',
 *       message: 'Are you sure you want to delete this item?',
 *       danger: true,
 *     });
 *     if (confirmed) {
 *       // Delete the item
 *     }
 *   };
 *
 *   return <button onClick={handleDelete}>Delete</button>;
 * }
 * ```
 */

import { useContext } from 'react';
import { DialogContext } from './DialogContext';
import type { DialogContextValue } from './types';

export function useDialogs(): DialogContextValue {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialogs must be used within a DialogProvider');
  }
  return context;
}
