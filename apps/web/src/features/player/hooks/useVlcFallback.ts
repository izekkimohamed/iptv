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
}: UseVlcFallbackOptions) {
  const [loadingStartTime, setLoadingStartTime] = useState<number | null>(null);
  const [vlcStatus, setVlcStatus] = useState<VlcStatus>('idle');
  const vlcFallbackRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    vlcFallbackRef.current = false;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [src]);

  useEffect(() => {
    if (isLoading && !loadingStartTime) {
      setLoadingStartTime(Date.now());
    } else if (!isLoading) {
      setLoadingStartTime(null);
    }
  }, [isLoading, loadingStartTime]);

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
        vlcFallbackRef.current = true;

        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }

        setVlcStatus('playing');
        setIsLoading(false);

        invoke<number>('open_in_vlc', {
          url: src,
          aspectRatio,
          startPosition: currentTime,
        })
          .then((position) => {
            if (position > 0 && videoRef.current) {
              videoRef.current.currentTime = position;
              saveProgressNow();
            }
            setVlcStatus('closed');
          })
          .catch(() => {
            vlcFallbackRef.current = false;
            setVlcStatus('idle');
          });
      }
    };

    intervalRef.current = setInterval(checkStuckLoading, PLAYER_CONSTANTS.VLC_CHECK_INTERVAL);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [
    isDesktopApp,
    isHlsStream,
    src,
    loadingStartTime,
    isLoading,
    aspectRatio,
    currentTime,
    saveProgressNow,
    setIsLoading,
    videoRef,
  ]);

  useEffect(() => {
    if (playbackError && isDesktopApp && !isHlsStream && src && !vlcFallbackRef.current) {
      vlcFallbackRef.current = true;
      setVlcStatus('playing');
      setIsLoading(false);

      const openVlcFallback = async () => {
        try {
          const position = await invoke<number>('open_in_vlc', {
            url: src,
            aspectRatio,
            startPosition: currentTime,
          });
          if (position > 0 && videoRef.current) {
            videoRef.current.currentTime = position;
            saveProgressNow();
          }
          setPlaybackError(null);
          setVlcStatus('closed');
        } catch {
          vlcFallbackRef.current = false;
          setVlcStatus('idle');
        }
      };
      openVlcFallback();
    }
  }, [
    playbackError,
    isDesktopApp,
    isHlsStream,
    src,
    aspectRatio,
    currentTime,
    saveProgressNow,
    setPlaybackError,
    setIsLoading,
    videoRef,
  ]);

  const handleVlcPositionUpdate = useCallback(
    (position: number) => {
      if (position > 0 && videoRef.current && src) {
        videoRef.current.currentTime = position;
        saveProgressNow();
      }
    },
    [saveProgressNow, src, videoRef],
  );

  const handleOpenInVlc = useCallback(async () => {
    if (!src || !isDesktopApp) return;

    setVlcStatus('opening');
    setIsLoading(false);

    try {
      const position = await invoke<number>('open_in_vlc', {
        url: src,
        aspectRatio,
        startPosition: currentTime,
      });

      if (position > 0 && videoRef.current) {
        videoRef.current.currentTime = position;
        saveProgressNow();
      }
      setVlcStatus('closed');
    } catch (err) {
      console.error('Failed to open in VLC:', err);
      setVlcStatus('idle');
    }
  }, [src, isDesktopApp, aspectRatio, currentTime, setIsLoading, saveProgressNow, videoRef]);

  const handleVlcClosed = useCallback(() => {
    setVlcStatus('closed');
    setIsLoading(false);
  }, [setIsLoading]);

  useEffect(() => {
    if (!isDesktopApp) return;

    let unlistenPosition: UnlistenFn | undefined;
    let unlistenClosed: UnlistenFn | undefined;

    const setupListeners = async () => {
      unlistenPosition = await listen<number>('vlc-position-update', (event) => {
        handleVlcPositionUpdate(event.payload);
      });
      unlistenClosed = await listen('vlc-closed', () => {
        handleVlcClosed();
      });
    };

    setupListeners();

    return () => {
      if (unlistenPosition) unlistenPosition();
      if (unlistenClosed) unlistenClosed();
    };
  }, [isDesktopApp, handleVlcPositionUpdate, handleVlcClosed]);

  return {
    vlcStatus,
    handleOpenInVlc,
    handleVlcPositionUpdate,
  };
}
