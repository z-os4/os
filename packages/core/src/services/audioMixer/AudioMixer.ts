/**
 * AudioMixer - Global audio mixing system for zOS
 *
 * Uses Web Audio API to provide:
 * - Per-app audio channels with individual volume/pan/mute
 * - Master volume control
 * - Audio routing through a central mixing bus
 */

import type {
  AudioChannel,
  AudioMixerState,
  CreateChannelOptions,
  AudioMixerAPI
} from './types';

const STORAGE_KEY = 'zos-audio-mixer';

function generateId(): string {
  return `ch-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
}

export class AudioMixer implements AudioMixerAPI {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private state: AudioMixerState;
  private subscribers: Set<(state: AudioMixerState) => void> = new Set();

  constructor() {
    this.state = this.loadState();
  }

  private loadState(): AudioMixerState {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Channels are runtime-only, don't restore them
        return {
          masterVolume: parsed.masterVolume ?? 1,
          masterMuted: parsed.masterMuted ?? false,
          channels: {},
        };
      }
    } catch (e) {
      console.error('Failed to load audio mixer state:', e);
    }
    return {
      masterVolume: 1,
      masterMuted: false,
      channels: {},
    };
  }

  private saveState(): void {
    try {
      // Only save master settings, not channels
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        masterVolume: this.state.masterVolume,
        masterMuted: this.state.masterMuted,
      }));
    } catch (e) {
      console.error('Failed to save audio mixer state:', e);
    }
  }

  private notify(): void {
    this.subscribers.forEach(cb => cb({ ...this.state }));
  }

  private ensureAudioContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.updateMasterGain();
    }

    // Resume if suspended (browser autoplay policy)
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    return this.audioContext;
  }

  private updateMasterGain(): void {
    if (this.masterGain) {
      const volume = this.state.masterMuted ? 0 : this.state.masterVolume;
      this.masterGain.gain.setValueAtTime(volume, this.audioContext?.currentTime ?? 0);
    }
  }

  // Master controls
  getMasterVolume(): number {
    return this.state.masterVolume;
  }

  setMasterVolume(volume: number): void {
    this.state.masterVolume = Math.max(0, Math.min(1, volume));
    this.updateMasterGain();
    this.saveState();
    this.notify();
  }

  getMasterMuted(): boolean {
    return this.state.masterMuted;
  }

  setMasterMuted(muted: boolean): void {
    this.state.masterMuted = muted;
    this.updateMasterGain();
    this.saveState();
    this.notify();
  }

  // Channel management
  createChannel(options: CreateChannelOptions): string {
    const ctx = this.ensureAudioContext();
    const id = generateId();

    const gainNode = ctx.createGain();
    const panNode = ctx.createStereoPanner();

    // Route: source -> gain -> pan -> master
    gainNode.connect(panNode);
    panNode.connect(this.masterGain!);

    const channel: AudioChannel = {
      id,
      appId: options.appId,
      name: options.name ?? options.appId,
      volume: options.initialVolume ?? 1,
      muted: false,
      pan: 0,
      gainNode,
      panNode,
    };

    this.state.channels[id] = channel;
    this.notify();

    return id;
  }

  removeChannel(channelId: string): void {
    const channel = this.state.channels[channelId];
    if (!channel) return;

    // Disconnect audio nodes
    channel.source?.disconnect();
    channel.gainNode?.disconnect();
    channel.panNode?.disconnect();

    delete this.state.channels[channelId];
    this.notify();
  }

  getChannel(channelId: string): AudioChannel | undefined {
    return this.state.channels[channelId];
  }

  getChannelsByApp(appId: string): AudioChannel[] {
    return Object.values(this.state.channels).filter(ch => ch.appId === appId);
  }

  getAllChannels(): AudioChannel[] {
    return Object.values(this.state.channels);
  }

  // Channel controls
  setChannelVolume(channelId: string, volume: number): void {
    const channel = this.state.channels[channelId];
    if (!channel) return;

    channel.volume = Math.max(0, Math.min(1, volume));

    if (channel.gainNode) {
      const effectiveVolume = channel.muted ? 0 : channel.volume;
      channel.gainNode.gain.setValueAtTime(
        effectiveVolume,
        this.audioContext?.currentTime ?? 0
      );
    }

    this.notify();
  }

  setChannelMuted(channelId: string, muted: boolean): void {
    const channel = this.state.channels[channelId];
    if (!channel) return;

    channel.muted = muted;

    if (channel.gainNode) {
      const effectiveVolume = channel.muted ? 0 : channel.volume;
      channel.gainNode.gain.setValueAtTime(
        effectiveVolume,
        this.audioContext?.currentTime ?? 0
      );
    }

    this.notify();
  }

  setChannelPan(channelId: string, pan: number): void {
    const channel = this.state.channels[channelId];
    if (!channel) return;

    channel.pan = Math.max(-1, Math.min(1, pan));

    if (channel.panNode) {
      channel.panNode.pan.setValueAtTime(
        channel.pan,
        this.audioContext?.currentTime ?? 0
      );
    }

    this.notify();
  }

  // Audio playback
  connectMediaElement(channelId: string, element: HTMLMediaElement): void {
    const channel = this.state.channels[channelId];
    if (!channel) return;

    const ctx = this.ensureAudioContext();

    // Disconnect existing source
    channel.source?.disconnect();

    // Create new source from media element
    const source = ctx.createMediaElementSource(element);
    source.connect(channel.gainNode!);
    channel.source = source;

    this.notify();
  }

  disconnectChannel(channelId: string): void {
    const channel = this.state.channels[channelId];
    if (!channel) return;

    channel.source?.disconnect();
    channel.source = undefined;

    this.notify();
  }

  // Subscriptions
  subscribe(callback: (state: AudioMixerState) => void): () => void {
    this.subscribers.add(callback);
    // Immediately call with current state
    callback({ ...this.state });
    return () => this.subscribers.delete(callback);
  }
}

// Singleton instance
export const audioMixer = new AudioMixer();
