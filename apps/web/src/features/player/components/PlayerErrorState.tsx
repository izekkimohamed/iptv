import { AlertCircle } from 'lucide-react';

interface PlayerErrorStateProps {
  playbackError: { message: string; code: number };
  setPlaybackError: (error: { message: string; code: number } | null) => void;
}

export function PlayerErrorState({ playbackError, setPlaybackError }: PlayerErrorStateProps) {
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
      <button
        onClick={() => setPlaybackError(null)}
        className="mt-2 rounded-full border border-white/20 bg-white/10 px-7 py-2.5 text-sm text-white transition-all duration-150 hover:bg-white/20 active:scale-95"
      >
        Try Again
      </button>
    </div>
  );
}
