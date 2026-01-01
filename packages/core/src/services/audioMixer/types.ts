/**
 * Audio Mixer Types
 *
 * Global audio mixing system for zOS. All apps register audio channels
 * that can be controlled individually or globally.
 */

export interface AudioChannel {
  id: string;
  appId: string;
  name: string;
  volume: number;      // 0-1
  muted: boolean;
  pan: number;         // -1 (left) to 1 (right)
  source?: MediaElementAudioSourceNode | AudioBufferSourceNode;
  gainNode?: GainNode;
  panNode?: StereoPannerNode;
}

export interface AudioMixerState {
  masterVolume: number;
  masterMuted: boolean;
  channels: Record<string, AudioChannel>;
}

export interface CreateChannelOptions {
  appId: string;
  name?: string;
  initialVolume?: number;
}

export interface AudioMixerAPI {
  // Master controls
  getMasterVolume(): number;
  setMasterVolume(volume: number): void;
  getMasterMuted(): boolean;
  setMasterMuted(muted: boolean): void;

  // Channel management
  createChannel(options: CreateChannelOptions): string;
  removeChannel(channelId: string): void;
  getChannel(channelId: string): AudioChannel | undefined;
  getChannelsByApp(appId: string): AudioChannel[];
  getAllChannels(): AudioChannel[];

  // Channel controls
  setChannelVolume(channelId: string, volume: number): void;
  setChannelMuted(channelId: string, muted: boolean): void;
  setChannelPan(channelId: string, pan: number): void;

  // Audio playback
  connectMediaElement(channelId: string, element: HTMLMediaElement): void;
  disconnectChannel(channelId: string): void;

  // Subscriptions
  subscribe(callback: (state: AudioMixerState) => void): () => void;
}
