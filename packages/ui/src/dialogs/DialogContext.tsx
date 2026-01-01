/**
 * DialogContext
 *
 * Provides dialog state management and imperative API for alerts, confirms, and prompts.
 */

import React, { createContext, useCallback, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import type {
  DialogContextValue,
  DialogState,
  DialogProps,
  AlertOptions,
  ConfirmOptions,
  PromptOptions,
} from './types';
import { Dialog } from './Dialog';
import { AlertDialog } from './AlertDialog';
import { ConfirmDialog } from './ConfirmDialog';
import { PromptDialog } from './PromptDialog';

/** Default context value (throws if used outside provider) */
const defaultContext: DialogContextValue = {
  dialogs: new Map(),
  open: () => {
    throw new Error('DialogContext: open called outside provider');
  },
  close: () => {
    throw new Error('DialogContext: close called outside provider');
  },
  closeAll: () => {
    throw new Error('DialogContext: closeAll called outside provider');
  },
  alert: () => {
    throw new Error('DialogContext: alert called outside provider');
  },
  confirm: () => {
    throw new Error('DialogContext: confirm called outside provider');
  },
  prompt: () => {
    throw new Error('DialogContext: prompt called outside provider');
  },
};

export const DialogContext = createContext<DialogContextValue>(defaultContext);

export interface DialogProviderProps {
  children: React.ReactNode;
}

/** Unique ID counter for programmatic dialogs */
let dialogIdCounter = 0;
const generateId = (prefix: string): string => `${prefix}-${++dialogIdCounter}`;

export function DialogProvider({ children }: DialogProviderProps) {
  const [dialogs, setDialogs] = useState<Map<string, DialogState>>(new Map());

  // Refs for promise resolution
  const alertResolvers = useRef<Map<string, () => void>>(new Map());
  const confirmResolvers = useRef<Map<string, (value: boolean) => void>>(new Map());
  const promptResolvers = useRef<Map<string, (value: string | null) => void>>(new Map());

  const open = useCallback(
    (id: string, content: React.ReactNode, options: Partial<DialogProps> = {}) => {
      setDialogs((prev) => {
        const next = new Map(prev);
        next.set(id, { id, content, options });
        return next;
      });
    },
    []
  );

  const close = useCallback((id: string) => {
    setDialogs((prev) => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const closeAll = useCallback(() => {
    setDialogs(new Map());
  }, []);

  const alert = useCallback(
    (options: AlertOptions): Promise<void> => {
      const id = generateId('alert');
      return new Promise((resolve) => {
        alertResolvers.current.set(id, resolve);

        const handleClose = () => {
          close(id);
          const resolver = alertResolvers.current.get(id);
          if (resolver) {
            resolver();
            alertResolvers.current.delete(id);
          }
        };

        const content = (
          <AlertDialog
            {...options}
            onClose={handleClose}
          />
        );

        open(id, content, {
          closable: true,
          closeOnBackdrop: true,
          closeOnEscape: true,
          size: 'sm',
        });
      });
    },
    [open, close]
  );

  const confirm = useCallback(
    (options: ConfirmOptions): Promise<boolean> => {
      const id = generateId('confirm');
      return new Promise((resolve) => {
        confirmResolvers.current.set(id, resolve);

        const handleConfirm = () => {
          close(id);
          const resolver = confirmResolvers.current.get(id);
          if (resolver) {
            resolver(true);
            confirmResolvers.current.delete(id);
          }
        };

        const handleCancel = () => {
          close(id);
          const resolver = confirmResolvers.current.get(id);
          if (resolver) {
            resolver(false);
            confirmResolvers.current.delete(id);
          }
        };

        const content = (
          <ConfirmDialog
            {...options}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
          />
        );

        open(id, content, {
          closable: false,
          closeOnBackdrop: false,
          closeOnEscape: true,
          size: 'sm',
        });
      });
    },
    [open, close]
  );

  const prompt = useCallback(
    (options: PromptOptions): Promise<string | null> => {
      const id = generateId('prompt');
      return new Promise((resolve) => {
        promptResolvers.current.set(id, resolve);

        const handleSubmit = (value: string) => {
          close(id);
          const resolver = promptResolvers.current.get(id);
          if (resolver) {
            resolver(value);
            promptResolvers.current.delete(id);
          }
        };

        const handleCancel = () => {
          close(id);
          const resolver = promptResolvers.current.get(id);
          if (resolver) {
            resolver(null);
            promptResolvers.current.delete(id);
          }
        };

        const content = (
          <PromptDialog
            {...options}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        );

        open(id, content, {
          closable: false,
          closeOnBackdrop: false,
          closeOnEscape: true,
          size: 'sm',
        });
      });
    },
    [open, close]
  );

  const contextValue: DialogContextValue = {
    dialogs,
    open,
    close,
    closeAll,
    alert,
    confirm,
    prompt,
  };

  // Render dialogs in portal
  const dialogElements = Array.from(dialogs.entries()).map(([id, state]) => (
    <Dialog
      key={id}
      id={id}
      open={true}
      onClose={() => close(id)}
      {...state.options}
    >
      {state.content}
    </Dialog>
  ));

  return (
    <DialogContext.Provider value={contextValue}>
      {children}
      {typeof document !== 'undefined' &&
        createPortal(
          <>{dialogElements}</>,
          document.body
        )}
    </DialogContext.Provider>
  );
}
