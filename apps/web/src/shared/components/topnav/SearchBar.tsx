'use client';

import { Search } from 'lucide-react';

export function SearchBar() {
  return (
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
  );
}
