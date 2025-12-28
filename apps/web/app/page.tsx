'use client';

import { debounce, parseAsString, useQueryState } from 'nuqs';

import HomeSearch from '@/components/home/HomeSearch';
import HomeLanding from '@/components/home/Landing';
import SearchList from '@/components/home/SearchList';

export default function IPTVHomePage() {
  // Sync search with the URL ?q=...
  const [searchQuery, setSearchQuery] = useQueryState(
    'q',
    parseAsString.withDefault('').withOptions({ shallow: false }),
  );

  const handleInputSearch = (term: string) => {
    // Update the URL with the new search term

    setSearchQuery(term, {
      // Send immediate update if resetting, otherwise debounce at 500ms
      limitUrlUpdates: term === '' ? undefined : debounce(500),
    });
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <HomeSearch searchQuery={searchQuery} setSearchQuery={handleInputSearch} />

      {!searchQuery.trim().length ? <HomeLanding /> : <SearchList searchQuery={searchQuery} />}
    </div>
  );
}
