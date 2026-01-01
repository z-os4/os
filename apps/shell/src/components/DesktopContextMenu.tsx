import React from 'react';
import * as ContextMenu from '@radix-ui/react-context-menu';

interface DesktopContextMenuProps {
  children: React.ReactNode;
  onNewFolder?: () => void;
  onChangeWallpaper?: () => void;
  onShowDesktopItems?: () => void;
  onSortBy?: (sort: string) => void;
  onCleanUp?: () => void;
}

export const DesktopContextMenu: React.FC<DesktopContextMenuProps> = ({
  children,
  onNewFolder,
  onChangeWallpaper,
  onShowDesktopItems,
  onSortBy,
  onCleanUp,
}) => {
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild>
        {children}
      </ContextMenu.Trigger>

      <ContextMenu.Portal>
        <ContextMenu.Content
          className="min-w-[220px] glass-menu rounded-lg p-1 shadow-xl z-[9999]"
        >
          <ContextMenu.Item
            onClick={onNewFolder}
            className="flex items-center px-3 py-1.5 text-sm zos-text-primary rounded hover:bg-[var(--zos-surface-glass-hover)] outline-none cursor-default"
          >
            New Folder
          </ContextMenu.Item>

          <ContextMenu.Separator className="h-px my-1 bg-[var(--zos-border-primary)]" />

          <ContextMenu.Item
            className="flex items-center px-3 py-1.5 text-sm zos-text-primary rounded hover:bg-[var(--zos-surface-glass-hover)] outline-none cursor-default"
          >
            Get Info
          </ContextMenu.Item>

          <ContextMenu.Separator className="h-px my-1 bg-[var(--zos-border-primary)]" />

          <ContextMenu.Item
            onClick={onChangeWallpaper}
            className="flex items-center px-3 py-1.5 text-sm zos-text-primary rounded hover:bg-[var(--zos-surface-glass-hover)] outline-none cursor-default"
          >
            Change Wallpaper...
          </ContextMenu.Item>

          <ContextMenu.Item
            className="flex items-center px-3 py-1.5 text-sm zos-text-primary rounded hover:bg-[var(--zos-surface-glass-hover)] outline-none cursor-default"
          >
            Edit Widgets...
          </ContextMenu.Item>

          <ContextMenu.Separator className="h-px my-1 bg-[var(--zos-border-primary)]" />

          <ContextMenu.Sub>
            <ContextMenu.SubTrigger className="flex items-center justify-between px-3 py-1.5 text-sm zos-text-primary rounded hover:bg-[var(--zos-surface-glass-hover)] outline-none cursor-default">
              Sort By
              <svg className="w-3 h-3 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </ContextMenu.SubTrigger>
            <ContextMenu.Portal>
              <ContextMenu.SubContent
                className="min-w-[160px] glass-menu rounded-lg p-1 shadow-xl"
                sideOffset={8}
              >
                <ContextMenu.Item
                  onClick={() => onSortBy?.('name')}
                  className="flex items-center px-3 py-1.5 text-sm zos-text-primary rounded hover:bg-[var(--zos-surface-glass-hover)] outline-none cursor-default"
                >
                  Name
                </ContextMenu.Item>
                <ContextMenu.Item
                  onClick={() => onSortBy?.('kind')}
                  className="flex items-center px-3 py-1.5 text-sm zos-text-primary rounded hover:bg-[var(--zos-surface-glass-hover)] outline-none cursor-default"
                >
                  Kind
                </ContextMenu.Item>
                <ContextMenu.Item
                  onClick={() => onSortBy?.('date-modified')}
                  className="flex items-center px-3 py-1.5 text-sm zos-text-primary rounded hover:bg-[var(--zos-surface-glass-hover)] outline-none cursor-default"
                >
                  Date Modified
                </ContextMenu.Item>
                <ContextMenu.Item
                  onClick={() => onSortBy?.('date-created')}
                  className="flex items-center px-3 py-1.5 text-sm zos-text-primary rounded hover:bg-[var(--zos-surface-glass-hover)] outline-none cursor-default"
                >
                  Date Created
                </ContextMenu.Item>
                <ContextMenu.Item
                  onClick={() => onSortBy?.('size')}
                  className="flex items-center px-3 py-1.5 text-sm zos-text-primary rounded hover:bg-[var(--zos-surface-glass-hover)] outline-none cursor-default"
                >
                  Size
                </ContextMenu.Item>
                <ContextMenu.Item
                  onClick={() => onSortBy?.('tags')}
                  className="flex items-center px-3 py-1.5 text-sm zos-text-primary rounded hover:bg-[var(--zos-surface-glass-hover)] outline-none cursor-default"
                >
                  Tags
                </ContextMenu.Item>
              </ContextMenu.SubContent>
            </ContextMenu.Portal>
          </ContextMenu.Sub>

          <ContextMenu.Item
            onClick={onCleanUp}
            className="flex items-center px-3 py-1.5 text-sm zos-text-primary rounded hover:bg-[var(--zos-surface-glass-hover)] outline-none cursor-default"
          >
            Clean Up
          </ContextMenu.Item>

          <ContextMenu.Item
            className="flex items-center px-3 py-1.5 text-sm zos-text-primary rounded hover:bg-[var(--zos-surface-glass-hover)] outline-none cursor-default"
          >
            Clean Up By
          </ContextMenu.Item>

          <ContextMenu.Separator className="h-px my-1 bg-[var(--zos-border-primary)]" />

          <ContextMenu.CheckboxItem
            checked={true}
            className="flex items-center px-3 py-1.5 text-sm zos-text-primary rounded hover:bg-[var(--zos-surface-glass-hover)] outline-none cursor-default"
          >
            <ContextMenu.ItemIndicator className="mr-2">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
              </svg>
            </ContextMenu.ItemIndicator>
            Show View Options
          </ContextMenu.CheckboxItem>

          <ContextMenu.Separator className="h-px my-1 bg-[var(--zos-border-primary)]" />

          <ContextMenu.Item
            className="flex items-center px-3 py-1.5 text-sm zos-text-primary rounded hover:bg-[var(--zos-surface-glass-hover)] outline-none cursor-default"
          >
            Use Stacks
          </ContextMenu.Item>

          <ContextMenu.Sub>
            <ContextMenu.SubTrigger className="flex items-center justify-between px-3 py-1.5 text-sm zos-text-primary rounded hover:bg-[var(--zos-surface-glass-hover)] outline-none cursor-default">
              Group Stacks By
              <svg className="w-3 h-3 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </ContextMenu.SubTrigger>
            <ContextMenu.Portal>
              <ContextMenu.SubContent
                className="min-w-[140px] glass-menu rounded-lg p-1 shadow-xl"
                sideOffset={8}
              >
                <ContextMenu.Item className="flex items-center px-3 py-1.5 text-sm zos-text-primary rounded hover:bg-[var(--zos-surface-glass-hover)] outline-none cursor-default">
                  Kind
                </ContextMenu.Item>
                <ContextMenu.Item className="flex items-center px-3 py-1.5 text-sm zos-text-primary rounded hover:bg-[var(--zos-surface-glass-hover)] outline-none cursor-default">
                  Date Last Opened
                </ContextMenu.Item>
                <ContextMenu.Item className="flex items-center px-3 py-1.5 text-sm zos-text-primary rounded hover:bg-[var(--zos-surface-glass-hover)] outline-none cursor-default">
                  Date Added
                </ContextMenu.Item>
                <ContextMenu.Item className="flex items-center px-3 py-1.5 text-sm zos-text-primary rounded hover:bg-[var(--zos-surface-glass-hover)] outline-none cursor-default">
                  Date Modified
                </ContextMenu.Item>
                <ContextMenu.Item className="flex items-center px-3 py-1.5 text-sm zos-text-primary rounded hover:bg-[var(--zos-surface-glass-hover)] outline-none cursor-default">
                  Date Created
                </ContextMenu.Item>
              </ContextMenu.SubContent>
            </ContextMenu.Portal>
          </ContextMenu.Sub>
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
};

export default DesktopContextMenu;
