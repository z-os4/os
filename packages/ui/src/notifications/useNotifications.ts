/**
 * useNotifications Hook
 *
 * Public API for the notification system.
 * Provides methods to show, dismiss, and manage notifications.
 *
 * @example
 * ```tsx
 * const { notify, toast, dismiss, dismissAll, notifications } = useNotifications();
 *
 * // Quick toast
 * toast('File saved successfully', 'success');
 *
 * // Full notification
 * const id = notify({
 *   title: 'Download Complete',
 *   message: 'photo.jpg has been downloaded',
 *   icon: <Download />,
 *   duration: 5000,
 *   actions: [
 *     { label: 'Open', onClick: () => openFile('photo.jpg') },
 *     { label: 'Show in Finder', onClick: () => showInFinder('photo.jpg') },
 *   ],
 * });
 *
 * // Dismiss specific notification
 * dismiss(id);
 *
 * // Clear all notifications
 * dismissAll();
 * ```
 */

import { useNotificationContext } from './NotificationContext';
import type { NotificationContextValue } from './types';

export function useNotifications(): NotificationContextValue {
  return useNotificationContext();
}

export default useNotifications;
