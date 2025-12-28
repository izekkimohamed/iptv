import { trpc } from "@/lib/trpc";
import { cleanName } from "@/lib/utils";
import { usePlaylistStore } from "@/store/appStore";
import { usePlayerTheme } from "@/theme/playerTheme";
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Tv } from "lucide-react-native";
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
const ITEM_WIDTH = (width - SPACING * (COLUMN_COUNT + 1)) / COLUMN_COUNT;

export default function SeriesScreen() {
  const router = useRouter();
  const theme = usePlayerTheme();
  const selectPlaylist = usePlaylistStore((state) => state.selectedPlaylist);

  const [selectedCatId, setSelectedCatId] = useState<number | null>(null);

  // 1. Fetch Categories
  const { data: categories, isLoading: loadingCats } =
    trpc.series.getSeriesCategories.useQuery({
      playlistId: selectPlaylist?.id ?? 0,
    });

  // 2. Fetch Series
  const { data: series, isLoading: loadingSeries } =
    trpc.series.getseries.useQuery(
      { playlistId: selectPlaylist?.id ?? 0, categoryId: selectedCatId ?? 0 },
      { enabled: !!selectedCatId }
    );

  useEffect(() => {
    if (categories?.length && !selectedCatId)
      setSelectedCatId(categories[0].categoryId);
  }, [categories, selectedCatId]);

  const renderSeriesItem = ({ item, index }: { item: any; index: number }) => (
    <Animated.View
      entering={FadeInDown.delay((index % 9) * 50).springify()}
      style={styles.gridItemWrapper}
    >
      <Pressable
        style={({ pressed }) => [
          styles.seriesCard,
          pressed && { opacity: 0.7, transform: [{ scale: 0.96 }] },
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
            contentFit='cover'
            transition={500}
            placeholder='L6PZfSi_.AyE_3t7t7R**0o#DgR4'
            placeholderContentFit='cover'
          />
          {/* Subtle gradient for depth */}
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.4)"]}
            style={styles.posterGradient}
          />
        </View>
        <Text
          style={[styles.seriesTitle, { color: theme.textSecondary }]}
          numberOfLines={1}
        >
          {cleanName(item.name)}
        </Text>
      </Pressable>
    </Animated.View>
  );

  if (loadingCats) {
    return (
      <View style={[styles.container, { backgroundColor: theme.bg }]}>
        <View style={styles.centerBox}>
          <ActivityIndicator size='large' color={theme.primary} />
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.bg }]}
      edges={["bottom"]}
    >
      {/* Categories Horizontal Scroll */}
      <View style={styles.categoriesContainer}>
        <FlashList
          horizontal
          data={categories}
          keyExtractor={(item) => item.id.toString()}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContent}
          renderItem={({ item }) => {
            const isSelected = selectedCatId === item.categoryId;
            return (
              <Pressable
                style={[
                  styles.catChip,
                  {
                    backgroundColor:
                      isSelected ? theme.primary : theme.surfaceSecondary,
                    borderColor: isSelected ? theme.primary : theme.border,
                  },
                ]}
                onPress={() => setSelectedCatId(item.categoryId)}
              >
                <Text
                  style={[
                    styles.catChipText,
                    {
                      color: isSelected ? "#000" : theme.textSecondary,
                      fontWeight: isSelected ? "700" : "500",
                    },
                  ]}
                  numberOfLines={1}
                >
                  {item.categoryName}
                </Text>
              </Pressable>
            );
          }}
        />
      </View>

      {/* Series Grid */}
      <View style={styles.mainContent}>
        {loadingSeries ?
          <View style={styles.centerBox}>
            <ActivityIndicator size='large' color={theme.primary} />
          </View>
        : series && series.length > 0 ?
          <FlashList
            data={series}
            numColumns={COLUMN_COUNT}
            keyExtractor={(item) => item.seriesId.toString()}
            contentContainerStyle={styles.gridContent}
            renderItem={renderSeriesItem}
            showsVerticalScrollIndicator={false}
          />
        : <Animated.View entering={FadeIn} style={styles.emptyState}>
            <View
              style={[
                styles.emptyIconCircle,
                { backgroundColor: `${theme.primary}15` },
              ]}
            >
              <Tv size={48} color={theme.primary} />
            </View>
            <Text style={[styles.emptyText, { color: theme.textPrimary }]}>
              No series found
            </Text>
            <Text style={[styles.emptySub, { color: theme.textMuted }]}>
              Try selecting a different category
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
    fontSize: 28,
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
    paddingVertical: 4,
  },
  catChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  catChipText: {
    fontSize: 13,
    letterSpacing: 0.2,
  },

  // Grid
  mainContent: {
    flex: 1,
  },
  gridContent: {
    padding: SPACING,
    paddingBottom: 40,
  },
  gridItemWrapper: {
    width: ITEM_WIDTH,
    marginRight: SPACING,
    marginBottom: 20,
  },
  seriesCard: {
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
  seriesTitle: {
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
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "700",
  },
  emptySub: {
    fontSize: 14,
  },
});
