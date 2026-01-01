/**
 * Dialog System
 *
 * Complete modal/dialog system for zOS with glass morphism styling.
 *
 * @example
 * ```tsx
 * // Wrap your app with the provider
 * <DialogProvider>
 *   <App />
 * </DialogProvider>
 *
 * // Use the hook in components
 * function MyComponent() {
 *   const { alert, confirm, prompt, open, close } = useDialogs();
 *
 *   const handleAction = async () => {
 *     const confirmed = await confirm({
 *       title: 'Confirm Action',
 *       message: 'Are you sure?',
 *     });
 *     if (confirmed) {
 *       await alert({ message: 'Action completed!', icon: 'success' });
 *     }
 *   };
 *
 *   return <button onClick={handleAction}>Do Action</button>;
 * }
 * ```
 */

// Types
export type {
  DialogSize,
  DialogState,
  DialogProps,
  AlertOptions,
  ConfirmOptions,
  PromptOptions,
  DialogContextValue,
} from './types';
export { DIALOG_SIZE_CLASSES } from './types';

// Context and Provider
export { DialogContext, DialogProvider } from './DialogContext';
export type { DialogProviderProps } from './DialogContext';

// Hook
export { useDialogs } from './useDialogs';

// Components
export { Dialog } from './Dialog';
export { AlertDialog } from './AlertDialog';
export type { AlertDialogProps } from './AlertDialog';
export { ConfirmDialog } from './ConfirmDialog';
export type { ConfirmDialogProps } from './ConfirmDialog';
export { PromptDialog } from './PromptDialog';
export type { PromptDialogProps } from './PromptDialog';
