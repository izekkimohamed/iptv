import { Clock, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { EventTimeline } from './Events';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface MatchCenterProps {
  gameId: number;
  onClose: () => void;
}

export function MatchCenter({ gameId, onClose }: MatchCenterProps) {
  const [isVisible, setIsVisible] = useState(false);

  const {
    data: match,
    error,
    isLoading,
  } = useSWR(
    gameId ? `${process.env.NEXT_PUBLIC_API_URL}/match-details?id=${gameId}` : null,
    fetcher,
    { refreshInterval: 30000 },
  );

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 50);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const startTime = match?.startTime ? new Date(match.startTime) : null;
  const isLive = match?.statusGroup === 3;
  const homeWinning = match && match.homeCompetitor.score > match.awayCompetitor.score;
  const awayWinning = match && match.awayCompetitor.score > match.homeCompetitor.score;

  const formattedDate =
    startTime?.toLocaleDateString(undefined, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }) || '';

  const formattedTime =
    startTime?.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    }) || '';

  if (error)
    return (
      <div
        className="fixed inset-0 z-100 flex items-center justify-center bg-black/90 p-4"
        onClick={handleClose}
      >
        <div className="animate-in zoom-in max-w-md rounded-3xl border border-red-500/50 bg-[#0f0f0f] p-8 text-center shadow-2xl duration-300">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20">
            <X className="h-8 w-8 text-red-400" />
          </div>
          <h3 className="mb-2 text-lg font-black text-red-400">Connection Error</h3>
          <p className="mb-4 text-sm text-white/60">Failed to load match details</p>
          <button
            onClick={handleClose}
            className="rounded-xl bg-red-500/20 px-6 py-2 font-bold text-red-400 transition-all hover:bg-red-500/30"
          >
            Close
          </button>
        </div>
      </div>
    );

  return (
    /* 1. FIXED WRAPPER: Covers the whole screen to center the modal */
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 md:p-10">
      {/* 2. BACKDROP: Dims the background */}
      <div
        className={`animate-in fade-in absolute inset-0 bg-black/15 backdrop-blur-xl duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* 3. THE MODAL: Strictly 70% height and centered */}
      <div
        className={`h-70vh animate-in zoom-in relative flex max-h-[70vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-linear-to-br from-[#1a1a1a24] to-[#0a0a0a24] duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="group absolute top-4 right-4 z-50 rounded-full bg-white/5 p-2 transition-all hover:bg-white/10"
        >
          <X className="h-5 w-5 text-white/50 group-hover:text-white" />
        </button>

        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-green-500" />
          </div>
        ) : (
          /* 4. SCROLLABLE CONTENT: This ensures content stays inside the 70vh */
          <div
            className="flex flex-1 flex-col overflow-y-auto"
            style={{
              scrollbarColor: '#f4f4f424 transparent',
              scrollbarWidth: 'thin',
            }}
          >
            {/* Header Section (Score, etc.) */}
            <div className="sticky top-0 z-30 shrink-0 space-y-5 border-white/5 px-8 pt-12 text-center backdrop-blur-md">
              {/* Competition */}
              <div className="mb-6 flex flex-col items-center gap-2">
                <span className="text-xs font-bold tracking-widest text-white/40 uppercase">
                  {match.competitionDisplayName}
                </span>
              </div>

              {/* Scoreline */}
              <div className="flex items-center justify-center gap-10">
                <div className="flex flex-1 flex-col items-center">
                  <img
                    src={`https://imagecache.365scores.com/image/upload/f_auto,w_80/competitors/${match.homeCompetitor.id}`}
                    className="mb-3 h-16 w-16"
                    alt="home"
                  />
                  <span className="text-sm font-bold text-white">{match.homeCompetitor.name}</span>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <div className="font-black text-white">
                    {match.statusText === 'Scheduled' ? (
                      <span>The Game Isn't Started Yet</span>
                    ) : (
                      <span className="text-5xl">
                        {match.homeCompetitor.score} - {match.awayCompetitor.score}
                      </span>
                    )}
                  </div>
                  <div className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-bold text-green-500">
                    {match.statusText}
                  </div>
                </div>

                <div className="flex flex-1 flex-col items-center">
                  <img
                    src={`https://imagecache.365scores.com/image/upload/f_auto,w_80/competitors/${match.awayCompetitor.id}`}
                    className="mb-3 h-16 w-16"
                    alt="away"
                  />
                  <span className="text-sm font-bold text-white">{match.awayCompetitor.name}</span>
                </div>
              </div>
              <div className="flex items-center justify-center gap-3">
                <div className="h-px flex-1 bg-linear-to-r from-transparent to-white/10" />
                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-sm">
                  <Clock className="h-3.5 w-3.5 text-white/60" />
                  <span className="text-[10px] font-extrabold tracking-[0.2em] text-white/60 uppercase">
                    Match Timeline
                  </span>
                </div>
                <div className="h-px flex-1 bg-linear-to-l from-transparent to-white/10" />
              </div>
            </div>

            {/* Event Timeline (The part that usually makes it long) */}
            <div className="px-8">
              <EventTimeline match={match} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
