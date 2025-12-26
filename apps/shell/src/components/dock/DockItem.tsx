import React, { useState, useRef, useCallback, useEffect } from 'react';
import * as ContextMenu from '@radix-ui/react-context-menu';
import * as Tooltip from '@radix-ui/react-tooltip';

interface DockItemProps {
  id: string;
  label: string;
  icon: React.ReactNode;
  isActive?: boolean;
  isRunning?: boolean;
  isLaunching?: boolean;
  isPinned?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
  mouseX: number | null;
  index: number;
  magnificationEnabled?: boolean;
  baseSize?: number;
  maxScale?: number;
}

const ICON_SIZE = 48;
const MAGNIFICATION_RANGE = 100; // pixels - how far magnification effect reaches
const MAX_SCALE = 1.5; // 50% max increase

export const DockItem: React.FC<DockItemProps> = ({
  id,
  label,
  icon,
  isActive = false,
  isRunning = false,
  isLaunching = false,
  isPinned = true,
  onClick,
  onRemove,
  mouseX,
  index,
  magnificationEnabled = true,
  baseSize = ICON_SIZE,
  maxScale = MAX_SCALE,
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [isBouncing, setIsBouncing] = useState(false);
  const itemRef = useRef<HTMLButtonElement>(null);

  // Handle bounce animation when launching
  useEffect(() => {
    if (isLaunching && !isBouncing) {
      setIsBouncing(true);
      const timer = setTimeout(() => setIsBouncing(false), 800);
      return () => clearTimeout(timer);
    }
  }, [isLaunching, isBouncing]);

  // Calculate hover scale based on distance from mouse - macOS-style magnification
  const getScale = useCallback((): number => {
    if (!magnificationEnabled || mouseX === null || !itemRef.current) return 1;

    // Get dock container
    const dock = itemRef.current.closest('[data-dock]');
    if (!dock) return 1;

    const dockRect = dock.getBoundingClientRect();
    const itemRect = itemRef.current.getBoundingClientRect();
    const itemCenter = (itemRect.left + itemRect.width / 2) - dockRect.left;

    // Distance from mouse to item center
    const distance = Math.abs(mouseX - itemCenter);

    if (distance > MAGNIFICATION_RANGE) return 1;

    // Cosine-based scaling for smooth falloff - exactly like macOS
    const scaleFactor = Math.cos((distance / MAGNIFICATION_RANGE) * (Math.PI / 2));
    return 1 + (maxScale - 1) * scaleFactor;
  }, [mouseX, magnificationEnabled, maxScale]);

  // Calculate horizontal padding to push icons apart
  const getHorizontalPadding = useCallback((): number => {
    if (!magnificationEnabled) return 2;
    const scale = getScale();
    // Add padding equal to half the size increase on each side
    return 2 + ((scale - 1) * baseSize) / 2;
  }, [magnificationEnabled, getScale, baseSize]);

  // Calculate tooltip offset based on magnification
  const getTooltipOffset = useCallback((): number => {
    if (!magnificationEnabled) return 8;
    const scale = getScale();
    const extraHeight = (scale - 1) * baseSize;
    return 8 + extraHeight;
  }, [magnificationEnabled, getScale, baseSize]);

  const handleClick = useCallback(() => {
    if (onClick) {
      setIsBouncing(true);
      setTimeout(() => setIsBouncing(false), 800);
      onClick();
    }
  }, [onClick]);

  const scale = getScale();
  const horizontalPadding = getHorizontalPadding();
  const tooltipOffset = getTooltipOffset();

  const button = (
    <button
      ref={itemRef}
      onClick={handleClick}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      className={`
        group relative flex items-end justify-center rounded-xl
        outline-none ring-0 shadow-none
        ${isBouncing ? 'animate-dock-bounce' : ''}
      `}
      style={{
        paddingLeft: `${horizontalPadding}px`,
        paddingRight: `${horizontalPadding}px`,
        transition: 'padding 100ms ease-out',
      }}
      aria-label={`Open ${label}`}
    >
      <div
        className={`
          flex items-center justify-center rounded-xl overflow-hidden
          w-12 h-12
          transition-transform duration-100 ease-out origin-bottom
          ${isPressed ? 'scale-95' : ''}
        `}
        style={{
          transform: `scale(${scale})`,
        }}
      >
        <div className="w-full h-full flex items-center justify-center shadow-lg rounded-xl overflow-hidden">
          {icon}
        </div>
      </div>

      {/* Running indicator dot - macOS style */}
      <div className={`
        absolute -bottom-[6px] w-[5px] h-[5px] rounded-full bg-white/90
        transition-all duration-200
        ${(isRunning || isActive) ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}
      `} />
    </button>
  );

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild>
        <Tooltip.Provider delayDuration={500}>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              {button}
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content
                side="top"
                sideOffset={tooltipOffset}
                className="px-3 py-1.5 bg-black/90 backdrop-blur-xl text-white text-sm rounded-md border border-white/10 shadow-lg z-[10000]"
              >
                {label}
                <Tooltip.Arrow className="fill-black/90" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </Tooltip.Provider>
      </ContextMenu.Trigger>

      <ContextMenu.Portal>
        <ContextMenu.Content
          className="min-w-[180px] bg-black/90 backdrop-blur-xl rounded-lg border border-white/20 p-1 shadow-xl z-[10000]"
        >
          <ContextMenu.Item
            onClick={handleClick}
            className="flex items-center px-3 py-2 text-sm text-white rounded-md hover:bg-white/10 focus:bg-white/10 outline-none cursor-default"
          >
            Open {label}
          </ContextMenu.Item>

          <ContextMenu.Separator className="h-px my-1 bg-white/20" />

          <ContextMenu.Item
            className="flex items-center px-3 py-2 text-sm text-white rounded-md hover:bg-white/10 focus:bg-white/10 outline-none cursor-default"
          >
            {isPinned ? 'Unpin from Dock' : 'Keep in Dock'}
          </ContextMenu.Item>

          {!isPinned && onRemove && (
            <ContextMenu.Item
              onClick={onRemove}
              className="flex items-center px-3 py-2 text-sm text-red-400 rounded-md hover:bg-white/10 focus:bg-white/10 outline-none cursor-default"
            >
              Remove from Dock
            </ContextMenu.Item>
          )}

          <ContextMenu.Separator className="h-px my-1 bg-white/20" />

          <ContextMenu.Item
            className="flex items-center px-3 py-2 text-sm text-white/50 rounded-md cursor-default"
            disabled
          >
            Options
          </ContextMenu.Item>

          <ContextMenu.Item
            className="flex items-center px-3 py-2 text-sm text-white rounded-md hover:bg-white/10 focus:bg-white/10 outline-none cursor-default"
          >
            Show in Finder
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
};

export default DockItem;
