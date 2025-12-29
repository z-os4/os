import React, { useEffect, useRef } from 'react';
import { File, Image, Music, Video, FileText, Archive, Code } from 'lucide-react';

interface StackItem {
  id: string;
  name: string;
  type: 'file' | 'image' | 'music' | 'video' | 'document' | 'archive' | 'code';
  date?: string;
}

interface DockStackProps {
  isOpen: boolean;
  onClose: () => void;
  items?: StackItem[];
  position: { x: number; y: number };
  title: string;
  onItemClick?: (item: StackItem) => void;
}

const getIcon = (type: StackItem['type']) => {
  switch (type) {
    case 'image': return <Image className="w-8 h-8 text-pink-400" />;
    case 'music': return <Music className="w-8 h-8 text-red-400" />;
    case 'video': return <Video className="w-8 h-8 text-purple-400" />;
    case 'document': return <FileText className="w-8 h-8 text-blue-400" />;
    case 'archive': return <Archive className="w-8 h-8 text-yellow-400" />;
    case 'code': return <Code className="w-8 h-8 text-green-400" />;
    default: return <File className="w-8 h-8 text-gray-400" />;
  }
};

// Sample downloads for demo
const SAMPLE_DOWNLOADS: StackItem[] = [
  { id: '1', name: 'project-v2.zip', type: 'archive', date: 'Today' },
  { id: '2', name: 'screenshot.png', type: 'image', date: 'Today' },
  { id: '3', name: 'meeting-notes.pdf', type: 'document', date: 'Yesterday' },
  { id: '4', name: 'playlist.mp3', type: 'music', date: 'Yesterday' },
  { id: '5', name: 'demo-video.mp4', type: 'video', date: 'Dec 25' },
  { id: '6', name: 'app-bundle.dmg', type: 'archive', date: 'Dec 24' },
  { id: '7', name: 'source-code.tsx', type: 'code', date: 'Dec 23' },
  { id: '8', name: 'wallpaper.jpg', type: 'image', date: 'Dec 22' },
];

export const DockStack: React.FC<DockStackProps> = ({
  isOpen,
  onClose,
  items = SAMPLE_DOWNLOADS,
  position,
  title,
  onItemClick,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Calculate bottom position based on viewport height and icon position
  const bottomOffset = window.innerHeight - position.y + 16;

  return (
    <div
      ref={ref}
      className="fixed z-[10000] animate-in fade-in zoom-in-95 duration-150"
      style={{
        left: position.x,
        bottom: bottomOffset,
        transform: 'translateX(-50%)',
      }}
    >
      {/* Fan/Grid Container */}
      <div className="bg-black/80 backdrop-blur-2xl rounded-2xl border border-white/20 shadow-2xl overflow-hidden min-w-[280px] max-w-[400px]">
        {/* Header */}
        <div className="px-4 py-3 border-b border-white/10">
          <h3 className="text-white/90 font-medium text-sm">{title}</h3>
          <p className="text-white/40 text-xs mt-0.5">{items.length} items</p>
        </div>

        {/* Grid of items */}
        <div className="p-3 grid grid-cols-4 gap-2 max-h-[320px] overflow-y-auto">
          {items.map((item, index) => (
            <button
              key={item.id}
              onClick={() => onItemClick?.(item)}
              className="flex flex-col items-center p-2 rounded-lg hover:bg-white/10 transition-colors group"
              style={{
                animationDelay: `${index * 30}ms`,
              }}
            >
              <div className="w-12 h-12 flex items-center justify-center bg-white/5 rounded-lg group-hover:bg-white/10 transition-colors">
                {getIcon(item.type)}
              </div>
              <span className="mt-1.5 text-[10px] text-white/70 text-center line-clamp-2 leading-tight max-w-full break-all">
                {item.name}
              </span>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-white/10 flex justify-between items-center">
          <button
            onClick={onClose}
            className="text-xs text-white/50 hover:text-white/80 transition-colors"
          >
            Show in Finder
          </button>
          <div className="flex gap-1">
            <button className="w-6 h-6 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
              <span className="text-white/60 text-[10px]">▤</span>
            </button>
            <button className="w-6 h-6 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
              <span className="text-white/60 text-[10px]">⋮⋮</span>
            </button>
          </div>
        </div>
      </div>

      {/* Arrow pointing down to dock */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white/20" />
    </div>
  );
};

export default DockStack;
