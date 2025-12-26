import { trpc } from "@/lib/trpc";
import { usePlaylistStore } from "@/store/appStore";
import { usePlayerTheme } from "@/theme/playerTheme";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Share2,
  Tv,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  ScrollView,
  Share,
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
import { useStreamingUrls } from "../movies/[id]";

const { width, height } = Dimensions.get("window");
const POSTER_WIDTH = width * 0.35; // Slightly smaller than movie poster for series list balance
const POSTER_HEIGHT = POSTER_WIDTH * 1.5;

export default function SeriesDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const theme = usePlayerTheme();
  const insets = useSafeAreaInsets();
  const selectPlaylist = usePlaylistStore((state) => state.selectedPlaylist);

  const [selectedSeason, setSelectedSeason] = useState(1);
  const scrollY = useSharedValue(0);

  const { data: seriesInfo, isLoading } = trpc.series.getSerie.useQuery({
    serieId: Number(id),
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

  if (isLoading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.bg }]}>
        <View style={[styles.loadingBackdrop, { borderColor: theme.border }]}>
          <ActivityIndicator size='large' color={theme.primary} />
        </View>
      </View>
    );
  }

  if (!seriesInfo) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.bg }]}>
        <Tv size={48} color={theme.textMuted} strokeWidth={1.5} />
        <Text style={[styles.errorText, { color: theme.textMuted }]}>
          Series not found
        </Text>
      </View>
    );
  }

  const seasons = Object.keys(seriesInfo.episodes || {})
    .map(Number)
    .sort((a, b) => a - b);
  // Ensure we select the first available season if 1 doesn't exist
  const activeSeason =
    seasons.includes(selectedSeason) ? selectedSeason : seasons[0];
  const currentEpisodes = seriesInfo.episodes[activeSeason] || [];

  const onShare = async () => {
    try {
      await Share.share({
        message: `Check out ${seriesInfo.info.name} on our IPTV app!`,
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* --- Sticky Header --- */}
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
          {seriesInfo.info.name}
        </Text>
      </Animated.View>

      {/* --- Floating Back Button --- */}
      <SafeAreaView style={styles.floatingHeader} edges={["top"]}>
        <Pressable
          style={[styles.backBtn, { borderColor: "rgba(255,255,255,0.1)" }]}
          onPress={() => router.back()}
        >
          <ChevronLeft color='#fff' size={26} strokeWidth={2.5} />
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
            source={{
              uri: seriesInfo.info.backdrop_path?.[0] || seriesInfo.info.cover,
            }}
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
            {/* Poster */}
            <View style={styles.posterContainer}>
              <View
                style={[styles.posterShadow, { shadowColor: theme.primary }]}
              />
              <Image
                source={{ uri: seriesInfo.info.cover }}
                style={[styles.poster, { borderColor: theme.border }]}
                contentFit='cover'
                transition={300}
              />
            </View>

            {/* Title & Info */}
            <View style={styles.infoColumn}>
              <Text style={[styles.title, { color: theme.textPrimary }]}>
                {seriesInfo.info.name}
              </Text>

              <View style={styles.metaRow}>
                {seriesInfo.info.releaseDate && (
                  <Text
                    style={[styles.metaText, { color: theme.textSecondary }]}
                  >
                    {seriesInfo.info.releaseDate.split("-")[0]}
                  </Text>
                )}
                {seriesInfo.info.rating_5based && (
                  <View style={styles.ratingBox}>
                    <Text style={[styles.ratingText, { color: theme.primary }]}>
                      {seriesInfo.info.rating_5based}
                    </Text>
                    <Text style={{ fontSize: 10, color: theme.textMuted }}>
                      / 5
                    </Text>
                  </View>
                )}
              </View>

              {seriesInfo.info.genre && (
                <Text
                  style={[styles.genreText, { color: theme.primary }]}
                  numberOfLines={1}
                >
                  {seriesInfo.info.genre}
                </Text>
              )}

              {/* Share Button */}
              <View style={styles.miniActions}>
                <Pressable
                  onPress={onShare}
                  style={[
                    styles.circleBtn,
                    { backgroundColor: theme.surfaceSecondary },
                  ]}
                >
                  <Share2 size={18} color={theme.textMuted} />
                </Pressable>
              </View>
            </View>
          </Animated.View>
        </View>

        {/* --- Plot --- */}
        <Animated.View
          entering={FadeIn.delay(300)}
          style={styles.sectionContainer}
        >
          <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
            {seriesInfo.info.plot || "No description available."}
          </Text>
        </Animated.View>

        {/* --- Season Selector --- */}
        <View style={styles.seasonSection}>
          <Text
            style={[
              styles.sectionHeader,
              { color: theme.textPrimary, paddingHorizontal: 20 },
            ]}
          >
            Seasons
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.seasonScroll}
          >
            {seasons.map((s) => (
              <Pressable
                key={s}
                onPress={() => setSelectedSeason(s)}
                style={[
                  styles.seasonTab,
                  {
                    backgroundColor:
                      selectedSeason === s ?
                        theme.primary
                      : theme.surfaceSecondary,
                    borderColor:
                      selectedSeason === s ? theme.primary : theme.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.seasonTabText,
                    {
                      color:
                        selectedSeason === s ? "#000" : theme.textSecondary,
                    },
                  ]}
                >
                  Season {s}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* --- Episode List --- */}
        <View style={styles.episodeListContainer}>
          {currentEpisodes.length > 0 ?
            currentEpisodes.map((ep: any, index: number) => (
              <Animated.View
                key={ep.id}
                entering={FadeInUp.delay(index * 50).springify()}
              >
                <EpisodeItem
                  episode={ep}
                  seasonNumber={activeSeason}
                  seriesCover={seriesInfo.info.cover}
                  theme={theme}
                />
              </Animated.View>
            ))
          : <View style={styles.emptyState}>
              <Tv size={32} color={theme.textMuted} />
              <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                No episodes found
              </Text>
            </View>
          }
        </View>

        <View style={{ height: 40 }} />
      </Animated.ScrollView>
    </View>
  );
}

// --- Sub-Component: Episode Item ---
function EpisodeItem({ episode, seasonNumber, seriesCover, theme }: any) {
  const router = useRouter();
  const selectPlaylist = usePlaylistStore((state) => state.selectedPlaylist);

  const { getEpisodeSrcUrl } = useStreamingUrls(
    selectPlaylist?.baseUrl ?? "",
    selectPlaylist?.username ?? "",
    selectPlaylist?.password ?? "",
    episode.stream_id,
    episode.container_extension
  );

  return (
    <Pressable
      style={({ pressed }) => [
        styles.episodeRow,
        { borderBottomColor: theme.border },
        pressed && { backgroundColor: theme.surfaceSecondary },
      ]}
      onPress={() => {
        router.push({
          pathname: "/player",
          params: {
            url: getEpisodeSrcUrl(episode),
            mediaType: "vod",
            title: episode.title || `S${seasonNumber} E${episode.episode_num}`,
          },
        });
      }}
    >
      {/* Thumbnail */}
      <View style={styles.epThumbContainer}>
        <Image
          source={{ uri: episode.info?.movie_image || seriesCover }}
          style={styles.epThumb}
          contentFit='cover'
          transition={200}
        />
        <View style={styles.playOverlay}>
          <Play size={16} color='#fff' fill='#fff' />
        </View>
        {/* Duration Badge */}
        {episode.info?.duration && (
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>{episode.info.duration}</Text>
          </View>
        )}
      </View>

      {/* Info */}
      <View style={styles.epInfo}>
        <Text style={[styles.epNum, { color: theme.primary }]}>
          Episode {episode.episode_num}
        </Text>
        <Text
          style={[styles.epTitle, { color: theme.textPrimary }]}
          numberOfLines={2}
        >
          {episode.title || `Episode ${episode.episode_num}`}
        </Text>
      </View>

      <ChevronRight size={20} color={theme.textMuted} />
    </Pressable>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingBackdrop: { padding: 20, borderRadius: 16, borderWidth: 1 },
  errorText: { marginTop: 12, fontSize: 16 },

  // Header
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
    pointerEvents: "box-none",
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },

  contentContainer: { paddingBottom: 50 },

  // Backdrop
  backdropContainer: { height: height * 0.45, width: "100%" },
  backdrop: { width: "100%", height: "100%" },
  backdropGradient: { ...StyleSheet.absoluteFillObject },

  // Hero
  heroWrapper: { paddingHorizontal: 20, marginTop: -140 },
  heroContent: { flexDirection: "row", alignItems: "flex-end", gap: 16 },
  posterContainer: {
    width: POSTER_WIDTH,
    height: POSTER_HEIGHT,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  poster: { width: "100%", height: "100%", borderRadius: 12, borderWidth: 1 },
  posterShadow: {
    position: "absolute",
    top: 10,
    left: 0,
    right: 0,
    bottom: -10,
    borderRadius: 12,
    opacity: 0.6,
  },

  // Info Column
  infoColumn: { flex: 1, paddingBottom: 4, gap: 8 },
  title: {
    fontSize: 22,
    fontWeight: "800",
    lineHeight: 26,
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  metaText: { fontSize: 13, fontWeight: "700" },
  ratingBox: { flexDirection: "row", alignItems: "baseline", gap: 2 },
  ratingText: { fontSize: 14, fontWeight: "800" },
  genreText: { fontSize: 13, fontWeight: "600" },

  miniActions: { flexDirection: "row", gap: 12, marginTop: 4 },
  circleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },

  // Content Sections
  sectionContainer: { marginTop: 24, paddingHorizontal: 20 },
  sectionHeader: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  bodyText: { fontSize: 14, lineHeight: 22, opacity: 0.8 },

  // Seasons
  seasonSection: { marginTop: 24 },
  seasonScroll: { paddingHorizontal: 20, gap: 8 },
  seasonTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  seasonTabText: { fontSize: 13, fontWeight: "700" },

  // Episodes
  episodeListContainer: { marginTop: 24, paddingHorizontal: 16 },
  episodeRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 14,
  },
  epThumbContainer: {
    width: 110,
    height: 62,
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#000",
  },
  epThumb: { width: "100%", height: "100%", opacity: 0.8 },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  durationBadge: {
    position: "absolute",
    bottom: 4,
    right: 4,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  durationText: { color: "white", fontSize: 10, fontWeight: "700" },

  epInfo: { flex: 1, gap: 4 },
  epNum: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  epTitle: { fontSize: 14, fontWeight: "600", lineHeight: 18 },

  emptyState: { padding: 40, alignItems: "center", gap: 10 },
  emptyText: { fontSize: 14 },
});
