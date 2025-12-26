import React, { useState } from 'react';
import { ZWindow } from '@z-os/ui';
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Volume2, ListMusic, Heart, MoreHorizontal } from 'lucide-react';

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
      <div className="flex flex-col h-full bg-gradient-to-b from-[#1a1a1a] to-[#0d0d0d]">
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-56 bg-black/30 border-r border-white/10 flex flex-col p-4">
            <h3 className="text-white/40 text-xs uppercase tracking-wider mb-2">Library</h3>
            {['Recently Added', 'Artists', 'Albums', 'Songs', 'Genres'].map((item) => (
              <button
                key={item}
                className="text-left px-3 py-1.5 text-white/70 hover:bg-white/5 rounded-lg text-sm transition-colors"
              >
                {item}
              </button>
            ))}

            <h3 className="text-white/40 text-xs uppercase tracking-wider mt-6 mb-2">Playlists</h3>
            {playlists.map((playlist) => (
              <button
                key={playlist}
                className="text-left px-3 py-1.5 text-white/70 hover:bg-white/5 rounded-lg text-sm transition-colors flex items-center gap-2"
              >
                <ListMusic className="w-4 h-4" />
                {playlist}
              </button>
            ))}
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Track List */}
            <div className="flex-1 overflow-y-auto p-4">
              <h2 className="text-white text-2xl font-bold mb-4">Recently Added</h2>
              <div className="space-y-1">
                {mockTracks.map((track, index) => (
                  <div
                    key={track.id}
                    onClick={() => {
                      setCurrentTrack(track);
                      setIsPlaying(true);
                    }}
                    className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer group transition-colors ${
                      currentTrack.id === track.id ? 'bg-white/10' : 'hover:bg-white/5'
                    }`}
                  >
                    <span className="w-6 text-white/30 text-sm text-center group-hover:hidden">
                      {index + 1}
                    </span>
                    <Play className="w-4 h-4 text-white hidden group-hover:block" />
                    <img src={track.cover} alt="" className="w-10 h-10 rounded" />
                    <div className="flex-1 min-w-0">
                      <p className={`truncate ${currentTrack.id === track.id ? 'text-green-400' : 'text-white'}`}>
                        {track.title}
                      </p>
                      <p className="text-white/50 text-sm truncate">{track.artist}</p>
                    </div>
                    <p className="text-white/50 text-sm">{track.album}</p>
                    <button className="opacity-0 group-hover:opacity-100 p-2 hover:bg-white/10 rounded-full transition-opacity">
                      <Heart className="w-4 h-4 text-white/50" />
                    </button>
                    <p className="text-white/50 text-sm w-12 text-right">{track.duration}</p>
                    <button className="opacity-0 group-hover:opacity-100 p-2 hover:bg-white/10 rounded-full transition-opacity">
                      <MoreHorizontal className="w-4 h-4 text-white/50" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Player Bar */}
        <div className="h-24 bg-black/50 border-t border-white/10 flex items-center px-4 gap-4">
          {/* Current Track Info */}
          <div className="flex items-center gap-3 w-64">
            <img src={currentTrack.cover} alt="" className="w-14 h-14 rounded shadow-lg" />
            <div className="min-w-0">
              <p className="text-white font-medium truncate">{currentTrack.title}</p>
              <p className="text-white/50 text-sm truncate">{currentTrack.artist}</p>
            </div>
            <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <Heart className="w-4 h-4 text-white/50" />
            </button>
          </div>

          {/* Controls */}
          <div className="flex-1 flex flex-col items-center gap-2">
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <Shuffle className="w-4 h-4 text-white/50" />
              </button>
              <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <SkipBack className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-3 bg-white rounded-full hover:scale-105 transition-transform"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 text-black" />
                ) : (
                  <Play className="w-5 h-5 text-black ml-0.5" />
                )}
              </button>
              <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <SkipForward className="w-5 h-5 text-white" />
              </button>
              <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <Repeat className="w-4 h-4 text-white/50" />
              </button>
            </div>
            <div className="flex items-center gap-2 w-full max-w-md">
              <span className="text-white/50 text-xs w-10 text-right">1:18</span>
              <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-white/50 text-xs w-10">{currentTrack.duration}</span>
            </div>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-2 w-40">
            <Volume2 className="w-4 h-4 text-white/50" />
            <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full"
                style={{ width: `${volume}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </ZWindow>
  );
};

export default MusicWindow;
