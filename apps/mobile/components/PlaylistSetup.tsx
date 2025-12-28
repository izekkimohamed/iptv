import { trpc } from "@/lib/trpc";
import { usePlaylistStore } from "@/store/appStore";
import { usePlayerTheme } from "@/theme/playerTheme";
import { useRouter } from "expo-router";
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Database,
  Film,
  Tv,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeInUp, Layout, ZoomIn } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

// --- Types & Constants ---
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

// --- Icons Helper ---
const getStageIcon = (stage: CreationStage, color: string) => {
  switch (true) {
    case stage.includes("CHANNELS"):
      return <Tv size={18} color={color} />;
    case stage.includes("MOVIES"):
      return <Film size={18} color={color} />;
    case stage.includes("SERIES"):
      return <Tv size={18} color={color} />; // Clapperboard isn't in standard Lucide sometimes, Tv acts as fallback
    default:
      return <Database size={18} color={color} />;
  }
};

export default function PlaylistSetupScreen() {
  const router = useRouter();
  const theme = usePlayerTheme();
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

  // --- Logic Helpers ---
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

  // --- Mutations (Identical Logic to Original) ---
  const { mutate: createChannelsCategories } =
    trpc.channels.createChannelsCategories.useMutation({
      onSuccess: () => {
        completeStage(CreationStage.CHANNELS_CATEGORIES);
        startStage(CreationStage.CHANNELS);
      },
      onError: (e) =>
        updateStageState(CreationStage.CHANNELS_CATEGORIES, {
          isLoading: false,
          error: e.message,
        }),
    });
  const { mutate: createChannels } = trpc.channels.createChannels.useMutation({
    onSuccess: () => {
      completeStage(CreationStage.CHANNELS);
      startStage(CreationStage.MOVIES_CATEGORIES);
    },
    onError: (e) =>
      updateStageState(CreationStage.CHANNELS, {
        isLoading: false,
        error: e.message,
      }),
  });
  const { mutate: createMoviesCategories } =
    trpc.movies.createMoviesCategories.useMutation({
      onSuccess: () => {
        completeStage(CreationStage.MOVIES_CATEGORIES);
        startStage(CreationStage.MOVIES);
      },
      onError: (e) =>
        updateStageState(CreationStage.MOVIES_CATEGORIES, {
          isLoading: false,
          error: e.message,
        }),
    });
  const { mutate: createMovies } = trpc.movies.createMovie.useMutation({
    onSuccess: () => {
      completeStage(CreationStage.MOVIES);
      startStage(CreationStage.SERIES_CATEGORIES);
    },
    onError: (e) =>
      updateStageState(CreationStage.MOVIES, {
        isLoading: false,
        error: e.message,
      }),
  });
  const { mutate: createSeriesCategories } =
    trpc.series.createSeriesCategories.useMutation({
      onSuccess: () => {
        completeStage(CreationStage.SERIES_CATEGORIES);
        startStage(CreationStage.SERIES);
      },
      onError: (e) =>
        updateStageState(CreationStage.SERIES_CATEGORIES, {
          isLoading: false,
          error: e.message,
        }),
    });
  const { mutate: createSeries } = trpc.series.createSerie.useMutation({
    onSuccess: () => {
      completeStage(CreationStage.SERIES);
      setCurrentStage(CreationStage.COMPLETED);
      updateStageState(CreationStage.COMPLETED, { isCompleted: true });
      setTotalProgress(100);
    },
    onError: (e) =>
      updateStageState(CreationStage.SERIES, {
        isLoading: false,
        error: e.message,
      }),
  });

  // --- Effects ---
  useEffect(() => {
    if (!selectedPlaylist) return;
    const { baseUrl: url, username, password, id } = selectedPlaylist;

    const payload = { url, username, password, playlistId: id };

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
  }, [currentStage, selectedPlaylist]);

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
  }, [currentStage, creationStates]);

  // --- Render Helpers ---
  const getStageTitle = (stage: CreationStage) => {
    return stage.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.bg }]}
      edges={["top"]}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>
            Setting Up Library
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Syncing content from your provider
          </Text>
        </View>

        {/* Progress Circle/Bar */}
        <View style={styles.progressSection}>
          <View style={styles.progressLabels}>
            <Text style={[styles.progressText, { color: theme.textSecondary }]}>
              Overall Progress
            </Text>
            <Text style={[styles.progressValue, { color: theme.primary }]}>
              {Math.round(totalProgress)}%
            </Text>
          </View>
          <View style={[styles.track, { backgroundColor: theme.trackBg }]}>
            <Animated.View
              layout={Layout.springify()}
              style={[
                styles.fill,
                { width: `${totalProgress}%`, backgroundColor: theme.primary },
              ]}
            />
          </View>
        </View>

        {/* Stages List */}
        <View style={styles.stagesContainer}>
          {Object.values(CreationStage)
            .filter((stage) => stage !== CreationStage.COMPLETED)
            .map((stage, index) => {
              const state = creationStates[stage];
              const isActive = currentStage === stage;
              const isDone = state.isCompleted;

              return (
                <Animated.View
                  key={stage}
                  layout={Layout.springify()}
                  entering={FadeInUp.delay(index * 50)}
                  style={[
                    styles.stageCard,
                    {
                      backgroundColor:
                        isActive ?
                          `${theme.primary}10`
                        : theme.surfaceSecondary,
                      borderColor: isActive ? theme.primary : theme.border,
                      opacity: isDone || isActive ? 1 : 0.5,
                    },
                  ]}
                >
                  <View style={styles.iconBox}>
                    {state.error ?
                      <AlertCircle size={20} color={theme.accentError} />
                    : isDone ?
                      <CheckCircle2 size={20} color={theme.accentSuccess} />
                    : isActive ?
                      <ActivityIndicator />
                    : getStageIcon(stage, theme.textMuted)}
                  </View>

                  <View style={styles.stageInfo}>
                    <Text
                      style={[
                        styles.stageName,
                        { color: isActive ? theme.primary : theme.textPrimary },
                      ]}
                    >
                      {getStageTitle(stage)}
                    </Text>
                    {state.error ?
                      <Text
                        style={[
                          styles.stageStatus,
                          { color: theme.accentError },
                        ]}
                      >
                        {state.error}
                      </Text>
                    : <Text
                        style={[
                          styles.stageStatus,
                          { color: theme.textSecondary },
                        ]}
                      >
                        {isDone ?
                          "Synced"
                        : isActive ?
                          "Syncing..."
                        : "Pending"}
                      </Text>
                    }
                  </View>

                  {isDone && (
                    <ChevronRight size={16} color={theme.accentSuccess} />
                  )}
                </Animated.View>
              );
            })}
        </View>

        {/* Completion Success Overlay */}
        {currentStage === CreationStage.COMPLETED && (
          <Animated.View
            entering={ZoomIn}
            style={[
              styles.successBox,
              {
                backgroundColor: theme.surfaceSecondary,
                borderColor: theme.accentSuccess,
              },
            ]}
          >
            <View
              style={[
                styles.successIcon,
                { backgroundColor: `${theme.accentSuccess}20` },
              ]}
            >
              <CheckCircle2 size={40} color={theme.accentSuccess} />
            </View>
            <Text style={[styles.successTitle, { color: theme.textPrimary }]}>
              All Systems Go!
            </Text>
            <Text style={[styles.successSub, { color: theme.textSecondary }]}>
              Redirecting to dashboard...
            </Text>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, paddingBottom: 50 },

  header: { alignItems: "center", marginBottom: 32 },
  title: { fontSize: 24, fontWeight: "800", marginBottom: 8 },
  subtitle: { fontSize: 14 },

  progressSection: { marginBottom: 32 },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressText: { fontSize: 13, fontWeight: "600" },
  progressValue: { fontSize: 14, fontWeight: "800" },
  track: { height: 8, borderRadius: 4, overflow: "hidden" },
  fill: { height: "100%", borderRadius: 4 },

  stagesContainer: { gap: 12 },
  stageCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 16,
  },
  iconBox: { width: 24, alignItems: "center" },
  stageInfo: { flex: 1 },
  stageName: { fontSize: 15, fontWeight: "700", marginBottom: 2 },
  stageStatus: { fontSize: 12 },
  spin: { transform: [{ rotate: "45deg" }] }, // Placeholder, Reanimated rotation recommended

  successBox: {
    marginTop: 24,
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: "center",
    gap: 12,
  },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  successTitle: { fontSize: 20, fontWeight: "800" },
  successSub: { fontSize: 14 },
});
