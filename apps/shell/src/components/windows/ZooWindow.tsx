import React, { useState } from 'react';
import { ZWindow } from '@z-os/ui';
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
      <div className="flex flex-col h-full bg-black">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h1 className="text-white font-bold text-lg">Zoo Marketplace</h1>
          </div>
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
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-48 border-r border-white/10 p-3">
            <h3 className="text-white/40 text-xs uppercase tracking-wider px-3 py-2">Browse</h3>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeCategory === cat.id ? 'bg-purple-500/20 text-purple-400' : 'text-white/70 hover:bg-white/5'
                }`}
              >
                <cat.icon className="w-4 h-4" />
                {cat.label}
              </button>
            ))}

            <h3 className="text-white/40 text-xs uppercase tracking-wider px-3 py-2 mt-4">Collections</h3>
            {['Zoo Genesis', 'AI Animals', 'Bit Beasts'].map((col) => (
              <button
                key={col}
                className="w-full text-left px-3 py-2 text-white/70 hover:bg-white/5 rounded-lg text-sm transition-colors"
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
                    className="text-purple-400 text-sm mb-4 hover:underline"
                  >
                    ← Back to gallery
                  </button>
                  <p className="text-purple-400 text-sm">{selectedNFT.collection}</p>
                  <h2 className="text-white text-2xl font-bold mt-1">{selectedNFT.name}</h2>
                  <div className="flex items-center gap-4 mt-4">
                    <div>
                      <p className="text-white/40 text-xs">Price</p>
                      <p className="text-white text-xl font-bold">{selectedNFT.price}</p>
                    </div>
                    <div>
                      <p className="text-white/40 text-xs">Likes</p>
                      <p className="text-white/70 flex items-center gap-1">
                        <Heart className="w-4 h-4 text-red-400" /> {selectedNFT.likes}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button className="flex-1 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-medium transition-colors">
                      Buy Now
                    </button>
                    <button className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors">
                      <Heart className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="mt-6 p-4 bg-white/5 rounded-xl">
                    <h3 className="text-white font-medium mb-2">Description</h3>
                    <p className="text-white/60 text-sm">
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
                    <div className="relative rounded-2xl overflow-hidden bg-white/5">
                      <img
                        src={nft.image}
                        alt=""
                        className={`w-full ${viewMode === 'grid' ? 'aspect-square' : 'h-32'} object-cover`}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <button className="px-4 py-2 bg-purple-500 text-white rounded-lg font-medium">
                          View
                        </button>
                      </div>
                    </div>
                    <div className={`p-3 ${viewMode === 'list' ? 'flex items-center justify-between' : ''}`}>
                      <div>
                        <p className="text-purple-400 text-xs">{nft.collection}</p>
                        <p className="text-white font-medium">{nft.name}</p>
                      </div>
                      <div className={viewMode === 'list' ? 'text-right' : 'flex items-center justify-between mt-2'}>
                        <p className="text-white font-bold">{nft.price}</p>
                        <p className="text-white/40 text-sm flex items-center gap-1">
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
        <div className="p-3 border-t border-white/10 flex items-center justify-between">
          <p className="text-white/40 text-xs">Zoo Labs Foundation</p>
          <button className="flex items-center gap-1 text-purple-400 text-sm hover:text-purple-300 transition-colors">
            <ExternalLink className="w-3 h-3" />
            <span>zips.zoo.ngo</span>
          </button>
        </div>
      </div>
    </ZWindow>
  );
};

export default ZooWindow;
