import React, { useState } from 'react';
import { ZWindow } from '@z-os/ui';
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Volume2, ListMusic, Heart, MoreHorizontal, Music } from 'lucide-react';

interface MusicWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  cover: string;
}

const mockTracks: Track[] = [
  { id: '1', title: 'Digital Dreams', artist: 'Synthwave', album: 'Neon Nights', duration: '3:45', cover: 'https://picsum.photos/seed/music1/100/100' },
  { id: '2', title: 'Midnight Run', artist: 'Retrowave', album: 'City Lights', duration: '4:12', cover: 'https://picsum.photos/seed/music2/100/100' },
  { id: '3', title: 'Electric Sunrise', artist: 'Synthwave', album: 'Neon Nights', duration: '5:01', cover: 'https://picsum.photos/seed/music3/100/100' },
  { id: '4', title: 'Chrome Heart', artist: 'Outrun', album: 'Speed', duration: '3:33', cover: 'https://picsum.photos/seed/music4/100/100' },
  { id: '5', title: 'Laser Night', artist: 'Retrowave', album: 'City Lights', duration: '4:22', cover: 'https://picsum.photos/seed/music5/100/100' },
];

const playlists = ['Recently Added', 'Top 25 Most Played', 'Favorites', 'Synthwave Mix', 'Study Focus'];

