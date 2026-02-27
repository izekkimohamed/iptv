import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { Database, Play, Star, Tv } from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import useSWR from "swr";

import MatchDetailsModal from "@/components/365/Details";
import { formatDateForAPI, Game } from "@/components/365/LiveScores";
import MatchCard from "@/components/365/MatchCard";
import Header from "@/components/Header";

import { SkeletonCard } from "@/components/ui/Skeleton";
import { trpc } from "@/lib/trpc";
import { usePlaylistStore } from "@/store";
import { usePlayerTheme } from "@/theme/playerTheme";
import {
  useWatchedMoviesStore,
  useWatchedSeriesStore,
} from "@/store/watched-store";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const LiveIndicator = ({ color }: { color: string }) => {
  return <View style={[styles.liveDot, { backgroundColor: color }]} />;
};

export default function HomeScreen() {
  const router = useRouter();
  const theme = usePlayerTheme();
  const { width } = useWindowDimensions();
  const currentDate = new Date();
  const [selectedGameId, setSelectedGameId] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const {
    selectedPlaylist,
    selectPlaylist,
    playlists: storePlaylists,
    removePlaylist,
    addPlaylist,
    updatePlaylist,
  } = usePlaylistStore();

  const { data: homeData, isLoading } = trpc.home.getHome.useQuery(undefined, {
    enabled: !!selectedPlaylist,
  });
  const { data: playlists, refetch: refreshPlaylists } =
    trpc.playlists.getPlaylists.useQuery();
  const { data: favoriteChannels } = trpc.channels.getChannels.useQuery(
    {
      favorites: true,
      playlistId: selectedPlaylist?.id || 0,
    },
    { enabled: !!selectedPlaylist },
  );

  const apiUrl = `${process.env.EXPO_PUBLIC_API_URL}/live-matches?date=${formatDateForAPI(currentDate)}`;
  const { data: games = [], mutate: mutateGames } = useSWR<Game[]>(
    apiUrl,
    fetcher,
    {
      refreshInterval: (data) =>
        data?.some((g) => g.statusGroup === 3) ? 20000 : 60000,
      keepPreviousData: true,
    },
  );

  const liveMatches = useMemo(
    () => games.filter((g) => g.statusGroup === 3),
    [games],
  );

  const { movies: watchedMovies } = useWatchedMoviesStore();
  const { series: watchedSeries } = useWatchedSeriesStore();

  const continueWatching = useMemo(() => {
    return watchedMovies
      .filter((m) => m.duration > 0 && m.position / m.duration < 0.95)
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 10);
  }, [watchedMovies]);

  const continueWatchingSeries = useMemo(() => {
    return watchedSeries
      .filter((s) => s.episodes.length > 0)
      .sort((a, b) => {
        const aLastEp = a.episodes[a.episodes.length - 1];
        const bLastEp = b.episodes[b.episodes.length - 1];
        return (bLastEp?.position || 0) - (aLastEp?.position || 0);
      })
      .slice(0, 10);
  }, [watchedSeries]);

  const recentlyPlayed = useMemo(() => {
    return [...watchedMovies]
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 10);
  }, [watchedMovies]);

  useEffect(() => {
    if (!playlists) return;

    storePlaylists.forEach((stored) => {
      const stillExists = playlists.find((p) => p.id === stored.id);
      if (!stillExists) {
        removePlaylist(stored.id);
      }
    });

    playlists.forEach((fetched) => {
      const existing = storePlaylists.find((p) => p.id === fetched.id);

      if (!existing) {
        addPlaylist(fetched);
      } else {
        if (JSON.stringify(existing) !== JSON.stringify(fetched)) {
          updatePlaylist(fetched.id, fetched);
        }
      }
    });

    if (!selectedPlaylist && playlists.length > 0) {
      selectPlaylist(playlists[0]);
    }
  }, [
    playlists,
    storePlaylists,
    addPlaylist,
    removePlaylist,
    updatePlaylist,
    selectPlaylist,
    selectedPlaylist,
  ]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshPlaylists(), mutateGames()]);
    setRefreshing(false);
  };

  const renderFeaturedItem = useCallback(
    ({ item }: { item: any }) => (
      <Pressable
        onPress={() =>
          router.push({
            pathname: "/movies/tmdb",
            params: { movieId: item.id, playlistId: 26 },
          })
        }
        style={({ pressed }) => [
          { width, height: 420 },
          pressed && { opacity: 0.9 },
        ]}
      >
        <Image
          source={{ uri: item.backdropUrl || item.posterUrl || undefined }}
          style={styles.heroImage}
        />
        <View style={styles.heroOverlay} />

        <View style={styles.heroContent}>
          <View style={[styles.heroBadge, { backgroundColor: theme.primary }]}>
            <Star
              size={12}
              color={theme.primaryForeground}
              fill={theme.primaryForeground}
            />
            <Text
              style={[styles.heroBadgeText, { color: theme.primaryForeground }]}
            >
              {item.voteAverage?.toFixed(1) || "NEW"}
            </Text>
          </View>

          <Text style={styles.heroTitle} numberOfLines={2}>
            {item.title || item.name}
          </Text>

          <Text style={styles.heroSubtitle} numberOfLines={2}>
            {item.overview || "Watch now"}
          </Text>

          <View style={styles.heroActions}>
            <Pressable
              style={[
                styles.heroPlayButton,
                { backgroundColor: theme.primary },
              ]}
              onPress={() =>
                router.push({
                  pathname: "/movies/tmdb",
                  params: { movieId: item.id, playlistId: 26 },
                })
              }
            >
              <Play
                size={20}
                color={theme.primaryForeground}
                fill={theme.primaryForeground}
              />
              <Text
                style={[
                  styles.heroPlayText,
                  { color: theme.primaryForeground },
                ]}
              >
                Play
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.heroInfoButton,
                {
                  backgroundColor: theme.glassLight,
                  borderColor: theme.border,
                },
              ]}
              onPress={() =>
                router.push({
                  pathname: "/movies/tmdb",
                  params: { movieId: item.id, playlistId: 26 },
                })
              }
            >
              <Star size={20} color={theme.textPrimary} />
            </Pressable>
          </View>
        </View>

        <View style={styles.heroGradient} />
      </Pressable>
    ),
    [router, theme],
  );

  const renderChannel = useCallback(
    ({ item, index }: { item: any; index: number }) => (
      <Animated.View
        entering={FadeInDown.delay((index % 6) * 50).springify()}
        style={styles.channelCardWrapper}
      >
        <Pressable
          onPress={() =>
            router.push({
              pathname: "/player",
              params: { url: item.url, title: item.name, mediaType: "live" },
            })
          }
          style={({ pressed }) => [
            styles.channelCard,
            {
              backgroundColor: theme.surfaceSecondary,
              borderColor: pressed ? theme.primary : theme.border,
            },
            pressed && { transform: [{ scale: 0.96 }] },
          ]}
        >
          {item.streamIcon ? (
            <Image
              source={{ uri: item.streamIcon }}
              style={styles.channelImage}
            />
          ) : (
            <View style={styles.channelPlaceholder}>
              <Tv size={28} color={theme.textMuted} />
            </View>
          )}
          <View style={styles.channelOverlay}>
            <View style={styles.liveBadge}>
              <LiveIndicator color={theme.accentError} />
              <Text style={styles.liveBadgeText}>LIVE</Text>
            </View>
          </View>
        </Pressable>
        <Text
          style={[styles.channelTitle, { color: theme.textPrimary }]}
          numberOfLines={1}
        >
          {item.name}
        </Text>
      </Animated.View>
    ),
    [router, theme],
  );

  const renderContinueWatchingItem = useCallback(
    ({ item }: { item: any }) => {
      const progress = item.duration > 0 ? item.position / item.duration : 0;
      return (
        <Pressable
          onPress={() =>
            router.push({
              pathname: "/movies/tmdb",
              params: { movieId: item.id, playlistId: item.playlistId },
            })
          }
          style={({ pressed }) => [
            styles.continueCard,
            pressed && { opacity: 0.9 },
          ]}
        >
          <Image
            source={{ uri: item.poster || item.backdropUrl || undefined }}
            style={styles.continueImage}
          />
          <View style={styles.continueOverlay}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${progress * 100}%`,
                    backgroundColor: theme.primary,
                  },
                ]}
              />
            </View>
          </View>
          <Text style={styles.continueTitle} numberOfLines={1}>
            {item.title}
          </Text>
        </Pressable>
      );
    },
    [router, theme],
  );

  const renderRecentlyPlayedItem = useCallback(
    ({ item }: { item: any }) => (
      <Pressable
        onPress={() =>
          router.push({
            pathname: "/movies/tmdb",
            params: { movieId: item.id, playlistId: item.playlistId },
          })
        }
        style={({ pressed }) => [
          styles.continueCard,
          pressed && { opacity: 0.9 },
        ]}
      >
        <Image
          source={{ uri: item.poster || item.backdropUrl || undefined }}
          style={styles.continueImage}
        />
        <Text style={styles.continueTitle} numberOfLines={1}>
          {item.title}
        </Text>
      </Pressable>
    ),
    [router],
  );

  const renderSeriesItem = useCallback(
    ({ item }: { item: any }) => (
      <Pressable
        onPress={() =>
          router.push({
            pathname: "/series",
            params: { id: item.id },
          })
        }
        style={({ pressed }) => [
          styles.seriesCard,
          pressed && { opacity: 0.9 },
        ]}
      >
        <Image
          source={{ uri: item.posterUrl || undefined }}
          style={styles.seriesImage}
        />
        <View style={[styles.seriesBadge, { backgroundColor: theme.primary }]}>
          <Star
            size={10}
            color={theme.primaryForeground}
            fill={theme.primaryForeground}
          />
          <Text
            style={[styles.seriesRating, { color: theme.primaryForeground }]}
          >
            {item.voteAverage?.toFixed(1)}
          </Text>
        </View>
        <Text style={styles.seriesTitle} numberOfLines={2}>
          {item.name}
        </Text>
      </Pressable>
    ),
    [router, theme],
  );

  if (!selectedPlaylist) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
        <Header />
        <View style={styles.emptyState}>
          <View
            style={[
              styles.emptyIconCircle,
              { backgroundColor: theme.surfaceSecondary },
            ]}
          >
            <Database size={48} color={theme.textMuted} />
          </View>
          <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
            No Playlist Found
          </Text>
          <Text style={[styles.emptySub, { color: theme.textMuted }]}>
            Add a playlist to start watching
          </Text>
          <Pressable
            style={[styles.actionButton, { backgroundColor: theme.primary }]}
            onPress={() => router.push("/playlists/manage")}
          >
            <Text
              style={[
                styles.actionButtonText,
                { color: theme.primaryForeground },
              ]}
            >
              Add Playlist
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.bg }]}
      edges={["bottom"]}
    >
      <Header />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
          />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {isLoading ? (
          <View style={styles.skeletonContainer}>
            <SkeletonCard width={width - 40} height={200} borderRadius={16} />
            <View style={styles.skeletonChannels}>
              {[1, 2, 3, 4].map((i) => (
                <SkeletonCard
                  key={i}
                  width={100}
                  height={100}
                  borderRadius={12}
                />
              ))}
            </View>
          </View>
        ) : (
          <>
            {/* Hero Carousel - Scrollable with paging */}
            <View style={[styles.featuredSection, { width }]}>
              <FlashList
                horizontal
                pagingEnabled
                data={homeData?.movies || []}
                renderItem={renderFeaturedItem}
                showsHorizontalScrollIndicator={false}
                snapToInterval={width}
                decelerationRate="fast"
              />
            </View>

            {/* Continue Watching */}
            {(continueWatching.length > 0 ||
              continueWatchingSeries.length > 0) && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View>
                    <Text
                      style={[styles.sectionKicker, { color: theme.primary }]}
                    >
                      PICK UP WHERE YOU LEFT OFF
                    </Text>
                    <Text
                      style={[
                        styles.sectionTitle,
                        { color: theme.textPrimary },
                      ]}
                    >
                      Continue Watching
                    </Text>
                  </View>
                </View>
                <FlatList
                  horizontal
                  data={[...continueWatching, ...continueWatchingSeries].slice(
                    0,
                    10,
                  )}
                  renderItem={renderContinueWatchingItem}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalList}
                />
              </View>
            )}

            {/* Trending Series */}
            {homeData?.series && homeData.series.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View>
                    <Text
                      style={[styles.sectionKicker, { color: theme.primary }]}
                    >
                      POPULAR
                    </Text>
                    <Text
                      style={[
                        styles.sectionTitle,
                        { color: theme.textPrimary },
                      ]}
                    >
                      Trending Series
                    </Text>
                  </View>
                  <Pressable onPress={() => router.push("/(tabs)/series")}>
                    <Text style={[styles.seeAll, { color: theme.primary }]}>
                      See All
                    </Text>
                  </Pressable>
                </View>
                <FlatList
                  horizontal
                  data={homeData.series.slice(0, 10)}
                  renderItem={renderSeriesItem}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalList}
                />
              </View>
            )}

            {/* Recently Played */}
            {recentlyPlayed.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View>
                    <Text
                      style={[styles.sectionKicker, { color: theme.primary }]}
                    >
                      BACK IN TIME
                    </Text>
                    <Text
                      style={[
                        styles.sectionTitle,
                        { color: theme.textPrimary },
                      ]}
                    >
                      Recently Played
                    </Text>
                  </View>
                </View>
                <FlatList
                  horizontal
                  data={recentlyPlayed.slice(0, 10)}
                  renderItem={renderRecentlyPlayedItem}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalList}
                />
              </View>
            )}

            {/* Live Scores Section */}
            {liveMatches.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.liveIndicator}>
                    <LiveIndicator color={theme.accentError} />
                    <Text
                      style={[styles.liveText, { color: theme.accentError }]}
                    >
                      LIVE NOW
                    </Text>
                  </View>
                </View>
                <FlashList
                  horizontal
                  data={liveMatches}
                  renderItem={({ item }) => (
                    <MatchCard game={item} onPress={setSelectedGameId} />
                  )}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalList}
                />
              </View>
            )}

            {/* Favorite Channels */}
            {favoriteChannels && favoriteChannels.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View>
                    <Text
                      style={[styles.sectionKicker, { color: theme.primary }]}
                    >
                      YOUR SELECTION
                    </Text>
                    <Text
                      style={[
                        styles.sectionTitle,
                        { color: theme.textPrimary },
                      ]}
                    >
                      Favorite Channels
                    </Text>
                  </View>
                  <Pressable onPress={() => router.push("/(tabs)/channels")}>
                    <Text style={[styles.seeAll, { color: theme.primary }]}>
                      See All
                    </Text>
                  </Pressable>
                </View>
                <FlatList
                  horizontal
                  data={favoriteChannels}
                  renderItem={renderChannel}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalList}
                />
              </View>
            )}
          </>
        )}
      </ScrollView>
      <MatchDetailsModal
        gameId={selectedGameId}
        visible={!!selectedGameId}
        onClose={() => setSelectedGameId(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  skeletonContainer: { padding: 20, gap: 20 },
  skeletonChannels: { flexDirection: "row", gap: 12, marginTop: 10 },

  // Hero / Featured
  featuredSection: { marginTop: 8 },
  featuredList: { paddingHorizontal: 0 },
  heroContainer: {
    width: "100%",
    height: 420,
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  heroGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
    backgroundColor: "transparent",
  },
  heroContent: {
    position: "absolute",
    bottom: 60,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  heroBadgeText: { fontSize: 12, fontWeight: "700" },
  heroTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 8,
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  heroSubtitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 20,
  },
  heroActions: { flexDirection: "row", gap: 12 },
  heroPlayButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 12,
    gap: 8,
  },
  heroPlayText: { fontWeight: "700", fontSize: 16 },
  heroInfoButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  trendingCard: {
    width: 140,
    height: 200,
    borderRadius: 16,
    overflow: "hidden",
    marginRight: 12,
  },
  trendingImage: {
    width: "100%",
    height: "100%",
  },
  trendingOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
  },
  trendingTitle: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  featuredCardWrapper: { width: 280, marginRight: 16 },
  featuredCard: {
    width: 280,
    height: 180,
    borderRadius: 16,
    overflow: "hidden",
  },
  featuredImage: { width: "100%", height: "100%" },
  featuredGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
  },
  featuredContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  featuredBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  featuredBadgeText: { fontSize: 10, fontWeight: "700" },
  featuredTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 4,
  },
  featuredSub: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    marginBottom: 12,
  },
  featuredActions: { flexDirection: "row", gap: 10 },
  playButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 10,
    gap: 6,
  },
  playButtonText: { fontWeight: "700", fontSize: 14 },
  infoButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },

  // Sections
  section: { marginTop: 24 },
  horizontalList: { paddingHorizontal: 20 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionKicker: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "800",
  },
  seeAll: {
    fontSize: 14,
    fontWeight: "600",
  },

  // Live
  liveIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  liveText: { fontSize: 14, fontWeight: "800", letterSpacing: 1 },
  liveDot: { width: 8, height: 8, borderRadius: 4 },

  // Channels
  channelCardWrapper: { width: 100, marginRight: 12, alignItems: "center" },
  channelCard: {
    width: 100,
    height: 100,
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  channelImage: { width: "100%", height: "100%" },
  channelPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  channelOverlay: {
    position: "absolute",
    top: 6,
    left: 6,
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  liveBadgeText: {
    color: "#fff",
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  channelTitle: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 8,
    textAlign: "center",
  },

  // Quick Actions
  quickActions: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 12,
    marginTop: 24,
    marginBottom: 20,
  },
  quickAction: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  quickActionIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: "700",
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyTitle: { fontSize: 24, fontWeight: "800", marginBottom: 8 },
  emptySub: { fontSize: 14, marginBottom: 24 },
  actionButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 14,
  },
  actionButtonText: { fontWeight: "800", fontSize: 16 },

  // Continue Watching
  continueCard: {
    width: 140,
    height: 200,
    borderRadius: 12,
    overflow: "hidden",
    marginRight: 12,
  },
  continueImage: {
    width: "100%",
    height: "100%",
  },
  continueOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  continueTitle: {
    position: "absolute",
    bottom: 8,
    left: 8,
    right: 8,
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // Series Card
  seriesCard: {
    width: 130,
    marginRight: 12,
  },
  seriesImage: {
    width: 130,
    height: 180,
    borderRadius: 12,
    overflow: "hidden",
  },
  seriesBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  seriesRating: {
    fontSize: 10,
    fontWeight: "700",
  },
  seriesTitle: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 8,
  },
});
