import { trpc } from "@/lib/trpc";
import { usePlaylistStore } from "@/store/appStore";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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

export default function PlaylistSetupScreen() {
  const router = useRouter();
  const { finishPlaylistCreation, selectedPlaylist } = usePlaylistStore();
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

  useEffect(() => {
    if (!selectedPlaylist) return;

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
    selectedPlaylist,
  ]);

  useEffect(() => {
    if (
      currentStage === CreationStage.COMPLETED &&
      creationStates[CreationStage.COMPLETED].isCompleted
    ) {
      const timeout = setTimeout(() => {
        finishPlaylistCreation();
        router.replace("/(tabs)/channels");
      }, 2500);

      return () => clearTimeout(timeout);
    }
  }, [currentStage, creationStates, finishPlaylistCreation, router]);

  const getStageTitle = (stage: CreationStage): string => {
    switch (stage) {
      case CreationStage.CHANNELS_CATEGORIES:
        return "Channel Categories";
      case CreationStage.CHANNELS:
        return "Channels";
      case CreationStage.MOVIES_CATEGORIES:
        return "Movie Categories";
      case CreationStage.MOVIES:
        return "Movies";
      case CreationStage.SERIES_CATEGORIES:
        return "Series Categories";
      case CreationStage.SERIES:
        return "Series";
      default:
        return "";
    }
  };

  const getStageIcon = (state: CreationState) => {
    if (state.error) return "❌";
    if (state.isCompleted) return "✅";
    if (state.isLoading) return "⏳";
    return "⚪";
  };

  return (
    <SafeAreaView style={styles.setupContainer} edges={["top"]}>
      <ScrollView
        style={styles.setupContent}
        contentContainerStyle={styles.setupContentInner}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.setupHeader}>
          <Text style={styles.setupTitle}>Creating Your Playlist</Text>
          <Text style={styles.setupSubtitle}>
            Setting up your content library
          </Text>
        </View>

        {/* Overall Progress */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Overall Progress</Text>
            <Text style={styles.progressPercent}>
              {Math.round(totalProgress)}%
            </Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View
              style={[styles.progressBar, { width: `${totalProgress}%` }]}
            />
          </View>
        </View>

        {/* Stage List */}
        <View style={styles.stagesList}>
          {Object.values(CreationStage)
            .filter((stage) => stage !== CreationStage.COMPLETED)
            .map((stage) => {
              const state = creationStates[stage];
              const isActive = currentStage === stage;

              return (
                <View
                  key={stage}
                  style={[
                    styles.stageItem,
                    isActive && styles.stageItemActive,
                    state.isCompleted && styles.stageItemCompleted,
                    state.error && styles.stageItemError,
                  ]}
                >
                  <Text style={styles.stageIcon}>{getStageIcon(state)}</Text>
                  <View style={styles.stageContent}>
                    <Text
                      style={[
                        styles.stageTitle,
                        isActive && styles.stageTitleActive,
                      ]}
                    >
                      {getStageTitle(stage)}
                    </Text>
                    {state.error && (
                      <Text style={styles.stageError}>{state.error}</Text>
                    )}
                  </View>
                  {state.isLoading && (
                    <ActivityIndicator color='#a78bfa' size='small' />
                  )}
                </View>
              );
            })}
        </View>

        {/* Completion State */}
        {currentStage === CreationStage.COMPLETED &&
          creationStates[CreationStage.COMPLETED].isCompleted && (
            <View style={styles.completionContainer}>
              <Text style={styles.completionEmoji}>🎉</Text>
              <Text style={styles.completionTitle}>
                Playlist Created Successfully!
              </Text>
              <Text style={styles.completionSubtitle}>
                Redirecting to your dashboard...
              </Text>
              <View style={styles.readyBadge}>
                <Text style={styles.readyBadgeText}>Ready to stream! 🚀</Text>
              </View>
            </View>
          )}

        {/* Warning */}
        <View style={styles.warningBox}>
          <Text style={styles.warningEmoji}>⚠️</Text>
          <Text style={styles.warningText}>
            This process may take several minutes. Please keep this page open.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },
  setupContainer: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },
  setupContent: {
    flex: 1,
  },
  setupContentInner: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  setupHeader: {
    alignItems: "center",
    marginBottom: 32,
    gap: 8,
  },
  setupTitle: {
    color: "white",
    fontSize: 28,
    fontWeight: "800",
  },
  setupSubtitle: {
    color: "#9CA3AF",
    fontSize: 14,
    fontWeight: "500",
  },
  progressSection: {
    marginBottom: 32,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressLabel: {
    color: "white",
    fontSize: 14,
    fontWeight: "700",
  },
  progressPercent: {
    color: "#a78bfa",
    fontSize: 16,
    fontWeight: "700",
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: "#222",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#a78bfa",
    borderRadius: 4,
  },
  stagesList: {
    gap: 12,
    marginBottom: 24,
  },
  stageItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: "#111",
    borderWidth: 1,
    borderColor: "#222",
    gap: 12,
  },
  stageItemActive: {
    backgroundColor: "rgba(167, 139, 250, 0.1)",
    borderColor: "rgba(167, 139, 250, 0.5)",
  },
  stageItemCompleted: {
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    borderColor: "rgba(16, 185, 129, 0.5)",
  },
  stageItemError: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderColor: "rgba(239, 68, 68, 0.5)",
  },
  stageIcon: {
    fontSize: 18,
  },
  stageContent: {
    flex: 1,
  },
  stageTitle: {
    color: "white",
    fontSize: 14,
    fontWeight: "700",
  },
  stageTitleActive: {
    color: "#a78bfa",
  },
  stageError: {
    color: "#fca5a5",
    fontSize: 12,
    fontWeight: "500",
    marginTop: 4,
  },
  completionContainer: {
    alignItems: "center",
    paddingVertical: 32,
    gap: 12,
  },
  completionEmoji: {
    fontSize: 48,
  },
  completionTitle: {
    color: "#10b981",
    fontSize: 20,
    fontWeight: "700",
  },
  completionSubtitle: {
    color: "#9CA3AF",
    fontSize: 14,
    fontWeight: "500",
  },
  readyBadge: {
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.5)",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 12,
  },
  readyBadgeText: {
    color: "#10b981",
    fontSize: 13,
    fontWeight: "700",
  },
  warningBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(234, 179, 8, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(234, 179, 8, 0.3)",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  warningEmoji: {
    fontSize: 16,
  },
  warningText: {
    color: "#fde047",
    fontSize: 13,
    fontWeight: "500",
    flex: 1,
  },
});
