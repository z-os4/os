import React, { useState } from 'react';
import { ZWindow } from '@z-os/ui';
import { Video, Phone, Mic, MicOff, VideoOff, PhoneOff, Plus, Search } from 'lucide-react';

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
      <div className="h-full bg-[#1e1e1e]">
        {!isInCall ? (
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="text"
                    placeholder="Enter name, email, or number"
                    className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 outline-none focus:border-green-500/50"
                  />
                </div>
                <button className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center gap-2">
                  <Video className="w-4 h-4" />
                  <span>New FaceTime</span>
                </button>
              </div>
            </div>

            {/* Recent Calls */}
            <div className="flex-1 overflow-y-auto p-4">
              <h3 className="text-white/40 text-sm uppercase tracking-wider mb-3">Recent</h3>
              <div className="space-y-2">
                {recentCalls.map((call) => (
                  <div
                    key={call.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center text-white font-semibold text-lg">
                      {call.avatar}
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${call.missed ? 'text-red-400' : 'text-white'}`}>
                        {call.name}
                      </p>
                      <div className="flex items-center gap-2 text-white/50 text-sm">
                        {call.type === 'video' ? (
                          <Video className="w-3 h-3" />
                        ) : (
                          <Phone className="w-3 h-3" />
                        )}
                        <span>{call.time}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsInCall(true)}
                        className="p-2 hover:bg-green-500/20 rounded-full transition-colors"
                      >
                        <Video className="w-5 h-5 text-green-400" />
                      </button>
                      <button className="p-2 hover:bg-green-500/20 rounded-full transition-colors">
                        <Phone className="w-5 h-5 text-green-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* In Call View */
          <div className="h-full flex flex-col bg-black relative">
            {/* Video Feed (simulated) */}
            <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
              <div className="text-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center text-white font-semibold text-4xl mx-auto mb-4">
                  S
                </div>
                <p className="text-white text-xl font-medium">Sarah Chen</p>
                <p className="text-white/50 text-sm">00:45</p>
              </div>
            </div>

            {/* Self View */}
            <div className="absolute top-4 right-4 w-32 h-24 rounded-lg bg-gray-800 border border-white/20 flex items-center justify-center">
              {isVideoOff ? (
                <VideoOff className="w-8 h-8 text-white/30" />
              ) : (
                <span className="text-white/50 text-xs">Your camera</span>
              )}
            </div>

            {/* Call Controls */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-4 rounded-full transition-colors ${
                  isMuted ? 'bg-white text-black' : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </button>
              <button
                onClick={() => setIsInCall(false)}
                className="p-4 bg-red-500 hover:bg-red-600 rounded-full transition-colors"
              >
                <PhoneOff className="w-6 h-6 text-white" />
              </button>
              <button
                onClick={() => setIsVideoOff(!isVideoOff)}
                className={`p-4 rounded-full transition-colors ${
                  isVideoOff ? 'bg-white text-black' : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
              </button>
            </div>
          </div>
        )}
      </div>
    </ZWindow>
  );
};

export default FaceTimeWindow;
