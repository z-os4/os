import React, { useState } from 'react';
import { ZWindow, useTheme } from '@z-os/ui';
import { Sparkles, TrendingUp, Clock, Star, Grid, List, ExternalLink, Heart } from 'lucide-react';

interface ZooWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

interface NFT {
  id: string;
  name: string;
  collection: string;
  image: string;
  price: string;
  likes: number;
}

const mockNFTs: NFT[] = [
  { id: '1', name: 'Cosmic Dreamer #42', collection: 'Zoo Genesis', image: 'https://picsum.photos/seed/nft1/200/200', price: '2.5 LUX', likes: 128 },
  { id: '2', name: 'Digital Fauna #17', collection: 'AI Animals', image: 'https://picsum.photos/seed/nft2/200/200', price: '1.8 LUX', likes: 89 },
  { id: '3', name: 'Neon Wildlife #8', collection: 'Zoo Genesis', image: 'https://picsum.photos/seed/nft3/200/200', price: '3.2 LUX', likes: 256 },
  { id: '4', name: 'Pixel Creature #33', collection: 'Bit Beasts', image: 'https://picsum.photos/seed/nft4/200/200', price: '0.9 LUX', likes: 45 },
  { id: '5', name: 'Abstract Zoo #12', collection: 'AI Animals', image: 'https://picsum.photos/seed/nft5/200/200', price: '4.5 LUX', likes: 312 },
  { id: '6', name: 'Cyber Beast #99', collection: 'Bit Beasts', image: 'https://picsum.photos/seed/nft6/200/200', price: '1.2 LUX', likes: 67 },
];

const categories = [
  { id: 'all', label: 'All', icon: Grid },
  { id: 'trending', label: 'Trending', icon: TrendingUp },
  { id: 'new', label: 'New', icon: Clock },
  { id: 'favorites', label: 'Favorites', icon: Star },
];

const ZooWindow: React.FC<ZooWindowProps> = ({ onClose, onFocus }) => {
  const { theme } = useTheme();
  const [activeCategory, setActiveCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);

  return (
    <ZWindow
      title="Zoo"
      onClose={onClose}
      onFocus={onFocus}
      initialPosition={{ x: 120, y: 70 }}
      initialSize={{ width: 900, height: 600 }}
      windowType="system"
    >
      <div className="flex flex-col h-full zos-bg-primary">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b zos-border">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 zos-text-purple" />
            <h1 className="zos-text-primary font-bold text-lg">Zoo Marketplace</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'zos-surface-glass' : 'hover:bg-[var(--zos-surface-glass-hover)]'}`}
            >
              <Grid className="w-4 h-4 zos-text-secondary" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'zos-surface-glass' : 'hover:bg-[var(--zos-surface-glass-hover)]'}`}
            >
              <List className="w-4 h-4 zos-text-secondary" />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-48 border-r zos-border p-3">
            <h3 className="zos-text-muted text-xs uppercase tracking-wider px-3 py-2">Browse</h3>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeCategory === cat.id ? 'bg-[var(--zos-system-purple)]/20 zos-text-purple' : 'zos-text-secondary hover:bg-[var(--zos-surface-glass-hover)]'
                }`}
              >
                <cat.icon className="w-4 h-4" />
                {cat.label}
              </button>
            ))}

            <h3 className="zos-text-muted text-xs uppercase tracking-wider px-3 py-2 mt-4">Collections</h3>
            {['Zoo Genesis', 'AI Animals', 'Bit Beasts'].map((col) => (
              <button
                key={col}
                className="w-full text-left px-3 py-2 zos-text-secondary hover:bg-[var(--zos-surface-glass-hover)] rounded-lg text-sm transition-colors"
              >
                {col}
              </button>
            ))}
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {selectedNFT ? (
              /* Detail View */
              <div className="flex gap-6">
                <div className="w-80">
                  <img src={selectedNFT.image} alt="" className="w-full aspect-square rounded-2xl object-cover" />
                </div>
                <div className="flex-1">
                  <button
                    onClick={() => setSelectedNFT(null)}
                    className="zos-text-purple text-sm mb-4 hover:underline"
                  >
                    Back to gallery
                  </button>
                  <p className="zos-text-purple text-sm">{selectedNFT.collection}</p>
                  <h2 className="zos-text-primary text-2xl font-bold mt-1">{selectedNFT.name}</h2>
                  <div className="flex items-center gap-4 mt-4">
                    <div>
                      <p className="zos-text-muted text-xs">Price</p>
                      <p className="zos-text-primary text-xl font-bold">{selectedNFT.price}</p>
                    </div>
                    <div>
                      <p className="zos-text-muted text-xs">Likes</p>
                      <p className="zos-text-secondary flex items-center gap-1">
                        <Heart className="w-4 h-4 zos-text-red" /> {selectedNFT.likes}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button className="flex-1 py-3 bg-[var(--zos-system-purple)] hover:opacity-90 text-white rounded-xl font-medium transition-opacity">
                      Buy Now
                    </button>
                    <button className="px-4 py-3 zos-surface-glass hover:bg-[var(--zos-surface-glass-hover)] zos-text-primary rounded-xl transition-colors">
                      <Heart className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="mt-6 p-4 zos-surface-glass rounded-xl">
                    <h3 className="zos-text-primary font-medium mb-2">Description</h3>
                    <p className="zos-text-secondary text-sm">
                      A unique digital collectible from the {selectedNFT.collection} collection.
                      This NFT represents ownership of a one-of-a-kind piece in the Zoo ecosystem.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* Grid View */
              <div className={`grid ${viewMode === 'grid' ? 'grid-cols-3' : 'grid-cols-1'} gap-4`}>
                {mockNFTs.map((nft) => (
                  <div
                    key={nft.id}
                    onClick={() => setSelectedNFT(nft)}
                    className="group cursor-pointer"
                  >
                    <div className="relative rounded-2xl overflow-hidden zos-surface-glass">
                      <img
                        src={nft.image}
                        alt=""
                        className={`w-full ${viewMode === 'grid' ? 'aspect-square' : 'h-32'} object-cover`}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <button className="px-4 py-2 bg-[var(--zos-system-purple)] text-white rounded-lg font-medium">
                          View
                        </button>
                      </div>
                    </div>
                    <div className={`p-3 ${viewMode === 'list' ? 'flex items-center justify-between' : ''}`}>
                      <div>
                        <p className="zos-text-purple text-xs">{nft.collection}</p>
                        <p className="zos-text-primary font-medium">{nft.name}</p>
                      </div>
                      <div className={viewMode === 'list' ? 'text-right' : 'flex items-center justify-between mt-2'}>
                        <p className="zos-text-primary font-bold">{nft.price}</p>
                        <p className="zos-text-muted text-sm flex items-center gap-1">
                          <Heart className="w-3 h-3" /> {nft.likes}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t zos-border flex items-center justify-between">
          <p className="zos-text-muted text-xs">Zoo Labs Foundation</p>
          <button className="flex items-center gap-1 zos-text-purple text-sm hover:opacity-80 transition-opacity">
            <ExternalLink className="w-3 h-3" />
            <span>zips.zoo.ngo</span>
          </button>
        </div>
      </div>
    </ZWindow>
  );
};

export default ZooWindow;
