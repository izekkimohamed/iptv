import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Database, Info, Play, Tv } from "lucide-react-native";
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
  View,
} from "react-native";
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import useSWR from "swr";

import MatchDetailsModal from "@/components/365/Details";
import { formatDateForAPI, Game } from "@/components/365/LiveScores";
import MatchCard from "@/components/365/MatchCard";
import Header from "@/components/Header";
import { trpc } from "@/lib/trpc";
import { usePlayerTheme } from "@/theme/playerTheme";
import { usePlaylistStore } from "@repo/store";

const { width } = Dimensions.get("window");
const FEATURED_WIDTH = width * 0.85;
const fetcher = (url: string) => fetch(url).then((r) => r.json());

// --- Live Pulse Component ---
const LiveIndicator = ({ color }: { color: string }) => {
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: withRepeat(
      withSequence(
        withTiming(0.4, { duration: 800 }),
        withTiming(1, { duration: 800 })
      ),
      -1,
      true
    ),
    transform: [
      {
        scale: withRepeat(
          withSequence(
            withTiming(1, { duration: 800 }),
            withTiming(1.2, { duration: 800 })
          ),
          -1,
          true
        ),
      },
    ],
  }));

  return (
    <View style={styles.liveIndicatorContainer}>
      <Animated.View
        style={[styles.dot, { backgroundColor: color }, animatedStyle]}
      />
    </View>
  );
};

