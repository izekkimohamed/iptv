import { AlertCircle, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface PlayerErrorStateProps {
  playbackError: { message: string; code: number };
  setPlaybackError: (error: { message: string; code: number } | null) => void;
}

const MAX_AUTO_RETRIES = 3;

export function PlayerErrorState({ playbackError, setPlaybackError }: PlayerErrorStateProps) {
  const [retryCount, setRetryCount] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [isAutoRetrying, setIsAutoRetrying] = useState(false);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isNetworkError = playbackError.code === 2;
  const canAutoRetry = isNetworkError && retryCount < MAX_AUTO_RETRIES;

  const retry = useCallback(() => {
    if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    setRetryCount((c) => c + 1);
    setIsAutoRetrying(false);
    setPlaybackError(null);
  }, [setPlaybackError]);

  useEffect(() => {
    if (!canAutoRetry) return;

    const delayMs = Math.pow(2, retryCount + 1) * 1000; // 2s, 4s, 8s
    const delaySecs = Math.ceil(delayMs / 1000);
    setCountdown(delaySecs);
    setIsAutoRetrying(true);

    countdownTimerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    retryTimerRef.current = setTimeout(retry, delayMs);

    return () => {
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, [canAutoRetry, retryCount, retry]);

  let title_ = 'Playback error';
  let detail = playbackError.message;

  if (playbackError.code === 2) {
    title_ = 'Network Error';
    detail = 'Could not load the media. Please check your connection.';
  } else if (playbackError.message?.includes('405')) {
    title_ = 'Access Denied (405)';
    detail = 'The server rejected this stream. The link may be invalid or expired.';
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 rounded-xl bg-black/85 p-8 font-system text-white">
      <AlertCircle size={48} />
      <h2 className="text-xl font-bold">{title_}</h2>
      <p className="max-w-md text-center text-white/60">
        {detail}
      </p>

      {isAutoRetrying && countdown > 0 && (
        <div className="flex items-center gap-2 text-sm text-white/50">
          <RefreshCw size={14} className="animate-spin" />
          <span>Auto-retrying in {countdown}s… (attempt {retryCount + 1}/{MAX_AUTO_RETRIES})</span>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={retry}
          className="mt-2 rounded-full border border-white/20 bg-white/10 px-7 py-2.5 text-sm text-white transition-all duration-150 hover:bg-white/20 active:scale-95"
        >
          {isAutoRetrying ? 'Retry Now' : 'Try Again'}
        </button>
      </div>
    </div>
  );
}
