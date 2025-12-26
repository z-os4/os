
import React from 'react';
import { X, Minus, Maximize2, Minimize2 } from 'lucide-react';

interface WindowControlsProps {
  onClose: () => void;
  onMinimize: () => void;
  onMaximize?: () => void;
  isMaximized?: boolean;
}

const WindowControls: React.FC<WindowControlsProps> = ({
  onClose,
  onMinimize,
  onMaximize,
  isMaximized = false,
}) => {
  return (
    <div className="traffic-lights flex gap-1.5 items-center" role="group" aria-label="Window controls">
      <button
        onClick={onClose}
        className="traffic-light traffic-light-close"
        aria-label="Close window"
      >
        <svg viewBox="0 0 8 8" className="text-[#4d0000]">
          <path d="M1 1L7 7M7 1L1 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        </svg>
      </button>
      <button
        onClick={onMinimize}
        className="traffic-light traffic-light-minimize"
        aria-label="Minimize window"
      >
        <svg viewBox="0 0 8 8" className="text-[#995700]">
          <path d="M1 4h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        </svg>
      </button>
      <button
        onClick={onMaximize}
        className="traffic-light traffic-light-maximize"
        aria-label={isMaximized ? "Restore window" : "Maximize window"}
      >
        {isMaximized ? (
          <svg viewBox="0 0 8 8" className="text-[#006500]">
            <path d="M1.5 2.5h5v5h-5z M2.5 2.5v-1h5v5h-1" stroke="currentColor" strokeWidth="1" fill="none"/>
          </svg>
        ) : (
          <svg viewBox="0 0 8 8" className="text-[#006500]">
            <path d="M1 1h6v6H1z" stroke="currentColor" strokeWidth="1" fill="none"/>
          </svg>
        )}
      </button>
    </div>
  );
};

export default WindowControls;
