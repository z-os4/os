/**
 * Dialog System Types
 *
 * Type definitions for the zOS dialog/modal system.
 */

import type React from 'react';

/** Dialog size variants */
export type DialogSize = 'sm' | 'md' | 'lg' | 'xl' | 'fullscreen';

/** Internal dialog state */
export interface DialogState {
  id: string;
  content: React.ReactNode;
  options: Partial<DialogProps>;
}

/** Props for the base Dialog component */
export interface DialogProps {
  /** Unique identifier for the dialog */
  id: string;
  /** Whether the dialog is visible */
  open: boolean;
  /** Callback when dialog requests close */
  onClose: () => void;
  /** Dialog title displayed in header */
  title?: string;
  /** Size variant */
  size?: DialogSize;
  /** Whether to show the close button */
  closable?: boolean;
  /** Whether clicking backdrop closes the dialog */
  closeOnBackdrop?: boolean;
  /** Whether pressing Escape closes the dialog */
  closeOnEscape?: boolean;
  /** Dialog content */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/** Options for alert dialogs */
export interface AlertOptions {
  /** Alert title */
  title?: string;
  /** Alert message */
  message: string;
  /** Icon type to display */
  icon?: 'info' | 'warning' | 'error' | 'success';
  /** Custom button text (default: "OK") */
  buttonText?: string;
}

/** Options for confirm dialogs */
export interface ConfirmOptions {
  /** Confirm dialog title */
  title?: string;
  /** Confirm message */
  message: string;
  /** Confirm button text (default: "Confirm") */
  confirmText?: string;
  /** Cancel button text (default: "Cancel") */
  cancelText?: string;
  /** Whether this is a destructive action */
  danger?: boolean;
}

/** Options for prompt dialogs */
export interface PromptOptions {
  /** Prompt dialog title */
  title?: string;
  /** Prompt message/label */
  message?: string;
  /** Input placeholder */
  placeholder?: string;
  /** Default input value */
  defaultValue?: string;
  /** Confirm button text (default: "OK") */
  confirmText?: string;
  /** Cancel button text (default: "Cancel") */
  cancelText?: string;
}

/** Context value for dialog management */
export interface DialogContextValue {
  /** Map of active dialogs by ID */
  dialogs: Map<string, DialogState>;
  /** Open a dialog with custom content */
  open: (id: string, content: React.ReactNode, options?: Partial<DialogProps>) => void;
  /** Close a specific dialog by ID */
  close: (id: string) => void;
  /** Close all open dialogs */
  closeAll: () => void;
  /** Show an alert dialog and wait for dismissal */
  alert: (options: AlertOptions) => Promise<void>;
  /** Show a confirm dialog and wait for user choice */
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  /** Show a prompt dialog and wait for user input */
  prompt: (options: PromptOptions) => Promise<string | null>;
}

/** Size mappings for dialog widths */
export const DIALOG_SIZE_CLASSES: Record<DialogSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  fullscreen: 'w-screen h-screen max-w-none rounded-none',
};
