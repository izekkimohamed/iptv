import { trpc } from "@/lib/trpc";
import { cleanName } from "@/lib/utils";
import { usePlaylistStore } from "@/store/appStore";
import { usePlayerTheme } from "@/theme/playerTheme";
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image"; // Better performance than react-native Image
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Film, Search } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const COLUMN_COUNT = 3;
const SPACING = 12;
// Calculate precise item width for perfect grid
const ITEM_WIDTH = (width - SPACING * (COLUMN_COUNT + 1)) / COLUMN_COUNT;

export default function MovieExplorer() {
  const router = useRouter();
  const theme = usePlayerTheme();
  const selectPlaylist = usePlaylistStore((state) => state.selectedPlaylist);

  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  );

  // 1. Fetch Categories
  const { data: categories, isLoading: loadingCats } =
    trpc.movies.getMoviesCategories.useQuery({
      playlistId: selectPlaylist?.id ?? 0,
    });

  // Set default category
  useEffect(() => {
    if (categories && categories.length > 0 && !selectedCategoryId) {
      setSelectedCategoryId(categories[0].categoryId);
    }
  }, [categories, selectedCategoryId]);

  // 2. Fetch Movies
  const { data: movies, isLoading: loadingMovies } =
    trpc.movies.getMovies.useQuery(
      {
        playlistId: selectPlaylist?.id ?? 0,
        categoryId: selectedCategoryId ?? 0,
      },
      { enabled: !!selectedCategoryId }
    );

  const renderMovie = ({ item, index }: { item: any; index: number }) => (
    <Animated.View
      entering={FadeInDown.delay((index % 10) * 50).springify()}
      style={styles.movieItemWrapper}
    >
      <Pressable
        style={({ pressed }) => [
          styles.movieCard,
          pressed && { opacity: 0.7, transform: [{ scale: 0.96 }] },
        ]}
        onPress={() =>
          router.push({
            pathname: "/movies/[id]",
            params: {
              id: item.streamId,
              url: item.url,
              title: item.name,
              overview: item.overview || "",
            },
          })
        }
      >
        <View
          style={[
            styles.posterContainer,
            { backgroundColor: theme.surfaceSecondary },
          ]}
        >
          <Image
            source={{ uri: item.streamIcon }}
            style={[styles.poster, { borderColor: theme.border }]}
            contentFit='cover'
            transition={500}
            // Add a placeholder to avoid empty spaces while loading
            placeholder='L6PZfSi_.AyE_3t7t7R**0o#DgR4'
            placeholderContentFit='cover'
          />
          {/* Subtle gradient at bottom of poster for depth */}
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.3)"]}
            style={styles.posterGradient}
          />
        </View>
        <Text
          style={[styles.movieTitle, { color: theme.textSecondary }]}
          numberOfLines={1}
        >
          {cleanName(item.name)}
        </Text>
      </Pressable>
    </Animated.View>
  );

  // --- Loading State ---
  if (loadingCats)
    return (
      <View style={[styles.container, { backgroundColor: theme.bg }]}>
        <View style={styles.centerBox}>
          <ActivityIndicator size='large' color={theme.primary} />
        </View>
      </View>
    );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.bg }]}
      edges={["top"]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
          Discover Movies
        </Text>
        <Pressable
          style={[
            styles.searchBtn,
            { backgroundColor: theme.surfaceSecondary },
          ]}
        >
          <Search size={20} color={theme.textMuted} />
        </Pressable>
      </View>

      {/* Categories Horizontal Scroll */}
      <View style={styles.categoriesContainer}>
        <FlashList
          horizontal
          data={categories}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContent}
          keyExtractor={(item) => item.categoryId.toString()}
          renderItem={({ item }) => {
            const isSelected = selectedCategoryId === item.categoryId;
            return (
              <Pressable
                onPress={() => setSelectedCategoryId(item.categoryId)}
                style={[
                  styles.categoryPill,
                  {
                    backgroundColor:
                      isSelected ? theme.primary : theme.surfaceSecondary,
                    borderColor: isSelected ? theme.primary : theme.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.categoryText,
                    {
                      color: isSelected ? "#000" : theme.textSecondary,
                      fontWeight: isSelected ? "700" : "500",
                    },
                  ]}
                >
                  {item.categoryName}
                </Text>
              </Pressable>
            );
          }}
        />
      </View>

      {/* Movies Grid */}
      <View style={styles.gridArea}>
        {loadingMovies ?
          <View style={styles.centerBox}>
            <ActivityIndicator size='large' color={theme.primary} />
          </View>
        : movies && movies.length > 0 ?
          <FlashList
            data={movies}
            numColumns={COLUMN_COUNT}
            renderItem={renderMovie}
            contentContainerStyle={styles.gridContent}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item) => item.streamId.toString()}
          />
        : <Animated.View entering={FadeIn} style={styles.emptyState}>
            <View
              style={[
                styles.emptyIconCircle,
                { backgroundColor: `${theme.primary}15` },
              ]}
            >
              <Film size={40} color={theme.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
              No movies found
            </Text>
            <Text style={[styles.emptySub, { color: theme.textMuted }]}>
              This category seems to be empty.
            </Text>
          </Animated.View>
        }
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  searchBtn: {
    padding: 10,
    borderRadius: 50,
  },

  // Categories
  categoriesContainer: {
    height: 50,
    marginBottom: 8,
  },
  categoriesContent: {
    paddingHorizontal: 16,
    paddingVertical: 4, // Space for shadow/border
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryText: {
    fontSize: 13,
    letterSpacing: 0.2,
  },

  // Grid
  gridArea: {
    flex: 1,
  },
  gridContent: {
    padding: SPACING,
    paddingBottom: 40,
  },
  movieItemWrapper: {
    width: ITEM_WIDTH,
    marginRight: SPACING, // This + contentContainer padding handles the grid logic
    marginBottom: 20,
  },
  movieCard: {
    width: "100%",
    gap: 8,
  },
  posterContainer: {
    width: "100%",
    aspectRatio: 2 / 3,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    position: "relative",
  },
  poster: {
    width: "100%",
    height: "100%",
    borderWidth: 1,
    borderRadius: 12,
  },
  posterGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "30%",
  },
  movieTitle: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    paddingHorizontal: 2,
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  emptySub: {
    fontSize: 14,
  },
});
