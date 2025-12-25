import { ChannelRow } from "@/components/ChannelRow";
import { trpc } from "@/lib/trpc";
import { usePlaylistStore } from "@/store/appStore";
import { useRouter } from "expo-router";
import { Search, Tv, X } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ChannelsScreen() {
  const router = useRouter();
  const selectPlaylist = usePlaylistStore((state) => state.selectedPlaylist);

  const [selectedCatId, setSelectedCatId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // 1. Fetch Channel Categories
  const { data: categories, isLoading: loadingCats } =
    trpc.channels.getCategories.useQuery({
      playlistId: selectPlaylist?.id ?? 0,
    });

  // 2. Fetch Channels for selected category
  const { data: channels, isLoading: loadingChannels } =
    trpc.channels.getChannels.useQuery(
      {
        playlistId: selectPlaylist?.id ?? 0,
        categoryId: selectedCatId ?? 0,
      },
      {
        enabled: !!selectedCatId,
      }
    );

  useEffect(() => {
    if (categories?.length && !selectedCatId) {
      setSelectedCatId(categories[0].categoryId);
    }
  }, [categories, selectedCatId]);

  // Filter categories based on search query
  const filteredCategories = useMemo(() => {
    if (!categories) return [];
    return categories.filter((cat) =>
      cat.categoryName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [categories, searchQuery]);

  useEffect(() => {
    if (categories?.length && !selectedCatId) {
      setSelectedCatId(categories[0].categoryId);
    }
  }, [categories, selectedCatId]);

  const renderChannelItem = ({ item, index }: { item: any; index: number }) => (
    <ChannelRow
      channel={item}
      playlist={{
        url: selectPlaylist?.baseUrl ?? "",
        username: selectPlaylist?.username ?? "",
        password: selectPlaylist?.password ?? "",
      }}
    />
  );

  if (loadingCats) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size='large' color='#2563eb' style={styles.center} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.mainList}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search size={14} color='#6b7280' />
          <TextInput
            style={styles.searchInput}
            placeholder='Search categories...'
            placeholderTextColor='#6b7280'
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")}>
              <X size={14} color='#6b7280' />
            </Pressable>
          )}
        </View>

        {/* Categories Horizontal Scroll */}
        <View style={styles.categoriesContainer}>
          <FlatList
            horizontal
            data={filteredCategories}
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
                    selectedCatId === item.categoryId &&
                      styles.catChipTextActive,
                  ]}
                  numberOfLines={1}
                >
                  {item.categoryName}
                </Text>
              </Pressable>
            )}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContent}
            ListEmptyComponent={
              <Text style={styles.noCategoriesText}>No categories found</Text>
            }
          />
        </View>

        {/* Channels List */}
        {loadingChannels ?
          <View style={styles.center}>
            <ActivityIndicator size='large' color='#2563eb' />
          </View>
        : channels && channels.length > 0 ?
          <FlatList
            data={channels}
            renderItem={renderChannelItem}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            scrollIndicatorInsets={{ right: 1 }}
          />
        : <View style={styles.emptyState}>
            <Tv size={48} color='#4b5563' />
            <Text style={styles.emptyText}>No channels available</Text>
          </View>
        }
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0a" },
  mainList: { flex: 1 },
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: "#111",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#222",
    gap: 10,
  },
  searchInput: {
    flex: 1,
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },
  noCategoriesText: {
    color: "#6b7280",
    fontSize: 13,
    fontWeight: "500",
  },
  listContent: { paddingBottom: 20 },
  channelRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#111",
  },
  channelRowPressed: {
    backgroundColor: "rgba(37, 99, 235, 0.1)",
  },
  channelNumber: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#1a1a1a",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  numberText: {
    color: "#60a5fa",
    fontSize: 12,
    fontWeight: "700",
  },
  logoContainer: {
    width: 56,
    height: 56,
    backgroundColor: "#111",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#222",
  },
  channelLogo: { width: "85%", height: "85%" },
  channelInfo: { flex: 1, marginLeft: 14, justifyContent: "center" },
  channelName: {
    color: "white",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 6,
  },
  epgContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  epgText: {
    color: "#60a5fa",
    fontSize: 12,
    fontWeight: "500",
  },
  progressTrack: {
    height: 4,
    backgroundColor: "#222",
    borderRadius: 2,
    width: "90%",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#2563eb",
    borderRadius: 2,
  },
  liveIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginRight: 8,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ef4444",
  },
  liveText: {
    color: "#ef4444",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
