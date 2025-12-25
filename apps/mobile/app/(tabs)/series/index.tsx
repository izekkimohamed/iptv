import { trpc } from "@/lib/trpc";
import { usePlaylistStore } from "@/store/appStore";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Play, Tv } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const SIDEBAR_WIDTH = 110;
const COLUMN_COUNT = 3;
const ITEM_WIDTH = (width - SIDEBAR_WIDTH - 30) / COLUMN_COUNT;

export default function SeriesScreen() {
  const router = useRouter();
  const selectPlaylist = usePlaylistStore((state) => state.selectedPlaylist);

  const [selectedCatId, setSelectedCatId] = useState<number | null>(null);

  const { data: categories } = trpc.series.getSeriesCategories.useQuery({
    playlistId: selectPlaylist?.id ?? 0,
  });
  const { data: series, isLoading } = trpc.series.getseries.useQuery(
    { playlistId: selectPlaylist?.id ?? 0, categoryId: selectedCatId ?? 0 },
    { enabled: !!selectedCatId }
  );

  useEffect(() => {
    if (categories?.length && !selectedCatId)
      setSelectedCatId(categories[0].categoryId);
  }, [categories]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Categories Horizontal Scroll */}
      <View style={styles.categoriesContainer}>
        <FlatList
          horizontal
          data={categories}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <Pressable
              style={[
                styles.catChip,
                selectedCatId === item.categoryId && styles.catChipActive,
              ]}
              onPress={() => setSelectedCatId(item.categoryId)}
            >
              <Text
                style={[
                  styles.catChipText,
                  selectedCatId === item.categoryId && styles.catChipTextActive,
                ]}
                numberOfLines={1}
              >
                {item.categoryName}
              </Text>
            </Pressable>
          )}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContent}
        />
      </View>

      {/* Series Grid */}
      <View style={styles.mainContent}>
        {isLoading ?
          <ActivityIndicator
            style={styles.centered}
            size='large'
            color='#2563eb'
          />
        : series && series.length > 0 ?
          <FlatList
            data={series}
            numColumns={3}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.gridContent}
            columnWrapperStyle={styles.gridRow}
            renderItem={({ item }) => (
              <Pressable
                style={styles.seriesCard}
                onPress={() =>
                  router.push({
                    pathname: "/series/[id]",
                    params: { id: item.seriesId },
                  })
                }
              >
                <View style={styles.posterWrapper}>
                  <Image
                    source={{ uri: item.cover || "" }}
                    style={styles.poster}
                    contentFit='cover'
                  />
                  <View style={styles.playOverlay}>
                    <View style={styles.playButton}>
                      <Play color='white' size={24} fill='white' />
                    </View>
                  </View>
                </View>
                <Text style={styles.seriesTitle} numberOfLines={2}>
                  {item.name}
                </Text>
              </Pressable>
            )}
            scrollIndicatorInsets={{ right: 1 }}
          />
        : <View style={styles.emptyState}>
            <Tv size={48} color='#4b5563' />
            <Text style={styles.emptyText}>No series found</Text>
          </View>
        }
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Common
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0a0a0a",
  },
  errorText: {
    color: "#6b7280",
    fontSize: 16,
    marginTop: 12,
  },

  // Series List Screen
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#111",
  },
  headerTitle: {
    color: "white",
    fontSize: 32,
    fontWeight: "800",
    marginBottom: 4,
  },
  headerSubtitle: {
    color: "#9CA3AF",
    fontSize: 14,
    fontWeight: "500",
  },
  categoriesContainer: {
    backgroundColor: "#111",
    borderBottomWidth: 1,
    borderBottomColor: "#1a1a1a",
  },
  categoriesContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#333",
  },
  catChipActive: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  catChipText: {
    color: "#9CA3AF",
    fontSize: 13,
    fontWeight: "600",
  },
  catChipTextActive: {
    color: "#fff",
  },
  mainContent: {
    flex: 1,
    padding: 12,
  },
  gridContent: {
    paddingBottom: 20,
  },
  gridRow: {
    justifyContent: "space-between",
    marginBottom: 8,
  },
  seriesCard: {
    width: "31.5%",
    marginBottom: 16,
  },
  posterWrapper: {
    position: "relative",
    overflow: "hidden",
  },
  poster: {
    width: "100%",
    aspectRatio: 2 / 3,
    borderRadius: 12,
    backgroundColor: "#222",
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0)",
    justifyContent: "center",
    alignItems: "center",
    opacity: 0,
  },
  playButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(37, 99, 235, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  seriesTitle: {
    color: "#e5e5e5",
    fontSize: 13,
    marginTop: 8,
    fontWeight: "600",
    lineHeight: 18,
    textAlign: "center",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  emptyText: {
    color: "#6b7280",
    fontSize: 16,
    fontWeight: "500",
  },
});
