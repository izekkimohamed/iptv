import { Search, X } from 'lucide-react';
import { Button } from '../ui/button';

interface HomeSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

function HomeSearch({ searchQuery, setSearchQuery }: HomeSearchProps) {
  return (
    <div className="flex-shrink-0 py-6 border-b border-white/5 ">
      <div className="max-w-2xl mx-auto px-4">
        <div className="relative group">
          <div className="absolute inset-0  /50 rounded-full blur opacity-60 group-hover:opacity-100 transition duration-500 animate-pulse" />
          <form className="relative rounded-full px-6 py-3 flex items-center gap-4 border border-amber-500/20 group-hover:border-amber-500/50 transition-all duration-300">
            <Search className="w-10 h-5 text-amber-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search channels, movies, series..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none text-sm font-medium"
            />
            {searchQuery && (
              <Button
                onClick={() => setSearchQuery('')}
                className="text-gray-400 bg-transparent border border-white/10 rounded-full hover:text-amber-400 transition-colors flex-shrink-0"
              >
                <X className="w-10 h-5" />
              </Button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default HomeSearch;
