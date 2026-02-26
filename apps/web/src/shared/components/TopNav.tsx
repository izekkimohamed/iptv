'use client';

import { Menu, Search, Settings, X } from 'lucide-react';
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

import { DesktopNav, MobileNav, WindowControls, SearchBar } from './topnav';

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
            {isDesktopApp && <WindowControls />}

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
          <DesktopNav isActive={isActive} />

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
        {searchOpen && <SearchBar />}
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="bg-background fixed inset-0 top-16 z-40 md:hidden">
          <MobileNav isActive={isActive} onLinkClick={() => setMobileMenuOpen(false)} />
        </div>
      )}
    </>
  );
}
