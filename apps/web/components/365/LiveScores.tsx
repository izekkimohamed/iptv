'use client';

import { useCallback, useMemo, useState } from 'react';
import useSWR from 'swr';

import { formatDateForAPI, formatDisplayDate } from '@/lib/utils';
import { Game } from '@/trpc/types';
import { WifiOff } from 'lucide-react';
import { CompetitionSection } from './CompetitionSection';
import { DateNavigator } from './DateNavigator';
import { LiveMatchesSection } from './LiveMatchesSection';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function LiveScores() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isOnline, setIsOnline] = useState(true);

  const { data, error, isLoading, mutate } = useSWR<Game[]>(
    `${process.env.NEXT_PUBLIC_API_URL}/live-matches?date=${formatDateForAPI(currentDate)}`,
    fetcher,
    {
      refreshInterval: currentDate.getDay() === new Date().getDay() ? 60000 : 0,
      onError: () => setIsOnline(false),
      onSuccess: () => setIsOnline(true),
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    },
  );

  const games = useMemo(() => data || [], [data]);

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

  const handlePrevDay = useCallback(() => {
    const prev = new Date(currentDate);
    prev.setDate(prev.getDate() - 1);
    setCurrentDate(prev);
  }, [currentDate]);

  const handleNextDay = useCallback(() => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + 1);
    setCurrentDate(next);
  }, [currentDate]);

  const handleGoToToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  const handleRefresh = useCallback(() => {
    mutate();
  }, [mutate]);

  if (error)
    return (
      <div className="flex h-full w-full flex-col items-center justify-center space-y-6 p-8">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-8 text-center backdrop-blur-xl">
          <WifiOff className="mx-auto mb-4 h-12 w-12 text-red-400" />
          <h3 className="mb-2 text-xl font-black text-red-400">Connection Lost</h3>
          <p className="mb-6 text-sm text-white/60">
            Failed to sync live data. Check your connection.
          </p>
          <button
            onClick={handleRefresh}
            className="rounded-xl bg-red-500/20 px-6 py-3 font-bold text-red-400 transition-all hover:bg-red-500/30 active:scale-95"
          >
            Try Again
          </button>
        </div>
      </div>
    );

  const hasNoGames = !isLoading && games.length === 0;

  return (
    <div className="h-full w-full space-y-8 overflow-y-auto p-4 text-white">
      <DateNavigator
        currentDate={currentDate}
        onPrevDay={handlePrevDay}
        onNextDay={handleNextDay}
        onGoToToday={handleGoToToday}
        onRefresh={handleRefresh}
        isLoading={isLoading}
      />

      {isLoading && (
        <div className="mx-auto max-w-6xl space-y-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-3xl bg-linear-to-br from-white/5 to-white/2 p-6"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="mb-4 h-4 w-32 rounded-full bg-white/10" />
              <div className="space-y-3">
                <div className="h-20 rounded-2xl bg-white/5" />
                <div className="h-20 rounded-2xl bg-white/5" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && liveMatches.length > 0 && <LiveMatchesSection matches={liveMatches} />}

      {!isLoading && Object.keys(groupedOtherGames).length > 0 && (
        <div className="mx-auto max-w-6xl space-y-12">
          {Object.entries(groupedOtherGames).map(([compName, matches], idx) => (
            <div
              key={compName}
              className="animate-in fade-in slide-in-from-bottom duration-500"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <CompetitionSection
                competitionName={compName}
                competitionId={matches[0].competitionId}
                matches={matches}
              />
            </div>
          ))}
        </div>
      )}

      {hasNoGames && (
        <div className="mx-auto flex max-w-2xl flex-col items-center justify-center py-20">
          <div className="mb-6 rounded-full bg-white/5 p-8">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white/20"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
          </div>
          <h3 className="mb-2 text-2xl font-black text-white/40">No Matches Scheduled</h3>
          <p className="mb-8 text-center text-sm text-white/30">
            There are no matches scheduled for {formatDisplayDate(currentDate)}
          </p>
          <button
            onClick={handleGoToToday}
            className="rounded-xl bg-white/10 px-6 py-3 font-bold text-white transition-all hover:bg-white/20 active:scale-95"
          >
            Go to Today
          </button>
        </div>
      )}
    </div>
  );
}
