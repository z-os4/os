/**
 * Font Book App
 *
 * Font manager for zOS with unified black glass UI.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ZWindow } from '@z-os/ui';
import {
  Type,
  Star,
  Clock,
  FolderOpen,
  Plus,
  Search,
  Grid,
  List,
  ChevronRight,
  Trash2,
  Info,
  X,
} from 'lucide-react';

interface FontBookWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

interface FontInfo {
  family: string;
  fullName: string;
  style: string;
  weight: string;
  loaded: boolean;
}

interface Collection {
  id: string;
  name: string;
  fonts: string[];
}

const PREVIEW_SIZES = [12, 18, 24, 36, 48, 72, 96];
const STORAGE_KEY = 'zos-fontbook';

const FontBookWindow: React.FC<FontBookWindowProps> = ({ onClose, onFocus }) => {
  const [fonts, setFonts] = useState<FontInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFont, setSelectedFont] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [previewText, setPreviewText] = useState('The quick brown fox jumps over the lazy dog.');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [activeSection, setActiveSection] = useState<'all' | 'favorites' | 'recent' | string>('all');
  const [showCharMap, setShowCharMap] = useState(false);

  // Persisted state
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.favorites || [];
      }
    } catch (e) {
      console.error('Failed to load favorites:', e);
    }
    return [];
  });

  const [recentFonts, setRecentFonts] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.recent || [];
      }
    } catch (e) {
      console.error('Failed to load recent fonts:', e);
    }
    return [];
  });

  const [collections, setCollections] = useState<Collection[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.collections || [];
      }
    } catch (e) {
      console.error('Failed to load collections:', e);
    }
    return [];
  });

  // Persist state
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ favorites, recent: recentFonts, collections })
      );
    } catch (e) {
      console.error('Failed to save font book state:', e);
    }
  }, [favorites, recentFonts, collections]);

  // Load system fonts using document.fonts API
  useEffect(() => {
    const loadFonts = async () => {
      setLoading(true);

      // Wait for fonts to be ready
      await document.fonts.ready;

      const fontSet = new Set<string>();
      const fontList: FontInfo[] = [];

      // Get all font faces from document.fonts
      document.fonts.forEach(font => {
        const family = font.family.replace(/["']/g, '');
        if (!fontSet.has(family)) {
          fontSet.add(family);
          fontList.push({
            family,
            fullName: family,
            style: font.style,
            weight: font.weight,
            loaded: font.status === 'loaded',
          });
        }
      });

      // Add common web-safe fonts that might not be in document.fonts
      const webSafeFonts = [
        'Arial', 'Arial Black', 'Comic Sans MS', 'Courier New', 'Georgia',
        'Impact', 'Lucida Console', 'Lucida Sans Unicode', 'Palatino Linotype',
        'Tahoma', 'Times New Roman', 'Trebuchet MS', 'Verdana',
        'system-ui', 'ui-serif', 'ui-sans-serif', 'ui-monospace',
        'SF Pro', 'SF Pro Display', 'SF Pro Text', 'SF Mono',
        'Helvetica', 'Helvetica Neue', 'Monaco', 'Menlo', 'Consolas',
      ];

      webSafeFonts.forEach(family => {
        if (!fontSet.has(family)) {
          fontSet.add(family);
          fontList.push({
            family,
            fullName: family,
            style: 'normal',
            weight: 'normal',
            loaded: true,
          });
        }
      });

      // Sort alphabetically
      fontList.sort((a, b) => a.family.localeCompare(b.family));

      setFonts(fontList);
      setLoading(false);

      // Auto-select first font
      if (fontList.length > 0 && !selectedFont) {
        setSelectedFont(fontList[0].family);
      }
    };

    loadFonts();
  }, [selectedFont]);

  // Track recently viewed fonts
  const handleFontSelect = useCallback((family: string) => {
    setSelectedFont(family);
    setRecentFonts(prev => {
      const filtered = prev.filter(f => f !== family);
      return [family, ...filtered].slice(0, 20);
    });
  }, []);

  // Toggle favorite
  const toggleFavorite = useCallback((family: string) => {
    setFavorites(prev =>
      prev.includes(family) ? prev.filter(f => f !== family) : [...prev, family]
    );
  }, []);

  // Collection management
  const createCollection = () => {
    const name = prompt('Enter collection name:');
    if (name) {
      const newCollection: Collection = {
        id: Date.now().toString(),
        name,
        fonts: [],
      };
      setCollections(prev => [...prev, newCollection]);
      setActiveSection(newCollection.id);
    }
  };

  const deleteCollection = (id: string) => {
    setCollections(prev => prev.filter(c => c.id !== id));
    if (activeSection === id) {
      setActiveSection('all');
    }
  };

  const addToCollection = (collectionId: string, fontFamily: string) => {
    setCollections(prev =>
      prev.map(c =>
        c.id === collectionId && !c.fonts.includes(fontFamily)
          ? { ...c, fonts: [...c.fonts, fontFamily] }
          : c
      )
    );
  };

  const removeFromCollection = (collectionId: string, fontFamily: string) => {
    setCollections(prev =>
      prev.map(c =>
        c.id === collectionId ? { ...c, fonts: c.fonts.filter(f => f !== fontFamily) } : c
      )
    );
  };

  // Filter fonts based on active section and search
  const filteredFonts = fonts.filter(font => {
    // Search filter
    if (searchQuery && !font.family.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Section filter
    switch (activeSection) {
      case 'all':
        return true;
      case 'favorites':
        return favorites.includes(font.family);
      case 'recent':
        return recentFonts.includes(font.family);
      default:
        const collection = collections.find(c => c.id === activeSection);
        return collection?.fonts.includes(font.family) || false;
    }
  });

  // Character map characters
  const charMapChars = [
    // Uppercase
    ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
    // Lowercase
    ...'abcdefghijklmnopqrstuvwxyz'.split(''),
    // Numbers
    ...'0123456789'.split(''),
    // Punctuation
    ...'!@#$%^&*()_+-=[]{}|;\':",.<>?/`~'.split(''),
    // Special
    ...'¡¢£¤¥¦§¨©ª«¬®¯°±²³´µ¶·¸¹º»¼½¾¿'.split(''),
  ];

  const selectedFontInfo = fonts.find(f => f.family === selectedFont);

  return (
    <ZWindow
      title="Font Book"
      onClose={onClose}
      onFocus={onFocus}
      initialPosition={{ x: 120, y: 70 }}
      initialSize={{ width: 900, height: 600 }}
      windowType="system"
    >
      <div className="flex h-full bg-black/80 backdrop-blur-xl">
        {/* Sidebar - Glass Panel */}
        <div className="w-52 border-r border-white/[0.08] flex flex-col bg-white/[0.03] backdrop-blur-2xl">
          {/* Search */}
          <div className="p-3 border-b border-white/[0.08]">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search fonts..."
                className="w-full pl-8 pr-3 py-1.5 bg-white/[0.06] border border-white/[0.08] rounded-md text-white/90 text-sm placeholder:text-white/30 outline-none focus:border-white/20 focus:bg-white/[0.08] transition-all"
              />
            </div>
          </div>

          {/* Sections */}
          <div className="flex-1 overflow-y-auto p-2">
            <div className="mb-4">
              <h3 className="text-white/40 text-[10px] font-medium uppercase tracking-wider px-2 py-1.5">Library</h3>
              <button
                onClick={() => setActiveSection('all')}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm transition-all ${
                  activeSection === 'all' 
                    ? 'bg-white/[0.12] text-white shadow-sm' 
                    : 'text-white/70 hover:bg-white/[0.06] hover:text-white/90'
                }`}
              >
                <Type className="w-4 h-4 opacity-70" />
                All Fonts
                <span className="ml-auto text-[11px] text-white/40 tabular-nums">{fonts.length}</span>
              </button>
              <button
                onClick={() => setActiveSection('favorites')}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm transition-all ${
                  activeSection === 'favorites' 
                    ? 'bg-white/[0.12] text-white shadow-sm' 
                    : 'text-white/70 hover:bg-white/[0.06] hover:text-white/90'
                }`}
              >
                <Star className="w-4 h-4 opacity-70" />
                Favorites
                <span className="ml-auto text-[11px] text-white/40 tabular-nums">{favorites.length}</span>
              </button>
              <button
                onClick={() => setActiveSection('recent')}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm transition-all ${
                  activeSection === 'recent' 
                    ? 'bg-white/[0.12] text-white shadow-sm' 
                    : 'text-white/70 hover:bg-white/[0.06] hover:text-white/90'
                }`}
              >
                <Clock className="w-4 h-4 opacity-70" />
                Recently Added
                <span className="ml-auto text-[11px] text-white/40 tabular-nums">{recentFonts.length}</span>
              </button>
            </div>

            <div>
              <div className="flex items-center justify-between px-2 py-1.5">
                <h3 className="text-white/40 text-[10px] font-medium uppercase tracking-wider">Collections</h3>
                <button
                  onClick={createCollection}
                  className="p-1 hover:bg-white/[0.08] rounded transition-colors"
                  title="New Collection"
                >
                  <Plus className="w-3.5 h-3.5 text-white/50" />
                </button>
              </div>
              {collections.map(collection => (
                <div
                  key={collection.id}
                  className={`group flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm cursor-pointer transition-all ${
                    activeSection === collection.id 
                      ? 'bg-white/[0.12] text-white shadow-sm' 
                      : 'text-white/70 hover:bg-white/[0.06] hover:text-white/90'
                  }`}
                  onClick={() => setActiveSection(collection.id)}
                >
                  <FolderOpen className="w-4 h-4 opacity-70" />
                  <span className="flex-1 truncate">{collection.name}</span>
                  <span className="text-[11px] text-white/40 tabular-nums">{collection.fonts.length}</span>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      deleteCollection(collection.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-white/10 rounded transition-opacity"
                  >
                    <Trash2 className="w-3 h-3 text-white/50" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Font List - Glass Panel */}
        <div className="w-64 border-r border-white/[0.08] flex flex-col bg-white/[0.02]">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-white/[0.08]">
            <span className="text-white/50 text-xs tabular-nums">{filteredFonts.length} fonts</span>
            <div className="flex items-center gap-0.5 bg-white/[0.04] rounded-md p-0.5">
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded transition-all ${
                  viewMode === 'list' ? 'bg-white/[0.12] text-white shadow-sm' : 'text-white/50 hover:text-white/70'
                }`}
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded transition-all ${
                  viewMode === 'grid' ? 'bg-white/[0.12] text-white shadow-sm' : 'text-white/50 hover:text-white/70'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Font List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-full text-white/40 text-sm">
                Loading fonts...
              </div>
            ) : filteredFonts.length === 0 ? (
              <div className="flex items-center justify-center h-full text-white/40 text-sm">
                No fonts found
              </div>
            ) : viewMode === 'list' ? (
              <div>
                {filteredFonts.map(font => (
                  <div
                    key={font.family}
                    onClick={() => handleFontSelect(font.family)}
                    className={`group flex items-center gap-2 px-3 py-2 cursor-pointer border-b border-white/[0.04] transition-all ${
                      selectedFont === font.family 
                        ? 'bg-white/[0.10]' 
                        : 'hover:bg-white/[0.05]'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-white/90 text-sm truncate"
                        style={{ fontFamily: `"${font.family}", system-ui` }}
                      >
                        {font.family}
                      </p>
                    </div>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        toggleFavorite(font.family);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded transition-all"
                    >
                      <Star
                        className={`w-3 h-3 ${
                          favorites.includes(font.family)
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-white/40'
                        }`}
                      />
                    </button>
                    <ChevronRight className="w-3.5 h-3.5 text-white/20" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 p-2">
                {filteredFonts.map(font => (
                  <div
                    key={font.family}
                    onClick={() => handleFontSelect(font.family)}
                    className={`p-3 rounded-lg cursor-pointer transition-all border ${
                      selectedFont === font.family 
                        ? 'bg-white/[0.10] border-white/[0.15]' 
                        : 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.10]'
                    }`}
                  >
                    <p
                      className="text-white/90 text-xl truncate text-center"
                      style={{ fontFamily: `"${font.family}", system-ui` }}
                    >
                      Aa
                    </p>
                    <p className="text-white/40 text-[10px] truncate text-center mt-1.5">{font.family}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Preview Pane - Main Glass Panel */}
        <div className="flex-1 flex flex-col bg-white/[0.01]">
          {selectedFont ? (
            <>
              {/* Preview Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.08] bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <h2 className="text-white font-medium text-base">{selectedFont}</h2>
                  <button
                    onClick={() => toggleFavorite(selectedFont)}
                    className="p-1.5 hover:bg-white/[0.08] rounded-md transition-colors"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        favorites.includes(selectedFont)
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-white/40'
                      }`}
                    />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowCharMap(!showCharMap)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all border ${
                      showCharMap 
                        ? 'bg-white/[0.12] border-white/[0.15] text-white' 
                        : 'border-white/[0.08] text-white/60 hover:bg-white/[0.06] hover:text-white/80'
                    }`}
                  >
                    Character Map
                  </button>
                  <button
                    className="p-1.5 hover:bg-white/[0.08] rounded-md transition-colors"
                    title="Font Info"
                  >
                    <Info className="w-4 h-4 text-white/40" />
                  </button>
                </div>
              </div>

              {/* Sample Text Input */}
              <div className="px-4 py-3 border-b border-white/[0.08]">
                <input
                  type="text"
                  value={previewText}
                  onChange={e => setPreviewText(e.target.value)}
                  className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-md text-white/90 text-sm placeholder:text-white/30 outline-none focus:border-white/20 focus:bg-white/[0.06] transition-all"
                  placeholder="Enter sample text..."
                />
              </div>

              {/* Font Previews */}
              <div className="flex-1 overflow-y-auto px-4 py-5">
                {showCharMap ? (
                  <div>
                    <h3 className="text-white/50 text-xs font-medium uppercase tracking-wider mb-4">Character Map</h3>
                    <div
                      className="grid gap-1.5"
                      style={{
                        gridTemplateColumns: 'repeat(auto-fill, minmax(42px, 1fr))',
                      }}
                    >
                      {charMapChars.map((char, i) => (
                        <div
                          key={i}
                          className="aspect-square flex items-center justify-center bg-white/[0.04] border border-white/[0.06] rounded-md text-white/90 text-lg hover:bg-white/[0.08] hover:border-white/[0.12] cursor-pointer transition-all"
                          style={{ fontFamily: `"${selectedFont}", system-ui` }}
                          title={`U+${char.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')}`}
                        >
                          {char}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {PREVIEW_SIZES.map(size => (
                      <div key={size} className="group">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-white/30 text-[10px] font-medium uppercase tracking-wider">{size}px</span>
                          <div className="flex-1 h-px bg-white/[0.06]" />
                        </div>
                        <p
                          className="text-white/90 break-words leading-relaxed"
                          style={{
                            fontFamily: `"${selectedFont}", system-ui`,
                            fontSize: `${size}px`,
                            lineHeight: 1.4,
                          }}
                        >
                          {previewText}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Font Info - Glass Footer */}
              <div className="px-4 py-3 border-t border-white/[0.08] bg-white/[0.03]">
                <div className="grid grid-cols-4 gap-6 text-sm">
                  <div>
                    <span className="text-white/40 text-[10px] font-medium uppercase tracking-wider">Name</span>
                    <p className="text-white/90 truncate mt-0.5">{selectedFontInfo?.fullName || selectedFont}</p>
                  </div>
                  <div>
                    <span className="text-white/40 text-[10px] font-medium uppercase tracking-wider">Family</span>
                    <p className="text-white/90 truncate mt-0.5">{selectedFont}</p>
                  </div>
                  <div>
                    <span className="text-white/40 text-[10px] font-medium uppercase tracking-wider">Style</span>
                    <p className="text-white/90 capitalize mt-0.5">{selectedFontInfo?.style || 'Normal'}</p>
                  </div>
                  <div>
                    <span className="text-white/40 text-[10px] font-medium uppercase tracking-wider">Weight</span>
                    <p className="text-white/90 mt-0.5">{selectedFontInfo?.weight || 'Normal'}</p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-white/30">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                  <Type className="w-8 h-8 opacity-50" />
                </div>
                <p className="text-sm">Select a font to preview</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </ZWindow>
  );
};

// ============================================================================
// App Definition
// ============================================================================

/**
 * Font Book app manifest
 */
export const FontBookManifest = {
  identifier: 'ai.hanzo.fontbook',
  name: 'Font Book',
  version: '1.0.0',
  description: 'Font manager for zOS',
  category: 'utilities' as const,
  permissions: ['storage'] as const,
  window: {
    type: 'system' as const,
    defaultSize: { width: 900, height: 600 },
    resizable: true,
    showInDock: true,
  },
};

/**
 * Font Book menu bar configuration
 */
export const FontBookMenuBar = {
  menus: [
    {
      id: 'file',
      label: 'File',
      items: [
        { type: 'item' as const, id: 'addFonts', label: 'Add Fonts...', shortcut: '⌘O' },
        { type: 'item' as const, id: 'newCollection', label: 'New Collection', shortcut: '⌘N' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'close', label: 'Close', shortcut: '⌘W' },
      ],
    },
    {
      id: 'edit',
      label: 'Edit',
      items: [
        { type: 'item' as const, id: 'copy', label: 'Copy', shortcut: '⌘C' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'find', label: 'Find...', shortcut: '⌘F' },
        { type: 'item' as const, id: 'selectAll', label: 'Select All', shortcut: '⌘A' },
      ],
    },
    {
      id: 'view',
      label: 'View',
      items: [
        { type: 'item' as const, id: 'listView', label: 'as List' },
        { type: 'item' as const, id: 'gridView', label: 'as Grid' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'showCharMap', label: 'Show Character Map' },
        { type: 'item' as const, id: 'showFontInfo', label: 'Show Font Info' },
      ],
    },
    {
      id: 'preview',
      label: 'Preview',
      items: [
        { type: 'item' as const, id: 'increaseSample', label: 'Increase Sample Size', shortcut: '⌘+' },
        { type: 'item' as const, id: 'decreaseSample', label: 'Decrease Sample Size', shortcut: '⌘-' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'customSample', label: 'Custom Sample Text...' },
        { type: 'item' as const, id: 'resetSample', label: 'Reset Sample Text' },
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
        { type: 'item' as const, id: 'fontBookHelp', label: 'Font Book Help' },
      ],
    },
  ],
};

/**
 * Font Book dock configuration
 */
export const FontBookDockConfig = {
  contextMenu: [
    { type: 'item' as const, id: 'addFonts', label: 'Add Fonts...' },
    { type: 'item' as const, id: 'newCollection', label: 'New Collection' },
    { type: 'separator' as const },
    { type: 'item' as const, id: 'options', label: 'Options' },
  ],
};

/**
 * Font Book App definition for registry
 */
export const FontBookApp = {
  manifest: FontBookManifest,
  component: FontBookWindow,
  icon: Type,
  menuBar: FontBookMenuBar,
  dockConfig: FontBookDockConfig,
};

export default FontBookWindow;
