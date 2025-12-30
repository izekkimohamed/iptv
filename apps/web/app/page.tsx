'use client';

import { debounce, parseAsString, useQueryState } from 'nuqs';

import HomeSearch from '@/components/home/HomeSearch';
import HomeLanding from '@/components/home/Landing';
import SearchList from '@/components/home/SearchList';
import { trpc } from '@/lib/trpc';
import { usePlaylistStore } from '@repo/store';
import { useEffect } from 'react';

export default function IPTVHomePage() {
  // Sync search with the URL ?q=...
  const [searchQuery, setSearchQuery] = useQueryState(
    'q',
    parseAsString.withDefault('').withOptions({ shallow: false }),
  );

  const {
    selectedPlaylist,
    selectPlaylist,
    playlists: storePlaylists,
    removePlaylist,
    addPlaylist,
    updatePlaylist,
  } = usePlaylistStore();

  const { data: playlists } = trpc.playlists.getPlaylists.useQuery();
  useEffect(() => {
    if (!playlists) return;

    // 1. Identify items to REMOVE (in store but not in fetched data)
    storePlaylists.forEach((stored) => {
      const stillExists = playlists.find((p) => p.id === stored.id);
      if (!stillExists) {
        removePlaylist(stored.id);
      }
    });

    // 2. Identify items to ADD or UPDATE
    playlists.forEach((fetched) => {
      const existing = storePlaylists.find((p) => p.id === fetched.id);

      if (!existing) {
        // New item found
        addPlaylist(fetched);
      } else {
        // Item exists, check if any fields changed (URL, Username, Status, etc.)
        // We compare strings to detect deep changes efficiently
        if (JSON.stringify(existing) !== JSON.stringify(fetched)) {
          updatePlaylist(fetched.id, fetched);
        }
      }
    });

    // 3. Auto-select first playlist if none is selected
    if (!selectedPlaylist && playlists.length > 0) {
      selectPlaylist(playlists[0]);
    }
  }, [
    playlists,
    storePlaylists,
    addPlaylist,
    removePlaylist,
    updatePlaylist,
    selectPlaylist,
    selectedPlaylist,
  ]);

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
