import { ChannelRow } from "@/components/ChannelRow";
import { trpc } from "@/lib/trpc";
import { usePlaylistStore } from "@/store";
import { usePlayerTheme } from "@/theme/playerTheme";
import { FlashList, FlashListRef } from "@shopify/flash-list";
import {
  ArrowDownAZ,
  ArrowUpAZ,
  Clock,
  Heart,
  Search,
  SlidersHorizontal,
  Tv,
  X,
} from "lucide-react-native";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ChannelsScreen() {
  const theme = usePlayerTheme();
  const selectPlaylist = usePlaylistStore((state) => state.selectedPlaylist);
  const categoryListRef = useRef<FlashListRef<any>>(null);

  const [selectedCatId, setSelectedCatId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCategoryDrawer, setShowCategoryDrawer] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [sortBy, setSortBy] = useState<
    "default" | "az" | "za" | "favorites" | "recent"
  >("default");

  type SortOption = {
    id: "default" | "az" | "za" | "favorites" | "recent";
    label: string;
    icon: React.ReactNode;
  };

  const sortOptions: SortOption[] = [
    {
      id: "default",
      label: "Default",
      icon: <Tv size={18} color={theme.textMuted} />,
    },
    {
      id: "az",
      label: "A-Z",
      icon: <ArrowDownAZ size={18} color={theme.textMuted} />,
    },
    {
      id: "za",
      label: "Z-A",
      icon: <ArrowUpAZ size={18} color={theme.textMuted} />,
    },
    {
      id: "favorites",
      label: "Favorites",
      icon: <Heart size={18} color={theme.textMuted} />,
    },
    {
      id: "recent",
      label: "Recently Watched",
      icon: <Clock size={18} color={theme.textMuted} />,
    },
  ];

  const { data: categories, isLoading: loadingCats } =
    trpc.channels.getCategories.useQuery({
      playlistId: selectPlaylist?.id ?? 0,
    });

  const { data: channels, isLoading: loadingChannels } =
    trpc.channels.getChannels.useQuery(
      {
        playlistId: selectPlaylist?.id ?? 0,
        categoryId: selectedCatId ?? 0,
      },
      { enabled: !!selectedCatId && !!selectPlaylist },
    );

  useEffect(() => {
    if (categories?.length && !selectedCatId) {
      const timeoutId = setTimeout(() => {
        setSelectedCatId(categories[0].categoryId);
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [categories, selectedCatId]);

  const filteredCategories = useMemo(() => {
    if (!categories) return [];
    return categories.filter((cat) =>
      cat.categoryName.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [categories, searchQuery]);

  const selectedCategory = categories?.find(
    (c) => c.categoryId === selectedCatId,
  );

  const sortedChannels = useMemo(() => {
    if (!channels) return [];
    let sorted = [...channels];

    switch (sortBy) {
      case "az":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "za":
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "favorites":
        sorted.sort((a, b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0));
        break;
    }
    return sorted;
  }, [channels, sortBy]);

  const renderChannelItem = useCallback(
    ({ item, index }: { item: any; index: number }) => (
      <Animated.View entering={FadeInDown.delay(Math.min(index * 10, 200))}>
        <ChannelRow channel={item} />
      </Animated.View>
    ),
    [],
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.bg }]}
      edges={["top", "bottom"]}
    >
      {/* Search & Filter Header */}
      <View style={[styles.headerStack, { backgroundColor: theme.bg }]}>
        <View
          style={[
            styles.searchWrapper,
            {
              backgroundColor: theme.surfaceSecondary,
              borderColor: theme.border,
            },
          ]}
        >
          <Search size={18} color={theme.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: theme.textPrimary }]}
            placeholder="Search channels..."
            placeholderTextColor={theme.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")}>
              <X size={16} color={theme.textSecondary} />
            </Pressable>
          )}
        </View>
        <Pressable
          onPress={() => setShowSortModal(true)}
          style={[
            styles.filterButton,
            {
              backgroundColor: theme.surfaceSecondary,
              borderColor: theme.border,
            },
          ]}
        >
          <SlidersHorizontal size={18} color={theme.textPrimary} />
        </Pressable>
        <Pressable
          onPress={() => setShowCategoryDrawer(true)}
          style={[
            styles.filterButton,
            {
              backgroundColor: theme.surfaceSecondary,
              borderColor: theme.border,
            },
          ]}
        >
          <Tv size={18} color={theme.textPrimary} />
        </Pressable>
      </View>

      {/* Selected Category Chip */}
      <View
        style={[
          styles.selectedCategoryBar,
          { borderBottomColor: theme.border },
        ]}
      >
        <View style={[styles.categoryChip, { backgroundColor: theme.primary }]}>
          <Text
            style={[
              styles.categoryChipText,
              { color: theme.primaryForeground },
            ]}
          >
            {selectedCategory?.categoryName || "All Channels"}
          </Text>
        </View>
        <Text style={[styles.channelCount, { color: theme.textMuted }]}>
          {sortedChannels.length || 0} channels
        </Text>
      </View>

      <SafeAreaView style={styles.listContainer} edges={["bottom"]}>
        {loadingChannels ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[styles.loadingText, { color: theme.textMuted }]}>
              Loading Streams...
            </Text>
          </View>
        ) : (
          <FlashList
            data={sortedChannels}
            renderItem={renderChannelItem}
            keyExtractor={(item) => item.streamId.toString()}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <Animated.View entering={FadeIn} style={styles.emptyContainer}>
                <Tv size={64} color={theme.textMuted} />
                <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
                  No Channels Found
                </Text>
                <Text style={[styles.emptySub, { color: theme.textMuted }]}>
                  Try adjusting your search or category
                </Text>
              </Animated.View>
            }
          />
        )}
      </SafeAreaView>

      {/* Sort Modal */}
      <Modal
        visible={showSortModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSortModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setShowSortModal(false)}
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
                Sort Channels
              </Text>
            </View>

            <View style={styles.sortOptionsContainer}>
              {sortOptions.map((option) => (
                <Pressable
                  key={option.id}
                  onPress={() => {
                    setSortBy(option.id);
                    setShowSortModal(false);
                  }}
                  style={[
                    styles.sortOption,
                    {
                      backgroundColor:
                        sortBy === option.id
                          ? theme.primary
                          : theme.surfaceSecondary,
                      borderColor:
                        sortBy === option.id ? theme.primary : theme.border,
                    },
                  ]}
                >
                  {option.icon}
                  <Text
                    style={[
                      styles.sortOptionText,
                      {
                        color:
                          sortBy === option.id
                            ? theme.primaryForeground
                            : theme.textPrimary,
                      },
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Animated.View>
        </View>
      </Modal>

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

            {/* Search in drawer */}
            <View
              style={[
                styles.drawerSearch,
                { backgroundColor: theme.surfaceSecondary },
              ]}
            >
              <Search size={16} color={theme.textMuted} />
              <TextInput
                style={[styles.drawerSearchInput, { color: theme.textPrimary }]}
                placeholder="Search categories..."
                placeholderTextColor={theme.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <View style={styles.categoryListContainer}>
              <FlashList
                data={filteredCategories}
                renderItem={({ item: category }) => (
                  <View>
                    <Pressable
                      onPress={() => {
                        setSelectedCatId(category.categoryId);
                        setShowCategoryDrawer(false);
                        setSearchQuery("");
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
  searchSection: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    borderRadius: 24,
    paddingHorizontal: 16,
    borderWidth: 1,
    gap: 12,
  },

  simpleHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
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

  headerStack: {
    flexDirection: "row",
    padding: 12,
    gap: 12,
    alignItems: "center",
  },
  searchWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    borderRadius: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    gap: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: { elevation: 2 },
    }),
  },
  searchInput: { flex: 1, fontSize: 15, fontWeight: "500" },
  listContainer: { flex: 1, paddingBottom: 20 },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },

  selectedCategoryBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: "700",
  },
  channelCount: {
    fontSize: 12,
    fontWeight: "600",
  },

  listContent: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 100,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 16,
  },
  emptySub: {
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  drawerContent: {
    height: "65%",
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
  drawerSearch: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginVertical: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 10,
  },
  drawerSearchInput: {
    flex: 1,
    fontSize: 14,
  },
  categoryList: {
    padding: 16,
    paddingTop: 4,
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
  sortOptionsContainer: {
    padding: 20,
    gap: 12,
  },
  sortOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  sortOptionText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
