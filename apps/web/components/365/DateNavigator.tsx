import { formatDisplayDate } from '@/lib/utils';
import { Calendar, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';

interface DateNavigatorProps {
  currentDate: Date;
  onPrevDay: () => void;
  onNextDay: () => void;
  onGoToToday: () => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export function DateNavigator({
  currentDate,
  onPrevDay,
  onNextDay,
  onGoToToday,
  onRefresh,
  isLoading,
}: DateNavigatorProps) {
  const isToday = new Date().toDateString() === currentDate.toDateString();
  const isFuture = currentDate > new Date();

  return (
    <div className="animate-in fade-in slide-in-from-top mx-auto mb-10 flex max-w-6xl items-center justify-between border-b border-white/10 pb-6 duration-500">
      <div className="flex flex-col gap-2">
        <div className="mb-1 flex items-center gap-2 text-white/40">
          <Calendar className="h-3.5 w-3.5" />
          <span className="text-[10px] font-black tracking-[0.2em] uppercase">
            Matchday Schedule
          </span>
        </div>
        <div className="flex items-center gap-4">
          <h2 className=" text-3xl font-black tracking-tight ">{formatDisplayDate(currentDate)}</h2>
          {!isToday && (
            <button
              onClick={onGoToToday}
              className="group cursor-pointer flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-[10px] font-black tracking-tight text-black uppercase shadow-lg transition-all hover:scale-105 hover:shadow-white/20 active:scale-95"
            >
              <Calendar className="h-3 w-3" />
              Today
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="group rounded-xl border border-white/10 bg-white/5 p-3 transition-all hover:border-white/20 hover:bg-white/10 active:scale-95 disabled:opacity-50"
          title="Refresh"
        >
          <RefreshCw
            className={`h-5 w-5 text-white/60 transition-colors group-hover:text-white ${
              isLoading ? 'animate-spin' : ''
            }`}
          />
        </button>

        {/* Navigation */}
        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-linear-to-br from-white/10 to-white/5 p-1 shadow-lg backdrop-blur-sm">
          <button
            onClick={onPrevDay}
            className="group relative overflow-hidden rounded-xl p-3 transition-all hover:bg-white/10 active:scale-95"
            title="Previous day"
          >
            <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/5 to-white/0 opacity-0 transition-opacity group-hover:opacity-100" />
            <ChevronLeft
              className="relative h-5 w-5 text-white/40 transition-colors group-hover:text-white"
              strokeWidth={3}
            />
          </button>

          <div className="mx-1 h-6 w-px bg-linear-to-b from-transparent via-white/20 to-transparent" />

          <button
            onClick={onNextDay}
            className="group relative overflow-hidden rounded-xl p-3 transition-all hover:bg-white/10 active:scale-95"
            title="Next day"
          >
            <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/5 to-white/0 opacity-0 transition-opacity group-hover:opacity-100" />
            <ChevronRight
              className="relative h-5 w-5 text-white/40 transition-colors group-hover:text-white"
              strokeWidth={3}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
