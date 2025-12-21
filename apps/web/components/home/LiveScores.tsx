'use client';

import { formatDateForAPI, formatDisplayDate } from '@/lib/utils';
import { useMemo, useState } from 'react';
import useSWR from 'swr';

// --- Improved Types based on your API response ---
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
  statusGroup: number; // 2: Scheduled, 3: Live, 4: Finished
  statusText: string;
  shortStatusText: string;
  homeCompetitor: Competitor;
  awayCompetitor: Competitor;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function LiveScores() {
  // 1. Manage State for Date (Format: DD/MM/YYYY)
  const [currentDate, setCurrentDate] = useState(new Date());

  // 2. Fetch data with dynamic date param
  const { data, error, isLoading } = useSWR<Game[]>(
    `${process.env.NEXT_PUBLIC_API_URL}/live-matches?date=${formatDateForAPI(currentDate)}`,
    fetcher,
    { refreshInterval: 30000 }, // Higher frequency for live scores
  );

  const games = useMemo(() => data || [], [data]);

  // 3. Optimized filtering
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

  const handlePrevDay = () => {
    const prev = new Date(currentDate);
    prev.setDate(prev.getDate() - 1);
    setCurrentDate(prev);
  };

  const handleNextDay = () => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + 1);
    setCurrentDate(next);
  };

  const handleGoToToday = () => {
    setCurrentDate(new Date());
  };
  if (error)
    return <div className="p-8 text-center text-red-400 font-bold">Failed to sync live data.</div>;

  return (
    <div className="w-full space-y-8 p-4 h-full overflow-y-auto  text-white">
      {/* --- DATE NAVIGATOR --- */}
      {/* --- ENHANCED DATE NAVIGATOR --- */}
      <div className="max-w-6xl mx-auto flex items-center justify-between mb-10 border-b border-white/10 pb-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-white/40 mb-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-calendar"
            >
              <path d="M8 2v4" />
              <path d="M16 2v4" />
              <rect width="18" height="18" x="3" y="4" rx="2" />
              <path d="M3 10h18" />
            </svg>
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">
              Matchday Schedule
            </span>
          </div>
          <div className="flex items-center gap-4">
            <h2 className="text-3xl font-black tracking-tight bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">
              {formatDisplayDate(currentDate)}
            </h2>
            {/* Visual indicator if it's not today */}
            {new Date().toDateString() !== currentDate.toDateString() && (
              <button
                onClick={handleGoToToday}
                className="px-3 py-1 rounded-full bg-white text-black text-[10px] font-black uppercase tracking-tighter hover:bg-white/90 transition-colors"
              >
                Return Today
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-2xl border border-white/10">
          <button
            onClick={handlePrevDay}
            className="p-3 hover:bg-white/10 rounded-xl transition-all active:scale-95 group"
          >
            <span className="sr-only">Previous Day</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white/40 group-hover:text-white"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>

          <div className="w-[1px] h-4 bg-white/10 mx-1" />

          <button
            onClick={handleNextDay}
            className="p-3 hover:bg-white/10 rounded-xl transition-all active:scale-95 group"
          >
            <span className="sr-only">Next Day</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white/40 group-hover:text-white"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="max-w-6xl mx-auto animate-pulse space-y-4">
          <div className="h-40 bg-white/5 rounded-3xl" />
          <div className="h-20 bg-white/5 rounded-xl" />
          <div className="h-20 bg-white/5 rounded-xl" />
        </div>
      )}

      {/* --- LIVE EVENTS CAROUSEL --- */}
      {!isLoading && liveMatches.length > 0 && (
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="flex items-center gap-2 px-1">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
            </span>
            <h2 className="text-sm font-black uppercase tracking-widest">Live Now</h2>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar snap-x">
            {liveMatches.map((game) => (
              <MatchCard key={game.id} game={game} />
            ))}
          </div>
        </div>
      )}

      {/* --- COMPETITION GRIDS --- */}
      {!isLoading && (
        <div className="max-w-6xl mx-auto space-y-12">
          {Object.entries(groupedOtherGames).map(([compName, matches]) => {
            // Get the ID from the first match to fetch the competition logo
            const compId = matches[0].competitionId;

            return (
              <div key={compName} className="group space-y-4">
                {/* Header with Logo */}
                <div className="flex items-center gap-3 px-1">
                  <div className="relative">
                    <div className="absolute -inset-1 bg-white/10 rounded-full blur-sm group-hover:bg-white/20 transition-all"></div>
                    <img
                      src={`https://imagecache.365scores.com/image/upload/f_auto,w_48/competitions/${compId}`}
                      alt={compName}
                      className="relative w-8 h-8 object-contain"
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-[0.15em] text-white/80">
                    {compName}
                  </h3>
                </div>

                {/* Horizontal Grid / Scroll Area */}
                <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar snap-x">
                  {matches.map((game) => (
                    <div key={game.id} className="snap-start">
                      <MatchCard game={game} />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Empty State... */}
        </div>
      )}
    </div>
  );
}

// --- Sub-Components for Cleanliness ---

function MatchCard({ game }: { game: Game }) {
  const isLive = game.statusGroup === 3;
  const isFinished = game.statusGroup === 4;
  const isScheduled = game.statusGroup === 2;

  // Dynamic Wrapper Styles
  const containerStyles =
    'min-w-[320px] bg-gradient-to-br from-white/10 to-transparent backdrop-blur-xl border-white/20 shadow-2xl hover:bg-white/[0.07] hover:border-white/20';

  return (
    <div
      className={`${containerStyles} border rounded-[28px] p-6 transition-all snap-start flex-shrink-0 group`}
    >
      {/* --- HEADER SECTION --- */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          {isLive ? (
            <div className="flex items-center gap-2 bg-red-500/20 px-3 py-1 rounded-full border border-red-500/30">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
              </span>
              <span className="text-[10px] font-black text-red-400 animate-pulse uppercase">
                {game.statusText}'
              </span>
            </div>
          ) : (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-white/20"></span>
              <span className="text-[11px] font-black text-white/40 uppercase tracking-widest">
                {isFinished
                  ? 'Final Result'
                  : new Date(game.startTime).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
              </span>
            </>
          )}
        </div>

        <span className="text-[10px] font-bold text-white/40 uppercase truncate max-w-[120px] text-right">
          {isLive ? game.competitionDisplayName : game.shortStatusText}
        </span>
      </div>

      {/* --- TEAMS SECTION --- */}
      <div className="space-y-4">
        {[game.homeCompetitor, game.awayCompetitor].map((team, idx) => {
          const isWinner =
            isFinished &&
            team.score > (idx === 0 ? game.awayCompetitor.score : game.homeCompetitor.score);

          return (
            <div key={idx} className="flex justify-between items-center">
              <div className="flex items-center gap-4 overflow-hidden">
                <div className={`p-1.5 rounded-xl ${isLive ? 'bg-white/10' : 'bg-white/5'}`}>
                  <img
                    src={`https://imagecache.365scores.com/image/upload/f_auto,w_48/competitors/${team.id}`}
                    className="w-7 h-7 flex-shrink-0"
                    alt={team.name}
                  />
                </div>
                <span
                  className={`text-base truncate tracking-tight ${isWinner || isLive ? 'font-black text-white' : 'font-medium text-white/70'}`}
                >
                  {team.name}
                </span>
              </div>

              {!isScheduled && (
                <span
                  className={`${isLive ? 'text-3xl' : 'text-2xl'} font-black tabular-nums ${isWinner || isLive ? 'text-white' : 'text-white/20'}`}
                >
                  {team.score}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