export default function HomeScreen() {
  const router = useRouter();
  const theme = usePlayerTheme();
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
    { favorites: true, playlistId: selectedPlaylist?.id || 0 },
    { enabled: !!selectedPlaylist }
  );

  const apiUrl = `${process.env.EXPO_PUBLIC_API_URL}/live-matches?date=${formatDateForAPI(currentDate)}`;
  const { data: games = [], mutate: mutateGames } = useSWR<Game[]>(
    apiUrl,
    fetcher,
    {
      refreshInterval: (data) =>
        data?.some((g) => g.statusGroup === 3) ? 20000 : 60000,
      keepPreviousData: true,
    }
  );

  const liveMatches = useMemo(
    () => games.filter((g) => g.statusGroup === 3),
    [games]
  );

  useEffect(() => {
    if (!playlists) return;

    // 1. Identify items to REMOVE (in store but not in fetched data)
    storePlaylists.forEach((stored) => {
      const stillExists = playlists.find((p) => p.id === stored.id);
      if (!stillExists) {
        removePlaylist(stored.id);
      }
    });

    // 2. Identify items to ADD or UPDATE
    playlists.forEach((fetched) => {
      const existing = storePlaylists.find((p) => p.id === fetched.id);

      if (!existing) {
        // New item found
        addPlaylist(fetched);
      } else {
        // Item exists, check if any fields changed (URL, Username, Status, etc.)
        // We compare strings to detect deep changes efficiently
        if (JSON.stringify(existing) !== JSON.stringify(fetched)) {
          updatePlaylist(fetched.id, fetched);
        }
      }
    });

    // 3. Auto-select first playlist if none is selected
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

  const renderFeaturedItem = ({ item }: { item: any }) => (
    <Pressable
      onPress={() =>
        router.push({
          pathname: "/movies/tmdb",
          params: { movieId: item.id, playlistId: 26 },
        })
      }
      style={[
        styles.featuredCard,
        {
          borderColor: theme.border,
        },
      ]}
    >
      <Image
        source={{ uri: item.backdropUrl || item.posterUrl }}
        style={styles.featuredImage}
        contentFit='cover'
        transition={500}
      />
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.4)", "rgba(0,0,0,0.9)"]}
        style={styles.featuredGradient}
      />
      <View style={styles.featuredContent}>
        <Text style={styles.featuredTitle} numberOfLines={1}>
          {item.title || item.name}
        </Text>
        <View style={styles.featuredRow}>
          <View style={[styles.badge, { backgroundColor: theme.primary }]}>
            <Text style={styles.badgeText}>Trending</Text>
          </View>
          <Text style={styles.featuredSub} numberOfLines={1}>
            {item.overview || "New Release"}
          </Text>
        </View>
        <View style={styles.buttonRow}>
          <View style={[styles.playButton, { backgroundColor: "#fff" }]}>
            <Play size={14} color='#000' fill='#000' />
            <Text style={styles.playButtonText}>Play</Text>
          </View>
          <View
            style={[
              styles.infoButton,
              { backgroundColor: "rgba(255,255,255,0.2)" },
            ]}
          >
            <Info size={14} color='#fff' />
          </View>
        </View>
      </View>
    </Pressable>
  );

  const renderChannel = ({ item }: { item: any }) => (
    <Animated.View entering={FadeInDown} style={styles.channelContainer}>
      <Pressable
        onPress={() =>
          router.push({
            pathname: "/player",
            params: { url: item.url, title: item.name, mediaType: "live" },
          })
        }
        style={({ pressed }) => [
          styles.channelPressable,
          {
            backgroundColor: theme.surfaceSecondary,
            borderColor: theme.border,
          },
          pressed && { opacity: 0.7, transform: [{ scale: 0.95 }] },
        ]}
      >
        {item.streamIcon ?
          <Image
            source={{ uri: item.streamIcon }}
            style={styles.channelLogo}
            contentFit='fill'
          />
        : <Tv size={28} color={theme.textMuted} />}
      </Pressable>
      <Text
        numberOfLines={1}
        style={[styles.channelTitle, { color: theme.textPrimary }]}
      >
        {item.name}
      </Text>
    </Animated.View>
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
            <Database size={40} color={theme.textMuted} />
          </View>
          <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
            No Playlist Found
          </Text>
          <Pressable
            style={[styles.actionButton, { backgroundColor: theme.primary }]}
            onPress={() => router.push("/playlists/manage")}
          >
            <Text style={styles.actionButtonText}>Add Playlist</Text>
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
      >
        {isLoading ?
          <ActivityIndicator style={{ marginTop: 100 }} color={theme.primary} />
        : <>
            {/* Hero Carousel */}
            <View style={styles.featuredSection}>
              <FlashList
                horizontal
                data={homeData?.movies || []}
                renderItem={renderFeaturedItem}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.featuredList}
                snapToInterval={FEATURED_WIDTH + 16}
                decelerationRate='fast'
              />
            </View>

            {/* Favorite Channels */}
            {favoriteChannels && favoriteChannels.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionTitleRow}>
                  <Text
                    style={[styles.sectionHeader, { color: theme.textPrimary }]}
                  >
                    Favorites
                  </Text>
                  <Pressable onPress={() => router.push("/(tabs)/channels")}>
                    <Text
                      style={{
                        color: theme.primary,
                        fontSize: 13,
                        fontWeight: "600",
                      }}
                    >
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

            {/* Live Matches */}
            {liveMatches.length > 0 && (
              <View style={styles.section}>
                <View style={styles.liveTitleRow}>
                  <LiveIndicator color={theme.accentError} />
                  <Text style={[styles.liveText, { color: theme.accentError }]}>
                    LIVE SCORES
                  </Text>
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
  section: { marginVertical: 12 },
  sectionTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionHeader: { fontSize: 20, fontWeight: "800", letterSpacing: -0.5 },
  horizontalList: { paddingHorizontal: 20, paddingBottom: 10 },

  // Featured Hero
  featuredSection: { marginTop: 10 },
  featuredList: { paddingHorizontal: 20 },
  featuredCard: {
    width: FEATURED_WIDTH,
    height: 340,
    borderRadius: 24,
    borderWidth: 1,
    overflow: "hidden",
    marginRight: 16,
    elevation: 5,
  },
  featuredImage: { width: "100%", height: "100%" },
  featuredGradient: { ...StyleSheet.absoluteFillObject },
  featuredContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  featuredTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 4,
  },
  featuredRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  featuredSub: { color: "rgba(255,255,255,0.7)", fontSize: 12, flex: 1 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  badgeText: { fontSize: 10, fontWeight: "800", color: "#000" },
  buttonRow: { flexDirection: "row", gap: 10 },
  playButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  playButtonText: { color: "#000", fontWeight: "800", fontSize: 14 },
  infoButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  // Channels
  channelContainer: { width: 85, marginRight: 12, alignItems: "center" },
  channelPressable: {
    width: 85,
    height: 85,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    borderWidth: 1,
    overflow: "hidden",
  },
  channelLogo: { width: "100%", height: "100%" },
  channelTitle: {
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
    width: "100%",
  },

  // Live Section
  liveTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  liveText: { fontSize: 14, fontWeight: "900", letterSpacing: 1 },
  liveIndicatorContainer: {
    width: 12,
    height: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  dot: { width: 6, height: 6, borderRadius: 3 },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyTitle: { fontSize: 22, fontWeight: "800", marginBottom: 20 },
  actionButton: {
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 16,
  },
  actionButtonText: { fontWeight: "800", fontSize: 16 },
});
