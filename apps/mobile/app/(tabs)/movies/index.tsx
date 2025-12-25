import { trpc } from "@/lib/trpc";
import { cleanName } from "@/lib/utils";
import { usePlaylistStore } from "@/store/appStore";
import { useRouter } from "expo-router";
import { ChevronRight, Play } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MovieExplorer() {
  const router = useRouter();
  const selectPlaylist = usePlaylistStore((state) => state.selectedPlaylist);

  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  );

  // 1. Fetch Categories
  const { data: categories, isLoading: loadingCats } =
    trpc.movies.getMoviesCategories.useQuery({
      playlistId: selectPlaylist?.id ?? 0,
    });

  // Set default category once loaded
  useEffect(() => {
    if (categories && categories.length > 0 && !selectedCategoryId) {
      setSelectedCategoryId(categories[0].categoryId);
    }
  }, [categories, selectedCategoryId]);

  // 2. Fetch Movies for Selected Category
  const { data: movies, isLoading: loadingMovies } =
    trpc.movies.getMovies.useQuery(
      {
        playlistId: selectPlaylist?.id ?? 0,
        categoryId: selectedCategoryId ?? 0,
      },
      { enabled: !!selectedCategoryId }
    );

  const renderMovie = ({ item }: { item: any }) => (
    <Pressable
      style={styles.movieCard}
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
      <View style={styles.posterWrapper}>
        <Image
          source={{
            uri: item.streamIcon || "https://via.placeholder.com/150x225",
          }}
          style={styles.poster}
          resizeMode='cover'
        />
        <View style={styles.playOverlay}>
          <View style={styles.playButton}>
            <Play color='white' size={24} fill='white' />
          </View>
        </View>
      </View>
      <Text style={styles.movieTitle} numberOfLines={2}>
        {cleanName(item.name)}
      </Text>
    </Pressable>
  );

  if (loadingCats)
    return (
      <View style={styles.container}>
        <ActivityIndicator
          style={styles.centered}
          color='#2563eb'
          size='large'
        />
      </View>
    );

  return (
    <SafeAreaView style={styles.container}>
      {/* Categories Scroll */}
      <View style={styles.categoriesContainer}>
        <FlatList
          horizontal
          data={categories}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <Pressable
              style={[
                styles.catChip,
                selectedCategoryId === item.categoryId && styles.catChipActive,
              ]}
              onPress={() => setSelectedCategoryId(item.categoryId)}
            >
              <Text
                style={[
                  styles.catChipText,
                  selectedCategoryId === item.categoryId &&
                    styles.catChipTextActive,
                ]}
              >
                {item.categoryName}
              </Text>
              {selectedCategoryId === item.categoryId && (
                <ChevronRight color='white' size={16} />
              )}
            </Pressable>
          )}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContent}
        />
      </View>

      {/* Movies Grid */}
      <View style={styles.mainContent}>
        {loadingMovies ?
          <ActivityIndicator
            style={styles.centered}
            color='#2563eb'
            size='large'
          />
        : movies && movies.length > 0 ?
          <FlatList
            data={movies}
            renderItem={renderMovie}
            keyExtractor={(item) => item.id.toString()}
            numColumns={3}
            columnWrapperStyle={styles.gridRow}
            contentContainerStyle={styles.gridContainer}
            scrollIndicatorInsets={{ right: 1 }}
          />
        : <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No movies found</Text>
          </View>
        }
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0a" },
  header: { paddingHorizontal: 20, paddingVertical: 16 },
  headerTitle: { color: "#fff", fontSize: 32, fontWeight: "800" },
  categoriesContainer: { backgroundColor: "#111" },
  categoriesContent: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#333",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  catChipActive: { backgroundColor: "#2563eb", borderColor: "#2563eb" },
  catChipText: { color: "#999", fontSize: 13, fontWeight: "600" },
  catChipTextActive: { color: "#fff" },
  mainContent: { flex: 1, padding: 12 },
  gridContainer: { paddingBottom: 20 },
  gridRow: { justifyContent: "space-between", marginBottom: 8 },
  movieCard: { width: "31.5%", marginBottom: 16 },
  posterWrapper: { position: "relative", overflow: "hidden" },
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
  movieTitle: {
    color: "#e5e5e5",
    fontSize: 13,
    marginTop: 8,
    fontWeight: "600",
    lineHeight: 18,
    textAlign: "center",
  },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyState: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { color: "#666", fontSize: 16 },
});
