import { trpc } from "@/lib/trpc";
import { usePlaylistStore } from "@/store";
import { useWatchedSeriesStore } from "@/store/watched-store";
import { usePlayerTheme } from "@/theme/playerTheme";
import { cleanName } from "@repo/utils";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, ChevronRight, Play, RotateCcw, Tv } from "lucide-react-native";
import { Image } from "expo-image";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  ScrollView,
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
import { useStreamingUrls } from "../movies/[id]";

"use no memo";

const { width, height } = Dimensions.get("window");
const POSTER_WIDTH = width * 0.32;
const POSTER_HEIGHT = POSTER_WIDTH * 1.5;

export default function SeriesDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const theme = usePlayerTheme();
  const insets = useSafeAreaInsets();
  const selectPlaylist = usePlaylistStore((state) => state.selectedPlaylist);
  const scrollY = useSharedValue(0);

  const watchedItem = useWatchedSeriesStore((s) => s.series.find((i) => i.id === Number(id)));
  const lastEp = watchedItem?.episodes[watchedItem.episodes.length - 1];
  const watchedEpisodes = watchedItem?.episodes ?? [];

  const [selectedSeason, setSelectedSeason] = useState<number | null>(null);

  const { data: seriesInfo, isLoading } = trpc.series.getSerie.useQuery({
    serieId: Number(id),
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

  if (!seriesInfo)
    return (
      <View style={[styles.centered, { backgroundColor: theme.bg }]}>
        <Tv size={48} color={theme.textMuted} strokeWidth={1.5} />
        <Text style={[styles.errorText, { color: theme.textMuted }]}>Series not found</Text>
      </View>
    );

  const seasons = Object.keys(seriesInfo.episodes || {}).map(Number).sort((a, b) => a - b);
  // Default to last watched season, else first season
  const activeSeason = selectedSeason ?? (lastEp ? lastEp.seasonId : seasons[0]);
  const currentEpisodes = seriesInfo.episodes[activeSeason] || [];
  const totalEpisodes = Object.values(seriesInfo.episodes || {}).flat().length;
  const playlist = selectPlaylist;

  // Find the last watched episode object in current season
  const lastWatchedEpisode = lastEp
    ? currentEpisodes.find((ep: any) => ep.episode_num === lastEp.episodeNumber && activeSeason === lastEp.seasonId)
    : null;

  const handleResumeEpisode = () => {
    if (!lastEp || !playlist) return;
    // Find the episode in the correct season
    const seasonEps = seriesInfo.episodes[lastEp.seasonId] || [];
    const ep = seasonEps.find((e: any) => e.episode_num === lastEp.episodeNumber);
    if (!ep) return;
    const url = `${playlist.baseUrl}/series/${playlist.username}/${playlist.password}/${ep.id}.${ep.container_extension}`;
    router.push({
      pathname: "/player",
      params: {
        url,
        title: cleanName(ep.title) || `S${lastEp.seasonId} E${lastEp.episodeNumber}`,
        mediaType: "vod",
        seriesId: String(id),
        playlistId: String(playlist.id),
        poster: seriesInfo.info.cover ?? "",
        seriesTitle: cleanName(seriesInfo.info.name) || "",
        totalEpisodes: String(totalEpisodes),
        episodeNumber: String(lastEp.episodeNumber),
        seasonId: String(lastEp.seasonId),
        resumePosition: String(Math.max(0, lastEp.position - 5)),
      },
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Sticky header */}
      <Animated.View style={[styles.stickyHeader, stickyStyle, { paddingTop: insets.top, borderBottomColor: theme.border }]}>
        <Text style={[styles.stickyTitle, { color: theme.textPrimary }]} numberOfLines={1}>{seriesInfo.info.name}</Text>
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
          <Image source={{ uri: seriesInfo.info.backdrop_path?.[0] || seriesInfo.info.cover }} style={styles.backdrop} contentFit="cover" />
          <View style={[styles.backdropScrim, { backgroundColor: theme.bg }]} />
        </View>

        {/* Hero */}
        <View style={styles.heroWrapper}>
          <Animated.View entering={FadeInDown.duration(500)} style={styles.heroRow}>
            <View style={styles.posterShadowWrap}>
              <Image source={{ uri: seriesInfo.info.cover }} style={[styles.poster, { borderColor: theme.border }]} contentFit="cover" transition={300} />
            </View>
            <View style={styles.infoCol}>
              <Text style={[styles.title, { color: theme.textPrimary }]}>{seriesInfo.info.name}</Text>
              <View style={styles.chips}>
                {seriesInfo.info.releaseDate && (
                  <View style={[styles.chip, { backgroundColor: theme.surfaceSecondary }]}>
                    <Text style={[styles.chipText, { color: theme.textSecondary }]}>{seriesInfo.info.releaseDate.split("-")[0]}</Text>
                  </View>
                )}
                <View style={[styles.chip, { backgroundColor: theme.surfaceSecondary }]}>
                  <Text style={[styles.chipText, { color: theme.textSecondary }]}>{seasons.length} Season{seasons.length !== 1 ? "s" : ""}</Text>
                </View>
              </View>
              {seriesInfo.info.genre && (
                <Text style={[styles.genres, { color: theme.primary }]} numberOfLines={2}>{seriesInfo.info.genre}</Text>
              )}
            </View>
          </Animated.View>
        </View>

        {/* Resume / Play button */}
        <Animated.View entering={FadeIn.delay(150)} style={styles.actions}>
          {lastEp ? (
            <View style={styles.resumeGroup}>
              <Pressable
                style={({ pressed }) => [styles.primaryBtn, { backgroundColor: theme.primary }, pressed && { opacity: 0.85 }]}
                onPress={handleResumeEpisode}
              >
                <RotateCcw size={20} color={theme.primaryForeground} />
                <Text style={[styles.primaryBtnText, { color: theme.primaryForeground }]}>
                  Resume S{lastEp.seasonId} E{lastEp.episodeNumber}
                </Text>
              </Pressable>
              {lastEp.duration > 0 && (
                <>
                  <View style={[styles.resumeBarBg, { backgroundColor: theme.surfaceSecondary }]}>
                    <View style={[styles.resumeBarFill, { width: `${Math.round((lastEp.position / lastEp.duration) * 100)}%`, backgroundColor: theme.primary }]} />
                  </View>
                  <Text style={[styles.resumeLabel, { color: theme.textMuted }]}>
                    {Math.round((lastEp.position / lastEp.duration) * 100)}% of episode watched
                  </Text>
                </>
              )}
            </View>
          ) : (
            seasons[0] && currentEpisodes[0] && (
              <Pressable
                style={({ pressed }) => [styles.primaryBtn, { backgroundColor: theme.primary }, pressed && { opacity: 0.85 }]}
                onPress={() => {
                  const ep = currentEpisodes[0];
                  const epUrl = `${playlist?.baseUrl}/series/${playlist?.username}/${playlist?.password}/${ep.id}.${ep.container_extension}`;
                  router.push({
                    pathname: "/player",
                    params: {
                      url: epUrl,
                      title: cleanName(ep.title) || `S${activeSeason} E${ep.episode_num}`,
                      mediaType: "vod",
                      seriesId: String(id),
                      playlistId: String(playlist?.id ?? ""),
                      poster: seriesInfo.info.cover ?? "",
                      seriesTitle: cleanName(seriesInfo.info.name) || "",
                      totalEpisodes: String(totalEpisodes),
                      episodeNumber: String(ep.episode_num),
                      seasonId: String(activeSeason),
                    },
                  });
                }}
              >
                <Play size={20} color={theme.primaryForeground} fill={theme.primaryForeground} />
                <Text style={[styles.primaryBtnText, { color: theme.primaryForeground }]}>Play S1 E1</Text>
              </Pressable>
            )
          )}
        </Animated.View>

        {/* Plot */}
        {seriesInfo.info.plot && (
          <Animated.View entering={FadeIn.delay(200)} style={styles.section}>
            <Text style={[styles.body, { color: theme.textSecondary }]}>{seriesInfo.info.plot}</Text>
          </Animated.View>
        )}

        {/* Season tabs */}
        <View style={styles.seasonSection}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary, paddingHorizontal: 16 }]}>Episodes</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.seasonScroll}>
            {seasons.map((s) => (
              <Pressable
                key={s}
                onPress={() => setSelectedSeason(s)}
                style={[
                  styles.seasonTab,
                  {
                    backgroundColor: activeSeason === s ? theme.primary : theme.surfaceSecondary,
                    borderColor: activeSeason === s ? theme.primary : theme.border,
                  },
                ]}
              >
                <Text style={[styles.seasonTabText, { color: activeSeason === s ? theme.primaryForeground : theme.textSecondary }]}>
                  Season {s}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Episode list */}
        <View style={styles.episodeList}>
          {currentEpisodes.length > 0 ? (
            currentEpisodes.map((ep: any) => (
              <EpisodeItem
                key={ep.id}
                episode={ep}
                seasonNumber={activeSeason}
                seriesCover={seriesInfo.info.cover}
                seriesId={Number(id)}
                seriesTitle={cleanName(seriesInfo.info.name) || ""}
                totalEpisodes={totalEpisodes}
                theme={theme}
                playlist={playlist}
                episodeProgress={watchedEpisodes.find((e) => e.episodeNumber === ep.episode_num && e.seasonId === activeSeason)}
                isLastWatched={lastEp?.episodeNumber === ep.episode_num && lastEp?.seasonId === activeSeason}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Tv size={32} color={theme.textMuted} />
              <Text style={[styles.emptyText, { color: theme.textMuted }]}>No episodes found</Text>
            </View>
          )}
        </View>

        <View style={{ height: 40 }} />
      </Animated.ScrollView>
    </View>
  );
}

function EpisodeItem({ episode, seasonNumber, seriesCover, seriesId, seriesTitle, totalEpisodes, theme, playlist, episodeProgress, isLastWatched }: any) {
  const router = useRouter();
  const progress = episodeProgress && episodeProgress.duration > 0 ? episodeProgress.position / episodeProgress.duration : 0;

  const epUrl = `${playlist?.baseUrl}/series/${playlist?.username}/${playlist?.password}/${episode.id}.${episode.container_extension}`;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.episodeRow,
        { borderBottomColor: theme.border },
        isLastWatched && { backgroundColor: `${theme.primary}10` },
        pressed && { backgroundColor: theme.surfaceSecondary },
      ]}
      onPress={() => {
        router.push({
          pathname: "/player",
          params: {
            url: epUrl,
            title: cleanName(episode.title) || `S${seasonNumber} E${episode.episode_num}`,
            mediaType: "vod",
            seriesId: String(seriesId),
            playlistId: String(playlist?.id ?? ""),
            poster: seriesCover ?? "",
            seriesTitle: seriesTitle ?? "",
            totalEpisodes: String(totalEpisodes ?? 0),
            episodeNumber: String(episode.episode_num),
            seasonId: String(seasonNumber),
            resumePosition: episodeProgress ? String(Math.max(0, episodeProgress.position - 5)) : "0",
          },
        });
      }}
    >
      {/* Thumbnail */}
      <View style={styles.epThumb}>
        <Image source={{ uri: episode.info?.movie_image || seriesCover }} style={StyleSheet.absoluteFillObject} contentFit="cover" transition={200} />
        <View style={styles.playOverlay}>
          {isLastWatched ? (
            <RotateCcw size={14} color="#fff" />
          ) : (
            <Play size={14} color="#fff" fill="#fff" />
          )}
        </View>
        {episode.info?.duration && (
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>{episode.info.duration}</Text>
          </View>
        )}
        {/* Progress bar on thumbnail */}
        {progress > 0 && (
          <View style={styles.epProgressBg}>
            <View style={[styles.epProgressFill, { width: `${progress * 100}%`, backgroundColor: theme.primary }]} />
          </View>
        )}
      </View>

      {/* Info */}
      <View style={styles.epInfo}>
        <View style={styles.epNumRow}>
          <Text style={[styles.epNum, { color: theme.primary }]}>E{episode.episode_num}</Text>
          {isLastWatched && (
            <View style={[styles.lastWatchedBadge, { backgroundColor: `${theme.primary}20`, borderColor: `${theme.primary}40` }]}>
              <Text style={[styles.lastWatchedText, { color: theme.primary }]}>Last watched</Text>
            </View>
          )}
        </View>
        <Text style={[styles.epTitle, { color: theme.textPrimary }]} numberOfLines={2}>
          {cleanName(episode.title) || `Episode ${episode.episode_num}`}
        </Text>
        {progress > 0 && (
          <Text style={[styles.epProgress, { color: theme.textMuted }]}>{Math.round(progress * 100)}% watched</Text>
        )}
      </View>

      <ChevronRight size={18} color={theme.textMuted} />
    </Pressable>
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

  backdropContainer: { height: height * 0.45, width: "100%" },
  backdrop: { width: "100%", height: "100%" },
  backdropScrim: { ...StyleSheet.absoluteFillObject, opacity: 0.55 },

  heroWrapper: { paddingHorizontal: 16, marginTop: -POSTER_HEIGHT * 0.55 },
  heroRow: { flexDirection: "row", alignItems: "flex-end", gap: 14 },

  posterShadowWrap: {
    width: POSTER_WIDTH, height: POSTER_HEIGHT,
    shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.55, shadowRadius: 14, elevation: 10,
  },
  poster: { width: "100%", height: "100%", borderRadius: 10, borderWidth: 1 },

  infoCol: { flex: 1, paddingBottom: 6, gap: 8 },
  title: { fontSize: 20, fontWeight: "800", lineHeight: 24, letterSpacing: -0.3 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  chipText: { fontSize: 11, fontWeight: "600" },
  genres: { fontSize: 12, fontWeight: "600", lineHeight: 18 },

  actions: { paddingHorizontal: 16, marginTop: 20, gap: 10 },
  primaryBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", height: 52, borderRadius: 12, gap: 8 },
  primaryBtnText: { fontSize: 16, fontWeight: "700" },

  resumeGroup: { gap: 8 },
  resumeBarBg: { height: 4, borderRadius: 2, overflow: "hidden" },
  resumeBarFill: { height: "100%", borderRadius: 2 },
  resumeLabel: { fontSize: 12, fontWeight: "600", textAlign: "center" },

  section: { marginTop: 20, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 17, fontWeight: "700", marginBottom: 12 },
  body: { fontSize: 14, lineHeight: 22, opacity: 0.85 },

  seasonSection: { marginTop: 24 },
  seasonScroll: { paddingHorizontal: 16, gap: 8 },
  seasonTab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  seasonTabText: { fontSize: 13, fontWeight: "700" },

  episodeList: { marginTop: 8, paddingHorizontal: 16 },
  episodeRow: {
    flexDirection: "row", alignItems: "center",
    paddingVertical: 12, borderBottomWidth: 1, gap: 12,
  },
  epThumb: {
    width: 110, height: 62, borderRadius: 8, overflow: "hidden",
    backgroundColor: "#111", position: "relative",
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center", alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  durationBadge: {
    position: "absolute", bottom: 4, right: 4,
    backgroundColor: "rgba(0,0,0,0.7)", paddingHorizontal: 4, borderRadius: 4,
  },
  durationText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  epProgressBg: { position: "absolute", bottom: 0, left: 0, right: 0, height: 3, backgroundColor: "rgba(255,255,255,0.15)" },
  epProgressFill: { height: "100%", borderRadius: 1 },

  epInfo: { flex: 1, gap: 3 },
  epNumRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  epNum: { fontSize: 11, fontWeight: "800", letterSpacing: 0.5, textTransform: "uppercase" },
  lastWatchedBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1 },
  lastWatchedText: { fontSize: 9, fontWeight: "800", letterSpacing: 0.5 },
  epTitle: { fontSize: 13, fontWeight: "600", lineHeight: 18 },
  epProgress: { fontSize: 11, fontWeight: "600" },

  emptyState: { padding: 40, alignItems: "center", gap: 10 },
  emptyText: { fontSize: 14 },
});
