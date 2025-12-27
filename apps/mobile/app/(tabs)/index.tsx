import MatchDetailsModal from "@/components/365/Details";
import { formatDateForAPI, Game } from "@/components/365/LiveScores";
import MatchCard from "@/components/365/MatchCard";
import { trpc } from "@/lib/trpc";
import { usePlaylistStore } from "@/store/appStore";
import { usePlayerTheme } from "@/theme/playerTheme";
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  Database,
  Play,
  RefreshCcw,
  Search,
  Star,
  Tv,
  User,
} from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import useSWR from "swr";

const { width } = Dimensions.get("window");
const FEATURED_WIDTH = width - 40;
const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function HomeScreen() {
  const router = useRouter();
  const theme = usePlayerTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const currentDate = new Date();
  const [selectedGameId, setSelectedGameId] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const {
    selectedPlaylist,
    selectPlaylist,
    addPlaylist,
    playlists: storePlaylists,
  } = usePlaylistStore();

  // 1. Fetch Home Data (Featured, Movies)
  const { data: homeData, isLoading } = trpc.home.getHome.useQuery(undefined, {
    enabled: !!selectedPlaylist,
  });

  // 2. Fetch Playlists (Initial Setup)
  const { data: playlists, refetch: refreshPlaylists } =
    trpc.playlists.getPlaylists.useQuery();

  // 3. Fetch Favorite Channels
  const { data: favoriteChannels } = trpc.channels.getChannels.useQuery(
    {
      favorites: true,
      playlistId: selectedPlaylist?.id || 0,
    },
    {
      enabled: !!selectedPlaylist,
    }
  );

  const apiUrl = `${process.env.EXPO_PUBLIC_API_URL}/live-matches?date=${formatDateForAPI(currentDate)}`;

  // 2. Optimized SWR Configuration for "Live" Data
  const {
    data: games = [], // Default to empty array
    error,
    isLoading: LoadingLiveScores,
    mutate: mutateGames,
  } = useSWR<Game[]>(apiUrl, fetcher, {
    // Dynamic Polling: If there are live games, poll every 10s. If not, every 60s.
    refreshInterval: (latestData) => {
      const hasLiveAction = latestData?.some((g) => g.statusGroup === 3);
      return hasLiveAction ? 30000 : 60000;
    },
    revalidateOnFocus: true, // Update when app comes to foreground
    revalidateOnReconnect: true, // Update when internet returns
    dedupingInterval: 2000, // Don't use cache if request is older than 2 seconds
    keepPreviousData: true, // Keep showing old list while fetching new one (prevents flicker)
  });

  // 3. Derived State
  const liveMatches = useMemo(
    () => games.filter((g) => g.statusGroup === 3),
    [games]
  );

  useEffect(() => {
    if (!playlists || playlists.length === 0) return;
    // Get existing playlist IDs from store
    const existingPlaylistIds = new Set(storePlaylists.map((p) => p.id));

    // Find playlists that don't exist in the store
    const newPlaylists = playlists.filter(
      (playlist) => !existingPlaylistIds.has(playlist.id)
    );

    // Add new playlists to store
    if (newPlaylists.length > 0) {
      newPlaylists.forEach((playlist) => {
        addPlaylist(playlist);
      });
    }

    // Select the first playlist if none is selected
    if (!selectedPlaylist && playlists.length > 0) {
      selectPlaylist(playlists[0]);
    }
  }, [
    addPlaylist,
    playlists,
    selectPlaylist,
    selectedPlaylist,
    storePlaylists,
  ]);

  // Pull-to-refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Refresh all data sources in parallel
      await Promise.all([
        refreshPlaylists(),
        mutateGames(), // Revalidate SWR data
      ]);
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // --- Render Functions ---

  const renderFeaturedItem = ({ item }: { item: any }) => (
    <View style={styles.featuredCard}>
      <Image
        source={{ uri: item.backdropUrl || item.posterUrl }}
        style={styles.featuredImage}
        contentFit='cover'
        transition={500}
      />
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.8)"]}
        style={styles.featuredGradient}
      />
      <View style={styles.featuredContent}>
        <Text style={styles.featuredTitle} numberOfLines={1}>
          {item.title || item.name}
        </Text>
        <Text style={styles.featuredSub} numberOfLines={2}>
          {item.overview || "No description available."}
        </Text>
        <Pressable
          style={[styles.playButton, { backgroundColor: theme.primary }]}
          onPress={() =>
            router.push({
              pathname: "/movies/tmdb",
              params: { movieId: item.id, playlistId: 26 },
            })
          }
        >
          <Play size={16} color='#000' fill='#000' />
          <Text style={styles.playButtonText}>Watch Now</Text>
        </Pressable>
      </View>
    </View>
  );

  const renderChannel = ({ item }: { item: any }) => (
    <Animated.View entering={FadeInDown} style={styles.channelContainer}>
      <Pressable
        onPress={() =>
          router.push({
            pathname: "/player",
            params: {
              url: item.url, // Ensure your API returns the stream URL here
              title: item.name,
              mediaType: "live",
            },
          })
        }
        style={({ pressed }) => [
          styles.channelPressable,
          {
            backgroundColor: theme.surfaceSecondary,
            borderColor: theme.border,
          },
          pressed && { opacity: 0.8, backgroundColor: theme.surfacePrimary },
        ]}
      >
        {item.streamIcon ?
          <Image
            source={{ uri: item.streamIcon }}
            style={styles.channelLogo}
            contentFit='contain'
            transition={300}
          />
        : <Tv size={24} color={theme.textMuted} />}
      </Pressable>
      <Text
        numberOfLines={1}
        style={[styles.channelTitle, { color: theme.textSecondary }]}
      >
        {item.name}
      </Text>
    </Animated.View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.bg }]}
      edges={["top"]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View
          style={[
            styles.searchContainer,
            { backgroundColor: theme.surfaceSecondary },
          ]}
        >
          <Search size={18} color={theme.textMuted} />
          <TextInput
            placeholder='Search...'
            placeholderTextColor={theme.textMuted}
            style={[styles.searchInput, { color: theme.textPrimary }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => router.push(`/search?q=${searchQuery}`)}
            returnKeyType='search'
          />
        </View>
        <Pressable
          onPress={() => router.push("/playlists/manage")}
          style={[
            styles.profileButton,
            {
              backgroundColor: theme.surfaceSecondary,
              borderColor: theme.border,
            },
          ]}
        >
          <User
            size={20}
            color={selectedPlaylist ? theme.primary : theme.accentError}
          />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }
      >
        {!selectedPlaylist ?
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
              No Playlist Connected
            </Text>
            <Text style={[styles.emptySub, { color: theme.textMuted }]}>
              Please add a playlist to start watching content.
            </Text>
            <Pressable
              style={[styles.actionButton, { backgroundColor: theme.primary }]}
              onPress={() => router.push("/playlists/manage")}
            >
              <Text style={styles.actionButtonText}>Connect Playlist</Text>
            </Pressable>
          </View>
        : isLoading ?
          <View style={styles.loadingContainer}>
            <ActivityIndicator size='large' color={theme.primary} />
          </View>
        : <>
            {/* Featured Section (Carousel) */}
            {homeData?.movies && homeData.movies.length > 0 && (
              <View style={styles.featuredSection}>
                <Text
                  style={[
                    styles.sectionHeader,
                    { color: theme.textPrimary, marginLeft: 20 },
                  ]}
                >
                  Trending Now
                </Text>
                <FlashList
                  horizontal
                  data={homeData.movies}
                  renderItem={renderFeaturedItem}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.featuredList}
                  pagingEnabled
                  decelerationRate='fast'
                  snapToInterval={FEATURED_WIDTH + 10}
                />
              </View>
            )}

            {/* Favorite Channels Section */}
            {favoriteChannels && favoriteChannels.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionTitleRow}>
                  <View style={styles.titleLeft}>
                    <Star
                      size={18}
                      color={theme.primary}
                      fill={theme.primary}
                    />
                    <Text
                      style={[
                        styles.sectionHeader,
                        { color: theme.textPrimary },
                      ]}
                    >
                      Favorite Channels
                    </Text>
                  </View>
                  <Pressable onPress={() => router.push("/(tabs)/channels")}>
                    <Text style={[styles.seeAll, { color: theme.primary }]}>
                      View All
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

            {/* Loading State (Initial Load Only) */}
            {LoadingLiveScores && games.length === 0 ?
              <ActivityIndicator
                size='large'
                color={theme.primary}
                style={{ marginTop: 50 }}
              />
            : games.length === 0 && !error ?
              // 6. Empty State
              <View style={styles.emptyContainer}>
                <RefreshCcw
                  size={48}
                  color={theme.textMuted}
                  style={{ opacity: 0.5, marginBottom: 10 }}
                />
                <Text style={{ color: theme.textSecondary, fontWeight: "600" }}>
                  No matches scheduled
                </Text>
                <Text style={{ color: theme.textMuted, fontSize: 12 }}>
                  Try changing the date
                </Text>
              </View>
            : <>
                {/* Live Section */}
                {liveMatches.length > 0 && (
                  <View style={styles.section}>
                    <View
                      style={{
                        padding: 20,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 5,
                      }}
                    >
                      {/* Assuming LivePulse is a component you have */}
                      <View style={styles.liveIndicator}>
                        <View
                          style={[
                            styles.dot,
                            { backgroundColor: theme.accentError },
                          ]}
                        />
                      </View>
                      <Text
                        style={[
                          styles.sectionTitle,
                          { color: theme.accentError },
                        ]}
                      >
                        LIVE NOW
                      </Text>
                    </View>
                    <FlashList
                      horizontal
                      data={liveMatches}
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.horizontalList}
                      renderItem={({ item }) => (
                        <MatchCard game={item} onPress={setSelectedGameId} />
                      )}
                    />
                  </View>
                )}
              </>
            }
          </>
        }
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
  scrollContent: { paddingBottom: 2 },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 100,
  },
  liveIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,0,0,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  dot: { width: 4, height: 4, borderRadius: 2 },
  sectionTitle: { fontSize: 14, fontWeight: "800", letterSpacing: 0.5 },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    height: 44,
    borderRadius: 22,
    paddingHorizontal: 16,
    gap: 10,
  },
  searchInput: { flex: 1, fontSize: 15 },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },

  // Featured Carousel
  featuredSection: { marginBottom: 10, marginTop: 10 },
  featuredList: { paddingHorizontal: 20, gap: 10 },
  featuredCard: {
    width: FEATURED_WIDTH,
    height: 200,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
    marginRight: 10,
    marginTop: 12,
  },
  featuredImage: { width: "100%", height: "100%" },
  featuredGradient: { ...StyleSheet.absoluteFillObject },
  featuredContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    gap: 6,
  },
  featuredTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
    textShadowColor: "rgba(0,0,0,0.7)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  featuredSub: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    marginBottom: 8,
  },
  playButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 6,
  },
  playButtonText: { color: "#000", fontWeight: "700", fontSize: 12 },

  // Sections
  section: { marginBottom: 1 },
  sectionTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  titleLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  sectionHeader: { fontSize: 18, fontWeight: "700" },
  seeAll: { fontSize: 12, fontWeight: "600" },

  horizontalList: { paddingHorizontal: 20 },

  // Poster Style (Movies)
  posterContainer: { width: 140, marginRight: 16 },
  posterPressable: { gap: 8 },
  posterImage: {
    width: 140,
    height: 210,
    borderRadius: 12,
    borderWidth: 1,
  },
  posterTitle: { fontSize: 12, fontWeight: "600", paddingLeft: 4 },

  // Channel Style (Favorites)
  channelContainer: { width: 110, marginRight: 12, alignItems: "center" },
  channelPressable: {
    width: 110,
    height: 110,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    borderWidth: 1,
    padding: 10,
  },
  channelLogo: { width: "80%", height: "80%" },
  channelTitle: { fontSize: 12, fontWeight: "600", textAlign: "center" },

  // States
  loadingContainer: {
    height: 300,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    marginTop: 60,
    alignItems: "center",
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  emptyTitle: { fontSize: 18, fontWeight: "700" },
  emptySub: { fontSize: 14, textAlign: "center", lineHeight: 20 },
  actionButton: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  actionButtonText: { color: "#000", fontWeight: "700" },
});
