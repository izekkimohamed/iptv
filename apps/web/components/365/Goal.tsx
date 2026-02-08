import { Game } from '@/trpc/types';
import { Trophy, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface GoalPopupProps {
  game: Game;
  onDismiss: () => void;
}

export function GoalPopup({ game, onDismiss }: GoalPopupProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation after mount
    setTimeout(() => setIsVisible(true), 50);
  }, []);

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVisible(false);
    setTimeout(onDismiss, 300);
  };

  return (
    <div
      className={`absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/80 p-4 backdrop-blur-xl transition-all duration-500 ${
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      }`}
      onClick={handleDismiss}
    >
      {/* Animated Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-primary/20 blur-3xl" />
        <div
          className="absolute top-1/2 left-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full bg-primary/10 blur-2xl"
          style={{ animationDuration: '2s' }}
        />
      </div>

      {/* Close button */}
      <button
        onClick={handleDismiss}
        className="absolute top-4 right-4 z-10 rounded-full bg-white/10 p-2 backdrop-blur-sm transition-all hover:bg-white/20 hover:rotate-90 active:scale-90"
      >
        <X className="h-4 w-4 text-white" />
      </button>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Trophy Icon with Animation */}
        <div className="relative">
          <div
            className="absolute inset-0 animate-ping rounded-full bg-primary/30"
            style={{ animationDuration: '1.5s' }}
          />
          <div className="relative rounded-full bg-linear-to-br from-primary to-primary/80 p-4 shadow-2xl shadow-primary/50">
            <Trophy
              className="h-8 w-8 animate-bounce text-primary-foreground"
              style={{ animationDuration: '1s' }}
            />
          </div>
        </div>

        {/* Goal Badge */}
        <div className="animate-bounce rounded-full bg-linear-to-r from-primary via-primary-foreground to-primary bg-size-[200%_100%] px-6 py-2 shadow-2xl shadow-primary/50">
          <div className="animate-[shimmer_2s_infinite] bg-linear-to-r from-transparent via-white/30 to-transparent bg-size-[200%_100%] bg-clip-text">
            <span className="text-sm font-black tracking-[0.3em] text-primary-foreground uppercase">
              ⚽ Goal Scored!
            </span>
          </div>
        </div>

        {/* Score Display */}
        <div className="flex w-full max-w-sm items-center justify-between gap-6 rounded-2xl border border-primary/30 bg-linear-to-br from-primary/10 to-transparent p-6 backdrop-blur-sm">
          {/* Home Team */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div className="absolute -inset-2 animate-pulse rounded-full bg-primary/20 blur-md" />
              <img
                src={`https://imagecache.365scores.com/image/upload/f_auto,w_64/competitors/${game.homeCompetitor.id}`}
                className="relative h-14 w-14 transition-transform hover:scale-110"
                alt={game.homeCompetitor.name}
              />
            </div>
            <span className="text-xs font-bold text-white/80">{game.homeCompetitor.name}</span>
          </div>

          {/* Score */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-4">
              <span className="text-4xl font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                {game.homeCompetitor.score}
              </span>
              <span className="text-2xl font-black text-primary">-</span>
              <span className="text-4xl font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                {game.awayCompetitor.score}
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-primary/20 px-3 py-1">
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
              <span className="text-[10px] font-black tracking-wide text-primary uppercase">
                {game.gameTime}' Min
              </span>
            </div>
          </div>

          {/* Away Team */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div className="absolute -inset-2 animate-pulse rounded-full bg-primary/20 blur-md" />
              <img
                src={`https://imagecache.365scores.com/image/upload/f_auto,w_64/competitors/${game.awayCompetitor.id}`}
                className="relative h-14 w-14 transition-transform hover:scale-110"
                alt={game.awayCompetitor.name}
              />
            </div>
            <span className="text-xs font-bold text-white/80">{game.awayCompetitor.name}</span>
          </div>
        </div>

        {/* Dismiss hint */}
        <p className="animate-pulse text-[10px] font-medium tracking-wide text-white/40 uppercase">
          Tap anywhere to dismiss
        </p>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  );
}
