'use client';
import { useTauri } from '@/hooks/useTauri';
import { trpc } from '@/lib/trpc';
import { cn } from '@/lib/utils';
import { usePlaylistStore } from '@/store/appStore';
import { invoke } from '@tauri-apps/api/core';
import { Minus, RefreshCcw, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
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

  const { mutate: handleUpdate, isPending } = trpc.playlists.updatePlaylists.useMutation({
    onSuccess: async (data) => {
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
      if (data) {
        const addedTotal =
          (data.newItems?.channels ?? 0) +
          (data.newItems?.movies ?? 0) +
          (data.newItems?.series ?? 0);
        const deletedTotal =
          (data.deletedItems?.channels ?? 0) +
          (data.deletedItems?.movies ?? 0) +
          (data.deletedItems?.series ?? 0);
        const prunedTotal =
          (data.categories?.pruned?.channels ?? 0) +
          (data.categories?.pruned?.movies ?? 0) +
          (data.categories?.pruned?.series ?? 0);
        toast.success(
          `Updated library: +${addedTotal} new, -${deletedTotal} removed, -${prunedTotal} categories pruned`,
        );
      } else {
        toast.info('Playlist updated');
      }
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to update playlist');
    },
  });

  const navItems = [
    { label: 'Channels', href: '/channels', icon: '📺' },
    { label: 'Movies', href: '/movies', icon: '🎬' },
    { label: 'Series', href: '/series', icon: '🎞️' },
    { label: 'Add Playlist', href: '/playlists/add', icon: '➕' },
    { label: '365SCORES', href: '/365', icon: '🏆' },
  ];

  const handlePlaylistSelect = async (id: string) => {
    selectPlaylist(storePlaylists?.find((playlist) => playlist.id === Number(id)) || null);
    router.push(pathName);
  };
  return (
    <header
      className={cn(
        'sticky top-0 z-50  border-b border-white/10',
        isPending ? 'animate-pulse bg-white/20 pointer-events-none cursor-not-allowed' : '',
      )}
    >
      <div className={cn('mx-auto max-w-[90vw]', isPending ? 'opacity-50 cursor-not-allowed' : '')}>
        <div className="flex items-center justify-between h-20  gap-4">
          {/* Logo */}
          <Link href={'/'} className="flex items-center shrink-0">
            <Image
              src="/icon.png"
              alt="StreamMax"
              width={60}
              height={60}
              className="mr-2 rounded-lg"
            />
            <span className="text-xl font-bold bg-linear-to-r from-slate-200 to-slate-500 bg-clip-text text-transparent hidden sm:inline">
              StreamMax
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="items-center justify-center hidden space-x-1 md:flex flex-1 ml-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  pathName === item.href
                    ? 'bg-amber-500/30 text-amber-400'
                    : 'text-gray-300 hover:text-white hover:bg-white/10',
                  'flex items-center gap-2 px-3 py-1  font-medium rounded-lg transition-all duration-200',
                )}
              >
                <p
                  className={cn(
                    'flex items-center gap-2 px-3 py-2  font-medium text-gray-300 rounded-lg transition-all duration-200',
                    isPending ? 'animate-pulse bg-white/20' : '',
                  )}
                >
                  <span className="mr-1">{item.icon}</span>
                  <span className="mr-1 hidden md:inline text-lg text-nowrap">{item.label}</span>
                </p>
              </Link>
            ))}
          </nav>

          {/* Center - Playlist Selector & Refresh */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="relative group">
              <Select
                disabled={!storePlaylists.length}
                onValueChange={(e) => handlePlaylistSelect(e)}
                defaultValue={selectedPlaylist?.id.toString()}
              >
                <SelectTrigger
                  className="w-40 md:w-45 rounded-lg text-white border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all duration-200 focus:ring-2 focus:ring-white/20 cursor-pointer"
                  value={selectedPlaylist?.username || 'Select'}
                >
                  <SelectValue placeholder={selectedPlaylist?.username || 'Playlist'} />
                </SelectTrigger>
                <SelectContent className="text-white bg-black/10 backdrop-blur-lg border border-white/10 rounded-lg shadow-xl">
                  {storePlaylists &&
                    storePlaylists.map((playlist) => (
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

          {/* Window Controls */}
          {isDesktopApp && (
            <div className="flex items-center gap-3 ml-auto  shrink-0">
              <div className="hidden sm:block px-4 py-2.5 rounded-lg border border-white/10">
                <div className="text-xs text-gray-400 font-mono">{time}</div>
              </div>
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
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
