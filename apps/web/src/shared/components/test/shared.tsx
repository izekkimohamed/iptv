'use client';

import {
  ChevronLeft,
  ChevronRight,
  Film,
  Flame,
  Heart,
  Home,
  Monitor,
  Play,
  Radio,
  Search,
  Settings,
  Star,
  Trophy,
  Tv,
  Volume2,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRef, useState } from 'react';

import { cn } from '@/shared/lib/utils';

// ─── Sidebar ──────────────────────────────────────────────────

const NAV_ITEMS = [
  { icon: Home, label: 'Home', href: '/test' },
  { icon: Tv, label: 'Live TV', href: '/test/channels', badge: '12' },
  { icon: Film, label: 'Movies', href: '/test/movies' },
  { icon: Monitor, label: 'Series', href: '/test/series' },
  { icon: Trophy, label: 'Sports', href: '/test' },
  { icon: Heart, label: 'Favorites', href: '/test' },
  { icon: Settings, label: 'Settings', href: '/test' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed top-0 left-0 z-40 flex h-screen w-[72px] flex-col items-center border-r border-white/[0.06] bg-[#080810]/80 py-5 backdrop-blur-xl">
      <Link href="/test" className="mb-8 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/60 shadow-lg shadow-primary/20">
        <Monitor className="h-5 w-5 text-white" />
      </Link>

      <nav className="flex flex-1 flex-col items-center gap-1">
        {NAV_ITEMS.map(({ icon: Icon, label, href, badge }) => {
          const active = pathname === href || (href !== '/test' && pathname.startsWith(href));
          return (
            <Link
              key={label}
              href={href}
              className={cn(
                'group relative flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-200',
                active
                  ? 'bg-primary/15 text-primary'
                  : 'text-white/40 hover:bg-white/[0.06] hover:text-white/80',
              )}
              title={label}
            >
              <Icon className="h-[20px] w-[20px]" />
              {badge && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-white">
                  {badge}
                </span>
              )}
              <span className="pointer-events-none absolute left-14 z-50 rounded-lg bg-white/10 px-2.5 py-1 text-xs font-medium text-white opacity-0 backdrop-blur-md transition-opacity group-hover:opacity-100">
                {label}
              </span>
              {active && (
                <span className="absolute -left-[13px] h-5 w-[3px] rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto">
        <button className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm font-bold text-white/60 transition-all hover:border-primary/30 hover:bg-primary/10">
          M
        </button>
      </div>
    </aside>
  );
}

// ─── App TopNav ────────────────────────────────────────────────

export function AppTopNav() {
  const pathname = usePathname();

  return (
    <nav className="flex h-12 shrink-0 items-center gap-1 border-b border-white/[0.06] bg-[#080810]/80 px-4 backdrop-blur-xl">
      <Link href="/test" className="mr-4 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/60 shadow-lg shadow-primary/20">
        <Monitor className="h-4 w-4 text-white" />
      </Link>

      {NAV_ITEMS.map(({ icon: Icon, label, href, badge }) => {
        const active = pathname === href || (href !== '/test' && pathname.startsWith(href));
        return (
          <Link
            key={label}
            href={href}
            className={cn(
              'group relative flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200',
              active
                ? 'bg-primary/15 text-primary'
                : 'text-white/40 hover:bg-white/[0.06] hover:text-white/80',
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
            {badge && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[8px] font-bold text-white">
                {badge}
              </span>
            )}
          </Link>
        );
      })}

      <div className="ml-auto">
        <button className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[10px] font-bold text-white/60 transition-all hover:border-primary/30 hover:bg-primary/10">
          M
        </button>
      </div>
    </nav>
  );
}

// ─── Top Bar ──────────────────────────────────────────────────

export function TopBar({ title, tabs }: { title: string; tabs?: string[] }) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/[0.06] bg-[#080810]/60 px-8 backdrop-blur-xl">
      <div className="flex items-center gap-6">
        <h1 className="text-lg font-semibold tracking-tight text-white/90">{title}</h1>
        {tabs && tabs.length > 0 && (
          <div className="flex items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.04] px-1">
            {tabs.map((tab, i) => (
              <button
                key={tab}
                onClick={() => setActiveTab(i)}
                className={cn(
                  'rounded-full px-4 py-1.5 text-xs font-medium transition-all',
                  i === activeTab
                    ? 'bg-primary/15 text-primary'
                    : 'text-white/40 hover:text-white/70',
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="Search movies, series, channels..."
            className="h-9 w-72 rounded-full border border-white/[0.08] bg-white/[0.04] pl-10 pr-4 text-sm text-white/80 placeholder:text-white/25 outline-none transition-all focus:border-primary/30 focus:bg-white/[0.06] focus:ring-1 focus:ring-primary/20"
          />
        </div>
        <button className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] text-white/40 transition-all hover:text-white/70">
          <Volume2 className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}

// ─── Carousel ─────────────────────────────────────────────────

export function Carousel({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon?: React.ElementType;
  children: React.ReactNode;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
    setTimeout(updateScrollState, 350);
  };

  return (
    <section className="relative group/carousel">
      <div className="mb-4 flex items-center justify-between px-10">
        <div className="flex items-center gap-2.5">
          {Icon && <Icon className="h-5 w-5 text-primary/70" />}
          <h3 className="text-base font-bold text-white/90">{title}</h3>
        </div>
        <button className="text-xs font-medium text-white/30 transition-colors hover:text-primary">
          See all →
        </button>
      </div>

      <div className="relative">
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute -left-0 top-0 bottom-0 z-10 flex w-14 items-center justify-start bg-gradient-to-r from-[#080810] to-transparent opacity-0 transition-opacity group-hover/carousel:opacity-100"
          >
            <ChevronLeft className="h-7 w-7 text-white/70" />
          </button>
        )}

        <div
          ref={scrollRef}
          onScroll={updateScrollState}
          className="flex gap-3 overflow-x-auto px-10 pb-4 scrollbar-hide"
        >
          {children}
        </div>

        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute -right-0 top-0 bottom-0 z-10 flex w-14 items-center justify-end bg-gradient-to-l from-[#080810] to-transparent opacity-0 transition-opacity group-hover/carousel:opacity-100"
          >
            <ChevronRight className="h-7 w-7 text-white/70" />
          </button>
        )}
      </div>
    </section>
  );
}

// ─── Poster Card ──────────────────────────────────────────────

export function PosterCard({
  title,
  year,
  rating,
  poster,
  href,
}: {
  title: string;
  year: string;
  rating: string;
  poster: string;
  href?: string;
}) {
  const Container = href ? Link : 'div';

  return (
    <Container href={href || ''} className="group/card w-44 shrink-0 cursor-pointer">
      <div className="relative mb-2.5 aspect-[2/3] overflow-hidden rounded-xl border border-white/[0.06]">
        <img
          src={poster}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover/card:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover/card:opacity-100" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-300 group-hover/card:opacity-100">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/15 backdrop-blur-md">
            <Play className="ml-0.5 h-5 w-5 fill-white text-white" />
          </div>
        </div>
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-bold text-yellow-400 backdrop-blur-sm">
          <Star className="h-2.5 w-2.5 fill-yellow-400" />
          {rating}
        </div>
      </div>
      <h4 className="truncate text-sm font-semibold text-white/80 transition-colors group-hover/card:text-primary">
        {title}
      </h4>
      <p className="text-xs text-white/30">{year}</p>
    </Container>
  );
}

// ─── Channel Card ─────────────────────────────────────────────

export function ChannelCard({ name, live, category }: { name: string; live: boolean; category: string }) {
  return (
    <div className="group/ch flex w-44 shrink-0 cursor-pointer flex-col items-center rounded-xl border border-white/[0.06] bg-white/[0.03] p-5 transition-all duration-300 hover:border-primary/20 hover:bg-white/[0.06]">
      <div className="relative mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.02]">
        <Tv className="h-6 w-6 text-white/40" />
        {live && (
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center">
            <span className="absolute h-3.5 w-3.5 animate-ping rounded-full bg-red-500/50" />
            <span className="relative h-2 w-2 rounded-full bg-red-500" />
          </span>
        )}
      </div>
      <h4 className="mb-0.5 text-sm font-semibold text-white/80 transition-colors group-hover/ch:text-primary">
        {name}
      </h4>
      <p className="text-[10px] text-white/25">{live ? 'LIVE' : category}</p>
    </div>
  );
}

// ─── Continue Watching Card ───────────────────────────────────

export function ContinueCard({ title, progress, time, poster }: { title: string; progress: number; time: string; poster: string }) {
  return (
    <div className="group/cw w-64 shrink-0 cursor-pointer">
      <div className="relative mb-2.5 aspect-video overflow-hidden rounded-xl border border-white/[0.06]">
        <img src={poster} alt={title} className="h-full w-full object-cover transition-transform duration-500 group-hover/cw:scale-105" />
        <div className="absolute inset-0 bg-black/30 transition-colors group-hover/cw:bg-black/10" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-300 group-hover/cw:opacity-100">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/15 backdrop-blur-md">
            <Play className="ml-0.5 h-5 w-5 fill-white text-white" />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
          <div className="h-full rounded-r-full bg-primary" style={{ width: `${progress * 100}%` }} />
        </div>
      </div>
      <h4 className="truncate text-sm font-semibold text-white/80">{title}</h4>
      <div className="flex items-center gap-1.5 text-xs text-white/30">
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
        {time}
      </div>
    </div>
  );
}

// ─── Score Card ───────────────────────────────────────────────

export function ScoreCard({ home, away, score, minute, league }: { home: string; away: string; score: string; minute: string; league: string }) {
  return (
    <div className="group/sc flex w-56 shrink-0 cursor-pointer flex-col rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 transition-all hover:border-red-500/20 hover:bg-white/[0.06]">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[10px] font-medium uppercase tracking-wider text-white/25">{league}</span>
        <span className="flex items-center gap-1 rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-bold text-red-400">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
          {minute}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-semibold text-white/80">{home}</p>
          <p className="text-sm font-semibold text-white/80">{away}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-white/90">{score.split(' – ')[0]}</p>
          <p className="text-sm font-bold text-white/90">{score.split(' – ')[1]}</p>
        </div>
      </div>
    </div>
  );
}
