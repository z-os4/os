import React, { useState } from 'react';
import { ZWindow } from '@z-os/ui';
import { Grid, List, Heart, Share2, Trash2, Plus, Image, Folder, Clock, Camera } from 'lucide-react';

interface PhotosWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

const mockPhotos = [
  { id: '1', src: 'https://picsum.photos/seed/1/400/300', date: '2024-12-25', favorite: true },
  { id: '2', src: 'https://picsum.photos/seed/2/400/300', date: '2024-12-24', favorite: false },
  { id: '3', src: 'https://picsum.photos/seed/3/400/300', date: '2024-12-23', favorite: true },
  { id: '4', src: 'https://picsum.photos/seed/4/400/300', date: '2024-12-22', favorite: false },
  { id: '5', src: 'https://picsum.photos/seed/5/400/300', date: '2024-12-21', favorite: false },
  { id: '6', src: 'https://picsum.photos/seed/6/400/300', date: '2024-12-20', favorite: true },
  { id: '7', src: 'https://picsum.photos/seed/7/400/300', date: '2024-12-19', favorite: false },
  { id: '8', src: 'https://picsum.photos/seed/8/400/300', date: '2024-12-18', favorite: false },
];

const albums = [
  { id: 'all', label: 'All Photos', count: 8, icon: Image },
  { id: 'favorites', label: 'Favorites', count: 3, icon: Heart },
  { id: 'recents', label: 'Recents', count: 5, icon: Clock },
  { id: 'screenshots', label: 'Screenshots', count: 0, icon: Camera },
];

