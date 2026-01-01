/**
 * Empty Component
 *
 * Empty state placeholder with icon, message, and optional action.
 *
 * @example
 * ```tsx
 * <Empty
 *   icon={<Inbox />}
 *   title="No messages"
 *   description="You haven't received any messages yet."
 *   action={<Button>Compose</Button>}
 * />
 * ```
 */

import React from 'react';
import { cn } from '../lib/utils';
import type { Size } from './types';

export interface EmptyProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Icon to display */
  icon?: React.ReactNode;
  /** Title text */
  title?: React.ReactNode;
  /** Description text */
  description?: React.ReactNode;
  /** Action button or element */
  action?: React.ReactNode;
  /** Size variant */
  size?: Size;
}

const sizeStyles = {
  sm: {
    icon: 'w-8 h-8',
    title: 'text-sm',
    description: 'text-xs',
    gap: 'gap-2',
    padding: 'py-6',
  },
  md: {
    icon: 'w-12 h-12',
    title: 'text-base',
    description: 'text-sm',
    gap: 'gap-3',
    padding: 'py-8',
  },
  lg: {
    icon: 'w-16 h-16',
    title: 'text-lg',
    description: 'text-base',
    gap: 'gap-4',
    padding: 'py-12',
  },
};

function DefaultIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
      />
    </svg>
  );
}

export const Empty = React.forwardRef<HTMLDivElement, EmptyProps>(
  (
    {
      className,
      icon,
      title,
      description,
      action,
      size = 'md',
      ...props
    },
    ref
  ) => {
    const styles = sizeStyles[size];

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center text-center',
          styles.gap,
          styles.padding,
          className
        )}
        {...props}
      >
        <div className={cn('text-white/30', styles.icon)}>
          {icon || <DefaultIcon className="w-full h-full" />}
        </div>

        {title && (
          <h3 className={cn('font-medium text-white/90', styles.title)}>
            {title}
          </h3>
        )}

        {description && (
          <p className={cn('text-white/50 max-w-sm', styles.description)}>
            {description}
          </p>
        )}

        {action && <div className="mt-2">{action}</div>}
      </div>
    );
  }
);

Empty.displayName = 'Empty';

/**
 * Preset empty states for common scenarios
 */

export interface EmptyPresetProps extends Omit<EmptyProps, 'icon' | 'title' | 'description'> {
  /** Override default title */
  title?: React.ReactNode;
  /** Override default description */
  description?: React.ReactNode;
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );
}

function ErrorIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
  );
}

function FileIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );
}

function ImageIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );
}

export const EmptySearch = React.forwardRef<HTMLDivElement, EmptyPresetProps>(
  (
    {
      title = 'No results found',
      description = 'Try adjusting your search or filter to find what you are looking for.',
      ...props
    },
    ref
  ) => (
    <Empty
      ref={ref}
      icon={<SearchIcon className="w-full h-full" />}
      title={title}
      description={description}
      {...props}
    />
  )
);

EmptySearch.displayName = 'EmptySearch';

export const EmptyError = React.forwardRef<HTMLDivElement, EmptyPresetProps>(
  (
    {
      title = 'Something went wrong',
      description = 'An error occurred while loading the data. Please try again.',
      ...props
    },
    ref
  ) => (
    <Empty
      ref={ref}
      icon={<ErrorIcon className="w-full h-full text-red-400/50" />}
      title={title}
      description={description}
      {...props}
    />
  )
);

EmptyError.displayName = 'EmptyError';

export const EmptyFiles = React.forwardRef<HTMLDivElement, EmptyPresetProps>(
  (
    {
      title = 'No files',
      description = 'Upload or create a file to get started.',
      ...props
    },
    ref
  ) => (
    <Empty
      ref={ref}
      icon={<FileIcon className="w-full h-full" />}
      title={title}
      description={description}
      {...props}
    />
  )
);

EmptyFiles.displayName = 'EmptyFiles';

export const EmptyImages = React.forwardRef<HTMLDivElement, EmptyPresetProps>(
  (
    {
      title = 'No images',
      description = 'Upload an image to get started.',
      ...props
    },
    ref
  ) => (
    <Empty
      ref={ref}
      icon={<ImageIcon className="w-full h-full" />}
      title={title}
      description={description}
      {...props}
    />
  )
);

EmptyImages.displayName = 'EmptyImages';
