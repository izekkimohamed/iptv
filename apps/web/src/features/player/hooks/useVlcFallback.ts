import { invoke } from '@tauri-apps/api/core';
import { listen, UnlistenFn } from '@tauri-apps/api/event';
import { useCallback, useEffect, useRef, useState } from 'react';

import { PLAYER_CONSTANTS } from '@/constants/player';

type VlcStatus = 'idle' | 'opening' | 'playing' | 'closed';

interface UseVlcFallbackOptions {
  src?: string;
  isDesktopApp?: boolean;
  isHlsStream?: boolean;
  isLoading: boolean;
  playbackError: { message: string; code: number } | null;
  currentTime: number;
  aspectRatio: string;
  setIsLoading: (loading: boolean) => void;
  setPlaybackError: (error: { message: string; code: number } | null) => void;
  saveProgressNow: () => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  vlcPositionRef: React.RefObject<number>;
}

export function useVlcFallback({
  src,
  isDesktopApp,
  isHlsStream,
  isLoading,
  playbackError,
  currentTime,
  aspectRatio,
  setIsLoading,
  setPlaybackError,
  saveProgressNow,
  videoRef,
  vlcPositionRef,
}: UseVlcFallbackOptions) {
  const [loadingStartTime, setLoadingStartTime] = useState<number | null>(null);
  const [vlcStatus, setVlcStatus] = useState<VlcStatus>('idle');
  const vlcFallbackRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Stable refs for callbacks passed to Tauri event listeners (prevents churn)
  const saveProgressRef = useRef(saveProgressNow);
  saveProgressRef.current = saveProgressNow;

  const setVlcStatusRef = useRef(setVlcStatus);
  setVlcStatusRef.current = setVlcStatus;

  const setIsLoadingRef = useRef(setIsLoading);
  setIsLoadingRef.current = setIsLoading;

  const launchVlc = useCallback(
    async (reason: 'stuck' | 'error' | 'manual') => {
      if (vlcFallbackRef.current) return;
      vlcFallbackRef.current = true;

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      setVlcStatus('playing');
      setIsLoading(false);

      try {
        await invoke('open_in_vlc', {
          url: src,
          aspectRatio,
          startPosition: currentTime,
        });
        saveProgressNow();
        setVlcStatus('closed');
        if (reason === 'error') {
          setPlaybackError(null);
        }
      } catch (err) {
        vlcFallbackRef.current = false;
        setVlcStatus('idle');
        const message = err instanceof Error ? err.message : String(err);
        setPlaybackError({ message: `VLC launch failed: ${message}`, code: 0 });
      }
    },
    [src, aspectRatio, currentTime, saveProgressNow, setPlaybackError, setIsLoading],
  );

  // Reset when src changes
  useEffect(() => {
    vlcFallbackRef.current = false;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [src]);

  // Track loading start time
  useEffect(() => {
    if (isLoading && !loadingStartTime) {
      setLoadingStartTime(Date.now());
    } else if (!isLoading) {
      setLoadingStartTime(null);
    }
  }, [isLoading, loadingStartTime]);

  // Stuck-loading detection timer
  useEffect(() => {
    if (!isDesktopApp || !src || isHlsStream) return;
    if (vlcFallbackRef.current) return;

    const checkStuckLoading = () => {
      if (
        !vlcFallbackRef.current &&
        loadingStartTime &&
        Date.now() - loadingStartTime > PLAYER_CONSTANTS.VLC_STUCK_LOADING_THRESHOLD &&
        isLoading
      ) {
        launchVlc('stuck');
      }
    };

    intervalRef.current = setInterval(checkStuckLoading, PLAYER_CONSTANTS.VLC_CHECK_INTERVAL);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isDesktopApp, isHlsStream, src, loadingStartTime, isLoading, launchVlc]);

  // Playback-error auto-launch
  useEffect(() => {
    if (playbackError && isDesktopApp && !isHlsStream && src && !vlcFallbackRef.current) {
      launchVlc('error');
    }
  }, [playbackError, isDesktopApp, isHlsStream, src, launchVlc]);

  // Stable Tauri event listeners — uses refs to avoid listener churn
  useEffect(() => {
    if (!isDesktopApp) return;

    let unlistenPosition: UnlistenFn | undefined;
    let unlistenClosed: UnlistenFn | undefined;

    const setupListeners = async () => {
      unlistenPosition = await listen<number>('vlc-position-update', (event) => {
        vlcPositionRef.current = event.payload;
        saveProgressRef.current();
      });
      unlistenClosed = await listen<number>('vlc-closed', (event) => {
        vlcPositionRef.current = event.payload;
        saveProgressRef.current();
        if (videoRef.current) {
          videoRef.current.currentTime = event.payload;
        }
        setVlcStatusRef.current('closed');
        setIsLoadingRef.current(false);
      });
    };

    setupListeners();

    return () => {
      unlistenPosition?.();
      unlistenClosed?.();
    };
  }, [isDesktopApp, vlcPositionRef]);

  const handleOpenInVlc = useCallback(async () => {
    if (!src || !isDesktopApp) return;
    await launchVlc('manual');
  }, [src, isDesktopApp, launchVlc]);

  return {
    vlcStatus,
    handleOpenInVlc,
  };
}
