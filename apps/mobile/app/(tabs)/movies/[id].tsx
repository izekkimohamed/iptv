import { trpc } from "@/lib/trpc";
import { usePlaylistStore } from "@/store";
import { useWatchedMoviesStore } from "@/store/watched-store";
import { usePlayerTheme } from "@/theme/playerTheme";
import { cleanName } from "@repo/utils";
import { FlashList } from "@shopify/flash-list";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Calendar,
  ChevronLeft,
  Clock,
  Film,
  Play,
  RotateCcw,
  Star,
  User,
} from "lucide-react-native";
import React, { useCallback, useMemo } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

("use no memo");

const { width, height } = Dimensions.get("window");
const POSTER_WIDTH = width * 0.38;
const POSTER_HEIGHT = POSTER_WIDTH * 1.5;

export const useStreamingUrls = (
  baseUrl: string,
  username: string,
  password: string,
  stream_id: string,
  container_extension?: string,
) => {
  const srcUrl = useMemo<string>(
    () => `${baseUrl}/movie/${username}/${password}/${stream_id}.${container_extension || "mp4"}`,
    [baseUrl, username, password, stream_id, container_extension],
  );
  const getEpisodeSrcUrl = useCallback<(episode: any) => string>(
    (episode: any) =>
      `${baseUrl}/series/${username}/${password}/${episode.id}.${episode.container_extension}`,
    [baseUrl, password, username],
  );
  return { srcUrl, getEpisodeSrcUrl };
};

