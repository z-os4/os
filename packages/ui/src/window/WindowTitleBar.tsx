import React from 'react';
import { cn } from '../lib/utils';
import { useIsMobile } from '@z-os/core';
import WindowControls from './WindowControls';

interface WindowTitleBarProps {
  title: string;
  titleId?: string;
  windowType: 'default' | 'terminal' | 'safari' | 'itunes' | 'textpad' | 'system' | 'about';
  onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize?: () => void;
  isMaximized?: boolean;
  customControls?: React.ReactNode;
}

const WindowTitleBar: React.FC<WindowTitleBarProps> = ({
  title,
  titleId,
  windowType,
  onMouseDown,
  onClose,
  onMinimize,
  onMaximize,
  isMaximized,
  customControls
}) => {
  const isMobile = useIsMobile();
  
  const getTitleBarStyle = () => {
    // Modern macOS - seamless transparent title bar that blends with window content
    switch (windowType) {
      case 'terminal':
        return 'bg-transparent text-gray-500'; // Seamless with terminal content
      default:
        return 'bg-transparent text-white/60';
    }
  };

  // Modern macOS - no visible border between title bar and content
  const getBorderStyle = () => {
    // No border for seamless unified look
    return '';
  };

  // For terminal, hide the title text
  const showTitle = windowType !== 'terminal';

  return (
    <div
      className={cn(
        'h-8 flex items-center px-3',
        getBorderStyle(),
        getTitleBarStyle(),
        isMobile ? 'cursor-default' : 'cursor-move'
      )}
      onMouseDown={onMouseDown}
    >
      <WindowControls onClose={onClose} onMinimize={onMinimize} onMaximize={onMaximize} isMaximized={isMaximized} />
      {showTitle && (
        <div id={titleId} className="text-center flex-1 text-xs font-medium select-none">
          {title}
        </div>
      )}
      {!showTitle && <div className="flex-1" />}
      {customControls}
    </div>
  );
};

export default WindowTitleBar;
