import { invoke } from '@tauri-apps/api/core';
import {
  Film,
  Home,
  LayoutGrid,
  Minus,
  Settings,
  Trophy,
  Tv,
  X,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
        })
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
    <aside className="relative z-20 flex h-full w-20 flex-col border-r border-white/5 bg-sidebar/40 backdrop-blur-2xl transition-all duration-300 lg:w-64">
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
        <div className="absolute inset-0 z-0 opacity-20 bg-[radial-gradient(at_top_left,rgba(var(--primary),0.4),transparent_50%),radial-gradient(at_bottom_right,rgba(var(--primary),0.2),transparent_50%)] lg:block hidden" />

        <Link href="/" className="relative z-10 flex items-center gap-3">
          <div className="group relative h-12 w-12 shrink-0 overflow-hidden rounded-sm bg-primary/20 p-1.5 transition-all duration-500 hover:shadow-[0_0_20px_rgba(var(--primary),0.3)]">
             <Image
              src="/icon.png"
              alt="StreamMax"
              width={48}
              height={48}
              className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-110"
            />
          </div>
          <div className="flex flex-col lg:flex hidden">
            <span className="text-xl font-black tracking-tighter text-foreground">
              STREAM<span className="text-primary">MAX</span>
            </span>
            <span className="text-[10px] font-bold tracking-[0.3em] text-muted-foreground/60 uppercase">Premium IPTV</span>
          </div>
        </Link>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 space-y-1 p-2 overflow-y-auto scrollbar-hide">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group relative flex items-center gap-3 rounded-sm px-4 py-3.5 transition-all duration-300 ease-out overflow-hidden',
                isActive
                  ? 'bg-primary/10 text-primary shadow-[inset_0_0_20px_rgba(var(--primary),0.05)] before:absolute before:inset-0 before:rounded-sm before:bg-gradient-to-r before:from-primary/5 before:to-transparent'
                  : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
              )}
            >
              <item.icon
                className={cn(
                  'h-5 w-5 transition-all duration-300 group-hover:scale-110',
                  isActive ? 'text-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.5)]' : 'text-muted-foreground group-hover:text-foreground'
                )}
              />
              <span className={cn(
                "hidden font-bold tracking-tight lg:block transition-all duration-300",
                isActive ? "text-primary ml-1" : "group-hover:ml-1"
              )}>{item.label}</span>

              {/* Active Indicator Dot (Collapsed) */}
              {isActive && (
                <div className="absolute right-3 h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_12px_rgba(var(--primary),0.8)] lg:hidden" />
              )}
              {/* Left Glow Indicator */}
              {isActive && (
                <div className="absolute left-0 h-full w-1.5  bg-primary shadow-[4px_0_15px_rgba(var(--primary),0.6)]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer: Playlist & Clock */}
      <div className="mt-auto border-t border-white/5 p-4">
        <div className="space-y-4">
          {/* Clock */}
          <div className="flex items-center justify-center lg:justify-between px-2">
            <span className="hidden text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 lg:block">Current Time</span>
            <div className="font-mono text-xs font-bold text-primary tabular-nums">
              {time}
            </div>
          </div>

          {/* Playlist Selector (only visible in expanded sidebar for now, or adapted for icon only if needed) */}
          <div className="hidden lg:block space-y-2">
             <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 px-2">Active Playlist</span>
             <Select
              disabled={!storePlaylists.length}
              onValueChange={handlePlaylistSelect}
              value={selectedPlaylist?.id?.toString()}
            >
              <SelectTrigger className="h-10 w-full border-white/10 bg-white/5 hover:bg-white/10 transition-all rounded-sm">
                <SelectValue placeholder="Select Playlist" />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-card/90 backdrop-blur-xl rounded-sm">
                {storePlaylists.map((playlist) => (
                  <SelectItem
                    key={playlist.id}
                    value={playlist.id.toString()}
                    className="cursor-pointer focus:bg-primary/20 focus:text-primary rounded-sm"
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
