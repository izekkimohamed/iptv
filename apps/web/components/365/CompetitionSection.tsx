import { Game } from '@/trpc/types';
import { ChevronRight, Trophy, X } from 'lucide-react';
import { useState } from 'react';
import { MatchCard } from './MatchCard';

interface CompetitionSectionProps {
  competitionName: string;
  competitionId: number;
  matches: Game[];
}

export function CompetitionSection({
  competitionName,
  competitionId,
  matches,
}: CompetitionSectionProps) {
  const [imageError, setImageError] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Calculate stats
  const liveCount = matches.filter((m) => m.statusGroup === 3).length;
  const finishedCount = matches.filter((m) => m.statusGroup === 4).length;
  const upcomingCount = matches.filter((m) => m.statusGroup === 2).length;

  return (
    <>
      <div className="group space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-3">
            {/* Competition Logo */}
            <div className="relative">
              <div className="absolute -inset-2 rounded-2xl bg-linear-to-br from-white/10 to-transparent opacity-0 blur-xl transition-all duration-300 group-hover:opacity-100" />
              {!imageError ? (
                <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-white/10 to-white/5 p-2 shadow-lg backdrop-blur-sm">
                  <img
                    src={`https://imagecache.365scores.com/image/upload/f_auto,w_48/competitions/${competitionId}`}
                    alt={competitionName}
                    className="relative h-full w-full object-contain transition-transform duration-300 group-hover:scale-110"
                    onError={() => setImageError(true)}
                  />
                </div>
              ) : (
                <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-white/10 to-white/5 shadow-lg backdrop-blur-sm">
                  <Trophy className="h-5 w-5 text-white/40" />
                </div>
              )}
            </div>

            {/* Title and Stats */}
            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-black tracking-[0.15em] text-white/80 uppercase">
                {competitionName}
              </h3>
              <div className="flex items-center gap-3 text-[10px] font-bold uppercase">
                {liveCount > 0 && (
                  <span className="flex items-center gap-1.5 text-green-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                    {liveCount} Live
                  </span>
                )}
                {finishedCount > 0 && (
                  <span className="text-white/40">{finishedCount} Finished</span>
                )}
                {upcomingCount > 0 && (
                  <span className="text-white/40">{upcomingCount} Upcoming</span>
                )}
              </div>
            </div>
          </div>

          {/* View All Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="group/btn flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10 active:scale-95"
          >
            <span className="text-xs font-bold text-white/60 group-hover/btn:text-white">
              View All
            </span>
            <ChevronRight className="h-4 w-4 text-white/40 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:text-white" />
          </button>
        </div>

        {/* Horizontal Scroll - Show first 5 matches */}
        <div className="no-scrollbar flex snap-x gap-4 overflow-x-auto pb-4">
          {matches.map((game) => (
            <div key={game.id} className="snap-start">
              <MatchCard game={game} />
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="animate-in fade-in absolute inset-0 bg-black/15 backdrop-blur-xl duration-300"
            onClick={() => setIsModalOpen(false)}
          />

          {/* Modal Content */}
          <div className="animate-in zoom-in relative flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-4xl border border-white/10 bg-linear-to-br from-black/10 to-black/5 shadow-2xl duration-300">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 p-6">
              <div className="flex items-center gap-4">
                {!imageError ? (
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-white/10 to-white/5 p-2">
                    <img
                      src={`https://imagecache.365scores.com/image/upload/f_auto,w_48/competitions/${competitionId}`}
                      alt={competitionName}
                      className="h-full w-full object-contain"
                      onError={() => setImageError(true)}
                    />
                  </div>
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-white/10 to-white/5">
                    <Trophy className="h-6 w-6 text-white/40" />
                  </div>
                )}
                <div className="flex flex-col gap-1">
                  <h2 className="text-xl font-black tracking-tight text-white">
                    {competitionName}
                  </h2>
                  <div className="flex items-center gap-3 text-xs font-bold uppercase">
                    {liveCount > 0 && (
                      <span className="flex items-center gap-1.5 text-green-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                        {liveCount} Live
                      </span>
                    )}
                    {finishedCount > 0 && (
                      <span className="text-white/40">{finishedCount} Finished</span>
                    )}
                    {upcomingCount > 0 && (
                      <span className="text-white/40">{upcomingCount} Upcoming</span>
                    )}
                    <span className="text-white/20">•</span>
                    <span className="text-white/60">{matches.length} Total</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="group rounded-full border border-white/10 bg-white/5 p-3 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10 hover:rotate-90 active:scale-90"
              >
                <X className="h-5 w-5 text-white/60 transition-colors group-hover:text-white" />
              </button>
            </div>

            {/* Matches Grid */}
            <div className="no-scrollbar flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {matches.map((game, idx) => (
                  <div
                    key={game.id}
                    className="animate-in fade-in zoom-in duration-500"
                    style={{ animationDelay: `${idx * 30}ms` }}
                  >
                    <MatchCard game={game} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
