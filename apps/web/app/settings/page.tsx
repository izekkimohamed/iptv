'use client';

import InstallationOverlay from '@/components/settings/InstallationOverlay';
import PlaylistForm from '@/components/settings/PlaylistForm';
import PlaylistManager from '@/components/settings/PlaylistManager';
import { trpc } from '@/lib/trpc';
import { usePlaylistForm } from '@repo/hooks';
import { usePlaylistStore } from '@repo/store';
import { Globe } from 'lucide-react';
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

export default function PlaylistSettingsPage() {
  const utils = trpc.useUtils();
  const {
    selectedPlaylist,
    selectPlaylist,
    isCreatingPlaylist,
    finishPlaylistCreation,
    removePlaylist,
    playlists: storedPlaylists,
    updatePlaylist: updateStorePlaylist,
  } = usePlaylistStore();

  const [currentStage, setCurrentStage] = useState<CreationStage>(
    CreationStage.CHANNELS_CATEGORIES,
  );
  const [totalProgress, setTotalProgress] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);

  const { mutate: updatePlaylist } = trpc.playlists.updatePlaylists.useMutation({
    onSuccess: (data, variables) => {
      updateStorePlaylist(variables.playlistId, data);
    },
  });
  const { mutate: deletePlaylist, isPending: deletePending } =
    trpc.playlists.deletePlaylist.useMutation({
      onSuccess: async (data, variables) => {
        await utils.playlists.getPlaylists.invalidate();
        removePlaylist(variables.playlistId);
        if (storedPlaylists.length) {
          selectPlaylist(storedPlaylists[0]);
        }
        toast.success('Node removed successfully');
      },
    });

  // --- 1. FORM HOOK ---
  const {
    formData,
    setFormData,
    isPending: isVerifying,
    handleSubmit,
    isFormValid,
    urlError,
    urlTouched,
    setUrlTouched,
    urlStatus,
  } = usePlaylistForm(trpc);

  // --- 2. SEQUENTIAL MUTATIONS ---
  const mutationOptions = (stage: CreationStage, next: CreationStage | 'COMPLETED') => ({
    onSuccess: () => {
      if (next === 'COMPLETED') {
        setTotalProgress(100);
        setCurrentStage(CreationStage.COMPLETED);
        setTimeout(() => {
          if (!selectedPlaylist) return;
          updatePlaylist({
            playlistId: selectedPlaylist.id,
          });

          finishPlaylistCreation();
          setIsUpdating(false);

          utils.playlists.getPlaylists.invalidate();
          toast.success('Database sync complete');
        }, 1500);
      } else {
        const stageCount = Object.keys(CreationStage).length - 1;
        setTotalProgress((prev) => prev + 100 / stageCount);
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

  // --- 3. THE UPDATE TRIGGER ---
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

  const { data: playlists } = trpc.playlists.getPlaylists.useQuery();

  return (
    <div className="h-full overflow-y-auto px-6 py-12 text-neutral-100">
      {/* Loading Overlay */}
      {(isCreatingPlaylist || isUpdating) && (
        <InstallationOverlay
          currentStage={currentStage}
          totalProgress={totalProgress}
          isUpdating={isUpdating}
        />
      )}

      <div className="mx-auto max-w-7xl space-y-12">
        {/* Header */}
        <header className="flex flex-col gap-2 border-b border-white/5 pb-8 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Streams<span className="text-amber-500">.</span>
            </h1>
            <p className="flex items-center gap-2 text-sm font-medium text-neutral-400">
              <Globe className="h-4 w-4 text-amber-500" />
              Global Content Delivery Network
            </p>
          </div>
        </header>

        <div className="grid gap-12 lg:grid-cols-12">
          {/* Left: Add Form */}
          <div className="lg:col-span-5">
            <div className="sticky top-8">
              <PlaylistForm
                formData={formData}
                setFormData={setFormData}
                isVerifying={isVerifying}
                handleSubmit={handleSubmit}
                isFormValid={isFormValid}
                urlError={urlError}
                urlTouched={urlTouched}
                setUrlTouched={setUrlTouched}
                urlStatus={urlStatus}
              />
            </div>
          </div>

          {/* Right: List */}
          {playlists && selectedPlaylist && (
            <div className="lg:col-span-7">
              <PlaylistManager
                playlists={playlists}
                selectedPlaylist={selectedPlaylist}
                selectPlaylist={selectPlaylist}
                handleUpdate={handleUpdate}
                deletePlaylist={deletePlaylist}
                deletePending={deletePending}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
