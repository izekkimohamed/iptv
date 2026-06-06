'use client';

import { parseAsString, useQueryState } from 'nuqs';
import { useEffect, useRef } from 'react';

import HomeSearch from '@/shared/components/home/HomeSearch';
import HomeLanding from '@/shared/components/home/Landing';
import SearchList from '@/shared/components/home/SearchList';
import { trpc } from '@/shared/lib/trpc';
import { usePlaylistStore } from '@repo/store';

export function IPTVHomePageClient() {
  // Sync search with the URL ?q=...
  const [searchQuery, setSearchQuery] = useQueryState(
    'q',
    parseAsString.withDefault('').withOptions({
      shallow: false,

    })

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

  const synced = useRef(false);

  useEffect(() => {
    if (!playlists) return;

    if (synced.current) return;
    synced.current = true;

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
  }, [playlists]);

  const handleInputSearch = (term: string, opts?: any) => {
    setSearchQuery(term, opts);
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <HomeSearch searchQuery={searchQuery} setSearchQuery={handleInputSearch} />

      {!searchQuery.trim().length ? <HomeLanding /> : <SearchList searchQuery={searchQuery} />}
    </div>
  );
}
