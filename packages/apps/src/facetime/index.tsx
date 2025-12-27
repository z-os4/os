import React, { useState } from 'react';
import { ZWindow } from '@z-os/ui';
import { Video, Phone, Mic, MicOff, VideoOff, PhoneOff, Plus, Search, Users, Grid3X3 } from 'lucide-react';

interface FaceTimeWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

interface RecentCall {
  id: string;
  name: string;
  avatar: string;
  time: string;
  type: 'video' | 'audio';
  missed: boolean;
}

const recentCalls: RecentCall[] = [
  { id: '1', name: 'Sarah Chen', avatar: 'S', time: 'Today, 2:30 PM', type: 'video', missed: false },
  { id: '2', name: 'Alex Kim', avatar: 'A', time: 'Today, 11:00 AM', type: 'audio', missed: true },
  { id: '3', name: 'Dev Team', avatar: 'D', time: 'Yesterday', type: 'video', missed: false },
  { id: '4', name: 'Mom', avatar: 'M', time: 'Dec 20', type: 'video', missed: false },
];

const FaceTimeWindow: React.FC<FaceTimeWindowProps> = ({ onClose, onFocus }) => {
  const [isInCall, setIsInCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  return (
    <ZWindow
      title="FaceTime"
      onClose={onClose}
      onFocus={onFocus}
      initialPosition={{ x: 160, y: 100 }}
      initialSize={{ width: 700, height: 500 }}
      windowType="system"
    >
      <div className="h-full bg-black/80 backdrop-blur-2xl">
        {!isInCall ? (
          <div className="h-full flex flex-col">
            {/* Header - Glass Panel */}
            <div className="p-4 bg-white/[0.03] border-b border-white/[0.08]">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="text"
                    placeholder="Enter name, email, or number"
                    className="w-full pl-10 pr-4 py-2.5 bg-white/[0.06] border border-white/[0.1] rounded-xl text-white/90 placeholder:text-white/30 outline-none focus:border-white/20 focus:bg-white/[0.08] transition-all backdrop-blur-sm"
                  />
                </div>
                <button className="px-4 py-2.5 bg-emerald-500/90 hover:bg-emerald-500 text-white rounded-xl transition-all flex items-center gap-2 font-medium shadow-lg shadow-emerald-500/20 backdrop-blur-sm">
                  <Video className="w-4 h-4" />
                  <span>New FaceTime</span>
                </button>
              </div>
              
              {/* Tab Bar */}
              <div className="flex items-center gap-1">
                <button className="px-4 py-1.5 bg-white/[0.1] text-white/90 rounded-lg text-sm font-medium transition-all">
                  All
                </button>
                <button className="px-4 py-1.5 text-white/50 hover:text-white/70 hover:bg-white/[0.05] rounded-lg text-sm font-medium transition-all">
                  Missed
                </button>
              </div>
            </div>

            {/* Recent Calls - Glass List */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white/40 text-xs uppercase tracking-wider font-medium">Recent</h3>
                <button className="p-1.5 hover:bg-white/[0.06] rounded-lg transition-all">
                  <Grid3X3 className="w-4 h-4 text-white/40" />
                </button>
              </div>
              <div className="space-y-1">
                {recentCalls.map((call) => (
                  <div
                    key={call.id}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.06] transition-all cursor-pointer group border border-transparent hover:border-white/[0.08]"
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white font-semibold text-lg shadow-lg shadow-emerald-500/20">
                      {call.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium truncate ${call.missed ? 'text-red-400' : 'text-white/90'}`}>
                        {call.name}
                      </p>
                      <div className="flex items-center gap-2 text-white/40 text-sm">
                        {call.type === 'video' ? (
                          <Video className="w-3 h-3" />
                        ) : (
                          <Phone className="w-3 h-3" />
                        )}
                        <span>{call.time}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setIsInCall(true)}
                        className="p-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-full transition-all border border-emerald-500/30"
                      >
                        <Video className="w-4 h-4 text-emerald-400" />
                      </button>
                      <button className="p-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-full transition-all border border-emerald-500/30">
                        <Phone className="w-4 h-4 text-emerald-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Create Link - Glass Footer */}
            <div className="p-4 border-t border-white/[0.06] bg-white/[0.02]">
              <button className="w-full py-3 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] rounded-xl text-white/70 hover:text-white/90 transition-all flex items-center justify-center gap-2 font-medium backdrop-blur-sm">
                <Plus className="w-4 h-4" />
                <span>Create Link</span>
              </button>
            </div>
          </div>
        ) : (
          /* In Call View - Full Glass Interface */
          <div className="h-full flex flex-col relative overflow-hidden">
            {/* Video Feed Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900">
              {/* Simulated ambient glow */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
            </div>
            
            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center relative z-10">
              <div className="text-center">
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white font-semibold text-5xl mx-auto mb-5 shadow-2xl shadow-emerald-500/30 ring-4 ring-white/10">
                  S
                </div>
                <p className="text-white text-2xl font-medium mb-1">Sarah Chen</p>
                <p className="text-white/50 text-sm font-medium">00:45</p>
              </div>
            </div>

            {/* Self View - Glass Panel */}
            <div className="absolute top-4 right-4 w-36 h-28 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/[0.15] flex items-center justify-center overflow-hidden shadow-2xl">
              {isVideoOff ? (
                <div className="flex flex-col items-center gap-2">
                  <VideoOff className="w-6 h-6 text-white/30" />
                  <span className="text-white/30 text-xs">Camera Off</span>
                </div>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                  <span className="text-white/40 text-xs">Your camera</span>
                </div>
              )}
            </div>

            {/* Participant Count - Glass Pill */}
            <div className="absolute top-4 left-4 px-3 py-1.5 bg-black/40 backdrop-blur-xl border border-white/[0.1] rounded-full flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-white/60" />
              <span className="text-white/80 text-sm font-medium">2</span>
            </div>

            {/* Call Controls - Glass Bar */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
              <div className="flex items-center justify-center gap-3">
                {/* Mute Button */}
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-4 rounded-full transition-all backdrop-blur-xl border shadow-lg ${
                    isMuted 
                      ? 'bg-white text-black border-white/50 shadow-white/20' 
                      : 'bg-white/[0.15] text-white border-white/[0.15] hover:bg-white/[0.25]'
                  }`}
                >
                  {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </button>
                
                {/* End Call Button */}
                <button
                  onClick={() => setIsInCall(false)}
                  className="p-4 bg-red-500 hover:bg-red-600 rounded-full transition-all shadow-lg shadow-red-500/30 border border-red-400/30"
                >
                  <PhoneOff className="w-6 h-6 text-white" />
                </button>
                
                {/* Video Toggle Button */}
                <button
                  onClick={() => setIsVideoOff(!isVideoOff)}
                  className={`p-4 rounded-full transition-all backdrop-blur-xl border shadow-lg ${
                    isVideoOff 
                      ? 'bg-white text-black border-white/50 shadow-white/20' 
                      : 'bg-white/[0.15] text-white border-white/[0.15] hover:bg-white/[0.25]'
                  }`}
                >
                  {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ZWindow>
  );
};

// ============================================================================
// App Definition
// ============================================================================

/**
 * FaceTime app manifest
 */
export const FaceTimeManifest = {
  identifier: 'ai.hanzo.facetime',
  name: 'FaceTime',
  version: '1.0.0',
  description: 'Video calling app for zOS',
  category: 'communication' as const,
  permissions: ['camera', 'microphone', 'network'] as const,
  window: {
    type: 'system' as const,
    defaultSize: { width: 700, height: 500 },
    resizable: true,
    showInDock: true,
  },
};

/**
 * FaceTime menu bar configuration
 */
export const FaceTimeMenuBar = {
  menus: [
    {
      id: 'file',
      label: 'File',
      items: [
        { type: 'item' as const, id: 'newCall', label: 'New FaceTime Call', shortcut: '⌘N' },
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
      id: 'call',
      label: 'Call',
      items: [
        { type: 'item' as const, id: 'mute', label: 'Mute', shortcut: '⌘M' },
        { type: 'item' as const, id: 'turnOffCamera', label: 'Turn Off Camera' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'endCall', label: 'End Call', shortcut: '⌘E' },
      ],
    },
    {
      id: 'window',
      label: 'Window',
      items: [
        { type: 'item' as const, id: 'minimize', label: 'Minimize', shortcut: '⌘M' },
        { type: 'item' as const, id: 'zoom', label: 'Zoom' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'fullScreen', label: 'Enter Full Screen', shortcut: '⌃⌘F' },
      ],
    },
    {
      id: 'help',
      label: 'Help',
      items: [
        { type: 'item' as const, id: 'facetimeHelp', label: 'FaceTime Help' },
      ],
    },
  ],
};

/**
 * FaceTime dock configuration
 */
export const FaceTimeDockConfig = {
  contextMenu: [
    { type: 'item' as const, id: 'newCall', label: 'New FaceTime Call' },
    { type: 'separator' as const },
    { type: 'item' as const, id: 'options', label: 'Options' },
  ],
};

/**
 * FaceTime App definition for registry
 */
export const FaceTimeApp = {
  manifest: FaceTimeManifest,
  component: FaceTimeWindow,
  icon: Video,
  menuBar: FaceTimeMenuBar,
  dockConfig: FaceTimeDockConfig,
};

export default FaceTimeWindow;