const MusicWindow: React.FC<MusicWindowProps> = ({ onClose, onFocus }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track>(mockTracks[0]);
  const [progress, setProgress] = useState(35);
  const [volume, setVolume] = useState(75);

  return (
    <ZWindow
      title="Music"
      onClose={onClose}
      onFocus={onFocus}
      initialPosition={{ x: 140, y: 80 }}
      initialSize={{ width: 900, height: 600 }}
      windowType="system"
    >
      <div className="flex flex-col h-full bg-black/80 backdrop-blur-2xl">
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar - Glass panel */}
          <div className="w-56 bg-white/[0.03] backdrop-blur-xl border-r border-white/[0.08] flex flex-col p-4">
            <h3 className="text-white/50 text-[11px] font-medium uppercase tracking-wider mb-3 px-3">Library</h3>
            {['Recently Added', 'Artists', 'Albums', 'Songs', 'Genres'].map((item) => (
              <button
                key={item}
                className="text-left px-3 py-2 text-white/80 hover:bg-white/[0.06] active:bg-white/[0.08] rounded-md text-[13px] transition-all duration-150"
              >
                {item}
              </button>
            ))}

            <h3 className="text-white/50 text-[11px] font-medium uppercase tracking-wider mt-8 mb-3 px-3">Playlists</h3>
            {playlists.map((playlist) => (
              <button
                key={playlist}
                className="text-left px-3 py-2 text-white/80 hover:bg-white/[0.06] active:bg-white/[0.08] rounded-md text-[13px] transition-all duration-150 flex items-center gap-2.5"
              >
                <ListMusic className="w-4 h-4 text-white/50" />
                {playlist}
              </button>
            ))}
          </div>

          {/* Main Content - Glass background */}
          <div className="flex-1 flex flex-col overflow-hidden bg-white/[0.02]">
            {/* Track List */}
            <div className="flex-1 overflow-y-auto p-6">
              <h2 className="text-white text-2xl font-semibold mb-6 tracking-tight">Recently Added</h2>
              <div className="space-y-0.5">
                {mockTracks.map((track, index) => (
                  <div
                    key={track.id}
                    onClick={() => {
                      setCurrentTrack(track);
                      setIsPlaying(true);
                    }}
                    className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer group transition-all duration-150 ${
                      currentTrack.id === track.id 
                        ? 'bg-white/[0.08] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]' 
                        : 'hover:bg-white/[0.04]'
                    }`}
                  >
                    <span className="w-6 text-white/40 text-sm text-center font-medium group-hover:hidden">
                      {index + 1}
                    </span>
                    <Play className="w-4 h-4 text-white hidden group-hover:block" />
                    <img src={track.cover} alt="" className="w-11 h-11 rounded-md shadow-lg shadow-black/30" />
                    <div className="flex-1 min-w-0">
                      <p className={`truncate font-medium ${currentTrack.id === track.id ? 'text-white' : 'text-white/90'}`}>
                        {track.title}
                      </p>
                      <p className="text-white/50 text-sm truncate">{track.artist}</p>
                    </div>
                    <p className="text-white/40 text-sm">{track.album}</p>
                    <button className="opacity-0 group-hover:opacity-100 p-2 hover:bg-white/[0.08] rounded-full transition-all duration-150">
                      <Heart className="w-4 h-4 text-white/60" />
                    </button>
                    <p className="text-white/40 text-sm w-12 text-right tabular-nums">{track.duration}</p>
                    <button className="opacity-0 group-hover:opacity-100 p-2 hover:bg-white/[0.08] rounded-full transition-all duration-150">
                      <MoreHorizontal className="w-4 h-4 text-white/60" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Player Bar - Glass morphism */}
        <div className="h-24 bg-white/[0.04] backdrop-blur-2xl border-t border-white/[0.08] flex items-center px-5 gap-6">
          {/* Current Track Info */}
          <div className="flex items-center gap-4 w-64">
            <img 
              src={currentTrack.cover} 
              alt="" 
              className="w-14 h-14 rounded-lg shadow-xl shadow-black/40" 
            />
            <div className="min-w-0">
              <p className="text-white font-medium truncate text-[15px]">{currentTrack.title}</p>
              <p className="text-white/50 text-sm truncate">{currentTrack.artist}</p>
            </div>
            <button className="p-2 hover:bg-white/[0.08] rounded-full transition-all duration-150">
              <Heart className="w-4 h-4 text-white/50 hover:text-white/80" />
            </button>
          </div>

          {/* Controls - Glass buttons */}
          <div className="flex-1 flex flex-col items-center gap-2">
            <div className="flex items-center gap-5">
              <button className="p-2 hover:bg-white/[0.08] rounded-full transition-all duration-150">
                <Shuffle className="w-4 h-4 text-white/50 hover:text-white/80" />
              </button>
              <button className="p-2 hover:bg-white/[0.08] rounded-full transition-all duration-150">
                <SkipBack className="w-5 h-5 text-white/80 hover:text-white" />
              </button>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-3.5 bg-white/[0.12] backdrop-blur-xl rounded-full hover:bg-white/[0.18] transition-all duration-150 shadow-lg shadow-black/20 border border-white/[0.1]"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 text-white" />
                ) : (
                  <Play className="w-5 h-5 text-white ml-0.5" />
                )}
              </button>
              <button className="p-2 hover:bg-white/[0.08] rounded-full transition-all duration-150">
                <SkipForward className="w-5 h-5 text-white/80 hover:text-white" />
              </button>
              <button className="p-2 hover:bg-white/[0.08] rounded-full transition-all duration-150">
                <Repeat className="w-4 h-4 text-white/50 hover:text-white/80" />
              </button>
            </div>
            <div className="flex items-center gap-3 w-full max-w-md">
              <span className="text-white/50 text-xs w-10 text-right tabular-nums">1:18</span>
              <div className="flex-1 h-1 bg-white/[0.12] rounded-full overflow-hidden group cursor-pointer">
                <div
                  className="h-full bg-white/60 group-hover:bg-white/80 rounded-full transition-colors duration-150"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-white/50 text-xs w-10 tabular-nums">{currentTrack.duration}</span>
            </div>
          </div>

          {/* Volume - Glass slider */}
          <div className="flex items-center gap-2.5 w-36">
            <Volume2 className="w-4 h-4 text-white/50" />
            <div className="flex-1 h-1 bg-white/[0.12] rounded-full overflow-hidden group cursor-pointer">
              <div
                className="h-full bg-white/60 group-hover:bg-white/80 rounded-full transition-colors duration-150"
                style={{ width: `${volume}%` }}
              />
            </div>
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
 * Music app manifest
 */
export const MusicManifest = {
  identifier: 'ai.hanzo.music',
  name: 'Music',
  version: '1.0.0',
  description: 'Music player for zOS',
  category: 'media' as const,
  permissions: ['storage', 'audio'] as const,
  window: {
    type: 'system' as const,
    defaultSize: { width: 900, height: 600 },
    resizable: true,
    showInDock: true,
  },
};

/**
 * Music menu bar configuration
 */
export const MusicMenuBar = {
  menus: [
    {
      id: 'file',
      label: 'File',
      items: [
        { type: 'item' as const, id: 'newPlaylist', label: 'New Playlist', shortcut: '⌘N' },
        { type: 'item' as const, id: 'import', label: 'Import...', shortcut: '⌘O' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'addToLibrary', label: 'Add to Library...' },
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
      ],
    },
    {
      id: 'controls',
      label: 'Controls',
      items: [
        { type: 'item' as const, id: 'play', label: 'Play', shortcut: 'Space' },
        { type: 'item' as const, id: 'next', label: 'Next', shortcut: '⌘→' },
        { type: 'item' as const, id: 'previous', label: 'Previous', shortcut: '⌘←' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'shuffle', label: 'Shuffle', shortcut: '⌘S' },
        { type: 'item' as const, id: 'repeat', label: 'Repeat', shortcut: '⌘R' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'volumeUp', label: 'Volume Up', shortcut: '⌘↑' },
        { type: 'item' as const, id: 'volumeDown', label: 'Volume Down', shortcut: '⌘↓' },
      ],
    },
    {
      id: 'view',
      label: 'View',
      items: [
        { type: 'item' as const, id: 'showSidebar', label: 'Show Sidebar' },
        { type: 'item' as const, id: 'showMiniPlayer', label: 'Show Mini Player', shortcut: '⌘⇧M' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'showLyrics', label: 'Show Lyrics' },
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
        { type: 'item' as const, id: 'musicHelp', label: 'Music Help' },
      ],
    },
  ],
};

/**
 * Music dock configuration
 */
export const MusicDockConfig = {
  contextMenu: [
    { type: 'item' as const, id: 'play', label: 'Play' },
    { type: 'item' as const, id: 'next', label: 'Next' },
    { type: 'item' as const, id: 'previous', label: 'Previous' },
    { type: 'separator' as const },
    { type: 'item' as const, id: 'options', label: 'Options' },
  ],
};

/**
 * Music App definition for registry
 */
export const MusicApp = {
  manifest: MusicManifest,
  component: MusicWindow,
  icon: Music,
  menuBar: MusicMenuBar,
  dockConfig: MusicDockConfig,
};

export default MusicWindow;
