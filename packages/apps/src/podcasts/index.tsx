import React, { useState } from 'react';
import { ZWindow } from '@z-os/ui';
import {
  Podcast,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Library,
  Search,
  Compass,
  Clock,
  ChevronRight,
  MoreHorizontal,
} from 'lucide-react';

interface PodcastsWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

interface PodcastShow {
  id: string;
  title: string;
  author: string;
  cover: string;
  episodeCount: number;
}

interface Episode {
  id: string;
  showId: string;
  title: string;
  description: string;
  duration: string;
  date: string;
  cover: string;
  showTitle: string;
  chapters?: { title: string; time: string }[];
}

const mockShows: PodcastShow[] = [
  { id: '1', title: 'Tech Talk Daily', author: 'Tech Media', cover: 'https://picsum.photos/seed/pod1/200/200', episodeCount: 245 },
  { id: '2', title: 'The AI Hour', author: 'Future Labs', cover: 'https://picsum.photos/seed/pod2/200/200', episodeCount: 89 },
  { id: '3', title: 'Startup Stories', author: 'Founders Network', cover: 'https://picsum.photos/seed/pod3/200/200', episodeCount: 156 },
  { id: '4', title: 'Code Review', author: 'Dev Community', cover: 'https://picsum.photos/seed/pod4/200/200', episodeCount: 312 },
  { id: '5', title: 'Science Weekly', author: 'Discovery Media', cover: 'https://picsum.photos/seed/pod5/200/200', episodeCount: 78 },
  { id: '6', title: 'Design Matters', author: 'Creative Hub', cover: 'https://picsum.photos/seed/pod6/200/200', episodeCount: 423 },
];

const mockEpisodes: Episode[] = [
  {
    id: 'e1',
    showId: '1',
    title: 'The Future of Quantum Computing',
    description: 'We dive deep into quantum computing advances and what they mean for everyday technology users.',
    duration: '45:32',
    date: 'Dec 24, 2024',
    cover: 'https://picsum.photos/seed/pod1/200/200',
    showTitle: 'Tech Talk Daily',
    chapters: [
      { title: 'Introduction', time: '0:00' },
      { title: 'What is Quantum Computing?', time: '3:45' },
      { title: 'Current State of the Art', time: '15:20' },
      { title: 'Future Applications', time: '28:00' },
      { title: 'Wrap Up', time: '42:15' },
    ],
  },
  {
    id: 'e2',
    showId: '2',
    title: 'GPT-5 and Beyond',
    description: 'Exploring the next generation of language models and their potential impact on society.',
    duration: '52:18',
    date: 'Dec 23, 2024',
    cover: 'https://picsum.photos/seed/pod2/200/200',
    showTitle: 'The AI Hour',
  },
  {
    id: 'e3',
    showId: '3',
    title: 'From Garage to Unicorn',
    description: 'The inspiring journey of a startup that grew from a small team to a billion-dollar company.',
    duration: '38:45',
    date: 'Dec 22, 2024',
    cover: 'https://picsum.photos/seed/pod3/200/200',
    showTitle: 'Startup Stories',
  },
  {
    id: 'e4',
    showId: '4',
    title: 'Clean Code Principles',
    description: 'Best practices for writing maintainable and readable code that stands the test of time.',
    duration: '41:20',
    date: 'Dec 21, 2024',
    cover: 'https://picsum.photos/seed/pod4/200/200',
    showTitle: 'Code Review',
  },
];

const popularPodcasts: PodcastShow[] = [
  { id: 'p1', title: 'The Daily', author: 'News Network', cover: 'https://picsum.photos/seed/popod1/200/200', episodeCount: 1245 },
  { id: 'p2', title: 'How I Built This', author: 'Business Weekly', cover: 'https://picsum.photos/seed/popod2/200/200', episodeCount: 567 },
  { id: 'p3', title: 'Criminal', author: 'True Crime Media', cover: 'https://picsum.photos/seed/popod3/200/200', episodeCount: 234 },
  { id: 'p4', title: 'Radiolab', author: 'Science Network', cover: 'https://picsum.photos/seed/popod4/200/200', episodeCount: 890 },
];

type SidebarView = 'library' | 'browse' | 'search';

