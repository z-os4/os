import React, { useState } from 'react';
import { ZWindow } from '@z-os/ui';
import { ChevronLeft, ChevronRight, RotateCw, Share, Plus, Lock } from 'lucide-react';

interface SafariWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

const SafariWindow: React.FC<SafariWindowProps> = ({ onClose, onFocus }) => {
  const [url, setUrl] = useState('https://hanzo.ai');
  const [isLoading, setIsLoading] = useState(false);

  const handleNavigate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <ZWindow
      title="Safari"
      onClose={onClose}
      onFocus={onFocus}
      initialPosition={{ x: 100, y: 50 }}
      initialSize={{ width: 1000, height: 700 }}
      windowType="safari"
    >
      <div className="flex flex-col h-full bg-[#1e1e1e]">
        {/* Toolbar */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10 bg-black/20">
          {/* Navigation buttons */}
          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded hover:bg-white/10 disabled:opacity-30">
              <ChevronLeft className="w-4 h-4 text-white/70" />
            </button>
            <button className="p-1.5 rounded hover:bg-white/10 disabled:opacity-30">
              <ChevronRight className="w-4 h-4 text-white/70" />
            </button>
          </div>

          {/* URL bar */}
          <form onSubmit={handleNavigate} className="flex-1 max-w-2xl mx-auto">
            <div className="relative flex items-center">
              <Lock className="absolute left-3 w-3 h-3 text-green-400" />
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full h-8 pl-8 pr-10 rounded-lg bg-white/5 border border-white/10 text-sm text-white/90 text-center focus:outline-none focus:border-blue-500/50"
              />
              {isLoading ? (
                <RotateCw className="absolute right-3 w-4 h-4 text-white/50 animate-spin" />
              ) : (
                <RotateCw className="absolute right-3 w-4 h-4 text-white/30 hover:text-white/50 cursor-pointer" />
              )}
            </div>
          </form>

          {/* Action buttons */}
          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded hover:bg-white/10">
              <Share className="w-4 h-4 text-white/70" />
            </button>
            <button className="p-1.5 rounded hover:bg-white/10">
              <Plus className="w-4 h-4 text-white/70" />
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex items-center gap-1 px-2 py-1 border-b border-white/10 bg-black/10">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
            <img src="https://hanzo.ai/favicon.ico" alt="" className="w-4 h-4" onError={(e) => { e.currentTarget.style.display = 'none' }} />
            <span className="text-xs text-white/70 max-w-[150px] truncate">Hanzo AI</span>
            <button className="text-white/30 hover:text-white/60 ml-1">x</button>
          </div>
          <button className="p-1 rounded hover:bg-white/5">
            <Plus className="w-4 h-4 text-white/40" />
          </button>
        </div>

        {/* Browser content */}
        <div className="flex-1 bg-white overflow-hidden">
          <iframe
            src={url}
            title="Browser Content"
            className="w-full h-full border-0"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
          />
        </div>
      </div>
    </ZWindow>
  );
};

export default SafariWindow;
