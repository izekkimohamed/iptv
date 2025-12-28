'use client';

import {
  AlertCircle,
  MapPin,
  RectangleVertical,
  Volleyball, // Web equivalent of VolleyballIcon
  X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import useSWR from 'swr';

import { formatDateForAPI, formatDisplayDate } from '@/lib/utils';
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
      <div className="p-8 text-center font-bold text-green-400">Failed to sync live data.</div>
    );

  return (
    <div className="h-full w-full space-y-8 overflow-y-auto p-4 text-white">
      {/* --- DATE NAVIGATOR --- */}
      {/* --- ENHANCED DATE NAVIGATOR --- */}
      <div className="mx-auto mb-10 flex max-w-6xl items-center justify-between border-b border-white/10 pb-6">
        <div className="flex flex-col gap-1">
          <div className="mb-1 flex items-center gap-2 text-white/40">
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
            <span className="text-[10px] font-black tracking-[0.2em] uppercase">
              Matchday Schedule
            </span>
          </div>
          <div className="flex items-center gap-4">
            <h2 className="bg-linear-to-r from-white to-white/50 bg-clip-text text-3xl font-black tracking-tight text-transparent">
              {formatDisplayDate(currentDate)}
            </h2>
            {/* Visual indicator if it's not today */}
            {new Date().toDateString() !== currentDate.toDateString() && (
              <button
                onClick={handleGoToToday}
                className="rounded-full bg-white px-3 py-1 text-[10px] font-black tracking-tighter text-black uppercase transition-colors hover:bg-white/90"
              >
                Return Today
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-1">
          <button
            onClick={handlePrevDay}
            className="group rounded-xl p-3 transition-all hover:bg-white/10 active:scale-95"
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

          <div className="mx-1 h-4 w-px bg-white/10" />

          <button
            onClick={handleNextDay}
            className="group rounded-xl p-3 transition-all hover:bg-white/10 active:scale-95"
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
        <div className="mx-auto max-w-6xl animate-pulse space-y-4">
          <div className="h-40 rounded-3xl bg-white/5" />
          <div className="h-20 rounded-xl bg-white/5" />
          <div className="h-20 rounded-xl bg-white/5" />
        </div>
      )}

      {/* --- LIVE EVENTS CAROUSEL --- */}
      {!isLoading && liveMatches.length > 0 && (
        <div className="mx-auto max-w-6xl space-y-4">
          <div className="flex items-center gap-2 px-1">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-green-600"></span>
            </span>
            <h2 className="text-sm font-black tracking-widest uppercase">Live Now</h2>
          </div>

          <div className="no-scrollbar flex snap-x gap-4 overflow-x-auto pb-4">
            {liveMatches.map((game) => (
              <MatchCard key={game.id} game={game} />
            ))}
          </div>
        </div>
      )}

      {/* --- COMPETITION GRIDS --- */}
      {!isLoading && (
        <div className="mx-auto max-w-6xl space-y-12">
          {Object.entries(groupedOtherGames).map(([compName, matches]) => {
            // Get the ID from the first match to fetch the competition logo
            const compId = matches[0].competitionId;

            return (
              <div key={compName} className="group space-y-4">
                {/* Header with Logo */}
                <div className="flex items-center gap-3 px-1">
                  <div className="relative">
                    <div className="absolute -inset-1 rounded-full bg-white/10 blur-sm transition-all group-hover:bg-white/20"></div>
                    <img
                      src={`https://imagecache.365scores.com/image/upload/f_auto,w_48/competitions/${compId}`}
                      alt={compName}
                      className="relative h-8 w-8 object-contain"
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                  </div>
                  <h3 className="text-sm font-black tracking-[0.15em] text-white/80 uppercase">
                    {compName}
                  </h3>
                </div>

                {/* Horizontal Grid / Scroll Area */}
                <div className="no-scrollbar flex snap-x gap-4 overflow-x-auto pb-4">
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
        className={`group relative flex w-[320px] shrink-0 cursor-pointer snap-start flex-col overflow-hidden rounded-2xl border transition-all duration-500 ${
          showGoalPopup
            ? 'z-50 scale-[1.02] border-yellow-400 shadow-[0_0_40px_rgba(250,204,21,0.3)]'
            : isLive
              ? 'border-white/20 bg-linear-to-br from-white/10 to-transparent shadow-2xl backdrop-blur-xl'
              : 'border-white/10 bg-white/3'
        }`}
      >
        {/* --- GOAL POPUP OVERLAY --- */}
        {showGoalPopup && (
          <div className="animate-in fade-in zoom-in absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/60 p-4 backdrop-blur-md duration-300">
            <div className="mb-4 animate-bounce rounded-full bg-yellow-400 px-4 py-1 text-[10px] font-black tracking-[0.3em] text-black uppercase">
              Goal Scored!
            </div>
            <div className="flex w-full items-center justify-around gap-4">
              <img
                src={`https://imagecache.365scores.com/image/upload/f_auto,w_64/competitors/${game.homeCompetitor.id}`}
                className="h-12 w-12"
                alt=""
              />
              <div className="text-center">
                <div className="text-3xl font-black text-white">
                  {game.homeCompetitor.score} - {game.awayCompetitor.score}
                </div>
                <div className="text-[10px] font-bold text-yellow-400 uppercase">
                  {game.gameTime}' Min
                </div>
              </div>
              <img
                src={`https://imagecache.365scores.com/image/upload/f_auto,w_64/competitors/${game.awayCompetitor.id}`}
                className="h-12 w-12"
                alt=""
              />
            </div>
            <button
              onClick={() => setShowGoalPopup(false)}
              className="mt-6 text-[9px] font-bold text-white/40 uppercase hover:text-white"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* --- HEADER --- */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isLive ? (
                <div className="flex items-center gap-2 rounded border border-green-500/30 bg-green-500/20 px-3 py-1">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-green-600"></span>
                  </span>
                  <span className="text-[11px] font-black text-green-400 uppercase tabular-nums">
                    {game.gameTime}' min
                  </span>
                </div>
              ) : (
                <span className="text-[11px] font-black tracking-widest text-white/40 uppercase">
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
            <span className="max-w-30 truncate text-[10px] font-bold text-white/30 uppercase">
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
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`rounded-xl p-1.5 ${isLive ? 'bg-white/10' : 'bg-white/5'}`}>
                      <img
                        src={`https://imagecache.365scores.com/image/upload/f_auto,w_48/competitors/${team.id}`}
                        className="h-7 w-7"
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
          <div className="relative h-1.5 w-full bg-white/5">
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

// 1. Helper Component for Event Icons (Ported from Mobile)
const EventIcon = ({ type, color, size = 14 }: { type: string; color: string; size?: number }) => {
  if (type.includes('Goal')) return <Volleyball size={size} color={color} fill={color} />;
  if (type.includes('Card')) return <RectangleVertical size={size} color={color} fill={color} />;
  return <AlertCircle size={size} color={color} />;
};

export function MatchCenter({ gameId, onClose }: { gameId: number; onClose: () => void }) {
  const {
    data: match,
    error,
    isLoading,
  } = useSWR(
    gameId ? `${process.env.NEXT_PUBLIC_API_URL}/match-details?id=${gameId}` : null,
    fetcher,
    { refreshInterval: 30000 },
  );

  // 2. Helper Logic (Ported from Mobile)
  const getPlayerName = (playerId: number) => {
    if (!match?.members) return 'Player';
    const member = match.members.find((m: any) => m.id === playerId);
    return member ? member.name : 'Unknown Player';
  };

  const getFilteredEvents = () => {
    if (!match?.events) return [];
    return match.events.filter((e: any) => {
      const name = e.eventType?.name || '';
      return name.includes('Goal') || name.includes('Yellow Card') || name.includes('Red Card');
    });
  };

  const filteredEvents = getFilteredEvents();
  const startTime = match?.startTime ? new Date(match.startTime) : null;

  const formattedDate =
    startTime?.toLocaleDateString(undefined, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    }) || '';

  const formattedTime =
    startTime?.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    }) || '';

  if (error)
    return (
      <div
        className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <div className="rounded-2xl border border-red-500/50 bg-red-500/20 p-6 text-white">
          Error loading match details. Click to close.
        </div>
      </div>
    );

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="animate-in fade-in absolute inset-0 bg-black/90 backdrop-blur-xl"
        onClick={onClose}
      />

      {/* Main Modal Content */}
      <div className="animate-in zoom-in relative flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-[30px] border border-white/10 bg-[#0f0f0f] shadow-2xl duration-300">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-20 rounded-full bg-white/10 p-2 transition-colors hover:bg-white/20"
        >
          <X className="h-5 w-5 text-white" />
        </button>

        {isLoading ? (
          <div className="flex h-96 flex-col items-center justify-center space-y-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-green-500/20 border-t-green-500" />
          </div>
        ) : (
          <>
            {/* Scrollable Content */}
            <div className="no-scrollbar overflow-y-auto pb-10">
              {/* Header Top: Competition & Date */}
              <div className="mt-8 mb-2 flex flex-col items-center">
                <div className="text-sm font-bold tracking-widest text-white/60 uppercase">
                  {match.competitionDisplayName}
                </div>
                <div className="mt-1 text-xs text-white/40">
                  {formattedDate} • {formattedTime}
                </div>
              </div>

              {/* Match Score Header */}
              <div className="flex items-center justify-between border-b border-white/5 px-8 py-6">
                {/* Home Team */}
                <div className="flex w-24 flex-col items-center gap-2">
                  <img
                    src={`https://imagecache.365scores.com/image/upload/f_auto,w_80/competitors/${match.homeCompetitor.id}`}
                    className="h-14 w-14 object-contain"
                    alt={match.homeCompetitor.name}
                  />
                  <div className="line-clamp-2 text-center text-xs leading-tight font-bold text-white">
                    {match.homeCompetitor.name}
                  </div>
                </div>

                {/* Score & Status */}
                <div className="flex flex-col items-center">
                  <div className="text-4xl font-black tracking-tighter text-white">
                    {match.homeCompetitor.score} - {match.awayCompetitor.score}
                  </div>
                  <div className="mt-2 rounded-md bg-white/5 px-3 py-1">
                    <div className="text-xs font-extrabold tracking-wide text-green-500 uppercase">
                      {match.gameTimeDisplay || match.statusText}
                    </div>
                  </div>
                </div>

                {/* Away Team */}
                <div className="flex w-24 flex-col items-center gap-2">
                  <img
                    src={`https://imagecache.365scores.com/image/upload/f_auto,w_80/competitors/${match.awayCompetitor.id}`}
                    className="h-14 w-14 object-contain"
                    alt={match.awayCompetitor.name}
                  />
                  <div className="line-clamp-2 text-center text-xs leading-tight font-bold text-white">
                    {match.awayCompetitor.name}
                  </div>
                </div>
              </div>

              {/* Venue Info */}
              {match.venue && (
                <div className="mt-6 mb-8 flex justify-center">
                  <div className="flex items-center gap-2 rounded-full border border-white/5 bg-[#1a1a1a] px-4 py-1.5">
                    <MapPin className="h-3.5 w-3.5 text-white/60" />
                    <span className="text-xs font-medium text-white/60">{match.venue.name}</span>
                  </div>
                </div>
              )}

              {/* Timeline Section */}
              <div className="px-4">
                <div className="mb-6 text-center text-[10px] font-extrabold tracking-[0.2em] text-white/30 uppercase">
                  Key Moments
                </div>

                <div className="relative">
                  {/* Vertical Center Line */}
                  <div className="absolute top-0 bottom-0 left-1/2 -ml-px w-px bg-white/10" />

                  {filteredEvents.map((event: any, i: number) => {
                    const isHome = event.competitorId === match.homeCompetitor.id;
                    const eventName = event.eventType?.name || 'Event';

                    let eventColor = '#94a3b8';
                    if (eventName.includes('Goal')) eventColor = '#CCCCCC';
                    else if (eventName.includes('Yellow')) eventColor = '#FDE047';
                    else if (eventName.includes('Red')) eventColor = '#EF4444';

                    return (
                      <div
                        key={i}
                        className={`mb-6 flex w-full items-center ${
                          isHome ? 'flex-row' : 'flex-row-reverse'
                        }`}
                      >
                        {/* Event Content Side */}
                        <div
                          className={`flex flex-1 ${
                            isHome ? 'justify-end pr-10' : 'justify-start pl-10'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            {/* For Home: Text then Icon. For Away: Icon then Text (handled by flex-row/reverse above, but specific order needs logic if we want strict mirroring) */}
                            {isHome ? (
                              <>
                                <span className="text-sm font-bold text-white">
                                  {getPlayerName(event.playerId)}
                                </span>
                                <EventIcon type={eventName} color={eventColor} />
                              </>
                            ) : (
                              <>
                                <EventIcon type={eventName} color={eventColor} />
                                <span className="text-sm font-bold text-white">
                                  {getPlayerName(event.playerId)}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Center Time Bubble */}
                        <div className="absolute left-1/2 z-10 -ml-4.5 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-[#1a1a1a] shadow-lg">
                          <span className="text-[10px] font-bold text-white">
                            {event.gameTimeDisplay}
                          </span>
                        </div>

                        {/* Empty Space for Balance */}
                        <div className="flex-1" />
                      </div>
                    );
                  })}

                  {filteredEvents.length === 0 && (
                    <div className="py-10 text-center text-xs text-white/20">
                      No key events recorded yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
