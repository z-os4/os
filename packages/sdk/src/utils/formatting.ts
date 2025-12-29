/**
 * Formatting Utilities
 *
 * Common formatting functions for dates, numbers, and strings.
 */

/**
 * Format a date for display
 *
 * @example
 * ```tsx
 * formatDate(new Date()); // "Dec 28, 2024"
 * formatDate(new Date(), 'full'); // "Saturday, December 28, 2024"
 * formatDate(new Date(), 'time'); // "2:30 PM"
 * ```
 */
export function formatDate(
  date: Date | string | number,
  format: 'short' | 'medium' | 'long' | 'full' | 'time' | 'relative' = 'medium'
): string {
  const d = date instanceof Date ? date : new Date(date);

  if (isNaN(d.getTime())) {
    return 'Invalid date';
  }

  switch (format) {
    case 'short':
      return d.toLocaleDateString('en-US', {
        month: 'numeric',
        day: 'numeric',
      });

    case 'medium':
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

    case 'long':
      return d.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });

    case 'full':
      return d.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });

    case 'time':
      return d.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      });

    case 'relative':
      return formatRelativeTime(d);

    default:
      return d.toLocaleDateString();
  }
}

/**
 * Format relative time (e.g., "2 hours ago", "in 3 days")
 */
export function formatRelativeTime(date: Date | string | number): string {
  const d = date instanceof Date ? date : new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  const isFuture = diffMs < 0;
  const abs = Math.abs;

  if (abs(diffSecs) < 60) {
    return 'just now';
  }

  if (abs(diffMins) < 60) {
    const m = abs(diffMins);
    return isFuture ? `in ${m} minute${m > 1 ? 's' : ''}` : `${m} minute${m > 1 ? 's' : ''} ago`;
  }

  if (abs(diffHours) < 24) {
    const h = abs(diffHours);
    return isFuture ? `in ${h} hour${h > 1 ? 's' : ''}` : `${h} hour${h > 1 ? 's' : ''} ago`;
  }

  if (abs(diffDays) < 7) {
    const days = abs(diffDays);
    return isFuture ? `in ${days} day${days > 1 ? 's' : ''}` : `${days} day${days > 1 ? 's' : ''} ago`;
  }

  return formatDate(d, 'medium');
}

/**
 * Format file size
 *
 * @example
 * ```tsx
 * formatFileSize(1024); // "1 KB"
 * formatFileSize(1536000); // "1.5 MB"
 * ```
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const size = bytes / Math.pow(k, i);

  return `${size.toFixed(i > 0 ? 1 : 0)} ${units[i]}`;
}

/**
 * Format number with commas
 *
 * @example
 * ```tsx
 * formatNumber(1234567); // "1,234,567"
 * ```
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('en-US');
}

/**
 * Format duration in seconds to human readable
 *
 * @example
 * ```tsx
 * formatDuration(125); // "2:05"
 * formatDuration(3665); // "1:01:05"
 * ```
 */
export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * Truncate string with ellipsis
 *
 * @example
 * ```tsx
 * truncate("Hello World", 8); // "Hello..."
 * ```
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

/**
 * Capitalize first letter
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Convert kebab-case to Title Case
 */
export function titleCase(str: string): string {
  return str
    .split('-')
    .map(capitalize)
    .join(' ');
}