export default function MovieDetailsScreen() {
  const router = useRouter();
  const theme = usePlayerTheme();
  const insets = useSafeAreaInsets();
  const selectPlaylist = usePlaylistStore((state) => state.selectedPlaylist);
  const { id, url } = useLocalSearchParams<{ id: string; url: string }>();
  const scrollY = useSharedValue(0);

  const saved = useWatchedMoviesStore((s) =>
    s.movies.find((i) => i.id === Number(id) && i.playlistId === (selectPlaylist?.id ?? 0))
  );
  const progress = saved && saved.duration > 0 ? saved.position / saved.duration : 0;

  const { data: movie, isLoading } = trpc.movies.getMovie.useQuery({
    movieId: +id,
    url: selectPlaylist?.baseUrl ?? "",
    username: selectPlaylist?.username ?? "",
    password: selectPlaylist?.password ?? "",
  });

  const scrollHandler = useAnimatedScrollHandler((e) => { scrollY.value = e.contentOffset.y; });
  const stickyStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, 180], [0, 1]),
    backgroundColor: theme.bg,
  }));

  if (isLoading)
    return (
      <View style={[styles.centered, { backgroundColor: theme.bg }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );

  if (!movie)
    return (
      <View style={[styles.centered, { backgroundColor: theme.bg }]}>
        <Film size={48} color={theme.textMuted} strokeWidth={1.5} />
        <Text style={[styles.errorText, { color: theme.textMuted }]}>Movie not found</Text>
      </View>
    );

  const movieTitle = cleanName(movie.movie_data.name);
  const backdropUrl = movie.tmdb?.backdrop || movie.info?.cover_big;
  const posterUrl = movie.tmdb?.poster || movie.info?.cover;
  const rating = parseFloat(movie.tmdb?.rating || movie.info?.rating || "0");
  const releaseYear = movie.tmdb?.releaseDate?.split("-")[0] || movie.info?.releasedate?.split("-")[0];
  const duration = movie.tmdb?.runtime || Math.floor((movie.info?.duration_secs || 0) / 60);
  const genres = movie.tmdb?.genres?.map((g: any) => g.name).slice(0, 3).join(" · ") || movie.info?.genre?.split(",").slice(0, 3).join(" · ");
  const director = movie.tmdb?.director || movie.info?.director;
  const cast = movie.tmdb?.cast || movie.info?.cast?.split(", ").slice(0, 8) || [];

  const handlePlay = (resume = false) => {
    router.push({
      pathname: "/player",
      params: {
        url,
        title: movieTitle,
        mediaType: "vod",
        movieId: id,
        streamId: id,
        categoryId: "0",
        playlistId: String(selectPlaylist?.id ?? ""),
        poster: posterUrl ?? "",
        resumePosition: resume && saved ? String(Math.max(0, saved.position - 5)) : "0",
      },
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Sticky header */}
      <Animated.View style={[styles.stickyHeader, stickyStyle, { paddingTop: insets.top, borderBottomColor: theme.border }]}>
        <Text style={[styles.stickyTitle, { color: theme.textPrimary }]} numberOfLines={1}>{movieTitle}</Text>
      </Animated.View>

      {/* Back button */}
      <SafeAreaView style={styles.floatingHeader} edges={["top"]}>
        <Pressable style={[styles.backBtn, { backgroundColor: "rgba(0,0,0,0.6)", borderColor: "rgba(255,255,255,0.15)" }]} onPress={() => router.back()}>
          <ChevronLeft color="#fff" size={24} strokeWidth={2.5} />
        </Pressable>
      </SafeAreaView>

      <Animated.ScrollView onScroll={scrollHandler} scrollEventThrottle={16} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>

        {/* Backdrop */}
        <View style={styles.backdropContainer}>
          <Image source={{ uri: backdropUrl }} style={styles.backdrop} />
          <View style={[styles.backdropScrim, { backgroundColor: theme.bg }]} />
        </View>

        {/* Hero */}
        <View style={styles.heroWrapper}>
          <Animated.View entering={FadeInDown.duration(500)} style={styles.heroRow}>
            {/* Poster */}
            <View style={styles.posterShadowWrap}>
              <Image source={{ uri: posterUrl }} style={[styles.poster, { borderColor: theme.border }]} />
              {rating > 0 && (
                <View style={[styles.ratingBadge, { backgroundColor: "rgba(0,0,0,0.75)" }]}>
                  <Star size={10} color="#fbbf24" fill="#fbbf24" />
                  <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
                </View>
              )}
            </View>

            {/* Info */}
            <View style={styles.infoCol}>
              <Text style={[styles.title, { color: theme.textPrimary }]}>{movieTitle}</Text>

              <View style={styles.chips}>
                {releaseYear && (
                  <View style={[styles.chip, { backgroundColor: theme.surfaceSecondary }]}>
                    <Calendar size={11} color={theme.textMuted} />
                    <Text style={[styles.chipText, { color: theme.textSecondary }]}>{releaseYear}</Text>
                  </View>
                )}
                {duration > 0 && (
                  <View style={[styles.chip, { backgroundColor: theme.surfaceSecondary }]}>
                    <Clock size={11} color={theme.textMuted} />
                    <Text style={[styles.chipText, { color: theme.textSecondary }]}>{Math.floor(duration / 60)}h {duration % 60}m</Text>
                  </View>
                )}
              </View>

              {genres ? <Text style={[styles.genres, { color: theme.primary }]} numberOfLines={2}>{genres}</Text> : null}
            </View>
          </Animated.View>
        </View>

        {/* Action buttons */}
        <Animated.View entering={FadeIn.delay(150)} style={styles.actions}>
          {/* Resume / Watch button */}
          {saved && progress > 0 ? (
            <View style={styles.resumeGroup}>
              <Pressable
                style={({ pressed }) => [styles.primaryBtn, { backgroundColor: theme.primary }, pressed && { opacity: 0.85 }]}
                onPress={() => handlePlay(true)}
              >
                <RotateCcw size={20} color={theme.primaryForeground} />
                <Text style={[styles.primaryBtnText, { color: theme.primaryForeground }]}>Resume</Text>
              </Pressable>
              {/* Progress bar under resume */}
              <View style={[styles.resumeBarBg, { backgroundColor: theme.surfaceSecondary }]}>
                <View style={[styles.resumeBarFill, { width: `${Math.round(progress * 100)}%`, backgroundColor: theme.primary }]} />
              </View>
              <Text style={[styles.resumeLabel, { color: theme.textMuted }]}>{Math.round(progress * 100)}% watched</Text>
              {/* Watch from start */}
              <Pressable
                style={({ pressed }) => [styles.secondaryBtn, { borderColor: theme.border, backgroundColor: theme.surfaceSecondary }, pressed && { opacity: 0.7 }]}
                onPress={() => handlePlay(false)}
              >
                <Play size={16} color={theme.textSecondary} />
                <Text style={[styles.secondaryBtnText, { color: theme.textSecondary }]}>Watch from start</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              style={({ pressed }) => [styles.primaryBtn, { backgroundColor: theme.primary }, pressed && { opacity: 0.85 }]}
              onPress={() => handlePlay(false)}
            >
              <Play size={20} color={theme.primaryForeground} fill={theme.primaryForeground} />
              <Text style={[styles.primaryBtnText, { color: theme.primaryForeground }]}>Watch Now</Text>
            </Pressable>
          )}
        </Animated.View>

        {/* Overview */}
        <Animated.View entering={FadeIn.delay(200)} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Overview</Text>
          <Text style={[styles.body, { color: theme.textSecondary }]}>
            {movie.info?.description || movie.tmdb?.overview || "No synopsis available."}
          </Text>
        </Animated.View>

        {/* Director */}
        {director && (
          <Animated.View entering={FadeIn.delay(250)} style={[styles.directorRow, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}>
            <Text style={[styles.directorLabel, { color: theme.textMuted }]}>DIRECTED BY</Text>
            <Text style={[styles.directorName, { color: theme.textPrimary }]}>{director}</Text>
          </Animated.View>
        )}

        {/* Cast */}
        {Array.isArray(cast) && cast.length > 0 && (
          <Animated.View entering={FadeIn.delay(300)} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Cast</Text>
            <FlashList
              horizontal
              data={cast}
              showsHorizontalScrollIndicator={false}
              estimatedItemSize={90}
              renderItem={({ item: member }) => {
                const hasImage = typeof member === "object" && member.profilePath;
                const name = typeof member === "string" ? member : member.name;
                return (
                  <View style={styles.castCard}>
                    <View style={[styles.castImg, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}>
                      {hasImage ? <Image source={{ uri: member.profilePath }} style={StyleSheet.absoluteFillObject} /> : <User size={22} color={theme.textMuted} />}
                    </View>
                    <Text style={[styles.castName, { color: theme.textSecondary }]} numberOfLines={2}>{name}</Text>
                  </View>
                );
              }}
            />
          </Animated.View>
        )}
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
  errorText: { fontSize: 15, fontWeight: "500" },

  stickyHeader: {
    position: "absolute", top: 0, left: 0, right: 0, zIndex: 100,
    alignItems: "center", justifyContent: "flex-end",
    paddingBottom: 12, borderBottomWidth: 1, height: 90,
  },
  stickyTitle: { fontSize: 15, fontWeight: "700", width: "65%", textAlign: "center" },

  floatingHeader: { position: "absolute", top: 0, left: 0, right: 0, zIndex: 101, paddingHorizontal: 16, paddingTop: 8 },
  backBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center", borderWidth: 1 },

  backdropContainer: { height: height * 0.5, width: "100%" },
  backdrop: { width: "100%", height: "100%", resizeMode: "cover" },
  backdropScrim: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.55,
  },

  heroWrapper: { paddingHorizontal: 16, marginTop: -POSTER_HEIGHT * 0.6 },
  heroRow: { flexDirection: "row", alignItems: "flex-end", gap: 14 },

  posterShadowWrap: {
    width: POSTER_WIDTH, height: POSTER_HEIGHT,
    shadowColor: "#000", shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.6, shadowRadius: 16, elevation: 12,
  },
  poster: { width: "100%", height: "100%", borderRadius: 10, borderWidth: 1, resizeMode: "cover" },
  ratingBadge: {
    position: "absolute", bottom: 8, left: 8,
    flexDirection: "row", alignItems: "center", gap: 3,
    paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6,
  },
  ratingText: { color: "#fbbf24", fontSize: 11, fontWeight: "800" },

  infoCol: { flex: 1, paddingBottom: 6, gap: 8 },
  title: { fontSize: 22, fontWeight: "800", lineHeight: 26, letterSpacing: -0.3 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  chipText: { fontSize: 11, fontWeight: "600" },
  genres: { fontSize: 12, fontWeight: "600", lineHeight: 18 },

  actions: { paddingHorizontal: 16, marginTop: 20, gap: 10 },

  primaryBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    height: 52, borderRadius: 12, gap: 8,
  },
  primaryBtnText: { fontSize: 16, fontWeight: "700" },

  resumeGroup: { gap: 8 },
  resumeBarBg: { height: 4, borderRadius: 2, overflow: "hidden" },
  resumeBarFill: { height: "100%", borderRadius: 2 },
  resumeLabel: { fontSize: 12, fontWeight: "600", textAlign: "center" },

  secondaryBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    height: 44, borderRadius: 12, gap: 8, borderWidth: 1,
  },
  secondaryBtnText: { fontSize: 14, fontWeight: "600" },

  section: { marginTop: 28, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 17, fontWeight: "700", marginBottom: 10 },
  body: { fontSize: 14, lineHeight: 22, opacity: 0.85 },

  directorRow: {
    marginHorizontal: 16, marginTop: 16,
    padding: 14, borderRadius: 10, borderWidth: 1, gap: 2,
  },
  directorLabel: { fontSize: 10, fontWeight: "800", letterSpacing: 1.5 },
  directorName: { fontSize: 15, fontWeight: "600" },

  castCard: { width: 80, marginRight: 12 },
  castImg: {
    width: 80, height: 110, borderRadius: 8, borderWidth: 1,
    overflow: "hidden", marginBottom: 6,
    justifyContent: "center", alignItems: "center",
  },
  castName: { fontSize: 11, fontWeight: "600", lineHeight: 15 },
});
