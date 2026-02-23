import { Search, X } from 'lucide-react';

import { Button } from '../ui/button';

interface HomeSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

function HomeSearch({ searchQuery, setSearchQuery }: HomeSearchProps) {
  return (
    <div className="flex-shrink-0 py-6">
      <div className="mx-auto max-w-3xl px-6">
        <div className="group relative">
          {/* Animated Glow Effect */}
          <div className="absolute -inset-1.5 rounded-[2rem] bg-linear-to-r from-primary/30 via-primary/10 to-primary/30 opacity-0 blur-2xl transition-all duration-700 group-focus-within:opacity-100 group-hover:opacity-40 animate-pulse" />

          <form
             onSubmit={(e) => e.preventDefault()}
             className="relative flex items-center gap-4 rounded-3xl border border-white/10 bg-black/40 px-6 py-4 backdrop-blur-2xl transition-all duration-500 group-focus-within:border-primary/50 group-focus-within:bg-black/60 group-focus-within:shadow-[0_0_50px_-12px_rgba(var(--primary),0.2)] hover:border-white/20"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-white/5 transition-colors group-focus-within:bg-primary/10 group-focus-within:text-primary">
              <Search className="h-5 w-5 transition-transform duration-500 group-focus-within:scale-110" />
            </div>
            <input
              type="text"
              placeholder="Search for channels, movies or series..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-lg font-bold tracking-tight text-foreground placeholder-muted-foreground/60 outline-none"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchQuery('')}
                className="h-10 w-10 shrink-0 rounded-sm hover:bg-destructive/10 hover:text-destructive transition-all duration-300"
              >
                <X className="h-5 w-5" />
              </Button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default HomeSearch;

