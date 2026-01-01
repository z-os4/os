/**
 * zOS Notification System
 *
 * Comprehensive toast and notification center for zOS.
 *
 * @example
 * ```tsx
 * import {
 *   NotificationProvider,
 *   NotificationCenter,
 *   ToastContainer,
 *   useNotifications,
 * } from '@z-os/ui/notifications';
 *
 * // Wrap your app with the provider
 * function App() {
 *   return (
 *     <NotificationProvider>
 *       <YourApp />
 *       <ToastContainer />
 *       <NotificationCenter />
 *     </NotificationProvider>
 *   );
 * }
 *
 * // Use in components
 * function MyComponent() {
 *   const { notify, toast } = useNotifications();
 *
 *   return (
 *     <button onClick={() => toast('Hello!', 'success')}>
 *       Show Toast
 *     </button>
 *   );
 * }
 * ```
 */

// Types
export type {
  Notification,
  NotificationType,
  NotificationPosition,
  NotificationAction,
  NotifyOptions,
  NotificationContextValue,
  NotificationProviderProps,
} from './types';

// Context and Provider
export { NotificationProvider, NotificationContext } from './NotificationContext';

// Hook
export { useNotifications } from './useNotifications';

// Components
export { Toast, toastVariants, iconVariants } from './Toast';
export type { ToastProps } from './Toast';

export { ToastContainer } from './ToastContainer';
export type { ToastContainerProps } from './ToastContainer';

export { NotificationCenter } from './NotificationCenter';
export type { NotificationCenterProps } from './NotificationCenter';
