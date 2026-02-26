'use client';

import { trpc } from '@/shared/lib/trpc';
import { usePlaylistStore } from '@repo/store';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export enum CreationStage {
  CHANNELS_CATEGORIES = 'channels_categories',
  CHANNELS = 'channels',
  MOVIES_CATEGORIES = 'movies_categories',
  MOVIES = 'movies',
  SERIES_CATEGORIES = 'series_categories',
  SERIES = 'series',
  COMPLETED = 'completed',
}

interface Playlist {
  id: number;
  baseUrl: string;
  username: string;
  password: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  expDate: string;
  status: string;
  isTrial: string;
}

interface UsePlaylistCreationOptions {
  selectedPlaylist: Playlist | null;
  isCreatingPlaylist: boolean;
  finishPlaylistCreation: () => void;
}

export function usePlaylistCreation({
  selectedPlaylist,
  isCreatingPlaylist,
  finishPlaylistCreation,
}: UsePlaylistCreationOptions) {
  const utils = trpc.useUtils();
  const { updatePlaylist: updateStorePlaylist } = usePlaylistStore();

  const [currentStage, setCurrentStage] = useState<CreationStage>(CreationStage.CHANNELS_CATEGORIES);
  const [totalProgress, setTotalProgress] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);

  const { mutate: updatePlaylist } = trpc.playlists.updatePlaylists.useMutation({
    onSuccess: (data, variables) => {
      updateStorePlaylist(variables.playlistId, data);
    },
  });

  const mutationOptions = (stage: CreationStage, next: CreationStage | 'COMPLETED') => ({
    onSuccess: () => {
      if (next === 'COMPLETED') {
        setTotalProgress(100);
        setCurrentStage(CreationStage.COMPLETED);
        setTimeout(() => {
          if (!selectedPlaylist) return;
          updatePlaylist({ playlistId: selectedPlaylist.id });
          finishPlaylistCreation();
          setIsUpdating(false);
          utils.playlists.getPlaylists.invalidate();
          toast.success('Database sync complete');
        }, 1500);
      } else {
        const stageCount = Object.keys(CreationStage).length - 1;
        setTotalProgress((prev: number) => prev + 100 / stageCount);
        setCurrentStage(next as CreationStage);
      }
    },
    onError: (err: any) => {
      toast.error(`Error at ${stage}: ${err.message}`);
      setIsUpdating(false);
    },
  });

  const { mutate: createChannelsCategories } = trpc.channels.createChannelsCategories.useMutation(
    mutationOptions(CreationStage.CHANNELS_CATEGORIES, CreationStage.CHANNELS),
  );
  const { mutate: createChannels } = trpc.channels.createChannels.useMutation(
    mutationOptions(CreationStage.CHANNELS, CreationStage.MOVIES_CATEGORIES),
  );
  const { mutate: createMoviesCategories } = trpc.movies.createMoviesCategories.useMutation(
    mutationOptions(CreationStage.MOVIES_CATEGORIES, CreationStage.MOVIES),
  );
  const { mutate: createMovies } = trpc.movies.createMovie.useMutation(
    mutationOptions(CreationStage.MOVIES, CreationStage.SERIES_CATEGORIES),
  );
  const { mutate: createSeriesCategories } = trpc.series.createSeriesCategories.useMutation(
    mutationOptions(CreationStage.SERIES_CATEGORIES, CreationStage.SERIES),
  );
  const { mutate: createSeries } = trpc.series.createSerie.useMutation(
    mutationOptions(CreationStage.SERIES, 'COMPLETED'),
  );

  const handleUpdate = () => {
    setIsUpdating(true);
    setCurrentStage(CreationStage.CHANNELS_CATEGORIES);
    setTotalProgress(0);
  };

  useEffect(() => {
    const activePlaylist = selectedPlaylist;
    if (
      (!isCreatingPlaylist && !isUpdating) ||
      !activePlaylist ||
      currentStage === CreationStage.COMPLETED
    )
      return;

    const payload = {
      url: activePlaylist.baseUrl,
      username: activePlaylist.username,
      password: activePlaylist.password,
      playlistId: activePlaylist.id,
    };

    switch (currentStage) {
      case CreationStage.CHANNELS_CATEGORIES:
        createChannelsCategories(payload);
        break;
      case CreationStage.CHANNELS:
        createChannels(payload);
        break;
      case CreationStage.MOVIES_CATEGORIES:
        createMoviesCategories(payload);
        break;
      case CreationStage.MOVIES:
        createMovies(payload);
        break;
      case CreationStage.SERIES_CATEGORIES:
        createSeriesCategories(payload);
        break;
      case CreationStage.SERIES:
        createSeries(payload);
        break;
    }
  }, [currentStage, isCreatingPlaylist, isUpdating]);

  return {
    currentStage,
    totalProgress,
    isUpdating,
    handleUpdate,
  };
}
