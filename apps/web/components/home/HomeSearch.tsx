import { Search, X } from 'lucide-react';

import { Button } from '../ui/button';

interface HomeSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

function HomeSearch({ searchQuery, setSearchQuery }: HomeSearchProps) {
  return (
    <div className="flex-shrink-0 border-b border-white/5 py-6">
      <div className="mx-auto max-w-2xl px-4">
        <div className="group relative">
          <div className="/50 absolute inset-0 animate-pulse rounded-full opacity-60 blur transition duration-500 group-hover:opacity-100" />
          <form className="relative flex items-center gap-4 rounded-full border border-amber-500/20 px-6 py-3 transition-all duration-300 group-hover:border-amber-500/50">
            <Search className="h-5 w-10 flex-shrink-0 text-amber-400" />
            <input
              type="text"
              placeholder="Search channels, movies, series..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm font-medium text-white placeholder-gray-500 outline-none"
            />
            {searchQuery && (
              <Button
                onClick={() => setSearchQuery('')}
                className="flex-shrink-0 rounded-full border border-white/10 bg-transparent text-gray-400 transition-colors hover:text-amber-400"
              >
                <X className="h-5 w-10" />
              </Button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default HomeSearch;
