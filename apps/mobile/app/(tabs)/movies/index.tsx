import { trpc } from "@/lib/trpc";
import { usePlaylistStore } from "@/store";
import { usePlayerTheme } from "@/theme/playerTheme";
import { cleanName } from "@repo/utils";
import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { Film, Star } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const COLUMN_COUNT = 2;
const SPACING = 12;

export default function MovieExplorer() {
  const { width, height } = useWindowDimensions();
  const ITEM_WIDTH = (width - SPACING * (COLUMN_COUNT + 1)) / COLUMN_COUNT;
  const router = useRouter();
  const theme = usePlayerTheme();
  const selectPlaylist = usePlaylistStore((state) => state.selectedPlaylist);

  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );
  const [showCategoryDrawer, setShowCategoryDrawer] = useState(false);

  const { data: categories, isLoading: loadingCats } =
    trpc.movies.getMoviesCategories.useQuery({
      playlistId: selectPlaylist?.id ?? 0,
    });

  useEffect(() => {
    if (categories && categories.length > 0 && !selectedCategoryId) {
      const timeoutId = setTimeout(() => {
        setSelectedCategoryId(categories[0].categoryId);
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [categories, selectedCategoryId]);

  const { data: movies, isLoading: loadingMovies } =
    trpc.movies.getMovies.useQuery(
      {
        playlistId: selectPlaylist?.id ?? 0,
        categoryId: selectedCategoryId ?? 0,
      },
      { enabled: !!selectedCategoryId },
    );

  const selectedCategory = categories?.find(
    (c) => c.categoryId === selectedCategoryId,
  );

  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const renderMovie = useCallback(
    ({ item, index }: { item: any; index: number }) => {
      return (
        <SafeAreaView
          style={[styles.container, { backgroundColor: theme.bg }]}
          edges={["bottom"]}
        >
          <Animated.View
            entering={FadeInDown.delay((index % 6) * 50).springify()}
            style={[styles.movieItemWrapper, { width: ITEM_WIDTH }]}
          >
            <Pressable
              onPressIn={() => (scale.value = withSpring(0.95))}
              onPressOut={() => (scale.value = withSpring(1))}
              onPress={() =>
                router.push({
                  pathname: "/movies/[id]",
                  params: { id: item.streamId, url: item.url },
                })
              }
            >
              <Animated.View style={animatedStyle}>
                <View
                  style={[
                    styles.posterContainer,
                    { backgroundColor: theme.surfaceSecondary },
                  ]}
                >
                  <Image
                    source={{ uri: item.streamIcon }}
                    style={[styles.poster, { borderColor: theme.border }]}
                  />

                  <View style={styles.posterOverlay}>
                    {item.rating && (
                      <View
                        style={[
                          styles.ratingBadge,
                          { backgroundColor: theme.primary },
                        ]}
                      >
                        <Star
                          size={10}
                          color={theme.primaryForeground}
                          fill={theme.primaryForeground}
                        />
                        <Text
                          style={[
                            styles.ratingText,
                            { color: theme.primaryForeground },
                          ]}
                        >
                          {parseFloat(item.rating).toFixed(1)}
                        </Text>
                      </View>
                    )}

                    {isRecent(item.added) && (
                      <View
                        style={[
                          styles.newBadge,
                          { backgroundColor: theme.accentSuccess },
                        ]}
                      >
                        <Text
                          style={[styles.newBadgeText, { color: theme.bg }]}
                        >
                          NEW
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
                <Text
                  style={[styles.movieTitle, { color: theme.textPrimary }]}
                  numberOfLines={2}
                >
                  {cleanName(item.name)}
                </Text>
              </Animated.View>
            </Pressable>
          </Animated.View>
        </SafeAreaView>
      );
    },
    [ITEM_WIDTH, animatedStyle, router, scale, theme],
  );

  if (loadingCats)
    return (
      <View style={[styles.container, { backgroundColor: theme.bg }]}>
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </View>
    );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.bg }]}
      edges={["top"]}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <View style={styles.headerLeft}>
          <Film size={24} color={theme.primary} />
          <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
            Movies
          </Text>
        </View>
        <Pressable
          onPress={() => setShowCategoryDrawer(true)}
          style={[
            styles.categoryButton,
            {
              backgroundColor: theme.surfaceSecondary,
              borderColor: theme.border,
            },
          ]}
        >
          <Text
            style={[styles.categoryButtonText, { color: theme.textPrimary }]}
            numberOfLines={1}
          >
            {selectedCategory?.categoryName || "All"}
          </Text>
        </Pressable>
      </View>

      {/* Movies Grid */}
      <View style={styles.gridArea}>
        {loadingMovies ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        ) : movies && movies.length > 0 ? (
          <FlashList
            data={movies}
            numColumns={COLUMN_COUNT}
            renderItem={renderMovie}
            contentContainerStyle={styles.gridContent}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item) => item.streamId.toString()}
          />
        ) : (
          <Animated.View entering={FadeIn} style={styles.emptyState}>
            <View
              style={[
                styles.emptyIconCircle,
                { backgroundColor: theme.surfaceSecondary },
              ]}
            >
              <Film size={40} color={theme.textMuted} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
              No movies found
            </Text>
            <Text style={[styles.emptySub, { color: theme.textMuted }]}>
              Try selecting a different category
            </Text>
          </Animated.View>
        )}
      </View>

      {/* Category Drawer Modal */}
      <Modal
        visible={showCategoryDrawer}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCategoryDrawer(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setShowCategoryDrawer(false)}
          />
          <Animated.View
            entering={FadeInDown.springify()}
            style={[
              styles.drawerContent,
              { backgroundColor: theme.surfacePrimary },
            ]}
          >
            <View
              style={[styles.drawerHandle, { backgroundColor: theme.border }]}
            />

            <View style={styles.drawerHeader}>
              <Text style={[styles.drawerTitle, { color: theme.textPrimary }]}>
                Categories
              </Text>
              <Text style={[styles.drawerSubtitle, { color: theme.textMuted }]}>
                {categories?.length || 0} categories
              </Text>
            </View>

            <View style={styles.categoryListContainer}>
              <FlashList
                data={categories}
                renderItem={({ item: category }) => (
                  <Pressable
                    onPress={() => {
                      setSelectedCategoryId(category.categoryId);
                      setShowCategoryDrawer(false);
                    }}
                    style={[
                      styles.categoryItem,
                      {
                        backgroundColor:
                          selectedCategoryId === category.categoryId
                            ? theme.primary
                            : theme.surfaceSecondary,
                        borderColor:
                          selectedCategoryId === category.categoryId
                            ? theme.primary
                            : theme.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryItemText,
                        {
                          color:
                            selectedCategoryId === category.categoryId
                              ? theme.primaryForeground
                              : theme.textPrimary,
                          fontWeight:
                            selectedCategoryId === category.categoryId
                              ? "700"
                              : "500",
                        },
                      ]}
                    >
                      {category.categoryName}
                    </Text>
                  </Pressable>
                )}
                keyExtractor={(item) => item.categoryId.toString()}
              />
            </View>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const isRecent = (dateAdded: string) => {
  if (!dateAdded) return false;
  const added = new Date(dateAdded);
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  return added > weekAgo;
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerBox: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    paddingBottom: 10,
    paddingHorizontal: 10,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  categoryButton: {
    flex: 1,
    maxWidth: 180,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginLeft: 16,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },

  gridArea: { flex: 1 },
  gridContent: {
    padding: SPACING,
    paddingBottom: 40,
  },
  movieItemWrapper: {
    marginBottom: 16,
  },
  posterContainer: {
    width: "100%",
    aspectRatio: 2 / 3,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
  },
  poster: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
  },
  posterOverlay: {
    position: "absolute",
    top: 8,
    right: 8,
    flexDirection: "row",
    gap: 6,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: "800",
  },
  newBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  newBadgeText: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  movieTitle: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 8,
    paddingHorizontal: 2,
  },

  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    paddingBottom: 60,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyTitle: { fontSize: 18, fontWeight: "700" },
  emptySub: { fontSize: 14 },

  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  drawerContent: {
    height: "60%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 34,
  },
  categoryListContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  drawerHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 8,
  },
  drawerHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  drawerTitle: {
    fontSize: 20,
    fontWeight: "800",
  },
  drawerSubtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  categoryList: {
    padding: 16,
  },
  categoryItem: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
  },
  categoryItemText: {
    fontSize: 15,
  },
});
