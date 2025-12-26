import { ChannelRow } from "@/components/ChannelRow";
import { trpc } from "@/lib/trpc";
import { usePlaylistStore } from "@/store/appStore";
import { usePlayerTheme } from "@/theme/playerTheme";
import { FlashList } from "@shopify/flash-list";
import { Search, Tv, X } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

// --- Skeleton Component for Loading State ---
const ChannelSkeleton = () => {
  const theme = usePlayerTheme();

  return (
    <View style={[styles.skeletonRow, { borderBottomColor: theme.border }]}>
      <View
        style={[
          styles.skeletonLogo,
          { backgroundColor: theme.surfaceSecondary },
        ]}
      />
      <View style={{ flex: 1, gap: 10 }}>
        <View
          style={[
            styles.skeletonText,
            { width: "60%", backgroundColor: theme.surfaceSecondary },
          ]}
        />
        <View
          style={[
            styles.skeletonText,
            {
              width: "40%",
              height: 10,
              backgroundColor: theme.surfaceSecondary,
            },
          ]}
        />
      </View>
    </View>
  );
};

export default function ChannelsScreen() {
  const theme = usePlayerTheme();
  const selectPlaylist = usePlaylistStore((state) => state.selectedPlaylist);

  const [selectedCatId, setSelectedCatId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // 1. Fetch Categories
  const { data: categories, isLoading: loadingCats } =
    trpc.channels.getCategories.useQuery({
      playlistId: selectPlaylist?.id ?? 0,
    });

  // 2. Fetch Channels
  const { data: channels, isLoading: loadingChannels } =
    trpc.channels.getChannels.useQuery(
      {
        playlistId: selectPlaylist?.id ?? 0,
        categoryId: selectedCatId ?? 0,
      },
      { enabled: !!selectedCatId }
    );

  useEffect(() => {
    if (categories?.length && !selectedCatId) {
      setSelectedCatId(categories[0].categoryId);
    }
  }, [categories, selectedCatId]);

  const filteredCategories = useMemo(() => {
    if (!categories) return [];
    return categories.filter((cat) =>
      cat.categoryName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [categories, searchQuery]);

  const renderChannelItem = ({ item, index }: { item: any; index: number }) => (
    <Animated.View entering={FadeInDown.delay((index % 15) * 30)}>
      <ChannelRow
        channel={item}
        playlist={{
          url: selectPlaylist?.baseUrl ?? "",
          username: selectPlaylist?.username ?? "",
          password: selectPlaylist?.password ?? "",
        }}
      />
    </Animated.View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.bg }]}
      edges={["top"]}
    >
      {/* --- Search Header --- */}
      <View
        style={[styles.headerContainer, { borderBottomColor: theme.border }]}
      >
        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: theme.surfaceSecondary,
              borderColor: theme.border,
            },
          ]}
        >
          <Search size={18} color={theme.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: theme.textPrimary }]}
            placeholder='Search categories...'
            placeholderTextColor={theme.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")} hitSlop={10}>
              <View
                style={[styles.clearBtn, { backgroundColor: theme.border }]}
              >
                <X size={12} color={theme.textSecondary} />
              </View>
            </Pressable>
          )}
        </View>
      </View>

      {/* --- Categories (Pills) --- */}
      <View style={styles.categoriesWrapper}>
        {loadingCats ?
          <ActivityIndicator
            size='small'
            color={theme.primary}
            style={{ margin: 20 }}
          />
        : <FlashList
            horizontal
            data={filteredCategories}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContent}
            keyExtractor={(item) => item.categoryId.toString()}
            renderItem={({ item }) => {
              const isActive = selectedCatId === item.categoryId;
              return (
                <Pressable
                  style={[
                    styles.categoryPill,
                    {
                      backgroundColor:
                        isActive ? theme.primary : theme.surfaceSecondary,
                      borderColor: isActive ? theme.primary : theme.border,
                    },
                  ]}
                  onPress={() => setSelectedCatId(item.categoryId)}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      {
                        color: isActive ? "#000" : theme.textSecondary,
                        fontWeight: isActive ? "700" : "500",
                      },
                    ]}
                  >
                    {item.categoryName}
                  </Text>
                </Pressable>
              );
            }}
          />
        }
      </View>

      {/* --- Channel List --- */}
      <View style={styles.listContainer}>
        {loadingChannels ?
          // Render Skeletons while loading
          <View style={{ padding: 16 }}>
            {[...Array(8)].map((_, i) => (
              <ChannelSkeleton key={i} />
            ))}
          </View>
        : channels && channels.length > 0 ?
          <FlashList
            data={channels}
            renderItem={renderChannelItem}
            keyExtractor={(item) => item.streamId.toString()}
            contentContainerStyle={{
              paddingBottom: 40,
              paddingHorizontal: 10,
            }}
            showsVerticalScrollIndicator={false}
          />
        : <View style={styles.emptyState}>
            <View
              style={[
                styles.emptyIconCircle,
                { backgroundColor: `${theme.primary}15` },
              ]}
            >
              <Tv size={48} color={theme.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
              No channels found
            </Text>
            <Text style={[styles.emptySub, { color: theme.textMuted }]}>
              Try a different category
            </Text>
          </View>
        }
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Header
  headerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    height: 44,
    borderRadius: 12,
    paddingHorizontal: 12,
    gap: 10,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    height: "100%",
  },
  clearBtn: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  // Categories
  categoriesWrapper: {
    height: 56,
  },
  categoriesContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    justifyContent: "center",
  },
  categoryText: {
    fontSize: 13,
  },

  // List
  listContainer: {
    flex: 1,
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    marginTop: 40,
  },
  emptyIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyTitle: { fontSize: 18, fontWeight: "700" },
  emptySub: { fontSize: 14 },

  // Skeleton
  skeletonRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    gap: 16,
  },
  skeletonLogo: {
    width: 60,
    height: 40,
    borderRadius: 8,
  },
  skeletonText: {
    height: 14,
    borderRadius: 4,
  },
});
