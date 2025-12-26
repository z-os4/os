import React, { useState } from 'react';
import { ZWindow } from '@z-os/ui';
import { Grid, List, Heart, Share2, Trash2, Plus } from 'lucide-react';

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
  { id: 'all', label: 'All Photos', count: 8 },
  { id: 'favorites', label: 'Favorites', count: 3 },
  { id: 'recents', label: 'Recents', count: 5 },
  { id: 'screenshots', label: 'Screenshots', count: 0 },
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
      <div className="flex h-full bg-[#1e1e1e]">
        {/* Sidebar */}
        <div className="w-48 bg-[#2c2c2e] border-r border-white/10 flex flex-col p-2">
          <div className="mb-4">
            <h3 className="text-white/40 text-xs uppercase tracking-wider px-3 py-2">Library</h3>
            {albums.map((album) => (
              <button
                key={album.id}
                onClick={() => setSelectedAlbum(album.id)}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  selectedAlbum === album.id ? 'bg-blue-500/20 text-blue-400' : 'text-white/70 hover:bg-white/5'
                }`}
              >
                <span>{album.label}</span>
                <span className="text-white/30 text-xs">{album.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <div className="flex items-center justify-between p-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white/10' : 'hover:bg-white/5'}`}
              >
                <Grid className="w-4 h-4 text-white/70" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white/10' : 'hover:bg-white/5'}`}
              >
                <List className="w-4 h-4 text-white/70" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                <Plus className="w-4 h-4 text-white/70" />
              </button>
              <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                <Share2 className="w-4 h-4 text-white/70" />
              </button>
            </div>
          </div>

          {/* Photo Grid */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className={`grid ${viewMode === 'grid' ? 'grid-cols-4' : 'grid-cols-1'} gap-2`}>
              {filteredPhotos.map((photo) => (
                <div
                  key={photo.id}
                  onClick={() => setSelectedPhoto(photo.id)}
                  className={`relative cursor-pointer rounded-lg overflow-hidden group ${
                    selectedPhoto === photo.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <div className={`${viewMode === 'grid' ? 'aspect-square' : 'h-24'} bg-white/5`}>
                    <img
                      src={photo.src}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex items-center gap-2">
                      <button className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
                        <Heart className={`w-4 h-4 ${photo.favorite ? 'text-red-500 fill-red-500' : 'text-white'}`} />
                      </button>
                      <button className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>
                  {photo.favorite && (
                    <div className="absolute top-2 right-2">
                      <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ZWindow>
  );
};

export default PhotosWindow;
