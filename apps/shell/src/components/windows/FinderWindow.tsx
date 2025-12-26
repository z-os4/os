import React from 'react';
import { ZWindow } from '@z-os/ui';
import { Folder, File, HardDrive, Image, Music, Video, Download, Trash2, ChevronRight, Search } from 'lucide-react';

interface FinderWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

const FinderWindow: React.FC<FinderWindowProps> = ({ onClose, onFocus }) => {
  const [selectedItem, setSelectedItem] = React.useState<string | null>(null);

  const sidebarItems = [
    { id: 'favorites', label: 'Favorites', icon: null, isHeader: true },
    { id: 'airdrop', label: 'AirDrop', icon: HardDrive },
    { id: 'recents', label: 'Recents', icon: File },
    { id: 'applications', label: 'Applications', icon: Folder },
    { id: 'desktop', label: 'Desktop', icon: Folder },
    { id: 'documents', label: 'Documents', icon: Folder },
    { id: 'downloads', label: 'Downloads', icon: Download },
    { id: 'pictures', label: 'Pictures', icon: Image },
    { id: 'music', label: 'Music', icon: Music },
    { id: 'movies', label: 'Movies', icon: Video },
    { id: 'trash', label: 'Trash', icon: Trash2 },
  ];

  const files = [
    { id: '1', name: 'Applications', type: 'folder', modified: 'Oct 24, 2024' },
    { id: '2', name: 'Documents', type: 'folder', modified: 'Dec 20, 2024' },
    { id: '3', name: 'Downloads', type: 'folder', modified: 'Dec 25, 2024' },
    { id: '4', name: 'Desktop', type: 'folder', modified: 'Dec 24, 2024' },
    { id: '5', name: 'Pictures', type: 'folder', modified: 'Nov 15, 2024' },
    { id: '6', name: 'Music', type: 'folder', modified: 'Sep 10, 2024' },
    { id: '7', name: 'Movies', type: 'folder', modified: 'Aug 5, 2024' },
  ];

  return (
    <ZWindow
      title="Finder"
      onClose={onClose}
      onFocus={onFocus}
      initialPosition={{ x: 80, y: 60 }}
      initialSize={{ width: 900, height: 550 }}
      windowType="default"
    >
      <div className="flex h-full bg-[#1e1e1e]">
        {/* Sidebar */}
        <div className="w-52 bg-black/30 border-r border-white/10 overflow-y-auto">
          <div className="p-2">
            {sidebarItems.map((item) => (
              item.isHeader ? (
                <div key={item.id} className="px-3 py-1 text-xs font-semibold text-white/40 uppercase tracking-wider mt-3 first:mt-0">
                  {item.label}
                </div>
              ) : (
                <button
                  key={item.id}
                  onClick={() => setSelectedItem(item.id)}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
                    selectedItem === item.id
                      ? 'bg-blue-500/30 text-white'
                      : 'text-white/70 hover:bg-white/5'
                  }`}
                >
                  {item.icon && <item.icon className="w-4 h-4 text-blue-400" />}
                  <span>{item.label}</span>
                </button>
              )
            ))}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <div className="h-10 flex items-center gap-2 px-3 border-b border-white/10 bg-black/20">
            <button className="p-1.5 rounded hover:bg-white/10">
              <ChevronRight className="w-4 h-4 text-white/50 rotate-180" />
            </button>
            <button className="p-1.5 rounded hover:bg-white/10">
              <ChevronRight className="w-4 h-4 text-white/50" />
            </button>
            <div className="flex-1" />
            <div className="relative">
              <Search className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="text"
                placeholder="Search"
                className="w-48 h-7 pl-8 pr-3 rounded-md bg-white/5 border border-white/10 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/30"
              />
            </div>
          </div>

          {/* File list */}
          <div className="flex-1 overflow-auto p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {files.map((file) => (
                <button
                  key={file.id}
                  className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <Folder className="w-12 h-12 text-blue-400" />
                  <span className="text-sm text-white/80 text-center">{file.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Status bar */}
          <div className="h-6 flex items-center px-3 border-t border-white/10 text-xs text-white/40">
            {files.length} items
          </div>
        </div>
      </div>
    </ZWindow>
  );
};

export default FinderWindow;
