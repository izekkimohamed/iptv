"use client";
import PlaylistForm from "@/components/PlaylistForm";
import { trpc } from "@/lib/trpc";
import { usePlaylistStore } from "@/store/appStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

enum CreationStage {
  CHANNELS_CATEGORIES = "channels_categories",
  CHANNELS = "channels",
  MOVIES_CATEGORIES = "movies_categories",
  MOVIES = "movies",
  SERIES_CATEGORIES = "series_categories",
  SERIES = "series",
  COMPLETED = "completed",
}

interface CreationState {
  stage: CreationStage;
  isLoading: boolean;
  isCompleted: boolean;
  error?: string;
}

export default function Home() {
  const [creationStates, setCreationStates] = useState<
    Record<CreationStage, CreationState>
  >({
    [CreationStage.CHANNELS_CATEGORIES]: {
      stage: CreationStage.CHANNELS_CATEGORIES,
      isLoading: false,
      isCompleted: false,
    },
    [CreationStage.CHANNELS]: {
      stage: CreationStage.CHANNELS,
      isLoading: false,
      isCompleted: false,
    },
    [CreationStage.MOVIES_CATEGORIES]: {
      stage: CreationStage.MOVIES_CATEGORIES,
      isLoading: false,
      isCompleted: false,
    },
    [CreationStage.MOVIES]: {
      stage: CreationStage.MOVIES,
      isLoading: false,
      isCompleted: false,
    },
    [CreationStage.SERIES_CATEGORIES]: {
      stage: CreationStage.SERIES_CATEGORIES,
      isLoading: false,
      isCompleted: false,
    },
    [CreationStage.SERIES]: {
      stage: CreationStage.SERIES,
      isLoading: false,
      isCompleted: false,
    },
    [CreationStage.COMPLETED]: {
      stage: CreationStage.COMPLETED,
      isLoading: false,
      isCompleted: false,
    },
  });

  const [currentStage, setCurrentStage] = useState<CreationStage>(
    CreationStage.CHANNELS_CATEGORIES
  );
  const [totalProgress, setTotalProgress] = useState(0);

  const { isCreatingPlaylist, finishPlaylistCreation, selectedPlaylist } =
    usePlaylistStore();
  const router = useRouter();

  const updateStageState = (
    stage: CreationStage,
    updates: Partial<CreationState>
  ) => {
    setCreationStates((prev) => ({
      ...prev,
      [stage]: { ...prev[stage], ...updates },
    }));
  };

  const startStage = (stage: CreationStage) => {
    setCurrentStage(stage);
    updateStageState(stage, { isLoading: true });
  };

  const completeStage = (stage: CreationStage) => {
    setCreationStates((prev) => {
      const updated = {
        ...prev,
        [stage]: { ...prev[stage], isLoading: false, isCompleted: true },
      };
      const stages = Object.values(CreationStage).slice(0, -1);
      const completedCount = stages.filter(
        (s) => updated[s].isCompleted
      ).length;
      setTotalProgress((completedCount / stages.length) * 100);
      return updated;
    });
  };

  // Mutations
  const { mutate: createChannelsCategories } =
    trpc.channels.createChannelsCategories.useMutation({
      onSuccess: () => {
        completeStage(CreationStage.CHANNELS_CATEGORIES);
        startStage(CreationStage.CHANNELS);
      },
      onError: (error) => {
        updateStageState(CreationStage.CHANNELS_CATEGORIES, {
          isLoading: false,
          error: error.message,
        });
      },
    });

  const { mutate: createChannels } = trpc.channels.createChannels.useMutation({
    onSuccess: () => {
      completeStage(CreationStage.CHANNELS);
      startStage(CreationStage.MOVIES_CATEGORIES);
    },
    onError: (error) => {
      updateStageState(CreationStage.CHANNELS, {
        isLoading: false,
        error: error.message,
      });
    },
  });

  const { mutate: createMoviesCategories } =
    trpc.movies.createMoviesCategories.useMutation({
      onSuccess: () => {
        completeStage(CreationStage.MOVIES_CATEGORIES);
        startStage(CreationStage.MOVIES);
      },
      onError: (error) => {
        updateStageState(CreationStage.MOVIES_CATEGORIES, {
          isLoading: false,
          error: error.message,
        });
      },
    });

  const { mutate: createMovies } = trpc.movies.createMovie.useMutation({
    onSuccess: () => {
      completeStage(CreationStage.MOVIES);
      startStage(CreationStage.SERIES_CATEGORIES);
    },
    onError: (error) => {
      updateStageState(CreationStage.MOVIES, {
        isLoading: false,
        error: error.message,
      });
    },
  });

  const { mutate: createSeriesCategories } =
    trpc.series.createSeriesCategories.useMutation({
      onSuccess: () => {
        completeStage(CreationStage.SERIES_CATEGORIES);
        startStage(CreationStage.SERIES);
      },
      onError: (error) => {
        updateStageState(CreationStage.SERIES_CATEGORIES, {
          isLoading: false,
          error: error.message,
        });
      },
    });

  const { mutate: createSeries } = trpc.series.createSerie.useMutation({
    onSuccess: () => {
      completeStage(CreationStage.SERIES);
      setCurrentStage(CreationStage.COMPLETED);
      updateStageState(CreationStage.COMPLETED, { isCompleted: true });
      setTotalProgress(100);
    },
    onError: (error) => {
      updateStageState(CreationStage.SERIES, {
        isLoading: false,
        error: error.message,
      });
    },
  });

  // Single runner effect
  useEffect(() => {
    if (!isCreatingPlaylist || !selectedPlaylist) return;

    const { baseUrl: url, username, password, id } = selectedPlaylist;

    switch (currentStage) {
      case CreationStage.CHANNELS_CATEGORIES:
        createChannelsCategories({ url, username, password, playlistId: id });
        break;
      case CreationStage.CHANNELS:
        createChannels({ url, username, password, playlistId: id });
        break;
      case CreationStage.MOVIES_CATEGORIES:
        createMoviesCategories({ url, username, password, playlistId: id });
        break;
      case CreationStage.MOVIES:
        createMovies({ url, username, password, playlistId: id });
        break;
      case CreationStage.SERIES_CATEGORIES:
        createSeriesCategories({ url, username, password, playlistId: id });
        break;
      case CreationStage.SERIES:
        createSeries({ url, username, password, playlistId: id });
        break;
    }
  }, [
    createChannels,
    createChannelsCategories,
    createMovies,
    createMoviesCategories,
    createSeries,
    createSeriesCategories,
    currentStage,
    isCreatingPlaylist,
    selectedPlaylist,
  ]);

  // Handle completion redirect
  useEffect(() => {
    if (
      currentStage === CreationStage.COMPLETED &&
      creationStates[CreationStage.COMPLETED].isCompleted
    ) {
      const timeout = setTimeout(() => {
        finishPlaylistCreation();
        router.push("/");
      }, 2500);

      return () => clearTimeout(timeout);
    }
  }, [currentStage, creationStates, finishPlaylistCreation, router]);

  const getStageTitle = (stage: CreationStage) => {
    switch (stage) {
      case CreationStage.CHANNELS_CATEGORIES:
        return "Creating Channel Categories";
      case CreationStage.CHANNELS:
        return "Creating Channels";
      case CreationStage.MOVIES_CATEGORIES:
        return "Creating Movie Categories";
      case CreationStage.MOVIES:
        return "Creating Movies";
      case CreationStage.SERIES_CATEGORIES:
        return "Creating Series Categories";
      case CreationStage.SERIES:
        return "Creating Series";
      default:
        return "";
    }
  };

  const getStageDescription = (stage: CreationStage) => {
    switch (stage) {
      case CreationStage.CHANNELS_CATEGORIES:
        return "Setting up channel categories...";
      case CreationStage.CHANNELS:
        return "Importing channel data...";
      case CreationStage.MOVIES_CATEGORIES:
        return "Setting up movie categories...";
      case CreationStage.MOVIES:
        return "Importing movie library...";
      case CreationStage.SERIES_CATEGORIES:
        return "Setting up series categories...";
      case CreationStage.SERIES:
        return "Importing series library...";
      default:
        return "";
    }
  };

  if (isCreatingPlaylist) {
    return (
      <div className='overflow-y-auto flex items-center justify-center p-4'>
        <div className='bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 max-w-2xl w-full'>
          {/* Header */}
          <div className='text-center mb-8'>
            <div className='w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4'>
              <span className='text-white text-2xl font-bold'>📺</span>
            </div>
            <h1 className='text-3xl font-bold text-white mb-2'>
              Creating Your Playlist
            </h1>
            <p className='text-gray-300'>
              Please do NOT leave this page while we set up your content library
            </p>
          </div>

          {/* Overall Progress */}
          <div className='mb-8'>
            <div className='flex justify-between items-center mb-2'>
              <span className='text-white font-medium'>Overall Progress</span>
              <span className='text-purple-300 font-bold'>
                {Math.round(totalProgress)}%
              </span>
            </div>
            <div className='w-full bg-gray-700 rounded-full h-3'>
              <div
                className='bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500 ease-out'
                style={{ width: `${totalProgress}%` }}
              ></div>
            </div>
          </div>

          {/* Stage Progress */}
          {/* Stage Progress */}
          <div className='space-y-4'>
            {Object.values(CreationStage)
              .filter((stage) => stage !== CreationStage.COMPLETED)
              .map((stage) => {
                const state = creationStates[stage];
                const isActive = currentStage === stage;

                return (
                  <div
                    key={stage}
                    className={`flex items-center p-4 rounded-xl border transition-all duration-300 ${
                      isActive ? "bg-purple-500/20 border-purple-500/50"
                      : state.isCompleted ?
                        "bg-green-500/20 border-green-500/50"
                      : state.error ? "bg-red-500/20 border-red-500/50"
                      : "bg-white/5 border-white/10"
                    }`}
                  >
                    {/* Icon */}
                    <div className='mr-4 text-2xl'>
                      {state.error ?
                        "❌"
                      : state.isCompleted ?
                        "✅"
                      : state.isLoading ?
                        "⏳"
                      : "⚪"}
                    </div>

                    {/* Texts */}
                    <div className='flex-1'>
                      <h3
                        className={`font-semibold ${
                          isActive ? "text-purple-300"
                          : state.isCompleted ? "text-green-300"
                          : state.error ? "text-red-300"
                          : "text-white"
                        }`}
                      >
                        {getStageTitle(stage)}
                      </h3>
                      <p className='text-gray-400 text-sm mt-1'>
                        {state.error ?
                          `Error: ${state.error}`
                        : getStageDescription(stage)}
                      </p>
                    </div>

                    {/* Spinner */}
                    {state.isLoading && (
                      <div className='ml-4'>
                        <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500'></div>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>

          {/* Completion State */}
          {currentStage === CreationStage.COMPLETED && (
            <div className='mt-8 text-center'>
              <div className='text-4xl mb-4'>🎉</div>
              <h2 className='text-2xl font-bold text-green-300 mb-2'>
                Playlist Created Successfully!
              </h2>
              <p className='text-gray-300 mb-4'>
                Redirecting to your dashboard...
              </p>
              <div className='animate-pulse'>
                <div className='bg-green-500/20 text-green-300 px-4 py-2 rounded-full inline-block'>
                  Ready to stream! 🚀
                </div>
              </div>
            </div>
          )}

          {/* Warning */}
          <div className='mt-6 p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg'>
            <div className='flex items-center'>
              <span className='text-yellow-400 mr-2'>⚠️</span>
              <span className='text-yellow-200 text-sm'>
                This process may take several minutes. Please keep this page
                open.
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='pt-4'>
      <PlaylistForm />
    </div>
  );
}
