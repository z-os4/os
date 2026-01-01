/**
 * AudioMixerContext - React context for the audio mixing system
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { audioMixer } from './AudioMixer';
import type { AudioMixerState, AudioChannel, CreateChannelOptions } from './types';

export interface AudioMixerContextType {
  // State
  masterVolume: number;
  masterMuted: boolean;
  channels: AudioChannel[];

  // Master controls
  setMasterVolume: (volume: number) => void;
  setMasterMuted: (muted: boolean) => void;
  toggleMasterMute: () => void;

  // Channel management
  createChannel: (options: CreateChannelOptions) => string;
  removeChannel: (channelId: string) => void;
  getChannelsByApp: (appId: string) => AudioChannel[];

  // Channel controls
  setChannelVolume: (channelId: string, volume: number) => void;
  setChannelMuted: (channelId: string, muted: boolean) => void;
  setChannelPan: (channelId: string, pan: number) => void;

  // Audio connection
  connectMediaElement: (channelId: string, element: HTMLMediaElement) => void;
  disconnectChannel: (channelId: string) => void;
}

const AudioMixerContext = createContext<AudioMixerContextType | undefined>(undefined);

export const AudioMixerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AudioMixerState>({
    masterVolume: 1,
    masterMuted: false,
    channels: {},
  });

  useEffect(() => {
    return audioMixer.subscribe(setState);
  }, []);

  const value: AudioMixerContextType = {
    // State
    masterVolume: state.masterVolume,
    masterMuted: state.masterMuted,
    channels: Object.values(state.channels),

    // Master controls
    setMasterVolume: (volume) => audioMixer.setMasterVolume(volume),
    setMasterMuted: (muted) => audioMixer.setMasterMuted(muted),
    toggleMasterMute: () => audioMixer.setMasterMuted(!state.masterMuted),

    // Channel management
    createChannel: (options) => audioMixer.createChannel(options),
    removeChannel: (channelId) => audioMixer.removeChannel(channelId),
    getChannelsByApp: (appId) => audioMixer.getChannelsByApp(appId),

    // Channel controls
    setChannelVolume: (channelId, volume) => audioMixer.setChannelVolume(channelId, volume),
    setChannelMuted: (channelId, muted) => audioMixer.setChannelMuted(channelId, muted),
    setChannelPan: (channelId, pan) => audioMixer.setChannelPan(channelId, pan),

    // Audio connection
    connectMediaElement: (channelId, element) => audioMixer.connectMediaElement(channelId, element),
    disconnectChannel: (channelId) => audioMixer.disconnectChannel(channelId),
  };

  return (
    <AudioMixerContext.Provider value={value}>
      {children}
    </AudioMixerContext.Provider>
  );
};

export const useAudioMixer = (): AudioMixerContextType => {
  const context = useContext(AudioMixerContext);
  if (!context) {
    throw new Error('useAudioMixer must be used within AudioMixerProvider');
  }
  return context;
};
