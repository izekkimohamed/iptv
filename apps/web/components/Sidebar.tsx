'use client';
import { invoke } from '@tauri-apps/api/core';
import { Film, Home, LayoutGrid, Minus, Settings, Trophy, Tv, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTauri } from '@/hooks/useTauri';
import { cn } from '@/lib/utils';
import { usePlaylistStore } from '@repo/store';

const navItems = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Channels', href: '/channels', icon: Tv },
  { label: 'Movies', href: '/movies', icon: Film },
  { label: 'Series', href: '/series', icon: LayoutGrid },
  { label: '365Scores', href: '/365', icon: Trophy },
  { label: 'Settings', href: '/settings', icon: Settings },
];

async function quitApp() {
  await invoke('quit_app');
}

async function minimizeApp() {
  await invoke('minimize_app');
}

export default function Sidebar() {
  const pathname = usePathname();
  const { selectedPlaylist, selectPlaylist, playlists: storePlaylists } = usePlaylistStore();
  const [time, setTime] = useState<string>('');
  const { isDesktopApp } = useTauri();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }),
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  const handlePlaylistSelect = (id: string) => {
    selectPlaylist(storePlaylists?.find((playlist) => playlist.id === Number(id)) || null);
  };

  return (
    <aside className="bg-sidebar/40 relative z-20 flex h-full w-20 flex-col border-r border-white/5 backdrop-blur-2xl transition-all duration-300 lg:w-64">
      {/* Window Controls (macOS Style) */}
      {isDesktopApp && (
        <div className="group/window flex items-center gap-2 px-6 py-4">
          <button
            onClick={quitApp}
            className="group relative flex h-5 w-5 items-center justify-center rounded-full bg-[#ff5f57] transition-all hover:bg-[#ff5f57]/80"
          >
            <X className="absolute h-4 w-4 text-black" />
          </button>
          <button
            onClick={minimizeApp}
            className="group relative flex h-5 w-5 items-center justify-center rounded-full bg-[#febc2e] transition-all hover:bg-[#febc2e]/80"
          >
            <Minus className="absolute h-4 w-4 text-black" />
          </button>
        </div>
      )}

      {/* Logo Section */}
      <div className="relative flex h-24 w-full items-center justify-center px-4 transition-all duration-300 lg:justify-start">
        {/* Mesh Gradient background for logo area */}
        <div className="absolute inset-0 z-0 hidden bg-[radial-gradient(at_top_left,rgba(var(--primary),0.4),transparent_50%),radial-gradient(at_bottom_right,rgba(var(--primary),0.2),transparent_50%)] opacity-20 lg:block" />

        <Link href="/" className="relative z-10 flex items-center gap-3">
          <div className="group bg-primary/20 relative h-12 w-12 shrink-0 overflow-hidden rounded-sm p-1.5 transition-all duration-500 hover:shadow-[0_0_20px_rgba(var(--primary),0.3)]">
            <Image
              src="/icon.png"
              alt="StreamMax"
              width={48}
              height={48}
              className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-110"
            />
          </div>
          <div className="flex hidden flex-col lg:flex">
            <span className="text-foreground text-xl font-black tracking-tighter">
              STREAM<span className="text-primary">MAX</span>
            </span>
            <span className="text-muted-foreground/60 text-[10px] font-bold tracking-[0.3em] uppercase">
              Premium IPTV
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Items */}
      <nav className="scrollbar-hide flex-1 space-y-1 overflow-y-auto p-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group relative flex items-center gap-3 overflow-hidden rounded-sm px-4 py-3.5 transition-all duration-300 ease-out',
                isActive
                  ? 'bg-primary/10 text-primary before:from-primary/5 shadow-[inset_0_0_20px_rgba(var(--primary),0.05)] before:absolute before:inset-0 before:rounded-sm before:bg-gradient-to-r before:to-transparent'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/5',
              )}
            >
              <item.icon
                className={cn(
                  'h-5 w-5 transition-all duration-300 group-hover:scale-110',
                  isActive
                    ? 'text-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.5)]'
                    : 'text-muted-foreground group-hover:text-foreground',
                )}
              />
              <span
                className={cn(
                  'hidden font-bold tracking-tight transition-all duration-300 lg:block',
                  isActive ? 'text-primary ml-1' : 'group-hover:ml-1',
                )}
              >
                {item.label}
              </span>

              {/* Active Indicator Dot (Collapsed) */}
              {isActive && (
                <div className="bg-primary absolute right-3 h-1.5 w-1.5 rounded-full shadow-[0_0_12px_rgba(var(--primary),0.8)] lg:hidden" />
              )}
              {/* Left Glow Indicator */}
              {isActive && (
                <div className="bg-primary absolute left-0 h-full w-1.5 shadow-[4px_0_15px_rgba(var(--primary),0.6)]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer: Playlist & Clock */}
      <div className="mt-auto border-t border-white/5 p-4">
        <div className="space-y-4">
          {/* Clock */}
          <div className="flex items-center justify-center px-2 lg:justify-between">
            <span className="text-muted-foreground/60 hidden text-[10px] font-black tracking-widest uppercase lg:block">
              Current Time
            </span>
            <div className="text-primary font-mono text-xs font-bold tabular-nums">{time}</div>
          </div>

          {/* Playlist Selector (only visible in expanded sidebar for now, or adapted for icon only if needed) */}
          <div className="hidden space-y-2 lg:block">
            <span className="text-muted-foreground/60 px-2 text-[10px] font-black tracking-widest uppercase">
              Active Playlist
            </span>
            <Select
              disabled={!storePlaylists.length}
              onValueChange={handlePlaylistSelect}
              value={selectedPlaylist?.id?.toString()}
            >
              <SelectTrigger className="h-10 w-full rounded-sm border-white/10 bg-white/5 transition-all hover:bg-white/10">
                <SelectValue placeholder="Select Playlist" />
              </SelectTrigger>
              <SelectContent className="bg-card/90 rounded-sm border-white/10 backdrop-blur-xl">
                {storePlaylists.map((playlist) => (
                  <SelectItem
                    key={playlist.id}
                    value={playlist.id.toString()}
                    className="focus:bg-primary/20 focus:text-primary cursor-pointer rounded-sm"
                  >
                    {playlist.username}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </aside>
  );
}
