import { Search, X } from 'lucide-react';

import { Button } from '../ui/button';

interface HomeSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

function HomeSearch({ searchQuery, setSearchQuery }: HomeSearchProps) {
  return (
    <div className="flex-shrink-0 py-3">
      <div className="mx-auto max-w-2xl px-6">
        <div className="group relative">
          <div className="absolute -inset-1 rounded-2xl bg-primary/20 opacity-0 blur-xl transition-all duration-500 group-focus-within:opacity-100 group-hover:opacity-60" />
          <form
             onSubmit={(e) => e.preventDefault()}
             className="relative flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 transition-all duration-300 group-focus-within:border-primary/50 group-focus-within:bg-white/10 hover:border-white/20"
          >
            <Search className="h-4 w-4 flex-shrink-0 text-muted-foreground transition-colors group-focus-within:text-primary" />
            <input
              type="text"
              placeholder="Search channels, movies, series..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-base font-medium text-foreground placeholder-muted-foreground outline-none"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchQuery('')}
                className="h-8 w-8 shrink-0 rounded-full hover:bg-white/10 hover:text-primary"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default HomeSearch;

