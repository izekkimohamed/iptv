'use client';

import { Home, LayoutGrid, Settings, Trophy, Tv } from 'lucide-react';
import Link from 'next/link';

import { cn } from '@/shared/lib/utils';

const navItems = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Channels', href: '/channels', icon: Tv },
  { label: 'Movies', href: '/movies', icon: LayoutGrid },
  { label: 'Series', href: '/series', icon: LayoutGrid },
  { label: '365', href: '/365', icon: Trophy },
  { label: 'Settings', href: '/settings', icon: Settings },
];

interface DesktopNavProps {
  isActive: (href: string) => boolean;
}

export function DesktopNav({ isActive }: DesktopNavProps) {
  return (
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
  );
}

export function MobileNav({
  isActive,
  onLinkClick,
}: {
  isActive: (href: string) => boolean;
  onLinkClick: () => void;
}) {
  return (
    <nav className="flex flex-col p-4">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onLinkClick}
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
        onClick={onLinkClick}
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
  );
}