const PhotosWindow: React.FC<PhotosWindowProps> = ({ onClose, onFocus }) => {
  const [selectedAlbum, setSelectedAlbum] = useState('all');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredPhotos = selectedAlbum === 'favorites'
    ? mockPhotos.filter(p => p.favorite)
    : mockPhotos;

  return (
    <ZWindow
      title="Photos"
      onClose={onClose}
      onFocus={onFocus}
      initialPosition={{ x: 120, y: 80 }}
      initialSize={{ width: 900, height: 600 }}
      windowType="system"
    >
      <div className="flex h-full bg-black/80 backdrop-blur-2xl">
        {/* Glass Morphism Sidebar */}
        <div className="w-52 bg-white/[0.03] backdrop-blur-xl border-r border-white/[0.08] flex flex-col">
          {/* Sidebar Header */}
          <div className="h-12 flex items-center px-4 border-b border-white/[0.06]">
            <span className="text-white/50 text-xs font-medium uppercase tracking-widest">Library</span>
          </div>

          {/* Album List */}
          <div className="flex-1 overflow-y-auto py-2 px-2">
            {albums.map((album) => {
              const IconComponent = album.icon;
              return (
                <button
                  key={album.id}
                  onClick={() => setSelectedAlbum(album.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                    selectedAlbum === album.id
                      ? 'bg-white/[0.12] text-white shadow-[inset_0_0.5px_0_rgba(255,255,255,0.1)]'
                      : 'text-white/70 hover:bg-white/[0.06] hover:text-white/90'
                  }`}
                >
                  <IconComponent className={`w-4 h-4 ${selectedAlbum === album.id ? 'text-white' : 'text-white/50'}`} />
                  <span className="flex-1 text-left">{album.label}</span>
                  <span className={`text-xs ${selectedAlbum === album.id ? 'text-white/60' : 'text-white/30'}`}>
                    {album.count}
                  </span>
                </button>
              );
            })}

            {/* Albums Section */}
            <div className="mt-6">
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-white/40 text-xs font-medium uppercase tracking-widest">Albums</span>
                <button className="p-1 hover:bg-white/[0.08] rounded transition-colors">
                  <Plus className="w-3 h-3 text-white/40" />
                </button>
              </div>
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/50 hover:bg-white/[0.06] hover:text-white/70 transition-all duration-200">
                <Folder className="w-4 h-4" />
                <span>My Album</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Glass Toolbar */}
          <div className="h-12 flex items-center justify-between px-4 bg-white/[0.02] border-b border-white/[0.06] backdrop-blur-xl">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  viewMode === 'grid'
                    ? 'bg-white/[0.12] text-white shadow-[inset_0_0.5px_0_rgba(255,255,255,0.1)]'
                    : 'text-white/50 hover:bg-white/[0.06] hover:text-white/70'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  viewMode === 'list'
                    ? 'bg-white/[0.12] text-white shadow-[inset_0_0.5px_0_rgba(255,255,255,0.1)]'
                    : 'text-white/50 hover:bg-white/[0.06] hover:text-white/70'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Album Title */}
            <div className="absolute left-1/2 -translate-x-1/2">
              <span className="text-white/90 text-sm font-medium">
                {albums.find(a => a.id === selectedAlbum)?.label}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button className="p-2 text-white/50 hover:bg-white/[0.06] hover:text-white/70 rounded-lg transition-all duration-200">
                <Plus className="w-4 h-4" />
              </button>
              <button className="p-2 text-white/50 hover:bg-white/[0.06] hover:text-white/70 rounded-lg transition-all duration-200">
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Photo Grid */}
          <div className="flex-1 overflow-y-auto p-4 bg-black/20">
            <div className={`grid ${viewMode === 'grid' ? 'grid-cols-4' : 'grid-cols-1'} gap-3`}>
              {filteredPhotos.map((photo) => (
                <div
                  key={photo.id}
                  onClick={() => setSelectedPhoto(photo.id)}
                  className={`relative cursor-pointer rounded-xl overflow-hidden group transition-all duration-300 ${
                    selectedPhoto === photo.id
                      ? 'ring-2 ring-white/60 ring-offset-2 ring-offset-black/80 scale-[0.98]'
                      : 'hover:scale-[1.02] hover:shadow-2xl hover:shadow-black/50'
                  }`}
                >
                  {/* Photo Container with Glass Border */}
                  <div className={`${viewMode === 'grid' ? 'aspect-square' : 'h-24'} bg-white/[0.03] border border-white/[0.08] rounded-xl overflow-hidden`}>
                    <img
                      src={photo.src}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Hover Overlay with Glass Effect */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-4">
                    <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md rounded-full p-1 border border-white/[0.1]">
                      <button className="p-2 hover:bg-white/[0.15] rounded-full transition-colors">
                        <Heart className={`w-4 h-4 ${photo.favorite ? 'text-red-400 fill-red-400' : 'text-white/90'}`} />
                      </button>
                      <button className="p-2 hover:bg-white/[0.15] rounded-full transition-colors">
                        <Trash2 className="w-4 h-4 text-white/90" />
                      </button>
                    </div>
                  </div>

                  {/* Favorite Badge */}
                  {photo.favorite && (
                    <div className="absolute top-2 right-2 p-1.5 bg-black/40 backdrop-blur-md rounded-full border border-white/[0.1]">
                      <Heart className="w-3 h-3 text-red-400 fill-red-400" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Empty State */}
            {filteredPhotos.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-20 h-20 rounded-2xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center mb-4">
                  <Image className="w-10 h-10 text-white/30" />
                </div>
                <h3 className="text-white/70 text-lg font-medium mb-2">No Photos</h3>
                <p className="text-white/40 text-sm">Import photos to get started</p>
              </div>
            )}
          </div>

          {/* Status Bar */}
          <div className="h-8 flex items-center justify-center px-4 bg-white/[0.02] border-t border-white/[0.06] backdrop-blur-xl">
            <span className="text-white/40 text-xs">
              {filteredPhotos.length} {filteredPhotos.length === 1 ? 'photo' : 'photos'}
            </span>
          </div>
        </div>
      </div>
    </ZWindow>
  );
};

// ============================================================================
// App Definition
// ============================================================================

/**
 * Photos app manifest
 */
export const PhotosManifest = {
  identifier: 'ai.hanzo.photos',
  name: 'Photos',
  version: '1.0.0',
  description: 'Photo management app for zOS',
  category: 'media' as const,
  permissions: ['storage', 'filesystem'] as const,
  window: {
    type: 'system' as const,
    defaultSize: { width: 900, height: 600 },
    resizable: true,
    showInDock: true,
  },
};

/**
 * Photos menu bar configuration
 */
export const PhotosMenuBar = {
  menus: [
    {
      id: 'file',
      label: 'File',
      items: [
        { type: 'item' as const, id: 'import', label: 'Import...', shortcut: '⌘I' },
        { type: 'item' as const, id: 'newAlbum', label: 'New Album', shortcut: '⌘N' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'export', label: 'Export...', shortcut: '⇧⌘E' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'close', label: 'Close', shortcut: '⌘W' },
      ],
    },
    {
      id: 'edit',
      label: 'Edit',
      items: [
        { type: 'item' as const, id: 'undo', label: 'Undo', shortcut: '⌘Z' },
        { type: 'item' as const, id: 'redo', label: 'Redo', shortcut: '⇧⌘Z' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'cut', label: 'Cut', shortcut: '⌘X' },
        { type: 'item' as const, id: 'copy', label: 'Copy', shortcut: '⌘C' },
        { type: 'item' as const, id: 'paste', label: 'Paste', shortcut: '⌘V' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'selectAll', label: 'Select All', shortcut: '⌘A' },
        { type: 'item' as const, id: 'delete', label: 'Delete', shortcut: '⌘⌫' },
      ],
    },
    {
      id: 'image',
      label: 'Image',
      items: [
        { type: 'item' as const, id: 'rotateLeft', label: 'Rotate Left', shortcut: '⌘L' },
        { type: 'item' as const, id: 'rotateRight', label: 'Rotate Right', shortcut: '⌘R' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'edit', label: 'Edit', shortcut: '⌘E' },
        { type: 'item' as const, id: 'duplicate', label: 'Duplicate', shortcut: '⌘D' },
      ],
    },
    {
      id: 'view',
      label: 'View',
      items: [
        { type: 'item' as const, id: 'showSidebar', label: 'Show Sidebar', shortcut: '⌘S' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'zoomIn', label: 'Zoom In', shortcut: '⌘+' },
        { type: 'item' as const, id: 'zoomOut', label: 'Zoom Out', shortcut: '⌘-' },
        { type: 'item' as const, id: 'actualSize', label: 'Actual Size', shortcut: '⌘0' },
      ],
    },
    {
      id: 'window',
      label: 'Window',
      items: [
        { type: 'item' as const, id: 'minimize', label: 'Minimize', shortcut: '⌘M' },
        { type: 'item' as const, id: 'zoom', label: 'Zoom' },
      ],
    },
    {
      id: 'help',
      label: 'Help',
      items: [
        { type: 'item' as const, id: 'photosHelp', label: 'Photos Help' },
      ],
    },
  ],
};

/**
 * Photos dock configuration
 */
export const PhotosDockConfig = {
  contextMenu: [
    { type: 'item' as const, id: 'import', label: 'Import Photos...' },
    { type: 'item' as const, id: 'newAlbum', label: 'New Album' },
    { type: 'separator' as const },
    { type: 'item' as const, id: 'options', label: 'Options' },
  ],
};

/**
 * Photos App definition for registry
 */
export const PhotosApp = {
  manifest: PhotosManifest,
  component: PhotosWindow,
  icon: Image,
  menuBar: PhotosMenuBar,
  dockConfig: PhotosDockConfig,
};

export default PhotosWindow;
