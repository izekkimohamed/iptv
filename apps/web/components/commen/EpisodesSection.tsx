'use client';

import { useEpisodePlayback, useSeasonSelection, useStreamingUrls } from '@/hooks/useDetails';
import { EpisodesSectionProps } from '@/lib/types';
import { usePlaylistStore } from '@/store/appStore';
import { useRouter, useSearchParams } from 'next/navigation';
import { forwardRef, useEffect, useImperativeHandle, useMemo } from 'react';
import { Button } from '../ui/button';
import { EpisodeCard } from './EpisodeCard';
import { VideoPlayerModal } from './VideoModels';

interface EpisodesSectionHandle {
  playEpisode: (episode: any) => void;
}

export const EpisodesSection = forwardRef<EpisodesSectionHandle, EpisodesSectionProps>(
  ({ seasons, episodes, tmdbPoster, fallbackImage, containerExtension, streamId, image }, ref) => {
    const searchParams = useSearchParams();
    const router = useRouter();

    const initialSeasonId = searchParams.get('seasonId');
    const initialEpisodeId = searchParams.get('episodeNumber');
    const serieId = searchParams.get('serieId');
    const categoryId = searchParams.get('categoryId');
    const shouldAutoPlay =
      searchParams.get('resume') === 'true' || searchParams.get('autoplay') === 'true';

    const { selectedPlaylist } = usePlaylistStore();
    const { playingEpisode, handleCloseEpisode, handleEpisodeSelect } = useEpisodePlayback();
    const { selectedSeason, setSelectedSeason } = useSeasonSelection(seasons);
    const { getEpisodeSrcUrl } = useStreamingUrls(selectedPlaylist, streamId, containerExtension);

    const episodesTotal = Object.values(episodes ?? {}).flat().length;
    const filteredEpisodes = useMemo(
      () => episodes?.[selectedSeason] ?? [],
      [episodes, selectedSeason],
    );

    const sortedEpisodes = useMemo(
      () =>
        Array.isArray(filteredEpisodes)
          ? [...filteredEpisodes].sort((a, b) => a.episode_num - b.episode_num)
          : [],
      [filteredEpisodes],
    );

    // Get all episodes sorted across all seasons
    const allEpisodesSorted = useMemo(() => {
      const all: typeof sortedEpisodes = [];
      if (episodes) {
        Object.values(episodes).forEach((eps) => {
          if (Array.isArray(eps)) all.push(...eps);
        });
      }
      return all.sort((a, b) => {
        if (a.season !== b.season) return a.season - b.season;
        return a.episode_num - b.episode_num;
      });
    }, [episodes]);

    // Find current episode index
    const currentIndex = useMemo(() => {
      if (!playingEpisode) return -1;
      return allEpisodesSorted.findIndex((e) => e.id === playingEpisode.id);
    }, [playingEpisode, allEpisodesSorted]);

    const hasPrev = currentIndex > 0;
    const hasNext = currentIndex < allEpisodesSorted.length - 1;

    // Initialize from URL params on mount
    useEffect(() => {
      if (!initialSeasonId || !initialEpisodeId || !seasons || !episodes) return;

      const seasonIdNum = Number(initialSeasonId);
      if (seasons.includes(seasonIdNum)) {
        setSelectedSeason(seasonIdNum);

        const episode = episodes[seasonIdNum]?.find(
          (ep) => ep.episode_num === Number(initialEpisodeId),
        );
        if (episode && shouldAutoPlay) {
          handleEpisodeSelect(episode);
        }
      }
    }, [initialSeasonId, initialEpisodeId, seasons, episodes, shouldAutoPlay]);

    // Expose playEpisode function through ref
    useImperativeHandle(ref, () => ({
      playEpisode: (episode: (typeof sortedEpisodes)[0]) => {
        if (episode.season) {
          setSelectedSeason(episode.season);
        }
        handleEpisodeSelect(episode);
      },
    }));

    // Handle episode selection with season context
    const handleSelectEpisodeWithSeason = (episode: (typeof sortedEpisodes)[0]) => {
      handleEpisodeSelect(episode);
      // Update URL with current season and episode
      const params = new URLSearchParams(searchParams.toString());
      params.set('seasonId', String(episode.season));
      params.set('episodeNumber', String(episode.episode_num));
      router.replace(`?${params.toString()}`);
    };

    // Handle previous episode
    const playPrevEpisode = () => {
      if (!hasPrev) return;

      const prevEpisode = allEpisodesSorted[currentIndex - 1];
      handleSelectEpisodeWithSeason(prevEpisode);
    };

    // Handle next episode
    const playNextEpisode = () => {
      if (!hasNext) return;

      const nextEpisode = allEpisodesSorted[currentIndex + 1];
      handleSelectEpisodeWithSeason(nextEpisode);
    };

    if (!seasons || seasons.length === 0) return null;

    return (
      <div className="" data-episodes-section>
        <div className="mt-16 space-y-6">
          <h2 className="text-3xl font-bold text-white">Episodes</h2>

          {/* Season Selector */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {seasons.map((season) => {
              const count = episodes?.[season]?.length ?? 0;
              const isSelected = selectedSeason === season;

              return (
                <Button
                  key={season}
                  onClick={() => setSelectedSeason(season)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 whitespace-nowrap border flex-shrink-0 ${
                    isSelected
                      ? 'bg-amber-500/20 text-amber-200 border-amber-400 shadow-lg shadow-amber-500/25'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:border-slate-600'
                  }`}
                >
                  <span>Season {season}</span>
                  {count > 0 && <span className="ml-2 text-xs opacity-75">({count})</span>}
                </Button>
              );
            })}
          </div>

          {/* Episodes Grid */}
          {sortedEpisodes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedEpisodes.map((episode) => (
                <EpisodeCard
                  key={episode.id}
                  episode={episode}
                  tmdbPoster={tmdbPoster}
                  fallbackImage={fallbackImage}
                  onSelect={handleSelectEpisodeWithSeason}
                />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center bg-slate-800 rounded-lg border border-slate-700">
              <p className="text-slate-400">No episodes available for Season {selectedSeason}</p>
            </div>
          )}
        </div>

        {/* Video Player Modal */}
        {playingEpisode && (
          <VideoPlayerModal
            isOpen={!!playingEpisode}
            onClose={handleCloseEpisode}
            src={getEpisodeSrcUrl(playingEpisode)}
            poster={image}
            title={playingEpisode.title || `Episode ${playingEpisode.episode_num}`}
            autoPlay
            episodeNumber={playingEpisode.episode_num}
            totalEpisodes={episodesTotal}
            seasonId={playingEpisode.season}
            onNextEpisode={playNextEpisode}
            onPrevEpisode={playPrevEpisode}
            hasNext={hasNext}
            hasPrev={hasPrev}
            categoryId={categoryId}
            serieId={serieId}
            movieId={null}
            showButton={true}
          />
        )}
      </div>
    );
  },
);

EpisodesSection.displayName = 'EpisodesSection';
