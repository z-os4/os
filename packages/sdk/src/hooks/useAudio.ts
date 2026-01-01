/**
 * useAudio - SDK hook for app audio playback
 *
 * Provides apps with an audio channel that integrates with
 * the system-wide audio mixer.
 *
 * @example
 * ```tsx
 * const { play, pause, setVolume, connectElement } = useAudio();
 *
 * // For HTML audio/video elements
 * const audioRef = useRef<HTMLAudioElement>(null);
 * useEffect(() => {
 *   if (audioRef.current) {
 *     connectElement(audioRef.current);
 *   }
 * }, []);
 *
 * return <audio ref={audioRef} src="/music.mp3" />;
 * ```
 */

import { useEffect, useRef, useCallback } from 'react';
import { useAudioMixer } from '@z-os/core';

interface UseAudioOptions {
  name?: string;
  initialVolume?: number;
}

interface UseAudioReturn {
  // Channel info
  channelId: string | null;
  volume: number;
  muted: boolean;

  // Controls
  setVolume: (volume: number) => void;
  setMuted: (muted: boolean) => void;
  toggleMute: () => void;
  setPan: (pan: number) => void;

  // Media element connection
  connectElement: (element: HTMLMediaElement) => void;
  disconnect: () => void;
}

export function useAudio(appId: string, options: UseAudioOptions = {}): UseAudioReturn {
  const mixer = useAudioMixer();
  const channelIdRef = useRef<string | null>(null);

  // Create channel on mount
  useEffect(() => {
    const id = mixer.createChannel({
      appId,
      name: options.name,
      initialVolume: options.initialVolume,
    });
    channelIdRef.current = id;

    return () => {
      if (channelIdRef.current) {
        mixer.removeChannel(channelIdRef.current);
      }
    };
  }, [appId, options.name, options.initialVolume, mixer]);

  // Get current channel state
  const channel = channelIdRef.current
    ? mixer.channels.find(ch => ch.id === channelIdRef.current)
    : undefined;

  const setVolume = useCallback((volume: number) => {
    if (channelIdRef.current) {
      mixer.setChannelVolume(channelIdRef.current, volume);
    }
  }, [mixer]);

  const setMuted = useCallback((muted: boolean) => {
    if (channelIdRef.current) {
      mixer.setChannelMuted(channelIdRef.current, muted);
    }
  }, [mixer]);

  const toggleMute = useCallback(() => {
    if (channelIdRef.current && channel) {
      mixer.setChannelMuted(channelIdRef.current, !channel.muted);
    }
  }, [mixer, channel]);

  const setPan = useCallback((pan: number) => {
    if (channelIdRef.current) {
      mixer.setChannelPan(channelIdRef.current, pan);
    }
  }, [mixer]);

  const connectElement = useCallback((element: HTMLMediaElement) => {
    if (channelIdRef.current) {
      mixer.connectMediaElement(channelIdRef.current, element);
    }
  }, [mixer]);

  const disconnect = useCallback(() => {
    if (channelIdRef.current) {
      mixer.disconnectChannel(channelIdRef.current);
    }
  }, [mixer]);

  return {
    channelId: channelIdRef.current,
    volume: channel?.volume ?? options.initialVolume ?? 1,
    muted: channel?.muted ?? false,
    setVolume,
    setMuted,
    toggleMute,
    setPan,
    connectElement,
    disconnect,
  };
}
