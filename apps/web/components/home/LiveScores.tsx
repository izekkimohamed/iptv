'use client';

import { useMemo } from 'react';
import useSWR from 'swr';

// --- Types ---
interface Competitor {
  id: number;
  name: string;
  score: number;
}

interface Game {
  id: number;
  competitionId: number;
  competitionDisplayName: string;
  startTime: string;
  statusGroup: number;
  statusText: string;
  shortStatusText: string;
  homeCompetitor: Competitor;
  awayCompetitor: Competitor;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function LiveScores() {
  const { data, error, isLoading } = useSWR('http://localhost:3001/api/live-matches', fetcher, {
    refreshInterval: 60000,
  });

  const games: Game[] = useMemo(() => {
    if (!data) return [];
    return Array.isArray(data) ? data : data.games || [];
  }, [data]);

  const liveMatches = useMemo(() => games.filter((g) => g.statusGroup === 3), [games]);

  const groupedOtherGames = useMemo(() => {
    const others = games.filter((g) => g.statusGroup !== 3);
    return others.reduce(
      (acc, game) => {
        const key = game.competitionDisplayName;
        if (!acc[key]) acc[key] = [];
        acc[key].push(game);
        return acc;
      },
      {} as Record<string, Game[]>,
    );
  }, [games]);

  if (error) return <div className="p-8 text-center text-red-400">Error syncing data.</div>;

  return (
    <div className="w-full space-y-8 p-4 h-full overflow-y-scroll">
      {/* --- LIVE EVENTS CAROUSEL --- */}
      {liveMatches.length > 0 && (
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
              </span>
              <h2 className="text-sm font-black uppercase tracking-widest text-white">
                Live Clock
              </h2>
            </div>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar snap-x">
            {liveMatches.map((game) => (
              <div
                key={game.id}
                className="min-w-[300px] bg-gradient-to-br from-white/10 to-white/[0.02] backdrop-blur-xl rounded-3xl p-5 border border-white/10 snap-center shadow-2xl"
              >
                {/* Match Header & Play Time */}
                <div className="flex justify-between items-center mb-6">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-tight truncate max-w-[140px]">
                      {game.competitionDisplayName}
                    </span>
                  </div>

                  {/* PLAY TIME INDICATOR */}
                  <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-full border border-green-500/30">
                    <span className="text-xs font-black text-green-400 animate-pulse">
                      {game.statusText}
                      <span className="ml-0.5">'</span>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {[game.homeCompetitor, game.awayCompetitor].map((team, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <img
                            src={`https://imagecache.365scores.com/image/upload/f_auto,w_48/competitors/${team.id}`}
                            className="w-8 h-8 object-contain"
                            alt=""
                          />
                        </div>
                        <span className="text-base font-bold text-white leading-none">
                          {team.name}
                        </span>
                      </div>
                      <span className="text-3xl font-black text-white tabular-nums">
                        {team.score}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Status Subtext */}
                <div className="mt-4 pt-3 border-t border-white/5 flex justify-center">
                  <span className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em]">
                    Currently In Play
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- STANDARD LIST VIEW --- */}
      <div className="max-w-6xl mx-auto space-y-6">
        {Object.entries(groupedOtherGames).map(([compName, matches]) => (
          <div
            key={compName}
            className="rounded-3xl overflow-hidden bg-white/[0.02] border border-white/5"
          >
            <div className="bg-white/[0.04] px-5 py-3 flex items-center gap-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/50">
                {compName}
              </span>
            </div>

            <div className="divide-y divide-white/5">
              {matches.map((game) => (
                <div
                  key={game.id}
                  className="flex items-center p-5 hover:bg-white/[0.03] transition-all"
                >
                  <div className="w-16 flex flex-col items-start border-r border-white/10 mr-4">
                    <span className="text-xs font-bold text-white">
                      {game.statusGroup === 4
                        ? 'FT'
                        : new Date(game.startTime).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false,
                          })}
                    </span>
                    <span className="text-[9px] text-white/30 font-bold uppercase">
                      {game.shortStatusText}
                    </span>
                  </div>

                  <div className="flex-1 space-y-3">
                    {[game.homeCompetitor, game.awayCompetitor].map((team, idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <img
                            src={`https://imagecache.365scores.com/image/upload/f_auto,w_32/competitors/${team.id}`}
                            className="w-5 h-5"
                            alt=""
                          />
                          <span
                            className={`text-sm ${game.statusGroup === 4 && team.score > (idx === 0 ? game.awayCompetitor.score : game.homeCompetitor.score) ? 'text-white font-bold' : 'text-white/60'}`}
                          >
                            {team.name}
                          </span>
                        </div>
                        {game.statusGroup !== 2 && (
                          <span className="text-lg font-bold text-white tabular-nums">
                            {team.score}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
