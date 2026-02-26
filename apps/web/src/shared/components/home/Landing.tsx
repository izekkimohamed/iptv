'use client';

import {
  ContinueWatchingMovies,
  ContinueWatchingSeries,
  FavoriteChannels,
  TrendingMovies,
  TrendingSeries,
} from './sections';

function HomeLanding() {
  return (
    <div className="flex-1 overflow-x-hidden overflow-y-auto">
      <div className="mx-auto max-w-content space-y-section-gap px-6 py-12 lg:px-12">
        <FavoriteChannels />
        <ContinueWatchingMovies />
        <ContinueWatchingSeries />
        <TrendingMovies />
        <TrendingSeries />
      </div>
    </div>
  );
}

export default HomeLanding;
