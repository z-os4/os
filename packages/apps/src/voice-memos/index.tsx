/**
 * Voice Memos App
 *
 * Audio recording app for zOS using Web Audio API and MediaRecorder.
 * Black glass UI with glass morphism effects.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ZWindow } from '@z-os/ui';
import {
  Mic,
  Square,
  Play,
  Pause,
  Trash2,
  Edit3,
  Check,
  X,
  SkipBack,
  SkipForward,
  Scissors,
} from 'lucide-react';

interface VoiceMemosWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

interface Recording {
  id: string;
  name: string;
  duration: number;
  date: Date;
  audioBlob: Blob;
  audioUrl: string;
  waveform: number[];
}

const STORAGE_KEY = 'zos-voice-memos';

// Generate simple waveform visualization data
function generateWaveform(length: number = 50): number[] {
  return Array.from({ length }, () => Math.random() * 0.8 + 0.2);
}

// Format duration as mm:ss
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Format date for display
function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

const VoiceMemosWindow: React.FC<VoiceMemosWindowProps> = ({ onClose, onFocus }) => {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [selectedRecording, setSelectedRecording] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [editingName, setEditingName] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [isTrimming, setIsTrimming] = useState(false);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(100);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recordingIntervalRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Load saved recordings metadata (without audio data for demo)
  useEffect(() => {
    // In a real app, we'd load from IndexedDB
    // For demo, start with sample recordings
    const sampleRecordings: Recording[] = [
      {
        id: '1',
        name: 'Meeting Notes',
        duration: 125,
        date: new Date(Date.now() - 86400000),
        audioBlob: new Blob(),
        audioUrl: '',
        waveform: generateWaveform(),
      },
      {
        id: '2',
        name: 'Quick Reminder',
        duration: 15,
        date: new Date(Date.now() - 3600000),
        audioBlob: new Blob(),
        audioUrl: '',
        waveform: generateWaveform(),
      },
      {
        id: '3',
        name: 'Voice Note',
        duration: 45,
        date: new Date(),
        audioBlob: new Blob(),
        audioUrl: '',
        waveform: generateWaveform(),
      },
    ];
    setRecordings(sampleRecordings);
  }, []);

  // Cleanup audio URLs on unmount
  useEffect(() => {
    return () => {
      recordings.forEach((rec) => {
        if (rec.audioUrl) URL.revokeObjectURL(rec.audioUrl);
      });
    };
  }, []);

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const newRecording: Recording = {
          id: Date.now().toString(),
          name: `Recording ${recordings.length + 1}`,
          duration: recordingTime,
          date: new Date(),
          audioBlob,
          audioUrl,
          waveform: generateWaveform(),
        };
        setRecordings((prev) => [newRecording, ...prev]);
        setSelectedRecording(newRecording.id);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      setRecordingTime(0);

      recordingIntervalRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  }, [recordings.length, recordingTime]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    }
  }, [isRecording]);

  // Play/pause selected recording
  const togglePlayback = useCallback(() => {
    const recording = recordings.find((r) => r.id === selectedRecording);
    if (!recording || !recording.audioUrl) return;

    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (!audioRef.current) {
        audioRef.current = new Audio(recording.audioUrl);
        audioRef.current.playbackRate = playbackSpeed;
        audioRef.current.onended = () => {
          setIsPlaying(false);
          setPlaybackProgress(0);
        };
      }
      audioRef.current.play();
      setIsPlaying(true);

      const updateProgress = () => {
        if (audioRef.current) {
          const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
          setPlaybackProgress(isNaN(progress) ? 0 : progress);
          if (isPlaying) {
            animationFrameRef.current = requestAnimationFrame(updateProgress);
          }
        }
      };
      updateProgress();
    }
  }, [selectedRecording, recordings, isPlaying, playbackSpeed]);

  // Skip forward/back
  const skip = useCallback((seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, Math.min(
        audioRef.current.duration,
        audioRef.current.currentTime + seconds
      ));
    }
  }, []);

  // Change playback speed
  const cyclePlaybackSpeed = useCallback(() => {
    const speeds = [0.5, 1, 1.5, 2];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    setPlaybackSpeed(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  }, [playbackSpeed]);

  // Rename recording
  const startRename = useCallback((id: string, currentName: string) => {
    setEditingName(id);
    setEditName(currentName);
  }, []);

  const saveRename = useCallback(() => {
    if (editingName && editName.trim()) {
      setRecordings((prev) =>
        prev.map((r) => (r.id === editingName ? { ...r, name: editName.trim() } : r))
      );
    }
    setEditingName(null);
    setEditName('');
  }, [editingName, editName]);

  // Delete recording
  const deleteRecording = useCallback((id: string) => {
    const recording = recordings.find((r) => r.id === id);
    if (recording?.audioUrl) {
      URL.revokeObjectURL(recording.audioUrl);
    }
    setRecordings((prev) => prev.filter((r) => r.id !== id));
    if (selectedRecording === id) {
      setSelectedRecording(null);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setIsPlaying(false);
    }
    setShowDeleteConfirm(null);
  }, [recordings, selectedRecording]);

  // Get selected recording
  const selected = recordings.find((r) => r.id === selectedRecording);

  return (
    <ZWindow
      title="Voice Memos"
      onClose={onClose}
      onFocus={onFocus}
      initialPosition={{ x: 180, y: 100 }}
      initialSize={{ width: 700, height: 500 }}
      windowType="system"
    >
      <div className="flex h-full bg-black/80 backdrop-blur-2xl">
        {/* Recordings List - Glass sidebar */}
        <div className="w-64 border-r border-white/10 flex flex-col bg-white/[0.02]">
          <div className="p-3 border-b border-white/10 bg-white/[0.03]">
            <h2 className="text-white/90 font-medium">All Recordings</h2>
            <p className="text-white/40 text-xs mt-1">{recordings.length} recordings</p>
          </div>

          <div className="flex-1 overflow-y-auto">
            {recordings.map((recording) => (
              <div
                key={recording.id}
                onClick={() => {
                  if (audioRef.current) {
                    audioRef.current.pause();
                    audioRef.current = null;
                  }
                  setIsPlaying(false);
                  setPlaybackProgress(0);
                  setSelectedRecording(recording.id);
                }}
                className={`group p-3 cursor-pointer border-b border-white/[0.06] transition-all duration-200 ${
                  selectedRecording === recording.id
                    ? 'bg-white/[0.08] backdrop-blur-xl'
                    : 'hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center justify-between">
                  {editingName === recording.id ? (
                    <div className="flex items-center gap-1 flex-1">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && saveRename()}
                        className="flex-1 bg-white/10 backdrop-blur-sm text-white/90 text-sm px-2 py-1 rounded border border-white/20 outline-none focus:border-white/40"
                        autoFocus
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          saveRename();
                        }}
                        className="p-1 hover:bg-white/10 rounded transition-colors"
                      >
                        <Check className="w-3 h-3 text-green-400" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingName(null);
                        }}
                        className="p-1 hover:bg-white/10 rounded transition-colors"
                      >
                        <X className="w-3 h-3 text-red-400" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <p className="text-white/90 text-sm truncate flex-1">{recording.name}</p>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startRename(recording.id, recording.name);
                          }}
                          className="p-1 hover:bg-white/10 rounded transition-colors"
                        >
                          <Edit3 className="w-3 h-3 text-white/50" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowDeleteConfirm(recording.id);
                          }}
                          className="p-1 hover:bg-white/10 rounded transition-colors"
                        >
                          <Trash2 className="w-3 h-3 text-white/50" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-white/40 text-xs">{formatDate(recording.date)}</span>
                  <span className="text-white/40 text-xs">{formatDuration(recording.duration)}</span>
                </div>

                {/* Mini waveform */}
                <div className="flex items-center gap-px mt-2 h-4">
                  {recording.waveform.slice(0, 30).map((height, i) => (
                    <div
                      key={i}
                      className={`flex-1 rounded-full transition-colors ${
                        selectedRecording === recording.id
                          ? 'bg-red-500/70'
                          : 'bg-white/20'
                      }`}
                      style={{ height: `${height * 100}%` }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Record Button - Glass morphism */}
          <div className="p-4 border-t border-white/10 flex flex-col items-center bg-white/[0.02]">
            {isRecording && (
              <div className="text-red-400 font-mono text-lg mb-2 animate-pulse">
                {formatDuration(recordingTime)}
              </div>
            )}
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-lg ${
                isRecording
                  ? 'bg-red-500/80 hover:bg-red-500/90 backdrop-blur-xl border border-red-400/30 animate-pulse shadow-red-500/30'
                  : 'bg-white/10 hover:bg-white/15 backdrop-blur-xl border border-white/20 hover:border-white/30'
              }`}
            >
              {isRecording ? (
                <Square className="w-6 h-6 text-white fill-white" />
              ) : (
                <Mic className="w-8 h-8 text-red-400" />
              )}
            </button>
            <p className="text-white/40 text-xs mt-2">
              {isRecording ? 'Tap to stop' : 'Tap to record'}
            </p>
          </div>
        </div>

        {/* Playback Area - Main glass panel */}
        <div className="flex-1 flex flex-col bg-white/[0.01]">
          {selected ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-white/10 bg-white/[0.02]">
                <h2 className="text-white/90 text-xl font-medium">{selected.name}</h2>
                <p className="text-white/40 text-sm mt-1">{formatDate(selected.date)}</p>
              </div>

              {/* Waveform Visualization */}
              <div className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-lg">
                  {/* Large waveform */}
                  <div className="flex items-center gap-1 h-32 mb-4 p-4 rounded-xl bg-white/[0.03] backdrop-blur-sm border border-white/[0.06]">
                    {selected.waveform.map((height, i) => {
                      const progress = (i / selected.waveform.length) * 100;
                      const isPlayed = progress <= playbackProgress;
                      const inTrimRange = isTrimming && progress >= trimStart && progress <= trimEnd;
                      return (
                        <div
                          key={i}
                          className={`flex-1 rounded-full transition-colors duration-150 ${
                            isTrimming
                              ? inTrimRange
                                ? 'bg-red-500/80'
                                : 'bg-white/10'
                              : isPlayed
                              ? 'bg-red-500/80'
                              : 'bg-white/20'
                          }`}
                          style={{ height: `${height * 100}%` }}
                        />
                      );
                    })}
                  </div>

                  {/* Progress bar - glass style */}
                  <div className="relative h-1.5 bg-white/10 rounded-full mb-2 backdrop-blur-sm overflow-hidden">
                    <div
                      className="absolute h-full bg-gradient-to-r from-red-500/80 to-red-400/80 rounded-full transition-all duration-100"
                      style={{ width: `${playbackProgress}%` }}
                    />
                  </div>

                  {/* Time display */}
                  <div className="flex justify-between text-white/50 text-xs font-mono">
                    <span>
                      {formatDuration((playbackProgress / 100) * selected.duration)}
                    </span>
                    <span>{formatDuration(selected.duration)}</span>
                  </div>
                </div>
              </div>

              {/* Playback Controls - Glass morphism */}
              <div className="p-4 border-t border-white/10 bg-white/[0.02]">
                <div className="flex items-center justify-center gap-4">
                  {/* Skip back */}
                  <button
                    onClick={() => skip(-15)}
                    className="p-3 hover:bg-white/10 rounded-full transition-all border border-transparent hover:border-white/10 relative backdrop-blur-sm"
                    title="Skip back 15s"
                  >
                    <SkipBack className="w-5 h-5 text-white/80" />
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[10px] text-white/40 font-mono">
                      15
                    </span>
                  </button>

                  {/* Play/Pause - Main glass button */}
                  <button
                    onClick={togglePlayback}
                    disabled={!selected.audioUrl}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all backdrop-blur-xl shadow-lg ${
                      selected.audioUrl
                        ? 'bg-white/10 hover:bg-white/15 border border-white/20 hover:border-white/30 shadow-white/5'
                        : 'bg-white/5 border border-white/10 cursor-not-allowed'
                    }`}
                  >
                    {isPlaying ? (
                      <Pause className="w-6 h-6 text-white/90" />
                    ) : (
                      <Play className="w-6 h-6 text-white/90 ml-1" />
                    )}
                  </button>

                  {/* Skip forward */}
                  <button
                    onClick={() => skip(15)}
                    className="p-3 hover:bg-white/10 rounded-full transition-all border border-transparent hover:border-white/10 relative backdrop-blur-sm"
                    title="Skip forward 15s"
                  >
                    <SkipForward className="w-5 h-5 text-white/80" />
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[10px] text-white/40 font-mono">
                      15
                    </span>
                  </button>
                </div>

                {/* Speed and Trim - Glass pill buttons */}
                <div className="flex items-center justify-center gap-3 mt-4">
                  <button
                    onClick={cyclePlaybackSpeed}
                    className="px-4 py-1.5 bg-white/[0.08] hover:bg-white/[0.12] backdrop-blur-sm rounded-full text-white/80 text-sm transition-all border border-white/10 hover:border-white/20 font-mono"
                  >
                    {playbackSpeed}x
                  </button>
                  <button
                    onClick={() => setIsTrimming(!isTrimming)}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm transition-all backdrop-blur-sm border ${
                      isTrimming
                        ? 'bg-red-500/20 text-red-400 border-red-500/30'
                        : 'bg-white/[0.08] hover:bg-white/[0.12] text-white/80 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <Scissors className="w-4 h-4" />
                    Trim
                  </button>
                </div>

                {/* Trim controls - Glass panel */}
                {isTrimming && (
                  <div className="mt-4 p-4 bg-white/[0.05] backdrop-blur-sm rounded-xl border border-white/10">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex-1">
                        <label className="text-white/50 text-xs font-medium">Start</label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={trimStart}
                          onChange={(e) => setTrimStart(Number(e.target.value))}
                          className="w-full mt-1 accent-red-500"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-white/50 text-xs font-medium">End</label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={trimEnd}
                          onChange={(e) => setTrimEnd(Number(e.target.value))}
                          className="w-full mt-1 accent-red-500"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setIsTrimming(false)}
                        className="px-4 py-1.5 text-white/60 hover:text-white/90 text-sm transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          // In a real app, we'd apply the trim here
                          setIsTrimming(false);
                        }}
                        className="px-4 py-1.5 bg-red-500/80 hover:bg-red-500/90 backdrop-blur-sm text-white text-sm rounded-lg transition-all border border-red-400/30"
                      >
                        Apply Trim
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center p-8 rounded-2xl bg-white/[0.03] backdrop-blur-sm border border-white/[0.06]">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center">
                  <Mic className="w-10 h-10 text-white/20" />
                </div>
                <p className="text-white/50 text-lg">No recording selected</p>
                <p className="text-white/30 text-sm mt-1">Select a recording or tap record</p>
              </div>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal - Glass overlay */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-black/80 backdrop-blur-2xl rounded-2xl p-5 max-w-sm w-full mx-4 shadow-2xl border border-white/10">
              <h3 className="text-white/90 font-medium mb-2">Delete Recording?</h3>
              <p className="text-white/50 text-sm mb-5">
                This recording will be permanently deleted. This action cannot be undone.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 text-white/60 hover:text-white/90 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteRecording(showDeleteConfirm)}
                  className="px-4 py-2 bg-red-500/80 hover:bg-red-500/90 backdrop-blur-sm text-white rounded-lg transition-all border border-red-400/30"
                >
                  Delete
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
 * Voice Memos app manifest
 */
export const VoiceMemosManifest = {
  identifier: 'ai.hanzo.voice-memos',
  name: 'Voice Memos',
  version: '1.0.0',
  description: 'Audio recording app for zOS',
  category: 'utilities' as const,
  permissions: ['microphone', 'storage'] as const,
  window: {
    type: 'system' as const,
    defaultSize: { width: 700, height: 500 },
    resizable: true,
    showInDock: true,
  },
};

/**
 * Voice Memos menu bar configuration
 */
export const VoiceMemosMenuBar = {
  menus: [
    {
      id: 'file',
      label: 'File',
      items: [
        { type: 'item' as const, id: 'newRecording', label: 'New Recording', shortcut: '⌘N' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'export', label: 'Export...', shortcut: '⌘E' },
        { type: 'item' as const, id: 'share', label: 'Share...' },
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
        { type: 'item' as const, id: 'rename', label: 'Rename...', shortcut: '⌘R' },
        { type: 'item' as const, id: 'trim', label: 'Trim Recording', shortcut: '⌘T' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'delete', label: 'Delete', shortcut: '⌘⌫' },
      ],
    },
    {
      id: 'playback',
      label: 'Playback',
      items: [
        { type: 'item' as const, id: 'play', label: 'Play/Pause', shortcut: 'Space' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'skipBack', label: 'Skip Back 15s', shortcut: '⌘←' },
        { type: 'item' as const, id: 'skipForward', label: 'Skip Forward 15s', shortcut: '⌘→' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'speed05', label: '0.5x Speed' },
        { type: 'item' as const, id: 'speed1', label: '1x Speed' },
        { type: 'item' as const, id: 'speed15', label: '1.5x Speed' },
        { type: 'item' as const, id: 'speed2', label: '2x Speed' },
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
        { type: 'item' as const, id: 'voiceMemosHelp', label: 'Voice Memos Help' },
      ],
    },
  ],
};

/**
 * Voice Memos dock configuration
 */
export const VoiceMemosDockConfig = {
  contextMenu: [
    { type: 'item' as const, id: 'newRecording', label: 'New Recording' },
    { type: 'separator' as const },
    { type: 'item' as const, id: 'options', label: 'Options' },
  ],
};

/**
 * Voice Memos App definition for registry
 */
export const VoiceMemosApp = {
  manifest: VoiceMemosManifest,
  component: VoiceMemosWindow,
  icon: Mic,
  menuBar: VoiceMemosMenuBar,
  dockConfig: VoiceMemosDockConfig,
};

export default VoiceMemosWindow;
