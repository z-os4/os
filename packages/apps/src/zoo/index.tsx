import React, { useState } from 'react';
import { ZWindow } from '@z-os/ui';
import { Sparkles, TrendingUp, Clock, Star, Grid, List, ExternalLink, Heart, Activity, Beaker, Dna, Atom } from 'lucide-react';

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

// Glass panel component for consistent styling
const GlassPanel: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
  hover?: boolean;
}> = ({ children, className = '', hover = false }) => (
  <div className={`
    bg-black/40 backdrop-blur-xl 
    border border-white/10 
    ${hover ? 'hover:bg-white/10 hover:border-white/20 transition-all duration-200' : ''}
    ${className}
  `}>
    {children}
  </div>
);

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
      <div className="flex flex-col h-full bg-black/80 backdrop-blur-2xl">
        {/* Header - Glass morphism bar */}
        <GlassPanel className="flex items-center justify-between px-5 py-3 rounded-none border-x-0 border-t-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Atom className="w-5 h-5 text-cyan-400" />
              <div className="absolute inset-0 animate-pulse opacity-50">
                <Atom className="w-5 h-5 text-cyan-400 blur-sm" />
              </div>
            </div>
            <h1 className="text-white/90 font-medium tracking-wide">Zoo Research Network</h1>
            <div className="flex items-center gap-1 ml-4 px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/30 rounded-full">
              <Activity className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400 text-xs font-mono">LIVE</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg border transition-all duration-200 ${
                viewMode === 'grid' 
                  ? 'bg-white/10 border-white/20 text-white' 
                  : 'border-transparent text-white/50 hover:text-white/80 hover:bg-white/5'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg border transition-all duration-200 ${
                viewMode === 'list' 
                  ? 'bg-white/10 border-white/20 text-white' 
                  : 'border-transparent text-white/50 hover:text-white/80 hover:bg-white/5'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </GlassPanel>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar - Glass panel */}
          <GlassPanel className="w-52 rounded-none border-t-0 border-l-0 border-b-0 p-4">
            <div className="flex items-center gap-2 mb-4">
              <Beaker className="w-4 h-4 text-white/40" />
              <h3 className="text-white/40 text-xs uppercase tracking-widest font-medium">Explore</h3>
            </div>
            <div className="space-y-1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                    activeCategory === cat.id 
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' 
                      : 'text-white/60 hover:bg-white/5 hover:text-white/90 border border-transparent'
                  }`}
                >
                  <cat.icon className="w-4 h-4" />
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 mt-8 mb-4">
              <Dna className="w-4 h-4 text-white/40" />
              <h3 className="text-white/40 text-xs uppercase tracking-widest font-medium">Collections</h3>
            </div>
            <div className="space-y-1">
              {['Zoo Genesis', 'AI Animals', 'Bit Beasts'].map((col) => (
                <button
                  key={col}
                  className="w-full text-left px-3 py-2.5 text-white/60 hover:bg-white/5 hover:text-white/90 rounded-lg text-sm transition-all duration-200 border border-transparent hover:border-white/10"
                >
                  {col}
                </button>
              ))}
            </div>

            {/* Stats panel */}
            <GlassPanel className="mt-6 p-3 rounded-lg">
              <div className="text-white/40 text-xs uppercase tracking-wider mb-2">Network Stats</div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Total Items</span>
                  <span className="text-white/90 font-mono">12,847</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Researchers</span>
                  <span className="text-white/90 font-mono">3,241</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Volume (24h)</span>
                  <span className="text-cyan-400 font-mono">847 LUX</span>
                </div>
              </div>
            </GlassPanel>
          </GlassPanel>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-5">
            {selectedNFT ? (
              /* Detail View */
              <div className="flex gap-6">
                <GlassPanel className="w-80 rounded-2xl overflow-hidden">
                  <img src={selectedNFT.image} alt="" className="w-full aspect-square object-cover" />
                </GlassPanel>
                <div className="flex-1">
                  <button
                    onClick={() => setSelectedNFT(null)}
                    className="text-cyan-400 text-sm mb-4 hover:text-cyan-300 transition-colors flex items-center gap-1"
                  >
                    <span className="text-lg">←</span> Back to gallery
                  </button>
                  <p className="text-cyan-400/80 text-sm font-mono">{selectedNFT.collection}</p>
                  <h2 className="text-white text-2xl font-medium mt-1 tracking-wide">{selectedNFT.name}</h2>
                  
                  <GlassPanel className="mt-6 p-4 rounded-xl">
                    <div className="flex items-center gap-8">
                      <div>
                        <p className="text-white/40 text-xs uppercase tracking-wider">Price</p>
                        <p className="text-white text-xl font-mono mt-1">{selectedNFT.price}</p>
                      </div>
                      <div className="w-px h-10 bg-white/10" />
                      <div>
                        <p className="text-white/40 text-xs uppercase tracking-wider">Likes</p>
                        <p className="text-white/80 flex items-center gap-2 mt-1">
                          <Heart className="w-4 h-4 text-rose-400" /> 
                          <span className="font-mono">{selectedNFT.likes}</span>
                        </p>
                      </div>
                    </div>
                  </GlassPanel>

                  <div className="flex gap-3 mt-6">
                    <button className="flex-1 py-3 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 hover:border-cyan-500/60 text-cyan-300 rounded-xl font-medium transition-all duration-200 backdrop-blur-sm">
                      Acquire
                    </button>
                    <button className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/70 hover:text-white rounded-xl transition-all duration-200 backdrop-blur-sm">
                      <Heart className="w-5 h-5" />
                    </button>
                  </div>

                  <GlassPanel className="mt-6 p-4 rounded-xl">
                    <h3 className="text-white/80 font-medium mb-2 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      Research Notes
                    </h3>
                    <p className="text-white/50 text-sm leading-relaxed">
                      A unique digital specimen from the {selectedNFT.collection} collection.
                      This artifact represents verified ownership of a singular entity within the Zoo research network.
                      Full provenance and metadata available on-chain.
                    </p>
                  </GlassPanel>
                </div>
              </div>
            ) : (
              /* Grid View */
              <div className={`grid ${viewMode === 'grid' ? 'grid-cols-3' : 'grid-cols-1'} gap-4`}>
                {mockNFTs.map((nft) => (
                  <GlassPanel
                    key={nft.id}
                    hover
                    className="rounded-xl overflow-hidden cursor-pointer group"
                  >
                    <div 
                      onClick={() => setSelectedNFT(nft)}
                      className="relative"
                    >
                      <div className="relative overflow-hidden">
                        <img
                          src={nft.image}
                          alt=""
                          className={`w-full ${viewMode === 'grid' ? 'aspect-square' : 'h-32'} object-cover transition-transform duration-300 group-hover:scale-105`}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button className="px-4 py-2 bg-cyan-500/30 backdrop-blur-sm border border-cyan-500/50 text-cyan-200 rounded-lg font-medium">
                            View Details
                          </button>
                        </div>
                      </div>
                      <div className={`p-4 ${viewMode === 'list' ? 'flex items-center justify-between' : ''}`}>
                        <div>
                          <p className="text-cyan-400/70 text-xs font-mono">{nft.collection}</p>
                          <p className="text-white/90 font-medium mt-0.5">{nft.name}</p>
                        </div>
                        <div className={viewMode === 'list' ? 'text-right' : 'flex items-center justify-between mt-3'}>
                          <p className="text-white font-mono">{nft.price}</p>
                          <p className="text-white/40 text-sm flex items-center gap-1">
                            <Heart className="w-3 h-3" /> {nft.likes}
                          </p>
                        </div>
                      </div>
                    </div>
                  </GlassPanel>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer - Glass bar */}
        <GlassPanel className="px-5 py-3 rounded-none border-x-0 border-b-0 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <p className="text-white/30 text-xs font-mono">Zoo Labs Foundation</p>
            <div className="w-px h-4 bg-white/10" />
            <p className="text-white/20 text-xs">Decentralized AI Research Network</p>
          </div>
          <button className="flex items-center gap-2 text-cyan-400/70 text-sm hover:text-cyan-400 transition-colors group">
            <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            <span className="font-mono">zips.zoo.ngo</span>
          </button>
        </GlassPanel>
      </div>
    </ZWindow>
  );
};

// ============================================================================
// App Definition
// ============================================================================

/**
 * Zoo app manifest
 */
export const ZooManifest = {
  identifier: 'ai.hanzo.zoo',
  name: 'Zoo',
  version: '1.0.0',
  description: 'NFT marketplace for zOS',
  category: 'web3' as const,
  permissions: ['network', 'storage'] as const,
  window: {
    type: 'system' as const,
    defaultSize: { width: 900, height: 600 },
    resizable: true,
    showInDock: true,
  },
};

/**
 * Zoo menu bar configuration
 */
export const ZooMenuBar = {
  menus: [
    {
      id: 'file',
      label: 'File',
      items: [
        { type: 'item' as const, id: 'createNFT', label: 'Create NFT...', shortcut: '⌘N' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'import', label: 'Import Collection...' },
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
        { type: 'item' as const, id: 'copy', label: 'Copy', shortcut: '⌘C' },
      ],
    },
    {
      id: 'view',
      label: 'View',
      items: [
        { type: 'item' as const, id: 'gridView', label: 'Grid View' },
        { type: 'item' as const, id: 'listView', label: 'List View' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'showSidebar', label: 'Show Sidebar' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'sortByPrice', label: 'Sort by Price' },
        { type: 'item' as const, id: 'sortByRecent', label: 'Sort by Recent' },
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
        { type: 'item' as const, id: 'zooHelp', label: 'Zoo Help' },
        { type: 'item' as const, id: 'zips', label: 'Zoo Improvement Proposals (ZIPs)' },
      ],
    },
  ],
};

/**
 * Zoo dock configuration
 */
export const ZooDockConfig = {
  contextMenu: [
    { type: 'item' as const, id: 'browse', label: 'Browse Marketplace' },
    { type: 'item' as const, id: 'myCollection', label: 'My Collection' },
    { type: 'separator' as const },
    { type: 'item' as const, id: 'options', label: 'Options' },
  ],
};

/**
 * Zoo App definition for registry
 */
export const ZooApp = {
  manifest: ZooManifest,
  component: ZooWindow,
  icon: Sparkles,
  menuBar: ZooMenuBar,
  dockConfig: ZooDockConfig,
};

export default ZooWindow;
