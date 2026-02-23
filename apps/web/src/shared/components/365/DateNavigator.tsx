import { formatDisplayDate } from '@repo/utils';
import { Calendar, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface DateNavigatorProps {
  currentDate: Date;
  onSelectDate: (date: Date) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export function DateNavigator({ currentDate, onSelectDate, onRefresh, isLoading }: DateNavigatorProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  // Generate range of dates: 7 days ago to 21 days in the future
  const dates = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 7 + i);
    return d;
  });

  const isToday = (d: Date) => new Date().toDateString() === d.toDateString();
  const isSelected = (d: Date) => d.toDateString() === currentDate.toDateString();

  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      activeRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [currentDate]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth / 2 : scrollLeft + clientWidth / 2;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-top mx-auto mb-8 flex max-w-6xl flex-col gap-6 duration-500">
      <div className="flex items-center justify-between px-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-primary">
            <Calendar className="h-4 w-4" />
            <span className="text-[10px] font-black tracking-[0.2em] uppercase">
              Schedule & Scores
            </span>
          </div>
          <h2 className="text-3xl font-black tracking-tight">{formatDisplayDate(currentDate)}</h2>
        </div>

        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="group flex items-center gap-2 rounded-sm border border-white/5 bg-white/2 px-4 py-2 transition-all hover:bg-white/10 active:scale-95 disabled:opacity-50"
        >
          <RefreshCw
            className={`h-4 w-4 text-white/60 transition-colors group-hover:text-white ${
              isLoading ? 'animate-spin' : ''
            }`}
          />
          <span className="text-xs font-bold text-white/60 group-hover:text-white">Refresh Data</span>
        </button>
      </div>

      <div className="relative group">
        {/* Scroll Buttons */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/10 bg-black/50 p-2 text-white opacity-0 backdrop-blur-md transition-opacity group-hover:opacity-100 hover:bg-black/70"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/10 bg-black/50 p-2 text-white opacity-0 backdrop-blur-md transition-opacity group-hover:opacity-100 hover:bg-black/70"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Calendar Scroll */}
        <div
          ref={scrollRef}
          className="no-scrollbar flex gap-3 overflow-x-auto scroll-smooth px-2 py-4"
        >
          {dates.map((date) => {
            const active = isSelected(date);
            const today = isToday(date);
            return (
              <button
                key={date.toISOString()}
                ref={active ? activeRef : null}
                onClick={() => onSelectDate(date)}
                className={`relative flex min-w-[70px] flex-col items-center justify-center rounded-sm border p-3 transition-all duration-300 ${
                  active
                    ? 'border-primary bg-primary/20 shadow-[0_0_20px_rgba(var(--primary),0.3)]'
                    : 'border-white/5 bg-white/2 hover:border-white/10 hover:bg-white/5'
                }`}
              >
                <span
                  className={`text-[10px] font-black tracking-widest uppercase ${
                    active ? 'text-primary' : 'text-white/40'
                  }`}
                >
                  {date.toLocaleDateString('en-US', { weekday: 'short' })}
                </span>
                <span className={`text-xl font-black ${active ? 'text-white' : 'text-white/60'}`}>
                  {date.getDate()}
                </span>
                {today && !active && (
                  <div className="absolute -top-1 right-2 h-1.5 w-1.5 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