const PodcastsWindow: React.FC<PodcastsWindowProps> = ({ onClose, onFocus }) => {
  const [sidebarView, setSidebarView] = useState<SidebarView>('library');
  const [selectedShow, setSelectedShow] = useState<PodcastShow | null>(null);
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentEpisode, setCurrentEpisode] = useState<Episode>(mockEpisodes[0]);
  const [progress, setProgress] = useState(25);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const showEpisodes = selectedShow
    ? mockEpisodes.filter((ep) => ep.showId === selectedShow.id)
    : mockEpisodes;

  const playEpisode = (episode: Episode) => {
    setCurrentEpisode(episode);
    setIsPlaying(true);
    setProgress(0);
  };

  const renderLibraryView = () => (
    <div className="flex-1 overflow-y-auto p-6">
      {selectedShow ? (
        // Show detail view
        <div>
          <button
            onClick={() => setSelectedShow(null)}
            className="text-white/70 hover:text-white text-sm mb-4 flex items-center gap-1 transition-colors"
          >
            Back to Library
          </button>
          <div className="flex gap-6 mb-6">
            <div className="relative">
              <img src={selectedShow.cover} alt="" className="w-32 h-32 rounded-xl shadow-2xl" />
              <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/10" />
            </div>
            <div>
              <h2 className="text-white text-2xl font-semibold">{selectedShow.title}</h2>
              <p className="text-white/60">{selectedShow.author}</p>
              <p className="text-white/40 text-sm mt-2">{selectedShow.episodeCount} episodes</p>
            </div>
          </div>
          <h3 className="text-white/90 font-medium mb-4">Episodes</h3>
          <div className="space-y-2">
            {showEpisodes.map((episode) => (
              <div
                key={episode.id}
                onClick={() => setSelectedEpisode(episode)}
                className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] backdrop-blur-sm cursor-pointer group transition-all"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    playEpisode(episode);
                  }}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Play className="w-4 h-4 text-white" />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-white/90 truncate">{episode.title}</p>
                  <p className="text-white/40 text-sm truncate">{episode.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-white/30 text-sm">{episode.date}</p>
                  <p className="text-white/30 text-sm">{episode.duration}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : selectedEpisode ? (
        // Episode detail view
        <div>
          <button
            onClick={() => setSelectedEpisode(null)}
            className="text-white/70 hover:text-white text-sm mb-4 flex items-center gap-1 transition-colors"
          >
            Back
          </button>
          <div className="flex gap-6 mb-6">
            <div className="relative">
              <img src={selectedEpisode.cover} alt="" className="w-32 h-32 rounded-xl shadow-2xl" />
              <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/10" />
            </div>
            <div>
              <p className="text-white/50 text-sm">{selectedEpisode.showTitle}</p>
              <h2 className="text-white text-2xl font-semibold">{selectedEpisode.title}</h2>
              <p className="text-white/30 text-sm mt-2">{selectedEpisode.date} - {selectedEpisode.duration}</p>
              <button
                onClick={() => playEpisode(selectedEpisode)}
                className="mt-4 px-6 py-2 bg-white/10 hover:bg-white/20 border border-white/10 text-white rounded-full flex items-center gap-2 transition-all backdrop-blur-sm"
              >
                <Play className="w-4 h-4" />
                Play Episode
              </button>
            </div>
          </div>
          <div className="mb-6 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm">
            <h3 className="text-white/90 font-medium mb-2">Show Notes</h3>
            <p className="text-white/60">{selectedEpisode.description}</p>
          </div>
          {selectedEpisode.chapters && (
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm">
              <h3 className="text-white/90 font-medium mb-3">Chapters</h3>
              <div className="space-y-1">
                {selectedEpisode.chapters.map((chapter, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-4 p-2 rounded-lg hover:bg-white/[0.05] cursor-pointer transition-colors"
                  >
                    <span className="text-white/50 text-sm w-12 font-mono">{chapter.time}</span>
                    <span className="text-white/70">{chapter.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        // Library grid
        <div>
          <h2 className="text-white text-2xl font-semibold mb-6">Your Library</h2>
          <div className="grid grid-cols-3 gap-5">
            {mockShows.map((show) => (
              <div
                key={show.id}
                onClick={() => setSelectedShow(show)}
                className="group cursor-pointer"
              >
                <div className="relative mb-3 rounded-xl overflow-hidden bg-white/[0.03] border border-white/[0.08] backdrop-blur-sm transition-all group-hover:border-white/20 group-hover:bg-white/[0.06]">
                  <img
                    src={show.cover}
                    alt=""
                    className="w-full aspect-square object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const ep = mockEpisodes.find((ep) => ep.showId === show.id);
                      if (ep) playEpisode(ep);
                    }}
                    className="absolute bottom-3 right-3 p-3 bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-xl"
                  >
                    <Play className="w-5 h-5 text-white" />
                  </button>
                </div>
                <p className="text-white/90 font-medium truncate">{show.title}</p>
                <p className="text-white/40 text-sm truncate">{show.author}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderBrowseView = () => (
    <div className="flex-1 overflow-y-auto p-6">
      <h2 className="text-white text-2xl font-semibold mb-6">Browse</h2>
      <h3 className="text-white/60 font-medium mb-3">Popular Podcasts</h3>
      <div className="grid grid-cols-2 gap-3 mb-8">
        {popularPodcasts.map((show) => (
          <div
            key={show.id}
            className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] backdrop-blur-sm cursor-pointer group transition-all"
          >
            <div className="relative">
              <img src={show.cover} alt="" className="w-16 h-16 rounded-lg" />
              <div className="absolute inset-0 rounded-lg ring-1 ring-inset ring-white/10" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white/90 font-medium truncate">{show.title}</p>
              <p className="text-white/40 text-sm truncate">{show.author}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-white/50 transition-colors" />
          </div>
        ))}
      </div>
      <h3 className="text-white/60 font-medium mb-3">Categories</h3>
      <div className="grid grid-cols-3 gap-3">
        {['Technology', 'Business', 'Science', 'Arts', 'Sports', 'News', 'Comedy', 'Education', 'Health'].map((cat) => (
          <button
            key={cat}
            className="p-4 bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] rounded-xl text-white/80 hover:text-white transition-all backdrop-blur-sm"
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );

  const renderSearchView = () => (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search podcasts..."
          className="w-full pl-12 pr-4 py-3 bg-white/[0.05] border border-white/[0.08] rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-white/20 focus:bg-white/[0.08] backdrop-blur-sm transition-all"
        />
      </div>
      {searchQuery ? (
        <div className="space-y-2">
          {[...mockShows, ...popularPodcasts]
            .filter((s) => s.title.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((show) => (
              <div
                key={show.id}
                className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] backdrop-blur-sm cursor-pointer transition-all"
              >
                <div className="relative">
                  <img src={show.cover} alt="" className="w-12 h-12 rounded-lg" />
                  <div className="absolute inset-0 rounded-lg ring-1 ring-inset ring-white/10" />
                </div>
                <div>
                  <p className="text-white/90">{show.title}</p>
                  <p className="text-white/40 text-sm">{show.author}</p>
                </div>
              </div>
            ))}
        </div>
      ) : (
        <div className="text-center text-white/30 mt-16">
          <Search className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p>Search for podcasts, episodes, or topics</p>
        </div>
      )}
    </div>
  );

  return (
    <ZWindow
      title="Podcasts"
      onClose={onClose}
      onFocus={onFocus}
      initialPosition={{ x: 160, y: 100 }}
      initialSize={{ width: 900, height: 650 }}
      windowType="system"
    >
      <div className="flex flex-col h-full bg-black/80 backdrop-blur-2xl">
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-56 bg-white/[0.02] border-r border-white/[0.06] flex flex-col p-4 backdrop-blur-xl">
            <h3 className="text-white/30 text-xs uppercase tracking-wider mb-3 px-3">Menu</h3>
            <button
              onClick={() => { setSidebarView('library'); setSelectedShow(null); setSelectedEpisode(null); }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                sidebarView === 'library' 
                  ? 'bg-white/10 text-white border border-white/10' 
                  : 'text-white/60 hover:bg-white/[0.05] hover:text-white/80'
              }`}
            >
              <Library className="w-4 h-4" />
              Library
            </button>
            <button
              onClick={() => setSidebarView('browse')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                sidebarView === 'browse' 
                  ? 'bg-white/10 text-white border border-white/10' 
                  : 'text-white/60 hover:bg-white/[0.05] hover:text-white/80'
              }`}
            >
              <Compass className="w-4 h-4" />
              Browse
            </button>
            <button
              onClick={() => setSidebarView('search')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                sidebarView === 'search' 
                  ? 'bg-white/10 text-white border border-white/10' 
                  : 'text-white/60 hover:bg-white/[0.05] hover:text-white/80'
              }`}
            >
              <Search className="w-4 h-4" />
              Search
            </button>

            <h3 className="text-white/30 text-xs uppercase tracking-wider mt-8 mb-3 px-3">Recently Played</h3>
            {mockEpisodes.slice(0, 3).map((ep) => (
              <button
                key={ep.id}
                onClick={() => playEpisode(ep)}
                className="flex items-center gap-2 px-3 py-2 text-left text-white/50 hover:bg-white/[0.05] hover:text-white/70 rounded-lg text-sm transition-all"
              >
                <Clock className="w-4 h-4 flex-shrink-0 opacity-50" />
                <span className="truncate">{ep.title}</span>
              </button>
            ))}
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-hidden">
            {sidebarView === 'library' && renderLibraryView()}
            {sidebarView === 'browse' && renderBrowseView()}
            {sidebarView === 'search' && renderSearchView()}
          </div>
        </div>

        {/* Now Playing Bar */}
        <div className="h-20 bg-white/[0.03] border-t border-white/[0.08] backdrop-blur-xl flex items-center px-4 gap-4">
          {/* Episode Info */}
          <div className="flex items-center gap-3 w-64">
            <div className="relative">
              <img src={currentEpisode.cover} alt="" className="w-12 h-12 rounded-lg shadow-xl" />
              <div className="absolute inset-0 rounded-lg ring-1 ring-inset ring-white/10" />
            </div>
            <div className="min-w-0">
              <p className="text-white/90 font-medium truncate text-sm">{currentEpisode.title}</p>
              <p className="text-white/40 text-xs truncate">{currentEpisode.showTitle}</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex-1 flex flex-col items-center gap-2">
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-white/[0.08] rounded-full transition-colors">
                <SkipBack className="w-5 h-5 text-white/70" />
              </button>
              <span className="text-white/30 text-xs font-mono">15s</span>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full transition-all backdrop-blur-sm"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 text-white" />
                ) : (
                  <Play className="w-5 h-5 text-white ml-0.5" />
                )}
              </button>
              <span className="text-white/30 text-xs font-mono">30s</span>
              <button className="p-2 hover:bg-white/[0.08] rounded-full transition-colors">
                <SkipForward className="w-5 h-5 text-white/70" />
              </button>
            </div>
            <div className="flex items-center gap-3 w-full max-w-md">
              <span className="text-white/40 text-xs w-10 text-right font-mono">11:23</span>
              <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden cursor-pointer group">
                <div
                  className="h-full bg-white/40 group-hover:bg-white/60 rounded-full transition-colors"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-white/40 text-xs w-10 font-mono">{currentEpisode.duration}</span>
            </div>
          </div>

          {/* Playback Speed */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPlaybackSpeed(playbackSpeed === 2 ? 0.5 : playbackSpeed + 0.5)}
              className="px-3 py-1.5 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] rounded-lg text-white/70 hover:text-white text-sm transition-all backdrop-blur-sm font-mono"
            >
              {playbackSpeed}x
            </button>
            <button className="p-2 hover:bg-white/[0.08] rounded-full transition-colors">
              <MoreHorizontal className="w-5 h-5 text-white/40" />
            </button>
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
 * Podcasts app manifest
 */
export const PodcastsManifest = {
  identifier: 'ai.hanzo.podcasts',
  name: 'Podcasts',
  version: '1.0.0',
  description: 'Podcast player for zOS',
  category: 'media' as const,
  permissions: ['storage', 'audio'] as const,
  window: {
    type: 'system' as const,
    defaultSize: { width: 900, height: 650 },
    resizable: true,
    showInDock: true,
  },
};

/**
 * Podcasts menu bar configuration
 */
export const PodcastsMenuBar = {
  menus: [
    {
      id: 'file',
      label: 'File',
      items: [
        { type: 'item' as const, id: 'subscribe', label: 'Subscribe to Podcast...', shortcut: '⌘N' },
        { type: 'item' as const, id: 'importOpml', label: 'Import OPML...' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'refresh', label: 'Refresh All', shortcut: '⌘R' },
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
      ],
    },
    {
      id: 'controls',
      label: 'Controls',
      items: [
        { type: 'item' as const, id: 'play', label: 'Play/Pause', shortcut: 'Space' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'skipBack', label: 'Skip Back 15 Seconds', shortcut: '⌘←' },
        { type: 'item' as const, id: 'skipForward', label: 'Skip Forward 30 Seconds', shortcut: '⌘→' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'speedUp', label: 'Increase Speed' },
        { type: 'item' as const, id: 'speedDown', label: 'Decrease Speed' },
      ],
    },
    {
      id: 'view',
      label: 'View',
      items: [
        { type: 'item' as const, id: 'showLibrary', label: 'Library', shortcut: '⌘1' },
        { type: 'item' as const, id: 'showBrowse', label: 'Browse', shortcut: '⌘2' },
        { type: 'item' as const, id: 'showSearch', label: 'Search', shortcut: '⌘3' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'showSidebar', label: 'Show Sidebar' },
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
        { type: 'item' as const, id: 'podcastsHelp', label: 'Podcasts Help' },
      ],
    },
  ],
};

/**
 * Podcasts dock configuration
 */
export const PodcastsDockConfig = {
  contextMenu: [
    { type: 'item' as const, id: 'play', label: 'Play/Pause' },
    { type: 'item' as const, id: 'skipBack', label: 'Skip Back 15s' },
    { type: 'item' as const, id: 'skipForward', label: 'Skip Forward 30s' },
    { type: 'separator' as const },
    { type: 'item' as const, id: 'options', label: 'Options' },
  ],
};

/**
 * Podcasts App definition for registry
 */
export const PodcastsApp = {
  manifest: PodcastsManifest,
  component: PodcastsWindow,
  icon: Podcast,
  menuBar: PodcastsMenuBar,
  dockConfig: PodcastsDockConfig,
};

export default PodcastsWindow;
