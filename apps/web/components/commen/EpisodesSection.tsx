'use client';

import { useEpisodePlayback, useSeasonSelection, useStreamingUrls } from '@/hooks/useDetails';
import { EpisodesSectionProps } from '@/lib/types';
import { VideoPlayerModal } from '@/shared/components/common/VideoPlayerModal';
import { usePlaylistStore } from '@/store/appStore';
import { useRouter, useSearchParams } from 'next/navigation';
import { forwardRef, useEffect, useImperativeHandle, useMemo } from 'react';
import { EpisodeCard } from './EpisodeCard';

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
      <div className="mt-20 space-y-8" data-episodes-section>
        <div className="flex items-center gap-3">
          <div className="h-8 w-1 bg-green-500 rounded-full" /> {/* Accent bar */}
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Episodes</h2>
        </div>

        {/* Season Selector */}
        <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
          {seasons.map((season) => {
            const isSelected = selectedSeason === season;
            return (
              <button
                key={season}
                onClick={() => setSelectedSeason(season)}
                className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 border ${
                  isSelected
                    ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]'
                    : 'bg-white/5 text-white/40 border-white/10 hover:bg-white/10 hover:text-white'
                }`}
              >
                Season {season}
              </button>
            );
          })}
        </div>

        {/* Episodes Grid */}
        {sortedEpisodes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedEpisodes.map((episode) => (
              <div
                key={episode.id}
                className="transition-transform duration-300 hover:scale-[1.02]"
              >
                <EpisodeCard
                  episode={episode}
                  tmdbPoster={tmdbPoster}
                  fallbackImage={fallbackImage}
                  onSelect={handleSelectEpisodeWithSeason}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center bg-white/2 rounded-3xl border border-dashed border-white/10">
            <p className="text-white/20 font-bold uppercase tracking-widest text-xs">
              No Content Found
            </p>
          </div>
        )}

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
