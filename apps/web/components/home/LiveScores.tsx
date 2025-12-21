'use client';

import { formatDateForAPI, formatDisplayDate } from '@/lib/utils';
import { useEffect, useMemo, useRef, useState } from 'react';
import useSWR from 'swr';

import { Game } from '@/trpc/types';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function LiveScores() {
  // 1. Manage State for Date (Format: DD/MM/YYYY)
  const [currentDate, setCurrentDate] = useState(new Date());

  // 2. Fetch data with dynamic date param
  const { data, error, isLoading } = useSWR<Game[]>(
    `${process.env.NEXT_PUBLIC_API_URL}/live-matches?date=${formatDateForAPI(currentDate)}`,
    fetcher,
    { refreshInterval: 60000 }, // Higher frequency for live scores
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
    return (
      <div className="p-8 text-center text-green-400 font-bold">Failed to sync live data.</div>
    );

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
            <h2 className="text-3xl font-black tracking-tight bg-linear-to-r from-white to-white/50 bg-clip-text text-transparent">
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

          <div className="w-px h-4 bg-white/10 mx-1" />

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
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-600"></span>
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
  const [showGoalPopup, setShowGoalPopup] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isLive = game.statusGroup === 3;
  const isFinished = game.statusGroup === 4;
  const isScheduled = game.statusGroup === 2;

  const currentTotalScore = game.homeCompetitor.score + game.awayCompetitor.score;
  const prevScoreRef = useRef(currentTotalScore);

  useEffect(() => {
    if (isLive && currentTotalScore > prevScoreRef.current) {
      // Trigger Popup & Flash
      setShowGoalPopup(true);
      const timer = setTimeout(() => setShowGoalPopup(false), 8000); // Show for 8 seconds
      return () => clearTimeout(timer);
    }
    prevScoreRef.current = currentTotalScore;
  }, [currentTotalScore, isLive]);

  const progressPercent = Math.min((game.gameTime / 90) * 100, 100);

  return (
    <>
      <div
        onClick={() => setIsModalOpen(true)}
        className={`cursor-pointer group w-[320px] rounded-2xl overflow-hidden transition-all duration-500 snap-start shrink-0 border flex flex-col relative ${
          showGoalPopup
            ? 'border-yellow-400 scale-[1.02] z-50 shadow-[0_0_40px_rgba(250,204,21,0.3)]'
            : isLive
              ? 'bg-linear-to-br from-white/10 to-transparent backdrop-blur-xl border-white/20 shadow-2xl'
              : 'bg-white/3 border-white/10'
        }`}
      >
        {/* --- GOAL POPUP OVERLAY --- */}
        {showGoalPopup && (
          <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-in fade-in zoom-in duration-300">
            <div className="bg-yellow-400 text-black px-4 py-1 rounded-full font-black text-[10px] uppercase tracking-[0.3em] mb-4 animate-bounce">
              Goal Scored!
            </div>
            <div className="flex items-center gap-4 w-full justify-around">
              <img
                src={`https://imagecache.365scores.com/image/upload/f_auto,w_64/competitors/${game.homeCompetitor.id}`}
                className="w-12 h-12"
                alt=""
              />
              <div className="text-center">
                <div className="text-3xl font-black text-white">
                  {game.homeCompetitor.score} - {game.awayCompetitor.score}
                </div>
                <div className="text-[10px] text-yellow-400 font-bold uppercase">
                  {game.gameTime}' Min
                </div>
              </div>
              <img
                src={`https://imagecache.365scores.com/image/upload/f_auto,w_64/competitors/${game.awayCompetitor.id}`}
                className="w-12 h-12"
                alt=""
              />
            </div>
            <button
              onClick={() => setShowGoalPopup(false)}
              className="mt-6 text-[9px] text-white/40 uppercase font-bold hover:text-white"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Main Content */}
        <div className="p-6 flex-1">
          {/* --- HEADER --- */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              {isLive ? (
                <div className="flex items-center gap-2 bg-green-500/20 px-3 py-1 rounded border border-green-500/30">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-600"></span>
                  </span>
                  <span className="text-[11px] font-black text-green-400 uppercase tabular-nums">
                    {game.gameTime}' min
                  </span>
                </div>
              ) : (
                <span className="text-[11px] font-black text-white/40 uppercase tracking-widest">
                  {isFinished
                    ? 'Full Time'
                    : new Date(game.startTime).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false,
                      })}
                </span>
              )}
            </div>
            <span className="text-[10px] font-bold text-white/30 uppercase truncate max-w-30">
              {game.competitionDisplayName}
            </span>
          </div>

          {/* --- TEAMS --- */}
          <div className="space-y-4">
            {[game.homeCompetitor, game.awayCompetitor].map((team, idx) => {
              const isWinner =
                isFinished &&
                team.score > (idx === 0 ? game.awayCompetitor.score : game.homeCompetitor.score);
              return (
                <div key={idx} className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className={`p-1.5 rounded-xl ${isLive ? 'bg-white/10' : 'bg-white/5'}`}>
                      <img
                        src={`https://imagecache.365scores.com/image/upload/f_auto,w_48/competitors/${team.id}`}
                        className="w-7 h-7"
                        alt=""
                      />
                    </div>
                    <span
                      className={`text-base tracking-tight ${isWinner || isLive ? 'font-black text-white' : 'font-medium text-white/70'}`}
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

        {/* --- VISUAL PROGRESS BAR --- */}
        {!isScheduled && (
          <div className="w-full h-1.5 bg-white/5 relative">
            <div
              className={`h-full transition-all duration-1000 ease-out ${
                isLive ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-white/10'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}
      </div>
      {isModalOpen && <MatchCenter gameId={game.id} onClose={() => setIsModalOpen(false)} />}
    </>
  );
}

export function MatchCenter({ gameId, onClose }: { gameId: number; onClose: () => void }) {
  // 2. Use the fetcher here. SWR won't fetch if the key (URL) is null.
  const {
    data: match,
    error,
    isLoading,
  } = useSWR(
    gameId ? `${process.env.NEXT_PUBLIC_API_URL}/match-details?id=${gameId}` : null,
    fetcher,
    { refreshInterval: 30000 }, // Optional: Refresh stats every 30s
  );

  if (error)
    return (
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <div className="text-white bg-red-500/20 p-6 rounded-2xl border border-red-500/50">
          Error loading match details. Click to close.
        </div>
      </div>
    );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/90 backdrop-blur-xl animate-in fade-in"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl bg-[#0c0c0c] border border-white/10 rounded-[40px] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in zoom-in duration-300">
        {isLoading ? (
          <div className="p-20 flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin" />
            <p className="text-white/40 font-bold uppercase text-[10px] tracking-widest">
              Loading Live Stats...
            </p>
          </div>
        ) : (
          <>
            {/* Header Section */}
            <div className="p-8 border-b border-white/5 bg-white/[0.02]">
              <div className="flex justify-between items-center">
                <div className="text-center flex-1">
                  <img
                    src={`https://imagecache.365scores.com/image/upload/f_auto,w_80/competitors/${match.homeCompetitor.id}`}
                    className="w-16 h-16 mx-auto mb-3"
                  />
                  <div className="font-black text-white text-sm">{match.homeCompetitor.name}</div>
                </div>

                <div className="text-center px-8">
                  <div className="text-5xl font-black tracking-tighter text-white">
                    {match.homeCompetitor.score} - {match.awayCompetitor.score}
                  </div>
                  <div className="text-[10px] font-black text-green-400 mt-2 uppercase tracking-widest bg-green-500/10 px-3 py-1 rounded-full">
                    {match.statusText || `${match.gameTime}'`}
                  </div>
                </div>

                <div className="text-center flex-1">
                  <img
                    src={`https://imagecache.365scores.com/image/upload/f_auto,w_80/competitors/${match.awayCompetitor.id}`}
                    className="w-16 h-16 mx-auto mb-3"
                  />
                  <div className="font-black text-white text-sm">{match.awayCompetitor.name}</div>
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
              {/* Stats Section */}
              {match.stats && match.stats.length > 0 && (
                <div>
                  <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-6 text-center">
                    Match Statistics
                  </h3>
                  <div className="space-y-6">
                    {match.stats.map((stat: any, i: number) => {
                      const home = parseFloat(stat.homeValue) || 0;
                      const away = parseFloat(stat.awayValue) || 0;
                      const total = home + away;
                      const homePercent = total === 0 ? 50 : (home / total) * 100;

                      return (
                        <div key={i} className="space-y-2">
                          <div className="flex justify-between text-[11px] font-bold px-1 uppercase tracking-tight">
                            <span className="text-white">{stat.homeValue}</span>
                            <span className="text-white/40">{stat.name}</span>
                            <span className="text-white">{stat.awayValue}</span>
                          </div>
                          <div className="h-1.5 w-full bg-white/5 rounded-full flex overflow-hidden">
                            <div
                              className="h-full bg-white/40 transition-all duration-500"
                              style={{ width: `${homePercent}%` }}
                            />
                            <div
                              className="h-full bg-green-500 transition-all duration-500"
                              style={{ width: `${100 - homePercent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Events Section */}
              {match.events && (
                <div>
                  <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-6 text-center">
                    Timeline
                  </h3>
                  <div className="space-y-3">
                    {match.events.map((event: any, i: number) => (
                      <div
                        key={i}
                        className={`flex items-center gap-4 ${event.isHome ? 'flex-row' : 'flex-row-reverse'}`}
                      >
                        <div className="text-[10px] font-black text-white/20 w-8">
                          {event.time}'
                        </div>
                        <div
                          className={`flex-1 p-3 rounded-2xl border border-white/5 ${event.isHome ? 'bg-white/5' : 'bg-green-500/10 border-green-500/10'}`}
                        >
                          <div className="text-xs font-bold text-white">{event.playerName}</div>
                          <div className="text-[9px] text-white/40 uppercase font-medium">
                            {event.typeText}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
