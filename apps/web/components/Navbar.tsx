'use client';
import { useTauri } from '@/hooks/useTauri';
import { trpc } from '@/lib/trpc';
import { cn } from '@/lib/utils';
import { usePlaylistStore } from '@/store/appStore';
import { invoke } from '@tauri-apps/api/core';
import { Minus, RefreshCcw, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
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
  const router = useRouter();
  const utils = trpc.useUtils();
  const [time, setTime] = useState<string>('');
  const { isDesktopApp } = useTauri();

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

  const {
    mutate: handleUpdate,
    isPending,
    error,
  } = trpc.playlists.updatePlaylists.useMutation({
    onSuccess: async () => {
      await utils.playlists.getPlaylists.invalidate();
      await utils.channels.getCategories.invalidate({
        playlistId: selectedPlaylist?.id || 0,
      });
      await utils.movies.getMoviesCategories.invalidate({
        playlistId: selectedPlaylist?.id || 0,
      });
      await utils.series.getSeriesCategories.invalidate({
        playlistId: selectedPlaylist?.id || 0,
      });
      await utils.channels.getChannels.invalidate({
        playlistId: selectedPlaylist?.id || 0,
      });
      await utils.movies.getMovies.invalidate({
        playlistId: selectedPlaylist?.id || 0,
      });
      await utils.series.getseries.invalidate({
        playlistId: selectedPlaylist?.id || 0,
      });
    },
  });

  const navItems = [
    { label: 'Channels', href: '/channels', icon: '📺' },
    { label: 'Movies', href: '/movies', icon: '🎬' },
    { label: 'Series', href: '/series', icon: '🎞️' },
    { label: 'Add Playlist', href: '/playlists/add', icon: '➕' },
  ];

  const handlePlaylistSelect = async (id: string) => {
    await utils.channels.getChannels.cancel({
      playlistId: Number(id),
    });
    selectPlaylist(playlists?.find((playlist) => playlist.id === Number(id)) || null);
    router.replace('/');
    document.cookie = `selectedPlaylistId=${id}; path=/; max-age=31536000`;
  };

  return (
    <header className="sticky top-0 z-50  border-b border-white/10">
      <div className="px-4 mx-auto max-w-[90vw] sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20  gap-4">
          {/* Logo */}
          <Link href={'/'} className="flex items-center flex-shrink-0">
            <Image
              src="/icon.png"
              alt="StreamMax"
              width={60}
              height={60}
              className="mr-2 rounded-lg"
            />
            <span className="text-xl font-bold bg-gradient-to-r from-slate-200 to-slate-500 bg-clip-text text-transparent hidden sm:inline">
              StreamMax
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="items-center justify-center hidden space-x-1 md:flex flex-1 ml-8">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <span className="px-3 py-2 text-lg font-medium text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200">
                  <span className="mr-1">{item.icon}</span>
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>

          {/* Center - Playlist Selector & Refresh */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <div className="relative group">
              <Select
                disabled={!playlists || playlists.length === 0}
                onValueChange={(e) => handlePlaylistSelect(e)}
                defaultValue={selectedPlaylist?.id.toString()}
              >
                <SelectTrigger
                  className="w-[160px] md:w-[180px] rounded-lg text-white border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all duration-200 focus:ring-2 focus:ring-white/20 cursor-pointer"
                  value={selectedPlaylist?.username || 'Select'}
                >
                  <SelectValue placeholder={selectedPlaylist?.username || 'Playlist'} />
                </SelectTrigger>
                <SelectContent className="text-white bg-black/10 backdrop-blur-lg border border-white/10 rounded-lg shadow-xl">
                  {playlists &&
                    playlists.map((playlist) => (
                      <SelectItem
                        key={playlist.id}
                        value={playlist.id.toString()}
                        className={cn(
                          'cursor-pointer transition-colors flex justify-between items-center w-full',
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

            <Button
              className="p-2 bg-transparent border border-white/10 rounded-lg transition-all duration-200 disabled:opacity-50 group cursor-pointer hover:border-white/20 hover:bg-white/10 flex items-center justify-center"
              disabled={isPending}
              onClick={() => {
                if (selectedPlaylist) {
                  handleUpdate({
                    url: selectedPlaylist.baseUrl,
                    username: selectedPlaylist.username,
                    password: selectedPlaylist.password,
                    playlistId: selectedPlaylist.id,
                  });
                }
              }}
              title="Refresh playlists"
            >
              <RefreshCcw
                className={cn(
                  'w-5 h-5 text-slate-300 group-hover:text-slate-200 transition-colors',
                  isPending && 'animate-spin',
                )}
              />
            </Button>
          </div>

          {/* Right Side - Time & Controls */}
          <div className="flex items-center gap-3 ml-auto  flex-shrink-0">
            {/* Time Display */}
            <div className="hidden sm:block px-4 py-2.5 rounded-lg border border-white/10">
              <div className="text-xs text-gray-400 font-mono">{time}</div>
            </div>

            {/* Window Controls */}
            {isDesktopApp && (
              <div className="absolute right-1.5 flex items-center gap-2 ml-3 pl-3">
                <Button
                  onClick={minimizeApp}
                  className="flex items-center justify-center w-8 h-8 rounded-lg cursor-pointer bg-yellow-500/20 hover:bg-yellow-500/40 text-yellow-400 hover:text-yellow-300 transition-all duration-200 group"
                  title="Minimize"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <Button
                  onClick={quitApp}
                  className="flex items-center justify-center w-8 h-8 rounded-lg cursor-pointer bg-red-500/20 hover:bg-red-500/40 text-red-400 hover:text-red-300 transition-all duration-200 group"
                  title="Exit"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
