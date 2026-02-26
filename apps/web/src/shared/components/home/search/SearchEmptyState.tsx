'use client';

import { Home, Search, X } from 'lucide-react';
import Link from 'next/link';

import { Button } from '../../ui/button';

interface SearchEmptyStateProps {
  searchQuery: string;
}

export function SearchEmptyState({ searchQuery }: SearchEmptyStateProps) {
  return (
    <div className="relative flex flex-col items-center justify-center py-24 text-center">
      {/* Background Glow */}
      <div className="absolute inset-0 z-0 flex items-center justify-center">
        <div className="h-[400px] w-[400px] rounded-full bg-primary/10 blur-[100px] animate-pulse" />
      </div>

      <div className="relative z-10 mb-10">
        <div className="relative flex h-40 w-40 items-center justify-center rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-3xl transition-transform duration-500 hover:scale-105">
          <div className="absolute inset-0 rounded-[2.5rem] bg-linear-to-tr from-primary/20 to-transparent opacity-50" />
          <Search className="h-20 w-20 text-primary/30" />
        </div>
        <div className="absolute -bottom-2 -right-2 flex h-12 w-12 items-center justify-center rounded-sm bg-primary text-primary-foreground shadow-2xl">
          <X className="h-6 w-6" />
        </div>
      </div>

      <h3 className="relative z-10 text-4xl font-black tracking-tighter text-foreground mb-4">
        No <span className="text-primary">Matches</span> Found
      </h3>
      <p className="relative z-10 max-w-sm text-sm font-medium leading-relaxed text-muted-foreground/60 mb-10">
        We couldn&apos;t find anything matching &quot;<span className="text-foreground">{searchQuery}</span>&quot;.
        Double check your spelling or try searching for a different category.
      </p>

      <Link href="/">
        <Button className="relative z-10 group h-14 rounded-sm px-10 text-base font-black uppercase tracking-widest shadow-2xl shadow-primary/20 transition-all hover:scale-105 hover:shadow-primary/40">
          <Home className="mr-3 h-5 w-5 transition-transform group-hover:-translate-y-0.5" />
          Return Home
        </Button>
      </Link>
    </div>
  );
}
