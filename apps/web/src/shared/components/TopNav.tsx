'use client';

import { invoke } from '@tauri-apps/api/core';
import { Film, Home, LayoutGrid, Menu, Minus, Search, Settings, Trophy, Tv, X } from 'lucide-react';
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
} from '@/shared/components/ui/select';
import { useTauri } from '@/shared/hooks/useTauri';
import { cn } from '@/shared/lib/utils';
import { usePlaylistStore } from '@repo/store';

const navItems = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Channels', href: '/channels', icon: Tv },
  { label: 'Movies', href: '/movies', icon: Film },
  { label: 'Series', href: '/series', icon: LayoutGrid },
  { label: '365', href: '/365', icon: Trophy },
];

async function quitApp() {
  await invoke('quit_app');
}

async function minimizeApp() {
  await invoke('minimize_app');
}

export default function TopNav() {
  const pathname = usePathname();
  const { selectedPlaylist, selectPlaylist, playlists: storePlaylists } = usePlaylistStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
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

  const isActive = (href: string) => {
    return pathname === href || (href !== '/' && pathname.startsWith(href));
  };

  return (
    <>
      <header className="border-border/50 bg-background/95 fixed top-0 right-0 left-0 z-50 h-16 border-b backdrop-blur-sm">
        <div className="flex h-full items-center justify-between px-4 lg:px-6">
          {/* Left Section - Window Controls (Desktop App) */}
          <div className="flex items-center gap-3">
            {isDesktopApp && (
              <div className="mr-2 hidden items-center gap-2 lg:flex">
                <button
                  onClick={quitApp}
                  className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 transition-colors hover:bg-red-600"
                >
                  <X className="h-3 w-3 text-white" />
                </button>
                <button
                  onClick={minimizeApp}
                  className="flex h-5 w-5 items-center justify-center rounded-full bg-yellow-500 transition-colors hover:bg-yellow-600"
                >
                  <Minus className="h-3 w-3 text-white" />
                </button>
              </div>
            )}

            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-sm">
                <Image
                  src="/icon.png"
                  alt="StreamMax"
                  width={28}
                  height={28}
                  className="h-full w-full object-contain"
                />
              </div>
              <span className="text-foreground hidden text-xl font-black tracking-tight sm:block">
                STREAM<span className="text-primary">MAX</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 rounded-sm px-4 py-2 text-sm font-medium transition-colors',
                  isActive(item.href)
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {/* Time (Desktop) */}
            {isDesktopApp && (
              <span className="text-muted-foreground mr-2 hidden text-sm lg:block">{time}</span>
            )}

            {/* Search */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="text-muted-foreground hover:text-foreground flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-white/5"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Playlist Selector */}
            <Select value={selectedPlaylist?.id?.toString()} onValueChange={handlePlaylistSelect}>
              <SelectTrigger className="bg-background text-foreground border-border w-35 text-sm">
                <SelectValue placeholder="Select playlist" />
              </SelectTrigger>
              <SelectContent>
                {storePlaylists?.map((playlist) => (
                  <SelectItem key={playlist.id} value={playlist.id.toString()}>
                    {playlist.username}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Settings */}
            <Link
              href="/settings"
              className={cn(
                'flex items-center gap-2 rounded-sm px-3 py-2 text-sm font-medium transition-colors',
                isActive('/settings')
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Settings className="h-4 w-4" />
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-muted-foreground hover:text-foreground flex h-10 w-10 items-center justify-center rounded-sm transition-colors hover:bg-white/5 md:hidden"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Search Bar (Expandable) */}
        {searchOpen && (
          <div className="bg-background border-border/50 absolute top-16 right-0 left-0 border-b p-4">
            <div className="mx-auto max-w-2xl">
              <div className="relative">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search movies, series, channels..."
                  autoFocus
                  className="text-foreground placeholder:text-muted-foreground focus:border-primary border-input bg-background focus:ring-ring/20 w-full rounded-sm border py-3 pr-4 pl-10 focus:ring-2 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="bg-background fixed inset-0 top-16 z-40 md:hidden">
          <nav className="flex flex-col p-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-sm px-4 py-3 text-base font-medium transition-colors',
                  isActive(item.href)
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/5',
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            ))}
            <Link
              href="/settings"
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-sm px-4 py-3 text-base font-medium transition-colors',
                isActive('/settings')
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/5',
              )}
            >
              <Settings className="h-5 w-5" />
              Settings
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}
