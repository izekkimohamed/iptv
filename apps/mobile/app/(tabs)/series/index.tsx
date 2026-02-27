import { trpc } from "@/lib/trpc";
import { usePlaylistStore } from "@/store";
import { usePlayerTheme } from "@/theme/playerTheme";
import { cleanName } from "@repo/utils";
import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { Film, Tv } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const COLUMN_COUNT = 2;
const SPACING = 12;

export default function SeriesScreen() {
  const { width } = useWindowDimensions();
  const ITEM_WIDTH = (width - SPACING * (COLUMN_COUNT + 1)) / COLUMN_COUNT;
  const router = useRouter();
  const theme = usePlayerTheme();
  const selectPlaylist = usePlaylistStore((state) => state.selectedPlaylist);

  const [selectedCatId, setSelectedCatId] = useState<number | null>(null);
  const [showCategoryDrawer, setShowCategoryDrawer] = useState(false);

  const { data: categories, isLoading: loadingCats } =
    trpc.series.getSeriesCategories.useQuery({
      playlistId: selectPlaylist?.id ?? 0,
    });

  const { data: series, isLoading: loadingSeries } =
    trpc.series.getseries.useQuery(
      { playlistId: selectPlaylist?.id ?? 0, categoryId: selectedCatId ?? 0 },
      { enabled: !!selectedCatId },
    );

  useEffect(() => {
    if (categories?.length && !selectedCatId) {
      const timeoutId = setTimeout(() => {
        setSelectedCatId(categories[0].categoryId);
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [categories, selectedCatId]);

  const selectedCategory = categories?.find(
    (c) => c.categoryId === selectedCatId,
  );

  const renderSeriesItem = useCallback(
    ({ item, index }: { item: any; index: number }) => (
      <Animated.View
        entering={FadeInDown.delay((index % 6) * 50).springify()}
        style={[styles.gridItemWrapper, { width: ITEM_WIDTH }]}
      >
        <Pressable
          style={({ pressed }) => [
            styles.seriesCard,
            pressed && { opacity: 0.8, transform: [{ scale: 0.96 }] },
          ]}
          onPress={() =>
            router.push({
              pathname: "/series/[id]",
              params: { id: item.seriesId },
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
              source={{ uri: item.cover || "" }}
              style={[styles.poster, { borderColor: theme.border }]}
            />
            <View style={styles.posterOverlay}>
              <View
                style={[styles.seasonBadge, { backgroundColor: theme.primary }]}
              >
                <Tv size={10} color={theme.primaryForeground} />
                <Text
                  style={[
                    styles.seasonText,
                    { color: theme.primaryForeground },
                  ]}
                >
                  {item.seasonCount || ""}
                </Text>
              </View>
            </View>
          </View>
          <Text
            style={[styles.seriesTitle, { color: theme.textPrimary }]}
            numberOfLines={2}
          >
            {cleanName(item.name)}
          </Text>
        </Pressable>
      </Animated.View>
    ),
    [ITEM_WIDTH, router, theme],
  );

  if (loadingCats) {
    return (
      <View style={[styles.container, { backgroundColor: theme.bg }]}>
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.bg }]}
      edges={["top"]}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <View style={styles.headerLeft}>
          <Tv size={24} color={theme.primary} />
          <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
            Series
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

      {/* Series Grid */}
      <View style={styles.mainContent}>
        {loadingSeries ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        ) : series && series.length > 0 ? (
          <FlashList
            data={series}
            numColumns={COLUMN_COUNT}
            keyExtractor={(item) => item.seriesId.toString()}
            contentContainerStyle={styles.gridContent}
            renderItem={renderSeriesItem}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <Animated.View entering={FadeIn} style={styles.emptyState}>
            <View
              style={[
                styles.emptyIconCircle,
                { backgroundColor: theme.surfaceSecondary },
              ]}
            >
              <Film size={48} color={theme.textMuted} />
            </View>
            <Text style={[styles.emptyText, { color: theme.textPrimary }]}>
              No series found
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
                  <View>
                    <Pressable
                      onPress={() => {
                        setSelectedCatId(category.categoryId);
                        setShowCategoryDrawer(false);
                      }}
                      style={[
                        styles.categoryItem,
                        {
                          backgroundColor:
                            selectedCatId === category.categoryId
                              ? theme.primary
                              : theme.surfaceSecondary,
                          borderColor:
                            selectedCatId === category.categoryId
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
                              selectedCatId === category.categoryId
                                ? theme.primaryForeground
                                : theme.textPrimary,
                            fontWeight:
                              selectedCatId === category.categoryId
                                ? "700"
                                : "500",
                          },
                        ]}
                      >
                        {category.categoryName}
                      </Text>
                    </Pressable>
                  </View>
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

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerBox: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
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

  mainContent: { flex: 1 },
  gridContent: {
    padding: SPACING,
    paddingBottom: 40,
  },
  gridItemWrapper: {
    marginBottom: 16,
  },
  seriesCard: { width: "100%", gap: 8 },
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
    bottom: 8,
    right: 8,
  },
  seasonBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  seasonText: {
    fontSize: 10,
    fontWeight: "700",
  },
  seriesTitle: {
    fontSize: 13,
    fontWeight: "600",
    paddingHorizontal: 2,
  },

  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  emptyIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: { fontSize: 18, fontWeight: "700" },
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
