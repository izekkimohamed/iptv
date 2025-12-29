import { trpc } from "@/lib/trpc";
import { usePlayerTheme } from "@/theme/playerTheme";
import { usePlaylistStore } from "@repo/store";
import { FlashList } from "@shopify/flash-list";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ChevronDown,
  ChevronLeft,
  Film,
  Play,
  Star,
  User,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Linking,
  Platform,
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
const POSTER_WIDTH = width * 0.42; // Much larger poster (42% of screen width)
const POSTER_HEIGHT = POSTER_WIDTH * 1.5;

export default function MovieDetailsScreen() {
  const router = useRouter();
  const theme = usePlayerTheme();
  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);

  const { movieId } = useLocalSearchParams<{
    movieId: string;
  }>();
  const playlistId = usePlaylistStore((state) => state.selectedPlaylist?.id);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedSource, setSelectedSource] = useState(0);

  const { data, isLoading, error } = trpc.movies.getTmdbMovieDetails.useQuery(
    {
      tmdbId: Number(movieId),
      playlistId: Number(playlistId),
    },
    { enabled: !!movieId && !!playlistId }
  );

  const movie = data?.[0];

  // Animated Scroll Handler for Parallax
  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(scrollY.value, [0, 200], [0, 1]),
      backgroundColor: theme.bg,
    };
  });

  // ... existing hooks

  const handleTrailerPress = async (key: string) => {
    // 1. Define the specific App URL for each platform
    const appUrl = Platform.select({
      ios: `youtube://watch?v=${key}`,
      android: `vnd.youtube:${key}`,
      default: `https://www.youtube.com/watch?v=${key}`,
    });

    // 2. Define the fallback Web URL
    const webUrl = `https://www.youtube.com/watch?v=${key}`;

    try {
      // 3. Try opening the App URL
      await Linking.openURL(appUrl);
    } catch (err) {
      // 4. If that fails (App not installed), open the Web URL
      await Linking.openURL(webUrl);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.bg }]}>
        <ActivityIndicator size='large' color={theme.primary} />
      </View>
    );
  }

  if (error || !movie) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.bg }]}>
        <Film size={48} color={theme.accentError} strokeWidth={1.5} />
        <Text
          style={[
            styles.errorText,
            { color: theme.textSecondary, marginTop: 16 },
          ]}
        >
          Content unavailable
        </Text>
      </View>
    );
  }

  const handlePlay = (item: any) => {
    router.push({
      pathname: "/player",
      params: {
        url: item.url,
        title: item.name,
        overview: item.info?.description,
      },
    });
  };

  const rating = 0; // Replace with actual rating if available
  const runtime = movie.tmdb.runtime || 0;

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* --- Sticky Header (Fades in) --- */}
      <Animated.View
        style={[
          styles.stickyHeader,
          headerAnimatedStyle,
          { height: 60 + insets.top, paddingTop: insets.top },
        ]}
      >
        <Text
          style={[styles.stickyTitle, { color: theme.textPrimary }]}
          numberOfLines={1}
        >
          {movie.tmdb.title}
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
          onPress={router.back}
        >
          <ChevronLeft color={theme.primary} size={26} strokeWidth={2.5} />
        </Pressable>
      </SafeAreaView>

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* --- BACKDROP --- */}
        <View style={styles.backdropContainer}>
          <Image
            source={{ uri: movie.tmdb.backdrop || "" }}
            style={styles.backdrop}
            blurRadius={0}
          />
          <LinearGradient
            colors={["transparent", `${theme.bg}00`, `${theme.bg}E6`, theme.bg]}
            locations={[0, 0.4, 0.85, 1]}
            style={styles.backdropGradient}
          />
        </View>

        {/* --- HERO SECTION --- */}
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
                source={{
                  uri:
                    movie.tmdb.poster || "https://via.placeholder.com/300x450",
                }}
                style={[styles.poster, { borderColor: theme.borderMuted }]}
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

            {/* 2. Title & Metadata */}
            <View style={styles.infoColumn}>
              <Text style={[styles.title, { color: theme.textPrimary }]}>
                {movie.tmdb.title}
              </Text>

              <View style={styles.metaRow}>
                {movie.tmdb.releaseDate && (
                  <Text
                    style={[styles.metaText, { color: theme.textSecondary }]}
                  >
                    {new Date(movie.tmdb.releaseDate).getFullYear()}
                  </Text>
                )}
                <View
                  style={[
                    styles.dotSeparator,
                    { backgroundColor: theme.textMuted },
                  ]}
                />
                {runtime > 0 && (
                  <Text
                    style={[styles.metaText, { color: theme.textSecondary }]}
                  >
                    {Math.floor(runtime / 60)}h {runtime % 60}m
                  </Text>
                )}
                {/* Optional: Add Genre here if available */}
              </View>

              {/* Action Buttons (Inline) */}
              <View style={styles.miniActions}>
                <Pressable
                  style={[
                    styles.circleBtn,
                    { backgroundColor: theme.surfaceSecondary },
                  ]}
                >
                  <Star size={20} color={theme.textSecondary} />
                </Pressable>
                {/* Can add 'Share' or 'Add to List' here */}
              </View>
            </View>
          </Animated.View>
        </View>

        {/* --- MAIN ACTIONS --- */}
        <Animated.View
          entering={FadeInUp.delay(200)}
          style={styles.actionSection}
        >
          {movie.dbMovies.length > 0 ?
            <>
              <Pressable
                style={({ pressed }) => [
                  styles.playButton,
                  pressed && { transform: [{ scale: 0.98 }] },
                ]}
                onPress={() => handlePlay(movie.dbMovies[selectedSource])}
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
                  Watch Movie
                </Text>
              </Pressable>

              {/* Source Dropdown */}
              {movie.dbMovies.length > 1 && (
                <View style={styles.sourceWrapper}>
                  <Pressable
                    onPress={() => setDropdownOpen(!dropdownOpen)}
                    style={[
                      styles.sourceSelector,
                      {
                        backgroundColor: theme.surfacePrimary,
                        borderColor: theme.border,
                      },
                    ]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[styles.sourceLabel, { color: theme.textMuted }]}
                      >
                        SOURCE
                      </Text>
                      <Text
                        style={[
                          styles.sourceValue,
                          { color: theme.textPrimary },
                        ]}
                        numberOfLines={1}
                      >
                        {movie.dbMovies[selectedSource]?.name}
                      </Text>
                    </View>
                    <ChevronDown size={20} color={theme.textSecondary} />
                  </Pressable>

                  {dropdownOpen && (
                    <View
                      style={[
                        styles.dropdownList,
                        {
                          backgroundColor: theme.bg,
                          borderColor: theme.border,
                        },
                      ]}
                    >
                      {movie.dbMovies.map((m, idx) => (
                        <Pressable
                          key={m.id}
                          style={[
                            styles.dropdownItem,
                            selectedSource === idx && {
                              backgroundColor: theme.bg,
                            },
                            { borderBottomColor: theme.border },
                          ]}
                          onPress={() => {
                            setSelectedSource(idx);
                            setDropdownOpen(false);
                          }}
                        >
                          <Text
                            style={{
                              color:
                                selectedSource === idx ?
                                  theme.primary
                                : theme.textSecondary,
                              fontWeight:
                                selectedSource === idx ? "700" : "400",
                            }}
                          >
                            {m.name}
                          </Text>
                          {selectedSource === idx && (
                            <View
                              style={[
                                styles.activeDot,
                                { backgroundColor: theme.primary },
                              ]}
                            />
                          )}
                        </Pressable>
                      ))}
                    </View>
                  )}
                </View>
              )}
            </>
          : <View
              style={[styles.unavailableBox, { borderColor: theme.border }]}
            >
              <Text style={{ color: theme.textMuted }}>No sources found</Text>
            </View>
          }
        </Animated.View>

        {/* --- SYNOPSIS --- */}
        <Animated.View
          entering={FadeIn.delay(300)}
          style={styles.sectionContainer}
        >
          <Text style={[styles.sectionHeader, { color: theme.textPrimary }]}>
            Synopsis
          </Text>
          <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
            {movie.tmdb.overview}
          </Text>
        </Animated.View>

        {/* --- CAST --- */}
        {movie.tmdb.cast?.length > 0 && (
          <Animated.View
            entering={FadeIn.delay(400)}
            style={styles.sectionContainer}
          >
            <View style={styles.sectionTitleRow}>
              <Text
                style={[styles.sectionHeader, { color: theme.textPrimary }]}
              >
                Top Cast
              </Text>
            </View>

            <FlashList
              horizontal
              data={movie.tmdb.cast.slice(0, 15)}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20 }}
              renderItem={({ item }) => (
                <View style={styles.castCard}>
                  <View
                    style={[
                      styles.castImgFrame,
                      { backgroundColor: theme.surfaceSecondary },
                    ]}
                  >
                    {item.profilePath ?
                      <Image
                        source={{ uri: item.profilePath }}
                        style={styles.castImg}
                      />
                    : <User size={24} color={theme.textMuted} />}
                  </View>
                  <Text
                    style={[styles.castName, { color: theme.textPrimary }]}
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>
                </View>
              )}
            />
          </Animated.View>
        )}

        {/* --- TRAILERS --- */}
        {movie.tmdb.videos?.length > 0 && (
          <Animated.View
            entering={FadeIn.delay(500)}
            style={[styles.sectionContainer, { paddingBottom: 50, zIndex: 1 }]}
          >
            <Text
              style={[
                styles.sectionHeader,
                { color: theme.textPrimary, marginBottom: 12 },
              ]}
            >
              Videos
            </Text>
            {movie.tmdb.videos
              .filter((v) => v.site === "YouTube")
              .slice(0, 3)
              .map((v) => (
                <Pressable
                  key={v.id}
                  style={[
                    styles.trailerRow,
                    { backgroundColor: theme.surfaceSecondary },
                  ]}
                  // UPDATE THIS LINE:
                  onPress={() => handleTrailerPress(v.key)}
                >
                  <View style={styles.trailerThumbnail}>
                    <Image
                      source={{
                        uri: `https://img.youtube.com/vi/${v.key}/mqdefault.jpg`,
                      }}
                      style={styles.trailerImg}
                    />
                    <View style={styles.playOverlay}>
                      <Play size={16} fill='white' color='white' />
                    </View>
                  </View>
                  <View style={styles.trailerInfo}>
                    <Text
                      style={[
                        styles.trailerTitle,
                        { color: theme.textPrimary },
                      ]}
                      numberOfLines={2}
                    >
                      {v.name}
                    </Text>
                    <Text
                      style={[styles.trailerType, { color: theme.textMuted }]}
                    >
                      {v.type}
                    </Text>
                  </View>
                </Pressable>
              ))}
          </Animated.View>
        )}
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { fontSize: 16, fontWeight: "500" },

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
    borderBottomColor: "rgba(255,255,255,0.05)",
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
    zIndex: 101, // Above sticky header
    paddingHorizontal: 20,
    paddingTop: 10,
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

  content: { paddingBottom: 50 },

  // Backdrop
  backdropContainer: {
    height: height * 0.55, // Taller backdrop
    width: "100%",
  },
  backdrop: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  backdropGradient: {
    ...StyleSheet.absoluteFillObject,
  },

  // Hero
  heroWrapper: {
    paddingHorizontal: 20,
    marginTop: -160, // Heavy overlap
  },
  heroContent: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 20,
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
    resizeMode: "cover",
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

  // Info Column (Right of poster)
  infoColumn: {
    flex: 1,
    paddingBottom: 4, // Align with bottom of poster
    gap: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    lineHeight: 30,
    letterSpacing: -0.5,
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  metaText: {
    fontSize: 13,
    fontWeight: "600",
    opacity: 0.8,
  },
  dotSeparator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    opacity: 0.6,
  },
  miniActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },
  circleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },

  // Actions
  actionSection: {
    paddingHorizontal: 20,
    marginTop: 24,
    gap: 12,
    zIndex: 100,
    elevation: 10, // Required for Android
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
  unavailableBox: {
    padding: 20,
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
  },

  // Source Selector
  sourceWrapper: {
    zIndex: 200, // Keep this higher than its parent's base
    elevation: 20, // Android
  },
  sourceSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    position: "relative",
  },
  sourceLabel: { fontSize: 10, fontWeight: "700", letterSpacing: 0.5 },
  sourceValue: { fontSize: 14, fontWeight: "600", marginTop: 2 },
  dropdownList: {
    position: "absolute",
    top: "105%",
    left: 0,
    right: 0,
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
    zIndex: 50,
    backgroundColor: "black",
  },
  dropdownItem: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
  },
  activeDot: { width: 6, height: 6, borderRadius: 3 },

  // Generic Sections
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 20,
  },
  sectionTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  bodyText: {
    fontSize: 15,
    lineHeight: 24,
    opacity: 0.8,
  },

  // Cast
  castCard: {
    width: 100, // Wider for 2:3 ratio
    marginRight: 12,
  },
  castImgFrame: {
    width: 100,
    height: 150, // 2:3 Aspect Ratio
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  castImg: { width: "100%", height: "100%", resizeMode: "cover" },
  castName: { fontSize: 12, fontWeight: "600", marginBottom: 2 },
  castRole: { fontSize: 11, opacity: 0.6 },

  // Trailers
  trailerRow: {
    flexDirection: "row",
    marginBottom: 12,
    borderRadius: 12,
    overflow: "hidden",
    height: 80,
  },
  trailerThumbnail: {
    width: 120,
    height: "100%",
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  trailerImg: { width: "100%", height: "100%", resizeMode: "cover" },
  playOverlay: {
    position: "absolute",
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 8,
    borderRadius: 20,
  },
  trailerInfo: {
    flex: 1,
    padding: 12,
    justifyContent: "center",
    gap: 4,
  },
  trailerTitle: { fontSize: 13, fontWeight: "600", lineHeight: 18 },
  trailerType: {
    fontSize: 11,
    fontWeight: "700",
    opacity: 0.5,
    textTransform: "uppercase",
  },
});
