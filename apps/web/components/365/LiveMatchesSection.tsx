import { Game } from '@/trpc/types';
import { Radio } from 'lucide-react';
import { MatchCard } from './MatchCard';

interface LiveMatchesSectionProps {
  matches: Game[];
}

export function LiveMatchesSection({ matches }: LiveMatchesSectionProps) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom mx-auto max-w-6xl space-y-6 duration-700">
      {/* Enhanced Header */}
      <div className="group flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <h2 className="flex items-center gap-2 text-lg font-black tracking-tight text-white">
              <Radio className="h-5 w-5 text-green-400" />
              Live Matches
            </h2>
            <p className="text-[10px] font-medium tracking-wide text-white/40 uppercase">
              {matches.length} {matches.length === 1 ? 'Match' : 'Matches'} in Progress
            </p>
          </div>
        </div>

        {/* Live badge */}
        <div className="flex items-center gap-2 rounded-full border border-green-500/30 bg-linear-to-r from-green-500/20 to-green-500/10 px-4 py-2 backdrop-blur-sm">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
          </span>
          <span className="text-xs font-black tracking-wide text-green-400 uppercase">
            Live Now
          </span>
        </div>
      </div>

      {/* Scrollable matches with enhanced styling */}
      <div className="relative">
        <div className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto px-2 pb-4 pt-2">
          {matches.map((game, idx) => (
            <div
              key={game.id}
              className="animate-in fade-in zoom-in snap-start duration-500"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <MatchCard game={game} priority />
            </div>
          ))}
        </div>
      </div>

      {/* Decorative line */}
      <div className="mx-auto h-px w-full max-w-4xl bg-linear-to-r from-transparent via-white/10 to-transparent" />
    </div>
  );
}
