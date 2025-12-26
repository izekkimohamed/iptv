import LiveScoresScreen from "@/components/LiveScores";
import { trpc } from "@/lib/trpc";
import { usePlaylistStore } from "@/store/appStore";
import { usePlayerTheme } from "@/theme/playerTheme";
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Database, Play, Search, Star, Tv, User } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const FEATURED_WIDTH = width - 40;

export default function HomeScreen() {
  const router = useRouter();
  const theme = usePlayerTheme();
  const [searchQuery, setSearchQuery] = useState("");

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
  const { data: playlists } = trpc.playlists.getPlaylists.useQuery();

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

  useEffect(() => {
    if (storePlaylists.length === 0 && playlists) {
      playlists.forEach((playlist) => {
        addPlaylist(playlist);
      });
      selectPlaylist(playlists[0]);
    }
  }, [addPlaylist, playlists, selectPlaylist, storePlaylists.length]);

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
            <LiveScoresScreen />
          </>
        }
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 2 },

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
