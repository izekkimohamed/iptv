'use client';
import { invoke } from '@tauri-apps/api/core';
import { Minus, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useTauri } from '@/hooks/useTauri';
import { trpc } from '@/lib/trpc';
import { cn } from '@/lib/utils';
import { usePlaylistStore, useRecentUpdateStore } from '@repo/store';

import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

async function quitApp() {
  await invoke('quit_app');
}

async function minimizeApp() {
  await invoke('minimize_app');
}

export default function NavBar() {
  const {
    selectedPlaylist,
    selectPlaylist,
    addPlaylist,
    playlists: storePlaylists,
  } = usePlaylistStore();
  const pathName = usePathname();
  const router = useRouter();
  const utils = trpc.useUtils();
  const [time, setTime] = useState<string>('');
  const { isDesktopApp } = useTauri();
  const addUpdate = useRecentUpdateStore((state) => state.addUpdate);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeString = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
      const dateString = now.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      setTime(`${dateString} ${timeString}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const { data: playlists } = trpc.playlists.getPlaylists.useQuery();

  useEffect(() => {
    if (storePlaylists.length === 0 && playlists) {
      playlists.forEach((playlist) => {
        addPlaylist(playlist);
      });
      selectPlaylist(playlists[0]);
    }
  }, [playlists, selectPlaylist]);

  const navItems = [
    { label: 'Channels', href: '/channels', icon: '📺' },
    { label: 'Movies', href: '/movies', icon: '🎬' },
    { label: 'Series', href: '/series', icon: '🎞️' },
    { label: '365SCORES', href: '/365', icon: '🏆' },
    { label: 'Settings', href: '/settings', icon: '⚙️' },
  ];

  const handlePlaylistSelect = async (id: string) => {
    selectPlaylist(storePlaylists?.find((playlist) => playlist.id === Number(id)) || null);
    router.push(pathName);
  };
  return (
    <header className={cn('sticky top-0 z-50 border-b border-white/10')}>
      <div className={cn('mx-auto max-w-[90vw]')}>
        <div className="flex h-20 items-center justify-between gap-4">
          {/* Logo */}
          <Link href={'/'} className="flex shrink-0 items-center">
            <Image
              src="/icon.png"
              alt="StreamMax"
              width={60}
              height={60}
              className="mr-2 rounded-lg"
            />
            <span className="hidden bg-linear-to-r from-slate-200 to-slate-500 bg-clip-text text-xl font-bold text-transparent sm:inline">
              StreamMax
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="ml-8 hidden flex-1 items-center justify-center space-x-1 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  pathName === item.href
                    ? 'border border-white/10 bg-linear-to-br from-white/10 to-transparent text-gray-300 shadow-2xl backdrop-blur-xl hover:border-white/20 hover:bg-white/10 hover:text-white'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white',
                  'flex items-center gap-2 rounded-lg px-3 py-1 font-medium transition-all duration-200',
                )}
              >
                <p
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-3 py-2 font-medium text-gray-300 transition-all duration-200',
                  )}
                >
                  <span className="mr-1">{item.icon}</span>
                  <span className="mr-1 hidden text-lg text-nowrap md:inline">{item.label}</span>
                </p>
              </Link>
            ))}
          </nav>

          {/* Center - Playlist Selector & Refresh */}
          <div className="flex shrink-0 items-center gap-4">
            <div className="group relative">
              <Select
                disabled={!storePlaylists.length}
                onValueChange={(e) => handlePlaylistSelect(e)}
                defaultValue={selectedPlaylist?.id.toString()}
              >
                <SelectTrigger
                  className="w-40 cursor-pointer rounded-lg border border-white/10 text-white transition-all duration-200 hover:border-white/20 hover:bg-white/10 focus:ring-2 focus:ring-white/20 md:w-45"
                  value={selectedPlaylist?.username || 'Select'}
                >
                  <SelectValue placeholder={selectedPlaylist?.username || 'Playlist'} />
                </SelectTrigger>
                <SelectContent className="rounded-lg border border-white/10 bg-black/10 text-white shadow-xl backdrop-blur-lg">
                  {storePlaylists &&
                    storePlaylists.map((playlist) => (
                      <SelectItem
                        key={playlist.id}
                        value={playlist.id.toString()}
                        className={cn(
                          'flex w-full cursor-pointer items-center justify-between transition-colors',
                          playlist.id === selectedPlaylist?.id
                            ? 'bg-amber-400/20 text-white'
                            : 'text-gray-300 hover:bg-white/5 hover:text-white',
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium">{playlist.username}</span>
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Window Controls */}
          {isDesktopApp && (
            <div className="ml-auto flex shrink-0 items-center gap-3">
              <div className="hidden rounded-lg border border-white/10 px-4 py-2.5 sm:block">
                <div className="font-mono text-xs text-gray-400">{time}</div>
              </div>
              <div className="absolute right-1.5 ml-3 flex items-center gap-2 pl-3">
                <Button
                  onClick={minimizeApp}
                  className="group flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-yellow-500/20 text-yellow-400 transition-all duration-200 hover:bg-yellow-500/40 hover:text-yellow-300"
                  title="Minimize"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Button
                  onClick={quitApp}
                  className="group flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-red-500/20 text-red-400 transition-all duration-200 hover:bg-red-500/40 hover:text-red-300"
                  title="Exit"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
