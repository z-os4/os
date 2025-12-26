import React, { useState, useEffect, useRef } from 'react';
import { Search, FileText, Terminal, Globe, Settings, Calculator, Mail, Music, Calendar, MessageSquare } from 'lucide-react';

interface SpotlightProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenApp: (appId: string) => void;
}

interface SearchResult {
  id: string;
  type: 'app' | 'file' | 'action';
  name: string;
  icon: React.ReactNode;
  description?: string;
}

const ALL_APPS: SearchResult[] = [
  { id: 'finder', type: 'app', name: 'Finder', icon: <FileText className="w-8 h-8 text-blue-400" />, description: 'File Manager' },
  { id: 'safari', type: 'app', name: 'Safari', icon: <Globe className="w-8 h-8 text-blue-500" />, description: 'Web Browser' },
  { id: 'mail', type: 'app', name: 'Mail', icon: <Mail className="w-8 h-8 text-blue-400" />, description: 'Email Client' },
  { id: 'calendar', type: 'app', name: 'Calendar', icon: <Calendar className="w-8 h-8 text-red-400" />, description: 'Calendar' },
  { id: 'messages', type: 'app', name: 'Messages', icon: <MessageSquare className="w-8 h-8 text-green-400" />, description: 'Messaging' },
  { id: 'music', type: 'app', name: 'Music', icon: <Music className="w-8 h-8 text-red-500" />, description: 'Music Player' },
  { id: 'terminal', type: 'app', name: 'Terminal', icon: <Terminal className="w-8 h-8 text-white" />, description: 'Command Line' },
  { id: 'settings', type: 'app', name: 'System Preferences', icon: <Settings className="w-8 h-8 text-gray-400" />, description: 'System Settings' },
  { id: 'calculator', type: 'app', name: 'Calculator', icon: <Calculator className="w-8 h-8 text-orange-400" />, description: 'Calculator' },
  { id: 'hanzo', type: 'app', name: 'Hanzo AI', icon: <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg" />, description: 'AI Assistant' },
  { id: 'textedit', type: 'app', name: 'TextEdit', icon: <FileText className="w-8 h-8 text-blue-300" />, description: 'Text Editor' },
];

export const Spotlight: React.FC<SpotlightProps> = ({ isOpen, onClose, onOpenApp }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = query.trim()
    ? ALL_APPS.filter(app =>
        app.name.toLowerCase().includes(query.toLowerCase()) ||
        app.description?.toLowerCase().includes(query.toLowerCase())
      )
    : ALL_APPS.slice(0, 6);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, results.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (results[selectedIndex]) {
          onOpenApp(results[selectedIndex].id);
          onClose();
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-start justify-center pt-[15vh]"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Spotlight Box */}
      <div
        className="relative w-[680px] bg-[#1e1e1e]/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
          <Search className="w-6 h-6 text-white/50" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Spotlight Search"
            className="flex-1 bg-transparent text-white text-xl placeholder:text-white/30 outline-none"
            autoFocus
          />
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="max-h-[400px] overflow-y-auto">
            <div className="px-3 py-2 text-xs text-white/40 uppercase tracking-wider">
              {query ? 'Top Results' : 'Applications'}
            </div>
            {results.map((result, index) => (
              <div
                key={result.id}
                onClick={() => {
                  onOpenApp(result.id);
                  onClose();
                }}
                className={`flex items-center gap-4 px-4 py-3 cursor-pointer transition-colors ${
                  index === selectedIndex ? 'bg-blue-500/30' : 'hover:bg-white/5'
                }`}
              >
                <div className="w-10 h-10 flex items-center justify-center">
                  {result.icon}
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">{result.name}</p>
                  {result.description && (
                    <p className="text-white/40 text-sm">{result.description}</p>
                  )}
                </div>
                {index === selectedIndex && (
                  <span className="text-white/30 text-sm">↵ to open</span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {query && results.length === 0 && (
          <div className="px-5 py-8 text-center text-white/40">
            No results for "{query}"
          </div>
        )}

        {/* Footer */}
        <div className="px-4 py-2 border-t border-white/10 flex items-center justify-between text-xs text-white/30">
          <span>Spotlight</span>
          <span>⌘Space to close</span>
        </div>
      </div>
    </div>
  );
};

export default Spotlight;
