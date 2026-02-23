'use client';

import { useCallback, useMemo, useState } from 'react';
import useSWR from 'swr';

import { Game } from '@/trpc/types';
import { formatDateForAPI, formatDisplayDate } from '@repo/utils';
import { Calendar, WifiOff } from 'lucide-react';
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
        <div className="rounded-sm border border-red-500/20 bg-red-500/10 p-8 text-center backdrop-blur-xl">
          <WifiOff className="mx-auto mb-4 h-12 w-12 text-red-400" />
          <h3 className="mb-2 text-xl font-black text-red-400">Connection Lost</h3>
          <p className="mb-6 text-sm text-white/60">
            Failed to sync live data. Check your connection.
          </p>
          <button
            onClick={handleRefresh}
            className="rounded-sm bg-red-500/20 px-6 py-3 font-bold text-red-400 transition-all hover:bg-red-500/30 active:scale-95"
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
        onSelectDate={setCurrentDate}
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
                <div className="h-20 rounded-sm bg-white/5" />
                <div className="h-20 rounded-sm bg-white/5" />
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

      {/* Empty State */}
      {hasNoGames && (
        <div className="mx-auto flex max-w-2xl flex-col items-center justify-center py-20 animate-in fade-in zoom-in duration-700">
          <div className="group relative mb-8">
            <div className="absolute inset-0 animate-pulse rounded-full bg-primary/10 blur-3xl" />
            <div className="relative flex h-32 w-32 items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-xl transition-transform group-hover:scale-110">
              <Calendar className="h-12 w-12 text-primary/40" />
            </div>
          </div>
          <h3 className="mb-2 text-3xl font-black tracking-tight text-white/50">Rest Day</h3>
          <p className="mb-10 text-center text-sm font-medium text-white/30 max-w-sm">
            There are no matches scheduled for {formatDisplayDate(currentDate)}. Check other dates in the calendar above.
          </p>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="flex items-center gap-2 rounded-sm bg-primary px-8 py-4 font-black tracking-widest text-primary-foreground uppercase shadow-lg shadow-primary/20 transition-all hover:scale-105 hover:brightness-110 active:scale-95"
          >
            Go to Today
          </button>
        </div>
      )}
    </div>
  );
}
