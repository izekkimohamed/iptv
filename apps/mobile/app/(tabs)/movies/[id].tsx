import { trpc } from "@/lib/trpc";
import { usePlaylistStore } from "@/store";
import { usePlayerTheme } from "@/theme/playerTheme";
import { cleanName } from "@repo/utils";
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Calendar,
  ChevronLeft,
  Clock,
  Film,
  Play,
  Star,
  User,
  Zap,
} from "lucide-react-native";
import React, { useCallback, useMemo } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");
const POSTER_WIDTH = width * 0.42;
const POSTER_HEIGHT = POSTER_WIDTH * 1.5;

// --- Helper Hook (Kept from your code) ---
export const useStreamingUrls = (
  baseUrl: string,
  username: string,
  password: string,
  stream_id: string,
  container_extension?: string,
) => {
  const srcUrl = useMemo<string>(
    () =>
      `${baseUrl}/movie/${username}/${password}/${stream_id}.${
        container_extension || "mp4"
      }`,
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
  const { id, url } = useLocalSearchParams<{
    id: string;
    url: string;
  }>();

  // Animation Shared Values
  const scrollY = useSharedValue(0);

  const { data: movie, isLoading } = trpc.movies.getMovie.useQuery({
    movieId: +id,
    url: selectPlaylist?.baseUrl ?? "",
    username: selectPlaylist?.username ?? "",
    password: selectPlaylist?.password ?? "",
  });

  // --- Animation Handlers ---
  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const stickyHeaderStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(scrollY.value, [0, 200], [0, 1]),
      backgroundColor: theme.bg,
    };
  });

  if (isLoading)
    return (
      <View style={[styles.centered, { backgroundColor: theme.bg }]}>
        <View style={[styles.loadingBackdrop, { borderColor: theme.border }]}>
          <ActivityIndicator size='large' color={theme.primary} />
        </View>
      </View>
    );

  if (!movie)
    return (
      <View style={[styles.centered, { backgroundColor: theme.bg }]}>
        <Film size={48} color={theme.textMuted} strokeWidth={1.5} />
        <Text style={[styles.errorText, { color: theme.textMuted }]}>
          Movie not found
        </Text>
      </View>
    );

  // --- Data Mapping ---
  const movieTitle = cleanName(movie.movie_data.name);
  const backdropUrl = movie.tmdb?.backdrop || movie.info?.cover_big;
  const posterUrl = movie.tmdb?.poster || movie.info?.cover;
  const rating = parseFloat(movie.tmdb?.rating || movie.info?.rating || "0");
  const releaseYear =
    movie.tmdb?.releaseDate?.split("-")[0] ||
    movie.info?.releasedate?.split("-")[0];
  const duration =
    movie.tmdb?.runtime || Math.floor((movie.info?.duration_secs || 0) / 60);
  const genres =
    movie.tmdb?.genres
      ?.map((g: any) => g.name)
      .slice(0, 2)
      .join(" • ") || movie.info?.genre?.split(",").slice(0, 2).join(" • ");
  const director = movie.tmdb?.director || movie.info?.director;
  const cast =
    movie.tmdb?.cast || movie.info?.cast?.split(", ").slice(0, 8) || [];

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* --- Sticky Header (Fades in) --- */}
      <Animated.View
        style={[
          styles.stickyHeader,
          stickyHeaderStyle,
          {
            height: 60 + insets.top,
            paddingTop: insets.top,
            borderBottomColor: theme.border,
          },
        ]}
      >
        <Text
          style={[styles.stickyTitle, { color: theme.textPrimary }]}
          numberOfLines={1}
        >
          {movieTitle}
        </Text>
      </Animated.View>

      {/* --- Floating Back Button --- */}
      <SafeAreaView style={styles.floatingHeader} edges={["top"]}>
        <Pressable
          style={[
            styles.backBtn,
            {
              backgroundColor: theme.glassMedium, // Always visible dark glass
              borderColor: theme.border,
            },
          ]}
          onPress={() => router.back()}
        >
          <ChevronLeft color={theme.primary} size={26} strokeWidth={2.5} />
        </Pressable>
      </SafeAreaView>

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* --- Parallax Backdrop --- */}
        <View style={styles.backdropContainer}>
          <Image
            source={{ uri: backdropUrl }}
            style={styles.backdrop}
            contentFit='cover'
            transition={500}
          />
          <LinearGradient
            colors={["transparent", `${theme.bg}00`, `${theme.bg}E6`, theme.bg]}
            locations={[0, 0.4, 0.85, 1]}
            style={styles.backdropGradient}
          />
        </View>

        {/* --- Hero Section --- */}
        <View style={styles.heroWrapper}>
          <Animated.View
            entering={FadeInDown.duration(600)}
            style={styles.heroContent}
          >
            {/* 1. Large Poster */}
            <View style={styles.posterContainer}>
              <View
                style={[styles.posterShadow, { shadowColor: theme.primary }]}
              />
              <Image
                source={{ uri: posterUrl }}
                style={[styles.poster, { borderColor: theme.border }]}
                contentFit='cover'
                transition={300}
              />
              {rating > 0 && (
                <View style={styles.ratingBadge}>
                  <View
                    style={[
                      styles.ratingBlur,
                      { backgroundColor: theme.glassStrong },
                    ]}
                  />
                  <Star size={12} color='#fbbf24' fill='#fbbf24' />
                  <Text
                    style={[styles.ratingText, { color: theme.textPrimary }]}
                  >
                    {rating.toFixed(1)}
                  </Text>
                </View>
              )}
            </View>

            {/* 2. Info Column */}
            <View style={styles.infoColumn}>
              <Text style={[styles.title, { color: theme.textPrimary }]}>
                {movieTitle}
              </Text>

              <View style={styles.metaRow}>
                {releaseYear && (
                  <View
                    style={[
                      styles.metaTag,
                      { backgroundColor: theme.surfaceSecondary },
                    ]}
                  >
                    <Calendar size={12} color={theme.textSecondary} />
                    <Text
                      style={[styles.metaText, { color: theme.textSecondary }]}
                    >
                      {releaseYear}
                    </Text>
                  </View>
                )}
                {duration > 0 && (
                  <View
                    style={[
                      styles.metaTag,
                      { backgroundColor: theme.surfaceSecondary },
                    ]}
                  >
                    <Clock size={12} color={theme.textSecondary} />
                    <Text
                      style={[styles.metaText, { color: theme.textSecondary }]}
                    >
                      {Math.floor(duration / 60)}h {duration % 60}m
                    </Text>
                  </View>
                )}
              </View>

              {genres ?
                <Text
                  style={[styles.genreText, { color: theme.primary }]}
                  numberOfLines={1}
                >
                  {genres}
                </Text>
              : null}
            </View>
          </Animated.View>
        </View>

        {/* --- Main Play Button --- */}
        <Animated.View
          entering={FadeInUp.delay(200)}
          style={styles.actionSection}
        >
          <Pressable
            style={({ pressed }) => [
              styles.playButton,
              pressed && { transform: [{ scale: 0.98 }] },
            ]}
            onPress={() =>
              router.push({
                pathname: "/player",
                params: { url: url, title: movieTitle },
              })
            }
          >
            <LinearGradient
              colors={[theme.primary, theme.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.playGradient}
            />
            <Play
              size={24}
              fill={theme.textSecondary}
              color={theme.textSecondary}
            />
            <Text
              style={[
                styles.playText,
                {
                  color: theme.textSecondary,
                },
              ]}
            >
              Watch Now
            </Text>
          </Pressable>
        </Animated.View>

        {/* --- Overview --- */}
        <Animated.View
          entering={FadeIn.delay(300)}
          style={styles.sectionContainer}
        >
          <Text style={[styles.sectionHeader, { color: theme.textPrimary }]}>
            Overview
          </Text>
          <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
            {movie.info?.description ||
              movie.tmdb?.overview ||
              "No synopsis available."}
          </Text>
        </Animated.View>

        {/* --- Director Info (If available) --- */}
        {director && (
          <Animated.View
            entering={FadeIn.delay(350)}
            style={[
              styles.infoBox,
              {
                backgroundColor: theme.surfaceSecondary,
                borderColor: theme.border,
              },
            ]}
          >
            <View
              style={[
                styles.infoIcon,
                { backgroundColor: `${theme.primary}20` },
              ]}
            >
              <Zap size={18} color={theme.primary} />
            </View>
            <View>
              <Text style={[styles.infoLabel, { color: theme.textMuted }]}>
                Director
              </Text>
              <Text style={[styles.infoValue, { color: theme.textPrimary }]}>
                {director}
              </Text>
            </View>
          </Animated.View>
        )}

        {/* --- Cast List --- */}
        {Array.isArray(cast) && cast.length > 0 && (
          <Animated.View
            entering={FadeIn.delay(400)}
            style={styles.sectionContainer}
          >
            <Text
              style={[
                styles.sectionHeader,
                { color: theme.textPrimary, marginBottom: 16 },
              ]}
            >
              Top Cast
            </Text>

            <FlashList
              horizontal
              data={cast}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item: member }) => {
                const hasImage =
                  typeof member === "object" && member.profilePath;
                const name = typeof member === "string" ? member : member.name;

                return (
                  <View style={styles.castCard}>
                    <View
                      style={[
                        styles.castImgFrame,
                        {
                          backgroundColor: theme.surfaceSecondary,
                          borderColor: theme.border,
                        },
                      ]}
                    >
                      {hasImage ?
                        <Image
                          source={{ uri: member.profilePath }}
                          style={styles.castImg}
                          contentFit='cover'
                        />
                      : <User size={24} color={theme.textMuted} />}
                    </View>
                    <Text
                      style={[styles.castName, { color: theme.textSecondary }]}
                      numberOfLines={2}
                    >
                      {name}
                    </Text>
                  </View>
                );
              }}
            />
          </Animated.View>
        )}

        {/* --- Tech Specs / Quality --- */}
        <View style={styles.sectionContainer}>
          <View
            style={[
              styles.qualityBox,
              {
                backgroundColor: `${theme.primary}10`,
                borderColor: `${theme.primary}30`,
              },
            ]}
          >
            <View style={styles.qualityLeft}>
              <Text style={[styles.qualityLabel, { color: theme.primary }]}>
                STREAM DETAILS
              </Text>
              <Text
                style={[styles.qualityValue, { color: theme.textSecondary }]}
              >
                {movie.movie_data?.container_extension?.toUpperCase() || "MP4"}{" "}
                • 1080p
              </Text>
            </View>
            <View style={[styles.hdBadge, { borderColor: theme.primary }]}>
              <Text
                style={{
                  color: theme.primary,
                  fontSize: 10,
                  fontWeight: "900",
                }}
              >
                HD
              </Text>
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingBackdrop: { padding: 20, borderWidth: 1, borderRadius: 100 },
  errorText: { marginTop: 12, fontSize: 16 },

  // --- Header ---
  stickyHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  stickyTitle: {
    fontSize: 16,
    fontWeight: "700",
    width: "60%",
    textAlign: "center",
  },
  floatingHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 101,
    paddingHorizontal: 20,
    paddingTop: 10,
    pointerEvents: "box-none", // Let touches pass through except on button
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    backdropFilter: "blur(10px)",
  },

  contentContainer: { paddingBottom: 50 },

  // --- Backdrop ---
  backdropContainer: {
    height: height * 0.55,
    width: "100%",
  },
  backdrop: {
    width: "100%",
    height: "100%",
  },
  backdropGradient: {
    ...StyleSheet.absoluteFillObject,
  },

  // --- Hero Section ---
  heroWrapper: {
    paddingHorizontal: 20,
    marginTop: -160, // The negative margin for overlap
  },
  heroContent: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 16,
  },
  posterContainer: {
    width: POSTER_WIDTH,
    height: POSTER_HEIGHT,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  poster: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
    borderWidth: 1,
  },
  posterShadow: {
    position: "absolute",
    top: 10,
    left: 0,
    right: 0,
    bottom: -10,
    borderRadius: 12,
    opacity: 0.6,
  },
  ratingBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: "hidden",
  },
  ratingBlur: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.9,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "800",
  },

  // --- Info Column ---
  infoColumn: {
    flex: 1,
    paddingBottom: 4,
    gap: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    lineHeight: 28,
    letterSpacing: -0.5,
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  metaTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  metaText: { fontSize: 11, fontWeight: "700" },
  genreText: { fontSize: 13, fontWeight: "600" },

  miniActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },
  circleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },

  // --- Actions ---
  actionSection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  playButton: {
    width: "100%",
    height: 56,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    overflow: "hidden",
  },
  playGradient: { ...StyleSheet.absoluteFillObject },
  playText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // --- Content Sections ---
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.3,
    marginBottom: 8,
  },
  bodyText: {
    fontSize: 15,
    lineHeight: 24,
    opacity: 0.8,
  },

  // Director Box
  infoBox: {
    marginHorizontal: 20,
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  infoValue: { fontSize: 15, fontWeight: "600" },

  // Cast
  castCard: { width: 90, marginRight: 12 },
  castImgFrame: {
    width: 90,
    height: 135,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    marginBottom: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  castImg: { width: "100%", height: "100%" },
  castName: { fontSize: 12, fontWeight: "600" },

  // Quality
  qualityBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  qualityLeft: { gap: 4 },
  qualityLabel: { fontSize: 10, fontWeight: "800", letterSpacing: 1 },
  qualityValue: { fontSize: 13, fontWeight: "600" },
  hdBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1.5,
  },
});
